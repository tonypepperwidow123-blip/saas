import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { developerService } from '../../services/developer.service';
import PageHeader from '../../components/shared/PageHeader';
import StatCard from '../../components/shared/StatCard';
import StatusBadge from '../../components/shared/StatusBadge';
import { formatCurrency } from '../../utils/formatters';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/auth.store';

function Panel({ title, link, children }) {
  return (
    <div style={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.055)', background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.055)' }}>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: '700', fontSize: '14px', color: 'var(--text-primary)' }}>{title}</h2>
        {link && (
          <Link to={link} style={{ fontSize: '12px', color: 'var(--accent)', textDecoration: 'none', fontFamily: 'DM Sans, sans-serif', fontWeight: '500' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent-hover)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--accent)'; }}>
            View all →
          </Link>
        )}
      </div>
      <div style={{ padding: '8px 12px' }}>{children}</div>
    </div>
  );
}

function RowItem({ to, primary, secondary, badge }) {
  const content = (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '10px 8px', borderRadius: '10px',
      transition: 'background 0.15s ease',
    }}
    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
      <div>
        <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', fontFamily: 'DM Sans, sans-serif' }}>{primary}</p>
        {secondary && <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif', marginTop: '2px' }}>{secondary}</p>}
      </div>
      {badge}
    </div>
  );

  if (to) return <Link to={to} style={{ textDecoration: 'none', display: 'block' }}>{content}</Link>;
  return content;
}

function SkeletonRow() {
  return (
    <div style={{ padding: '10px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <div style={{ width: '130px', height: '13px', borderRadius: '6px', background: 'rgba(255,255,255,0.06)', animation: 'shimmer 1.8s ease infinite' }} />
        <div style={{ width: '70px', height: '11px', borderRadius: '5px', background: 'rgba(255,255,255,0.04)', animation: 'shimmer 1.8s ease infinite' }} />
      </div>
      <div style={{ width: '55px', height: '20px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', animation: 'shimmer 1.8s ease infinite' }} />
    </div>
  );
}

export default function DeveloperDashboard() {
  const [stats, setStats]               = useState(null);
  const [plugins, setPlugins]           = useState([]);
  const [recentLicenses, setRecentLicenses] = useState([]);
  const [loading, setLoading]           = useState(true);
  const userId = useAuthStore(state => state.user?.id);

  const fetchData = useCallback(async () => {
    try {
      const response = await developerService.getStats();
      if (response.success) {
        setStats(response.data);
        setRecentLicenses(response.data.recentLicenses || []);
      }
      const pluginsRes = await developerService.getMyPlugins({ limit: 5 });
      if (pluginsRes.success) setPlugins(pluginsRes.data.items);
    } catch (error) {
      console.warn('Dashboard error:', error?.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!userId) return;
    fetchData();
    const licensesChannel = supabase.channel('developer-licenses-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'licenses' }, () => fetchData()).subscribe();
    return () => { supabase.removeChannel(licensesChannel); };
  }, [userId, fetchData]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fade-in 0.4s ease forwards' }}>
      <PageHeader
        title="Dashboard"
        description="Overview of your plugin business"
        actions={
          <Link
            to="/developer/upload"
            className="btn-amber"
            style={{ padding: '9px 18px', borderRadius: '10px', fontSize: '13px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <svg style={{ width: '14px', height: '14px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Upload Plugin
          </Link>
        }
      />

      {/* Stats */}
      <div style={{ display: 'grid', gap: '14px', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
        <StatCard title="Total Revenue"    value={stats?.totalRevenue || 0}    currency loading={loading} />
        <StatCard title="Total Downloads"  value={stats?.totalDownloads || 0}  loading={loading} />
        <StatCard title="Active Licenses"  value={stats?.activeLicenses || 0}  loading={loading} />
        <StatCard title="Total Plugins"    value={stats?.totalPlugins || 0}    loading={loading} />
      </div>

      {/* Panels */}
      <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))' }}>
        <Panel title="My Plugins" link="/developer/plugins">
          {loading ? (
            <><SkeletonRow /><SkeletonRow /></>
          ) : plugins.length === 0 ? (
            <p style={{ padding: '24px 0', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif' }}>No plugins yet</p>
          ) : (
            plugins.map((plugin) => (
              <RowItem
                key={plugin.id}
                to={`/plugins/${plugin.id}`}
                primary={plugin.name}
                secondary={`${plugin.download_count || 0} downloads`}
                badge={<StatusBadge status={plugin.status} size="sm" />}
              />
            ))
          )}
        </Panel>

        <Panel title="Recent Licenses" link="/developer/licenses">
          {loading ? (
            <><SkeletonRow /><SkeletonRow /></>
          ) : recentLicenses.length === 0 ? (
            <p style={{ padding: '24px 0', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif' }}>No licenses yet</p>
          ) : (
            recentLicenses.map((license) => (
              <RowItem
                key={license.id}
                primary={license.plugin?.name}
                secondary={license.customer?.name}
                badge={<StatusBadge status={license.status} size="sm" />}
              />
            ))
          )}
        </Panel>
      </div>
    </div>
  );
}