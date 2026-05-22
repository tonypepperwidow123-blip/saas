// fix: robust OAuth callback handling - no false logouts
import { useEffect, useRef } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';
import { router } from './router';
import { authService } from './services/auth.service';
import { useAuthStore } from './store/auth.store';
import { supabase } from './lib/supabase';

// Helper: which dashboard to go to based on role
const getDashboardPath = (role) => {
  if (role === 'admin') return '/admin/dashboard';
  if (role === 'developer') return '/developer/dashboard';
  return '/customer/dashboard';
};

// Helper: are we on an auth/public page that should be redirected away from?
const shouldRedirect = (path) =>
  path === '/' || path === '/login' || path === '/register';

function App() {
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const syncSession = async (accessToken) => {
      // Temporarily store the token so api.js sends it in the Authorization header
      useAuthStore.getState().setAuth(null, accessToken);
      try {
        const response = await authService.me();
        if (response.success && response.data?.user) {
          const user = response.data.user;
          useAuthStore.getState().setAuth(user, accessToken);
          if (shouldRedirect(window.location.pathname)) {
            window.location.replace(getDashboardPath(user.role));
          }
          return true;
        }
      } catch (err) {
        console.error('syncSession: /auth/me failed:', err);
      }
      // If /auth/me failed, clear the temp token but do NOT signOut
      // (signOut kills the Supabase session and causes a redirect loop)
      useAuthStore.getState().logout();
      return false;
    };

    const checkSession = async () => {
      try {
        // Step 1: Try to get any active Supabase session (covers Google OAuth hash redirect)
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.access_token) {
          const currentToken = useAuthStore.getState().token;
          // Only sync if this is a new/different token
          if (currentToken !== session.access_token) {
            const ok = await syncSession(session.access_token);
            if (ok) return; // Successfully authenticated, stop here
          } else if (useAuthStore.getState().user) {
            // Already authenticated with same token, nothing to do
            return;
          }
        }
      } catch (err) {
        console.error('checkSession: getSession failed:', err);
      }

      // Step 2: Fallback — validate existing persisted token (from email/password login)
      const storedToken = useAuthStore.getState().token;
      if (storedToken && !useAuthStore.getState().user) {
        try {
          const response = await authService.me();
          if (response.success && response.data?.user) {
            useAuthStore.getState().setAuth(response.data.user, storedToken);
          } else {
            useAuthStore.getState().logout();
          }
        } catch (err) {
          // 401 here means the stored token truly expired
          useAuthStore.getState().logout();
        }
      }
    };

    checkSession();

    // Listen for Supabase auth state changes (fires after Google OAuth redirect resolves)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.access_token) {
        const currentToken = useAuthStore.getState().token;
        if (currentToken !== session.access_token) {
          await syncSession(session.access_token);
        }
      } else if (event === 'SIGNED_OUT') {
        useAuthStore.getState().logout();
      }
      // Ignore TOKEN_REFRESHED — supabase manages tokens internally;
      // our backend uses the Supabase JWT directly so no extra work needed
    });

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