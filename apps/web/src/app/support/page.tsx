import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Support - Pulse',
  description: 'Get help and support for Pulse Interactive Engagement Platform',
};

export default function SupportPage() {
  return (
    <main className="max-w-3xl mx-auto py-16 px-6 sm:px-12 prose dark:prose-invert">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Support & Help Center</h1>
      
      <p className="text-muted-foreground mb-8 text-lg">
        We&apos;re here to help! If you&apos;re experiencing issues with Pulse or need assistance setting up your events, please reach out to us.
      </p>

      <div className="bg-surface-card rounded-2xl border border-border p-8 mb-8 shadow-sm">
        <h2 className="text-xl font-semibold mb-4 mt-0">Contact Support</h2>
        <p className="mb-4">
          The fastest way to get help is to send an email directly to our support team. You can also reach us through this email to create a support case.
        </p>
        
        <div className="mb-6 bg-surface p-4 rounded-xl border border-border">
          <ul className="list-none pl-0 m-0 space-y-2 text-sm text-muted-foreground">
            <li><strong>Support Hours:</strong> Monday - Friday, 9:00 AM - 5:00 PM (EST)</li>
            <li><strong>First Response SLA:</strong> We guarantee a response to all inquiries within 24 business hours.</li>
            <li><strong>Live Support:</strong> Currently unavailable. Please use email for all inquiries.</li>
          </ul>
        </div>

        <a 
          href="mailto:questliv.support@gmail.com" 
          className="inline-flex items-center justify-center rounded-xl bg-[#00796B] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#00695C] no-underline"
        >
          Email questliv.support@gmail.com
        </a>
      </div>

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
