const statusColors = {
  // Plugin status
  pending: 'bg-warning/10 text-warning border-warning/20',
  approved: 'bg-success/10 text-success border-success/20',
  rejected: 'bg-danger/10 text-danger border-danger/20',
  suspended: 'bg-text-muted/10 text-text-muted border-text-muted/20',

  // License status
  active: 'bg-success/10 text-success border-success/20',
  expired: 'bg-text-muted/10 text-text-muted border-text-muted/20',
  revoked: 'bg-danger/10 text-danger border-danger/20',

  // Payment status
  paid: 'bg-success/10 text-success border-success/20',
  failed: 'bg-danger/10 text-danger border-danger/20',
  refunded: 'bg-warning/10 text-warning border-warning/20',

  // User status
  customer: 'bg-info/10 text-info border-info/20',
  developer: 'bg-accent/10 text-accent border-accent/20',
  admin: 'bg-warning/10 text-warning border-warning/20',

  // Generic
  default: 'bg-text-muted/10 text-text-muted border-text-muted/20',
};

export default function StatusBadge({ status, size = 'default' }) {
  const colorClass = statusColors[status?.toLowerCase?.() || 'default'] || statusColors.default;
  const sizeClass = size === 'sm' ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium capitalize ${colorClass} ${sizeClass}`}
    >
      {status}
    </span>
  );
}