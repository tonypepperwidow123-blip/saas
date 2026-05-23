import { Link } from 'react-router-dom';

const features = [
  {
    icon: '🔑',
    title: 'License Management',
    description: 'Generate secure license keys, control activation limits, and manage licenses across all your customers.',
  },
  {
    icon: '⚡',
    title: 'Automatic Updates',
    description: 'WordPress plugins built on PluginVault receive updates directly from your hosted files — no manual uploads.',
  },
  {
    icon: '🔒',
    title: 'Secure Delivery',
    description: 'Plugin ZIPs are stored in private storage with time-limited signed URLs. No public access.',
  },
  {
    icon: '✅',
    title: 'Admin Moderation',
    description: 'Every plugin goes through approval before appearing in the marketplace. Quality guaranteed.',
  },
  {
    icon: '📊',
    title: 'Developer Analytics',
    description: 'Track downloads, activations, and revenue for each plugin with detailed charts.',
  },
  {
    icon: '🛍️',
    title: 'Customer Portal',
    description: 'Customers get a unified dashboard to manage all their plugin licenses and activations.',
  },
];

const stats = [
  { label: 'Plugins Available', value: '200+' },
  { label: 'Active Developers', value: '80+' },
  { label: 'Licenses Issued', value: '2K+' },
];

