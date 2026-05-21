import { Outlet, Link, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';

export default function AuthLayout() {
  const { isAuthenticated, role } = useAuthStore();

  if (isAuthenticated && role) {
    return <Navigate to={`/${role}/dashboard`} replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-base px-4 py-12">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 h-full w-full rounded-full bg-accent/5" />
        <div className="absolute -bottom-1/2 -right-1/2 h-full w-full rounded-full bg-accent/5" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent">
              <span className="text-lg font-bold text-white">PV</span>
            </div>
          </Link>
        </div>

        <div className="rounded-2xl border border-border-subtle bg-bg-card p-8 shadow-xl">
          <Outlet />
        </div>

        <p className="mt-6 text-center text-sm text-text-muted">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}