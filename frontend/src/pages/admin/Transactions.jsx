import { useState, useEffect } from 'react';
import PageHeader from '../../components/shared/PageHeader';
import StatusBadge from '../../components/shared/StatusBadge';
import EmptyState from '../../components/shared/EmptyState';
import { formatCurrency, formatDate } from '../../utils/formatters';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json'
};

const supabaseFetch = async (endpoint, options = {}) => {
  try {
    const url = `${SUPABASE_URL}/rest/v1${endpoint}`;
    const response = await fetch(url, { headers, ...options });
    let data;
    try { data = await response.json(); } catch (e) { data = null; }
    if (!response.ok) return { data: null, error: data?.message };
    return { data: Array.isArray(data) ? data : (data ? [data] : []), error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

export default function Transactions() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [totalStats, setTotalStats] = useState({ total: 0, count: 0 });

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const fetchData = async () => {
    try {
      // Get orders
      let ordersEndpoint = '/orders?order=created_at.desc&limit=100';
      if (statusFilter) {
        ordersEndpoint = `/orders?payment_status=eq.${statusFilter}&order=created_at.desc&limit=100`;
      }

      const { data: ordersData, error: ordersError } = await supabaseFetch(ordersEndpoint);
      if (ordersError) throw new Error(ordersError);
      setOrders(ordersData || []);

      // Get totals for paid orders
      const { data: paidOrders, error: paidError } = await supabaseFetch('/orders?payment_status=eq.paid&select=amount');
      if (paidError) throw new Error(paidError);
      const total = paidOrders?.reduce((sum, o) => sum + Number(o.amount || 0), 0) || 0;
      setTotalStats({ total, count: paidOrders?.length || 0 });
    } catch (error) {
      console.warn('Fetch error:', error?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Transactions" description="All payment transactions" />

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-border-subtle bg-bg-card p-4">
          <p className="text-sm text-text-secondary">Total Revenue</p>
          <p className="mt-1 text-2xl font-bold text-text-primary">{formatCurrency(totalStats.total)}</p>
        </div>
        <div className="rounded-xl border border-border-subtle bg-bg-card p-4">
          <p className="text-sm text-text-secondary">Completed Payments</p>
          <p className="mt-1 text-2xl font-bold text-text-primary">{totalStats.count}</p>
        </div>
        <div className="rounded-xl border border-border-subtle bg-bg-card p-4">
          <p className="text-sm text-text-secondary">Average Order Value</p>
          <p className="mt-1 text-2xl font-bold text-text-primary">
            {totalStats.count > 0 ? formatCurrency(totalStats.total / totalStats.count) : '₹0'}
          </p>
        </div>
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
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-16 animate-pulse rounded bg-bg-elevated" />)}
          </div>
        ) : orders.length === 0 ? (
          <EmptyState title="No transactions" description="No payment records found" />
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
                  <th className="px-6 py-3 text-sm font-medium text-text-secondary">Razorpay ID</th>
                  <th className="px-6 py-3 text-sm font-medium text-text-secondary">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-bg-elevated">
                    <td className="px-6 py-4">
                      <code className="text-xs font-mono bg-bg-elevated px-2 py-1 rounded">{order.id?.slice(0, 8)}</code>
                    </td>
                    <td className="px-6 py-4 font-medium text-text-primary">{order.plugin?.name || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-text-primary">{order.customer?.name || 'N/A'}</div>
                      <div className="text-xs text-text-muted">{order.customer?.email}</div>
                    </td>
                    <td className="px-6 py-4 font-medium">{formatCurrency(order.amount)}</td>
                    <td className="px-6 py-4"><StatusBadge status={order.payment_status} size="sm" /></td>
                    <td className="px-6 py-4 text-xs text-text-muted font-mono">
                      {order.razorpay_payment_id || order.razorpay_order_id || '-'}
                    </td>
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