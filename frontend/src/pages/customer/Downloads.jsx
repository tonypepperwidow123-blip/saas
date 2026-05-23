import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { customerService } from '../../services/customer.service';
import PageHeader from '../../components/shared/PageHeader';
import EmptyState from '../../components/shared/EmptyState';
import { formatDate } from '../../utils/formatters';

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
    <div className="space-y-6 page-enter">
      <PageHeader 
        title="Downloads" 
        description="Access and download installation packages for your purchased WordPress plugins" 
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
            title="No downloads yet" 
            description="Your purchased plugins will appear here for download access."
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
                  <th>Plugin Product</th>
                  <th>Current Version</th>
                  <th>Total Downloads</th>
                  <th>Purchase Date</th>
                  <th>Download Package</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td className="font-semibold text-text-primary">
                      <Link to={`/plugins/${order.plugin?.id}`} className="hover:text-accent transition-colors">
                        {order.plugin?.name || 'N/A'}
                      </Link>
                    </td>
                    <td>
                      {order.plugin?.current_version ? (
                        <span className="font-mono text-xs px-2 py-0.5 bg-accent-dim text-accent rounded border border-border-accent/35">
                          v{order.plugin.current_version}
                        </span>
                      ) : (
                        <span className="text-text-muted">-</span>
                      )}
                    </td>
                    <td className="font-mono text-text-secondary">{order.plugin?.download_count || 0}</td>
                    <td>{formatDate(order.created_at)}</td>
                    <td>
                      <Link 
                        to="/customer/licenses" 
                        className="btn-ghost px-3 py-1.5 text-xs font-semibold rounded-lg inline-flex items-center gap-1.5 transition-all"
                      >
                        <svg className="h-3.5 w-3.5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Get Files & Keys
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