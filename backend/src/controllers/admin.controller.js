import { supabaseAdmin } from '../config/supabase.js';
import { success, error, paginated } from '../utils/apiResponse.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';

export const getStats = async (req, res) => {
  try {
    // Get counts in parallel
    const [
      { count: totalUsers },
      { count: totalDevelopers },
      { count: totalCustomers },
      { count: totalPlugins },
      { count: pendingPlugins },
      { count: totalOrders },
      { count: totalLicenses },
    ] = await Promise.all([
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'developer'),
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
      supabaseAdmin.from('plugins').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('plugins').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }).eq('payment_status', 'paid'),
      supabaseAdmin.from('licenses').select('*', { count: 'exact', head: true }),
    ]);

    // Get total revenue
    const { data: revenueData } = await supabaseAdmin
      .from('orders')
      .select('amount')
      .eq('payment_status', 'paid');

    const totalRevenue = revenueData?.reduce((sum, o) => sum + parseFloat(o.amount), 0) || 0;

    // Get recent orders
    const { data: recentOrders } = await supabaseAdmin
      .from('orders')
      .select(`
        id, amount, payment_status, created_at,
        customer:profiles!customer_id(name, email),
        plugin:plugins(name)
      `)
      .eq('payment_status', 'paid')
      .order('created_at', { ascending: false })
      .limit(10);

    return success(res, {
      users: {
        total: totalUsers || 0,
        developers: totalDevelopers || 0,
        customers: totalCustomers || 0,
      },
      plugins: {
        total: totalPlugins || 0,
        pending: pendingPlugins || 0,
      },
      orders: {
        total: totalOrders || 0,
      },
      licenses: {
        total: totalLicenses || 0,
      },
      revenue: {
        total: totalRevenue,
        currency: 'INR',
      },
      recentOrders: recentOrders || [],
    });
  } catch (err) {
    console.error('Get stats error:', err);
    return error(res, 'Failed to fetch stats');
  }
};

export const getPlugins = async (req, res) => {
  try {
    const { page = 1, limit = 20, status = '', search = '' } = req.query;

    let query = supabaseAdmin
      .from('plugins')
      .select(`
        id, name, slug, short_desc, category, current_version, price, status,
        download_count, created_at, updated_at,
        developer:profiles!developer_id(id, name, email)
      `, { count: 'exact' });

    if (status) {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,slug.ilike.%${search}%`);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query
      .order('created_at', { ascending: false })
      .range(from, to);

    const { data: plugins, count, error: queryError } = await query;

    if (queryError) {
      throw new Error(`Failed to fetch plugins: ${queryError.message}`);
    }

    return paginated(res, plugins, {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (err) {
    console.error('Get admin plugins error:', err);
    return error(res, 'Failed to fetch plugins');
  }
};

export const getPendingPlugins = async (req, res) => {
  try {
    const { data: plugins, error: queryError } = await supabaseAdmin
      .from('plugins')
      .select(`
        id, name, slug, short_desc, category, price, status, created_at,
        developer:profiles!developer_id(id, name, email)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (queryError) {
      throw new Error(`Failed to fetch pending plugins: ${queryError.message}`);
    }

    return success(res, plugins);
  } catch (err) {
    console.error('Get pending plugins error:', err);
    return error(res, 'Failed to fetch pending plugins');
  }
};

export const approvePlugin = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: plugin, error: updateError } = await supabaseAdmin
      .from('plugins')
      .update({ status: 'approved', rejection_note: null })
      .eq('id', id)
      .select(`
        id, name, status,
        developer:profiles!developer_id(id, email)
      `)
      .single();

    if (updateError || !plugin) {
      throw new NotFoundError('Plugin not found');
    }

    return success(res, plugin);
  } catch (err) {
    if (err instanceof NotFoundError) {
      return error(res, err.message, err.statusCode);
    }
    console.error('Approve plugin error:', err);
    return error(res, 'Failed to approve plugin');
  }
};

export const rejectPlugin = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || reason.length < 10) {
      return error(res, 'Rejection reason must be at least 10 characters', 400);
    }

    const { data: plugin, error: updateError } = await supabaseAdmin
      .from('plugins')
      .update({ status: 'rejected', rejection_note: reason })
      .eq('id', id)
      .select('id, name, status, rejection_note')
      .single();

    if (updateError || !plugin) {
      throw new NotFoundError('Plugin not found');
    }

    return success(res, plugin);
  } catch (err) {
    if (err instanceof NotFoundError) {
      return error(res, err.message, err.statusCode);
    }
    console.error('Reject plugin error:', err);
    return error(res, 'Failed to reject plugin');
  }
};

export const suspendPlugin = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: plugin, error: updateError } = await supabaseAdmin
      .from('plugins')
      .update({ status: 'suspended' })
      .eq('id', id)
      .select('id, name, status')
      .single();

    if (updateError || !plugin) {
      throw new NotFoundError('Plugin not found');
    }

    return success(res, plugin);
  } catch (err) {
    if (err instanceof NotFoundError) {
      return error(res, err.message, err.statusCode);
    }
    console.error('Suspend plugin error:', err);
    return error(res, 'Failed to suspend plugin');
  }
};

