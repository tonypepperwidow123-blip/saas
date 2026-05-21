import { supabaseAdmin } from '../config/supabase.js';
import { success, error, paginated } from '../utils/apiResponse.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';
import * as licenseService from '../services/license.service.js';

export const getLicenses = async (req, res) => {
  try {
    const { page = 1, limit = 20, status = '' } = req.query;

    let query = supabaseAdmin
      .from('licenses')
      .select(`
        id, license_key, status, activation_limit, expiry_date, created_at, updated_at,
        plugin:plugins(id, name, slug, price, thumbnail_url),
        customer:profiles!customer_id(id, name, email)
      `, { count: 'exact' });

    // Developers see licenses for their plugins, customers see their own
    if (req.user.role === 'developer') {
      const { data: pluginIds } = await supabaseAdmin
        .from('plugins')
        .select('id')
        .eq('developer_id', req.user.id);

      const ids = pluginIds?.map(p => p.id) || [];
      query = query.in('plugin_id', ids);
    } else if (req.user.role === 'customer') {
      query = query.eq('customer_id', req.user.id);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.order('created_at', { ascending: false }).range(from, to);

    const { data: licenses, count, error: queryError } = await query;

    if (queryError) {
      throw new Error(`Failed to fetch licenses: ${queryError.message}`);
    }

    return paginated(res, licenses, {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (err) {
    console.error('Get licenses error:', err);
    return error(res, 'Failed to fetch licenses');
  }
};

export const getLicenseById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: license, error: fetchError } = await supabaseAdmin
      .from('licenses')
      .select(`
        *,
        plugin:plugins(id, name, slug, current_version, thumbnail_url, developer_id),
        customer:profiles!customer_id(id, name, email)
      `)
      .eq('id', id)
      .single();

    if (fetchError || !license) {
      throw new NotFoundError('License not found');
    }

    // Check access
    if (req.user.role === 'customer' && license.customer_id !== req.user.id) {
      throw new ForbiddenError('Access denied');
    }

    if (req.user.role === 'developer' && license.plugin.developer_id !== req.user.id) {
      throw new ForbiddenError('Access denied');
    }

    // Get activations
    const { data: activations } = await supabaseAdmin
      .from('activations')
      .select('*')
      .eq('license_id', id)
      .order('activated_at', { ascending: false });

    return success(res, { ...license, activations });
  } catch (err) {
    if (err instanceof NotFoundError || err instanceof ForbiddenError) {
      return error(res, err.message, err.statusCode);
    }
    console.error('Get license error:', err);
    return error(res, 'Failed to fetch license');
  }
};

export const suspendLicense = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: license } = await supabaseAdmin
      .from('licenses')
      .select('id, plugin:plugins(developer_id)')
      .eq('id', id)
      .single();

    if (!license) {
      throw new NotFoundError('License not found');
    }

    // Only admin or the developer who owns the plugin can suspend
    if (req.user.role === 'developer' && license.plugin.developer_id !== req.user.id) {
      throw new ForbiddenError('Access denied');
    }

    const result = await licenseService.suspendLicense(id);
    return success(res, result);
  } catch (err) {
    if (err instanceof NotFoundError || err instanceof ForbiddenError) {
      return error(res, err.message, err.statusCode);
    }
    console.error('Suspend license error:', err);
    return error(res, err.message || 'Failed to suspend license');
  }
};

export const revokeLicense = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role !== 'admin') {
      throw new ForbiddenError('Only admins can revoke licenses');
    }

    const result = await licenseService.revokeLicense(id);
    return success(res, result);
  } catch (err) {
    if (err instanceof NotFoundError || err instanceof ForbiddenError) {
      return error(res, err.message, err.statusCode);
    }
    console.error('Revoke license error:', err);
    return error(res, err.message || 'Failed to revoke license');
  }
};

export const reactivateLicense = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role !== 'admin') {
      throw new ForbiddenError('Only admins can reactivate licenses');
    }

    const result = await licenseService.reactivateLicense(id);
    return success(res, result);
  } catch (err) {
    if (err instanceof NotFoundError || err instanceof ForbiddenError) {
      return error(res, err.message, err.statusCode);
    }
    console.error('Reactivate license error:', err);
    return error(res, err.message || 'Failed to reactivate license');
  }
};

export const createLicense = async (req, res) => {
  try {
    const { plugin_id, customer_id, activation_limit = 1, expiry_date = null } = req.body;

    // Verify plugin exists
    const { data: plugin } = await supabaseAdmin
      .from('plugins')
      .select('id')
      .eq('id', plugin_id)
      .single();

    if (!plugin) {
      throw new NotFoundError('Plugin not found');
    }

    const license = await licenseService.createLicense(
      plugin_id,
      customer_id,
      activation_limit,
      expiry_date
    );

    return success(res, license, 201);
  } catch (err) {
    if (err instanceof NotFoundError) {
      return error(res, err.message, err.statusCode);
    }
    console.error('Create license error:', err);
    return error(res, err.message || 'Failed to create license');
  }
};