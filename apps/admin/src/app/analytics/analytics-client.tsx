'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { fetchAdminAnalytics, type AdminAnalytics } from '@/lib/admin-api';
import { Loader2, Users, CalendarDays, BarChart3, Building, Radio, Sparkles, TrendingUp, Activity } from 'lucide-react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function AnalyticsClient() {
  const router = useRouter();
  const [data, setData] = React.useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetchAdminAnalytics()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-surface-canvas p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/home"
          className="mb-6 inline-flex items-center text-sm font-medium text-ink-muted hover:text-foreground transition-colors"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
              Platform Analytics
            </h1>
            <p className="mt-2 text-sm text-ink-muted max-w-2xl">
              Platform-wide usage metrics, user growth, and event activity trends.
            </p>
          </div>
          {loading && (
            <div className="flex items-center gap-2 text-sm text-brand font-medium">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading metrics...
            </div>
          )}
        </div>

        {error && (
          <div className="mb-8 rounded-lg bg-destructive/10 p-4 text-sm text-destructive border border-destructive/20">
            {error}
          </div>
        )}

        {!loading && data && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {/* Organizations */}
            <div className="rounded-xl border border-border bg-surface-card p-6 shadow-sm flex flex-col justify-between hover:border-brand/30 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-ink-muted uppercase tracking-wider">Organizations</p>
                  <h3 className="mt-2 text-3xl font-bold tracking-tight text-foreground">{data.totalOrganizations}</h3>
                </div>
                <div className="rounded-lg bg-brand/10 p-2 text-brand">
                  <Building className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-4 text-xs font-medium text-ink-muted">Total multi-tenant workspaces</p>
            </div>

            {/* Users */}
            <div className="rounded-xl border border-border bg-surface-card p-6 shadow-sm flex flex-col justify-between hover:border-brand/30 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-ink-muted uppercase tracking-wider">Total Users</p>
                  <h3 className="mt-2 text-3xl font-bold tracking-tight text-foreground">{data.totalUsers}</h3>
                </div>
                <div className="rounded-lg bg-brand/10 p-2 text-brand">
                  <Users className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-4 flex items-center text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="mr-1 h-3 w-3" />
                +{data.newUsersThisMonth} new this month
              </p>
            </div>

            {/* DAU */}
            <div className="rounded-xl border border-border bg-surface-card p-6 shadow-sm flex flex-col justify-between hover:border-brand/30 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold text-ink-muted uppercase tracking-wider">DAU</p>
                    <span className="text-[10px] font-medium bg-brand/10 text-brand px-1.5 py-0.5 rounded-full" title="Daily Active Users (Authenticated Hosts only, excludes anonymous participants)">?</span>
                  </div>
                  <h3 className="mt-2 text-3xl font-bold tracking-tight text-foreground">{data.dailyActiveUsers}</h3>
                </div>
                <div className="rounded-lg bg-brand/10 p-2 text-brand">
                  <Activity className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-4 text-xs font-medium text-ink-muted">Active in the last 24 hours</p>
            </div>

            {/* MAU */}
            <div className="rounded-xl border border-border bg-surface-card p-6 shadow-sm flex flex-col justify-between hover:border-brand/30 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold text-ink-muted uppercase tracking-wider">MAU</p>
                    <span className="text-[10px] font-medium bg-brand/10 text-brand px-1.5 py-0.5 rounded-full" title="Monthly Active Users (Authenticated Hosts only, excludes anonymous participants)">?</span>
                  </div>
                  <h3 className="mt-2 text-3xl font-bold tracking-tight text-foreground">{data.monthlyActiveUsers}</h3>
                </div>
                <div className="rounded-lg bg-brand/10 p-2 text-brand">
                  <Activity className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-4 text-xs font-medium text-ink-muted">Active in the last 30 days</p>
            </div>

            {/* Events */}
            <div className="rounded-xl border border-border bg-surface-card p-6 shadow-sm flex flex-col justify-between hover:border-brand/30 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-ink-muted uppercase tracking-wider">Total Events</p>
                  <h3 className="mt-2 text-3xl font-bold tracking-tight text-foreground">{data.totalEvents}</h3>
                </div>
                <div className="rounded-lg bg-brand/10 p-2 text-brand">
                  <CalendarDays className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-4 flex items-center text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="mr-1 h-3 w-3" />
                +{data.newEventsThisMonth} created this month
              </p>
            </div>

            {/* Live Events */}
            <div className="rounded-xl border border-border bg-surface-card p-6 shadow-sm flex flex-col justify-between hover:border-brand/30 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-ink-muted uppercase tracking-wider">Live Events</p>
                  <h3 className="mt-2 text-3xl font-bold tracking-tight text-foreground">{data.liveEvents}</h3>
                </div>
                <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400">
                  <Radio className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-4 text-xs font-medium text-ink-muted">Active sessions right now</p>
            </div>

            {/* AI Requests */}
            <div className="rounded-xl border border-border bg-surface-card p-6 shadow-sm flex flex-col justify-between hover:border-brand/30 transition-colors sm:col-span-2 lg:col-span-1">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-ink-muted uppercase tracking-wider">AI Studio Usage</p>
                  <h3 className="mt-2 text-3xl font-bold tracking-tight text-foreground">{data.totalAIRequests}</h3>
                </div>
                <div className="rounded-lg bg-amber-500/10 p-2 text-amber-600 dark:text-amber-400">
                  <Sparkles className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-4 text-xs font-medium text-ink-muted">Total generative AI requests across platform</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
