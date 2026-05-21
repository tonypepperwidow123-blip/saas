import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { pluginService } from '../../services/plugin.service';
import PageHeader from '../../components/shared/PageHeader';
import { slugify } from '../../utils/formatters';

const categories = ['seo', 'ecommerce', 'security', 'performance', 'forms', 'social', 'analytics', 'other'];

export default function UploadPlugin() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    short_desc: '',
    description: '',
    category: '',
    price: 0,
    tags: [],
  });
  const [tagInput, setTagInput] = useState('');

  // Step 2 – ZIP upload state
  const [zipFile, setZipFile] = useState(null);
  const [versionTag, setVersionTag] = useState('1.0.0');
  const [changelog, setChangelog] = useState('');

  /* ─── Helpers ─── */
  const handleChange = (e) => {
    const { name, value } = e.target;
    // Always enforce lowercase for slug
    const sanitized = name === 'slug' ? value.toLowerCase().replace(/[^a-z0-9-]/g, '-') : value;
    setFormData((prev) => ({ ...prev, [name]: sanitized }));
    if (name === 'name' && !formData.slug) {
      setFormData((prev) => ({ ...prev, slug: slugify(value) }));
    }
  };

  const addTag = () => {
    if (tagInput && formData.tags.length < 5) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    setFormData((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
  };

  /* ─── Drag & Drop ─── */
  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    validateAndSetZip(file);
  }, []);

  const onDragOver = (e) => { e.preventDefault(); setDragOver(true); };
  const onDragLeave = () => setDragOver(false);

  const validateAndSetZip = (file) => {
    const isZip = file.type === 'application/zip' ||
      file.type === 'application/x-zip-compressed' ||
      file.name.endsWith('.zip');
    if (!isZip) {
      toast.error('Only ZIP files are allowed');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      toast.error('ZIP file must be under 50 MB');
      return;
    }
    setZipFile(file);
  };

  const formatBytes = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  /* ─── Navigation & Submit ─── */
  const goNext = () => {
    if (step === 1) {
      if (!formData.name || !formData.slug || !formData.short_desc || !formData.description || !formData.category) {
        toast.error('Please fill in all required fields');
        return;
      }
      if (formData.description.length < 50) {
        toast.error('Full description must be at least 50 characters');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!zipFile) {
        toast.error('Please upload a plugin ZIP file');
        return;
      }
      if (!versionTag.trim()) {
        toast.error('Please enter a version number');
        return;
      }
      setStep(3);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setUploadProgress(0);
    let pluginId = null;
    let pluginCreated = false;
    try {
      // Step A: create plugin record (sanitize before sending)
      const payload = {
        ...formData,
        slug: formData.slug.toLowerCase().trim(),
        price: parseFloat(formData.price) || 0,
      };
      const createRes = await pluginService.createPlugin(payload);
      if (!createRes.success) throw new Error('Failed to create plugin record');
      pluginId = createRes.data.id;
      pluginCreated = true;
      setUploadProgress(40);

      // Step B: upload ZIP as initial version
      await pluginService.uploadVersion(pluginId, versionTag, changelog, zipFile);
      setUploadProgress(100);

      toast.success('Plugin submitted for review! 🎉');
      navigate('/developer/plugins');
    } catch (err) {
      // If plugin record was created but ZIP upload failed, delete the orphan
      // so the developer can retry without hitting a slug conflict (409)
      if (pluginCreated && pluginId) {
        try { await pluginService.deletePlugin(pluginId); } catch (_) { /* ignore */ }
      }
      const apiError = err.response?.data?.error;
      const apiDetails = err.response?.data?.details;
      let msg = apiError || err.message || 'Submission failed';
      if (apiDetails) {
        const fieldErrors = Object.entries(apiDetails)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v[0] : v}`)
          .join(' | ');
        msg = `Validation: ${fieldErrors}`;
      }
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  /* ─── Render ─── */
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Upload Plugin" description="Submit a new plugin for review" />

      {/* Step indicator */}
      <div className="flex items-center gap-3">
        {[1, 2, 3].map((s, i) => (
          <div key={s} className="contents">
            <div
              className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-all ${
                step >= s ? 'bg-accent text-white shadow-lg shadow-accent/30' : 'bg-bg-elevated text-text-muted'
              }`}
            >
              {step > s ? (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : s}
            </div>
            {i < 2 && (
              <div
                className={`flex-1 h-1 rounded transition-all duration-500 ${step > s ? 'bg-accent' : 'bg-bg-elevated'}`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border-subtle bg-bg-card p-6">

        {/* ── Step 1: Plugin Details ── */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary">Plugin Name *</label>
              <input
                type="text" name="name" value={formData.name} onChange={handleChange}
                className="mt-1 block w-full rounded-lg border border-border-subtle bg-bg-elevated px-4 py-2.5 text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder="My Awesome Plugin"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary">Slug *</label>
              <input
                type="text" name="slug" value={formData.slug} onChange={handleChange}
                className="mt-1 block w-full rounded-lg border border-border-subtle bg-bg-elevated px-4 py-2.5 text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder="my-awesome-plugin"
              />
              <p className="mt-1 text-xs text-text-muted">URL-friendly identifier, lowercase with hyphens</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary">Short Description *</label>
              <input
                type="text" name="short_desc" value={formData.short_desc} onChange={handleChange}
                className="mt-1 block w-full rounded-lg border border-border-subtle bg-bg-elevated px-4 py-2.5 text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder="A brief description (20-200 chars)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary">Category *</label>
              <select
                name="category" value={formData.category} onChange={handleChange}
                className="mt-1 block w-full rounded-lg border border-border-subtle bg-bg-elevated px-4 py-2.5 text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary">Full Description * (min 50 chars)</label>
              <textarea
                name="description" value={formData.description} onChange={handleChange} rows={6}
                className="mt-1 block w-full rounded-lg border border-border-subtle bg-bg-elevated px-4 py-2.5 text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder="Describe your plugin in detail..."
              />
              <p className="mt-1 text-xs text-text-muted">{formData.description.length} / 50+ chars</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary">Tags (max 5)</label>
              <div className="mt-1 flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 rounded-lg bg-accent/10 border border-accent/20 px-2 py-1 text-xs text-accent">
                    {tag}
                    <button onClick={() => removeTag(tag)} className="text-accent/60 hover:text-danger">×</button>
                  </span>
                ))}
              </div>
              <div className="mt-2 flex gap-2">
                <input
                  type="text" value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 rounded-lg border border-border-subtle bg-bg-elevated px-4 py-2 text-text-primary text-sm focus:border-accent focus:outline-none"
                  placeholder="Add a tag"
                />
                <button onClick={addTag} className="rounded-lg border border-border-subtle px-4 py-2 text-sm text-text-secondary hover:bg-bg-elevated transition-colors">
                  Add
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 2: ZIP Upload ── */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-semibold text-text-primary">Upload Plugin ZIP</h3>
              <p className="mt-1 text-sm text-text-muted">Upload your WordPress plugin as a ZIP file (max 10 MB)</p>
            </div>

            {/* Drag & Drop Zone */}
            <div
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-text-primary">
                      {dragOver ? 'Drop your ZIP here' : 'Drag & drop your plugin ZIP'}
                    </p>
                    <p className="text-sm text-text-muted">or <span className="text-accent underline cursor-pointer">browse files</span></p>
                    <p className="mt-1 text-xs text-text-muted">ZIP format only · Max 10 MB</p>
                  </div>
                </div>
              )}
            </div>

            {/* Version Number */}
            <div>
              <label className="block text-sm font-medium text-text-secondary">Version Number *</label>
              <input
                type="text" value={versionTag} onChange={(e) => setVersionTag(e.target.value)}
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
          </div>
        )}

        {/* ── Step 3: Review & Submit ── */}
        {step === 3 && (
          <div className="space-y-5">
            <h3 className="text-lg font-semibold text-text-primary">Review &amp; Submit</h3>

            <div className="space-y-3 rounded-lg bg-bg-elevated p-5 text-sm">
              {[
                ['Name', formData.name],
                ['Slug', formData.slug],
                ['Category', formData.category],
                ['Tags', formData.tags.join(', ') || '—'],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between gap-4">
                  <span className="text-text-muted">{label}:</span>
                  <span className="text-text-primary capitalize text-right">{val}</span>
                </div>
              ))}
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-text-secondary">Price (USD)</label>
              <input
                type="number" name="price" value={formData.price} onChange={handleChange} min="0" step="0.01"
                className="mt-1 block w-full rounded-lg border border-border-subtle bg-bg-elevated px-4 py-2.5 text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
              <p className="mt-1 text-xs text-text-muted">Set to 0 for free plugins</p>
            </div>

            {/* ZIP summary */}
            {zipFile && (
              <div className="flex items-center gap-3 rounded-lg border border-border-subtle bg-bg-elevated px-4 py-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-accent/10">
                  <svg className="h-5 w-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-text-primary">{zipFile.name}</p>
                  <p className="text-xs text-text-muted">v{versionTag} · {formatBytes(zipFile.size)}</p>
                </div>
              </div>
            )}

            {/* Upload progress bar (shown while submitting) */}
            {loading && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-text-muted">
                  <span>{uploadProgress < 40 ? 'Creating plugin record…' : uploadProgress < 100 ? 'Uploading ZIP…' : 'Done!'}</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-bg-elevated">
                  <div
                    className="h-full rounded-full bg-accent transition-all duration-500"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="rounded-lg border border-warning/20 bg-warning/10 p-4">
              <p className="text-sm text-warning">
                After submission your plugin will be reviewed by an admin before appearing in the marketplace.
              </p>
            </div>
          </div>
        )}

        {/* ── Action Buttons ── */}
        <div className="mt-6 flex gap-3">
          {step > 1 && !loading && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="flex-1 rounded-lg border border-border-subtle px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-bg-elevated transition-colors"
            >
              Back
            </button>
          )}
          <button
            onClick={step < 3 ? goNext : handleSubmit}
            disabled={loading}
            className="flex-1 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover disabled:opacity-60 transition-all"
          >
            {loading
              ? 'Submitting…'
              : step === 1
              ? 'Continue →'
              : step === 2
              ? 'Review →'
              : 'Submit for Review'}
          </button>
        </div>
      </div>
    </div>
  );
}