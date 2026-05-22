// Google OAuth + email/password session handler — clean PKCE flow
import { useEffect, useRef } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner'  ;
import { router } from './router';
import { authService } from './services/auth.service';
import { useAuthStore } from './store/auth.store';
import { supabase } from './lib/supabase';

// ─── helpers ────────────────────────────────────────────────────────────────

const getDashboardPath = (role) => {
  if (role === 'admin') return '/admin/dashboard';
  if (role === 'developer') return '/developer/dashboard';
  return '/customer/dashboard';
};

const isAuthPage = (path) =>
  path === '/' || path === '/login' || path === '/register';

// ─── app ────────────────────────────────────────────────────────────────────

function App() {
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    /**
     * syncSession
     * -----------
     * Given a valid Supabase access_token, call our backend /auth/me to
     * fetch the profile (and auto-create it if it was a first Google login).
     * Sets Zustand state and redirects to the correct dashboard.
     *
     * IMPORTANT: We do NOT call supabase.auth.signOut() on failure here.
     * Calling signOut() would kill the session we just received and create
     * a redirect loop. We only clear the Zustand store.
     */
    const syncSession = async (accessToken) => {
      // Put the token in Zustand so api.js attaches it to Authorization header
      useAuthStore.getState().setAuth(null, accessToken);

      try {
        const response = await authService.me();

        if (response?.success && response.data?.user) {
          const user = response.data.user;
          useAuthStore.getState().setAuth(user, accessToken);

          // Only redirect away from public/auth pages
          if (isAuthPage(window.location.pathname)) {
            window.location.replace(getDashboardPath(user.role));
          }
          return true;
        }
      } catch (err) {
        console.error('[PluginVault] syncSession /auth/me error:', err?.response?.data || err.message);
      }

      // /auth/me failed — clear temp token but leave Supabase session intact
      useAuthStore.getState().logout();
      return false;
    };

    /**
     * onAuthStateChange listener
     * --------------------------
     * With PKCE flow, Supabase automatically exchanges the ?code= param
     * and fires SIGNED_IN once the exchange is complete. This is the main
     * entry point for Google OAuth logins.
     *
     * We also handle INITIAL_SESSION here to restore email/password sessions
     * that were persisted in localStorage from a previous login.
     */
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.access_token) {
          const currentToken = useAuthStore.getState().token;
          // Avoid duplicate syncs when the token hasn't changed
          if (currentToken !== session.access_token) {
            await syncSession(session.access_token);
          }

        } else if (event === 'INITIAL_SESSION' && session?.access_token) {
          // Restoring a persisted session (e.g. page refresh after email login)
          const alreadyLoaded = !!useAuthStore.getState().user;
          if (!alreadyLoaded) {
            await syncSession(session.access_token);
          }

        } else if (event === 'TOKEN_REFRESHED' && session?.access_token) {
          // Supabase refreshed the JWT silently — update the stored token
          // so the next api.js request uses the new one, but don't re-fetch /me
          const state = useAuthStore.getState();
          if (state.user) {
            state.setAuth(state.user, session.access_token);
          }

        } else if (event === 'SIGNED_OUT') {
          useAuthStore.getState().logout();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
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