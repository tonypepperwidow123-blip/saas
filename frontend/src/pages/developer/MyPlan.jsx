import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/auth.store';
import { pluginService } from '../../services/plugin.service';
import { paymentService } from '../../services/payment.service';
import PageHeader from '../../components/shared/PageHeader';

export default function MyPlan() {
  const [profile, setProfile] = useState({ subscription_plan: 'free' });
  const [pluginCount, setPluginCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const userId = useAuthStore(state => state.user?.id);

  useEffect(() => {
    if (userId) fetchPlanData();
  }, [userId]);

  const fetchPlanData = async () => {
    try {
      // Fetch profile and plugin count in parallel
      const [profileRes, pluginsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        pluginService.getMyPlugins({ limit: 1 })
      ]);
      
      const profileData = profileRes.data;
      
      if (profileData) {
        setProfile({ subscription_plan: profileData.subscription_plan || 'free' });
      }
      
      // Always update plugin count if pluginsRes succeeded
      if (pluginsRes && pluginsRes.success) {
        setPluginCount(pluginsRes.data?.pagination?.total || pluginsRes.data?.items?.length || 0);
      }
    } catch (error) {
      console.warn('Failed to fetch plan data:', error?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (plan) => {
    setSaving(true);
    try {
      if (plan === 'free') {
        const { error } = await supabase.from('profiles').update({ subscription_plan: plan }).eq('id', userId);
        if (error) throw error;
        setProfile(p => ({ ...p, subscription_plan: plan }));
        toast.success('Downgraded to Free plan successfully');
        setSaving(false);
        return;
      }

      // Pro or Business - Create Razorpay order (or bypass if not configured)
      const response = await paymentService.createPlanUpgradeOrder(plan);

      if (!response.success) {
        throw new Error(response.error || 'Failed to create payment order');
      }

      // CASE 1: Razorpay gateway bypassed (no keys configured) - plan already upgraded by backend
      if (!response.data.razorpay_order_id) {
        setProfile(p => ({ ...p, subscription_plan: plan }));
        toast.success(response.data.message || `Switched to ${plan.toUpperCase()} plan!`);
        setSaving(false);
        return;
      }

      // CASE 2: Full Razorpay flow
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: response.data.amount * 100,
        currency: response.data.currency || 'INR',
        name: 'PluginVault',
        description: `Upgrade to ${plan.toUpperCase()} Plan`,
        order_id: response.data.razorpay_order_id,
        handler: async (paymentResult) => {
          try {
            const verifyResponse = await paymentService.verifyPlanUpgrade({
              razorpay_order_id: paymentResult.razorpay_order_id,
              razorpay_payment_id: paymentResult.razorpay_payment_id,
              razorpay_signature: paymentResult.razorpay_signature,
              plan,
            });
            if (verifyResponse.success) {
              setProfile(p => ({ ...p, subscription_plan: plan }));
              toast.success(verifyResponse.data.message || `Upgraded to ${plan.toUpperCase()} plan!`);
            }
          } catch {
            toast.error('Payment verification failed');
          } finally {
            setSaving(false);
          }
        },
        prefill: {
          email: useAuthStore.getState().user?.email,
          name: useAuthStore.getState().user?.name,
        },
        theme: { color: '#f59e0b' },
        modal: {
          ondismiss: () => {
            setSaving(false);
            toast.info('Payment cancelled');
          },
        },
      };

      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', (resp) => {
          setSaving(false);
          toast.error(`Payment failed: ${resp.error.description}`);
        });
        rzp.open();
      } else {
        toast.error('Payment gateway not loaded. Please refresh and try again.');
        setSaving(false);
      }
    } catch (e) {
      console.error('Upgrade error:', e);
      toast.error(e.message || 'Failed to initiate upgrade');
      setSaving(false);
    }
  };

  const getLimit = (plan) => {
    if (plan === 'business') return 20;
    if (plan === 'pro') return 10;
    return 5;
  };

  return (
    <div className="space-y-6 page-enter">
      <PageHeader 
        title="My Plan" 
        description="Review and configure your seller plan parameters, upload limits, and subscriptions" 
      />

      <div className="glass-card p-8 rounded-3xl border border-border-subtle shadow-card card-accent-top space-y-8">
        {loading ? (
          <div className="space-y-4">
            <div className="h-24 shimmer rounded-2xl" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => <div key={i} className="h-64 shimmer rounded-2xl" />)}
            </div>
          </div>
        ) : (
          <>
            {/* Usage Stats Banner */}
            <div className="rounded-2xl border border-border-accent/40 bg-accent-dim/15 p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-inner-glow">
              <div className="space-y-1 text-center md:text-left">
                <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Subscription Plan Active
                </p>
                <h3 className="text-xl font-extrabold text-text-primary uppercase tracking-tight font-display">
                  {profile.subscription_plan} TIER
                </h3>
                <p className="text-sm text-text-secondary mt-1">
                  Product upload usage: <strong className="text-text-primary font-mono">{pluginCount}</strong> of <strong className="text-text-primary font-mono">{getLimit(profile.subscription_plan)}</strong> extensions allocated.
                </p>
              </div>
              <div className="shrink-0">
                <span className="btn-amber px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider shadow-glow-sm">
                  {profile.subscription_plan === 'free' ? 'Basic Member' : 'Premium Developer'}
                </span>
              </div>
            </div>

            {/* Upgrade Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Free Plan Card */}
              <div className={`rounded-2xl border p-6 flex flex-col transition-all duration-300 relative ${
                profile.subscription_plan === 'free' 
                  ? 'border-accent bg-accent-dim/15 shadow-glow-sm scale-[1.02]' 
                  : 'border-border-subtle bg-bg-elevated/40 hover:border-border-strong hover:bg-bg-elevated/60'
              }`}>
                {profile.subscription_plan === 'free' && (
                  <span className="absolute top-0 right-6 -translate-y-1/2 px-2.5 py-0.5 rounded-full bg-accent text-black text-xs font-bold uppercase tracking-widest border border-accent">
                    Active
                  </span>
                )}
                <div className="mb-5">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-text-secondary">Free Plan</h4>
                  <p className="text-3xl font-extrabold text-text-primary font-display mt-2">
                    ₹0
                  </p>
                  <p className="text-xs text-text-muted mt-1">Permanent baseline access</p>
                </div>
                <ul className="text-sm text-text-secondary space-y-2.5 mb-8 flex-1">
                  <li className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    Upload up to 5 plugins
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    Unlimited release updates
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    Community forum access
                  </li>
                </ul>
                <button 
                  disabled={profile.subscription_plan === 'free' || saving}
                  onClick={() => handleUpgrade('free')}
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    profile.subscription_plan === 'free' 
                      ? 'btn-ghost cursor-not-allowed border border-border-strong text-text-muted opacity-60' 
                      : 'btn-ghost border border-border-strong text-text-primary hover:border-accent hover:bg-accent-dim/10'
                  }`}
                >
                  {profile.subscription_plan === 'free' ? 'Current Tier' : 'Downgrade'}
                </button>
              </div>

              {/* Pro Plan Card */}
              <div className={`rounded-2xl border p-6 flex flex-col transition-all duration-300 relative ${
                profile.subscription_plan === 'pro' 
                  ? 'border-accent bg-accent-dim/15 shadow-glow-sm scale-[1.02]' 
                  : 'border-border-subtle bg-bg-elevated/40 hover:border-border-strong hover:bg-bg-elevated/60'
              }`}>
                {profile.subscription_plan === 'pro' && (
                  <span className="absolute top-0 right-6 -translate-y-1/2 px-2.5 py-0.5 rounded-full bg-accent text-black text-xs font-bold uppercase tracking-widest border border-accent">
                    Active
                  </span>
                )}
                <div className="mb-5">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-text-secondary">Pro Plan</h4>
                  <p className="text-3xl font-extrabold text-text-primary font-display mt-2">
                    ₹1,000
                  </p>
                  <p className="text-xs text-text-muted mt-1">One-time developer fee</p>
                </div>
                <ul className="text-sm text-text-secondary space-y-2.5 mb-8 flex-1">
                  <li className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    Upload up to 10 plugins
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    Unlimited release updates
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    Standard support options
                  </li>
                </ul>
                <button 
                  disabled={profile.subscription_plan === 'pro' || saving}
                  onClick={() => handleUpgrade('pro')}
                  className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all ${
                    profile.subscription_plan === 'pro' 
                      ? 'btn-ghost cursor-not-allowed border border-border-strong text-text-muted opacity-60' 
                      : 'btn-amber shadow-glow-sm hover:shadow-glow'
                  }`}
                >
                  {profile.subscription_plan === 'pro' ? 'Current Tier' : 'Upgrade to Pro'}
                </button>
              </div>

              {/* Business Plan Card */}
              <div className={`rounded-2xl border p-6 flex flex-col transition-all duration-300 relative ${
                profile.subscription_plan === 'business' 
                  ? 'border-accent bg-accent-dim/15 shadow-glow-sm scale-[1.02]' 
                  : 'border-border-subtle bg-bg-elevated/40 hover:border-border-strong hover:bg-bg-elevated/60'
              }`}>
                {profile.subscription_plan === 'business' && (
                  <span className="absolute top-0 right-6 -translate-y-1/2 px-2.5 py-0.5 rounded-full bg-accent text-black text-xs font-bold uppercase tracking-widest border border-accent">
                    Active
                  </span>
                )}
                <div className="mb-5">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-text-secondary">Business Plan</h4>
                  <p className="text-3xl font-extrabold text-text-primary font-display mt-2">
                    ₹1,500 <span className="text-xs text-text-muted font-normal">/ mo</span>
                  </p>
                  <p className="text-xs text-text-muted mt-1">Recurring subscription tier</p>
                </div>
                <ul className="text-sm text-text-secondary space-y-2.5 mb-8 flex-1">
                  <li className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    Upload up to 20 plugins
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    Unlimited release updates
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    Priority VIP seller support
                  </li>
                </ul>
                <button 
                  disabled={profile.subscription_plan === 'business' || saving}
                  onClick={() => handleUpgrade('business')}
                  className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all ${
                    profile.subscription_plan === 'business' 
                      ? 'btn-ghost cursor-not-allowed border border-border-strong text-text-muted opacity-60' 
                      : 'btn-amber shadow-glow-sm hover:shadow-glow'
                  }`}
                >
                  {profile.subscription_plan === 'business' ? 'Current Tier' : 'Upgrade to Business'}
                </button>
              </div>

            </div>
          </>
        )}
      </div>
    </div>
  );
}

