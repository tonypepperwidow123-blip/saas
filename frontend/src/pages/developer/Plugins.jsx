import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { pluginService } from '../../services/plugin.service';
import PageHeader from '../../components/shared/PageHeader';
import StatusBadge from '../../components/shared/StatusBadge';
import EmptyState from '../../components/shared/EmptyState';
import { formatDate } from '../../utils/formatters';

export default function DeveloperPlugins() {
  const [plugins, setPlugins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null); // plugin to confirm

  useEffect(() => {
    fetchPlugins();
  }, []);

  const fetchPlugins = async () => {
    try {
      const response = await pluginService.getMyPlugins({ limit: 50 });
      if (response.success) {
        setPlugins(response.data.items);
      }
    } catch (error) {
      console.warn('Failed to fetch plugins:', error?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (plugin) => {
    setDeletingId(plugin.id);
    setConfirmDelete(null);
    try {
      await pluginService.deletePlugin(plugin.id);
      toast.success(`"${plugin.name}" has been deleted`);
      setPlugins((prev) => prev.filter((p) => p.id !== plugin.id));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete plugin');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Plugins"
        description="Manage your plugin listings"
        actions={
          <Link to="/developer/upload" className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover">
            Upload New Plugin
          </Link>
        }
      />

      <div className="rounded-xl border border-border-subtle bg-bg-card overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-16 animate-pulse rounded bg-bg-elevated" />)}</div>
        ) : plugins.length === 0 ? (
          <EmptyState title="No plugins yet" description="Upload your first WordPress plugin to start selling"
            action={<Link to="/developer/upload" className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover">Upload Plugin</Link>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-subtle bg-bg-elevated text-left">
                  <th className="px-6 py-3 text-sm font-medium text-text-secondary">Name</th>
                  <th className="px-6 py-3 text-sm font-medium text-text-secondary">Slug</th>
                  <th className="px-6 py-3 text-sm font-medium text-text-secondary">Status</th>
                  <th className="px-6 py-3 text-sm font-medium text-text-secondary">Downloads</th>
                  <th className="px-6 py-3 text-sm font-medium text-text-secondary">Version</th>
                  <th className="px-6 py-3 text-sm font-medium text-text-secondary">Date</th>
                  <th className="px-6 py-3 text-sm font-medium text-text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {plugins.map(plugin => (
                  <tr key={plugin.id} className="hover:bg-bg-elevated transition-colors">
                    <td className="px-6 py-4">
                      <Link to={`/plugins/${plugin.id}`} className="font-medium text-text-primary hover:text-accent">
                        {plugin.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-muted">{plugin.slug}</td>
                    <td className="px-6 py-4"><StatusBadge status={plugin.status} size="sm" /></td>
                    <td className="px-6 py-4 text-sm text-text-secondary">{plugin.download_count || 0}</td>
                    <td className="px-6 py-4 text-sm text-text-secondary">{plugin.current_version || '-'}</td>
                    <td className="px-6 py-4 text-sm text-text-muted">{formatDate(plugin.created_at)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {/* Upload New Version */}
                        <Link
                          to={`/developer/plugins/${plugin.id}/upload-version`}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-accent-hover transition-colors"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          {plugin.current_version ? 'Upload New Version' : 'Upload ZIP'}
                        </Link>

                        {/* Delete Plugin */}
                        <button
                          onClick={() => setConfirmDelete(plugin)}
                          disabled={deletingId === plugin.id}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                        >
                          {deletingId === plugin.id ? (
                            <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                          ) : (
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Confirm Delete Modal ── */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-red-500/20 bg-bg-card p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/15">
                <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text-primary">Delete Plugin</h3>
                <p className="text-sm text-text-muted">This action cannot be undone</p>
              </div>
            </div>

            <p className="text-sm text-text-secondary mb-2">
              You are about to permanently delete:
            </p>
            <div className="rounded-lg bg-bg-elevated border border-border-subtle px-4 py-3 mb-4">
              <p className="font-semibold text-text-primary">{confirmDelete.name}</p>
              <p className="text-xs text-text-muted mt-0.5">
                Slug: {confirmDelete.slug} · {confirmDelete.download_count || 0} downloads
              </p>
            </div>

            <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 mb-5">
              <p className="text-xs text-red-400">
                ⚠️ This will permanently delete the plugin, all uploaded ZIP files, and all version history. Customers with existing licenses will no longer be able to download this plugin.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 rounded-lg border border-border-subtle px-4 py-2 text-sm font-medium text-text-secondary hover:bg-bg-elevated transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="flex-1 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 transition-colors"
              >
                Yes, Delete Plugin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}