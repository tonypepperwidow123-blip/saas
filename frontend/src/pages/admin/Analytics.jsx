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

      const profiles = profilesRes.data || [];
      const developers = profiles.filter(p => p.role === 'developer').length;
      const customers = profiles.filter(p => p.role === 'customer').length;
      const totalUsers = profiles.length;

      const plugins = pluginsRes.data || [];
      const approvedPlugins = plugins.filter(p => p.status === 'approved').length;
      const pendingPlugins = plugins.filter(p => p.status === 'pending').length;
      const totalPlugins = plugins.length;

      const licenses = licensesRes.data || [];
      const activeLicenses = licenses.filter(l => l.status === 'active').length;
      const totalLicenses = licenses.length;

      const orders = ordersRes.data || [];
      const totalRevenue = orders.reduce((sum, o) => sum + Number(o.amount || 0), 0) || 0;

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
      // Silent fail
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 page-enter">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight font-display">System Analytics</h1>
          <p className="text-xs text-text-secondary mt-0.5">Platform insights, product distribution, and performance metrics</p>
        </div>
      </div>

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
        <div className="glass-card p-6 border border-border-subtle shadow-card card-accent-top">
          <h3 className="mb-5 font-bold text-text-primary text-sm uppercase tracking-wider font-display">User Distribution</h3>
          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-text-secondary">Developers</span>
                <span className="font-mono text-accent">{stats?.users?.developers || 0}</span>
              </div>
              <div className="mt-2 h-2.5 w-full rounded-full bg-white/[0.03] border border-white/[0.05] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.3)] transition-all duration-500"
                  style={{ width: `${stats?.users?.total ? (stats.users.developers / stats.users.total * 100) : 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-text-secondary">Customers</span>
                <span className="font-mono text-accent2">{stats?.users?.customers || 0}</span>
              </div>
              <div className="mt-2 h-2.5 w-full rounded-full bg-white/[0.03] border border-white/[0.05] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-600 to-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)] transition-all duration-500"
                  style={{ width: `${stats?.users?.total ? (stats.users.customers / stats.users.total * 100) : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Plugin Status */}
        <div className="glass-card p-6 border border-border-subtle shadow-card card-accent-top">
          <h3 className="mb-5 font-bold text-text-primary text-sm uppercase tracking-wider font-display">Plugin Distribution</h3>
          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-text-secondary">Approved Listings</span>
                <span className="font-mono text-success">{stats?.plugins?.approved || 0}</span>
              </div>
              <div className="mt-2 h-2.5 w-full rounded-full bg-white/[0.03] border border-white/[0.05] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)] transition-all duration-500"
                  style={{ width: `${stats?.plugins?.total ? (stats.plugins.approved / stats.plugins.total * 100) : 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-text-secondary">Pending In Review</span>
                <span className="font-mono text-warning">{stats?.plugins?.pending || 0}</span>
              </div>
              <div className="mt-2 h-2.5 w-full rounded-full bg-white/[0.03] border border-white/[0.05] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.3)] transition-all duration-500"
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
        <div className="glass-card overflow-hidden border border-border-subtle shadow-card card-accent-top">
          <div className="border-b border-border-subtle bg-bg-surface/40 px-6 py-4">
            <h3 className="font-bold text-text-primary text-sm uppercase tracking-wider font-display">Top Plugins by Downloads</h3>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-10 shimmer rounded-xl" />
                ))}
              </div>
            ) : stats?.topPlugins?.length > 0 ? (
              <div className="space-y-4">
                {stats.topPlugins.map((plugin, i) => (
                  <div key={plugin.id} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-accent/20 bg-accent-dim/15 text-xs font-mono font-bold text-accent shadow-glow-sm">
                        {i + 1}
                      </span>
                      <span className="font-semibold text-text-primary group-hover:text-accent transition-colors text-sm">{plugin.name}</span>
                    </div>
                    <span className="font-mono text-xs text-text-muted bg-white/[0.03] border border-white/[0.05] px-2.5 py-1 rounded-md">
                      {plugin.download_count || 0} downloads
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-xs text-text-muted py-6 italic">No platform metrics logged yet.</p>
            )}
          </div>
        </div>

        {/* Top Developers */}
        <div className="glass-card overflow-hidden border border-border-subtle shadow-card card-accent-top">
          <div className="border-b border-border-subtle bg-bg-surface/40 px-6 py-4">
            <h3 className="font-bold text-text-primary text-sm uppercase tracking-wider font-display">Top Developers by Downloads</h3>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-10 shimmer rounded-xl" />
                ))}
              </div>
            ) : stats?.topDevelopers?.length > 0 ? (
              <div className="space-y-4">
                {stats.topDevelopers.map((dev, i) => (
                  <div key={dev.id} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-accent2/20 bg-accent2-dim/15 text-xs font-mono font-bold text-accent2 shadow-glow-sm">
                        {i + 1}
                      </span>
                      <span className="font-semibold text-text-primary group-hover:text-accent2 transition-colors text-sm">{dev.name}</span>
                    </div>
                    <span className="font-mono text-xs text-text-muted bg-white/[0.03] border border-white/[0.05] px-2.5 py-1 rounded-md">
                      {dev.downloads || 0} downloads
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-xs text-text-muted py-6 italic">No platform metrics logged yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}