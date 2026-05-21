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
        theme: { color: '#6366f1' },
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

  return (
    <div className="space-y-6">
      <PageHeader title="My Plan" description="Manage your subscription and upload limits" />

      <div className="rounded-xl border border-border-subtle bg-bg-card">
        <div className="border-b border-border-subtle px-6 py-4">
          <h2 className="text-lg font-semibold text-text-primary">Subscription & Limits</h2>
        </div>
        <div className="p-6 space-y-6">
          {loading ? (
            <div className="h-20 animate-pulse rounded bg-bg-elevated" />
          ) : (
            <>
              {/* Usage Stats */}
              <div className="rounded-xl bg-bg-elevated p-5 flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary mb-1">Current Plan: <strong className="text-accent uppercase tracking-wider">{profile.subscription_plan}</strong></p>
                  <p className="text-sm font-medium text-text-primary">
                    Plugins Uploaded: {pluginCount} / {profile.subscription_plan === 'business' ? 20 : profile.subscription_plan === 'pro' ? 10 : 5}
                  </p>
                </div>
                <div className="text-right">
                  <div className="inline-block px-3 py-1 bg-accent/10 text-accent font-medium rounded-full text-xs">
                    {profile.subscription_plan === 'free' && 'Free Tier'}
                    {profile.subscription_plan === 'pro' && 'Pro Tier (₹1,000)'}
                    {profile.subscription_plan === 'business' && 'Business Tier (₹1,500/mo)'}
                  </div>
                </div>
              </div>

              {/* Upgrade Options */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Free Plan */}
                <div className={`rounded-xl border p-5 flex flex-col \${profile.subscription_plan === 'free' ? 'border-accent bg-accent/5' : 'border-border-subtle bg-bg-elevated'}`}>
                  <h3 className="font-semibold text-text-primary mb-1">Free</h3>
                  <p className="text-xl font-bold text-text-primary mb-4">₹0</p>
                  <ul className="text-sm text-text-secondary space-y-2 mb-6 flex-1">
                    <li>• Upload up to 5 plugins</li>
                    <li>• Unlimited updates</li>
                  </ul>
                  <button 
                    disabled={profile.subscription_plan === 'free' || saving}
                    onClick={() => handleUpgrade('free')}
                    className={`w-full py-2 rounded-lg text-sm font-medium \${profile.subscription_plan === 'free' ? 'bg-bg-card text-text-muted cursor-not-allowed border border-border-subtle' : 'bg-bg-card border border-border-subtle text-text-primary hover:bg-bg-elevated'}`}
                  >
                    {profile.subscription_plan === 'free' ? 'Current Plan' : 'Downgrade'}
                  </button>
                </div>

                {/* Pro Plan */}
                <div className={`rounded-xl border p-5 flex flex-col \${profile.subscription_plan === 'pro' ? 'border-accent bg-accent/5' : 'border-border-subtle bg-bg-elevated'}`}>
                  <h3 className="font-semibold text-text-primary mb-1">Pro</h3>
                  <p className="text-xl font-bold text-text-primary mb-4">₹1,000</p>
                  <ul className="text-sm text-text-secondary space-y-2 mb-6 flex-1">
                    <li>• Upload up to 10 plugins</li>
                    <li>• Unlimited updates</li>
                  </ul>
                  <button 
                    disabled={profile.subscription_plan === 'pro' || saving}
                    onClick={() => handleUpgrade('pro')}
                    className={`w-full py-2 rounded-lg text-sm font-medium \${profile.subscription_plan === 'pro' ? 'bg-bg-card text-text-muted cursor-not-allowed border border-border-subtle' : 'bg-accent text-white hover:bg-accent-hover'}`}
                  >
                    {profile.subscription_plan === 'pro' ? 'Current Plan' : 'Select Pro'}
                  </button>
                </div>

                {/* Business Plan */}
                <div className={`rounded-xl border p-5 flex flex-col \${profile.subscription_plan === 'business' ? 'border-accent bg-accent/5' : 'border-border-subtle bg-bg-elevated'}`}>
                  <h3 className="font-semibold text-text-primary mb-1">Business</h3>
                  <p className="text-xl font-bold text-text-primary mb-4">₹1,500 <span className="text-xs text-text-muted font-normal">/ mo</span></p>
                  <ul className="text-sm text-text-secondary space-y-2 mb-6 flex-1">
                    <li>• Upload up to 20 plugins</li>
                    <li>• Unlimited updates</li>
                  </ul>
                  <button 
                    disabled={profile.subscription_plan === 'business' || saving}
                    onClick={() => handleUpgrade('business')}
                    className={`w-full py-2 rounded-lg text-sm font-medium \${profile.subscription_plan === 'business' ? 'bg-bg-card text-text-muted cursor-not-allowed border border-border-subtle' : 'bg-accent text-white hover:bg-accent-hover'}`}
                  >
                    {profile.subscription_plan === 'business' ? 'Current Plan' : 'Select Business'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
