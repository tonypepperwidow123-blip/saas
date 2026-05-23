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
    <div className="space-y-6 page-enter">
      <PageHeader 
        title="My Orders" 
        description="View your purchase history, receipts, and order billing logs" 
      />

      <div className="glass-card overflow-hidden rounded-2xl border border-border-subtle shadow-card card-accent-top">
        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 shimmer rounded-xl" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <EmptyState 
            title="No orders yet" 
            description="Your checkout logs and subscription orders will display here."
            action={
              <Link 
                to="/shop" 
                className="btn-amber px-5 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2"
              >
                Browse Marketplace
              </Link>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="pv-table">
              <thead>
                <tr>
                  <th>Order Reference ID</th>
                  <th>Plugin Product</th>
                  <th>Amount Paid</th>
                  <th>Payment Status</th>
                  <th>Date Purchased</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td>
                      <span className="font-mono text-xs text-text-secondary bg-bg-base/50 px-2 py-0.5 rounded border border-border-subtle">
                        {order.id.slice(0, 8)}...
                      </span>
                    </td>
                    <td className="font-semibold text-text-primary">
                      {order.plugin?.name || 'N/A'}
                    </td>
                    <td className="font-bold font-mono text-accent">{formatCurrency(order.amount)}</td>
                    <td>
                      <StatusBadge status={order.payment_status} size="sm" />
                    </td>
                    <td>{formatDate(order.created_at)}</td>
                    <td>
                      <Link 
                        to={`/plugins/${order.plugin?.id}`} 
                        className="btn-ghost px-3 py-1.5 text-xs font-semibold rounded-lg inline-flex items-center gap-1.5 transition-all text-center"
                      >
                        View Listing
                      </Link>
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