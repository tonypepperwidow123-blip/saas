export default function EmptyState({ title, description, action, icon }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '56px 24px',
      textAlign: 'center',
      animation: 'fade-in 0.4s ease forwards',
    }}>
      {/* Icon ring */}
      <div style={{ position: 'relative', marginBottom: '20px' }}>
        {/* Outer pulse ring */}
        <div style={{
          position: 'absolute',
          inset: '-8px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)',
          animation: 'glow-pulse 3s ease-in-out infinite',
        }} />
        <div style={{
          width: '64px', height: '64px',
          borderRadius: '18px',
          background: 'rgba(245,158,11,0.07)',
          border: '1px solid rgba(245,158,11,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'rgba(245,158,11,0.6)',
          position: 'relative',
        }}>
          {icon || (
            <svg style={{ width: '28px', height: '28px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          )}
        </div>
      </div>

      <h3 style={{
        fontFamily: 'Syne, sans-serif',
        fontWeight: '700',
        fontSize: '16px',
        color: 'var(--text-primary)',
        letterSpacing: '-0.02em',
        marginBottom: '6px',
      }}>
        {title}
      </h3>
      {description && (
        <p style={{
          maxWidth: '320px',
          fontSize: '13px',
          color: 'var(--text-secondary)',
          fontFamily: 'DM Sans, sans-serif',
          lineHeight: '1.6',
        }}>
          {description}
        </p>
      )}
      {action && (
        <div style={{ marginTop: '20px' }}>
          {action}
        </div>
      )}
    </div>
  );
}