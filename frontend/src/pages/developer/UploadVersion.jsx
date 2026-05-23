import { useState, useRef, useCallback, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { pluginService } from '../../services/plugin.service';
import PageHeader from '../../components/shared/PageHeader';

export default function UploadVersion() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [plugin, setPlugin] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [zipFile, setZipFile] = useState(null);
  const [version, setVersion] = useState('1.0.0');
  const [changelog, setChangelog] = useState('');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    pluginService.getPluginById(id)
      .then(res => { if (res.success) setPlugin(res.data); })
      .catch(() => { toast.error('Plugin not found'); navigate('/developer/plugins'); });
  }, [id]);

  const validateAndSetZip = (file) => {
    const isZip = file.type === 'application/zip' ||
      file.type === 'application/x-zip-compressed' ||
      file.name.endsWith('.zip');
    if (!isZip) { toast.error('Only ZIP files are allowed'); return; }
    if (file.size > 50 * 1024 * 1024) { toast.error('ZIP file must be under 50 MB'); return; }
    setZipFile(file);
  };

  const onDrop = useCallback((e) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) validateAndSetZip(file);
  }, []);

  const formatBytes = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleSubmit = async () => {
    if (!zipFile) { toast.error('Please select a ZIP file'); return; }
    if (!version.trim()) { toast.error('Please enter a version number'); return; }

    setLoading(true);
    setProgress(20);
    try {
      await pluginService.uploadVersion(id, version.trim(), changelog, zipFile);
      setProgress(100);
      toast.success(`Version ${version} uploaded successfully! 🎉`);
      navigate('/developer/plugins');
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Upload failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 page-enter">
      <PageHeader
        title={`Upload Version – ${plugin?.name || '...'}`}
        description="Upload a new package build and version tags for this WordPress plugin"
      />

      <div className="glass-card p-8 rounded-3xl border border-border-subtle shadow-card card-accent-top space-y-6">
        {/* Drag & Drop Zone */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">Plugin ZIP *</label>
          <div
            onDrop={onDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => !zipFile && fileInputRef.current?.click()}
            className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 transition-all duration-200 cursor-pointer ${
              dragOver
                ? 'border-accent bg-accent-dim scale-[1.01] shadow-glow-sm'
                : zipFile
                ? 'border-success/50 bg-success/5'
                : 'border-border-subtle bg-bg-elevated/40 hover:border-border-accent hover:bg-accent-dim/20'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".zip,application/zip,application/x-zip-compressed"
              className="hidden"
              onChange={(e) => e.target.files[0] && validateAndSetZip(e.target.files[0])}
            />
            {zipFile ? (
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-success/15 border border-success/20">
                  <svg className="h-7 w-7 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-text-primary text-sm">{zipFile.name}</p>
                  <p className="font-mono text-xs text-text-muted mt-0.5">{formatBytes(zipFile.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setZipFile(null); fileInputRef.current.value = ''; }}
                  className="mt-1 text-xs font-bold text-danger hover:underline"
                >
                  Replace ZIP file
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 text-center">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-colors border ${
                  dragOver ? 'bg-accent/20 border-accent/30' : 'bg-bg-card border-border'
                }`}>
                  <svg className={`h-7 w-7 transition-colors ${dragOver ? 'text-accent' : 'text-text-muted'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-text-primary">
                    {dragOver ? 'Drop the file now' : 'Drag & drop your plugin ZIP'}
                  </p>
                  <p className="text-xs text-text-secondary mt-1">or <span className="text-accent underline font-semibold">browse computer</span></p>
                  <p className="mt-2 text-xs text-text-muted">ZIP format only · Max 50 MB</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Version */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary">Version Number *</label>
          <input
            type="text" 
            value={version} 
            onChange={(e) => setVersion(e.target.value)}
            className="input-field mt-1.5 font-mono"
            placeholder="1.0.0"
            required
          />
          <p className="mt-1 text-xs text-text-muted">Semantic versioning recommended (e.g. 1.0.1, 2.0.0)</p>
        </div>

        {/* Changelog */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary">Release Changelog</label>
          <textarea
            value={changelog} 
            onChange={(e) => setChangelog(e.target.value)} 
            rows={4}
            className="input-field mt-1.5 resize-none"
            placeholder="List bug fixes, details or performance updates in this release..."
          />
        </div>

        {/* Progress bar */}
        {loading && (
          <div className="space-y-2 bg-bg-base/30 p-4 rounded-xl border border-border-subtle">
            <div className="flex justify-between text-xs font-mono text-text-secondary">
              <span>{progress < 100 ? 'Streaming ZIP archive…' : 'Finalizing deployment…'}</span>
              <span className="text-accent font-bold">{progress}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-bg-elevated border border-border-subtle">
              <div 
                className="h-full rounded-full bg-amber-gradient transition-all duration-500" 
                style={{ width: `${progress}%` }} 
              />
            </div>
          </div>
        )}

        {/* Info box */}
        <div className="rounded-2xl border border-border-accent bg-accent-dim/10 p-4.5">
          <div className="flex gap-2">
            <svg className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs leading-relaxed text-text-secondary">
              <strong>Process Info:</strong> The plugin package will be automatically parsed to check compliance and integrate PluginVault license management modules.
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <Link
            to="/developer/plugins"
            className="flex-1 btn-ghost rounded-xl px-4 py-2.5 text-sm font-semibold transition-all text-center"
          >
            Cancel
          </Link>
          <button
            onClick={handleSubmit}
            disabled={loading || !zipFile}
            className="flex-grow btn-amber rounded-xl px-5 py-2.5 text-sm font-bold transition-all shadow-glow-sm hover:shadow-glow inline-flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-black" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Uploading Version…
              </>
            ) : (
              'Upload Version'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

