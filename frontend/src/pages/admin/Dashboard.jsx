import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/admin.service';
import PageHeader from '../../components/shared/PageHeader';
import StatCard from '../../components/shared/StatCard';
import StatusBadge from '../../components/shared/StatusBadge';
import { formatCurrency } from '../../utils/formatters';
import { supabase } from '../../lib/supabase';

// Reusable glass panel component
function Panel({ title, link, linkLabel = 'View all', children }) {
  return (
    <div style={{
      borderRadius: '16px',
      border: '1px solid rgba(255,255,255,0.055)',
      background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.055)',
      }}>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: '700', fontSize: '14px', color: 'var(--text-primary)' }}>
          {title}
        </h2>
        {link && (
          <Link to={link} style={{ fontSize: '12px', color: 'var(--accent)', textDecoration: 'none', fontFamily: 'DM Sans, sans-serif', fontWeight: '500' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent-hover)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--accent)'; }}>
            {linkLabel} →
          </Link>
        )}
      </div>
      <div style={{ padding: '16px 20px' }}>
        {children}
      </div>
    </div>
  );
}

function RowItem({ primary, secondary, right, rightSub }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '10px 12px', borderRadius: '10px',
      transition: 'background 0.15s ease',
    }}
    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
      <div>
        <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', fontFamily: 'DM Sans, sans-serif' }}>{primary}</p>
        {secondary && <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif', marginTop: '1px' }}>{secondary}</p>}
      </div>
      <div style={{ textAlign: 'right' }}>
        {right}
        {rightSub && <div style={{ marginTop: '3px' }}>{rightSub}</div>}
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div style={{ padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ width: '120px', height: '13px', borderRadius: '6px', background: 'rgba(255,255,255,0.06)', animation: 'shimmer 1.8s ease infinite' }} />
        <div style={{ width: '80px', height: '11px', borderRadius: '5px', background: 'rgba(255,255,255,0.04)', animation: 'shimmer 1.8s ease infinite' }} />
      </div>
      <div style={{ width: '60px', height: '20px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', animation: 'shimmer 1.8s ease infinite' }} />
    </div>
  );
}

const quickLinks = [
  { to: '/admin/developers',    label: 'Developers',    icon: '💻', statKey: 'developers' },
  { to: '/admin/customers',     label: 'Customers',     icon: '🛒', statKey: 'customers'  },
  { to: '/admin/licenses',      label: 'Licenses',      icon: '🔑', statKey: 'licenses'   },
  { to: '/admin/analytics',     label: 'Analytics',     icon: '📊', statKey: null          },
];

