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
 *    - User is redirected to their dashboard
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
  return p === '/' || p === '/login' || p === '/register';
};

function App() {
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    /**
     * syncSession: given a Supabase access token, validate it against
     * our backend /auth/me endpoint which:
     *   - verifies the token is genuine (supabaseAdmin.auth.getUser)
     *   - fetches or auto-creates the profile row in public.profiles
     *   - returns the full user object
     *
     * On success → store user+token in Zustand, redirect from auth pages.
     * On failure → clear Zustand only (do NOT call supabase.auth.signOut).
     */
    const syncSession = async (accessToken) => {
      // Temporarily store token so api.js sends it as Authorization header
      useAuthStore.getState().setAuth(null, accessToken);

      try {
        const res = await authService.me();

        if (res?.success && res.data?.user) {
          useAuthStore.getState().setAuth(res.data.user, accessToken);
          if (isAuthPage()) {
            window.location.replace(getDashboardPath(res.data.user.role));
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
            await syncSession(session.access_token);
          }

        } else if (event === 'INITIAL_SESSION') {
          // Page refresh — only sync if we don't already have user data
          if (session?.access_token && !store.user) {
            await syncSession(session.access_token);
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
            store.setAuth(store.user, session.access_token);
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