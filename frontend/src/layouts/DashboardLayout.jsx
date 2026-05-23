import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { useUIStore } from '../store/ui.store';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';

const developerNav = [
  { label: 'Dashboard',     path: '/developer/dashboard', icon: 'grid' },
  { label: 'My Plugins',    path: '/developer/plugins',   icon: 'package' },
  { label: 'Upload Plugin', path: '/developer/upload',    icon: 'upload' },
  { label: 'Customers',     path: '/developer/customers', icon: 'users' },
  { label: 'Licenses',      path: '/developer/licenses',  icon: 'key' },
  { label: 'Analytics',     path: '/developer/analytics', icon: 'chart' },
  { label: 'Revenue',       path: '/developer/revenue',   icon: 'dollar' },
  { label: 'My Plan',       path: '/developer/plan',      icon: 'shield' },
  { label: 'Settings',      path: '/developer/settings',  icon: 'settings' },
];

const customerNav = [
  { label: 'Dashboard',    path: '/customer/dashboard', icon: 'grid' },
  { label: 'My Downloads', path: '/customer/downloads', icon: 'download' },
  { label: 'My Licenses',  path: '/customer/licenses',  icon: 'key' },
  { label: 'Orders',       path: '/customer/orders',    icon: 'receipt' },
  { label: 'Settings',     path: '/customer/settings',  icon: 'settings' },
];

const adminNav = [
  { label: 'Dashboard',        path: '/admin/dashboard',         icon: 'grid' },
  { label: 'Users',            path: '/admin/users',             icon: 'users' },
  { label: 'Admins',           path: '/admin/admins',            icon: 'shield' },
  { label: 'Developers',       path: '/admin/developers',        icon: 'code' },
  { label: 'Customers',        path: '/admin/customers',         icon: 'users' },
  { label: 'Plugins',          path: '/admin/plugins',           icon: 'package' },
  { label: 'Pending Approvals',path: '/admin/pending-approvals', icon: 'clock' },
  { label: 'Licenses',         path: '/admin/licenses',          icon: 'key' },
  { label: 'Revenue',          path: '/admin/revenue',           icon: 'dollar' },
  { label: 'Transactions',     path: '/admin/transactions',      icon: 'receipt' },
  { label: 'Analytics',        path: '/admin/analytics',         icon: 'chart' },
  { label: 'Settings',         path: '/admin/settings',          icon: 'settings' },
];

