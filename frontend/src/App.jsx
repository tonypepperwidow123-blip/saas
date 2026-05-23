/**
 * App.jsx — Authentication Session Manager
 *
 * Two login flows this app supports:
 *
 * 1. EMAIL/PASSWORD (via /api/auth/login)
 *    - Login.jsx calls authService.login() → backend returns {user, token}
 *    - Frontend stores user+token in Zustand (persisted to localStorage)
 *    - On page refresh: onAuthStateChange fires INITIAL_SESSION with the
 *      Supabase session → we sync with backend if user not already in store
 *
 * 2. GOOGLE OAUTH (via supabase.auth.signInWithOAuth PKCE)
 *    - User clicks Google button → redirected to Google → comes back
 *    - Supabase exchanges the ?code= param automatically (PKCE)
 *    - onAuthStateChange fires SIGNED_IN with the new session
 *    - We call /api/auth/me with that token → backend auto-creates profile
 *    - NEW USER: no role in Google metadata → redirect to /select-role
 *    - EXISTING USER: role already set → redirect to their dashboard
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

const isAuthPage = () => {
  const p = window.location.pathname;
  return p === '/' || p === '/login' || p === '/register' || p === '/select-role';
};

function App() {
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    /**
     * syncSession: given a Supabase access token + raw Supabase session,
     * validate against our backend /auth/me endpoint which:
     *   - verifies the token is genuine (supabaseAdmin.auth.getUser)
     *   - fetches or auto-creates the profile row in public.profiles
     *   - returns the full user object
     *
     * New Google OAuth users → needsOnboarding = true → redirect to /select-role
     * Existing users → go straight to dashboard
     *
     * On failure → clear Zustand only (do NOT call supabase.auth.signOut).
     */
    const syncSession = async (accessToken, supabaseSession = null) => {
      // Temporarily store token so api.js sends it as Authorization header
      useAuthStore.getState().setAuth(null, accessToken);

      try {
        const res = await authService.me();

        if (res?.success && res.data?.user) {
          const user = res.data.user;

          // Detect if this is a brand-new Google OAuth user who needs to pick a role.
          // Google OAuth users have no `role` in their Supabase user_metadata —
          // the backend auto-assigns 'customer' as default. We flag them as needing
          // onboarding if:
          //   - the Supabase session user_metadata has no explicit `role` field
          //   - AND the Supabase session indicates a new identity (identity_data from Google)
          const isGoogleUser = supabaseSession?.user?.app_metadata?.provider === 'google';
          const hasNoExplicitRole = !supabaseSession?.user?.user_metadata?.role;
          const needsOnboarding = isGoogleUser && hasNoExplicitRole;

          useAuthStore.getState().setAuth(user, accessToken, needsOnboarding);

          if (isAuthPage()) {
            if (needsOnboarding) {
              window.location.replace('/select-role');
            } else {
              window.location.replace(getDashboardPath(user.role));
            }
          }
          return true;
        }
      } catch (err) {
        console.error('[Auth] /me failed:', err?.response?.data?.error || err.message);
      }

      // Failed — remove temp token from store but keep Supabase session alive
      useAuthStore.getState().logout();
      return false;
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const store = useAuthStore.getState();

        if (event === 'SIGNED_IN') {
          // Google OAuth callback (PKCE) — always sync
          if (session?.access_token && session.access_token !== store.token) {
            await syncSession(session.access_token, session);
          }

        } else if (event === 'INITIAL_SESSION') {
          // Page refresh — only sync if we don't already have user data
          if (session?.access_token && !store.user) {
            await syncSession(session.access_token, session);
          } else if (!session && store.token) {
            // No Supabase session but we have a stored token → validate it
            try {
              const res = await authService.me();
              if (res?.success && res.data?.user) {
                store.setAuth(res.data.user, store.token);
              } else {
                store.logout();
              }
            } catch {
              store.logout();
            }
          }

        } else if (event === 'TOKEN_REFRESHED' && session?.access_token) {
          // Silently update the token without re-fetching the profile
          if (store.user) {
            store.setAuth(store.user, session.access_token, store.needsOnboarding);
          }

        } else if (event === 'SIGNED_OUT') {
          store.logout();
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