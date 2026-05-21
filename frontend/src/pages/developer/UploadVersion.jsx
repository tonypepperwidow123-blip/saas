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
    if (file.size > 10 * 1024 * 1024) { toast.error('ZIP file must be under 10 MB'); return; }
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
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title={`Upload Version – ${plugin?.name || '...'}`}
        description="Upload a new ZIP version for your existing plugin"
      />

      <div className="rounded-xl border border-border-subtle bg-bg-card p-6 space-y-5">

        {/* Drag & Drop Zone */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">Plugin ZIP *</label>
          <div
            onDrop={onDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => !zipFile && fileInputRef.current?.click()}
            className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 transition-all cursor-pointer ${
              dragOver
                ? 'border-accent bg-accent/10 scale-[1.01]'
                : zipFile
                ? 'border-success/50 bg-success/5'
                : 'border-border-subtle bg-bg-elevated hover:border-accent/50 hover:bg-accent/5'
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
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-success/15">
                  <svg className="h-7 w-7 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-text-primary">{zipFile.name}</p>
                  <p className="text-sm text-text-muted">{formatBytes(zipFile.size)}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setZipFile(null); fileInputRef.current.value = ''; }}
                  className="mt-1 text-xs text-danger hover:underline"
                >
                  Remove file
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 text-center">
                <div className={`flex h-14 w-14 items-center justify-center rounded-xl transition-colors ${dragOver ? 'bg-accent/20' : 'bg-bg-card'}`}>
                  <svg className={`h-7 w-7 transition-colors ${dragOver ? 'text-accent' : 'text-text-muted'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-text-primary">{dragOver ? 'Drop your ZIP here' : 'Drag & drop your plugin ZIP'}</p>
                  <p className="text-sm text-text-muted">or <span className="text-accent underline cursor-pointer">browse files</span></p>
                  <p className="mt-1 text-xs text-text-muted">ZIP format only · Max 10 MB</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Version */}
        <div>
          <label className="block text-sm font-medium text-text-secondary">Version Number *</label>
          <input
            type="text" value={version} onChange={(e) => setVersion(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-border-subtle bg-bg-elevated px-4 py-2.5 text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            placeholder="1.0.0"
          />
          <p className="mt-1 text-xs text-text-muted">Semantic versioning recommended (e.g. 1.0.0)</p>
        </div>

        {/* Changelog */}
        <div>
          <label className="block text-sm font-medium text-text-secondary">Changelog / Release Notes</label>
          <textarea
            value={changelog} onChange={(e) => setChangelog(e.target.value)} rows={4}
            className="mt-1 block w-full rounded-lg border border-border-subtle bg-bg-elevated px-4 py-2.5 text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            placeholder="What's new in this version? (optional)"
          />
        </div>

        {/* Progress bar */}
        {loading && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-text-muted">
              <span>{progress < 100 ? 'Uploading ZIP…' : 'Done!'}</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-bg-elevated">
              <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {/* Info box */}
        <div className="rounded-lg border border-accent/20 bg-accent/5 p-4">
          <p className="text-sm text-accent">
            ℹ️ The ZIP will be automatically processed to inject the PluginVault license activation UI before it is saved.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <Link
            to="/developer/plugins"
            className="flex-1 rounded-lg border border-border-subtle px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-bg-elevated transition-colors text-center"
          >
            Cancel
          </Link>
          <button
            onClick={handleSubmit}
            disabled={loading || !zipFile}
            className="flex-1 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover disabled:opacity-60 transition-all"
          >
            {loading ? 'Uploading…' : 'Upload Version'}
          </button>
        </div>
      </div>
    </div>
  );
}
