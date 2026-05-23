import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      role: null,
      isAuthenticated: false,
      needsOnboarding: false, // true for new Google OAuth users who haven't selected a role yet

      setAuth: (user, token, needsOnboarding = false) => {
        set({
          user,
          token,
          role: user?.role || 'customer',
          isAuthenticated: !!user,
          needsOnboarding,
        });
      },

      completeOnboarding: (updatedUser) => {
        set({
          user: updatedUser,
          role: updatedUser?.role || 'customer',
          needsOnboarding: false,
        });
      },

      logout: () => {
        set({
          user: null,
          token: null,
          role: null,
          isAuthenticated: false,
          needsOnboarding: false,
        });
      },
    }),
    {
      name: 'pluginvault-auth',
    }
  )
);