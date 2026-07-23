'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Search, 
  Users, 
  CalendarDays, 
  Puzzle, 
  Loader2, 
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  Activity,
  LifeBuoy,
  BookOpen
} from 'lucide-react';
import { 
  fetchAdminUsers, 
  fetchAdminEvents, 
  fetchAdminIntegrations,
  fetchSupportTickets,
  fetchKnowledgeArticles
} from '@/lib/admin-api';
import type { 
  AdminUserListResponse, 
  AdminEventListResponse, 
  AdminIntegrationList,
  AdminUserSummary,
  AdminEventSummary,
  SupportTicketListResponse,
  SupportTicketSummary,
  KnowledgeArticleListResponse,
  KnowledgeArticleSummary
} from '@/lib/admin-api';
import { formatDateTime } from '@/lib/utils';
import { Breadcrumb } from '@/components/ui/breadcrumb';

export default function SupportClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = React.useState(initialQuery);
  const [loading, setLoading] = React.useState(false);

  const [users, setUsers] = React.useState<{ data: AdminUserListResponse | null; error: string | null }>({ data: null, error: null });
  const [events, setEvents] = React.useState<{ data: AdminEventListResponse | null; error: string | null }>({ data: null, error: null });
  const [integrations, setIntegrations] = React.useState<{ data: AdminIntegrationList | null; error: string | null }>({ data: null, error: null });
  const [tickets, setTickets] = React.useState<{ data: SupportTicketListResponse | null; error: string | null }>({ data: null, error: null });
  const [articles, setArticles] = React.useState<{ data: KnowledgeArticleListResponse | null; error: string | null }>({ data: null, error: null });

  React.useEffect(() => {
    if (!query || query.trim().length < 2) {
      setUsers({ data: null, error: null });
      setEvents({ data: null, error: null });
      setIntegrations({ data: null, error: null });
      setTickets({ data: null, error: null });
      setArticles({ data: null, error: null });
      setLoading(false);
      return;
    }

    const timer = setTimeout(() => {
      setLoading(true);
      
      Promise.allSettled([
        fetchAdminUsers({ search: query, limit: 5 }),
        fetchAdminEvents({ search: query, limit: 5 }),
        fetchAdminIntegrations({ search: query, limit: 5 }),
        fetchSupportTickets({ search: query, limit: 5 }),
        fetchKnowledgeArticles({ search: query, limit: 5 })
      ]).then(([usersRes, eventsRes, integrationsRes, ticketsRes, articlesRes]) => {
        
        setUsers({
          data: usersRes.status === 'fulfilled' ? usersRes.value : null,
          error: usersRes.status === 'rejected' ? (usersRes.reason instanceof Error ? usersRes.reason.message : 'Failed to fetch users') : null,
        });

        setEvents({
          data: eventsRes.status === 'fulfilled' ? eventsRes.value : null,
          error: eventsRes.status === 'rejected' ? (eventsRes.reason instanceof Error ? eventsRes.reason.message : 'Failed to fetch events') : null,
        });

        setIntegrations({
          data: integrationsRes.status === 'fulfilled' ? integrationsRes.value : null,
          error: integrationsRes.status === 'rejected' ? (integrationsRes.reason instanceof Error ? integrationsRes.reason.message : 'Failed to fetch integrations') : null,
        });

        setTickets({
          data: ticketsRes.status === 'fulfilled' ? ticketsRes.value : null,
          error: ticketsRes.status === 'rejected' ? (ticketsRes.reason instanceof Error ? ticketsRes.reason.message : 'Failed to fetch tickets') : null,
        });

        setArticles({
          data: articlesRes.status === 'fulfilled' ? articlesRes.value : null,
          error: articlesRes.status === 'rejected' ? (articlesRes.reason instanceof Error ? articlesRes.reason.message : 'Failed to fetch articles') : null,
        });

      }).finally(() => {
        setLoading(false);
      });
      
      // Update URL silently
      const url = new URL(window.location.href);
      url.searchParams.set('q', query);
      window.history.replaceState({}, '', url);
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  const hasResults = (users.data?.data.length || 0) > 0 || 
                     (events.data?.data.length || 0) > 0 || 
                     (integrations.data?.data.length || 0) > 0 ||
                     (tickets.data?.items.length || 0) > 0 ||
                     (articles.data?.items.length || 0) > 0;
  
  const hasAnyErrors = users.error || events.error || integrations.error || tickets.error || articles.error;
  const isValidQuery = query.trim().length >= 2;

  return (
    <div className="min-h-screen bg-surface-canvas p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">
        <Breadcrumb items={[{ label: 'Home', href: '/home' }, { label: 'Global Support Search' }]} className="mb-6" />

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
            Global Support Search
          </h1>
          <p className="mt-2 text-sm text-ink-muted max-w-2xl">
            Unified search across Users, Events, Integrations, Support Tickets, and Knowledge Base Articles.
          </p>
        </div>

        {/* Omnisearch Form */}
        <div className="mb-8 rounded-xl bg-surface-card p-4 shadow-sm border border-border flex flex-col md:flex-row gap-4 items-center relative z-10">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-muted" />
            <input
              type="text"
              autoFocus
              placeholder="Search by email, event code, ticket ID..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-12 w-full rounded-lg border border-border bg-surface pl-12 pr-4 text-base text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand placeholder:text-ink-muted transition-colors"
            />
          </div>
          {loading && (
            <div className="flex items-center gap-2 text-sm text-brand font-medium px-4">
              <Loader2 className="h-5 w-5 animate-spin" />
              Searching...
            </div>
          )}
        </div>

        {/* Empty State */}
        {!loading && isValidQuery && !hasResults && !hasAnyErrors && (
          <div className="rounded-xl border border-dashed border-border py-20 text-center bg-surface-canvas/50">
            <Search className="mx-auto h-8 w-8 text-ink-muted opacity-50" />
            <h3 className="mt-4 text-sm font-semibold text-foreground">No matching records</h3>
            <p className="mt-1 text-xs text-ink-muted">
              We could not find anything matching &quot;{query}&quot;.
            </p>
          </div>
        )}

        {/* Initial State */}
        {!isValidQuery && (
          <div className="rounded-xl border border-dashed border-border py-20 text-center opacity-50">
            <Activity className="mx-auto h-8 w-8 text-ink-muted" />
            <h3 className="mt-4 text-sm font-semibold text-foreground">Awaiting Input</h3>
            <p className="mt-1 text-xs text-ink-muted">
              {query.length > 0 ? "Please enter at least 2 characters to search." : "Type a search query above to investigate."}
            </p>
          </div>
        )}

        {/* Results */}
        {isValidQuery && (hasResults || hasAnyErrors) && (
          <div className="grid gap-8">
            
            {/* Users Section */}
            {users.error && (
              <div className="rounded border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
                Failed to load users: {users.error}
              </div>
            )}
            {users.data && users.data.data.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4 border-b border-border pb-2">
                  <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Users className="h-5 w-5 text-brand" /> Users
                  </h2>
                  {users.data.meta.total > users.data.data.length && (
                    <Link href={`/users?q=${encodeURIComponent(query)}`} className="text-sm text-brand hover:underline">
                      View all {users.data.meta.total} users
                    </Link>
                  )}
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {users.data.data.map((user: AdminUserSummary) => (
                    <Link key={user.id} href={`/users/${user.id}`} className="group block rounded-xl border border-border bg-surface-card p-5 hover:border-brand/50 hover:shadow-md transition-all">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-foreground truncate pr-4">{user.name}</h3>
                        <ChevronRight className="h-4 w-4 text-ink-muted opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all shrink-0" />
                      </div>
                      <p className="mt-1 text-sm text-ink-muted truncate">{user.email}</p>
                      <div className="mt-4 flex items-center gap-2">
                        <span className="inline-flex rounded bg-brand/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand">
                          {user.role}
                        </span>
                        <span className="text-[11px] text-ink-muted">Joined {formatDateTime(user.createdAt).split(',')[0]}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Events Section */}
            {events.error && (
              <div className="rounded border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
                Failed to load events: {events.error}
              </div>
            )}
            {events.data && events.data.data.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4 border-b border-border pb-2">
                  <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-brand" /> Events
                  </h2>
                  {events.data.meta.total > events.data.data.length && (
                    <Link href={`/events?q=${encodeURIComponent(query)}`} className="text-sm text-brand hover:underline">
                      View all {events.data.meta.total} events
                    </Link>
                  )}
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {events.data.data.map((event: AdminEventSummary) => (
                    <Link key={event.id} href={`/events/${event.id}`} className="group block rounded-xl border border-border bg-surface-card p-5 hover:border-brand/50 hover:shadow-md transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          event.status === 'live' ? 'bg-destructive/10 text-destructive' :
                          event.status === 'ended' ? 'bg-surface-sunken text-ink-muted border border-border' :
                          'bg-brand/10 text-brand'
                        }`}>
                          {event.status === 'live' && <span className="mr-1 h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />}
                          {event.status}
                        </span>
                        <ChevronRight className="h-4 w-4 text-ink-muted opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all shrink-0" />
                      </div>
                      <h3 className="font-semibold text-foreground truncate">{event.name}</h3>
                      <p className="mt-1 text-xs text-ink-muted flex items-center gap-1.5">
                        <span className="font-mono bg-surface rounded px-1 text-ink">{event.eventCode}</span>
                        • {event.hostName}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Support Tickets Section */}
            {tickets.error && (
              <div className="rounded border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
                Failed to load tickets: {tickets.error}
              </div>
            )}
            {tickets.data && tickets.data.items.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4 border-b border-border pb-2">
                  <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <LifeBuoy className="h-5 w-5 text-brand" /> Support Tickets
                  </h2>
                  {tickets.data.meta.total > tickets.data.items.length && (
                    <Link href={`/support-inbox?search=${encodeURIComponent(query)}`} className="text-sm text-brand hover:underline">
                      View all {tickets.data.meta.total} tickets
                    </Link>
                  )}
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {tickets.data.items.map((ticket: SupportTicketSummary) => (
                    <Link key={ticket._id} href={`/support-inbox/${ticket._id}`} className="group block rounded-xl border border-border bg-surface-card p-5 hover:border-brand/50 hover:shadow-md transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          ticket.status === 'OPEN' ? 'bg-destructive/10 text-destructive' :
                          ticket.status === 'IN_PROGRESS' ? 'bg-brand/10 text-brand' :
                          'bg-surface-sunken text-ink-muted border border-border'
                        }`}>
                          {ticket.status}
                        </span>
                        <ChevronRight className="h-4 w-4 text-ink-muted opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all shrink-0" />
                      </div>
                      <h3 className="font-semibold text-foreground truncate">{ticket.subject}</h3>
                      <p className="mt-1 text-xs text-ink-muted">{ticket.customerEmail}</p>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Knowledge Base Section */}
            {articles.error && (
              <div className="rounded border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
                Failed to load articles: {articles.error}
              </div>
            )}
            {articles.data && articles.data.items.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4 border-b border-border pb-2">
                  <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-brand" /> Knowledge Base
                  </h2>
                  {articles.data.meta.total > articles.data.items.length && (
                    <Link href={`/knowledge-base?search=${encodeURIComponent(query)}`} className="text-sm text-brand hover:underline">
                      View all {articles.data.meta.total} articles
                    </Link>
                  )}
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {articles.data.items.map((article: KnowledgeArticleSummary) => (
                    <Link key={article._id} href={`/knowledge-base/${article.slug}`} className="group block rounded-xl border border-border bg-surface-card p-5 hover:border-brand/50 hover:shadow-md transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <span className="inline-flex items-center rounded bg-brand/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand">
                          {article.category}
                        </span>
                        <ChevronRight className="h-4 w-4 text-ink-muted opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all shrink-0" />
                      </div>
                      <h3 className="font-semibold text-foreground truncate">{article.title}</h3>
                      <p className="mt-1 text-xs text-ink-muted">Updated {new Date(article.updatedAt).toLocaleDateString()}</p>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Integrations Section */}
            {integrations.error && (
              <div className="rounded border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
                Failed to load integrations: {integrations.error}
              </div>
            )}
            {integrations.data && integrations.data.data.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4 border-b border-border pb-2">
                  <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Puzzle className="h-5 w-5 text-brand" /> Integrations
                  </h2>
                  {integrations.data.meta.total > integrations.data.data.length && (
                    <Link href={`/integrations?q=${encodeURIComponent(query)}`} className="text-sm text-brand hover:underline">
                      View all {integrations.data.meta.total} linked accounts
                    </Link>
                  )}
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {integrations.data.data.map((user) => (
                    <div key={user.userId} className="flex flex-col overflow-hidden rounded-xl bg-surface-card border border-border shadow-sm">
                      <div className="border-b bg-surface-sunken px-4 py-3 flex items-center justify-between">
                        <div className="truncate pr-2">
                          <h3 className="text-sm font-semibold text-foreground truncate">{user.name}</h3>
                        </div>
                        <Link
                          href={`/users/${user.userId}`}
                          className="rounded text-[10px] font-semibold text-brand hover:underline whitespace-nowrap"
                        >
                          User Profile
                        </Link>
                      </div>
                      <div className="p-4 flex flex-col gap-3">
                        {user.integrations.map((integration, idx) => (
                          <div key={idx} className="flex flex-col gap-1.5 p-3 rounded-md bg-surface border border-border text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-bold uppercase tracking-wider text-foreground">
                                {integration.provider}
                              </span>
                              {integration.status === 'Configured' ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-success">
                                  <ShieldCheck className="h-3 w-3" /> Configured
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                                  <ShieldAlert className="h-3 w-3" /> Unknown
                                </span>
                              )}
                            </div>
                            <div className="font-mono text-ink-muted break-all">ID: {integration.externalId}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
