import { Link } from 'react-router-dom';

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: '₹0',
    period: '',
    description: 'Perfect for getting started.',
    features: [
      'Upload up to 5 plugins',
      'Unlimited plugin updates',
      'Automated license generation',
      'Secure ZIP file hosting',
      'Developer analytics dashboard',
    ],
    cta: 'Start for Free',
    ctaHref: '/register',
    highlight: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '₹1,000',
    period: '/ mo',
    description: 'For growing plugin businesses.',
    features: [
      'Upload up to 10 plugins',
      'Unlimited plugin updates',
      'Automated license generation',
      'Secure ZIP file hosting',
      'Developer analytics dashboard',
    ],
    cta: 'Get Pro',
    ctaHref: '/register',
    highlight: true,
    badge: 'Most Popular',
  },
  {
    id: 'business',
    name: 'Business',
    price: '₹1,500',
    period: '/ mo',
    description: 'For advanced agencies and studios.',
    features: [
      'Upload up to 20 plugins',
      'Unlimited plugin updates',
      'Automated license generation',
      'Secure ZIP file hosting',
      'Developer analytics dashboard',
      'Priority Support',
    ],
    cta: 'Get Business',
    ctaHref: '/register',
    highlight: false,
  },
];

function CheckIcon() {
  return (
    <svg style={{ width: '14px', height: '14px', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  );
}

export default function Pricing() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '64px 24px' }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '4px 14px', borderRadius: '20px',
          background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)',
          marginBottom: '20px',
        }}>
          <span style={{ fontSize: '12px', fontWeight: '600', color: '#f59e0b', fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.04em' }}>
            Simple, Transparent Pricing
          </span>
        </div>
        <h1 style={{
          fontFamily: 'Syne, sans-serif',
          fontWeight: '800',
          fontSize: 'clamp(28px, 4vw, 48px)',
          letterSpacing: '-0.04em',
          color: 'var(--text-primary)',
          marginBottom: '14px',
        }}>
          Choose your plan
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', maxWidth: '440px', margin: '0 auto', lineHeight: '1.7' }}>
          Choose the perfect plan to manage and distribute your WordPress plugins.
        </p>
      </div>

      {/* Plans Grid */}
      <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', alignItems: 'start' }}>
        {plans.map((plan, index) => (
          <div
            key={plan.id}
            style={{
              borderRadius: '20px',
              border: plan.highlight ? '1px solid rgba(245,158,11,0.35)' : '1px solid rgba(255,255,255,0.055)',
              background: plan.highlight
                ? 'linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(255,255,255,0.02) 100%)'
                : 'linear-gradient(135deg, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0.01) 100%)',
              padding: '32px',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              boxShadow: plan.highlight ? '0 0 40px rgba(245,158,11,0.12)' : 'none',
              transform: plan.highlight ? 'scale(1.02)' : 'none',
              animation: `fade-in 0.5s ${index * 0.1}s ease forwards`,
              opacity: 0,
            }}
          >
            {/* Most Popular badge */}
            {plan.badge && (
              <div style={{
                position: 'absolute',
                top: '-14px', left: '50%', transform: 'translateX(-50%)',
                padding: '4px 14px',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                fontSize: '11px',
                fontWeight: '700',
                color: '#000',
                fontFamily: 'DM Sans, sans-serif',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 12px rgba(245,158,11,0.4)',
              }}>
                {plan.badge}
              </div>
            )}

            {/* Plan name */}
            <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
              {plan.name}
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', marginBottom: '20px' }}>
              {plan.description}
            </p>

            {/* Price */}
            <div style={{ marginBottom: '28px', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span style={{
                fontFamily: 'Syne, sans-serif',
                fontWeight: '800',
                fontSize: '40px',
                letterSpacing: '-0.04em',
                color: plan.highlight ? '#f59e0b' : 'var(--text-primary)',
              }}>
                {plan.price}
              </span>
              {plan.period && (
                <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif' }}>
                  {plan.period}
                </span>
              )}
            </div>

            {/* Features */}
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, marginBottom: '28px' }}>
              {plan.features.map((feature, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif' }}>
                  <span style={{ color: '#10b981', flexShrink: 0 }}>
                    <CheckIcon />
                  </span>
                  {feature}
                </li>
              ))}
            </ul>

            {/* CTA */}
            <Link
              to={plan.ctaHref}
              style={{
                display: 'block',
                textAlign: 'center',
                padding: '12px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '700',
                fontFamily: 'DM Sans, sans-serif',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
                ...(plan.highlight
                  ? {
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    color: '#000',
                    boxShadow: '0 0 20px rgba(245,158,11,0.3)',
                  }
                  : {
                    background: 'transparent',
                    color: 'var(--text-primary)',
                    border: '1px solid rgba(255,255,255,0.12)',
                  }
                ),
              }}
              onMouseEnter={e => {
                if (plan.highlight) {
                  e.currentTarget.style.boxShadow = '0 0 32px rgba(245,158,11,0.5)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                } else {
                  e.currentTarget.style.borderColor = 'rgba(245,158,11,0.3)';
                  e.currentTarget.style.background = 'rgba(245,158,11,0.06)';
                  e.currentTarget.style.color = '#f59e0b';
                }
              }}
              onMouseLeave={e => {
                if (plan.highlight) {
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(245,158,11,0.3)';
                  e.currentTarget.style.transform = 'none';
                } else {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }
              }}
            >
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>

      {/* Customer section */}
      <div style={{
        marginTop: '48px',
        borderRadius: '20px',
        border: '1px solid rgba(6,182,212,0.2)',
        background: 'linear-gradient(135deg, rgba(6,182,212,0.05) 0%, rgba(255,255,255,0.01) 100%)',
        padding: '40px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: 0, left: '20%', right: '20%', height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(6,182,212,0.4), transparent)',
        }} />
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: '800', fontSize: '22px', color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: '10px' }}>
          Are you a Customer?
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', fontSize: '14px', maxWidth: '480px', margin: '0 auto 24px', lineHeight: '1.7' }}>
          Purchase and manage licenses for WordPress plugins across your sites — completely free of platform charges.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '20px', marginBottom: '28px' }}>
          {['Browse marketplace', 'Manage license keys', 'Secure downloads'].map((perk) => (
            <span key={perk} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif' }}>
              <span style={{ color: '#06b6d4' }}><CheckIcon /></span>
              {perk}
            </span>
          ))}
        </div>
        <Link
          to="/register"
          style={{
            display: 'inline-block',
            padding: '11px 28px',
            borderRadius: '12px',
            background: 'rgba(6,182,212,0.1)',
            border: '1px solid rgba(6,182,212,0.3)',
            color: '#06b6d4',
            fontSize: '14px',
            fontWeight: '700',
            fontFamily: 'DM Sans, sans-serif',
            textDecoration: 'none',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(6,182,212,0.15)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(6,182,212,0.2)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(6,182,212,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          Create Customer Account →
        </Link>
      </div>
    </div>
  );
}