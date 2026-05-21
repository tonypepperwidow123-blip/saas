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
    <div className="space-y-6">
      <PageHeader title="Revenue" description="Track your earnings from plugin sales" />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Total Revenue" value={stats?.totalRevenue || 0} currency />
        <StatCard title="This Month" value={stats?.thisMonth || 0} currency />
        <StatCard title="Total Sales" value={stats?.totalSales || 0} loading={loading} />
      </div>

      <div className="rounded-xl border border-border-subtle bg-bg-card overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-16 animate-pulse rounded bg-bg-elevated" />)}
          </div>
        ) : orders.length === 0 ? (
          <EmptyState title="No sales yet" description="Once customers purchase your plugins, you'll see revenue here" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-subtle bg-bg-elevated text-left">
                  <th className="px-6 py-3 text-sm font-medium text-text-secondary">Plugin</th>
                  <th className="px-6 py-3 text-sm font-medium text-text-secondary">Customer</th>
                  <th className="px-6 py-3 text-sm font-medium text-text-secondary">Amount</th>
                  <th className="px-6 py-3 text-sm font-medium text-text-secondary">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-bg-elevated">
                    <td className="px-6 py-4 font-medium text-text-primary">{order.plugin?.name || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-text-secondary">{order.customer?.name || 'N/A'}</td>
                    <td className="px-6 py-4 font-medium">{formatCurrency(order.amount)}</td>
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