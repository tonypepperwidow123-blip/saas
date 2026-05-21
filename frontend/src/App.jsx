import { useEffect, useRef } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';
import { router } from './router';
import { authService } from './services/auth.service';
import { useAuthStore } from './store/auth.store';

function App() {
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const checkSession = async () => {
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