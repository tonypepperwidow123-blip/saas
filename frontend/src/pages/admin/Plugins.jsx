import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { adminService } from '../../services/admin.service';
import PageHeader from '../../components/shared/PageHeader';
import StatusBadge from '../../components/shared/StatusBadge';
import EmptyState from '../../components/shared/EmptyState';
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function AdminPlugins() {
  const [plugins, setPlugins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchPlugins();
  }, [statusFilter]);

  const fetchPlugins = async () => {
    try {
      const response = await adminService.getPlugins({ status: statusFilter, limit: 50 });
      if (response.success) {
        setPlugins(response.data.items);
      }
    } catch (error) {
      console.warn('Fetch error:', error?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await adminService.approvePlugin(id);
      toast.success('Plugin approved');
      fetchPlugins();
    } catch (error) {
      toast.error('Failed to approve');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    setActionLoading(id);
    try {
      await adminService.rejectPlugin(id, reason);
      toast.success('Plugin rejected');
      fetchPlugins();
    } catch (error) {
      toast.error('Failed to reject');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSuspend = async (id) => {
    if (!confirm('Suspend this plugin?')) return;
    setActionLoading(id);
    try {
      await adminService.suspendPlugin(id);
      toast.success('Plugin suspended');
      fetchPlugins();
    } catch (error) {
      toast.error('Failed to suspend');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6 page-enter">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight font-display">Plugin Directory</h1>
          <p className="text-xs text-text-secondary mt-0.5">Moderate, audit, and approve plugin listings in the marketplace</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 bg-bg-surface/30 p-4 rounded-2xl border border-border-subtle max-w-xs">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field py-2 text-sm cursor-pointer"
        >
          <option value="">All Listings</option>
          <option value="pending">Pending Review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      <div className="glass-card overflow-hidden rounded-2xl border border-border-subtle shadow-card card-accent-top">
        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 shimmer rounded-xl" />
            ))}
          </div>
        ) : plugins.length === 0 ? (
          <EmptyState title="No plugins found" description="No plugin listings match your selection filter." />
        ) : (
          <div className="overflow-x-auto">
            <table className="pv-table">
              <thead>
                <tr>
                  <th>Plugin Detail</th>
                  <th>Developer</th>
                  <th>Pricing</th>
                  <th>Status</th>
                  <th>Submitted Date</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {plugins.map(plugin => (
                  <tr key={plugin.id}>
                    <td>
                      <div>
                        <p className="font-semibold text-text-primary">{plugin.name}</p>
                        <p className="text-xs text-text-muted mt-0.5 font-mono">{plugin.slug}</p>
                      </div>
                    </td>
                    <td className="text-text-secondary text-sm">{plugin.developer?.name || 'N/A'}</td>
                    <td className="font-mono text-sm">
                      {plugin.price === 0 ? (
                        <span className="text-success text-xs font-semibold uppercase tracking-wider bg-success-dim/10 border border-success/20 px-2 py-0.5 rounded">Free</span>
                      ) : (
                        <span className="text-text-primary font-medium">{formatCurrency(plugin.price)}</span>
                      )}
                    </td>
                    <td>
                      <StatusBadge status={plugin.status} size="sm" />
                    </td>
                    <td>{formatDate(plugin.created_at)}</td>
                    <td>
                      <div className="flex gap-2 justify-end">
                        {plugin.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleApprove(plugin.id)} 
                              disabled={actionLoading === plugin.id}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-success/25 bg-success-dim/20 px-2.5 py-1.5 text-xs font-semibold text-success hover:bg-success hover:text-black transition-all disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleReject(plugin.id)} 
                              disabled={actionLoading === plugin.id}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-danger/25 bg-danger-dim/20 px-2.5 py-1.5 text-xs font-semibold text-danger hover:bg-danger hover:text-black transition-all disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {plugin.status === 'approved' && (
                          <button 
                            onClick={() => handleSuspend(plugin.id)} 
                            disabled={actionLoading === plugin.id}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-warning/25 bg-warning-dim/20 px-2.5 py-1.5 text-xs font-semibold text-warning hover:bg-warning hover:text-black transition-all disabled:opacity-50"
                          >
                            Suspend
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