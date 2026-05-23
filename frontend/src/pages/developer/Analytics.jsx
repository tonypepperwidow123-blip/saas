import { useState, useEffect } from 'react';
import { developerService } from '../../services/developer.service';
import PageHeader from '../../components/shared/PageHeader';
import StatCard from '../../components/shared/StatCard';
import EmptyState from '../../components/shared/EmptyState';
import { formatCurrency } from '../../utils/formatters';

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
    <div className="space-y-6 page-enter">
      <PageHeader 
        title="Analytics" 
        description="Monitor product metrics, search volumes, download metrics, and gross proceeds" 
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Gross Revenue" 
          value={analytics?.totalRevenue || 0} 
          currency={true} 
          loading={loading}
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard 
          title="Total Downloads" 
          value={analytics?.totalDownloads || 0} 
          loading={loading}
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          }
        />
        <StatCard 
          title="Active Licenses" 
          value={analytics?.activeLicenses || 0} 
          loading={loading}
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          }
        />
        <StatCard 
          title="Total Sales" 
          value={analytics?.salesCount || 0} 
          loading={loading}
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          }
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Card: Plugins Breakdown */}
        <div className="glass-card border border-border-subtle rounded-2xl shadow-card card-accent-top overflow-hidden">
          <div className="border-b border-border-subtle px-6 py-4.5 bg-bg-surface/40">
            <h2 className="text-md font-bold text-text-primary tracking-wide">Plugin Performance</h2>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-14 shimmer rounded-xl" />
                ))}
              </div>
            ) : analytics?.plugins?.length > 0 ? (
              <div className="space-y-3">
                {analytics.plugins.map(plugin => (
                  <div 
                    key={plugin.id} 
                    className="flex items-center justify-between rounded-xl bg-bg-surface/30 hover:bg-accent-dim/15 border border-border-subtle/50 p-4 transition-all duration-250 group"
                  >
                    <div>
                      <p className="font-bold text-sm text-text-primary group-hover:text-accent transition-colors">{plugin.name}</p>
                      <p className="text-xs text-text-muted mt-0.5 font-mono">{plugin.download_count || 0} total downloads</p>
                    </div>
                    {plugin.current_version ? (
                      <span className="font-mono text-xs px-2.5 py-0.5 bg-bg-elevated border border-border-subtle text-text-secondary rounded-lg">
                        v{plugin.current_version}
                      </span>
                    ) : (
                      <span className="text-xs text-text-muted italic">No release</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState 
                title="No plugins yet" 
                description="Your WordPress extensions and listing metrics will display here." 
              />
            )}
          </div>
        </div>

        {/* Right Card: Performance Metrics Summary */}
        <div className="glass-card border border-border-subtle rounded-2xl shadow-card card-accent-top overflow-hidden">
          <div className="border-b border-border-subtle px-6 py-4.5 bg-bg-surface/40">
            <h2 className="text-md font-bold text-text-primary tracking-wide">Metrics Summary</h2>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-12 shimmer rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="space-y-4.5 font-medium text-sm">
                <div className="flex justify-between items-center py-2.5 border-b border-border-subtle">
                  <span className="text-text-secondary">Total Portfolio Products</span>
                  <span className="font-bold text-text-primary font-mono">{analytics?.totalPlugins || 0}</span>
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-border-subtle">
                  <span className="text-text-secondary">Cumulative Downloads</span>
                  <span className="font-bold text-text-primary font-mono">{analytics?.totalDownloads || 0}</span>
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-border-subtle">
                  <span className="text-text-secondary">Gross Revenue Sum</span>
                  <span className="font-bold text-accent font-mono">{formatCurrency(analytics?.totalRevenue || 0)}</span>
                </div>
                <div className="flex justify-between items-center py-2.5">
                  <span className="text-text-secondary">Active Activation Licenses</span>
                  <span className="font-bold text-text-primary font-mono">{analytics?.activeLicenses || 0}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}