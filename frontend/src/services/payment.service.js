import api from './api';

export const paymentService = {
  createOrder: async (pluginId) => {
    const response = await api.post('/payments/create-order', { plugin_id: pluginId });
    return response.data;
  },

  verifyPayment: async (paymentData) => {
    const response = await api.post('/payments/verify', paymentData);
    return response.data;
  },

  getOrders: async (params = {}) => {
    const response = await api.get('/payments/orders', { params });
    return response.data;
  },

  createPlanUpgradeOrder: async (plan) => {
    const response = await api.post('/payments/plan-upgrade', { plan });
    return response.data;
  },

  verifyPlanUpgrade: async (paymentData) => {
    const response = await api.post('/payments/plan-verify', paymentData);
    return response.data;
  },
};