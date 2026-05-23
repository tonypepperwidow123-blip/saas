const skBase = {
  borderRadius: '8px',
  background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(245,158,11,0.06) 50%, rgba(255,255,255,0.04) 75%)',
  backgroundSize: '400% 100%',
  animation: 'shimmer 1.8s ease infinite',
};

export function Skeleton({ style = {}, className }) {
  return (
    <div
      className={className}
      style={{ ...skBase, ...style }}
    />
  );
}

export function TableSkeleton({ rows = 5, columns = 4 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
      {/* Header row */}
      <div style={{
        display: 'flex',
        gap: '16px',
        padding: '12px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.055)',
      }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} style={{ height: '11px', flex: 1, borderRadius: '6px' }} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} style={{
          display: 'flex',
          gap: '16px',
          padding: '14px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.025)',
          animationDelay: `${rowIndex * 0.06}s`,
        }}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} style={{
              height: '13px',
              flex: 1,
              borderRadius: '6px',
              opacity: 0.7 + (colIndex === 0 ? 0.3 : 0),
            }} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div style={{
      borderRadius: '16px',
      border: '1px solid rgba(255,255,255,0.055)',
      background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
      padding: '22px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
        <Skeleton style={{ width: '44px', height: '44px', borderRadius: '12px' }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Skeleton style={{ height: '13px', width: '35%' }} />
          <Skeleton style={{ height: '11px', width: '55%' }} />
        </div>
      </div>
      <Skeleton style={{ height: '11px', width: '80%', marginBottom: '6px' }} />
      <Skeleton style={{ height: '11px', width: '65%' }} />
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div style={{
      borderRadius: '16px',
      border: '1px solid rgba(255,255,255,0.055)',
      background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
      padding: '22px',
    }}>
      <Skeleton style={{ height: '11px', width: '80px', marginBottom: '12px' }} />
      <Skeleton style={{ height: '28px', width: '64px', marginBottom: '10px' }} />
      <Skeleton style={{ height: '10px', width: '50px' }} />
    </div>
  );
}