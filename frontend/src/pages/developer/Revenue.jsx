import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/auth.store';
import PageHeader from '../../components/shared/PageHeader';
import StatCard from '../../components/shared/StatCard';
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

export default function DeveloperRevenue() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const userId = useAuthStore(state => state.user?.id);

  useEffect(() => {
    if (userId) fetchData();
  }, [userId]);

  const fetchData = async () => {
    try {
      // Get my plugin IDs
      const { data: myPlugins, error: pluginsErr } = await supabaseFetch(`/plugins?developer_id=eq.${userId}&select=id,name`);
      if (pluginsErr) throw new Error(pluginsErr);
      const pluginIds = myPlugins?.map(p => p.id) || [];

      if (pluginIds.length === 0) {
        setOrders([]);
        setStats({ totalRevenue: 0, totalSales: 0, thisMonth: 0 });
        setLoading(false);
        return;
      }

      // Get orders for my plugins
      const pluginIdsParam = pluginIds.join(',');
      const { data: ordersData, error: ordersErr } = await supabaseFetch(
        `/orders?plugin_id=in.(${pluginIdsParam})&payment_status=eq.paid&order=created_at.desc&select=*`
      );
      if (ordersErr) throw new Error(ordersErr);

      const totalRevenue = ordersData?.reduce((sum, o) => sum + Number(o.amount || 0), 0) || 0;
      const thisMonth = ordersData?.filter(o => {
        const d = new Date(o.created_at);
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }).reduce((sum, o) => sum + Number(o.amount || 0), 0) || 0;

      setOrders(ordersData || []);
      setStats({ totalRevenue, totalSales: ordersData?.length || 0, thisMonth });
    } catch (error) {
      console.warn('Revenue fetch error:', error?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 page-enter">
      <PageHeader 
        title="Revenue" 
        description="Track and monitor gross proceeds and transaction streams from your WordPress listings" 
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard 
          title="Total Revenue" 
          value={stats?.totalRevenue || 0} 
          currency={true} 
          loading={loading}
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard 
          title="This Month" 
          value={stats?.thisMonth || 0} 
          currency={true} 
          loading={loading}
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />
        <StatCard 
          title="Total Sales" 
          value={stats?.totalSales || 0} 
          loading={loading}
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          }
        />
      </div>

      <div className="glass-card overflow-hidden rounded-2xl border border-border-subtle shadow-card card-accent-top">
        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 shimmer rounded-xl" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <EmptyState 
            title="No sales yet" 
            description="Purchased customer transaction orders will list here." 
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="pv-table">
              <thead>
                <tr>
                  <th>Order Reference ID</th>
                  <th>Plugin</th>
                  <th>Customer</th>
                  <th>Amount Paid</th>
                  <th>Date Purchased</th>
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
                    <td className="font-semibold text-text-primary">{order.plugin?.name || 'WordPress Plugin'}</td>
                    <td className="text-text-secondary">{order.customer?.name || 'N/A'}</td>
                    <td className="font-bold font-mono text-accent">{formatCurrency(order.amount)}</td>
                    <td>{formatDate(order.created_at)}</td>
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