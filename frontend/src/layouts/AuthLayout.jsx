import { Outlet, Link, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';

export default function AuthLayout() {
  const { isAuthenticated, role, needsOnboarding } = useAuthStore();

  if (isAuthenticated && needsOnboarding) return <Navigate to="/select-role" replace />;
  if (isAuthenticated && role)           return <Navigate to={`/${role}/dashboard`} replace />;

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 16px',
      position: 'relative',
      overflow: 'hidden',
      background: 'var(--bg-base)',
    }}>
      {/* Ambient orbs */}
      <div className="orb-amber" style={{
        position: 'absolute', width: '500px', height: '500px',
        top: '-20%', left: '-15%',
        animation: 'orb-drift 12s ease-in-out infinite',
        opacity: 0.7,
      }} />
      <div className="orb-cyan" style={{
        position: 'absolute', width: '400px', height: '400px',
        bottom: '-15%', right: '-10%',
        animation: 'orb-drift 16s ease-in-out infinite reverse',
        opacity: 0.6,
      }} />
      <div className="orb-amber" style={{
        position: 'absolute', width: '200px', height: '200px',
        top: '60%', left: '55%',
        animation: 'orb-drift 20s ease-in-out infinite',
        opacity: 0.3,
      }} />

      {/* Grain overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.04\'/%3E%3C/svg%3E")',
        pointerEvents: 'none',
        opacity: 0.6,
      }} />

      <div style={{ position: 'relative', width: '100%', maxWidth: '440px', animation: 'scale-in 0.35s ease forwards' }}>
        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '28px' }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '44px', height: '44px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 20px rgba(245,158,11,0.4), 0 4px 16px rgba(0,0,0,0.3)',
            }}>
              <span style={{ fontSize: '16px', fontWeight: '800', color: '#000', fontFamily: 'Syne, sans-serif' }}>PV</span>
            </div>
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: '800', fontSize: '20px', color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
              Plugin<span style={{ color: '#f59e0b' }}>Vault</span>
            </span>
          </Link>
        </div>

        {/* Glass card */}
        <div style={{
          borderRadius: '20px',
          border: '1px solid rgba(255,255,255,0.08)',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)',
          backdropFilter: 'blur(24px)',
          padding: '36px 32px',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07), 0 8px 40px rgba(0,0,0,0.5)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Top accent line */}
          <div style={{
            position: 'absolute', top: 0, left: '10%', right: '10%',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.6), transparent)',
          }} />

          <Outlet />
        </div>

        <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
          By continuing, you agree to our{' '}
          <span style={{ color: 'var(--text-secondary)', cursor: 'pointer' }}>Terms</span> &{' '}
          <span style={{ color: 'var(--text-secondary)', cursor: 'pointer' }}>Privacy Policy</span>
        </p>
      </div>
    </div>
  );
}