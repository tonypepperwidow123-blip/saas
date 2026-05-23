import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { customerService } from '../../services/customer.service';
import PageHeader from '../../components/shared/PageHeader';
import StatusBadge from '../../components/shared/StatusBadge';
import EmptyState from '../../components/shared/EmptyState';
import { formatDate } from '../../utils/formatters';
import { toast } from 'sonner';

export default function CustomerLicenses() {
  const [licenses, setLicenses]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => { fetchLicenses(); }, []);

  const fetchLicenses = async () => {
    try {
      const response = await customerService.getMyLicenses({ limit: 50 });
      if (response.success) setLicenses(response.data.items);
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
      setTimeout(() => URL.revokeObjectURL(objectUrl), 10000);
    } catch {
      window.open(url, '_blank');
    }
  };

  const handleDownload = async (license) => {
    setDownloadingId(license.id);
    try {
      const response = await customerService.downloadPlugin(license.plugin_id);
      if (response.success && response.data?.download_url) {
        const pluginName = license.plugin?.name || license.plugin?.slug || 'plugin';
        const filename = `${pluginName}.zip`;
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fade-in 0.4s ease forwards' }}>
      <PageHeader title="My Licenses" description="Your plugin licenses and activation keys" />

      {/* Activation Instructions Banner */}
      <div style={{
        borderRadius: '16px',
        border: '1px solid rgba(245,158,11,0.25)',
        background: 'linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(245,158,11,0.04) 100%)',
        padding: '20px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.5), transparent)' }} />
        <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: '700', fontSize: '14px', color: '#f59e0b', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          📋 How to Activate Your Plugin
        </h3>
        <ol style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {[
            ['Download', 'the plugin ZIP file below'],
            ['Upload', 'the plugin to your WordPress dashboard'],
            ['Go to', 'Settings → Plugin License in WordPress'],
            ['Paste', 'your Plugin Activation Key into the field'],
            ['Click', 'Activate — the key can only be used ONCE'],
          ].map(([bold, rest], i) => (
            <li key={i} style={{ fontSize: '13px', color: 'rgba(245,158,11,0.85)', fontFamily: 'DM Sans, sans-serif', display: 'flex', gap: '4px' }}>
              <span style={{ color: 'rgba(245,158,11,0.5)', fontWeight: '700', minWidth: '16px' }}>{i + 1}.</span>
              <span><strong style={{ color: '#f59e0b' }}>{bold}</strong> {rest}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Licenses list */}
      <div style={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.055)', background: 'linear-gradient(135deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.01) 100%)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ height: '16px', width: '180px', borderRadius: '6px', background: 'rgba(255,255,255,0.06)', marginBottom: '8px', animation: 'shimmer 1.8s ease infinite' }} />
                <div style={{ height: '90px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', animation: 'shimmer 1.8s ease infinite' }} />
              </div>
            ))}
          </div>
        ) : licenses.length === 0 ? (
          <EmptyState
            title="No licenses yet"
            description="Purchase plugins to get your license keys"
            action={
              <Link
                to="/shop"
                className="btn-amber"
                style={{ padding: '9px 20px', borderRadius: '10px', fontSize: '13px', textDecoration: 'none', display: 'inline-block' }}
              >
                Browse Plugins
              </Link>
            }
          />
        ) : (
          licenses.map((lic) => {
            const combinedKey = lic.activation_code
              ? `${lic.license_key}::${lic.activation_code}`
              : lic.license_key;

            return (
              <div
                key={lic.id}
                style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s ease' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.012)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                  {/* Plugin info + key */}
                  <div style={{ flex: 1, minWidth: '280px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' }}>
                      <Link
                        to={`/plugins/${lic.plugin?.id}`}
                        style={{ fontFamily: 'Syne, sans-serif', fontWeight: '700', fontSize: '16px', color: 'var(--text-primary)', textDecoration: 'none', letterSpacing: '-0.02em', transition: 'color 0.15s ease' }}
                        onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-primary)'; }}
                      >
                        {lic.plugin?.name || 'Unknown Plugin'}
                      </Link>
                      <StatusBadge status={lic.activation_code_used ? 'activated' : 'pending'} size="sm" />
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif', marginBottom: '14px' }}>
                      Purchased on {formatDate(lic.created_at)}
                    </p>

                    {!lic.activation_code_used ? (
                      /* ── Active key card ── */
                      <div style={{
                        borderRadius: '12px',
                        border: '1.5px dashed rgba(245,158,11,0.35)',
                        background: 'rgba(245,158,11,0.05)',
                        padding: '16px',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '14px' }}>🔑</span>
                            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'DM Sans, sans-serif', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                              Plugin Activation Key
                            </span>
                            <span style={{ padding: '2px 8px', borderRadius: '6px', background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', fontSize: '10px', fontWeight: '700', color: '#f59e0b', fontFamily: 'DM Sans, sans-serif', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              One-Time Use
                            </span>
                          </div>
                          <button
                            onClick={() => copyToClipboard(combinedKey, 'Activation Key')}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '6px',
                              padding: '5px 12px', borderRadius: '8px',
                              background: 'rgba(245,158,11,0.1)',
                              border: '1px solid rgba(245,158,11,0.3)',
                              color: '#f59e0b',
                              fontSize: '12px', fontWeight: '600', fontFamily: 'DM Sans, sans-serif',
                              cursor: 'pointer', transition: 'all 0.18s ease',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.18)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.1)'; }}
                          >
                            <svg style={{ width: '12px', height: '12px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Copy Key
                          </button>
                        </div>
                        <div style={{ borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.06)', padding: '12px 14px', marginBottom: '8px' }}>
                          <code style={{ fontSize: '13px', fontFamily: 'JetBrains Mono, Fira Code, monospace', color: '#f59e0b', wordBreak: 'break-all', lineHeight: '1.6', display: 'block' }}>
                            {combinedKey}
                          </code>
                        </div>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif', lineHeight: '1.5' }}>
                          ⚠️ Paste this key in WordPress under <strong style={{ color: 'var(--text-secondary)' }}>Settings → Plugin License</strong>. It can only be used <strong>once</strong>.
                        </p>
                      </div>
                    ) : (
                      /* ── Activated state ── */
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ borderRadius: '12px', border: '1px solid rgba(16,185,129,0.25)', background: 'rgba(16,185,129,0.07)', padding: '14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <svg style={{ width: '16px', height: '16px', color: '#10b981', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span style={{ fontSize: '13px', fontWeight: '700', color: '#10b981', fontFamily: 'DM Sans, sans-serif' }}>Plugin Activated</span>
                          </div>
                          <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif' }}>Your activation key was used successfully. Plugin is licensed.</p>
                        </div>

                        <div style={{ borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)', padding: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif', textTransform: 'uppercase', letterSpacing: '0.06em' }}>License Key (reference)</span>
                            <button onClick={() => copyToClipboard(lic.license_key, 'License Key')} style={{ fontSize: '11px', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                              Copy
                            </button>
                          </div>
                          <code style={{ fontSize: '12px', fontFamily: 'JetBrains Mono, Fira Code, monospace', color: 'var(--text-secondary)', wordBreak: 'break-all' }}>
                            {lic.license_key}
                          </code>
                        </div>

                        {lic.activations?.length > 0 && (
                          <div style={{ borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)', padding: '12px' }}>
                            <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                              Activated Sites
                            </span>
                            <ul style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              {lic.activations.map((a, i) =>
                                a.site_url ? (
                                  <li key={i} style={{ fontSize: '12px' }}>
                                    <a href={a.site_url} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', fontFamily: 'DM Sans, sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block', maxWidth: '200px' }}>
                                      {a.site_url}
                                    </a>
                                  </li>
                                ) : null
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
                    <button
                      onClick={() => handleDownload(lic)}
                      disabled={downloadingId === lic.id}
                      className="btn-amber"
                      style={{ padding: '9px 18px', borderRadius: '10px', fontSize: '13px', cursor: downloadingId === lic.id ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '7px', whiteSpace: 'nowrap' }}
                    >
                      {downloadingId === lic.id ? (
                        <>
                          <svg style={{ width: '14px', height: '14px', animation: 'spin-slow 1s linear infinite' }} fill="none" viewBox="0 0 24 24">
                            <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Downloading...
                        </>
                      ) : (
                        <>
                          <svg style={{ width: '14px', height: '14px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download Plugin
                        </>
                      )}
                    </button>
                    <Link
                      to={`/plugins/${lic.plugin?.id}`}
                      className="btn-ghost"
                      style={{ padding: '9px 18px', borderRadius: '10px', fontSize: '13px', textAlign: 'center', textDecoration: 'none', display: 'block', whiteSpace: 'nowrap' }}
                    >
                      View Plugin
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}