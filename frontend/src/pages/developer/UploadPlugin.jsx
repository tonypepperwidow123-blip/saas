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
      const formattedTag = tagInput.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      if (formattedTag && !formData.tags.includes(formattedTag)) {
        setFormData((prev) => ({ ...prev, tags: [...prev.tags, formattedTag] }));
      }
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

  return (
    <div className="mx-auto max-w-2xl space-y-6 page-enter">
      <PageHeader 
        title="Upload Plugin" 
        description="Submit a premium WordPress plugin to the PluginVault registry" 
      />

      {/* Step indicator */}
      <div className="flex items-center gap-3 bg-bg-surface/50 p-4.5 rounded-2xl border border-border-subtle">
        {[1, 2, 3].map((s, i) => (
          <div key={s} className="contents">
            <div
              className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-sm font-bold border transition-all duration-300 ${
                step === s
                  ? 'bg-amber-gradient text-black border-accent shadow-glow-sm scale-105'
                  : step > s
                  ? 'bg-accent-dim text-accent border-border-accent/40'
                  : 'bg-bg-elevated text-text-muted border-border-subtle'
              }`}
            >
              {step > s ? (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              ) : s}
            </div>
            {i < 2 && (
              <div
                className={`flex-1 h-0.5 rounded transition-all duration-500 ${
                  step > s ? 'bg-accent' : 'bg-border-subtle'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="glass-card p-8 rounded-3xl border border-border-subtle shadow-card card-accent-top">
        {/* ── Step 1: Plugin Details ── */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary">Plugin Name *</label>
              <input
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange}
                className="input-field mt-1.5"
                placeholder="My Awesome Plugin"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary">Slug *</label>
              <input
                type="text" 
                name="slug" 
                value={formData.slug} 
                onChange={handleChange}
                className="input-field mt-1.5 font-mono"
                placeholder="my-awesome-plugin"
                required
              />
              <p className="mt-1 text-xs text-text-muted">URL-friendly identifier. E.g. my-awesome-plugin</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary">Category *</label>
                <div className="relative">
                  <select
                    name="category" 
                    value={formData.category} 
                    onChange={handleChange}
                    className="input-field mt-1.5 cursor-pointer appearance-none bg-bg-elevated pr-10"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 pt-1.5 text-text-muted">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary">Price (USD) *</label>
                <input
                  type="number" 
                  name="price" 
                  value={formData.price} 
                  onChange={handleChange} 
                  min="0" 
                  step="0.01"
                  className="input-field mt-1.5 font-mono"
                  required
                />
                <p className="mt-1 text-xs text-text-muted">Set to 0 for free plugins</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary">Short Description *</label>
              <input
                type="text" 
                name="short_desc" 
                value={formData.short_desc} 
                onChange={handleChange}
                className="input-field mt-1.5"
                placeholder="A high-level summary of your plugin (20-200 characters)"
                maxLength={200}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary">Full Description * (min 50 chars)</label>
              <textarea
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                rows={6}
                className="input-field mt-1.5 resize-none"
                placeholder="Provide a comprehensive description of features, installation instructions, and configurations..."
                required
              />
              <div className="mt-1 flex justify-between text-xs font-mono">
                <span className={formData.description.length >= 50 ? 'text-success' : 'text-text-muted'}>
                  {formData.description.length} / 50 characters
                </span>
                <span className="text-text-muted">Supports basic text</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary">Tags (max 5)</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <span 
                    key={tag} 
                    className="inline-flex items-center gap-1.5 rounded-xl bg-accent-dim border border-border-accent/40 px-3 py-1 text-xs text-accent font-semibold"
                  >
                    #{tag}
                    <button 
                      type="button" 
                      onClick={() => removeTag(tag)} 
                      className="text-accent/50 hover:text-danger font-bold transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="mt-2 flex gap-2">
                <input
                  type="text" 
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="input-field text-sm"
                  placeholder="Type a tag and press Enter"
                />
                <button 
                  type="button" 
                  onClick={addTag} 
                  className="btn-ghost rounded-xl px-4 text-sm font-semibold transition-all"
                >
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
              <h3 className="text-lg font-bold text-text-primary">Package Upload</h3>
              <p className="text-xs text-text-secondary">Provide your plugin installable package and version tag</p>
            </div>

            {/* Drag & Drop Zone */}
            <div
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
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
                      {dragOver ? 'Drop the file now' : 'Drag & drop plugin ZIP'}
                    </p>
                    <p className="text-xs text-text-secondary mt-1">or <span className="text-accent underline font-semibold">browse computer</span></p>
                    <p className="mt-2 text-xs text-text-muted">ZIP format only · Max 50 MB</p>
                  </div>
                </div>
              )}
            </div>

            {/* Version Number */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary">Initial Version Tag *</label>
              <input
                type="text" 
                value={versionTag} 
                onChange={(e) => setVersionTag(e.target.value)}
                className="input-field mt-1.5 font-mono"
                placeholder="1.0.0"
                required
              />
              <p className="mt-1 text-xs text-text-muted">Recommended format: semantic tags (e.g. 1.0.0, 1.1.0-beta)</p>
            </div>

            {/* Changelog */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary">Release Changelog</label>
              <textarea
                value={changelog} 
                onChange={(e) => setChangelog(e.target.value)} 
                rows={4}
                className="input-field mt-1.5 resize-none"
                placeholder="List features, bug fixes, or enhancements in this release..."
              />
            </div>
          </div>
        )}

        {/* ── Step 3: Review & Submit ── */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-text-primary">Review Listing</h3>
              <p className="text-xs text-text-secondary">Verify the plugin metadata prior to submission</p>
            </div>

            <div className="space-y-3.5 rounded-2xl bg-bg-surface/50 border border-border-subtle p-5 text-sm font-medium">
              {[
                ['Plugin Name', formData.name],
                ['Plugin Slug', formData.slug],
                ['Target Category', formData.category],
                ['Search Tags', formData.tags.map(t => `#${t}`).join(', ') || '—'],
                ['Licensing Type', formData.price > 0 ? `Paid Distribution ($${formData.price})` : 'Free / Open-Source'],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between items-center gap-4">
                  <span className="text-text-muted">{label}</span>
                  <span className="text-text-primary capitalize text-right font-semibold">{val}</span>
                </div>
              ))}
            </div>

            {zipFile && (
              <div className="flex items-center gap-3 rounded-2xl border border-border-accent bg-accent-dim/15 px-4 py-3.5">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-accent-dim border border-border-accent/40">
                  <svg className="h-5 w-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-text-primary">{zipFile.name}</p>
                  <p className="text-xs font-mono text-text-muted mt-0.5">version v{versionTag} · {formatBytes(zipFile.size)}</p>
                </div>
              </div>
            )}

            {/* Upload progress bar (shown while submitting) */}
            {loading && (
              <div className="space-y-2 bg-bg-base/30 p-4 rounded-xl border border-border-subtle">
                <div className="flex justify-between text-xs font-mono text-text-secondary">
                  <span>{uploadProgress < 40 ? 'Creating registry entry…' : uploadProgress < 100 ? 'Streaming ZIP archive…' : 'Syncing databases…'}</span>
                  <span className="text-accent font-bold">{uploadProgress}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-bg-elevated border border-border-subtle">
                  <div
                    className="h-full rounded-full bg-amber-gradient transition-all duration-500"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-border-accent bg-accent-dim/10 p-4.5">
              <div className="flex gap-2">
                <svg className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs leading-relaxed text-text-secondary">
                  <strong>Moderation Check:</strong> Upon submission, admins will audit the package files for security, quality, and conformity prior to general availability. This usually completes in under 24 hours.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Action Buttons ── */}
        <div className="mt-8 flex gap-3">
          {step > 1 && !loading && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="flex-1 btn-ghost rounded-xl px-4 py-2.5 text-sm font-semibold transition-all"
            >
              Back
            </button>
          )}
          <button
            type="button"
            onClick={step < 3 ? goNext : handleSubmit}
            disabled={loading}
            className="flex-grow btn-amber rounded-xl px-5 py-2.5 text-sm font-bold transition-all shadow-glow-sm hover:shadow-glow inline-flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-black" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Uploading Package…
              </>
            ) : step === 1 ? (
              <>
                Next Step
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </>
            ) : step === 2 ? (
              <>
                Review Details
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </>
            ) : (
              'Publish for Review'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}