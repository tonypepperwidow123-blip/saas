import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import PageHeader from '../../components/shared/PageHeader';
import StatusBadge from '../../components/shared/StatusBadge';
import EmptyState from '../../components/shared/EmptyState';
import { formatDate } from '../../utils/formatters';

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

const supabaseMutate = async (endpoint, method = 'GET', body = null) => {
  try {
    const url = `${SUPABASE_URL}/rest/v1${endpoint}`;
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null
    });
    let data;
    try { data = await response.json(); } catch (e) { data = null; }
    if (!response.ok) return { error: data?.message || 'Operation failed' };
    return { success: true, data };
  } catch (error) {
    return { error: error.message };
  }
};

function SkeletonCard() {
  return (
    <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <div style={{ height: '18px', width: '200px', borderRadius: '6px', background: 'rgba(255,255,255,0.06)', marginBottom: '8px', animation: 'shimmer 1.8s ease infinite' }} />
      <div style={{ height: '12px', width: '140px', borderRadius: '5px', background: 'rgba(255,255,255,0.04)', marginBottom: '12px', animation: 'shimmer 1.8s ease infinite' }} />
      <div style={{ height: '80px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', animation: 'shimmer 1.8s ease infinite' }} />
    </div>
  );
}

export default function PendingApprovals() {
  const [plugins, setPlugins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => { fetchPendingPlugins(); }, []);

  const fetchPendingPlugins = async () => {
    try {
      const { data, error } = await supabaseFetch('/plugins?status=eq.pending&order=created_at.desc');
      if (error) throw new Error(error);
      setPlugins(data || []);
    } catch (error) {
      console.warn('Fetch error:', error?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      const result = await supabaseMutate(`/plugins?id=eq.${id}`, 'PATCH', { status: 'approved' });
      if (result.error) throw new Error(result.error);
      toast.success('Plugin approved and live in marketplace');
      fetchPendingPlugins();
    } catch (error) {
      toast.error('Failed to approve');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Enter rejection reason (min 10 characters):');
    if (!reason || reason.length < 10) { toast.error('Rejection reason must be at least 10 characters'); return; }
    setActionLoading(id);
    try {
      const result = await supabaseMutate(`/plugins?id=eq.${id}`, 'PATCH', { status: 'rejected', rejection_note: reason });
      if (result.error) throw new Error(result.error);
      toast.success('Plugin rejected');
      fetchPendingPlugins();
    } catch (error) {
      toast.error('Failed to reject');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fade-in 0.4s ease forwards' }}>
      <PageHeader title="Pending Approvals" description="Review and approve plugin submissions" />

      <div style={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.055)', background: 'linear-gradient(135deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.01) 100%)', overflow: 'hidden' }}>
        {loading ? (
          <><SkeletonCard /><SkeletonCard /><SkeletonCard /></>
        ) : plugins.length === 0 ? (
          <EmptyState title="No pending approvals" description="All plugin submissions have been reviewed" />
        ) : (
          plugins.map((plugin) => (
            <div
              key={plugin.id}
              style={{
                padding: '24px',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.015)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                {/* Plugin info */}
                <div style={{ flex: 1, minWidth: '240px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' }}>
                    <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: '700', fontSize: '16px', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                      {plugin.name}
                    </h3>
                    <StatusBadge status={plugin.status} size="sm" />
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif', marginBottom: '10px' }}>
                    by {plugin.developer?.name || 'Unknown Developer'}
                  </p>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', lineHeight: '1.6', marginBottom: '12px', maxWidth: '560px' }}>
                    {plugin.short_desc || plugin.description?.substring(0, 150)}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                    {[
                      { label: 'Version', value: plugin.current_version || '1.0.0' },
                      { label: 'Price',   value: plugin.price === 0 ? 'Free' : `₹${plugin.price}` },
                      { label: 'Category',value: plugin.category || 'Uncategorized' },
                      { label: 'Submitted',value: formatDate(plugin.created_at) },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '1px' }}>{label}</span>
                        <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', fontWeight: '500' }}>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
                  <button
                    onClick={() => handleApprove(plugin.id)}
                    disabled={actionLoading === plugin.id}
                    style={{
                      padding: '9px 20px', borderRadius: '10px',
                      background: 'rgba(16,185,129,0.12)',
                      border: '1px solid rgba(16,185,129,0.3)',
                      color: '#10b981',
                      fontSize: '13px', fontWeight: '600', fontFamily: 'DM Sans, sans-serif',
                      cursor: actionLoading === plugin.id ? 'not-allowed' : 'pointer',
                      opacity: actionLoading === plugin.id ? 0.5 : 1,
                      transition: 'all 0.18s ease', whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={e => { if (actionLoading !== plugin.id) { e.currentTarget.style.background = 'rgba(16,185,129,0.2)'; e.currentTarget.style.boxShadow = '0 0 14px rgba(16,185,129,0.2)'; }}}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.12)'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    ✓ Approve
                  </button>
                  <button
                    onClick={() => handleReject(plugin.id)}
                    disabled={actionLoading === plugin.id}
                    style={{
                      padding: '9px 20px', borderRadius: '10px',
                      background: 'rgba(244,63,94,0.1)',
                      border: '1px solid rgba(244,63,94,0.25)',
                      color: '#f43f5e',
                      fontSize: '13px', fontWeight: '600', fontFamily: 'DM Sans, sans-serif',
                      cursor: actionLoading === plugin.id ? 'not-allowed' : 'pointer',
                      opacity: actionLoading === plugin.id ? 0.5 : 1,
                      transition: 'all 0.18s ease', whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={e => { if (actionLoading !== plugin.id) { e.currentTarget.style.background = 'rgba(244,63,94,0.15)'; }}}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(244,63,94,0.1)'; }}
                  >
                    ✕ Reject
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}