/**
 * App.jsx — Authentication Session Manager
 *
 * Three session sources handled in priority order:
 *
 * 1. URL hash   — #access_token=ey... (Google OAuth implicit flow callback)
 *                 Extract the token directly and validate via our backend.
 *                 This bypasses the Supabase client's auth/v1/user call
 *                 (which can fail with 401 in some deploy configs).
 *
 * 2. Supabase session — getSession() returns a live Supabase session
 *                 (PKCE flow or stored session from previous login)
 *
 * 3. Zustand store — a token persisted from a previous email/password login
 *
 * For all cases: validate by calling our backend /auth/me (service-role backed).
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
 * True only if the Supabase account was created < 2 minutes ago.
 * Used to detect a brand-new Google OAuth user who needs to pick a role.
 */
const isNewAccount = (supabaseUser) => {
  if (!supabaseUser?.created_at) return false;
  const ageMs = Date.now() - new Date(supabaseUser.created_at).getTime();
  return ageMs < 120_000; // 2 minutes
};

/**
 * Parse URL hash string like "#access_token=ey...&token_type=bearer&..."
 * Returns null if no access_token is found.
 */
const extractTokenFromHash = () => {
  const hash = window.location.hash;
  if (!hash || !hash.includes('access_token')) return null;
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  return params.get('access_token') || null;
};

function App() {
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    /**
     * syncWithBackend — validates an access token via our backend /auth/me
     * (which uses supabaseAdmin.auth.getUser — service-role key — so it works
     *  even when the Supabase client-side validation returns 401).
     */
    const syncWithBackend = async (accessToken, supabaseUser = null) => {
      try {
        useAuthStore.getState().setTokenOnly(accessToken);

        const res = await authService.me();

        if (res?.success && res.data?.user) {
          const user = res.data.user;

          // New Google OAuth account (< 2 min old) → must pick developer | customer
          const isGoogle =
            supabaseUser?.app_metadata?.provider === 'google' ||
            supabaseUser?.identities?.some((i) => i.provider === 'google');
          const needsOnboarding = isGoogle && isNewAccount(supabaseUser);

          useAuthStore.getState().setAuth(user, accessToken, needsOnboarding);

          if (onAuthOrRootPage()) {
            // Clean the URL hash so it doesn't show raw tokens in the address bar
            if (window.location.hash.includes('access_token')) {
              window.history.replaceState(null, '', window.location.pathname);
            }
            window.location.replace(
              needsOnboarding ? '/select-role' : getDashboardPath(user.role)
            );
          }
          return true;
        }
      } catch (err) {
        console.error(
          '[Auth] syncWithBackend failed:',
          err?.response?.data?.error || err.message
        );
      }

      useAuthStore.getState().logout();
      return false;
    };

    // ── Session bootstrap ─────────────────────────────────────────────────────
    const initSession = async () => {
      const store = useAuthStore.getState();

      // Already have a hydrated user → nothing to do
      if (store.user && store.token) return;

      // ── Priority 1: URL hash has #access_token (Google OAuth implicit flow) ─
      const hashToken = extractTokenFromHash();
      if (hashToken) {
        console.log('[Auth] Detected #access_token in URL hash — syncing…');
        // Try to get the full Supabase user object (may fail, that's OK)
        let supabaseUser = null;
        try {
          const { data } = await supabase.auth.getUser(hashToken);
          supabaseUser = data?.user ?? null;
        } catch (_) {
          // Ignore — backend will validate
        }
        await syncWithBackend(hashToken, supabaseUser);
        return;
      }

      // ── Priority 2: Supabase already has a session (PKCE or persisted) ──────
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token && session.access_token !== store.token) {
          await syncWithBackend(session.access_token, session.user);
          return;
        }
      } catch (err) {
        console.error('[Auth] getSession error:', err.message);
      }

      // ── Priority 3: Token persisted in Zustand from email/password login ────
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

    // ── Realtime listener (token refresh, sign-out, PKCE SIGNED_IN) ───────────
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          useAuthStore.getState().logout();
          return;
        }

        if (session?.access_token) {
          const store = useAuthStore.getState();
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