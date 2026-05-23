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
    <div className="space-y-6 page-enter">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight font-display">License Keys</h1>
          <p className="text-xs text-text-secondary mt-0.5">Audit activation limits, active URLs, and license states</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 bg-bg-surface/30 p-4 rounded-2xl border border-border-subtle max-w-xs">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field py-2 text-sm cursor-pointer"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="expired">Expired</option>
          <option value="revoked">Revoked</option>
        </select>
      </div>

      <div className="glass-card overflow-hidden rounded-2xl border border-border-subtle shadow-card card-accent-top">
        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 shimmer rounded-xl" />
            ))}
          </div>
        ) : licenses.length === 0 ? (
          <EmptyState title="No licenses found" description="Adjust your filters or query to find active license keys." />
        ) : (
          <div className="overflow-x-auto">
            <table className="pv-table">
              <thead>
                <tr>
                  <th>License Key</th>
                  <th>Plugin</th>
                  <th>Buyer Profile</th>
                  <th>Activations</th>
                  <th>Activated Sites</th>
                  <th>Status</th>
                  <th>Issued Date</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {licenses.map(lic => (
                  <tr key={lic.id}>
                    <td>
                      <code className="text-xs font-mono font-bold text-accent select-all bg-accent-dim/10 border border-accent/20 px-2 py-1 rounded">
                        {lic.license_key}
                      </code>
                    </td>
                    <td className="font-semibold text-text-primary text-sm">{lic.plugin?.name || 'N/A'}</td>
                    <td>
                      <div>
                        <p className="text-sm font-semibold text-text-primary">{lic.customer?.name || 'N/A'}</p>
                        <p className="text-xs text-text-muted mt-0.5 font-mono">{lic.customer?.email}</p>
                      </div>
                    </td>
                    <td>
                      <span className="font-mono text-xs font-medium text-text-primary bg-bg-surface/50 border border-border-subtle px-2 py-1 rounded-lg">
                        {lic.activationsCount} / {lic.activation_limit}
                      </span>
                    </td>
                    <td className="text-xs text-text-secondary">
                      {lic.activeSiteUrls?.length > 0 ? (
                        <ul className="list-disc list-inside space-y-0.5">
                          {lic.activeSiteUrls.map((url, i) => (
                            <li key={i}>
                              <a 
                                href={url} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="text-accent2 hover:underline font-mono inline-block max-w-[140px] truncate"
                              >
                                {url}
                              </a>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-text-muted italic">No instances active</span>
                      )}
                    </td>
                    <td>
                      <StatusBadge status={lic.status} size="sm" />
                    </td>
                    <td className="text-text-muted text-xs">{formatDate(lic.created_at)}</td>
                    <td>
                      <div className="flex gap-2 justify-end">
                        {lic.status === 'active' && (
                          <button 
                            onClick={() => handleSuspend(lic.id)} 
                            disabled={actionLoading === lic.id}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-warning/25 bg-warning-dim/20 px-2.5 py-1.5 text-xs font-semibold text-warning hover:bg-warning hover:text-black transition-all disabled:opacity-50"
                          >
                            Suspend
                          </button>
                        )}
                        {lic.status !== 'revoked' && (
                          <button 
                            onClick={() => handleRevoke(lic.id)} 
                            disabled={actionLoading === lic.id}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-danger/25 bg-danger-dim/20 px-2.5 py-1.5 text-xs font-semibold text-danger hover:bg-danger hover:text-black transition-all disabled:opacity-50"
                          >
                            Revoke
                          </button>
                        )}
                        {(lic.status === 'suspended' || lic.status === 'expired') && (
                          <button 
                            onClick={() => handleActivate(lic.id)} 
                            disabled={actionLoading === lic.id}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-success/25 bg-success-dim/20 px-2.5 py-1.5 text-xs font-semibold text-success hover:bg-success hover:text-black transition-all disabled:opacity-50"
                          >
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