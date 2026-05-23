import { useState } from 'react';
import { Outlet, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { useUIStore } from '../store/ui.store';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';

const developerNav = [
  { label: 'Dashboard', path: '/developer/dashboard', icon: 'grid' },
  { label: 'My Plugins', path: '/developer/plugins', icon: 'package' },
  { label: 'Upload Plugin', path: '/developer/upload', icon: 'upload' },
  { label: 'Customers', path: '/developer/customers', icon: 'users' },
  { label: 'Licenses', path: '/developer/licenses', icon: 'key' },
  { label: 'Analytics', path: '/developer/analytics', icon: 'chart' },
  { label: 'Revenue', path: '/developer/revenue', icon: 'dollar' },
  { label: 'My Plan', path: '/developer/plan', icon: 'shield' },
  { label: 'Settings', path: '/developer/settings', icon: 'settings' },
];

const customerNav = [
  { label: 'Dashboard', path: '/customer/dashboard', icon: 'grid' },
  { label: 'My Downloads', path: '/customer/downloads', icon: 'download' },
  { label: 'My Licenses', path: '/customer/licenses', icon: 'key' },
  { label: 'Orders', path: '/customer/orders', icon: 'receipt' },
  { label: 'Settings', path: '/customer/settings', icon: 'settings' },
];

const adminNav = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: 'grid' },
  { label: 'Users', path: '/admin/users', icon: 'users' },
  { label: 'Admins', path: '/admin/admins', icon: 'shield' },
  { label: 'Developers', path: '/admin/developers', icon: 'code' },
  { label: 'Customers', path: '/admin/customers', icon: 'users' },
  { label: 'Plugins', path: '/admin/plugins', icon: 'package' },
  { label: 'Pending Approvals', path: '/admin/pending-approvals', icon: 'clock' },
  { label: 'Licenses', path: '/admin/licenses', icon: 'key' },
  { label: 'Revenue', path: '/admin/revenue', icon: 'dollar' },
  { label: 'Transactions', path: '/admin/transactions', icon: 'receipt' },
  { label: 'Analytics', path: '/admin/analytics', icon: 'chart' },
  { label: 'Settings', path: '/admin/settings', icon: 'settings' },
];

const icons = {
  grid: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  code: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  ),
  dollar: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  receipt: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  package: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  upload: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
  ),
  key: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
    </svg>
  ),
  users: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 110 8 4 4 0 010-8z" />
    </svg>
  ),
  clock: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  chart: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  settings: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  download: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  ),
  logout: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
  shield: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
};

export default function DashboardLayout() {
  const { user, role, logout, isAuthenticated, needsOnboarding } = useAuthStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  // Global Auth Guard
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Onboarding Guard: new Google OAuth users must complete role setup first
  if (needsOnboarding) {
    return <Navigate to="/select-role" replace />;
  }

  // Role-Based Route Guard
  if (location.pathname.startsWith('/admin') && role !== 'admin') {
    return <Navigate to={`/${role}/dashboard`} replace />;
  }
  if (location.pathname.startsWith('/developer') && role !== 'developer') {
    return <Navigate to={`/${role}/dashboard`} replace />;
  }
  if (location.pathname.startsWith('/customer') && role !== 'customer') {
    return <Navigate to={`/${role}/dashboard`} replace />;
  }

  const navItems = role === 'admin' ? adminNav : role === 'developer' ? developerNav : customerNav;

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await supabase.auth.signOut();
    } catch (e) {
      // Ignore logout errors
    }
    logout();
    toast.success('Logged out successfully');
    navigate('/login', { replace: true });
  };

  const roleLabel = role === 'admin' ? 'Admin' : role === 'developer' ? 'Developer' : 'Customer';

  return (
    <div className="flex min-h-screen bg-bg-base overflow-x-hidden">
      {/* Mobile Sidebar Backdrop Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border-subtle bg-bg-surface transition-all duration-300 
          ${sidebarOpen 
            ? 'translate-x-0 w-64' 
            : '-translate-x-full md:translate-x-0 md:w-20 w-64'
          }`}
      >
        {/* Logo and toggle */}
        <div className="flex h-16 items-center justify-between border-b border-border-subtle px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
              <span className="text-sm font-bold text-white">PV</span>
            </div>
            {/* Show label if sidebar is open OR on mobile where sidebar is always w-64 when active */}
            {(sidebarOpen || window.innerWidth < 768) && (
              <span className="text-lg font-semibold text-text-primary">PluginVault</span>
            )}
          </Link>
          <button
            onClick={toggleSidebar}
            className="rounded-lg p-2 text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => {
                  // Auto close sidebar on mobile navigation
                  if (window.innerWidth < 768) {
                    toggleSidebar();
                  }
                }}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-accent text-white'
                    : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary'
                }`}
              >
                <span className="flex-shrink-0">{icons[item.icon]}</span>
                {(sidebarOpen || window.innerWidth < 768) && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User profile footer */}
        <div className="border-t border-border-subtle p-4">
          <div className={`flex items-center ${(sidebarOpen || window.innerWidth < 768) ? 'justify-between' : 'justify-center'}`}>
            <div className={`flex items-center gap-3 ${!(sidebarOpen || window.innerWidth < 768) && 'flex-col'}`}>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent">
                <span className="text-sm font-medium text-white">{user?.name?.charAt(0)?.toUpperCase()}</span>
              </div>
              {(sidebarOpen || window.innerWidth < 768) && (
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-text-primary">{user?.name}</p>
                  <p className="text-xs text-text-muted">{roleLabel}</p>
                </div>
              )}
            </div>
            {(sidebarOpen || window.innerWidth < 768) && (
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="rounded-lg p-2 text-text-secondary hover:bg-bg-elevated hover:text-danger animate-pulse"
                title="Logout"
              >
                {icons.logout}
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Layout Container */}
      <div 
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ml-0 
          ${sidebarOpen 
            ? 'md:ml-64' 
            : 'md:ml-20'
          }`}
      >
        {/* Top Header Navigation */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border-subtle bg-bg-surface/95 px-4 md:px-6 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger menu toggle */}
            <button
              onClick={toggleSidebar}
              className="rounded-lg p-2 text-text-secondary hover:bg-bg-elevated hover:text-text-primary md:hidden"
              aria-label="Toggle Sidebar"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <h1 className="text-base md:text-lg font-semibold text-text-primary capitalize">
              {role} Portal
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="rounded-lg p-2 text-text-secondary hover:bg-bg-elevated hover:text-text-primary">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
          </div>
        </header>

        {/* Page Main Content Area */}
        <main className="flex-1 p-4 md:p-6 max-w-full overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}