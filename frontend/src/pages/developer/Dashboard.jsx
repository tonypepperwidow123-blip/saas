import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { developerService } from '../../services/developer.service';
import PageHeader from '../../components/shared/PageHeader';
import StatCard from '../../components/shared/StatCard';
import StatusBadge from '../../components/shared/StatusBadge';
import { formatCurrency } from '../../utils/formatters';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/auth.store';

export default function DeveloperDashboard() {
  const [stats, setStats] = useState(null);
  const [plugins, setPlugins] = useState([]);
  const [recentLicenses, setRecentLicenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = useAuthStore(state => state.user?.id);

  const fetchData = useCallback(async () => {
    try {
      const response = await developerService.getStats();
      if (response.success) {
        setStats(response.data);
        setRecentLicenses(response.data.recentLicenses || []);
      }
      const pluginsRes = await developerService.getMyPlugins({ limit: 5 });
      if (pluginsRes.success) {
        setPlugins(pluginsRes.data.items);
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

    // Real-time subscription for licenses (filter by plugin ownership)
    const licensesChannel = supabase
      .channel('developer-licenses-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'licenses' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(licensesChannel);
    };
  }, [userId, fetchData]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Overview of your plugin business"
        actions={
          <Link
            to="/developer/upload"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
          >
            Upload Plugin
          </Link>
        }
      />

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Revenue" value={stats?.totalRevenue || 0} currency loading={loading} />
        <StatCard title="Total Downloads" value={stats?.totalDownloads || 0} loading={loading} />
        <StatCard title="Active Licenses" value={stats?.activeLicenses || 0} loading={loading} />
        <StatCard title="Total Plugins" value={stats?.totalPlugins || 0} loading={loading} />
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Plugins */}
        <div className="rounded-xl border border-border-subtle bg-bg-card">
          <div className="flex items-center justify-between border-b border-border-subtle px-6 py-4">
            <h2 className="font-semibold text-text-primary">My Plugins</h2>
            <Link to="/developer/plugins" className="text-sm text-accent hover:text-accent-hover">
              View all
            </Link>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="space-y-3"><div className="h-12 animate-pulse rounded bg-bg-elevated" /><div className="h-12 animate-pulse rounded bg-bg-elevated" /></div>
            ) : plugins.length === 0 ? (
              <p className="text-center text-sm text-text-muted py-8">No plugins yet</p>
            ) : (
              <div className="space-y-4">
                {plugins.map((plugin) => (
                  <Link
                    key={plugin.id}
                    to={`/plugins/${plugin.id}`}
                    className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-bg-elevated"
                  >
                    <div>
                      <p className="font-medium text-text-primary">{plugin.name}</p>
                      <p className="text-xs text-text-muted">{plugin.download_count || 0} downloads</p>
                    </div>
                    <StatusBadge status={plugin.status} size="sm" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Licenses */}
        <div className="rounded-xl border border-border-subtle bg-bg-card">
          <div className="flex items-center justify-between border-b border-border-subtle px-6 py-4">
            <h2 className="font-semibold text-text-primary">Recent Licenses</h2>
            <Link to="/developer/licenses" className="text-sm text-accent hover:text-accent-hover">
              View all
            </Link>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="space-y-3"><div className="h-12 animate-pulse rounded bg-bg-elevated" /><div className="h-12 animate-pulse rounded bg-bg-elevated" /></div>
            ) : recentLicenses.length === 0 ? (
              <p className="text-center text-sm text-text-muted py-8">No licenses yet</p>
            ) : (
              <div className="space-y-4">
                {recentLicenses.map((license) => (
                  <div key={license.id} className="flex items-center justify-between rounded-lg p-3">
                    <div>
                      <p className="font-medium text-text-primary">{license.plugin?.name}</p>
                      <p className="text-xs text-text-muted">{license.customer?.name}</p>
                    </div>
                    <StatusBadge status={license.status} size="sm" />
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