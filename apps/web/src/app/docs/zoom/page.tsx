import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Zoom Integration - Pulse Documentation',
  description: 'Learn how to add, use, and remove the Pulse app for Zoom.',
};

export default function ZoomDocsPage() {
  return (
    <main className="max-w-3xl mx-auto py-16 px-6 sm:px-12 prose dark:prose-invert">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Pulse for Zoom</h1>
      
      <p className="text-muted-foreground mb-8 text-lg">
        The Pulse Zoom App allows you to seamlessly integrate interactive polls, Q&amp;A sessions, and quizzes directly into your Zoom meetings. Below is a complete guide on how to add, use, and remove the app.
      </p>

      <div className="space-y-12">
        {/* Adding the App - Required by Zoom */}
        <section id="adding-the-app">
          <h2 className="text-2xl font-semibold mb-4">Adding the App</h2>
          <p>
            Follow these steps to add Pulse to your Zoom account:
          </p>
          <ol className="list-decimal pl-6 space-y-2 mb-4">
            <li>Log in to your Zoom account and navigate to the Zoom App Marketplace.</li>
            <li>Search for &quot;Pulse&quot; and click the app.</li>
            <li>Click <strong>Add</strong> or <strong>Authorize</strong>.</li>
            <li>Review the requested permissions and click <strong>Authorize</strong> to allow Pulse access to your Zoom client.</li>
            <li>Once authorized, the Pulse app will be available in the Apps section of your Zoom desktop client during meetings.</li>
          </ol>
          <p className="text-sm">
            Having trouble? Check our <Link href="/support" className="text-brand hover:underline">Troubleshooting Guide &amp; Support</Link>.
          </p>
        </section>

        <hr className="border-border" />

        {/* Usage - Required by Zoom */}
        <section id="usage">
          <h2 className="text-2xl font-semibold mb-4">Usage</h2>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Prerequisites</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>A Zoom account</li>
              <li>The Zoom Desktop Client (version 5.7.3 or higher)</li>
              <li>A Pulse account (to host events)</li>
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Feature: Host an Interactive Session</h3>
            <p className="mb-2"><strong>Use Case:</strong> Launch a live poll or Q&amp;A during your meeting to gather audience feedback.</p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Start a Zoom meeting.</li>
              <li>Click the <strong>Apps</strong> icon in the bottom Zoom toolbar.</li>
              <li>Select <strong>Pulse</strong> from your list of apps.</li>
              <li>Log in to your Pulse account and select an existing event or click <strong>Create Event</strong>.</li>
              <li>Click <strong>Share to Meeting</strong> to push the interactive view to all participants.</li>
            </ol>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Feature: Participate in a Session</h3>
            <p className="mb-2"><strong>Use Case:</strong> Join a host&apos;s interactive session to answer a poll or submit a question.</p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>When a host shares a Pulse session, you will see a notification to open the app.</li>
              <li>Click the notification or open the <strong>Apps</strong> tab and select Pulse.</li>
              <li>Enter the host&apos;s 6-digit event code (if not automatically applied).</li>
              <li>Submit your responses directly within the Zoom sidebar!</li>
            </ol>
          </div>
        </section>

        <hr className="border-border" />

        {/* Removing the App - Required by Zoom */}
        <section id="removing-the-app">
          <h2 className="text-2xl font-semibold mb-4">Removing the App</h2>
          <p className="mb-4">
            If you no longer wish to use Pulse within Zoom, you can remove the app. 
            <strong>Implications of de-authorization:</strong> Removing the app will revoke Pulse&apos;s access to your Zoom profile, and you will no longer be able to open Pulse from within the Zoom client. 
          </p>

          <h3 className="text-lg font-medium mb-2">Steps to Remove:</h3>
          <ol className="list-decimal pl-6 space-y-2 mb-4">
            <li>Log in to your Zoom Account and navigate to the Zoom App Marketplace.</li>
            <li>Click <strong>Manage</strong> &gt; <strong>Added Apps</strong> or search for the &quot;Pulse&quot; app.</li>
            <li>Click the &quot;Pulse&quot; app.</li>
            <li>Click <strong>Remove</strong>.</li>
          </ol>

          <h3 className="text-lg font-medium mb-2">Data Deletion Policy</h3>
          <p>
            When you remove the app from Zoom, we immediately revoke the associated access tokens. To request the complete deletion of any event data or analytics tied to your account, please email our support team at <a href="mailto:questliv.support@gmail.com" className="text-brand hover:underline">questliv.support@gmail.com</a>. We will process all data deletion requests within 30 days.
          </p>
        </section>
      </div>

    </main>
  );
}
