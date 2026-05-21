import { useState, useEffect } from 'react';
import PageHeader from '../../components/shared/PageHeader';
import StatCard from '../../components/shared/StatCard';
import { formatCurrency } from '../../utils/formatters';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json'
};

// Helper function for REST API calls
const supabaseFetch = async (endpoint, options = {}) => {
  try {
    const url = `${SUPABASE_URL}/rest/v1${endpoint}`;
    const response = await fetch(url, { headers, ...options });

    let data;
    try {
      data = await response.json();
    } catch (e) {
      data = null;
    }

    if (!response.ok) {
      return { data: null, error: data?.message || `Request failed` };
    }

    return { data: Array.isArray(data) ? data : null, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Fetch all data in parallel using direct REST API
      const [
        profilesRes,
        pluginsRes,
        licensesRes,
        ordersRes,
        topPluginsRes
      ] = await Promise.all([
        supabaseFetch('/profiles?select=id,role'),
        supabaseFetch('/plugins?select=id,status,download_count,developer_id'),
        supabaseFetch('/licenses?select=id,status'),
        supabaseFetch('/orders?payment_status=eq.paid&select=amount'),
        supabaseFetch('/plugins?status=eq.approved&order=download_count.desc&limit=5&select=id,name,download_count'),
      ]);

      // Process profiles to get user counts
      const profiles = profilesRes.data || [];
      const developers = profiles.filter(p => p.role === 'developer').length;
      const customers = profiles.filter(p => p.role === 'customer').length;
      const totalUsers = profiles.length;

      // Process plugins to get status counts
      const plugins = pluginsRes.data || [];
      const approvedPlugins = plugins.filter(p => p.status === 'approved').length;
      const pendingPlugins = plugins.filter(p => p.status === 'pending').length;
      const totalPlugins = plugins.length;

      // Process licenses to get active count
      const licenses = licensesRes.data || [];
      const activeLicenses = licenses.filter(l => l.status === 'active').length;
      const totalLicenses = licenses.length;

      // Calculate revenue
      const orders = ordersRes.data || [];
      const totalRevenue = orders.reduce((sum, o) => sum + Number(o.amount || 0), 0) || 0;

      // Calculate top developers by downloads
      const devDownloads = {};
      plugins.forEach(p => {
        if (p.developer_id && p.status === 'approved') {
          devDownloads[p.developer_id] = (devDownloads[p.developer_id] || 0) + Number(p.download_count || 0);
        }
      });

      const topDevIds = Object.entries(devDownloads)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([id]) => id);

      // Get developer names
      let topDevelopers = [];
      if (topDevIds.length > 0) {
        const devIdsParam = topDevIds.join(',');
        const devsRes = await supabaseFetch(`/profiles?id=in.(${devIdsParam})&select=id,name`);
        const devs = devsRes.data || [];
        topDevelopers = devs.map(d => ({ ...d, downloads: devDownloads[d.id] }));
      }

      setStats({
        users: { total: totalUsers, developers, customers },
        plugins: { total: totalPlugins, approved: approvedPlugins, pending: pendingPlugins },
        licenses: { total: totalLicenses, active: activeLicenses },
        orders: { total: orders.length, paid: orders.length },
        revenue: totalRevenue,
        topPlugins: topPluginsRes.data || [],
        topDevelopers
      });
    } catch (error) {
      // Silent fail - UI will show empty state
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" description="Platform insights and statistics" />

      {/* Overview Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Revenue" value={stats?.revenue || 0} currency />
        <StatCard title="Total Users" value={stats?.users?.total || 0} loading={loading} />
        <StatCard title="Approved Plugins" value={stats?.plugins?.approved || 0} loading={loading} />
        <StatCard title="Active Licenses" value={stats?.licenses?.active || 0} loading={loading} />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* User Distribution */}
        <div className="rounded-xl border border-border-subtle bg-bg-card p-6">
          <h3 className="mb-4 font-semibold text-text-primary">User Distribution</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Developers</span>
                <span className="font-medium text-text-primary">{stats?.users?.developers || 0}</span>
              </div>
              <div className="mt-1 h-2 w-full rounded-full bg-bg-elevated">
                <div
                  className="h-2 rounded-full bg-accent"
                  style={{ width: `${stats?.users?.total ? (stats.users.developers / stats.users.total * 100) : 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Customers</span>
                <span className="font-medium text-text-primary">{stats?.users?.customers || 0}</span>
              </div>
              <div className="mt-1 h-2 w-full rounded-full bg-bg-elevated">
                <div
                  className="h-2 rounded-full bg-success"
                  style={{ width: `${stats?.users?.total ? (stats.users.customers / stats.users.total * 100) : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Plugin Status */}
        <div className="rounded-xl border border-border-subtle bg-bg-card p-6">
          <h3 className="mb-4 font-semibold text-text-primary">Plugin Status</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Approved</span>
                <span className="font-medium text-text-primary">{stats?.plugins?.approved || 0}</span>
              </div>
              <div className="mt-1 h-2 w-full rounded-full bg-bg-elevated">
                <div
                  className="h-2 rounded-full bg-success"
                  style={{ width: `${stats?.plugins?.total ? (stats.plugins.approved / stats.plugins.total * 100) : 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Pending Review</span>
                <span className="font-medium text-warning">{stats?.plugins?.pending || 0}</span>
              </div>
              <div className="mt-1 h-2 w-full rounded-full bg-bg-elevated">
                <div
                  className="h-2 rounded-full bg-warning"
                  style={{ width: `${stats?.plugins?.total ? (stats.plugins.pending / stats.plugins.total * 100) : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Lists */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Plugins */}
        <div className="rounded-xl border border-border-subtle bg-bg-card">
          <div className="border-b border-border-subtle px-6 py-4">
            <h3 className="font-semibold text-text-primary">Top Plugins by Downloads</h3>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="space-y-3">{[1, 2, 3, 4, 5].map(i => <div key={i} className="h-8 animate-pulse rounded bg-bg-elevated" />)}</div>
            ) : stats?.topPlugins?.length > 0 ? (
              <div className="space-y-3">
                {stats.topPlugins.map((plugin, i) => (
                  <div key={plugin.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 text-xs font-medium text-accent">{i + 1}</span>
                      <span className="font-medium text-text-primary">{plugin.name}</span>
                    </div>
                    <span className="text-sm text-text-muted">{plugin.download_count || 0} downloads</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-text-muted">No data yet</p>
            )}
          </div>
        </div>

        {/* Top Developers */}
        <div className="rounded-xl border border-border-subtle bg-bg-card">
          <div className="border-b border-border-subtle px-6 py-4">
            <h3 className="font-semibold text-text-primary">Top Developers by Downloads</h3>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="space-y-3">{[1, 2, 3, 4, 5].map(i => <div key={i} className="h-8 animate-pulse rounded bg-bg-elevated" />)}</div>
            ) : stats?.topDevelopers?.length > 0 ? (
              <div className="space-y-3">
                {stats.topDevelopers.map((dev, i) => (
                  <div key={dev.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500/10 text-xs font-medium text-purple-400">{i + 1}</span>
                      <span className="font-medium text-text-primary">{dev.name}</span>
                    </div>
                    <span className="text-sm text-text-muted">{dev.downloads || 0} downloads</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-text-muted">No data yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}