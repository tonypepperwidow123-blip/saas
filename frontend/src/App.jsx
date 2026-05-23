/**
 * App.jsx — Authentication Session Manager
 *
 * Supports two login flows:
 *
 * 1. EMAIL/PASSWORD  — Login.jsx calls backend /auth/login, gets token, stores in Zustand
 * 2. GOOGLE OAUTH    — supabase.auth.signInWithOAuth → Google redirect → back here
 *    - Supabase auto-exchanges the code and fires onAuthStateChange (SIGNED_IN)
 *    - We call /auth/me to get the full profile and store it in Zustand
 *    - Brand-new Google users (account < 2 min old) → /select-role
 *    - Existing Google users → straight to their dashboard
 */
import { useEffect, useRef } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';
import { router } from './router';
import { authService } from './services/auth.service';
import { useAuthStore } from './store/auth.store';
import { supabase } from './lib/supabase';

const getDashboardPath = (role) => {
  if (role === 'admin') return '/admin/dashboard';
  if (role === 'developer') return '/developer/dashboard';
  return '/customer/dashboard';
};

const onAuthOrRootPage = () => {
  const p = window.location.pathname;
  return p === '/' || p === '/login' || p === '/register' || p === '/select-role';
};

/**
 * Returns true only if the Supabase user account was created less than
 * 2 minutes ago — meaning this is their very first sign-in ever.
 */
const isNewAccount = (supabaseUser) => {
  if (!supabaseUser?.created_at) return false;
  const ageMs = Date.now() - new Date(supabaseUser.created_at).getTime();
  return ageMs < 120_000; // 2 minutes
};

function App() {
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    /**
     * syncWithBackend — given a valid Supabase access token:
     *  1. Calls /auth/me to get (or auto-create) the backend profile
     *  2. Stores the user + token in Zustand
     *  3. Redirects from auth/root pages to the correct destination:
     *     - Brand-new Google user → /select-role to pick developer | customer
     *     - Everyone else        → their role dashboard
     */
    const syncWithBackend = async (accessToken, supabaseUser = null) => {
      try {
        // Temporarily set only the token so api.js sends the Authorization header.
        // We do NOT call setAuth here to avoid briefly setting isAuthenticated=false
        // which would cause DashboardLayout to flash-redirect to /login.
        useAuthStore.getState().setTokenOnly(accessToken);

        const res = await authService.me();

        if (res?.success && res.data?.user) {
          const user = res.data.user;

          // Detect a brand-new Google OAuth account (< 2 min old).
          // Existing Google users who already have a role must NOT be re-onboarded.
          const isGoogle = supabaseUser?.app_metadata?.provider === 'google';
          const needsOnboarding = isGoogle && isNewAccount(supabaseUser);

          useAuthStore.getState().setAuth(user, accessToken, needsOnboarding);

          // Only redirect when we are on an auth/root page (not inside a dashboard)
          if (onAuthOrRootPage()) {
            if (needsOnboarding) {
              window.location.replace('/select-role');
            } else {
              window.location.replace(getDashboardPath(user.role));
            }
          }
          return true;
        }
      } catch (err) {
        console.error('[Auth] syncWithBackend failed:', err?.response?.data?.error || err.message);
      }

      // /auth/me failed — clear the store so the user can try again
      useAuthStore.getState().logout();
      return false;
    };

    // ── Initial load: try to restore the session ────────────────────────────
    const initSession = async () => {
      const store = useAuthStore.getState();

      // Already have a fully-hydrated user in store → nothing to do
      if (store.user && store.token) return;

      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.access_token) {
          // Supabase has a live session (e.g. Google OAuth callback or refresh)
          if (session.access_token !== store.token) {
            await syncWithBackend(session.access_token, session.user);
          }
          return;
        }
      } catch (err) {
        console.error('[Auth] getSession error:', err.message);
      }

      // No Supabase session — validate any token persisted in Zustand
      const storedToken = store.token;
      if (storedToken) {
        try {
          const res = await authService.me();
          if (res?.success && res.data?.user) {
            store.setAuth(res.data.user, storedToken);
          } else {
            store.logout();
          }
        } catch {
          store.logout();
        }
      }
    };

    initSession();

    // ── Realtime: handle OAuth callback, token refresh, sign-out ────────────
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          useAuthStore.getState().logout();
          return;
        }

        if (session?.access_token) {
          const store = useAuthStore.getState();
          // Only sync when the token actually changed to avoid redundant calls
          if (session.access_token !== store.token) {
            await syncWithBackend(session.access_token, session.user);
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <>
      <RouterProvider router={router} future={{ v7_startTransition: true }} />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
          },
        }}
      />
    </>
  );
}

export default App;