const icons = {
  grid: (
    <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  code: (
    <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  ),
  dollar: (
    <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  receipt: (
    <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  package: (
    <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  upload: (
    <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
  ),
  key: (
    <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
    </svg>
  ),
  users: (
    <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 110 8 4 4 0 010-8z" />
    </svg>
  ),
  clock: (
    <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  chart: (
    <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  settings: (
    <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  download: (
    <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  ),
  logout: (
    <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
  shield: (
    <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  bell: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ),
  menu: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 6h16M4 12h16M4 18h7" />
    </svg>
  ),
  chevronLeft: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  ),
};

const roleColors = {
  admin:     { label: 'Admin',     dot: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  text: '#f59e0b' },
  developer: { label: 'Developer', dot: '#06b6d4', bg: 'rgba(6,182,212,0.12)',   text: '#06b6d4' },
  customer:  { label: 'Customer',  dot: '#10b981', bg: 'rgba(16,185,129,0.12)',  text: '#10b981' },
};

export default function DashboardLayout() {
  const { user, role, logout, isAuthenticated, needsOnboarding } = useAuthStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Global Auth Guard
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;

  // Onboarding Guard
  if (needsOnboarding) return <Navigate to="/select-role" replace />;

  // Role-Based Route Guard
  if (location.pathname.startsWith('/admin')     && role !== 'admin')     return <Navigate to={`/${role}/dashboard`} replace />;
  if (location.pathname.startsWith('/developer') && role !== 'developer') return <Navigate to={`/${role}/dashboard`} replace />;
  if (location.pathname.startsWith('/customer')  && role !== 'customer')  return <Navigate to={`/${role}/dashboard`} replace />;

  const navItems = role === 'admin' ? adminNav : role === 'developer' ? developerNav : customerNav;
  const rc = roleColors[role] || roleColors.customer;
  const isExpanded = isMobile ? sidebarOpen : sidebarOpen;

  const handleLogout = async () => {
    setLoggingOut(true);
    try { await supabase.auth.signOut(); } catch (e) { /* ignore */ }
    logout();
    toast.success('Logged out successfully');
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex min-h-screen overflow-x-hidden" style={{ background: 'var(--bg-base)' }}>

      {/* ── Mobile Backdrop ──────────────────────────────────────────── */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
          style={{ transition: 'opacity 0.3s ease' }}
          onClick={toggleSidebar}
        />
      )}

      {/* ── Sidebar ──────────────────────────────────────────────────── */}
      <aside
        style={{
          position: 'fixed',
          insetBlock: 0,
          left: 0,
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          width: (isMobile ? sidebarOpen : sidebarOpen) ? '240px' : (isMobile ? '0px' : '64px'),
          overflow: 'hidden',
          transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)',
          background: 'rgba(10,10,15,0.97)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(255,255,255,0.055)',
          boxShadow: '4px 0 24px rgba(0,0,0,0.4)',
          transform: isMobile && !sidebarOpen ? 'translateX(-100%)' : 'translateX(0)',
        }}
      >
        {/* Logo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          height: '60px',
          padding: '0 14px',
          borderBottom: '1px solid rgba(255,255,255,0.055)',
          gap: '10px',
          flexShrink: 0,
        }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            {/* Amber logo mark */}
            <div style={{
              width: '32px', height: '32px',
              borderRadius: '9px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 0 12px rgba(245,158,11,0.35)',
            }}>
              <span style={{ fontSize: '13px', fontWeight: '800', color: '#000', fontFamily: 'Syne, sans-serif' }}>PV</span>
            </div>
            {isExpanded && (
              <span style={{
                fontFamily: 'Syne, sans-serif',
                fontWeight: '800',
                fontSize: '16px',
                color: '#f0f0f5',
                whiteSpace: 'nowrap',
                letterSpacing: '-0.03em',
              }}>
                Plugin<span style={{ color: '#f59e0b' }}>Vault</span>
              </span>
            )}
          </Link>
        </div>

        {/* Nav role indicator */}
        {isExpanded && (
          <div style={{ padding: '10px 14px 4px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '20px',
              background: rc.bg,
              border: `1px solid ${rc.dot}33`,
            }}>
              <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: rc.dot, boxShadow: `0 0 6px ${rc.dot}` }} />
              <span style={{ fontSize: '11px', fontWeight: '600', color: rc.text, fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.04em' }}>
                {rc.label} Portal
              </span>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => { if (isMobile) toggleSidebar(); }}
                className={`sidebar-item${isActive ? ' active' : ''}`}
                title={!isExpanded ? item.label : undefined}
                style={{ justifyContent: isExpanded ? 'flex-start' : 'center' }}
              >
                {icons[item.icon]}
                {isExpanded && <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar toggle button (desktop only) */}
        {!isMobile && (
          <div style={{ padding: '8px 10px', borderTop: '1px solid rgba(255,255,255,0.055)' }}>
            <button
              onClick={toggleSidebar}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: isExpanded ? 'flex-start' : 'center',
                gap: '8px',
                padding: '8px 10px',
                borderRadius: '10px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '13px',
                fontFamily: 'DM Sans, sans-serif',
                transition: 'all 0.18s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
            >
              <svg style={{ width: '14px', height: '14px', flexShrink: 0, transform: isExpanded ? 'none' : 'rotate(180deg)', transition: 'transform 0.3s ease' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {isExpanded && <span style={{ whiteSpace: 'nowrap' }}>Collapse</span>}
            </button>
          </div>
        )}

        {/* User profile */}
        <div style={{
          padding: '12px 10px',
          borderTop: '1px solid rgba(255,255,255,0.055)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: isExpanded ? 'space-between' : 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
              {/* Avatar */}
              <div style={{
                width: '32px', height: '32px',
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${rc.dot}33, ${rc.dot}11)`,
                border: `1.5px solid ${rc.dot}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                color: rc.text,
                fontSize: '13px',
                fontWeight: '700',
                fontFamily: 'Syne, sans-serif',
              }}>
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              {isExpanded && (
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user?.name}
                  </p>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {user?.email?.split('@')[0]}
                  </p>
                </div>
              )}
            </div>
            {isExpanded && (
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                title="Logout"
                style={{
                  flexShrink: 0,
                  width: '30px', height: '30px',
                  borderRadius: '8px',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.06)',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.18s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(244,63,94,0.1)'; e.currentTarget.style.color = '#f43f5e'; e.currentTarget.style.borderColor = 'rgba(244,63,94,0.3)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
              >
                {icons.logout}
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        marginLeft: isMobile ? '0' : (sidebarOpen ? '240px' : '64px'),
        transition: 'margin-left 0.3s cubic-bezier(0.4,0,0.2,1)',
      }}>
        {/* Top Header */}
        <header style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          background: 'rgba(10,10,15,0.85)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.055)',
          gap: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Mobile hamburger */}
            <button
              onClick={toggleSidebar}
              className="md:hidden"
              style={{
                width: '34px', height: '34px',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.18s ease',
              }}
              aria-label="Toggle Sidebar"
            >
              {icons.menu}
            </button>

            {/* Breadcrumb / Page title area */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '4px', height: '16px',
                borderRadius: '2px',
                background: 'var(--accent)',
                boxShadow: '0 0 8px rgba(245,158,11,0.5)',
              }} />
              <h1 style={{
                fontFamily: 'Syne, sans-serif',
                fontWeight: '700',
                fontSize: '15px',
                color: 'var(--text-primary)',
                textTransform: 'capitalize',
                letterSpacing: '-0.01em',
              }}>
                {role} Portal
              </h1>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Notifications */}
            <button
              style={{
                width: '34px', height: '34px',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.18s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.08)'; e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.borderColor = 'rgba(245,158,11,0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
            >
              {icons.bell}
            </button>

            {/* User chip */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 10px 4px 4px',
              borderRadius: '20px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{
                width: '26px', height: '26px',
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${rc.dot}44, ${rc.dot}11)`,
                border: `1.5px solid ${rc.dot}55`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px',
                fontWeight: '700',
                color: rc.text,
                fontFamily: 'Syne, sans-serif',
              }}>
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', fontWeight: '500', display: window.innerWidth < 480 ? 'none' : 'block' }}>
                {user?.name?.split(' ')[0]}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, padding: '24px 20px', maxWidth: '100%', overflowX: 'hidden' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}