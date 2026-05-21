import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/admin.service';
import PageHeader from '../../components/shared/PageHeader';
import StatCard from '../../components/shared/StatCard';
import StatusBadge from '../../components/shared/StatusBadge';
import { formatCurrency } from '../../utils/formatters';
import { supabase } from '../../lib/supabase';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isSubscribed = useRef(false);

  const fetchData = useCallback(async () => {
    try {
      const response = await adminService.getStats();
      if (response && response.success) {
        setStats(response.data);
        setRecentOrders(response.data.recentOrders || []);
      } else if (response?.error) {
        setError(response.error);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isSubscribed.current) return;
    isSubscribed.current = true;
    setError(null);
    fetchData();

    // Real-time subscription for orders
    const ordersChannel = supabase
      .channel('admin-orders-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchData();
      })
      .subscribe();

    // Real-time subscription for plugins
    const pluginsChannel = supabase
      .channel('admin-plugins-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'plugins' }, () => {
        fetchData();
      })
      .subscribe();

    // Real-time subscription for profiles
    const profilesChannel = supabase
      .channel('admin-profiles-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(pluginsChannel);
      supabase.removeChannel(profilesChannel);
      isSubscribed.current = false;
    };
  }, [fetchData]);

  const isLoading = loading || !stats;

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Platform overview and management" />

      {error && (
        <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-4">
          <p className="text-sm text-red-400">Error: {error}</p>
          <button
            onClick={fetchData}
            className="mt-2 rounded bg-red-500 px-3 py-1 text-xs text-white hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Users" value={stats?.users?.total ?? 0} loading={isLoading} />
        <StatCard title="Developers" value={stats?.users?.developers ?? 0} loading={isLoading} />
        <StatCard title="Plugins" value={stats?.plugins?.total ?? 0} loading={isLoading} />
        <StatCard title="Total Revenue" value={stats?.revenue?.total ?? 0} currency loading={isLoading} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Orders" value={stats?.orders?.total ?? 0} loading={isLoading} />
        <StatCard title="Active Licenses" value={stats?.licenses?.total ?? 0} loading={isLoading} />
        <StatCard title="Pending Approvals" value={stats?.plugins?.pending ?? 0} loading={isLoading} />
        <StatCard title="Customers" value={stats?.users?.customers ?? 0} loading={isLoading} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border-subtle bg-bg-card">
          <div className="flex items-center justify-between border-b border-border-subtle px-6 py-4">
            <h2 className="font-semibold text-text-primary">Pending Approvals</h2>
            <Link to="/admin/pending-approvals" className="text-sm text-accent hover:text-accent-hover">View all</Link>
          </div>
          <div className="p-6">
            {isLoading ? (
              <div className="space-y-3"><div className="h-12 animate-pulse rounded bg-bg-elevated" /><div className="h-12 animate-pulse rounded bg-bg-elevated" /></div>
            ) : (stats?.plugins?.pending || 0) > 0 ? (
              <div className="space-y-3">
                <div className="rounded-lg border border-warning/30 bg-warning/10 p-4">
                  <p className="font-medium text-warning">{stats.plugins.pending} plugins awaiting review</p>
                </div>
                <Link to="/admin/pending-approvals" className="block w-full rounded-lg bg-warning px-4 py-2 text-center text-sm font-medium text-white hover:bg-warning/80">
                  Review Now
                </Link>
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-text-muted">No pending approvals</p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border-subtle bg-bg-card">
          <div className="flex items-center justify-between border-b border-border-subtle px-6 py-4">
            <h2 className="font-semibold text-text-primary">Recent Transactions</h2>
            <Link to="/admin/transactions" className="text-sm text-accent hover:text-accent-hover">View all</Link>
          </div>
          <div className="p-6">
            {isLoading ? (
              <div className="space-y-3"><div className="h-12 animate-pulse rounded bg-bg-elevated" /><div className="h-12 animate-pulse rounded bg-bg-elevated" /></div>
            ) : recentOrders.length > 0 ? (
              <div className="space-y-3">
                {recentOrders.map(order => (
                  <div key={order.id} className="flex items-center justify-between rounded-lg p-3 hover:bg-bg-elevated">
                    <div>
                      <p className="font-medium text-text-primary">{order.plugin?.name || 'Unknown'}</p>
                      <p className="text-xs text-text-muted">{order.customer?.name || 'Unknown'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(order.amount)}</p>
                      <StatusBadge status={order.payment_status} size="sm" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-text-muted">No recent transactions</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link to="/admin/developers" className="rounded-xl border border-border-subtle bg-bg-card p-6 transition-all hover:border-accent hover:bg-accent/5">
          <h3 className="font-semibold text-text-primary">Manage Developers</h3>
          <p className="mt-1 text-sm text-text-muted">{stats?.users?.developers || 0} registered</p>
        </Link>
        <Link to="/admin/customers" className="rounded-xl border border-border-subtle bg-bg-card p-6 transition-all hover:border-accent hover:bg-accent/5">
          <h3 className="font-semibold text-text-primary">Manage Customers</h3>
          <p className="mt-1 text-sm text-text-muted">{stats?.users?.customers || 0} registered</p>
        </Link>
        <Link to="/admin/licenses" className="rounded-xl border border-border-subtle bg-bg-card p-6 transition-all hover:border-accent hover:bg-accent/5">
          <h3 className="font-semibold text-text-primary">View Licenses</h3>
          <p className="mt-1 text-sm text-text-muted">{stats?.licenses?.total || 0} total</p>
        </Link>
        <Link to="/admin/analytics" className="rounded-xl border border-border-subtle bg-bg-card p-6 transition-all hover:border-accent hover:bg-accent/5">
          <h3 className="font-semibold text-text-primary">View Analytics</h3>
          <p className="mt-1 text-sm text-text-muted">Platform insights</p>
        </Link>
      </div>
    </div>
  );
}