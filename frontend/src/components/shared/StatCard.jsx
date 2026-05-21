import { formatCurrency } from '../../utils/formatters';

export default function StatCard({ title, value, trend, trendValue, icon, currency, loading }) {
  // Handle display value
  let displayValue = value;

  if (loading) {
    return (
      <div className="rounded-xl border border-border-subtle bg-bg-card p-6 animate-pulse">
        <div className="h-4 w-20 rounded bg-bg-elevated" />
        <div className="mt-2 h-8 w-16 rounded bg-bg-elevated" />
      </div>
    );
  }

  if (currency && (typeof value === 'number' || !isNaN(Number(value)))) {
    displayValue = formatCurrency(Number(value));
  }

  return (
    <div className="rounded-xl border border-border-subtle bg-bg-card p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-text-secondary">{title}</p>
          <p className="mt-2 text-2xl font-bold text-text-primary">
            {displayValue !== undefined && displayValue !== null ? displayValue : '—'}
          </p>
          {trend && (
            <p className={`mt-1 text-xs font-medium ${trend === 'up' ? 'text-success' : trend === 'down' ? 'text-danger' : 'text-text-muted'}`}>
              {trend === 'up' && '+'}
              {trendValue}
            </p>
          )}
        </div>
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}