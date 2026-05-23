import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { pluginService } from '../../services/plugin.service';
import { paymentService } from '../../services/payment.service';
import { useAuthStore } from '../../store/auth.store';
import StatusBadge from '../../components/shared/StatusBadge';
import { Skeleton } from '../../components/shared/LoadingSkeleton';
import { formatCurrency } from '../../utils/formatters';

function CheckIcon() {
  return (
    <svg style={{ width: '14px', height: '14px', flexShrink: 0, color: '#10b981' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  );
}

export default function PluginDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuthStore();
  const [plugin, setPlugin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => { fetchPlugin(); }, [id]);

  const fetchPlugin = async () => {
    try {
      const response = await pluginService.getPluginById(id);
      if (response.success) setPlugin(response.data);
    } catch (error) {
      toast.error('Failed to load plugin');
      navigate('/shop');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (role !== 'customer') { toast.error('Only customers can purchase plugins'); return; }

    setPurchasing(true);
    try {
      const response = await paymentService.createOrder(id);
      if (response.success) {
        if (plugin.price === 0 || !response.data.razorpay_order_id) {
          toast.success('Plugin downloaded successfully! Your license key and activation code have been created.');
          navigate('/customer/licenses');
          return;
        }
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: response.data.amount * 100,
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
          theme: { color: '#f59e0b' },
        };
        if (window.Razorpay) {
          const rzp = new window.Razorpay(options);
          rzp.on('payment.failed', (response) => { toast.error(`Payment failed: ${response.error.description}`); });
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
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ display: 'grid', gap: '48px', gridTemplateColumns: 'minmax(0,1fr) 320px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Skeleton style={{ height: '64px', width: '64px', borderRadius: '16px' }} />
            <Skeleton style={{ height: '32px', width: '60%' }} />
            <Skeleton style={{ height: '16px', width: '40%' }} />
            <Skeleton style={{ height: '200px', width: '100%', borderRadius: '12px' }} />
          </div>
          <Skeleton style={{ height: '340px', borderRadius: '20px' }} />
        </div>
      </div>
    );
  }

  if (!plugin) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', marginBottom: '16px' }}>Plugin not found</p>
        <Link to="/shop" style={{ color: 'var(--accent)', textDecoration: 'none', fontFamily: 'DM Sans, sans-serif', fontSize: '14px' }}>← Back to shop</Link>
      </div>
    );
  }

  const perks = [
    'Instant download after purchase',
    'Automatic license key delivery',
    'Free updates for life',
    '1 site activation included',
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px', animation: 'fade-in 0.4s ease forwards' }}>
      {/* Breadcrumb */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px', fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif' }}>
        <Link to="/shop" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.15s ease' }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; }}>
          Shop
        </Link>
        <span style={{ color: 'var(--border-strong)' }}>/</span>
        <span style={{ color: 'var(--text-secondary)' }}>{plugin.name}</span>
      </nav>

      <div style={{ display: 'grid', gap: '48px', gridTemplateColumns: 'minmax(0,1fr) minmax(280px,320px)', alignItems: 'start' }}>
        {/* Left: Plugin info */}
        <div>
          {/* Plugin icon */}
          <div style={{
            width: '64px', height: '64px', borderRadius: '18px', marginBottom: '20px',
            background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.05))',
            border: '1px solid rgba(245,158,11,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '28px', fontWeight: '800', color: '#f59e0b', fontFamily: 'Syne, sans-serif',
          }}>
            {plugin.name?.charAt(0)?.toUpperCase()}
          </div>

          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: '800', fontSize: '32px', color: 'var(--text-primary)', letterSpacing: '-0.04em', marginBottom: '12px' }}>
            {plugin.name}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <StatusBadge status={plugin.status} />
            {plugin.category && (
              <span style={{ padding: '3px 10px', borderRadius: '20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', textTransform: 'capitalize' }}>
                {plugin.category}
              </span>
            )}
          </div>

          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', lineHeight: '1.7', marginBottom: '32px' }}>
            {plugin.short_desc}
          </p>

          {/* About section */}
          <div style={{
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.055)',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.01) 100%)',
            padding: '24px',
            marginBottom: '24px',
          }}>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: '700', fontSize: '16px', color: 'var(--text-primary)', marginBottom: '12px', letterSpacing: '-0.02em' }}>
              About this plugin
            </h2>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', lineHeight: '1.75', whiteSpace: 'pre-wrap' }}>
              {plugin.description}
            </div>
          </div>

          {/* Tags */}
          {plugin.tags && plugin.tags.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '10px' }}>Tags</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {plugin.tags.map((tag) => (
                  <span key={tag} style={{ padding: '4px 12px', borderRadius: '20px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif' }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Developer */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.055)', paddingTop: '24px' }}>
            <h3 style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '12px' }}>Developer</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%',
                background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '16px', fontWeight: '700', color: '#f59e0b', fontFamily: 'Syne, sans-serif',
              }}>
                {plugin.developer?.name?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', fontFamily: 'DM Sans, sans-serif' }}>{plugin.developer?.name}</p>
                {plugin.developer?.business_name && (
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif' }}>{plugin.developer.business_name}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Purchase card */}
        <div style={{ position: 'sticky', top: '80px' }}>
          <div style={{
            borderRadius: '20px',
            border: '1px solid rgba(245,158,11,0.2)',
            background: 'linear-gradient(135deg, rgba(245,158,11,0.06) 0%, rgba(255,255,255,0.02) 100%)',
            padding: '28px',
            boxShadow: '0 0 40px rgba(245,158,11,0.08)',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Top glow line */}
            <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.5), transparent)' }} />

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '20px' }}>
              <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: '800', fontSize: '36px', letterSpacing: '-0.04em', color: plugin.price === 0 ? '#10b981' : '#f59e0b' }}>
                {plugin.price === 0 ? 'Free' : formatCurrency(plugin.price)}
              </span>
              {plugin.current_version && (
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif', padding: '3px 10px', borderRadius: '20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  v{plugin.current_version}
                </span>
              )}
            </div>

            {/* Perks */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
              {perks.map((perk) => (
                <div key={perk} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif' }}>
                  <CheckIcon />
                  {perk}
                </div>
              ))}
            </div>

            {/* Buy button */}
            <button
              onClick={handlePurchase}
              disabled={purchasing || plugin.status !== 'approved'}
              className="btn-amber"
              style={{ width: '100%', padding: '13px', borderRadius: '12px', fontSize: '14px', cursor: (purchasing || plugin.status !== 'approved') ? 'not-allowed' : 'pointer' }}
            >
              {purchasing ? 'Processing...' : plugin.price === 0 ? 'Download Free' : `Buy for ${formatCurrency(plugin.price)}`}
            </button>

            {plugin.status !== 'approved' && (
              <p style={{ marginTop: '10px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif' }}>
                This plugin is not available for purchase
              </p>
            )}
          </div>

          {/* Meta info */}
          <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif' }}>
            <span>⬇ {plugin.download_count || 0} downloads</span>
            <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>
            <span>Updated {plugin.updated_at ? new Date(plugin.updated_at).toLocaleDateString() : 'recently'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}