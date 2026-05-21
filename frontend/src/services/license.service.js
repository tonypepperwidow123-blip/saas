import api from './api';

export const licenseService = {
  getLicenses: async (params = {}) => {
    const response = await api.get('/licenses', { params });
    return response.data;
  },

  getLicenseById: async (id) => {
    const response = await api.get(`/licenses/${id}`);
    return response.data;
  },

  suspendLicense: async (id) => {
    const response = await api.patch(`/licenses/${id}/suspend`);
    return response.data;
  },

  revokeLicense: async (id) => {
    const response = await api.patch(`/licenses/${id}/revoke`);
    return response.data;
  },

  reactivateLicense: async (id) => {
    const response = await api.patch(`/licenses/${id}/reactivate`);
    return response.data;
  },
};