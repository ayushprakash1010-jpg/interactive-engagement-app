'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, LifeBuoy, Loader2, Send } from 'lucide-react';
import { fetchSupportTicket, updateSupportTicket, addSupportTicketNote } from '@/lib/admin-api';
import type { SupportTicketDetail } from '@/lib/admin-api';
import { Badge } from '@/components/ui/badge';
import { InvestigateButton } from '@/components/admin/investigate-button';
import { GlobalCopilot } from '@/components/admin/global-copilot';

export default function TicketDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const id = params.id;

  const [ticket, setTicket] = React.useState<SupportTicketDetail | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [noteContent, setNoteContent] = React.useState('');
  const [isSubmittingNote, setIsSubmittingNote] = React.useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = React.useState(false);

  React.useEffect(() => {
    setLoading(true);
    fetchSupportTicket(id)
      .then(setTicket)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      const updated = await updateSupportTicket(id, { status: newStatus });
      setTicket(updated);
    } catch (err: any) {
      alert(`Failed to update status: ${err.message}`);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;
    setIsSubmittingNote(true);
    try {
      const updated = await addSupportTicketNote(id, noteContent);
      setTicket(updated);
      setNoteContent('');
    } catch (err: any) {
      alert(`Failed to add note: ${err.message}`);
    } finally {
      setIsSubmittingNote(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface-canvas">
        <Loader2 className="h-6 w-6 animate-spin text-ink-muted" />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface-canvas text-destructive">
        {error || 'Ticket not found'}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-canvas pb-20">
      <div className="border-b bg-surface-card sticky top-0 z-10 shadow-sm">
        <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/support-inbox"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border text-ink-secondary hover:bg-surface-raised transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="font-semibold text-foreground flex items-center gap-2">
                {ticket.subject}
                <Badge variant={ticket.status === 'OPEN' ? 'destructive' : ticket.status === 'IN_PROGRESS' ? 'live' : 'neutral'}>
                  {ticket.status}
                </Badge>
              </h1>
              <p className="text-xs text-ink-muted">Ticket ID: {ticket._id}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <InvestigateButton resourceType="ticket" resourceId={ticket._id} />
            <select
              disabled={isUpdatingStatus}
              value={ticket.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="rounded-lg border bg-surface-card px-3 py-1.5 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-brand"
            >
              <option value="OPEN">Mark as Open</option>
              <option value="IN_PROGRESS">Mark In Progress</option>
              <option value="RESOLVED">Mark Resolved</option>
              <option value="CLOSED">Mark Closed</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-surface-card border rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 bg-brand/10 text-brand rounded-full flex items-center justify-center font-bold">
                {ticket.customerName ? ticket.customerName.charAt(0).toUpperCase() : ticket.customerEmail.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-medium">{ticket.customerName || 'Anonymous Customer'}</div>
                <div className="text-sm text-ink-muted">{ticket.customerEmail}</div>
              </div>
            </div>
            <div className="prose dark:prose-invert max-w-none text-sm whitespace-pre-wrap">
              {ticket.description}
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider text-ink-muted">Internal Notes</h3>
            <div className="space-y-4">
              {ticket.internalNotes.map((note, idx) => (
                <div key={idx} className="bg-surface-raised border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm text-foreground">{note.authorName}</span>
                    <span className="text-xs text-ink-muted">{new Date(note.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-ink-secondary whitespace-pre-wrap">{note.note}</p>
                </div>
              ))}

              <form onSubmit={handleAddNote} className="bg-surface-card border rounded-lg p-4 shadow-sm relative">
                <textarea
                  required
                  placeholder="Add an internal note..."
                  className="w-full bg-transparent border-0 focus:ring-0 resize-none text-sm min-h-[80px]"
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  disabled={isSubmittingNote}
                />
                <div className="flex justify-end pt-2 border-t border-border/50">
                  <button
                    type="submit"
                    disabled={isSubmittingNote}
                    className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand/90 disabled:opacity-50"
                  >
                    {isSubmittingNote ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Add Note
                  </button>
                </div>
              </form>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="bg-surface-card border rounded-xl p-5 shadow-sm">
            <h3 className="text-xs font-semibold mb-4 uppercase tracking-wider text-ink-muted">Ticket Details</h3>
            <div className="space-y-4 text-sm">
              <div>
                <div className="text-ink-muted mb-1">Created</div>
                <div>{new Date(ticket.createdAt).toLocaleString()}</div>
              </div>
              <div>
                <div className="text-ink-muted mb-1">Priority</div>
                <div>{ticket.priority}</div>
              </div>
              <div>
                <div className="text-ink-muted mb-1">Associated User</div>
                {ticket.userId ? (
                  <Link href={`/users/${ticket.userId}`} className="text-brand hover:underline font-medium flex items-center gap-1">
                    View User Profile
                  </Link>
                ) : (
                  <span className="text-ink-secondary">None</span>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
      {ticket && (
        <GlobalCopilot 
          pageContext={{ 
            type: 'ticket', 
            id: ticket._id
          }} 
        />
      )}
    </div>
  );
}
