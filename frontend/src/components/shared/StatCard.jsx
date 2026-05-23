import { formatCurrency } from '../../utils/formatters';

const trendIcons = {
  up: (
    <svg style={{ width: '11px', height: '11px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  down: (
    <svg style={{ width: '11px', height: '11px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
    </svg>
  ),
};

export default function StatCard({ title, value, trend, trendValue, icon, currency, loading }) {
  let displayValue = value;

  if (loading) {
    return (
      <div className="card-accent-top" style={{
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.055)',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0.01) 100%)',
        padding: '22px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div className="shimmer" style={{ height: '12px', width: '80px', borderRadius: '6px', marginBottom: '12px' }} />
        <div className="shimmer" style={{ height: '28px', width: '60px', borderRadius: '8px', marginBottom: '8px' }} />
        <div className="shimmer" style={{ height: '10px', width: '50px', borderRadius: '5px' }} />
      </div>
    );
  }

  if (currency && (typeof value === 'number' || !isNaN(Number(value)))) {
    displayValue = formatCurrency(Number(value));
  }

  const trendColor = trend === 'up' ? '#10b981' : trend === 'down' ? '#f43f5e' : 'var(--text-muted)';

  return (
    <div
      className="card-accent-top"
      style={{
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.055)',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0.01) 100%)',
        padding: '22px',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.25s ease',
        cursor: 'default',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'rgba(245,158,11,0.2)';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3), 0 0 16px rgba(245,158,11,0.08)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.055)';
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ flex: 1 }}>
          <p style={{
            fontSize: '11px',
            fontWeight: '600',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.07em',
            fontFamily: 'DM Sans, sans-serif',
            marginBottom: '10px',
          }}>
            {title}
          </p>
          <p style={{
            fontSize: '26px',
            fontWeight: '800',
            color: 'var(--text-primary)',
            fontFamily: 'Syne, sans-serif',
            letterSpacing: '-0.03em',
            lineHeight: '1',
          }}>
            {displayValue !== undefined && displayValue !== null ? displayValue : '—'}
          </p>
          {trend && trendValue && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              marginTop: '8px',
              padding: '3px 8px',
              borderRadius: '20px',
              background: trend === 'up' ? 'rgba(16,185,129,0.1)' : trend === 'down' ? 'rgba(244,63,94,0.1)' : 'rgba(61,61,85,0.2)',
              border: `1px solid ${trend === 'up' ? 'rgba(16,185,129,0.2)' : trend === 'down' ? 'rgba(244,63,94,0.2)' : 'rgba(61,61,85,0.3)'}`,
            }}>
              <span style={{ color: trendColor }}>{trendIcons[trend]}</span>
              <span style={{ fontSize: '11px', fontWeight: '600', color: trendColor }}>
                {trend === 'up' && '+'}{trendValue}
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div style={{
            width: '40px', height: '40px',
            borderRadius: '10px',
            background: 'rgba(245,158,11,0.1)',
            border: '1px solid rgba(245,158,11,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--accent)',
            flexShrink: 0,
          }}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}