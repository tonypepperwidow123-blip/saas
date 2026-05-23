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
    <div className="space-y-6 page-enter">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight font-display">Revenue & Ledger</h1>
          <p className="text-xs text-text-secondary mt-0.5">Manage gross payment volumes, invoices, and transaction audits</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <>
            {[1, 2, 3].map(i => (
              <div key={i} className="glass-card animate-pulse rounded-2xl border border-border-subtle p-6 card-accent-top">
                <div className="h-4 w-20 rounded bg-white/[0.04]" />
                <div className="mt-3 h-8 w-32 rounded bg-white/[0.04]" />
              </div>
            ))}
          </>
        ) : stats ? (
          <>
            <StatCard title="Total Revenue" value={formatCurrency(stats.total)} currency="INR" />
            <StatCard title="This Month" value={formatCurrency(stats.thisMonth)} currency="INR" />
            <StatCard title="Total Orders" value={stats.orders?.length || 0} />
          </>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-4 bg-bg-surface/30 p-4 rounded-2xl border border-border-subtle max-w-xs">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field py-2 text-sm cursor-pointer"
        >
          <option value="">All Orders</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      <div className="glass-card overflow-hidden rounded-2xl border border-border-subtle shadow-card card-accent-top">
        {loading ? (
          <div className="p-4">
            <TableSkeleton rows={8} columns={6} />
          </div>
        ) : orders.length === 0 ? (
          <EmptyState title="No orders found" description="No invoices match your active status filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="pv-table">
              <thead>
                <tr>
                  <th>Order Reference</th>
                  <th>Plugin Product</th>
                  <th>Customer Profile</th>
                  <th>Total Amount</th>
                  <th>Payment Status</th>
                  <th>Transaction Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <div>
                        <p className="font-mono text-xs text-text-primary tracking-wider">{order.id?.substring(0, 8).toUpperCase()}...</p>
                        {order.razorpay_order_id && (
                          <p className="text-[10px] text-text-muted mt-0.5 font-mono">Gateway: {order.razorpay_order_id.substring(0, 12)}...</p>
                        )}
                      </div>
                    </td>
                    <td className="font-semibold text-text-primary text-sm">{order.plugin?.name || 'N/A'}</td>
                    <td>
                      <div>
                        <p className="text-sm font-semibold text-text-primary">{order.customer?.name || 'N/A'}</p>
                        <p className="text-xs text-text-muted mt-0.5 font-mono">{order.customer?.email}</p>
                      </div>
                    </td>
                    <td className="font-mono font-medium text-text-primary text-sm">{formatCurrency(order.amount)}</td>
                    <td>
                      <StatusBadge status={order.payment_status} size="sm" />
                    </td>
                    <td className="text-text-muted text-xs">{formatDate(order.created_at)}</td>
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