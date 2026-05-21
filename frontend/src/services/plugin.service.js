import api from './api';

export const pluginService = {
  // Public
  getPlugins: async (params = {}) => {
    const response = await api.get('/plugins', { params });
    return response.data;
  },

  getPluginById: async (id) => {
    const response = await api.get(`/plugins/${id}`);
    return response.data;
  },

  // Developer
  getMyPlugins: async (params = {}) => {
    const response = await api.get('/plugins/me/list', { params });
    return response.data;
  },

  createPlugin: async (data) => {
    const response = await api.post('/plugins', data);
    return response.data;
  },

  updatePlugin: async (id, data) => {
    const response = await api.put(`/plugins/${id}`, data);
    return response.data;
  },

  deletePlugin: async (id) => {
    const response = await api.delete(`/plugins/${id}`);
    return response.data;
  },

  uploadVersion: async (id, version, changelog, file) => {
    const formData = new FormData();
    formData.append('version', version);
    formData.append('changelog', changelog || '');
    formData.append('zip', file);

    // Setting Content-Type: undefined explicitly REMOVES the instance-level
    // 'application/json' default that api.js sets on every request.
    // This lets the browser set the correct multipart/form-data boundary
    // automatically — without it, multer can't parse the body and req.file
    // is always undefined (causing the "No ZIP file provided" error).
    const response = await api.post(`/plugins/${id}/versions`, formData, {
      headers: { 'Content-Type': undefined },
    });
    return response.data;
  },

  getVersions: async (id) => {
    const response = await api.get(`/plugins/${id}/versions`);
    return response.data;
  },
};