export const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role = '', search = '' } = req.query;

    let query = supabaseAdmin
      .from('profiles')
      .select('id, name, email, role, business_name, subscription_plan, is_active, created_at', { count: 'exact' });

    if (role) {
      query = query.eq('role', role);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query
      .order('created_at', { ascending: false })
      .range(from, to);

    const { data: users, count, error: queryError } = await query;

    if (queryError) {
      throw new Error(`Failed to fetch users: ${queryError.message}`);
    }

    return paginated(res, users, {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (err) {
    console.error('Get users error:', err);
    return error(res, 'Failed to fetch users');
  }
};

export const suspendUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Can't suspend admins
    const { data: user } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', id)
      .single();

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.role === 'admin') {
      throw new ForbiddenError('Cannot suspend admin users');
    }

    const { data: updated, error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ is_active: false })
      .eq('id', id)
      .select('id, name, email, is_active')
      .single();

    if (updateError) {
      throw new Error(`Failed to suspend user: ${updateError.message}`);
    }

    return success(res, updated);
  } catch (err) {
    if (err instanceof NotFoundError || err instanceof ForbiddenError) {
      return error(res, err.message, err.statusCode);
    }
    console.error('Suspend user error:', err);
    return error(res, 'Failed to suspend user');
  }
};

export const reinstateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: updated, error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ is_active: true })
      .eq('id', id)
      .select('id, name, email, is_active')
      .single();

    if (updateError || !updated) {
      throw new NotFoundError('User not found');
    }

    return success(res, updated);
  } catch (err) {
    if (err instanceof NotFoundError) {
      return error(res, err.message, err.statusCode);
    }
    console.error('Reinstate user error:', err);
    return error(res, 'Failed to reinstate user');
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, business_name, subscription_plan } = req.body;

    // Can't change admin role
    const { data: existingUser } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', id)
      .single();

    if (!existingUser) {
      throw new NotFoundError('User not found');
    }

    if (existingUser.role === 'admin' && role && role !== 'admin') {
      throw new ForbiddenError('Cannot change admin role');
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (role) updateData.role = role;
    if (business_name !== undefined) updateData.business_name = business_name;
    if (subscription_plan) updateData.subscription_plan = subscription_plan;

    const { data: updated, error: updateError } = await supabaseAdmin
      .from('profiles')
      .update(updateData)
      .eq('id', id)
      .select('id, name, email, role, business_name, subscription_plan, is_active')
      .single();

    if (updateError) {
      throw new Error(`Failed to update user: ${updateError.message}`);
    }

    return success(res, updated);
  } catch (err) {
    if (err instanceof NotFoundError || err instanceof ForbiddenError) {
      return error(res, err.message, err.statusCode);
    }
    console.error('Update user error:', err);
    return error(res, 'Failed to update user');
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Can't delete admins
    const { data: user } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', id)
      .single();

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.role === 'admin') {
      throw new ForbiddenError('Cannot delete admin users');
    }

    // Delete profile first (cascade should handle auth user via RLS)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', id);

    if (profileError) {
      throw new Error(`Failed to delete user: ${profileError.message}`);
    }

    // Also delete from auth.users
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);

    if (authError) {
      console.error('Auth user deletion error:', authError.message);
    }

    return success(res, { message: 'User deleted successfully' });
  } catch (err) {
    if (err instanceof NotFoundError || err instanceof ForbiddenError) {
      return error(res, err.message, err.statusCode);
    }
    console.error('Delete user error:', err);
    return error(res, 'Failed to delete user');
  }
};

export const updateUserPassword = async (req, res) => {
  try {
    const { user_id, password } = req.body;

    console.log('updateUserPassword called:', { user_id, hasPassword: !!password });

    if (!user_id || !password) {
      return error(res, 'User ID and password are required', 400);
    }

    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(user_id, {
      password: password,
    });

    console.log('Supabase updateUserById result:', { data, error });

    if (error) {
      throw new Error(`Failed to update password: ${error.message}`);
    }

    return success(res, { message: 'Password updated successfully' });
  } catch (err) {
    console.error('Update password error:', err);
    return error(res, err.message || 'Failed to update password');
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, business_name } = req.body;

    if (!name || !email || !password || !role) {
      return error(res, 'Name, email, password, and role are required', 400);
    }

    if (!['developer', 'customer', 'admin'].includes(role)) {
      return error(res, 'Role must be developer, customer, or admin', 400);
    }

    const { data: existing } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (existing) {
      return error(res, 'Email already registered', 409);
    }

    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        role,
        business_name: business_name || null,
      },
    });

    if (authError) {
      throw new Error(`Failed to create user: ${authError.message}`);
    }

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authUser.id,
        name,
        email,
        role,
        business_name: business_name || null,
        is_active: true,
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
    }

    return success(res, {
      user: {
        id: authUser.id,
        email,
        name,
        role,
      }
    }, 201);
  } catch (err) {
    console.error('Create user error:', err);
    return error(res, err.message || 'Failed to create user');
  }
};

export const getOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status = '' } = req.query;

    let query = supabaseAdmin
      .from('orders')
      .select(`
        id, amount, currency, payment_status, razorpay_order_id, created_at,
        customer:profiles!customer_id(id, name, email),
        plugin:plugins(id, name),
        license:licenses(id, license_key)
      `, { count: 'exact' });

    if (status) {
      query = query.eq('payment_status', status);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query
      .order('created_at', { ascending: false })
      .range(from, to);

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