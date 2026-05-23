const statusConfig = {
  // Plugin status
  pending:   { dot: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.25)',  text: '#f59e0b',  glow: 'rgba(245,158,11,0.5)' },
  approved:  { dot: '#10b981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.25)',  text: '#10b981',  glow: 'rgba(16,185,129,0.5)' },
  rejected:  { dot: '#f43f5e', bg: 'rgba(244,63,94,0.1)',   border: 'rgba(244,63,94,0.25)',   text: '#f43f5e',  glow: 'rgba(244,63,94,0.5)'  },
  suspended: { dot: '#3d3d55', bg: 'rgba(61,61,85,0.2)',    border: 'rgba(61,61,85,0.3)',     text: '#7c7c9a',  glow: 'transparent' },

  // License status
  active:    { dot: '#10b981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.25)',  text: '#10b981',  glow: 'rgba(16,185,129,0.5)' },
  expired:   { dot: '#3d3d55', bg: 'rgba(61,61,85,0.2)',    border: 'rgba(61,61,85,0.3)',     text: '#7c7c9a',  glow: 'transparent' },
  revoked:   { dot: '#f43f5e', bg: 'rgba(244,63,94,0.1)',   border: 'rgba(244,63,94,0.25)',   text: '#f43f5e',  glow: 'rgba(244,63,94,0.5)'  },

  // Payment status
  paid:      { dot: '#10b981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.25)',  text: '#10b981',  glow: 'rgba(16,185,129,0.5)' },
  failed:    { dot: '#f43f5e', bg: 'rgba(244,63,94,0.1)',   border: 'rgba(244,63,94,0.25)',   text: '#f43f5e',  glow: 'rgba(244,63,94,0.5)'  },
  refunded:  { dot: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.25)',  text: '#f59e0b',  glow: 'rgba(245,158,11,0.5)' },

  // Role status
  customer:  { dot: '#10b981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.25)',  text: '#10b981',  glow: 'rgba(16,185,129,0.4)' },
  developer: { dot: '#06b6d4', bg: 'rgba(6,182,212,0.1)',   border: 'rgba(6,182,212,0.25)',   text: '#06b6d4',  glow: 'rgba(6,182,212,0.4)'  },
  admin:     { dot: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.25)',  text: '#f59e0b',  glow: 'rgba(245,158,11,0.5)' },

  // Fallback
  default:   { dot: '#3d3d55', bg: 'rgba(61,61,85,0.15)',   border: 'rgba(61,61,85,0.25)',    text: '#7c7c9a',  glow: 'transparent' },
};

export default function StatusBadge({ status, size = 'default' }) {
  const key = status?.toLowerCase?.() || 'default';
  const cfg = statusConfig[key] || statusConfig.default;
  const isSmall = size === 'sm';

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: isSmall ? '5px' : '6px',
      padding: isSmall ? '2px 8px' : '3px 10px',
      borderRadius: '20px',
      background: cfg.bg,
      border: `1px solid ${cfg.border}`,
      fontSize: isSmall ? '11px' : '12px',
      fontWeight: '600',
      color: cfg.text,
      fontFamily: 'DM Sans, sans-serif',
      textTransform: 'capitalize',
      letterSpacing: '0.01em',
      whiteSpace: 'nowrap',
    }}>
      <span style={{
        width: isSmall ? '5px' : '6px',
        height: isSmall ? '5px' : '6px',
        borderRadius: '50%',
        background: cfg.dot,
        flexShrink: 0,
        boxShadow: cfg.glow !== 'transparent' ? `0 0 6px ${cfg.glow}` : 'none',
      }} />
      {status}
    </span>
  );
}