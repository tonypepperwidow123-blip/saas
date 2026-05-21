import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { pluginService } from '../../services/plugin.service';
import { StatCardSkeleton } from '../../components/shared/LoadingSkeleton';

const categories = [
  { value: '', label: 'All Categories' },
  { value: 'seo', label: 'SEO' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'security', label: 'Security' },
  { value: 'performance', label: 'Performance' },
  { value: 'forms', label: 'Forms' },
  { value: 'social', label: 'Social' },
  { value: 'analytics', label: 'Analytics' },
  { value: 'other', label: 'Other' },
];

export default function Shop() {
  const [plugins, setPlugins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const debounceRef = useRef(null);

  useEffect(() => {
    // Debounce the fetch to prevent rapid requests
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      fetchPlugins();
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, category, page]);

  const fetchPlugins = async () => {
    setLoading(true);
    try {
      const response = await pluginService.getPlugins({
        search,
        category,
        page,
        limit: 12,
      });
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
    const formData = new FormData(e.target);
    setSearch(formData.get('search') || '');
    setPage(1);
  };

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary">Plugin Marketplace</h1>
        <p className="mt-2 text-text-secondary">
          Discover WordPress plugins built by verified developers
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <form onSubmit={handleSearch} className="flex flex-1 gap-3">
          <input
            type="text"
            name="search"
            placeholder="Search plugins..."
            className="flex-1 rounded-lg border border-border-subtle bg-bg-card px-4 py-2.5 text-text-primary placeholder-text-muted focus:border-accent focus:outline-none"
            defaultValue={search}
          />
          <button
            type="submit"
            className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
          >
            Search
          </button>
        </form>

        <div className="flex gap-2 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => handleCategoryChange(cat.value)}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                category === cat.value
                  ? 'bg-accent text-white'
                  : 'border border-border-subtle text-text-secondary hover:bg-bg-elevated'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="mb-6 text-sm text-text-muted">
        {pagination.total} plugin{pagination.total !== 1 ? 's' : ''} found
      </p>

      {/* Plugin Grid */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      ) : plugins.length === 0 ? (
        <div className="rounded-xl border border-border-subtle bg-bg-card py-16 text-center">
          <p className="text-text-secondary">No plugins found matching your criteria.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {plugins.map((plugin) => (
              <Link
                key={plugin.id}
                to={`/plugins/${plugin.id}`}
                className="group rounded-xl border border-border-subtle bg-bg-card p-6 transition-colors hover:border-border-strong hover:bg-bg-elevated"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                  <span className="text-lg font-bold text-accent">
                    {plugin.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-text-primary group-hover:text-accent">
                  {plugin.name}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm text-text-secondary">
                  {plugin.short_desc || plugin.description?.slice(0, 100)}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm font-medium text-accent">
                    {plugin.price === 0 ? 'Free' : `$${plugin.price}`}
                  </span>
                  <span className="text-xs text-text-muted">
                    {plugin.download_count || 0} downloads
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="rounded-lg border border-border-subtle px-4 py-2 text-sm text-text-secondary hover:bg-bg-elevated disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-text-muted">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="rounded-lg border border-border-subtle px-4 py-2 text-sm text-text-secondary hover:bg-bg-elevated disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}