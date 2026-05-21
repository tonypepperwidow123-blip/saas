import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      role: null,
      isAuthenticated: false,

      setAuth: (user, token) => {
        set({
          user,
          token,
          role: user?.role || 'customer',
          isAuthenticated: !!user,
        });
      },

      logout: () => {
        set({
          user: null,
          token: null,
          role: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'pluginvault-auth',
    }
  )
);