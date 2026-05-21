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

export default function PendingApprovals() {
  const [plugins, setPlugins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchPendingPlugins();
  }, []);

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
    if (!reason || reason.length < 10) {
      toast.error('Rejection reason must be at least 10 characters');
      return;
    }
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
    <div className="space-y-6">
      <PageHeader title="Pending Approvals" description="Review and approve plugin submissions" />

      <div className="rounded-xl border border-border-subtle bg-bg-card overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-24 animate-pulse rounded bg-bg-elevated" />)}
          </div>
        ) : plugins.length === 0 ? (
          <EmptyState title="No pending approvals" description="All plugin submissions have been reviewed" />
        ) : (
          <div className="divide-y divide-border-subtle">
            {plugins.map(plugin => (
              <div key={plugin.id} className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-text-primary">{plugin.name}</h3>
                      <StatusBadge status={plugin.status} size="sm" />
                    </div>
                    <p className="mt-1 text-sm text-text-muted">by {plugin.developer?.name || 'Unknown'}</p>
                    <p className="mt-2 text-text-secondary">{plugin.short_desc || plugin.description?.substring(0, 150)}</p>
                    <div className="mt-3 flex flex-wrap gap-4 text-sm text-text-muted">
                      <span>Version: {plugin.current_version || '1.0.0'}</span>
                      <span>Price: {plugin.price === 0 ? 'Free' : `₹${plugin.price}`}</span>
                      <span>Category: {plugin.category || 'Uncategorized'}</span>
                      <span>Submitted: {formatDate(plugin.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(plugin.id)}
                      disabled={actionLoading === plugin.id}
                      className="rounded-lg bg-success px-6 py-2 text-sm font-medium text-white hover:bg-success/80 disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(plugin.id)}
                      disabled={actionLoading === plugin.id}
                      className="rounded-lg bg-danger px-6 py-2 text-sm font-medium text-white hover:bg-danger/80 disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}