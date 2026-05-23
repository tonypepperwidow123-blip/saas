import { useState, useEffect } from 'react';
import PageHeader from '../../components/shared/PageHeader';
import StatusBadge from '../../components/shared/StatusBadge';
import EmptyState from '../../components/shared/EmptyState';
import StatCard from '../../components/shared/StatCard';
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
    <div className="space-y-6 page-enter">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight font-display">Payment Transactions</h1>
          <p className="text-xs text-text-secondary mt-0.5">Audit transaction logs, payment statuses, and gateway payloads</p>
        </div>
      </div>

      {/* Summary Cards */}
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
        ) : (
          <>
            <StatCard title="Total Revenue" value={formatCurrency(totalStats.total)} currency="INR" />
            <StatCard title="Completed Payments" value={totalStats.count} />
            <StatCard 
              title="Average Order Value" 
              value={totalStats.count > 0 ? formatCurrency(totalStats.total / totalStats.count) : '₹0'} 
            />
          </>
        )}
      </div>

      <div className="flex flex-wrap gap-4 bg-bg-surface/30 p-4 rounded-2xl border border-border-subtle max-w-xs">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field py-2 text-sm cursor-pointer"
        >
          <option value="">All Transactions</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      <div className="glass-card overflow-hidden rounded-2xl border border-border-subtle shadow-card card-accent-top">
        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 shimmer rounded-xl" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <EmptyState title="No transactions found" description="No invoices match your active selection filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="pv-table">
              <thead>
                <tr>
                  <th>Order Reference</th>
                  <th>Plugin Product</th>
                  <th>Customer Profile</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th>Razorpay ID</th>
                  <th>Transaction Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td>
                      <code className="text-xs font-mono font-bold text-accent bg-accent-dim/10 border border-accent/20 px-2 py-1 rounded">
                        {order.id?.slice(0, 8).toUpperCase()}
                      </code>
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
                    <td className="text-xs text-text-secondary font-mono">
                      {order.razorpay_payment_id || order.razorpay_order_id ? (
                        <span className="text-accent2-dim bg-accent2-dim/5 border border-accent2/10 px-2 py-0.5 rounded">
                          {order.razorpay_payment_id || order.razorpay_order_id}
                        </span>
                      ) : (
                        <span className="text-text-muted italic">-</span>
                      )}
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