import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-accent/20 rounded-full blur-[128px]" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-[128px]" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-text-primary sm:text-6xl">
              The marketplace for<br />
              <span className="text-accent">WordPress plugins</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-text-secondary">
              PluginVault is the infrastructure layer that gives WordPress developers a reliable, self-hosted way to sell and license their plugins with automatic update delivery.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link
                to="/register"
                className="rounded-lg bg-accent px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
              >
                Get Started
              </Link>
              <Link
                to="/shop"
                className="rounded-lg border border-border-subtle bg-bg-card px-6 py-3 text-sm font-medium text-text-primary transition-colors hover:bg-bg-elevated"
              >
                Browse Plugins
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 border-t border-border-subtle">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-text-primary">
              Built for developers, designed for scale
            </h2>
            <p className="mt-4 text-lg text-text-secondary">
              Everything you need to monetize your WordPress plugins
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: 'License Management',
                description: 'Generate secure license keys, control activation limits, and manage licenses across all your customers.',
              },
              {
                title: 'Automatic Updates',
                description: 'WordPress plugins built on PluginVault receive updates directly from your hosted files — no manual uploads.',
              },
              {
                title: 'Secure Delivery',
                description: 'Plugin ZIPs are stored in private storage with time-limited signed URLs. No public access.',
              },
              {
                title: 'Admin Moderation',
                description: 'Every plugin goes through approval before appearing in the marketplace. Quality guaranteed.',
              },
              {
                title: 'Developer Analytics',
                description: 'Track downloads, activations, and revenue for each plugin with detailed charts.',
              },
              {
                title: 'Customer Portal',
                description: 'Customers get a unified dashboard to manage all their plugin licenses and activations.',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="rounded-xl border border-border-subtle bg-bg-card p-6"
              >
                <h3 className="text-lg font-semibold text-text-primary">{feature.title}</h3>
                <p className="mt-2 text-sm text-text-secondary">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-border-subtle">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-border-subtle bg-bg-card p-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-text-primary">
              Ready to get started?
            </h2>
            <p className="mt-4 text-lg text-text-secondary">
              Join as a developer and start selling your WordPress plugins today.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Link
                to="/register"
                className="rounded-lg bg-accent px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
              >
                Create Developer Account
              </Link>
              <Link
                to="/pricing"
                className="rounded-lg border border-border-subtle bg-bg-elevated px-6 py-3 text-sm font-medium text-text-primary transition-colors hover:bg-border-subtle"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}