export default function Home() {
  return (
    <div style={{ overflow: 'hidden' }}>

      {/* ── HERO ───────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', padding: '100px 24px 80px', overflow: 'hidden' }}>
        {/* Ambient glow */}
        <div style={{
          position: 'absolute', width: '600px', height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 65%)',
          top: '-200px', left: '50%', transform: 'translateX(-50%)',
          filter: 'blur(30px)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', width: '400px', height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 65%)',
          bottom: '-100px', right: '-100px',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          {/* Eyebrow tag */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '5px 14px',
            borderRadius: '20px',
            background: 'rgba(245,158,11,0.1)',
            border: '1px solid rgba(245,158,11,0.25)',
            marginBottom: '28px',
            animation: 'fade-in 0.5s ease forwards',
          }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f59e0b', boxShadow: '0 0 8px rgba(245,158,11,0.8)', animation: 'glow-pulse 2s ease-in-out infinite' }} />
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#f59e0b', fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.04em' }}>
              The WordPress Plugin Marketplace
            </span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily: 'Syne, sans-serif',
            fontWeight: '800',
            fontSize: 'clamp(36px, 6vw, 68px)',
            lineHeight: '1.0',
            letterSpacing: '-0.04em',
            color: 'var(--text-primary)',
            marginBottom: '24px',
            animation: 'fade-in 0.5s 0.1s ease forwards',
            opacity: 0,
          }}>
            Sell. License. Update.
            <br />
            <span style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #fde68a 50%, #06b6d4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              WordPress Plugins.
            </span>
          </h1>

          {/* Subheadline */}
          <p style={{
            maxWidth: '540px',
            margin: '0 auto 40px',
            fontSize: '17px',
            lineHeight: '1.7',
            color: 'var(--text-secondary)',
            fontFamily: 'DM Sans, sans-serif',
            animation: 'fade-in 0.5s 0.2s ease forwards',
            opacity: 0,
          }}>
            PluginVault gives WordPress developers a reliable, self-hosted infrastructure to sell, license, and auto-deliver plugin updates.
          </p>

          {/* CTAs */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '12px',
            flexWrap: 'wrap',
            animation: 'fade-in 0.5s 0.3s ease forwards',
            opacity: 0,
          }}>
            <Link
              to="/register"
              style={{
                padding: '13px 28px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: '#000',
                fontSize: '14px',
                fontWeight: '700',
                fontFamily: 'DM Sans, sans-serif',
                textDecoration: 'none',
                boxShadow: '0 0 24px rgba(245,158,11,0.35), 0 4px 16px rgba(0,0,0,0.3)',
                transition: 'all 0.2s ease',
                display: 'inline-flex', alignItems: 'center', gap: '6px',
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 36px rgba(245,158,11,0.5), 0 8px 24px rgba(0,0,0,0.4)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 24px rgba(245,158,11,0.35), 0 4px 16px rgba(0,0,0,0.3)'; e.currentTarget.style.transform = 'none'; }}
            >
              Start for Free
              <svg style={{ width: '14px', height: '14px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              to="/shop"
              style={{
                padding: '13px 28px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'var(--text-primary)',
                fontSize: '14px',
                fontWeight: '600',
                fontFamily: 'DM Sans, sans-serif',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(245,158,11,0.3)'; e.currentTarget.style.background = 'rgba(245,158,11,0.06)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
            >
              Browse Plugins
            </Link>
          </div>

          {/* Stats strip */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '40px',
            marginTop: '56px',
            flexWrap: 'wrap',
            animation: 'fade-in 0.5s 0.4s ease forwards',
            opacity: 0,
          }}>
            {stats.map(({ label, value }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: '800', fontSize: '28px', color: 'var(--accent)', letterSpacing: '-0.04em' }}>{value}</p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif', marginTop: '2px' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────────────────────── */}
      <section style={{ padding: '80px 24px', borderTop: '1px solid rgba(255,255,255,0.055)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <h2 style={{
              fontFamily: 'Syne, sans-serif',
              fontWeight: '800',
              fontSize: 'clamp(28px, 4vw, 44px)',
              letterSpacing: '-0.04em',
              color: 'var(--text-primary)',
              marginBottom: '14px',
            }}>
              Built for developers,
              <br />
              <span style={{ color: 'var(--accent)' }}>designed for scale</span>
            </h2>
            <p style={{ fontSize: '15px', color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', maxWidth: '400px', margin: '0 auto' }}>
              Everything you need to monetize your WordPress plugins
            </p>
          </div>

          <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
            {features.map((feature, index) => (
              <div
                key={index}
                style={{
                  borderRadius: '16px',
                  border: '1px solid rgba(255,255,255,0.055)',
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0.01) 100%)',
                  padding: '28px',
                  transition: 'all 0.25s ease',
                  cursor: 'default',
                  animationDelay: `${index * 0.07}s`,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(245,158,11,0.2)';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.3), 0 0 20px rgba(245,158,11,0.08)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.055)';
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  width: '44px', height: '44px',
                  borderRadius: '12px',
                  background: 'rgba(245,158,11,0.08)',
                  border: '1px solid rgba(245,158,11,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '20px',
                  marginBottom: '16px',
                }}>
                  {feature.icon}
                </div>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: '700', fontSize: '16px', color: 'var(--text-primary)', marginBottom: '8px', letterSpacing: '-0.02em' }}>
                  {feature.title}
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', lineHeight: '1.7' }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BAND ───────────────────────────────────────────────────── */}
      <section style={{ padding: '80px 24px', borderTop: '1px solid rgba(255,255,255,0.055)', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 50% 0%, rgba(245,158,11,0.08) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />
        <div style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <h2 style={{
            fontFamily: 'Syne, sans-serif',
            fontWeight: '800',
            fontSize: 'clamp(28px, 4vw, 44px)',
            letterSpacing: '-0.04em',
            color: 'var(--text-primary)',
            marginBottom: '16px',
          }}>
            Ready to launch your plugin business?
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', marginBottom: '36px' }}>
            Join hundreds of WordPress developers already selling on PluginVault.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <Link
              to="/register"
              style={{
                padding: '13px 32px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: '#000',
                fontSize: '14px',
                fontWeight: '700',
                fontFamily: 'DM Sans, sans-serif',
                textDecoration: 'none',
                boxShadow: '0 0 28px rgba(245,158,11,0.35)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 40px rgba(245,158,11,0.5)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 28px rgba(245,158,11,0.35)'; e.currentTarget.style.transform = 'none'; }}
            >
              Create Developer Account
            </Link>
            <Link
              to="/pricing"
              style={{
                padding: '13px 28px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'var(--text-primary)',
                fontSize: '14px',
                fontWeight: '600',
                fontFamily: 'DM Sans, sans-serif',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(245,158,11,0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}