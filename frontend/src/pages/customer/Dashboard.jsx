import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { customerService } from '../../services/customer.service';
import PageHeader from '../../components/shared/PageHeader';
import StatCard from '../../components/shared/StatCard';
import StatusBadge from '../../components/shared/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/auth.store';

export default function CustomerDashboard() {
  const [licenses, setLicenses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ activeLicenses: 0, totalOrders: 0, activeActivations: 0 });
  const [loading, setLoading] = useState(true);
  const userId = useAuthStore(state => state.user?.id);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, licensesRes, ordersRes] = await Promise.all([
        customerService.getStats(),
        customerService.getMyLicenses({ limit: 10 }),
        customerService.getMyOrders({ limit: 10 }),
      ]);

      if (statsRes.success) {
        setStats(statsRes.data);
      }
      if (licensesRes.success) {
        setLicenses(licensesRes.data.items);
      }
      if (ordersRes.success) {
        setOrders(ordersRes.data.items);
      }
    } catch (error) {
      console.warn('Dashboard error:', error?.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!userId) return;
    fetchData();

    // Real-time subscription for customer's licenses
    const licensesChannel = supabase
      .channel('customer-licenses-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'licenses', filter: `customer_id=eq.${userId}` }, () => {
        fetchData();
      })
      .subscribe();

    // Real-time subscription for customer's orders
    const ordersChannel = supabase
      .channel('customer-orders-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `customer_id=eq.${userId}` }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(licensesChannel);
      supabase.removeChannel(ordersChannel);
    };
  }, [userId, fetchData]);

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Manage your plugin licenses" />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Active Licenses" value={stats.activeLicenses || 0} loading={loading} />
        <StatCard title="Total Purchases" value={stats.totalOrders || 0} loading={loading} />
        <StatCard title="Active Activations" value={stats.activeActivations || 0} loading={loading} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border-subtle bg-bg-card">
          <div className="flex items-center justify-between border-b border-border-subtle px-6 py-4">
            <h2 className="font-semibold text-text-primary">My Licenses</h2>
            <Link to="/customer/licenses" className="text-sm text-accent hover:text-accent-hover">View all</Link>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-12 animate-pulse rounded bg-bg-elevated" />)}</div>
            ) : licenses.length === 0 ? (
              <p className="py-8 text-center text-sm text-text-muted">No licenses yet</p>
            ) : (
              <div className="space-y-3">
                {licenses.slice(0, 5).map((license) => (
                  <div key={license.id} className="flex items-center justify-between rounded-lg p-3 hover:bg-bg-elevated">
                    <div>
                      <p className="font-medium text-text-primary">{license.plugin?.name}</p>
                      <p className="text-xs text-text-muted">v{license.plugin?.current_version}</p>
                    </div>
                    <StatusBadge status={license.status} size="sm" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border-subtle bg-bg-card">
          <div className="flex items-center justify-between border-b border-border-subtle px-6 py-4">
            <h2 className="font-semibold text-text-primary">Recent Orders</h2>
            <Link to="/customer/downloads" className="text-sm text-accent hover:text-accent-hover">View all</Link>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-12 animate-pulse rounded bg-bg-elevated" />)}</div>
            ) : orders.length === 0 ? (
              <p className="py-8 text-center text-sm text-text-muted">No orders yet</p>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between rounded-lg p-3 hover:bg-bg-elevated">
                    <div>
                      <p className="font-medium text-text-primary">{order.plugin?.name}</p>
                      <p className="text-xs text-text-muted">${order.amount}</p>
                    </div>
                    <StatusBadge status={order.payment_status} size="sm" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}