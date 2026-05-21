import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { customerService } from '../../services/customer.service';
import PageHeader from '../../components/shared/PageHeader';
import StatusBadge from '../../components/shared/StatusBadge';
import EmptyState from '../../components/shared/EmptyState';
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function CustomerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await customerService.getMyOrders({ limit: 50 });
      if (response.success) {
        setOrders(response.data.items);
      }
    } catch (error) {
      console.warn('Failed to fetch orders:', error?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="My Orders" description="View your purchase history" />

      <div className="rounded-xl border border-border-subtle bg-bg-card overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">{[1, 2, 3, 4, 5].map(i => <div key={i} className="h-16 animate-pulse rounded bg-bg-elevated" />)}</div>
        ) : orders.length === 0 ? (
          <EmptyState title="No orders" description="Start shopping to see your orders here"
            action={<Link to="/shop" className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover">Browse Plugins</Link>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-subtle bg-bg-elevated text-left">
                  <th className="px-6 py-3 text-sm font-medium text-text-secondary">Plugin</th>
                  <th className="px-6 py-3 text-sm font-medium text-text-secondary">Amount</th>
                  <th className="px-6 py-3 text-sm font-medium text-text-secondary">Status</th>
                  <th className="px-6 py-3 text-sm font-medium text-text-secondary">Date</th>
                  <th className="px-6 py-3 text-sm font-medium text-text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-bg-elevated">
                    <td className="px-6 py-4">
                      <div className="font-medium text-text-primary">{order.plugin?.name || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 font-medium">{formatCurrency(order.amount)}</td>
                    <td className="px-6 py-4"><StatusBadge status={order.payment_status} size="sm" /></td>
                    <td className="px-6 py-4 text-sm text-text-muted">{formatDate(order.created_at)}</td>
                    <td className="px-6 py-4">
                      <Link to={`/plugins/${order.plugin?.id}`} className="text-sm text-accent hover:text-accent-hover">View Plugin</Link>
                    </td>
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