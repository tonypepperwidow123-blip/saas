import { Link } from 'react-router-dom';

export default function Pricing() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-text-primary">
          Simple, transparent pricing
        </h1>
        <p className="mt-4 text-lg text-text-secondary">
          Choose the perfect plan to manage and distribute your WordPress plugins.
        </p>
      </div>

      {/* Developer Plans Grid */}
      <div className="mt-12 grid gap-8 lg:grid-cols-3">
        {/* Free Plan */}
        <div className="rounded-2xl border border-border-subtle bg-bg-card p-8 flex flex-col">
          <h2 className="text-xl font-semibold text-text-primary">Free</h2>
          <p className="mt-2 text-sm text-text-secondary">
            Perfect for getting started.
          </p>
          <div className="mt-6 mb-8">
            <span className="text-4xl font-bold text-text-primary">₹0</span>
          </div>
          <ul className="space-y-4 flex-1">
            {[
              'Upload up to 5 plugins',
              'Unlimited plugin updates',
              'Automated license generation',
              'Secure ZIP file hosting',
              'Developer analytics dashboard',
            ].map((feature, i) => (
              <li key={i} className="flex items-center gap-3">
                <svg className="h-5 w-5 text-success shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-text-secondary">{feature}</span>
              </li>
            ))}
          </ul>
          <Link
            to="/register"
            className="mt-8 block w-full rounded-lg border border-accent bg-transparent px-6 py-3 text-center text-sm font-medium text-accent transition-colors hover:bg-accent hover:text-white"
          >
            Start for Free
          </Link>
        </div>

        {/* Pro Plan */}
        <div className="rounded-2xl border-2 border-accent bg-bg-card p-8 flex flex-col relative transform md:-translate-y-2 shadow-xl shadow-accent/10">
          <div className="absolute -top-4 inset-x-0 flex justify-center">
            <span className="bg-accent text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
              Most Popular
            </span>
          </div>
          <h2 className="text-xl font-semibold text-text-primary">Pro</h2>
          <p className="mt-2 text-sm text-text-secondary">
            For growing plugin businesses.
          </p>
          <div className="mt-6 mb-8">
            <span className="text-4xl font-bold text-text-primary">₹1,000</span>
          </div>
          <ul className="space-y-4 flex-1">
            {[
              'Upload up to 10 plugins',
              'Unlimited plugin updates',
              'Automated license generation',
              'Secure ZIP file hosting',
              'Developer analytics dashboard',
            ].map((feature, i) => (
              <li key={i} className="flex items-center gap-3">
                <svg className="h-5 w-5 text-success shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-text-secondary">{feature}</span>
              </li>
            ))}
          </ul>
          <Link
            to="/register"
            className="mt-8 block w-full rounded-lg bg-accent px-6 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-accent-hover"
          >
            Get Pro
          </Link>
        </div>

        {/* Business Plan */}
        <div className="rounded-2xl border border-border-subtle bg-bg-card p-8 flex flex-col">
          <h2 className="text-xl font-semibold text-text-primary">Business</h2>
          <p className="mt-2 text-sm text-text-secondary">
            For advanced agencies and studios.
          </p>
          <div className="mt-6 mb-8">
            <span className="text-4xl font-bold text-text-primary">₹1,500</span>
            <span className="text-text-secondary"> / mo</span>
          </div>
          <ul className="space-y-4 flex-1">
            {[
              'Upload up to 20 plugins',
              'Unlimited plugin updates',
              'Automated license generation',
              'Secure ZIP file hosting',
              'Developer analytics dashboard',
              'Priority Support',
            ].map((feature, i) => (
              <li key={i} className="flex items-center gap-3">
                <svg className="h-5 w-5 text-success shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-text-secondary">{feature}</span>
              </li>
            ))}
          </ul>
          <Link
            to="/register"
            className="mt-8 block w-full rounded-lg border border-border-subtle bg-bg-elevated px-6 py-3 text-center text-sm font-medium text-text-primary transition-colors hover:bg-border-subtle"
          >
            Get Business
          </Link>
        </div>
      </div>

      {/* Customer Plan */}
      <div className="mt-16 rounded-2xl border border-border-subtle bg-bg-card p-8 max-w-3xl mx-auto text-center">
        <h2 className="text-xl font-semibold text-text-primary">Are you a Customer?</h2>
        <p className="mt-2 text-text-secondary">
          Purchase and manage licenses for WordPress plugins across your sites completely free of platform charges.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-text-secondary">
          <span className="flex items-center gap-2"><svg className="h-4 w-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Browse marketplace</span>
          <span className="flex items-center gap-2"><svg className="h-4 w-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Manage license keys</span>
          <span className="flex items-center gap-2"><svg className="h-4 w-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Secure downloads</span>
        </div>
        <Link
          to="/register"
          className="mt-8 inline-block rounded-lg border border-accent px-8 py-3 text-center text-sm font-medium text-accent transition-colors hover:bg-accent/10"
        >
          Create Customer Account
        </Link>
      </div>

    </div>
  );
}