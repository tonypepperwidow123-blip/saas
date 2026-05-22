import axios from 'axios';
import { useAuthStore } from '../store/auth.store';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── request: attach Bearer token ───────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── response: handle 401 ───────────────────────────────────────────────────
// Only redirect to /login when a fully-authenticated user gets a 401
// (e.g. their token expired mid-session).
//
// We must NOT redirect when:
//  - App.jsx is probing /auth/me during the Google OAuth callback
//    (user object is null at that point, token is temporarily set)
//  - The initial session restore is still in progress
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const state = useAuthStore.getState();
      const wasFullyAuthenticated = !!(state.user && state.token);

      state.logout();

      if (wasFullyAuthenticated) {
        // Small delay so any in-flight React state updates settle
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// ─── helper ─────────────────────────────────────────────────────────────────
export const getErrorMessage = (error) => {
  if (error?.response?.data?.error) return error.response.data.error;
  if (error?.message) return error.message;
  return 'An unexpected error occurred';
};