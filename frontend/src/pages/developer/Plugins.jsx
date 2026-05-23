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
    <div className="space-y-6 page-enter">
      <PageHeader
        title="My Plugins"
        description="Manage your WordPress plugin listings and distributions"
        actions={
          <Link 
            to="/developer/upload" 
            className="btn-amber px-4 py-2 rounded-xl text-sm font-semibold inline-flex items-center gap-2 shadow-glow-sm hover:shadow-glow transition-all"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Upload New Plugin
          </Link>
        }
      />

      <div className="glass-card overflow-hidden rounded-2xl border border-border-subtle shadow-card card-accent-top">
        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 shimmer rounded-xl" />
            ))}
          </div>
        ) : plugins.length === 0 ? (
          <EmptyState 
            title="No plugins yet" 
            description="Upload your first WordPress plugin to start selling to our growing community."
            action={
              <Link 
                to="/developer/upload" 
                className="btn-amber px-5 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2"
              >
                Upload Your First Plugin
              </Link>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="pv-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Slug</th>
                  <th>Status</th>
                  <th>Downloads</th>
                  <th>Version</th>
                  <th>Date Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {plugins.map(plugin => (
                  <tr key={plugin.id}>
                    <td className="font-semibold text-text-primary">
                      <Link to={`/plugins/${plugin.id}`} className="hover:text-accent transition-colors">
                        {plugin.name}
                      </Link>
                    </td>
                    <td>
                      <span className="font-mono text-xs text-text-muted bg-bg-base/50 px-2 py-0.5 rounded border border-border-subtle">
                        {plugin.slug}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={plugin.status} size="sm" />
                    </td>
                    <td className="font-mono text-text-secondary">
                      {plugin.download_count || 0}
                    </td>
                    <td>
                      {plugin.current_version ? (
                        <span className="font-mono text-xs px-2 py-0.5 bg-accent-dim text-accent rounded border border-border-accent/35">
                          v{plugin.current_version}
                        </span>
                      ) : (
                        <span className="text-text-muted">-</span>
                      )}
                    </td>
                    <td>{formatDate(plugin.created_at)}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        {/* Upload New Version */}
                        <Link
                          to={`/developer/plugins/${plugin.id}/upload-version`}
                          className="btn-ghost px-3 py-1.5 text-xs font-semibold rounded-lg inline-flex items-center gap-1.5 transition-all"
                        >
                          <svg className="h-3.5 w-3.5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          {plugin.current_version ? 'New Version' : 'Upload ZIP'}
                        </Link>

                        {/* Delete Plugin */}
                        <button
                          onClick={() => setConfirmDelete(plugin)}
                          disabled={deletingId === plugin.id}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-danger/30 bg-danger/10 px-3 py-1.5 text-xs font-semibold text-danger hover:bg-danger hover:text-black transition-all disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in-fast">
          <div className="w-full max-w-md rounded-2xl border border-danger/25 bg-bg-card p-6 shadow-2xl glass-card card-accent-top">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-danger/15 border border-danger/20">
                <svg className="h-5 w-5 text-danger animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-text-primary">Delete Plugin</h3>
                <p className="text-xs text-text-muted">This operation is irreversible</p>
              </div>
            </div>

            <p className="text-sm text-text-secondary mb-3">
              You are about to permanently delete:
            </p>
            <div className="rounded-xl bg-bg-elevated border border-border-subtle px-4 py-3 mb-4">
              <p className="font-bold text-text-primary text-md">{confirmDelete.name}</p>
              <p className="text-xs text-text-muted mt-1 font-mono">
                slug: {confirmDelete.slug} · {confirmDelete.download_count || 0} downloads
              </p>
            </div>

            <div className="rounded-xl bg-danger/5 border border-danger/20 px-4 py-3 mb-5">
              <p className="text-xs text-danger/90 leading-relaxed">
                ⚠️ <strong>Warning:</strong> Deleting this plugin will permanently delete the plugin listing, all uploaded ZIP versions, and all version history. Existing license holders will lose download access.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 rounded-xl border border-border-strong px-4 py-2.5 text-sm font-semibold text-text-secondary hover:bg-bg-elevated transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="flex-1 rounded-xl bg-danger px-4 py-2.5 text-sm font-bold text-black hover:bg-red-600 hover:text-white transition-all shadow-glow-sm"
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