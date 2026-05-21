import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { customerService } from '../../services/customer.service';
import PageHeader from '../../components/shared/PageHeader';
import StatusBadge from '../../components/shared/StatusBadge';
import EmptyState from '../../components/shared/EmptyState';
import { formatDate } from '../../utils/formatters';
import { toast } from 'sonner';

export default function CustomerLicenses() {
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    fetchLicenses();
  }, []);

  const fetchLicenses = async () => {
    try {
      const response = await customerService.getMyLicenses({ limit: 50 });
      if (response.success) {
        setLicenses(response.data.items);
      }
    } catch (error) {
      console.warn('Failed to fetch licenses:', error?.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  /**
   * Download a cross-origin URL with a custom filename.
   * The `download` attribute on <a> is ignored for cross-origin URLs, so we
   * fetch the file as a Blob first, build a local object URL, and click that.
   */
  const triggerDownload = async (url, filename) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch file');
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      // Release the object URL after a short delay
      setTimeout(() => URL.revokeObjectURL(objectUrl), 10000);
    } catch {
      // Fallback: open in new tab if blob fetch fails
      window.open(url, '_blank');
    }
  };

  const handleDownload = async (license) => {
    setDownloadingId(license.id);
    try {
      const response = await customerService.downloadPlugin(license.plugin_id);
      if (response.success && response.data?.download_url) {
        // Build a clean filename: plugin-slug-v1.0.0.zip
        // Use the actual plugin name for the downloaded file
        const pluginName = license.plugin?.name || license.plugin?.slug || 'plugin';
        const filename = `${pluginName}.zip`;
        // Blob fetch keeps spinner on while downloading
        await triggerDownload(response.data.download_url, filename);
        toast.success('Download started!');
      } else {
        toast.error('Download not available');
      }
    } catch (error) {
      const msg = error.response?.data?.error || error.message || '';
      if (msg.includes('version not found') || msg.includes('404')) {
        toast.error('Plugin file not available yet. The developer needs to upload the ZIP file.');
      } else {
        toast.error('Failed to start download');
      }
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Licenses"
        description="Your plugin licenses and activation keys"
      />

      {/* Activation Instructions Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
        <h3 className="text-lg font-semibold mb-2">📋 How to Activate Your Plugin</h3>
        <ol className="text-sm space-y-1 opacity-90">
          <li>1. <strong>Download</strong> the plugin ZIP file below</li>
          <li>2. <strong>Upload</strong> the plugin to your WordPress dashboard</li>
          <li>3. Go to <strong>Settings → Plugin License</strong> in WordPress</li>
          <li>4. <strong>Paste</strong> your Plugin Activation Key into the field</li>
          <li>5. Click <strong>Activate</strong> — the key can only be used <strong>ONCE</strong></li>
        </ol>
      </div>

      <div className="rounded-xl border border-border-subtle bg-bg-card overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">{[1, 2, 3, 4, 5].map(i => <div key={i} className="h-32 animate-pulse rounded bg-bg-elevated" />)}</div>
        ) : licenses.length === 0 ? (
          <EmptyState
            title="No licenses yet"
            description="Purchase plugins to get your license keys"
            action={<Link to="/shop" className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover">Browse Plugins</Link>}
          />
        ) : (
          <div className="divide-y divide-border-subtle">
            {licenses.map(lic => {
              // Combined key = license_key::activation_code  (what the WP plugin reads)
              const combinedKey = lic.activation_code
                ? `${lic.license_key}::${lic.activation_code}`
                : lic.license_key;

              return (
                <div key={lic.id} className="p-6 hover:bg-bg-elevated transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">

                    {/* Plugin Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <Link to={`/plugins/${lic.plugin?.id}`} className="text-lg font-semibold text-text-primary hover:text-accent">
                          {lic.plugin?.name || 'Unknown Plugin'}
                        </Link>
                        <StatusBadge status={lic.activation_code_used ? 'activated' : 'pending'} size="sm" />
                      </div>
                      <p className="text-sm text-text-muted mb-4">
                        Purchased on {formatDate(lic.created_at)}
                      </p>

                      {/* ── Single Plugin Activation Key Card ── */}
                      {!lic.activation_code_used ? (
                        <div className="rounded-xl border-2 border-dashed border-accent/40 bg-accent/5 p-5">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-white text-xs font-bold">🔑</span>
                              <span className="text-sm font-semibold text-text-primary uppercase tracking-wider">Plugin Activation Key</span>
                              <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-600 uppercase">One-Time Use</span>
                            </div>
                            <button
                              onClick={() => copyToClipboard(combinedKey, 'Activation Key')}
                              className="flex items-center gap-1.5 rounded-lg border border-accent/30 bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent hover:text-white transition-all"
                            >
                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                              Copy Key
                            </button>
                          </div>

                          <div className="rounded-lg bg-bg-card border border-border-subtle px-4 py-3">
                            <code className="block text-sm font-mono text-accent break-all leading-relaxed">
                              {combinedKey}
                            </code>
                          </div>

                          <p className="mt-2.5 text-xs text-text-muted">
                            ⚠️ Paste this key in your WordPress dashboard under <strong>Settings → Plugin License</strong>. It can only be used <strong>once</strong>.
                          </p>
                        </div>
                      ) : (
                        /* Already activated — show license key only */
                        <div className="space-y-3">
                          <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-4">
                            <div className="flex items-center gap-2 text-green-600 mb-2">
                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-sm font-semibold">Plugin Activated</span>
                            </div>
                            <p className="text-xs text-text-muted">Your activation key was used successfully. Your plugin is licensed.</p>
                          </div>

                          <div className="rounded-lg bg-bg-elevated border border-border-subtle p-3">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-xs text-text-muted uppercase tracking-wider">License Key (for reference)</span>
                              <button
                                onClick={() => copyToClipboard(lic.license_key, 'License Key')}
                                className="text-xs text-accent hover:underline"
                              >
                                Copy
                              </button>
                            </div>
                            <code className="text-xs font-mono text-text-secondary">{lic.license_key}</code>
                          </div>

                          {lic.activations?.length > 0 && (
                            <div className="rounded-lg bg-bg-elevated border border-border-subtle p-3">
                              <span className="block text-xs text-text-muted uppercase tracking-wider mb-2">Activated Sites</span>
                              <ul className="text-xs text-text-secondary list-disc list-inside">
                                {lic.activations.map((a, i) => (
                                  a.site_url ? <li key={i}><a href={a.site_url} target="_blank" rel="noreferrer" className="hover:text-accent truncate inline-block align-bottom max-w-[150px]">{a.site_url}</a></li> : null
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 shrink-0">
                      <button
                        onClick={() => handleDownload(lic)}
                        disabled={downloadingId === lic.id}
                        className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
                      >
                        {downloadingId === lic.id ? (
                          <>
                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Downloading...
                          </>
                        ) : (
                          <>
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download Plugin
                          </>
                        )}
                      </button>
                      <Link
                        to={`/plugins/${lic.plugin?.id}`}
                        className="rounded-lg border border-border-subtle px-4 py-2 text-sm font-medium text-text-secondary hover:bg-bg-elevated text-center whitespace-nowrap"
                      >
                        View Plugin
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}