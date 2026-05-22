import { useEffect, useRef } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';
import { router } from './router';
import { authService } from './services/auth.service';
import { useAuthStore } from './store/auth.store';
import { supabase } from './lib/supabase';

function App() {
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const checkSession = async () => {
      try {
        // 1. Check if there is an active Supabase session (e.g. from Google redirect)
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.access_token) {
          const currentToken = useAuthStore.getState().token;
          if (currentToken !== session.access_token) {
            useAuthStore.getState().setAuth(null, session.access_token);
            
            const response = await authService.me();
            if (response.success && response.data?.user) {
              const user = response.data.user;
              useAuthStore.getState().setAuth(user, session.access_token);
              
              let redirectPath = '/customer/dashboard';
              if (user.role === 'admin') redirectPath = '/admin/dashboard';
              else if (user.role === 'developer') redirectPath = '/developer/dashboard';
              
              const currentPath = window.location.pathname;
              if (currentPath === '/' || currentPath === '/login' || currentPath === '/register') {
                window.location.href = redirectPath;
              }
              return;
            }
          }
        }
      } catch (err) {
        console.error('Error checking initial Supabase session:', err);
      }

      // 2. Fallback to normal local stored token check
      const storedToken = useAuthStore.getState().token;
      if (storedToken) {
        try {
          const response = await authService.me();
          if (response.success && response.data?.user) {
            useAuthStore.getState().setAuth(response.data.user, storedToken);
          }
        } catch (err) {
          useAuthStore.getState().logout();
        }
      }
    };

    checkSession();

    // Listen for Supabase auth state changes (e.g. Google OAuth redirect)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.access_token) {
        const currentToken = useAuthStore.getState().token;
        if (currentToken !== session.access_token) {
          try {
            // Set the token temporarily in Zustand store so authService.me() uses it
            useAuthStore.getState().setAuth(null, session.access_token);
            
            const response = await authService.me();
            if (response.success && response.data?.user) {
              const user = response.data.user;
              useAuthStore.getState().setAuth(user, session.access_token);
              
              // Redirect to corresponding dashboard
              let redirectPath = '/customer/dashboard';
              if (user.role === 'admin') redirectPath = '/admin/dashboard';
              else if (user.role === 'developer') redirectPath = '/developer/dashboard';
              
              const currentPath = window.location.pathname;
              if (currentPath === '/' || currentPath === '/login' || currentPath === '/register') {
                window.location.href = redirectPath;
              }
            } else {
              useAuthStore.getState().logout();
              await supabase.auth.signOut();
            }
          } catch (err) {
            console.error('Error syncing Supabase OAuth session with backend:', err);
            useAuthStore.getState().logout();
            await supabase.auth.signOut();
          }
        }
      } else if (event === 'SIGNED_OUT') {
        useAuthStore.getState().logout();
      }
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