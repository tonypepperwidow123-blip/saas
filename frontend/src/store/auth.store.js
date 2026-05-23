import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      role: null,
      isAuthenticated: false,
      needsOnboarding: false,

      /**
       * setTokenOnly — store the access token WITHOUT touching isAuthenticated.
       * Used during session sync so DashboardLayout doesn't see a brief
       * isAuthenticated=false and flash-redirect to /login.
       */
      setTokenOnly: (token) => {
        set({ token });
      },

      /**
       * setAuth — full auth state update (user + token + optional onboarding flag).
       */
      setAuth: (user, token, needsOnboarding = false) => {
        set({
          user,
          token,
          role: user?.role || 'customer',
          isAuthenticated: !!user,
          needsOnboarding,
        });
      },

      /**
       * completeOnboarding — called from SelectRole after the user picks a role.
       * Clears the onboarding flag and updates the user profile.
       */
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