export default function AdminDashboard() {
  const [stats, setStats]           = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const isSubscribed = useRef(false);

  const fetchData = useCallback(async () => {
    try {
      const response = await adminService.getStats();
      if (response && response.success) {
        setStats(response.data);
        setRecentOrders(response.data.recentOrders || []);
      } else if (response?.error) {
        setError(response.error);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isSubscribed.current) return;
    isSubscribed.current = true;
    setError(null);
    fetchData();

    // Real-time subscription for orders
    const ordersChannel = supabase.channel('admin-orders-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchData()).subscribe();
    const pluginsChannel = supabase.channel('admin-plugins-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'plugins' }, () => fetchData()).subscribe();
    const profilesChannel = supabase.channel('admin-profiles-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => fetchData()).subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(pluginsChannel);
      supabase.removeChannel(profilesChannel);
      isSubscribed.current = false;
    };
  }, [fetchData]);

  const isLoading = loading || !stats;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fade-in 0.4s ease forwards' }}>
      <PageHeader title="Dashboard" description="Platform overview and management" />

      {/* Error Banner */}
      {error && (
        <div style={{
          padding: '14px 16px', borderRadius: '12px',
          background: 'rgba(244,63,94,0.08)',
          border: '1px solid rgba(244,63,94,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
        }}>
          <p style={{ fontSize: '13px', color: '#f43f5e', fontFamily: 'DM Sans, sans-serif' }}>⚠ {error}</p>
          <button
            onClick={fetchData}
            style={{ padding: '5px 12px', borderRadius: '8px', background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.3)', color: '#f43f5e', fontSize: '12px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Stats Row 1 */}
      <div style={{ display: 'grid', gap: '14px', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
        <StatCard title="Total Users"    value={stats?.users?.total ?? 0}      loading={isLoading} />
        <StatCard title="Developers"     value={stats?.users?.developers ?? 0} loading={isLoading} />
        <StatCard title="Plugins"        value={stats?.plugins?.total ?? 0}    loading={isLoading} />
        <StatCard title="Total Revenue"  value={stats?.revenue?.total ?? 0}    currency loading={isLoading} />
      </div>

      {/* Stats Row 2 */}
      <div style={{ display: 'grid', gap: '14px', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
        <StatCard title="Total Orders"      value={stats?.orders?.total ?? 0}    loading={isLoading} />
        <StatCard title="Active Licenses"   value={stats?.licenses?.total ?? 0}  loading={isLoading} />
        <StatCard title="Pending Approvals" value={stats?.plugins?.pending ?? 0} loading={isLoading} />
        <StatCard title="Customers"         value={stats?.users?.customers ?? 0} loading={isLoading} />
      </div>

      {/* Panels row */}
      <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))' }}>
        {/* Pending approvals */}
        <Panel title="Pending Approvals" link="/admin/pending-approvals">
          {isLoading ? (
            <><SkeletonRow /><SkeletonRow /></>
          ) : (stats?.plugins?.pending || 0) > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{
                padding: '14px',
                borderRadius: '10px',
                background: 'rgba(245,158,11,0.08)',
                border: '1px solid rgba(245,158,11,0.2)',
              }}>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: '600', fontSize: '13px', color: '#f59e0b' }}>
                  ⏳ {stats.plugins.pending} plugins awaiting review
                </p>
              </div>
              <Link
                to="/admin/pending-approvals"
                style={{
                  display: 'block', textAlign: 'center', padding: '10px', borderRadius: '10px',
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#000',
                  fontSize: '13px', fontWeight: '700', fontFamily: 'DM Sans, sans-serif', textDecoration: 'none',
                  boxShadow: '0 0 16px rgba(245,158,11,0.25)',
                }}
              >
                Review Now →
              </Link>
            </div>
          ) : (
            <p style={{ padding: '24px 0', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif' }}>
              ✓ No pending approvals
            </p>
          )}
        </Panel>

        {/* Recent Transactions */}
        <Panel title="Recent Transactions" link="/admin/transactions">
          {isLoading ? (
            <><SkeletonRow /><SkeletonRow /><SkeletonRow /></>
          ) : recentOrders.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {recentOrders.map(order => (
                <RowItem
                  key={order.id}
                  primary={order.plugin?.name || 'Unknown'}
                  secondary={order.customer?.name || 'Unknown'}
                  right={<span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', fontFamily: 'DM Sans, sans-serif' }}>{formatCurrency(order.amount)}</span>}
                  rightSub={<StatusBadge status={order.payment_status} size="sm" />}
                />
              ))}
            </div>
          ) : (
            <p style={{ padding: '24px 0', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif' }}>
              No recent transactions
            </p>
          )}
        </Panel>
      </div>

      {/* Quick Links Grid */}
      <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
        {quickLinks.map(({ to, label, icon, statKey }) => (
          <Link
            key={to}
            to={to}
            style={{
              borderRadius: '14px',
              border: '1px solid rgba(255,255,255,0.055)',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
              padding: '20px',
              textDecoration: 'none',
              display: 'flex', alignItems: 'center', gap: '14px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(245,158,11,0.25)';
              e.currentTarget.style.background = 'rgba(245,158,11,0.04)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.055)';
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)';
              e.currentTarget.style.transform = 'none';
            }}
          >
            <div style={{ fontSize: '24px', flexShrink: 0 }}>{icon}</div>
            <div>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: '700', fontSize: '14px', color: 'var(--text-primary)', marginBottom: '2px' }}>
                {label}
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif' }}>
                {statKey === 'developers' && `${stats?.users?.developers || 0} registered`}
                {statKey === 'customers'  && `${stats?.users?.customers || 0} registered`}
                {statKey === 'licenses'   && `${stats?.licenses?.total || 0} total`}
                {statKey === null && 'Platform insights'}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}