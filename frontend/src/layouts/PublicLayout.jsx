import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { useState, useEffect } from 'react';

export default function PublicLayout() {
  const { isAuthenticated, role } = useAuthStore();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { to: '/shop',    label: 'Plugins' },
    { to: '/pricing', label: 'Pricing' },
  ];

  const dashPath = role === 'admin' ? '/admin/dashboard' : role === 'developer' ? '/developer/dashboard' : '/customer/dashboard';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column' }}>

      {/* ── Top Navigation ──────────────────────────────────────────── */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        height: '64px',
        background: scrolled ? 'rgba(6,6,8,0.92)' : 'rgba(6,6,8,0.7)',
        backdropFilter: 'blur(24px)',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.07)' : '1px solid transparent',
        transition: 'all 0.3s ease',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
        }}>
          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px', height: '32px',
              borderRadius: '9px',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 12px rgba(245,158,11,0.3)',
            }}>
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#000', fontFamily: 'Syne, sans-serif' }}>PV</span>
            </div>
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: '800', fontSize: '17px', color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
              Plugin<span style={{ color: '#f59e0b' }}>Vault</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '6px' }} className="hidden md:flex">
            {navLinks.map(({ to, label }) => {
              const active = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '500',
                    fontFamily: 'DM Sans, sans-serif',
                    textDecoration: 'none',
                    color: active ? 'var(--accent)' : 'var(--text-secondary)',
                    background: active ? 'var(--accent-dim)' : 'transparent',
                    border: active ? '1px solid var(--border-accent)' : '1px solid transparent',
                    transition: 'all 0.18s ease',
                  }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; }}}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop CTA */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="hidden md:flex">
            {isAuthenticated ? (
              <Link
                to={dashPath}
                style={{
                  padding: '8px 18px',
                  borderRadius: '9px',
                  fontSize: '13px',
                  fontWeight: '600',
                  fontFamily: 'DM Sans, sans-serif',
                  textDecoration: 'none',
                  color: '#000',
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  boxShadow: '0 0 16px rgba(245,158,11,0.3)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 24px rgba(245,158,11,0.45)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 16px rgba(245,158,11,0.3)'; e.currentTarget.style.transform = 'none'; }}
              >
                Dashboard →
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  style={{
                    padding: '7px 16px',
                    borderRadius: '9px',
                    fontSize: '13px',
                    fontWeight: '500',
                    fontFamily: 'DM Sans, sans-serif',
                    textDecoration: 'none',
                    color: 'var(--text-secondary)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    background: 'transparent',
                    transition: 'all 0.18s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  style={{
                    padding: '8px 18px',
                    borderRadius: '9px',
                    fontSize: '13px',
                    fontWeight: '600',
                    fontFamily: 'DM Sans, sans-serif',
                    textDecoration: 'none',
                    color: '#000',
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    boxShadow: '0 0 14px rgba(245,158,11,0.25)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 22px rgba(245,158,11,0.4)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 14px rgba(245,158,11,0.25)'; e.currentTarget.style.transform = 'none'; }}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(o => !o)}
            className="md:hidden"
            style={{
              width: '36px', height: '36px',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <svg style={{ width: '18px', height: '18px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div style={{
            position: 'absolute',
            top: '64px', left: 0, right: 0,
            background: 'rgba(10,10,15,0.98)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            padding: '16px 24px 20px',
            display: 'flex', flexDirection: 'column', gap: '8px',
            animation: 'fade-in 0.2s ease forwards',
          }}>
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  fontFamily: 'DM Sans, sans-serif',
                  color: location.pathname === to ? 'var(--accent)' : 'var(--text-secondary)',
                  background: location.pathname === to ? 'var(--accent-dim)' : 'transparent',
                  textDecoration: 'none',
                }}
              >
                {label}
              </Link>
            ))}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.055)', paddingTop: '12px', marginTop: '4px' }}>
              {isAuthenticated ? (
                <Link to={dashPath} onClick={() => setMobileMenuOpen(false)} style={{ display: 'block', padding: '10px 14px', borderRadius: '8px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#000', fontSize: '14px', fontWeight: '600', fontFamily: 'DM Sans, sans-serif', textDecoration: 'none', textAlign: 'center' }}>
                  Dashboard →
                </Link>
              ) : (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '500', fontFamily: 'DM Sans, sans-serif', textDecoration: 'none', textAlign: 'center' }}>
                    Sign In
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#000', fontSize: '14px', fontWeight: '600', fontFamily: 'DM Sans, sans-serif', textDecoration: 'none', textAlign: 'center' }}>
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ── Page Content ──────────────────────────────────────────────── */}
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.055)',
        background: 'rgba(10,10,15,0.8)',
        backdropFilter: 'blur(10px)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '28px', height: '28px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#000', fontFamily: 'Syne, sans-serif' }}>PV</span>
              </div>
              <div>
                <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: '700', fontSize: '14px', color: 'var(--text-primary)' }}>
                  Plugin<span style={{ color: '#f59e0b' }}>Vault</span>
                </p>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '1px' }}>
                  The premium WordPress plugin marketplace
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              {[{ to: '/shop', label: 'Plugins' }, { to: '/pricing', label: 'Pricing' }, { to: '/login', label: 'Sign In' }].map(({ to, label }) => (
                <Link key={to} to={to} style={{ fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.18s ease' }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; }}>
                  {label}
                </Link>
              ))}
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              © 2026 PluginVault. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}