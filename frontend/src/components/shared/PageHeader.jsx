export default function PageHeader({ title, description, actions }) {
  return (
    <div style={{
      marginBottom: '28px',
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px',
      animation: 'fade-in 0.35s ease forwards',
    }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          {/* Amber accent bar */}
          <div style={{
            width: '3px',
            height: '22px',
            borderRadius: '2px',
            background: 'linear-gradient(180deg, #f59e0b, #d97706)',
            boxShadow: '0 0 8px rgba(245,158,11,0.5)',
            flexShrink: 0,
          }} />
          <h1 style={{
            fontFamily: 'Syne, sans-serif',
            fontWeight: '800',
            fontSize: '22px',
            color: 'var(--text-primary)',
            letterSpacing: '-0.03em',
            lineHeight: '1.1',
          }}>
            {title}
          </h1>
        </div>
        {description && (
          <p style={{
            fontSize: '13px',
            color: 'var(--text-secondary)',
            fontFamily: 'DM Sans, sans-serif',
            paddingLeft: '13px',
          }}>
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          {actions}
        </div>
      )}
    </div>
  );
}