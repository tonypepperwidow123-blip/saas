import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { customerService } from '../../services/customer.service';
import PageHeader from '../../components/shared/PageHeader';
import StatCard from '../../components/shared/StatCard';
import StatusBadge from '../../components/shared/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/auth.store';

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
      <div style={{ padding: '8px 12px' }}>
        {children}
      </div>
    </div>
  );
}

function RowItem({ primary, secondary, badge }) {
  return (
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
}

function SkeletonRow() {
  return (
    <div style={{ padding: '10px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <div style={{ width: '120px', height: '13px', borderRadius: '6px', background: 'rgba(255,255,255,0.06)', animation: 'shimmer 1.8s ease infinite' }} />
        <div style={{ width: '70px', height: '11px', borderRadius: '5px', background: 'rgba(255,255,255,0.04)', animation: 'shimmer 1.8s ease infinite' }} />
      </div>
      <div style={{ width: '55px', height: '20px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', animation: 'shimmer 1.8s ease infinite' }} />
    </div>
  );
}

export default function CustomerDashboard() {
  const [licenses, setLicenses] = useState([]);
  const [orders, setOrders]     = useState([]);
  const [stats, setStats]       = useState({ activeLicenses: 0, totalOrders: 0, activeActivations: 0 });
  const [loading, setLoading]   = useState(true);
  const userId = useAuthStore(state => state.user?.id);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, licensesRes, ordersRes] = await Promise.all([
        customerService.getStats(),
        customerService.getMyLicenses({ limit: 10 }),
        customerService.getMyOrders({ limit: 10 }),
      ]);
      if (statsRes.success)   setStats(statsRes.data);
      if (licensesRes.success) setLicenses(licensesRes.data.items);
      if (ordersRes.success)   setOrders(ordersRes.data.items);
    } catch (error) {
      console.warn('Dashboard error:', error?.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!userId) return;
    fetchData();
    const licensesChannel = supabase.channel('customer-licenses-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'licenses', filter: `customer_id=eq.${userId}` }, () => fetchData()).subscribe();
    const ordersChannel = supabase.channel('customer-orders-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `customer_id=eq.${userId}` }, () => fetchData()).subscribe();
    return () => { supabase.removeChannel(licensesChannel); supabase.removeChannel(ordersChannel); };
  }, [userId, fetchData]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fade-in 0.4s ease forwards' }}>
      <PageHeader title="Dashboard" description="Manage your plugin licenses" />

      <div style={{ display: 'grid', gap: '14px', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
        <StatCard title="Active Licenses"    value={stats.activeLicenses || 0}    loading={loading} />
        <StatCard title="Total Purchases"    value={stats.totalOrders || 0}        loading={loading} />
        <StatCard title="Active Activations" value={stats.activeActivations || 0}  loading={loading} />
      </div>

      <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))' }}>
        <Panel title="My Licenses" link="/customer/licenses">
          {loading ? (
            <><SkeletonRow /><SkeletonRow /><SkeletonRow /></>
          ) : licenses.length === 0 ? (
            <p style={{ padding: '24px 0', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif' }}>
              No licenses yet
            </p>
          ) : (
            licenses.slice(0, 5).map((license) => (
              <RowItem
                key={license.id}
                primary={license.plugin?.name}
                secondary={`v${license.plugin?.current_version}`}
                badge={<StatusBadge status={license.status} size="sm" />}
              />
            ))
          )}
        </Panel>

        <Panel title="Recent Orders" link="/customer/downloads">
          {loading ? (
            <><SkeletonRow /><SkeletonRow /><SkeletonRow /></>
          ) : orders.length === 0 ? (
            <p style={{ padding: '24px 0', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif' }}>
              No orders yet
            </p>
          ) : (
            orders.slice(0, 5).map((order) => (
              <RowItem
                key={order.id}
                primary={order.plugin?.name}
                secondary={`$${order.amount}`}
                badge={<StatusBadge status={order.payment_status} size="sm" />}
              />
            ))
          )}
        </Panel>
      </div>
    </div>
  );
}