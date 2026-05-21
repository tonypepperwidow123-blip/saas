import { useState, useEffect } from 'react';
import { developerService } from '../../services/developer.service';
import PageHeader from '../../components/shared/PageHeader';
import StatusBadge from '../../components/shared/StatusBadge';
import EmptyState from '../../components/shared/EmptyState';
import { formatDate } from '../../utils/formatters';

export default function DeveloperLicenses() {
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLicenses();
  }, []);

  const fetchLicenses = async () => {
    try {
      const response = await developerService.getLicenses({ limit: 50 });
      if (response.success) {
        setLicenses(response.data.items);
      }
    } catch (error) {
      console.warn('Failed to fetch licenses:', error?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Licenses" description="View all licenses for your plugins" />

      <div className="rounded-xl border border-border-subtle bg-bg-card overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">{[1, 2, 3, 4, 5].map(i => <div key={i} className="h-16 animate-pulse rounded bg-bg-elevated" />)}</div>
        ) : licenses.length === 0 ? (
          <EmptyState title="No licenses yet" description="Licenses are created when customers purchase your plugins" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-subtle bg-bg-elevated text-left">
                  <th className="px-6 py-3 text-sm font-medium text-text-secondary">License Key</th>
                  <th className="px-6 py-3 text-sm font-medium text-text-secondary">Plugin</th>
                  <th className="px-6 py-3 text-sm font-medium text-text-secondary">Customer</th>
                  <th className="px-6 py-3 text-sm font-medium text-text-secondary">Activated Sites</th>
                  <th className="px-6 py-3 text-sm font-medium text-text-secondary">Status</th>
                  <th className="px-6 py-3 text-sm font-medium text-text-secondary">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {licenses.map(lic => (
                  <tr key={lic.id} className="hover:bg-bg-elevated">
                    <td className="px-6 py-4">
                      <code className="text-sm font-mono text-accent">{lic.license_key}</code>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-primary">{lic.plugin?.name || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-text-secondary">{lic.customer?.name || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {lic.activations?.length > 0 ? (
                        <ul className="list-disc list-inside">
                          {lic.activations.map((a, i) => (
                            a.site_url ? <li key={i}><a href={a.site_url} target="_blank" rel="noreferrer" className="hover:text-accent truncate inline-block align-bottom max-w-[150px]">{a.site_url}</a></li> : null
                          ))}
                        </ul>
                      ) : (
                        <span className="text-text-muted italic">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4"><StatusBadge status={lic.status} size="sm" /></td>
                    <td className="px-6 py-4 text-sm text-text-muted">{formatDate(lic.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}