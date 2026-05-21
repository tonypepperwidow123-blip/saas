import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { customerService } from '../../services/customer.service';
import PageHeader from '../../components/shared/PageHeader';
import StatusBadge from '../../components/shared/StatusBadge';
import EmptyState from '../../components/shared/EmptyState';
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function CustomerDownloads() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await customerService.getMyDownloads({ limit: 50 });
      if (response.success) {
        setOrders(response.data);
      }
    } catch (error) {
      console.warn('Failed to fetch downloads:', error?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Downloads" description="Access your purchased plugins" />

      <div className="rounded-xl border border-border-subtle bg-bg-card overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">{[1, 2, 3, 4, 5].map(i => <div key={i} className="h-16 animate-pulse rounded bg-bg-elevated" />)}</div>
        ) : orders.length === 0 ? (
          <EmptyState title="No downloads yet" description="Your purchased plugins will appear here"
            action={<Link to="/shop" className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover">Browse Plugins</Link>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-subtle bg-bg-elevated text-left">
                  <th className="px-6 py-3 text-sm font-medium text-text-secondary">Plugin</th>
                  <th className="px-6 py-3 text-sm font-medium text-text-secondary">Version</th>
                  <th className="px-6 py-3 text-sm font-medium text-text-secondary">Downloads</th>
                  <th className="px-6 py-3 text-sm font-medium text-text-secondary">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-bg-elevated">
                    <td className="px-6 py-4">
                      <Link to={`/plugins/${order.plugin?.id}`} className="font-medium text-text-primary hover:text-accent">
                        {order.plugin?.name || 'N/A'}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">{order.plugin?.current_version || '-'}</td>
                    <td className="px-6 py-4 text-sm text-text-secondary">{order.plugin?.download_count || 0}</td>
                    <td className="px-6 py-4 text-sm text-text-muted">{formatDate(order.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}