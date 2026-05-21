import { useAuthStore } from '../store/auth.store';
import api from './api';

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

export const customerService = {
  // Dashboard Stats
  getStats: async () => {
    try {
      const userId = getUserId();
      if (!userId) throw new Error('Not authenticated');

      const [licensesRes, ordersRes, activationsRes] = await Promise.all([
        supabaseFetch(`/licenses?customer_id=eq.${userId}&status=eq.active&select=id`),
        supabaseFetch(`/orders?customer_id=eq.${userId}&select=id`),
        supabaseFetch(`/activations?is_active=eq.true&select=id`),
      ]);

      return {
        success: true,
        data: {
          activeLicenses: licensesRes.data?.length || 0,
          totalOrders: ordersRes.data?.length || 0,
          activeActivations: activationsRes.data?.length || 0,
        }
      };
    } catch (error) {
      console.warn('getStats error:', error?.message);
      return { success: true, data: { activeLicenses: 0, totalOrders: 0, activeActivations: 0 } };
    }
  },

  // My Licenses
  getMyLicenses: async (params = {}) => {
    try {
      const userId = getUserId();
      if (!userId) throw new Error('Not authenticated');

      const { data, error } = await supabaseFetch(
        `/licenses?customer_id=eq.${userId}&order=created_at.desc&limit=${params.limit || 50}&select=*,plugin:plugins(id,name,slug,thumbnail_url,current_version,status),activations(*)`
      );

      if (error) throw new Error(error);

      return { success: true, data: { items: data || [], total: data?.length || 0 } };
    } catch (error) {
      console.warn('getMyLicenses error:', error?.message);
      return { success: true, data: { items: [], total: 0 } };
    }
  },

  // My Downloads (plugins I own)
  getMyDownloads: async () => {
    try {
      const userId = getUserId();
      if (!userId) throw new Error('Not authenticated');

      const { data, error } = await supabaseFetch(
        `/licenses?customer_id=eq.${userId}&status=eq.active&select=*,plugin:plugins(id,name,slug,thumbnail_url,current_version,download_count)`
      );

      if (error) throw new Error(error);

      return { success: true, data: data || [] };
    } catch (error) {
      console.warn('getMyDownloads error:', error?.message);
      return { success: true, data: [] };
    }
  },

  // My Orders
  getMyOrders: async (params = {}) => {
    try {
      const userId = getUserId();
      if (!userId) throw new Error('Not authenticated');

      const { data, error } = await supabaseFetch(
        `/orders?customer_id=eq.${userId}&order=created_at.desc&limit=${params.limit || 50}&select=*,plugin:plugins(id,name,slug,thumbnail_url)`
      );

      if (error) throw new Error(error);

      return { success: true, data: { items: data || [], total: data?.length || 0 } };
    } catch (error) {
      console.warn('getMyOrders error:', error?.message);
      return { success: true, data: { items: [], total: 0 } };
    }
  },

  // Get Download URL for plugin
  getDownloadUrl: async (pluginId) => {
    try {
      const { data: latestVersion, error: versionError } = await supabaseFetch(
        `/plugin_versions?plugin_id=eq.${pluginId}&is_latest=eq.true&select=zip_path`
      );

      if (versionError || !latestVersion?.[0]) {
        return { success: true, data: null };
      }

      // For signed URLs, we need to use the Supabase client
      // For now, return the storage path directly
      return { success: true, data: latestVersion[0].zip_path };
    } catch (error) {
      console.warn('getDownloadUrl error:', error?.message);
      return { success: true, data: null };
    }
  },

  // Download Plugin - Get signed download URL from backend
  downloadPlugin: async (pluginId) => {
    try {
      // Get the license for this plugin to verify ownership
      const userId = getUserId();
      if (!userId) throw new Error('Not authenticated');

      const { data: license, error: licenseError } = await supabaseFetch(
        `/licenses?plugin_id=eq.${pluginId}&customer_id=eq.${userId}&select=license_key`
      );

      if (licenseError || !license?.[0]) {
        throw new Error('You do not have a license for this plugin');
      }

      // Get the signed URL from backend
      const response = await api.post('/payments/download', { 
        plugin_id: pluginId, 
        license_key: license[0].license_key 
      });

      return response.data;
    } catch (error) {
      console.warn('downloadPlugin error:', error?.message);
      throw error;
    }
  },

  // Get Activations for a license
  getActivations: async (licenseId) => {
    try {
      const { data, error } = await supabaseFetch(
        `/activations?license_id=eq.${licenseId}&select=*`
      );

      if (error) throw new Error(error);

      return { success: true, data: data || [] };
    } catch (error) {
      console.warn('getActivations error:', error?.message);
      return { success: true, data: [] };
    }
  },

  // Deactivate a site
  deactivateSite: async (activationId) => {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/activations?id=eq.${activationId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ is_active: false, deactivated_at: new Date().toISOString() })
      });

      if (!response.ok) throw new Error('Failed to deactivate site');
      return { success: true };
    } catch (error) {
      console.warn('deactivateSite error:', error?.message);
      throw error;
    }
  },

  // Purchase Plugin (Free) - Creates license automatically
  purchasePlugin: async (pluginId) => {
    try {
      const userId = getUserId();
      if (!userId) throw new Error('Not authenticated');

      // Check if already purchased
      const { data: existingLicense, error: existingError } = await supabaseFetch(
        `/licenses?plugin_id=eq.${pluginId}&customer_id=eq.${userId}&select=id`
      );

      if (existingError) throw new Error(existingError);
      if (existingLicense?.[0]) {
        throw new Error('You already own a license for this plugin');
      }

      // Get plugin
      const { data: plugin, error: pluginError } = await supabaseFetch(
        `/plugins?id=eq.${pluginId}&status=eq.approved&select=id,name,price`
      );

      if (pluginError) throw new Error(pluginError);
      if (!plugin?.[0]) {
        throw new Error('Plugin not found or not available');
      }

      // Generate license key automatically
      const licenseKey = generateLicenseKey();

      // Create license
      const licenseBody = {
        plugin_id: pluginId,
        customer_id: userId,
        license_key: licenseKey,
        status: 'active',
        activation_limit: 3,
      };

      const licenseResponse = await fetch(`${SUPABASE_URL}/rest/v1/licenses`, {
        method: 'POST',
        headers,
        body: JSON.stringify(licenseBody)
      });

      const licenseData = await licenseResponse.json();

      if (!licenseResponse.ok) throw new Error(licenseData?.message || 'Failed to create license');

      // Create order
      const orderBody = {
        customer_id: userId,
        plugin_id: pluginId,
        license_id: licenseData.id,
        amount: 0,
        payment_status: 'paid',
      };

      await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
        method: 'POST',
        headers,
        body: JSON.stringify(orderBody)
      });

      return { success: true, data: { license: licenseData, licenseKey } };
    } catch (error) {
      console.warn('purchasePlugin error:', error?.message);
      throw error;
    }
  },
};