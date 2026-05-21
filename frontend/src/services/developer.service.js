import { useAuthStore } from '../store/auth.store';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json'
};

// Helper function for REST API calls
const supabaseFetch = async (endpoint, options = {}) => {
  try {
    const url = `${SUPABASE_URL}/rest/v1${endpoint}`;
    const response = await fetch(url, {
      headers,
      ...options
    });

    let data;
    try {
      data = await response.json();
    } catch (e) {
      data = null;
    }

    if (!response.ok) {
      console.error(`API Error [${response.status}]:`, data);
      return { data: null, error: data?.message || `Request failed with status ${response.status}` };
    }

    return { data, error: null };
  } catch (error) {
    console.error('supabaseFetch error:', error);
    return { data: null, error: error.message };
  }
};

// Get current user ID from auth store
const getUserId = () => {
  try {
    return useAuthStore.getState().user?.id;
  } catch {
    return null;
  }
};

export const developerService = {
  // Dashboard Stats
  getStats: async () => {
    try {
      const userId = getUserId();
      if (!userId) throw new Error('Not authenticated');

      // Fetch my plugins
      const pluginsRes = await supabaseFetch(`/plugins?developer_id=eq.${userId}&select=id,download_count`);
      const plugins = pluginsRes.data || [];
      const pluginIds = plugins.map(p => p.id);

      // Fetch downloads count
      const totalDownloads = plugins.reduce((sum, p) => sum + Number(p.download_count || 0), 0);

      // Fetch licenses count
      const licensesRes = pluginIds.length > 0
        ? await supabaseFetch(`/licenses?plugin_id=in.(${pluginIds.join(',')})&status=eq.active&select=id`)
        : { data: [] };
      const activeLicenses = licensesRes.data?.length || 0;

      // Fetch paid orders for revenue
      const ordersRes = pluginIds.length > 0
        ? await supabaseFetch(`/orders?plugin_id=in.(${pluginIds.join(',')})&payment_status=eq.paid&select=amount`)
        : { data: [] };
      const totalRevenue = ordersRes.data?.reduce((sum, o) => sum + Number(o.amount || 0), 0) || 0;

      // Fetch recent licenses
      const recentLicensesRes = pluginIds.length > 0
        ? await supabaseFetch(`/licenses?plugin_id=in.(${pluginIds.join(',')})&order=created_at.desc&limit=5&select=*,plugin:plugins(name),customer:profiles(name,email)`)
        : { data: [] };

      return {
        success: true,
        data: {
          totalPlugins: plugins.length,
          totalDownloads,
          activeLicenses,
          totalRevenue,
          recentLicenses: recentLicensesRes.data || []
        }
      };
    } catch (error) {
      console.warn('getStats error:', error?.message);
      return { success: true, data: { totalPlugins: 0, totalDownloads: 0, activeLicenses: 0, totalRevenue: 0, recentLicenses: [] } };
    }
  },

  // My Plugins
  getMyPlugins: async (params = {}) => {
    try {
      const userId = getUserId();
      if (!userId) throw new Error('Not authenticated');

      const { data, error } = await supabaseFetch(
        `/plugins?developer_id=eq.${userId}&order=created_at.desc&limit=${params.limit || 50}&select=*`
      );

      if (error) throw new Error(error);

      return { success: true, data: { items: data || [], total: data?.length || 0 } };
    } catch (error) {
      console.warn('getMyPlugins error:', error?.message);
      return { success: true, data: { items: [], total: 0 } };
    }
  },

  // Create Plugin
  createPlugin: async (pluginData) => {
    try {
      const userId = getUserId();
      if (!userId) throw new Error('Not authenticated');

      const slug = pluginData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      const body = {
        developer_id: userId,
        name: pluginData.name,
        slug,
        description: pluginData.description || '',
        short_desc: pluginData.short_desc || '',
        category: pluginData.category || '',
        tags: pluginData.tags || [],
        price: Number(pluginData.price) || 0,
        status: 'pending',
      };

      const response = await fetch(`${SUPABASE_URL}/rest/v1/plugins`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data?.message || 'Failed to create plugin');

      return { success: true, data };
    } catch (error) {
      console.warn('createPlugin error:', error?.message);
      throw error;
    }
  },

  // Update Plugin
  updatePlugin: async (id, updates) => {
    try {
      const userId = getUserId();
      if (!userId) throw new Error('Not authenticated');

      const response = await fetch(`${SUPABASE_URL}/rest/v1/plugins?id=eq.${id}&developer_id=eq.${userId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(updates)
      });

      if (!response.ok) throw new Error('Failed to update plugin');
      return { success: true };
    } catch (error) {
      console.warn('updatePlugin error:', error?.message);
      throw error;
    }
  },

  // Delete Plugin
  deletePlugin: async (id) => {
    try {
      const userId = getUserId();
      if (!userId) throw new Error('Not authenticated');

      // Delete versions first
      await fetch(`${SUPABASE_URL}/rest/v1/plugin_versions?plugin_id=eq.${id}`, {
        method: 'DELETE',
        headers
      });

      const response = await fetch(`${SUPABASE_URL}/rest/v1/plugins?id=eq.${id}&developer_id=eq.${userId}`, {
        method: 'DELETE',
        headers
      });

      if (!response.ok) throw new Error('Failed to delete plugin');
      return { success: true };
    } catch (error) {
      console.warn('deletePlugin error:', error?.message);
      throw error;
    }
  },

  // Get Licenses for my plugins
  getLicenses: async () => {
    try {
      const userId = getUserId();
      if (!userId) throw new Error('Not authenticated');

      const pluginsRes = await supabaseFetch(`/plugins?developer_id=eq.${userId}&select=id`);
      const pluginIds = pluginsRes.data?.map(p => p.id) || [];

      if (pluginIds.length === 0) {
        return { success: true, data: { items: [], total: 0 } };
      }

      const { data, error } = await supabaseFetch(
        `/licenses?plugin_id=in.(${pluginIds.join(',')})&order=created_at.desc&select=*,plugin:plugins(name),customer:profiles(name,email),activations(*)`
      );

      if (error) throw new Error(error);

      return { success: true, data: { items: data || [], total: data?.length || 0 } };
    } catch (error) {
      console.warn('getLicenses error:', error?.message);
      return { success: true, data: { items: [], total: 0 } };
    }
  },

  // Manage License
  updateLicense: async (id, status) => {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/licenses?id=eq.${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status })
      });

      if (!response.ok) throw new Error('Failed to update license');
      return { success: true };
    } catch (error) {
      console.warn('updateLicense error:', error?.message);
      throw error;
    }
  },

  // Get Customers who bought my plugins
  getCustomers: async () => {
    try {
      const userId = getUserId();
      if (!userId) throw new Error('Not authenticated');

      const pluginsRes = await supabaseFetch(`/plugins?developer_id=eq.${userId}&select=id`);
      const pluginIds = pluginsRes.data?.map(p => p.id) || [];

      if (pluginIds.length === 0) {
        return { success: true, data: [] };
      }

      const { data, error } = await supabaseFetch(
        `/licenses?plugin_id=in.(${pluginIds.join(',')})&select=customer:profiles(id,name,email)`
      );

      if (error) throw new Error(error);

      // Get unique customers
      const uniqueCustomers = {};
      data?.forEach(lic => {
        if (lic.customer && !uniqueCustomers[lic.customer.id]) {
          uniqueCustomers[lic.customer.id] = { ...lic.customer, purchaseCount: 0 };
        }
        if (lic.customer) {
          uniqueCustomers[lic.customer.id].purchaseCount++;
        }
      });

      return { success: true, data: Object.values(uniqueCustomers) };
    } catch (error) {
      console.warn('getCustomers error:', error?.message);
      return { success: true, data: [] };
    }
  },

  // Revenue
  getRevenue: async () => {
    try {
      const userId = getUserId();
      if (!userId) throw new Error('Not authenticated');

      const pluginsRes = await supabaseFetch(`/plugins?developer_id=eq.${userId}&select=id,name`);
      const plugins = pluginsRes.data || [];
      const pluginIds = plugins.map(p => p.id);

      if (pluginIds.length === 0) {
        return { success: true, data: { orders: [], totalRevenue: 0, thisMonth: 0 } };
      }

      const { data: orders, error } = await supabaseFetch(
        `/orders?plugin_id=in.(${pluginIds.join(',')})&payment_status=eq.paid&order=created_at.desc&select=*,plugin:plugins(name),customer:profiles(name)`
      );

      if (error) throw new Error(error);

      const totalRevenue = orders?.reduce((sum, o) => sum + Number(o.amount || 0), 0) || 0;
      const now = new Date();
      const thisMonth = orders?.filter(o => {
        const d = new Date(o.created_at);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }).reduce((sum, o) => sum + Number(o.amount || 0), 0) || 0;

      return { success: true, data: { orders: orders || [], totalRevenue, thisMonth } };
    } catch (error) {
      console.warn('getRevenue error:', error?.message);
      return { success: true, data: { orders: [], totalRevenue: 0, thisMonth: 0 } };
    }
  },

  // Analytics
  getAnalytics: async () => {
    try {
      const userId = getUserId();
      if (!userId) throw new Error('Not authenticated');

      const pluginsRes = await supabaseFetch(`/plugins?developer_id=eq.${userId}&select=*`);
      const plugins = pluginsRes.data || [];
      const pluginIds = plugins.map(p => p.id);

      const totalDownloads = plugins.reduce((sum, p) => sum + Number(p.download_count || 0), 0);

      let orders = [];
      if (pluginIds.length > 0) {
        const ordersRes = await supabaseFetch(`/orders?plugin_id=in.(${pluginIds.join(',')})&payment_status=eq.paid&select=amount,created_at`);
        orders = ordersRes.data || [];
      }

      let activeLicenses = 0;
      if (pluginIds.length > 0) {
        const licensesRes = await supabaseFetch(`/licenses?plugin_id=in.(${pluginIds.join(',')})&status=eq.active&select=id`);
        activeLicenses = licensesRes.data?.length || 0;
      }

      const totalRevenue = orders.reduce((sum, o) => sum + Number(o.amount || 0), 0);

      return {
        success: true,
        data: {
          totalPlugins: plugins.length,
          totalDownloads,
          totalRevenue,
          activeLicenses,
          salesCount: orders.length,
          plugins: plugins || [],
        }
      };
    } catch (error) {
      console.warn('getAnalytics error:', error?.message);
      return { success: true, data: { totalPlugins: 0, totalDownloads: 0, totalRevenue: 0, activeLicenses: 0, salesCount: 0, plugins: [] } };
    }
  },
};