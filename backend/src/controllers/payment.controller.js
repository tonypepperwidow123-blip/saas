import crypto from 'crypto';
import { supabaseAdmin } from '../config/supabase.js';
import { success, error, paginated } from '../utils/apiResponse.js';
import { NotFoundError, ForbiddenError, ValidationError } from '../utils/errors.js';
import { createLicense } from '../services/license.service.js';
import { sendLicenseEmail } from '../services/email.service.js';
import { getSignedDownloadUrl } from '../services/storage.service.js';
import razorpay from '../config/razorpay.js';

export const createOrder = async (req, res) => {
  try {
    const { plugin_id } = req.body;

    if (!plugin_id) {
      throw new ValidationError('Plugin ID is required');
    }

    // Get plugin details
    const { data: plugin, error: pluginError } = await supabaseAdmin
      .from('plugins')
      .select('id, name, price, status')
      .eq('id', plugin_id)
      .single();

    if (pluginError || !plugin) {
      throw new NotFoundError('Plugin not found');
    }

    if (plugin.status !== 'approved') {
      throw new ForbiddenError('Plugin is not available for purchase');
    }

    // Check if customer already has a license for this plugin
    const { data: existingLicense } = await supabaseAdmin
      .from('licenses')
      .select('id')
      .eq('plugin_id', plugin_id)
      .eq('customer_id', req.user.id)
      .single();

    if (existingLicense) {
      return error(res, 'You already have a license for this plugin', 409);
    }

    // Free plugin - create license directly
    if (plugin.price === 0) {
      const license = await createLicense(plugin_id, req.user.id, 1, null);

      const { data: order, error: orderError } = await supabaseAdmin
        .from('orders')
        .insert({
          customer_id: req.user.id,
          plugin_id,
          amount: 0,
          currency: 'INR',
          payment_status: 'paid',
          license_id: license.id,
        })
        .select()
        .single();

      if (orderError) {
        throw new Error(`Failed to create order: ${orderError.message}`);
      }

      return success(res, {
        order_id: order.id,
        license_key: license.license_key,
        message: 'License created successfully',
      }, 201);
    }

    // Check if Razorpay is configured
    if (!razorpay) {
      return error(res, 'Payment gateway not configured', 503);
    }

    const amountInPaise = Math.round(parseFloat(plugin.price) * 100);

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `order_${Date.now()}_${req.user.id}`,
      notes: {
        plugin_id,
        customer_id: req.user.id,
      },
    });

    // Store order in database
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        customer_id: req.user.id,
        plugin_id,
        amount: plugin.price,
        currency: 'INR',
        payment_status: 'pending',
        razorpay_order_id: razorpayOrder.id,
      })
      .select()
      .single();

    if (orderError) {
      throw new Error(`Failed to create order: ${orderError.message}`);
    }

    return success(res, {
      order_id: order.id,
      razorpay_order_id: razorpayOrder.id,
      amount: razorpayOrder.amount / 100,
      currency: razorpayOrder.currency,
    }, 201);
  } catch (err) {
    if (err instanceof ValidationError || err instanceof NotFoundError || err instanceof ForbiddenError) {
      return error(res, err.message, err.statusCode);
    }
    console.error('Create order error:', err);
    return error(res, err.message || 'Failed to create order');
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new ValidationError('All payment details are required');
    }

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      throw new ForbiddenError('Invalid payment signature');
    }

    // Find the order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('razorpay_order_id', razorpay_order_id)
      .single();

    if (orderError || !order) {
      throw new NotFoundError('Order not found');
    }

    if (order.payment_status === 'paid') {
      return error(res, 'Payment already verified', 409);
    }

    // Create license
    const license = await createLicense(order.plugin_id, order.customer_id, 1, null);

    // Update order
    const { data: updatedOrder, error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        payment_status: 'paid',
        razorpay_payment_id,
        razorpay_signature,
        license_id: license.id,
      })
      .eq('id', order.id)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Failed to update order: ${updateError.message}`);
    }

    // Get signed download URL for the latest version
    let downloadUrl = null;
    const { data: latestVersion } = await supabaseAdmin
      .from('plugin_versions')
      .select('zip_path')
      .eq('plugin_id', order.plugin_id)
      .eq('is_latest', true)
      .single();

    if (latestVersion) {
      const { data: signedUrlData } = await supabaseAdmin.storage
        .from('plugins')
        .createSignedUrl(latestVersion.zip_path, 300);

      downloadUrl = signedUrlData?.signedUrl || null;
    }

    // Get customer and plugin info for email
    const { data: customer } = await supabaseAdmin
      .from('profiles')
      .select('name, email')
      .eq('id', order.customer_id)
      .single();

    const { data: plugin } = await supabaseAdmin
      .from('plugins')
      .select('name')
      .eq('id', order.plugin_id)
      .single();

    // Send email with activation code
    if (customer && plugin) {
      sendLicenseEmail({
        to: customer.email,
        customerName: customer.name,
        pluginName: plugin.name,
        licenseKey: license.license_key,
        activationCode: license.activation_code,
        downloadUrl: downloadUrl || `${process.env.CLIENT_URL || 'http://localhost:5173'}/customer/downloads`,
      }).catch(err => console.error('Failed to send license email:', err));
    }

    return success(res, {
      message: 'Payment verified successfully',
      order_id: order.id,
      license_key: license.license_key,
      activation_code: license.activation_code,
      plugin_id: order.plugin_id,
      download_url: downloadUrl,
    });
  } catch (err) {
    if (err instanceof ValidationError || err instanceof NotFoundError || err instanceof ForbiddenError) {
      return error(res, err.message, err.statusCode);
    }
    console.error('Verify payment error:', err);
    return error(res, err.message || 'Failed to verify payment');
  }
};

export const getOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    let query = supabaseAdmin
      .from('orders')
      .select(`
        id, amount, currency, payment_status, razorpay_order_id, created_at,
        plugin:plugins(id, name, slug, thumbnail_url),
        license:licenses(id, license_key, status)
      `, { count: 'exact' })
      .eq('customer_id', req.user.id)
      .order('created_at', { ascending: false });

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.range(from, to);

    const { data: orders, count, error: queryError } = await query;

    if (queryError) {
      throw new Error(`Failed to fetch orders: ${queryError.message}`);
    }

    return paginated(res, orders, {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (err) {
    console.error('Get orders error:', err);
    return error(res, 'Failed to fetch orders');
  }
};

export const downloadPlugin = async (req, res) => {
  try {
    const { plugin_id, license_key } = req.body;

    if (!plugin_id) {
      throw new ValidationError('Plugin ID is required');
    }

    // Verify the customer owns a license for this plugin
    const { data: license, error: licenseError } = await supabaseAdmin
      .from('licenses')
      .select('id, license_key, activation_code, activation_code_used')
      .eq('plugin_id', plugin_id)
      .eq('customer_id', req.user.id)
      .single();

    if (licenseError || !license) {
      throw new ForbiddenError('You do not have a license for this plugin');
    }

    // If specific license_key provided, verify it matches
    if (license_key && license.license_key !== license_key) {
      throw new ForbiddenError('License key mismatch');
    }

    // Get the latest version
    const { data: latestVersion, error: versionError } = await supabaseAdmin
      .from('plugin_versions')
      .select('zip_path, version')
      .eq('plugin_id', plugin_id)
      .eq('is_latest', true)
      .single();

    if (versionError || !latestVersion) {
      throw new NotFoundError('Plugin version not found');
    }

    // Generate signed download URL (valid for 5 minutes)
    const { data: signedUrlData } = await supabaseAdmin.storage
      .from('plugins')
      .createSignedUrl(latestVersion.zip_path, 300);

    if (!signedUrlData?.signedUrl) {
      throw new Error('Failed to generate download URL');
    }

    return success(res, {
      download_url: signedUrlData.signedUrl,
      version: latestVersion.version,
      license_key: license.license_key,
      activation_code: license.activation_code,
      activation_code_used: license.activation_code_used,
    });
  } catch (err) {
    if (err instanceof ValidationError || err instanceof NotFoundError || err instanceof ForbiddenError) {
      return error(res, err.message, err.statusCode);
    }
    console.error('Download plugin error:', err);
    return error(res, err.message || 'Failed to get download URL');
  }
};

export const createPlanUpgradeOrder = async (req, res) => {
  try {
    const { plan } = req.body;
    
    if (!['pro', 'business'].includes(plan)) {
      return error(res, 'Invalid plan selected', 400);
    }
    
    const amount = plan === 'pro' ? 1000 : 1500;
    const amountInPaise = amount * 100;
    
    if (!razorpay) {
      // If Razorpay is not configured, just instantly upgrade for testing
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ subscription_plan: plan })
        .eq('id', req.user.id);

      if (updateError) throw new Error(updateError.message);

      return success(res, {
        amount: amount,
        currency: 'INR',
        plan: plan,
        message: `Payment gateway bypassed. Plan upgraded to ${plan.toUpperCase()} automatically.`
      });
    }
    
    const receiptStr = `plan_${plan}_${Date.now()}`.substring(0, 40);
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: receiptStr,
      notes: {
        plan,
        developer_id: req.user.id,
      },
    });
    
    return success(res, {
      razorpay_order_id: razorpayOrder.id,
      amount: amount,
      currency: 'INR',
      plan: plan
    });
  } catch (err) {
    console.error('Create plan order error:', err);
    return error(res, 'Failed to create plan upgrade order');
  }
};

export const verifyPlanUpgrade = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !plan) {
      return error(res, 'All payment details are required', 400);
    }

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return error(res, 'Invalid payment signature', 403);
    }

    // Upgrade the user's plan
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ subscription_plan: plan })
      .eq('id', req.user.id);

    if (updateError) {
      throw new Error(`Failed to update profile plan: ${updateError.message}`);
    }

    return success(res, {
      message: `Successfully upgraded to ${plan.toUpperCase()} plan!`,
      plan
    });
  } catch (err) {
    console.error('Verify plan upgrade error:', err);
    return error(res, 'Failed to verify plan upgrade');
  }
};