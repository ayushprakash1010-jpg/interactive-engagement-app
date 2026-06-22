import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import { Providers } from '@/lib/providers';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Pulse — turn any audience into a conversation',
    template: '%s · Pulse',
  },
  description:
    'Pulse runs live polls, Q&A, quizzes, word clouds, and feedback. Your audience joins from any phone with a code — no app, no login.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
