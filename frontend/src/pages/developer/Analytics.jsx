import { useState, useEffect } from 'react';
import { developerService } from '../../services/developer.service';
import PageHeader from '../../components/shared/PageHeader';
import StatCard from '../../components/shared/StatCard';
import EmptyState from '../../components/shared/EmptyState';
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function DeveloperAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await developerService.getAnalytics();
      if (response.success) {
        setAnalytics(response.data);
      }
    } catch (error) {
      console.warn('Analytics error:', error?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" description="Track your plugin performance and sales" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Revenue" value={analytics?.totalRevenue || 0} />
        <StatCard title="Total Downloads" value={analytics?.totalDownloads || 0} />
        <StatCard title="Active Licenses" value={analytics?.activeLicenses || 0} />
        <StatCard title="Total Sales" value={analytics?.salesCount || 0} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border-subtle bg-bg-card">
          <div className="border-b border-border-subtle px-6 py-4">
            <h2 className="font-semibold text-text-primary">My Plugins</h2>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-12 animate-pulse rounded bg-bg-elevated" />)}</div>
            ) : analytics?.plugins?.length > 0 ? (
              <div className="space-y-3">
                {analytics.plugins.map(plugin => (
                  <div key={plugin.id} className="flex items-center justify-between rounded-lg p-3 hover:bg-bg-elevated">
                    <div>
                      <p className="font-medium text-text-primary">{plugin.name}</p>
                      <p className="text-xs text-text-muted">{plugin.download_count || 0} downloads</p>
                    </div>
                    <p className="text-sm text-text-muted">v{plugin.current_version || '1.0'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No data yet" description="Upload plugins to see analytics" />
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border-subtle bg-bg-card">
          <div className="border-b border-border-subtle px-6 py-4">
            <h2 className="font-semibold text-text-primary">Summary</h2>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-12 animate-pulse rounded bg-bg-elevated" />)}</div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-border-subtle">
                  <span className="text-text-secondary">Total Plugins</span>
                  <span className="font-medium text-text-primary">{analytics?.totalPlugins || 0}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border-subtle">
                  <span className="text-text-secondary">Total Downloads</span>
                  <span className="font-medium text-text-primary">{analytics?.totalDownloads || 0}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border-subtle">
                  <span className="text-text-secondary">Total Revenue</span>
                  <span className="font-medium text-text-primary">{formatCurrency(analytics?.totalRevenue || 0)}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-text-secondary">Active Licenses</span>
                  <span className="font-medium text-text-primary">{analytics?.activeLicenses || 0}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}