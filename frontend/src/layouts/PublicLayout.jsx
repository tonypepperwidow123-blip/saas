import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';

export default function PublicLayout() {
  const { isAuthenticated, role } = useAuthStore();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-bg-base">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b border-border-subtle bg-bg-surface/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
              <span className="text-sm font-bold text-white">PV</span>
            </div>
            <span className="text-lg font-semibold text-text-primary">PluginVault</span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link
              to="/shop"
              className={`text-sm transition-colors ${
                location.pathname === '/shop'
                  ? 'text-accent'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Plugins
            </Link>
            <Link
              to="/pricing"
              className={`text-sm transition-colors ${
                location.pathname === '/pricing'
                  ? 'text-accent'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Pricing
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link
                to={role === 'admin' ? '/admin/dashboard' : role === 'developer' ? '/developer/dashboard' : '/customer/dashboard'}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm text-text-secondary transition-colors hover:text-text-primary"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-border-subtle bg-bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-accent">
                <span className="text-xs font-bold text-white">PV</span>
              </div>
              <span className="text-sm text-text-secondary">PluginVault</span>
            </div>
            <p className="text-sm text-text-muted">
              The marketplace for WordPress plugins
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}