import { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import PageHeader from '../../components/shared/PageHeader';
import StatCard from '../../components/shared/StatCard';
import StatusBadge from '../../components/shared/StatusBadge';
import EmptyState from '../../components/shared/EmptyState';
import { TableSkeleton } from '../../components/shared/LoadingSkeleton';
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function AdminRevenue() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const fetchData = async () => {
    try {
      const [ordersRes, revenueRes] = await Promise.all([
        adminService.getOrders({ status: statusFilter, limit: 100 }),
        adminService.getRevenue(),
      ]);

      if (ordersRes.success) setOrders(ordersRes.data.items);
      if (revenueRes.success) setStats(revenueRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Revenue & Payments" description="Manage all payments and transactions" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <>
            <div className="animate-pulse rounded-xl border border-border-subtle bg-bg-card p-6">
              <div className="h-4 w-20 rounded bg-bg-elevated" />
              <div className="mt-2 h-8 w-24 rounded bg-bg-elevated" />
            </div>
            <div className="animate-pulse rounded-xl border border-border-subtle bg-bg-card p-6">
              <div className="h-4 w-20 rounded bg-bg-elevated" />
              <div className="mt-2 h-8 w-24 rounded bg-bg-elevated" />
            </div>
            <div className="animate-pulse rounded-xl border border-border-subtle bg-bg-card p-6">
              <div className="h-4 w-20 rounded bg-bg-elevated" />
              <div className="mt-2 h-8 w-24 rounded bg-bg-elevated" />
            </div>
          </>
        ) : stats ? (
          <>
            <StatCard title="Total Revenue" value={formatCurrency(stats.total)} currency="INR" />
            <StatCard title="This Month" value={formatCurrency(stats.thisMonth)} currency="INR" />
            <StatCard title="Total Orders" value={stats.orders?.length || 0} />
          </>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-border-subtle bg-bg-elevated px-4 py-2 text-text-primary focus:border-accent focus:outline-none"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      <div className="rounded-xl border border-border-subtle bg-bg-card overflow-hidden">
        {loading ? (
          <TableSkeleton rows={8} columns={6} />
        ) : orders.length === 0 ? (
          <EmptyState title="No orders" description="No payment records found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-subtle bg-bg-elevated text-left">
                  <th className="px-6 py-3 text-sm font-medium text-text-secondary">Order ID</th>
                  <th className="px-6 py-3 text-sm font-medium text-text-secondary">Plugin</th>
                  <th className="px-6 py-3 text-sm font-medium text-text-secondary">Customer</th>
                  <th className="px-6 py-3 text-sm font-medium text-text-secondary">Amount</th>
                  <th className="px-6 py-3 text-sm font-medium text-text-secondary">Status</th>
                  <th className="px-6 py-3 text-sm font-medium text-text-secondary">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-bg-elevated">
                    <td className="px-6 py-4">
                      <div className="font-mono text-xs text-text-muted">{order.id?.substring(0, 8)}...</div>
                      {order.razorpay_order_id && (
                        <div className="text-xs text-text-muted">Razorpay: {order.razorpay_order_id.substring(0, 12)}...</div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-text-primary">{order.plugin?.name || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-text-primary">{order.customer?.name || 'N/A'}</div>
                      <div className="text-xs text-text-muted">{order.customer?.email}</div>
                    </td>
                    <td className="px-6 py-4 font-medium">{formatCurrency(order.amount)}</td>
                    <td className="px-6 py-4"><StatusBadge status={order.payment_status} size="sm" /></td>
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