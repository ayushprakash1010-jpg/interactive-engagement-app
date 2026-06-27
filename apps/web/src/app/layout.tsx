import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { Toaster } from '@/components/ui/toaster';
import { Providers } from '@/lib/providers';
import type { Theme, ResolvedTheme } from '@/lib/theme';
import { cn } from '@/lib/utils';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Pulse — turn any audience into a conversation',
    template: '%s · Pulse',
  },
  description:
    'Pulse runs live polls, Q&A, quizzes, word clouds, and feedback. Your audience joins from any phone with a code — no app, no login.',
  icons: {
    icon: '/brand/pulse-logomark.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const storedTheme = cookies().get('iep-theme')?.value;
  const initialTheme: Theme =
    storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'system'
      ? storedTheme
      : 'system';
  const initialResolvedTheme: ResolvedTheme =
    initialTheme === 'dark' ? 'dark' : 'light';

  return (
    <html
      lang="en"
      className={cn(initialResolvedTheme === 'dark' && 'dark')}
      data-theme={initialTheme}
      data-resolved-theme={initialResolvedTheme}
    >
      <body className="min-h-screen antialiased">
        <Providers
          initialTheme={initialTheme}
          initialResolvedTheme={initialResolvedTheme}
        >
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
