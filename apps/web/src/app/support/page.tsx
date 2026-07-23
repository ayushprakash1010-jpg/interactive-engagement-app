'use client';

import * as React from 'react';
import Link from 'next/link';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { API_URL } from '@/lib/api';

export default function SupportPage() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const payload = {
      customerName: formData.get('name'),
      customerEmail: formData.get('email'),
      subject: formData.get('subject'),
      description: formData.get('description'),
    };

    try {
      // Hit the public NestJS endpoint directly (no proxy/auth required)
      const res = await fetch(`${API_URL}/support`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let msg = 'Failed to submit ticket.';
        try {
          const body = await res.json();
          if (body.message) msg = Array.isArray(body.message) ? body.message[0] : body.message;
        } catch {}
        throw new Error(msg);
      }

      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="max-w-3xl mx-auto py-16 px-6 sm:px-12 prose dark:prose-invert">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Support & Help Center</h1>
      
      <p className="text-muted-foreground mb-8 text-lg">
        We&apos;re here to help! If you&apos;re experiencing issues with Pulse or need assistance setting up your events, please reach out to us.
      </p>

      {isSuccess ? (
        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 rounded-2xl p-8 mb-8 flex flex-col items-center text-center">
          <CheckCircle2 className="h-12 w-12 text-emerald-500 mb-4" />
          <h2 className="text-xl font-semibold m-0 text-emerald-900 dark:text-emerald-100">Ticket Submitted Successfully</h2>
          <p className="mt-2 text-emerald-800 dark:text-emerald-200">
            Our support team has received your request and will get back to you within 24 business hours.
          </p>
          <button 
            onClick={() => setIsSuccess(false)}
            className="mt-6 text-sm font-medium text-emerald-700 dark:text-emerald-400 hover:underline"
          >
            Submit another ticket
          </button>
        </div>
      ) : (
        <div className="bg-surface-card rounded-2xl border border-border p-8 mb-8 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 mt-0">Contact Support</h2>
          
          <div className="mb-6 bg-surface p-4 rounded-xl border border-border">
            <ul className="list-none pl-0 m-0 space-y-2 text-sm text-muted-foreground">
              <li><strong>Support Hours:</strong> Monday - Friday, 9:00 AM - 5:00 PM (EST)</li>
              <li><strong>First Response SLA:</strong> We guarantee a response to all inquiries within 24 business hours.</li>
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 not-prose">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="name" className="text-sm font-medium text-foreground">Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="w-full rounded-lg border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 transition-shadow"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-medium text-foreground">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full rounded-lg border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 transition-shadow"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="subject" className="text-sm font-medium text-foreground">Subject</label>
              <input
                id="subject"
                name="subject"
                type="text"
                required
                className="w-full rounded-lg border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 transition-shadow"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="description" className="text-sm font-medium text-foreground">How can we help?</label>
              <textarea
                id="description"
                name="description"
                required
                rows={5}
                className="w-full rounded-lg border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 transition-shadow resize-y"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#00796B] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#00695C] disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit Support Ticket'}
            </button>
          </form>
        </div>
      )}

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div>
            <h3 className="font-medium text-foreground mb-2">How do I host an event?</h3>
            <p className="text-muted-foreground">
              Go to the <Link href="/" className="text-[#00796B] hover:underline">Pulse Dashboard</Link> and click &quot;Create Event&quot;. You can then share your event code with participants, or use our add-ons for PowerPoint, Google Meet, Zoom, or Microsoft Teams.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-foreground mb-2">Do my participants need an account?</h3>
            <p className="text-muted-foreground">
              No! Participants can join your event completely anonymously just by entering your event code on the join screen.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-foreground mb-2">My Google Meet/Teams integration isn&apos;t working</h3>
            <p className="text-muted-foreground">
              Please ensure you have granted the necessary permissions when installing the add-on. If the issue persists, try clearing your browser cache or opening the add-on in an incognito window.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
