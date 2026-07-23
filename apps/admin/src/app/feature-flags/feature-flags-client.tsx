'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { 
  FeatureFlag, createFeatureFlag, updateFeatureFlag, deleteFeatureFlag, 
  fetchFeatureFlags, AdminApiError, fetchAdminOrganizations, setFeatureFlagOverride, deleteFeatureFlagOverride,
  AdminOrganizationSummary 
} from '@/lib/admin-api';
import { ChevronLeft, Plus, Trash2, Power, PowerOff, ShieldAlert, Loader2, Building, X } from 'lucide-react';
import Link from 'next/link';

export function FeatureFlagsClient() {
  const router = useRouter();
  const [flags, setFlags] = React.useState<FeatureFlag[]>([]);
  const [orgs, setOrgs] = React.useState<AdminOrganizationSummary[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [isCreating, setIsCreating] = React.useState(false);
  const [newKey, setNewKey] = React.useState('');
  const [newName, setNewName] = React.useState('');
  const [newDesc, setNewDesc] = React.useState('');

  const [expandedFlagKey, setExpandedFlagKey] = React.useState<string | null>(null);
  const [overrideOrgId, setOverrideOrgId] = React.useState('');
  const [overrideValue, setOverrideValue] = React.useState(true);
  const [isSubmittingOverride, setIsSubmittingOverride] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    
    Promise.all([
      fetchFeatureFlags(),
      fetchAdminOrganizations({ limit: 500 })
    ])
      .then(([flagsData, orgsData]) => {
        if (!cancelled) {
          setFlags(flagsData);
          setOrgs(orgsData.data);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          if (err instanceof AdminApiError && err.status === 401) {
            router.push('/login');
          } else {
            setError(err instanceof Error ? err.message : 'Unknown error');
          }
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [router]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await createFeatureFlag({
        key: newKey,
        name: newName,
        description: newDesc,
        isGlobalEnabled: false
      });
      setFlags([...flags, created]);
      setIsCreating(false);
      setNewKey('');
      setNewName('');
      setNewDesc('');
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create flag.');
    }
  };

  const handleToggle = async (key: string, current: boolean) => {
    try {
      const updated = await updateFeatureFlag(key, { isGlobalEnabled: !current });
      setFlags(flags.map(f => f.key === key ? updated : f));
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update flag.');
    }
  };

  const handleDelete = async (key: string) => {
    if (!confirm('Are you sure you want to delete this feature flag? This may break code relying on it if not handled properly.')) return;
    try {
      await deleteFeatureFlag(key);
      setFlags(flags.filter(f => f.key !== key));
      if (expandedFlagKey === key) setExpandedFlagKey(null);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete flag.');
    }
  };

  const handleAddOverride = async (key: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideOrgId) return;
    setIsSubmittingOverride(true);
    try {
      const updated = await setFeatureFlagOverride(key, overrideOrgId, overrideValue);
      setFlags(flags.map(f => f.key === key ? { ...f, organizationOverrides: updated.organizationOverrides } : f));
      setOverrideOrgId('');
      setOverrideValue(true);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to set override.');
    } finally {
      setIsSubmittingOverride(false);
    }
  };

  const handleRemoveOverride = async (key: string, orgId: string) => {
    if (!confirm('Remove this override? The organization will fall back to the global flag value.')) return;
    try {
      const updated = await deleteFeatureFlagOverride(key, orgId);
      setFlags(flags.map(f => f.key === key ? { ...f, organizationOverrides: updated.organizationOverrides } : f));
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to remove override.');
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 space-y-8">
      <div>
        <Link
          href="/home"
          className="inline-flex items-center text-sm font-medium text-ink-muted hover:text-foreground transition-colors mb-4"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Dashboard
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
              Feature Flags
            </h1>
            <p className="mt-2 text-sm text-ink-secondary max-w-2xl">
              Control platform rollouts safely. Features disabled globally can still be enabled for specific organizations via the API.
            </p>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-brand px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand/90 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 transition-colors"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Flag
          </button>
        </div>
      </div>

      {isCreating && (
        <form onSubmit={handleCreate} className="bg-surface-card border border-border rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Create Feature Flag</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-foreground">Flag Key</label>
              <input
                type="text"
                required
                placeholder="e.g. ai-studio"
                value={newKey}
                onChange={e => setNewKey(e.target.value)}
                className="mt-1 block w-full rounded-md border-border bg-surface shadow-sm focus:border-brand focus:ring-brand sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">Friendly Name</label>
              <input
                type="text"
                required
                placeholder="e.g. AI Studio Beta"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="mt-1 block w-full rounded-md border-border bg-surface shadow-sm focus:border-brand focus:ring-brand sm:text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground">Description</label>
            <input
              type="text"
              required
              placeholder="What does this flag control?"
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
              className="mt-1 block w-full rounded-md border-border bg-surface shadow-sm focus:border-brand focus:ring-brand sm:text-sm"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 text-sm font-medium text-ink hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-md bg-brand px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand/90 transition-colors"
            >
              Create Flag
            </button>
          </div>
        </form>
      )}

      <div className="bg-surface-card border border-border rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand mb-4" />
            <p className="text-sm text-ink-secondary">Loading feature flags...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <ShieldAlert className="mx-auto h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-medium text-foreground">Failed to load feature flags</h3>
            <p className="mt-1 text-sm text-ink-secondary">{error}</p>
          </div>
        ) : flags.length === 0 ? (
          <div className="p-12 text-center">
            <ShieldAlert className="mx-auto h-12 w-12 text-ink-muted/50 mb-4" />
            <h3 className="text-lg font-medium text-foreground">No feature flags</h3>
            <p className="mt-1 text-sm text-ink-secondary">Get started by creating your first feature flag.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {flags.map((flag) => {
              const hasOverrides = Object.keys(flag.organizationOverrides).length > 0;
              return (
                <li key={flag.key} className="p-0 hover:bg-surface/50 transition-colors">
                  <div className="flex items-center justify-between p-6">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold text-foreground">{flag.name}</h3>
                        <span className="inline-flex items-center rounded-full bg-surface-subtle px-2 py-0.5 text-xs font-mono font-medium text-ink-secondary border border-border">
                          {flag.key}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-ink-secondary">{flag.description}</p>
                      
                      {hasOverrides && (
                        <p className="mt-2 flex items-center text-xs font-medium text-brand bg-brand/10 w-fit px-2 py-1 rounded-md">
                          Has {Object.keys(flag.organizationOverrides).length} organization-level override(s)
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggle(flag.key, flag.isGlobalEnabled)}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                          flag.isGlobalEnabled 
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-200 hover:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30' 
                            : 'bg-surface text-ink-muted border-border hover:text-foreground'
                        }`}
                      >
                        {flag.isGlobalEnabled ? (
                          <><Power className="h-4 w-4" /> Global On</>
                        ) : (
                          <><PowerOff className="h-4 w-4" /> Global Off</>
                        )}
                      </button>
                      <button
                        onClick={() => setExpandedFlagKey(expandedFlagKey === flag.key ? null : flag.key)}
                        className="px-3 py-1.5 text-sm font-medium text-ink-secondary hover:text-foreground transition-colors border border-border rounded-md hover:bg-surface-subtle"
                      >
                        Overrides
                      </button>
                      <button
                        onClick={() => handleDelete(flag.key)}
                        className="p-1.5 text-ink-muted hover:text-red-600 transition-colors rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
                        title="Delete Flag"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {expandedFlagKey === flag.key && (
                    <div className="px-6 pb-6 pt-2 bg-surface-canvas/50 border-t border-border">
                      <h4 className="text-sm font-semibold text-foreground mb-4">Organization Overrides</h4>
                      
                      {hasOverrides ? (
                        <div className="space-y-2 mb-6">
                          {Object.entries(flag.organizationOverrides).map(([orgId, isEnabled]) => {
                            const org = orgs.find(o => o.id === orgId);
                            return (
                              <div key={orgId} className="flex items-center justify-between py-2 px-3 bg-surface border border-border rounded-lg">
                                <div className="flex items-center gap-2 text-sm text-foreground">
                                  <Building className="h-4 w-4 text-ink-muted" />
                                  <span className="font-medium">{org ? org.name : orgId}</span>
                                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${isEnabled ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                    {isEnabled ? 'Enabled' : 'Disabled'}
                                  </span>
                                </div>
                                <button
                                  onClick={() => handleRemoveOverride(flag.key, orgId)}
                                  className="text-ink-muted hover:text-red-600 p-1"
                                  title="Remove override"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-sm text-ink-secondary mb-6">No overrides configured for this flag.</p>
                      )}

                      <form onSubmit={(e) => handleAddOverride(flag.key, e)} className="flex items-end gap-3 bg-surface p-4 border border-border rounded-lg">
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-ink-secondary mb-1">Organization</label>
                          <select
                            value={overrideOrgId}
                            onChange={(e) => setOverrideOrgId(e.target.value)}
                            className="w-full h-9 rounded-md border border-border bg-surface px-3 text-sm text-foreground focus:border-brand focus:ring-1 focus:ring-brand"
                            required
                          >
                            <option value="">Select an organization...</option>
                            {orgs
                              .filter(org => !flag.organizationOverrides[org.id])
                              .map(org => (
                                <option key={org.id} value={org.id}>{org.name}</option>
                              ))}
                          </select>
                        </div>
                        <div className="w-32">
                          <label className="block text-xs font-medium text-ink-secondary mb-1">State</label>
                          <select
                            value={overrideValue.toString()}
                            onChange={(e) => setOverrideValue(e.target.value === 'true')}
                            className="w-full h-9 rounded-md border border-border bg-surface px-3 text-sm text-foreground focus:border-brand focus:ring-1 focus:ring-brand"
                          >
                            <option value="true">Enabled</option>
                            <option value="false">Disabled</option>
                          </select>
                        </div>
                        <button
                          type="submit"
                          disabled={!overrideOrgId || isSubmittingOverride}
                          className="h-9 px-4 rounded-md bg-brand text-white text-sm font-medium hover:bg-brand/90 disabled:opacity-50 transition-colors flex items-center gap-2"
                        >
                          {isSubmittingOverride && <Loader2 className="h-3 w-3 animate-spin" />}
                          Add Override
                        </button>
                      </form>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
