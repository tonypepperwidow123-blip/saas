import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { pluginService } from '../../services/plugin.service';
import { paymentService } from '../../services/payment.service';
import { useAuthStore } from '../../store/auth.store';
import StatusBadge from '../../components/shared/StatusBadge';
import { Skeleton } from '../../components/shared/LoadingSkeleton';
import { formatCurrency } from '../../utils/formatters';

export default function PluginDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuthStore();
  const [plugin, setPlugin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    fetchPlugin();
  }, [id]);

  const fetchPlugin = async () => {
    try {
      const response = await pluginService.getPluginById(id);
      if (response.success) {
        setPlugin(response.data);
      }
    } catch (error) {
      toast.error('Failed to load plugin');
      navigate('/shop');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (role !== 'customer') {
      toast.error('Only customers can purchase plugins');
      return;
    }

    setPurchasing(true);
    try {
      const response = await paymentService.createOrder(id);
      if (response.success) {
        // If it's a free plugin, the backend completes the order immediately
        if (plugin.price === 0 || !response.data.razorpay_order_id) {
          toast.success('Plugin downloaded successfully! Your license key and activation code have been created.');
          navigate('/customer/licenses');
          return;
        }

        // Initialize Razorpay for paid plugins
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: response.data.amount * 100, // Amount in paise
          currency: response.data.currency || 'INR',
          name: 'PluginVault',
          description: `Purchase: ${plugin.name}`,
          order_id: response.data.razorpay_order_id,
          handler: async (paymentResult) => {
            try {
              const verifyResponse = await paymentService.verifyPayment({
                razorpay_order_id: paymentResult.razorpay_order_id,
                razorpay_payment_id: paymentResult.razorpay_payment_id,
                razorpay_signature: paymentResult.razorpay_signature,
              });
              if (verifyResponse.success) {
                toast.success('Purchase complete! Your license key and activation code have been sent to your email.');
                navigate('/customer/licenses');
              }
            } catch (error) {
              toast.error('Payment verification failed');
            }
          },
          prefill: {
            email: useAuthStore.getState().user?.email,
            name: useAuthStore.getState().user?.name,
          },
          theme: {
            color: '#6366f1',
          },
        };

        if (window.Razorpay) {
          const rzp = new window.Razorpay(options);
          rzp.on('payment.failed', (response) => {
            toast.error(`Payment failed: ${response.error.description}`);
          });
          rzp.open();
        } else {
          toast.error('Payment gateway not loaded');
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create order');
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2">
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-64 w-full" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!plugin) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 text-center">
        <p className="text-text-secondary">Plugin not found</p>
        <Link to="/shop" className="mt-4 text-accent hover:text-accent-hover">
          Back to shop
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-2 text-sm text-text-muted">
        <Link to="/shop" className="hover:text-text-secondary">Shop</Link>
        <span>/</span>
        <span className="text-text-secondary">{plugin.name}</span>
      </nav>

      <div className="grid gap-12 lg:grid-cols-2">
        {/* Left column - Plugin info */}
        <div>
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-accent/10">
            <span className="text-2xl font-bold text-accent">
              {plugin.name?.charAt(0)?.toUpperCase()}
            </span>
          </div>

          <h1 className="text-3xl font-bold text-text-primary">{plugin.name}</h1>

          <div className="mt-4 flex items-center gap-4">
            <StatusBadge status={plugin.status} />
            {plugin.category && (
              <span className="rounded-lg bg-bg-elevated px-3 py-1 text-xs text-text-secondary capitalize">
                {plugin.category}
              </span>
            )}
          </div>

          <p className="mt-6 text-text-secondary">{plugin.short_desc}</p>

          <div className="mt-8 space-y-6">
            <h2 className="text-lg font-semibold text-text-primary">About this plugin</h2>
            <div className="prose prose-invert max-w-none text-text-secondary whitespace-pre-wrap">
              {plugin.description}
            </div>
          </div>

          {plugin.tags && plugin.tags.length > 0 && (
            <div className="mt-8">
              <h3 className="mb-3 text-sm font-medium text-text-secondary">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {plugin.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-lg bg-bg-elevated px-3 py-1 text-xs text-text-secondary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 border-t border-border-subtle pt-8">
            <h3 className="text-sm font-medium text-text-secondary">Developer</h3>
            <div className="mt-2 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                <span className="text-sm font-medium text-accent">
                  {plugin.developer?.name?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium text-text-primary">{plugin.developer?.name}</p>
                {plugin.developer?.business_name && (
                  <p className="text-sm text-text-muted">{plugin.developer.business_name}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right column - Purchase card */}
        <div className="lg:sticky lg:top-24 lg:h-fit">
          <div className="rounded-2xl border border-border-subtle bg-bg-card p-8">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold text-text-primary">
                {plugin.price === 0 ? 'Free' : formatCurrency(plugin.price)}
              </span>
              {plugin.current_version && (
                <span className="text-sm text-text-muted">v{plugin.current_version}</span>
              )}
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 text-sm text-text-secondary">
                <svg className="h-5 w-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Instant download after purchase</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-text-secondary">
                <svg className="h-5 w-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Automatic license key delivery</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-text-secondary">
                <svg className="h-5 w-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Free updates for life</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-text-secondary">
                <svg className="h-5 w-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>1 site activation included</span>
              </div>
            </div>

            <button
              onClick={handlePurchase}
              disabled={purchasing || plugin.status !== 'approved'}
              className="mt-6 w-full rounded-lg bg-accent px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
            >
              {purchasing
                ? 'Processing...'
                : plugin.price === 0
                ? 'Download Free'
                : `Buy for ${formatCurrency(plugin.price)}`}
            </button>

            {plugin.status !== 'approved' && (
              <p className="mt-3 text-center text-xs text-text-muted">
                This plugin is not available for purchase
              </p>
            )}
          </div>

          <div className="mt-6 flex items-center justify-center gap-4 text-xs text-text-muted">
            <span>{plugin.download_count || 0} downloads</span>
            <span>|</span>
            <span>Updated {plugin.updated_at ? new Date(plugin.updated_at).toLocaleDateString() : 'recently'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}