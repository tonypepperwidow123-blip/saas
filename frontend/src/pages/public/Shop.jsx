import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { pluginService } from '../../services/plugin.service';
import { StatCardSkeleton } from '../../components/shared/LoadingSkeleton';

const categories = [
  { value: '', label: 'All' },
  { value: 'seo', label: 'SEO' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'security', label: 'Security' },
  { value: 'performance', label: 'Performance' },
  { value: 'forms', label: 'Forms' },
  { value: 'social', label: 'Social' },
  { value: 'analytics', label: 'Analytics' },
  { value: 'other', label: 'Other' },
];

const categoryEmojis = {
  seo: '🔍', ecommerce: '🛒', security: '🔒', performance: '⚡',
  forms: '📝', social: '📣', analytics: '📊', other: '📦', '': '✨',
};

export default function Shop() {
  const [plugins, setPlugins]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [search, setSearch]         = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [category, setCategory]     = useState('');
  const [page, setPage]             = useState(1);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchPlugins(), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search, category, page]);

  const fetchPlugins = async () => {
    setLoading(true);
    try {
      const response = await pluginService.getPlugins({ search, category, page, limit: 12 });
      if (response.success) {
        setPlugins(response.data.items);
        setPagination({
          page: response.data.pagination?.page || 1,
          totalPages: response.data.pagination?.totalPages || 1,
          total: response.data.pagination?.total || 0,
        });
      }
    } catch (error) {
      console.error('Failed to fetch plugins:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleCategoryChange = (cat) => { setCategory(cat); setPage(1); };
  const handlePageChange = (newPage) => { setPage(newPage); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <div style={{ width: '3px', height: '22px', borderRadius: '2px', background: 'linear-gradient(180deg, #f59e0b, #d97706)', boxShadow: '0 0 8px rgba(245,158,11,0.5)' }} />
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: '800', fontSize: '28px', color: 'var(--text-primary)', letterSpacing: '-0.04em' }}>
            Plugin Marketplace
          </h1>
        </div>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', paddingLeft: '13px' }}>
          Discover WordPress plugins built by verified developers
        </p>
      </div>

      {/* Search + Filters */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '28px' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <svg style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'var(--text-muted)', pointerEvents: 'none' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search plugins..."
              className="input-field"
              style={{ paddingLeft: '42px' }}
            />
          </div>
          <button type="submit" className="btn-amber" style={{ padding: '0 20px', borderRadius: '10px', fontSize: '13px', whiteSpace: 'nowrap' }}>
            Search
          </button>
        </form>

        {/* Category pills */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {categories.map((cat) => {
            const active = category === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => handleCategoryChange(cat.value)}
                style={{
                  whiteSpace: 'nowrap',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600',
                  fontFamily: 'DM Sans, sans-serif',
                  border: active ? '1px solid rgba(245,158,11,0.4)' : '1px solid rgba(255,255,255,0.08)',
                  background: active ? 'rgba(245,158,11,0.12)' : 'rgba(255,255,255,0.03)',
                  color: active ? '#f59e0b' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  display: 'flex', alignItems: 'center', gap: '5px',
                }}
              >
                <span>{categoryEmojis[cat.value]}</span>
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results count */}
      <p style={{ marginBottom: '20px', fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif' }}>
        {pagination.total} plugin{pagination.total !== 1 ? 's' : ''} found
        {category && <span style={{ color: 'var(--accent)', marginLeft: '6px' }}>in {categories.find(c => c.value === category)?.label}</span>}
      </p>

      {/* Plugin Grid */}
      {loading ? (
        <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {Array.from({ length: 6 }).map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
      ) : plugins.length === 0 ? (
        <div style={{
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.055)',
          background: 'rgba(255,255,255,0.02)',
          padding: '64px 24px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
          <p style={{ color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif' }}>No plugins found matching your criteria.</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {plugins.map((plugin, index) => (
              <Link
                key={plugin.id}
                to={`/plugins/${plugin.id}`}
                style={{
                  borderRadius: '16px',
                  border: '1px solid rgba(255,255,255,0.055)',
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0.01) 100%)',
                  padding: '22px',
                  textDecoration: 'none',
                  display: 'block',
                  transition: 'all 0.25s ease',
                  animationDelay: `${index * 0.05}s`,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(245,158,11,0.25)';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.3), 0 0 20px rgba(245,158,11,0.08)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.055)';
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '14px' }}>
                  {/* Plugin icon */}
                  <div style={{
                    width: '44px', height: '44px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.05))',
                    border: '1px solid rgba(245,158,11,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '18px',
                    fontWeight: '800',
                    color: '#f59e0b',
                    fontFamily: 'Syne, sans-serif',
                    flexShrink: 0,
                  }}>
                    {plugin.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: '700', fontSize: '15px', color: 'var(--text-primary)', marginBottom: '4px', letterSpacing: '-0.02em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {plugin.name}
                    </h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif' }}>
                      {plugin.download_count || 0} downloads
                    </p>
                  </div>
                  <div style={{
                    padding: '4px 10px',
                    borderRadius: '20px',
                    background: plugin.price === 0 ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                    border: `1px solid ${plugin.price === 0 ? 'rgba(16,185,129,0.25)' : 'rgba(245,158,11,0.25)'}`,
                    fontSize: '12px',
                    fontWeight: '700',
                    color: plugin.price === 0 ? '#10b981' : '#f59e0b',
                    fontFamily: 'DM Sans, sans-serif',
                    flexShrink: 0,
                  }}>
                    {plugin.price === 0 ? 'Free' : `$${plugin.price}`}
                  </div>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', lineHeight: '1.6',
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {plugin.short_desc || plugin.description?.slice(0, 100)}
                </p>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div style={{ marginTop: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                style={{
                  padding: '8px 16px', borderRadius: '10px', fontSize: '13px',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  color: 'var(--text-secondary)', cursor: pagination.page === 1 ? 'not-allowed' : 'pointer',
                  opacity: pagination.page === 1 ? 0.4 : 1, fontFamily: 'DM Sans, sans-serif',
                }}
              >
                ← Previous
              </button>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif', padding: '0 8px' }}>
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                style={{
                  padding: '8px 16px', borderRadius: '10px', fontSize: '13px',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  color: 'var(--text-secondary)', cursor: pagination.page === pagination.totalPages ? 'not-allowed' : 'pointer',
                  opacity: pagination.page === pagination.totalPages ? 0.4 : 1, fontFamily: 'DM Sans, sans-serif',
                }}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}