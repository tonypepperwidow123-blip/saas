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

const supabaseMutate = async (endpoint, method = 'PATCH', body = null) => {
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

export default function AdminLicenses() {
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchLicenses();
  }, [statusFilter]);

  const fetchLicenses = async () => {
    try {
      let endpoint = '/licenses?order=created_at.desc&limit=100';
      if (statusFilter) {
        endpoint = `/licenses?status=eq.${statusFilter}&order=created_at.desc&limit=100`;
      }

      const { data, error } = await supabaseFetch(endpoint);
      if (error) throw new Error(error);

      // Get activations and site URLs for each license
      const licensesWithCount = await Promise.all((data || []).map(async (lic) => {
        const { data: activations, error: actErr } = await supabaseFetch(`/activations?license_id=eq.${lic.id}&select=id,site_url`);
        return {
          ...lic,
          activationsCount: (!actErr && activations) ? activations.length : 0,
          activeSiteUrls: (!actErr && activations) ? activations.map(a => a.site_url).filter(Boolean) : []
        };
      }));

      setLicenses(licensesWithCount);
    } catch (error) {
      console.warn('Fetch error:', error?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async (id) => {
    if (!confirm('Suspend this license?')) return;
    setActionLoading(id);
    try {
      const result = await supabaseMutate(`/licenses?id=eq.${id}`, 'PATCH', { status: 'suspended' });
      if (result.error) throw new Error(result.error);
      toast.success('License suspended');
      fetchLicenses();
    } catch (error) {
      toast.error('Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRevoke = async (id) => {
    if (!confirm('REVOKE this license permanently? This cannot be undone!')) return;
    setActionLoading(id);
    try {
      const result = await supabaseMutate(`/licenses?id=eq.${id}`, 'PATCH', { status: 'revoked' });
      if (result.error) throw new Error(result.error);
      toast.success('License revoked');
      fetchLicenses();
    } catch (error) {
      toast.error('Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleActivate = async (id) => {
    setActionLoading(id);
    try {
      const result = await supabaseMutate(`/licenses?id=eq.${id}`, 'PATCH', { status: 'active' });
      if (result.error) throw new Error(result.error);
      toast.success('License activated');
      fetchLicenses();
    } catch (error) {
      toast.error('Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Licenses" description="Manage all platform licenses" />

      <div className="flex flex-wrap gap-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-border-subtle bg-bg-elevated px-4 py-2 text-text-primary focus:border-accent focus:outline-none"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="expired">Expired</option>
          <option value="revoked">Revoked</option>
        </select>
      </div>

      <div className="rounded-xl border border-border-subtle bg-bg-card overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-16 animate-pulse rounded bg-bg-elevated" />)}
          </div>
        ) : licenses.length === 0 ? (
          <EmptyState title="No licenses" description="No licenses found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-subtle bg-bg-elevated text-left">
                  <th className="px-6 py-3 text-sm font-medium text-text-secondary">License Key</th>
                  <th className="px-6 py-3 text-sm font-medium text-text-secondary">Plugin</th>
                  <th className="px-6 py-3 text-sm font-medium text-text-secondary">Customer</th>
                  <th className="px-6 py-3 text-sm font-medium text-text-secondary">Activations</th>
                  <th className="px-6 py-3 text-sm font-medium text-text-secondary">Activated Sites</th>
                  <th className="px-6 py-3 text-sm font-medium text-text-secondary">Status</th>
                  <th className="px-6 py-3 text-sm font-medium text-text-secondary">Created</th>
                  <th className="px-6 py-3 text-sm font-medium text-text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {licenses.map(lic => (
                  <tr key={lic.id} className="hover:bg-bg-elevated">
                    <td className="px-6 py-4">
                      <code className="text-xs font-mono bg-bg-elevated px-2 py-1 rounded">{lic.license_key}</code>
                    </td>
                    <td className="px-6 py-4 font-medium text-text-primary">{lic.plugin?.name || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-text-primary">{lic.customer?.name || 'N/A'}</div>
                      <div className="text-xs text-text-muted">{lic.customer?.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm">{lic.activationsCount} / {lic.activation_limit}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {lic.activeSiteUrls?.length > 0 ? (
                        <ul className="list-disc list-inside">
                          {lic.activeSiteUrls.map((url, i) => (
                            <li key={i}><a href={url} target="_blank" rel="noreferrer" className="hover:text-accent truncate inline-block align-bottom max-w-[150px]">{url}</a></li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-text-muted italic">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4"><StatusBadge status={lic.status} size="sm" /></td>
                    <td className="px-6 py-4 text-sm text-text-muted">{formatDate(lic.created_at)}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {lic.status === 'active' && (
                          <button onClick={() => handleSuspend(lic.id)} disabled={actionLoading === lic.id}
                            className="rounded-lg bg-warning px-3 py-1.5 text-xs font-medium text-white hover:bg-warning/80 disabled:opacity-50">
                            Suspend
                          </button>
                        )}
                        {lic.status !== 'revoked' && (
                          <button onClick={() => handleRevoke(lic.id)} disabled={actionLoading === lic.id}
                            className="rounded-lg bg-danger px-3 py-1.5 text-xs font-medium text-white hover:bg-danger/80 disabled:opacity-50">
                            Revoke
                          </button>
                        )}
                        {(lic.status === 'suspended' || lic.status === 'expired') && (
                          <button onClick={() => handleActivate(lic.id)} disabled={actionLoading === lic.id}
                            className="rounded-lg bg-success px-3 py-1.5 text-xs font-medium text-white hover:bg-success/80 disabled:opacity-50">
                            Activate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}