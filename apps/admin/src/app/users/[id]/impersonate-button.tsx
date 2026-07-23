'use client';

import * as React from 'react';
import { ShieldAlert, Loader2 } from 'lucide-react';
import { adminFetch } from '@/lib/admin-api';

interface ImpersonateButtonProps {
  userId: string;
  userName: string;
}

export function ImpersonateButton({ userId, userName }: ImpersonateButtonProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [reason, setReason] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleImpersonate = async () => {
    if (!reason.trim()) {
      setError('A reason is required to impersonate a user.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await adminFetch<{ handoffCode: string }>(`admin/impersonate/${userId}`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });

      // Redirect to the Host application with the single-use handoff code
      window.location.href = `http://localhost:3000/dashboard?handoffCode=${response.handoffCode}`;
    } catch (err: any) {
      setError(err.message || 'Failed to start impersonation');
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/20 transition-colors"
      >
        <ShieldAlert className="h-3.5 w-3.5" />
        Troubleshoot as {userName}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-background p-6 shadow-2xl ring-1 ring-border">
            <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
              <ShieldAlert className="h-5 w-5 text-destructive" />
              Start Impersonation Session
            </h2>
            <p className="mt-2 text-sm text-ink-secondary">
              You are about to troubleshoot as <strong>{userName}</strong>. This is a highly sensitive action and will be permanently recorded in the Audit Log.
            </p>
            <p className="mt-2 text-sm text-ink-secondary">
              Destructive actions are prevented during impersonation.
            </p>

            <div className="mt-4">
              <label htmlFor="reason" className="block text-sm font-medium text-foreground">
                Reason for Impersonation <span className="text-destructive">*</span>
              </label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Ticket #1234 - Investigating missing event data"
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                rows={3}
              />
              {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
                className="rounded-md px-4 py-2 text-sm font-medium text-ink hover:bg-surface-sunken"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleImpersonate}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Starting...
                  </>
                ) : (
                  'Start Session'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
