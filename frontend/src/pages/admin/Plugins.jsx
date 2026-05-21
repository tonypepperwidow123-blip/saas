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
    <div className="space-y-6">
      <PageHeader title="Plugins" description="Manage all plugin submissions" />

      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="rounded-lg border border-border-subtle bg-bg-elevated px-4 py-2 text-text-primary focus:border-accent focus:outline-none"
      >
        <option value="">All Status</option>
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
        <option value="suspended">Suspended</option>
      </select>

      <div className="rounded-xl border border-border-subtle bg-bg-card overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-16 animate-pulse rounded bg-bg-elevated" />)}</div>
        ) : plugins.length === 0 ? (
          <EmptyState title="No plugins" description="No plugins found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-subtle bg-bg-elevated text-left">
                  <th className="px-6 py-3 text-sm font-medium text-text-secondary">Plugin</th>
                  <th className="px-6 py-3 text-sm font-medium text-text-secondary">Developer</th>
                  <th className="px-6 py-3 text-sm font-medium text-text-secondary">Price</th>
                  <th className="px-6 py-3 text-sm font-medium text-text-secondary">Status</th>
                  <th className="px-6 py-3 text-sm font-medium text-text-secondary">Date</th>
                  <th className="px-6 py-3 text-sm font-medium text-text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {plugins.map(plugin => (
                  <tr key={plugin.id} className="hover:bg-bg-elevated">
                    <td className="px-6 py-4">
                      <div className="font-medium text-text-primary">{plugin.name}</div>
                      <div className="text-xs text-text-muted">{plugin.slug}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">{plugin.developer?.name || 'N/A'}</td>
                    <td className="px-6 py-4">{plugin.price === 0 ? 'Free' : formatCurrency(plugin.price)}</td>
                    <td className="px-6 py-4"><StatusBadge status={plugin.status} size="sm" /></td>
                    <td className="px-6 py-4 text-sm text-text-muted">{formatDate(plugin.created_at)}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {plugin.status === 'pending' && (
                          <>
                            <button onClick={() => handleApprove(plugin.id)} disabled={actionLoading === plugin.id}
                              className="rounded-lg bg-success px-3 py-1.5 text-xs font-medium text-white hover:bg-success/80 disabled:opacity-50">
                              Approve
                            </button>
                            <button onClick={() => handleReject(plugin.id)} disabled={actionLoading === plugin.id}
                              className="rounded-lg bg-danger px-3 py-1.5 text-xs font-medium text-white hover:bg-danger/80 disabled:opacity-50">
                              Reject
                            </button>
                          </>
                        )}
                        {plugin.status === 'approved' && (
                          <button onClick={() => handleSuspend(plugin.id)} disabled={actionLoading === plugin.id}
                            className="rounded-lg bg-warning px-3 py-1.5 text-xs font-medium text-white hover:bg-warning/80 disabled:opacity-50">
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