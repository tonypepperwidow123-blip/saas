import { useAuthStore } from '../store/auth.store';
import api from './api';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'count=exact'
};

// Get current user token from auth store
const getToken = () => {
  try {
    return useAuthStore.getState().token;
  } catch {
    return null;
  }
};

// Helper function for REST API calls
const supabaseFetch = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1${endpoint}`, {
      headers,
      ...options
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || `Request failed with status ${response.status}`);
    }

    const count = response.headers.get('content-range')?.split('/')?.[1];

    return {
      data,
      count: count ? parseInt(count) : (Array.isArray(data) ? data.length : 0),
      error: null
    };
  } catch (error) {
    return { data: null, count: 0, error: error.message };
  }
};

export const adminService = {
  // Stats - Dashboard overview
  getStats: async () => {
    try {
      // Fetch counts in parallel
      const [usersRes, devsRes, customersRes, pluginsRes, ordersRes, licensesRes, pendingRes, paidOrdersRes] = await Promise.all([
        supabaseFetch('/profiles?select=id'),
        supabaseFetch('/profiles?role=eq.developer&select=id'),
        supabaseFetch('/profiles?role=eq.customer&select=id'),
        supabaseFetch('/plugins?select=id'),
        supabaseFetch('/orders?select=id'),
        supabaseFetch('/licenses?select=id'),
        supabaseFetch('/plugins?status=eq.pending&select=id'),
        supabaseFetch('/orders?payment_status=eq.paid&select=id,amount'),
      ]);

      const usersCount = usersRes.count ?? (usersRes.data?.length ?? 0);
      const devsCount = devsRes.count ?? (devsRes.data?.length ?? 0);
      const customersCount = customersRes.count ?? (customersRes.data?.length ?? 0);
      const pluginsCount = pluginsRes.count ?? (pluginsRes.data?.length ?? 0);
      const ordersCount = ordersRes.count ?? (ordersRes.data?.length ?? 0);
      const licensesCount = licensesRes.count ?? (licensesRes.data?.length ?? 0);
      const pendingCount = pendingRes.count ?? (pendingRes.data?.length ?? 0);

      const totalRevenue = paidOrdersRes.data?.reduce((sum, o) => sum + Number(o.amount || 0), 0) || 0;

      // Fetch recent orders with joins
      const { data: recentOrders } = await supabaseFetch('/orders?select=id,amount,payment_status,created_at&order=created_at.desc&limit=5');

      const data = {
        users: {
          total: usersCount,
          developers: devsCount,
          customers: customersCount
        },
        plugins: {
          total: pluginsCount,
          pending: pendingCount
        },
        revenue: { total: totalRevenue },
        orders: { total: ordersCount },
        licenses: { total: licensesCount },
        recentOrders: recentOrders || []
      };

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        data: {
          users: { total: 0, developers: 0, customers: 0 },
          plugins: { total: 0, pending: 0 },
          revenue: { total: 0 },
          orders: { total: 0 },
          licenses: { total: 0 },
          recentOrders: []
        }
      };
    }
  },

  // Developers
  getDevelopers: async (params = {}) => {
    try {
      let query = '/profiles?role=eq.developer&order=created_at.desc&select=id,name,email,business_name,subscription_plan,is_active,created_at';

      if (params.search) {
        query += `&or=(name.ilike.${encodeURIComponent(params.search)},email.ilike.${encodeURIComponent(params.search)})`;
      }

      query += `&limit=${params.limit || 50}`;

      const { data, count, error } = await supabaseFetch(query);

      if (error) throw new Error(error);

      return { success: true, data: { items: data || [], total: count || 0 } };
    } catch (error) {
      console.warn('AdminService getDevelopers error:', error?.message);
      return { success: true, data: { items: [], total: 0 } };
    }
  },

  // Customers
  getCustomers: async (params = {}) => {
    try {
      let query = '/profiles?role=eq.customer&order=created_at.desc';

      if (params.search) {
        query += `&or=(name.ilike.${encodeURIComponent(params.search)},email.ilike.${encodeURIComponent(params.search)})`;
      }

      query += `&limit=${params.limit || 50}`;

      const { data, count, error } = await supabaseFetch(query);

      if (error) throw new Error(error);

      return { success: true, data: { items: data || [], total: count || 0 } };
    } catch (error) {
      console.warn('AdminService getCustomers error:', error?.message);
      return { success: true, data: { items: [], total: 0 } };
    }
  },

  // All Users (for Users page)
  getUsers: async (params = {}) => {
    try {
      let query = '/profiles?order=created_at.desc&select=id,name,email,role,business_name,subscription_plan,is_active,created_at';

      if (params.search) {
        query += `&or=(name.ilike.${encodeURIComponent('%' + params.search + '%')},email.ilike.${encodeURIComponent('%' + params.search + '%')})`;
      }

      if (params.role) {
        query += `&role=eq.${params.role}`;
      }

      query += `&limit=${params.limit || 50}`;

      const { data, count, error } = await supabaseFetch(query);

      if (error) throw new Error(error);

      return { success: true, data: { items: data || [], total: count || 0 } };
    } catch (error) {
      console.warn('AdminService getUsers error:', error?.message);
      return { success: true, data: { items: [], total: 0 } };
    }
  },

  // Admins
  getAdmins: async (params = {}) => {
    try {
      let query = '/profiles?role=eq.admin&order=created_at.desc';

      if (params.search) {
        query += `&or=(name.ilike.${encodeURIComponent(params.search)},email.ilike.${encodeURIComponent(params.search)})`;
      }

      query += `&limit=${params.limit || 50}`;

      const { data, count, error } = await supabaseFetch(query);

      if (error) throw new Error(error);

      return { success: true, data: { items: data || [], total: count || 0 } };
    } catch (error) {
      console.warn('AdminService getAdmins error:', error?.message);
      return { success: true, data: { items: [], total: 0 } };
    }
  },

  // All Plugins
  getPlugins: async (params = {}) => {
    try {
      let query = '/plugins?order=created_at.desc';

      if (params.status) {
        query += `&status=eq.${params.status}`;
      }

      query += `&limit=${params.limit || 50}`;

      const { data, count, error } = await supabaseFetch(query);

      if (error) throw new Error(error);

      return { success: true, data: { items: data || [], total: count || 0 } };
    } catch (error) {
      console.warn('AdminService getPlugins error:', error?.message);
      return { success: true, data: { items: [], total: 0 } };
    }
  },

  // Pending Plugins
  getPendingPlugins: async () => {
    try {
      const { data, count, error } = await supabaseFetch('/plugins?status=eq.pending&order=created_at.desc');

      if (error) throw new Error(error);

      return { success: true, data: data || [], count: count || 0 };
    } catch (error) {
      console.warn('AdminService getPendingPlugins error:', error?.message);
      return { success: true, data: [], count: 0 };
    }
  },

  approvePlugin: async (id) => {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/plugins?id=eq.${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: 'approved' })
      });

      if (!response.ok) throw new Error('Failed to approve plugin');
      return { success: true };
    } catch (error) {
      console.warn('AdminService approvePlugin error:', error?.message);
      throw error;
    }
  },

  rejectPlugin: async (id, reason) => {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/plugins?id=eq.${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: 'rejected', rejection_note: reason })
      });

      if (!response.ok) throw new Error('Failed to reject plugin');
      return { success: true };
    } catch (error) {
      console.warn('AdminService rejectPlugin error:', error?.message);
      throw error;
    }
  },

  suspendPlugin: async (id) => {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/plugins?id=eq.${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: 'suspended' })
      });

      if (!response.ok) throw new Error('Failed to suspend plugin');
      return { success: true };
    } catch (error) {
      console.warn('AdminService suspendPlugin error:', error?.message);
      throw error;
    }
  },

  // Licenses
  getLicenses: async (params = {}) => {
    try {
      let query = '/licenses?order=created_at.desc';

      if (params.status) {
        query += `&status=eq.${params.status}`;
      }

      query += `&limit=${params.limit || 100}`;

      const { data, count, error } = await supabaseFetch(query);

      if (error) throw new Error(error);

      return { success: true, data: { items: data || [], total: count || 0 } };
    } catch (error) {
      console.warn('AdminService getLicenses error:', error?.message);
      return { success: true, data: { items: [], total: 0 } };
    }
  },

  // Transactions (Orders)
  getOrders: async (params = {}) => {
    try {
      let query = '/orders?order=created_at.desc';

      if (params.status) {
        query += `&payment_status=eq.${params.status}`;
      }

      query += `&limit=${params.limit || 100}`;

      const { data, count, error } = await supabaseFetch(query);

      if (error) throw new Error(error);

      return { success: true, data: { items: data || [], total: count || 0 } };
    } catch (error) {
      console.warn('AdminService getOrders error:', error?.message);
      return { success: true, data: { items: [], total: 0 } };
    }
  },

  // Revenue Stats
  getRevenue: async () => {
    try {
      const { data: orders, error } = await supabaseFetch('/orders?payment_status=eq.paid&order=created_at.desc');

      if (error) throw new Error(error);

      const total = orders?.reduce((sum, o) => sum + Number(o.amount || 0), 0) || 0;

      const now = new Date();
      const thisMonth = orders?.filter(o => {
        const d = new Date(o.created_at);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }).reduce((sum, o) => sum + Number(o.amount || 0), 0) || 0;

      return { success: true, data: { total, thisMonth, orders: orders || [] } };
    } catch (error) {
      console.warn('AdminService getRevenue error:', error?.message);
      return { success: true, data: { total: 0, thisMonth: 0, orders: [] } };
    }
  },

  // Analytics
  getAnalytics: async () => {
    try {
      const [profilesRes, pluginsRes, licensesRes, ordersRes, paidOrdersRes, topPluginsRes] = await Promise.all([
        supabaseFetch('/profiles?select=id'),
        supabaseFetch('/plugins?select=id,status,download_count'),
        supabaseFetch('/licenses?select=id,status'),
        supabaseFetch('/orders?select=id'),
        supabaseFetch('/orders?payment_status=eq.paid&select=amount'),
        supabaseFetch('/plugins?status=eq.approved&order=download_count.desc&limit=5&select=id,name,download_count'),
      ]);

      const profiles = profilesRes.data || [];
      const plugins = pluginsRes.data || [];
      const licenses = licensesRes.data || [];
      const orders = ordersRes.data || [];

      const revenue = paidOrdersRes.data?.reduce((sum, o) => sum + Number(o.amount || 0), 0) || 0;

      return {
        success: true,
        data: {
          users: {
            total: profilesRes.count || profiles.length,
            developers: profiles.filter(p => p.role === 'developer').length,
            customers: profiles.filter(p => p.role === 'customer').length
          },
          plugins: {
            total: pluginsRes.count || plugins.length,
            approved: plugins.filter(p => p.status === 'approved').length,
            pending: plugins.filter(p => p.status === 'pending').length
          },
          licenses: {
            total: licensesRes.count || licenses.length,
            active: licenses.filter(l => l.status === 'active').length
          },
          orders: {
            total: ordersRes.count || orders.length,
            paid: paidOrdersRes.data?.length || 0
          },
          revenue,
          topPlugins: topPluginsRes.data || []
        }
      };
    } catch (error) {
      console.warn('AdminService getAnalytics error:', error?.message);
      return {
        success: true,
        data: {
          users: { total: 0, developers: 0, customers: 0 },
          plugins: { total: 0, approved: 0, pending: 0 },
          licenses: { total: 0, active: 0 },
          orders: { total: 0, paid: 0 },
          revenue: 0,
          topPlugins: []
        }
      };
    }
  },

  // User Management
  suspendUser: async (id) => {
    try {
      await api.patch(`/admin/users/${id}/suspend`);
      return { success: true };
    } catch (error) {
      console.warn('AdminService suspendUser error:', error?.message);
      throw error;
    }
  },

  activateUser: async (id) => {
    try {
      await api.patch(`/admin/users/${id}/reinstate`);
      return { success: true };
    } catch (error) {
      console.warn('AdminService activateUser error:', error?.message);
      throw error;
    }
  },

  deleteUser: async (id) => {
    try {
      await api.delete(`/admin/users/${id}`);
      return { success: true };
    } catch (error) {
      console.warn('AdminService deleteUser error:', error?.message);
      throw error;
    }
  },

  // Update user profile
  updateUser: async (id, data) => {
    try {
      await api.patch(`/admin/users/${id}`, {
        name: data.name,
        role: data.role,
        business_name: data.business_name,
        subscription_plan: data.subscription_plan,
      });
      return { success: true };
    } catch (error) {
      console.warn('AdminService updateUser error:', error?.message);
      throw error;
    }
  },

  // Update user password - ANY password accepted, no restrictions
  updateUserPassword: async (id, newPassword) => {
    try {
      await api.put('/admin/users/password', {
        user_id: id,
        password: newPassword,
      });
      return { success: true };
    } catch (error) {
      const msg = error.response?.data?.error || error.message || 'Failed to update password';
      console.error('AdminService updateUserPassword error:', msg);
      throw new Error(msg);
    }
  },

  // Create new user
  createUser: async (userData) => {
    try {
      const response = await api.post('/admin/users', {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: userData.role,
        business_name: userData.business_name || null,
      });
      return { success: true, data: response.data?.data || { email: userData.email } };
    } catch (error) {
      const msg = error.response?.data?.error || error.message || 'Failed to create user';
      console.warn('AdminService createUser error:', msg);
      throw new Error(msg);
    }
  },
};