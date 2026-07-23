import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { SpeedInsights } from '@vercel/speed-insights/next';
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
  other: {
    'zoom-domain-verification': 'ZOOM_verify_e0a018bf436247f68d1f969090f7291b',
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

  const impToken = cookies().get('iep_impersonation_token')?.value;
  let impersonationUser = null;
  if (impToken) {
    try {
      const parts = impToken.split('.');
      if (parts.length >= 2) {
        const base64Url = parts[1];
        if (base64Url) {
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const payload = JSON.parse(Buffer.from(base64, 'base64').toString());
          impersonationUser = {
            name: payload.name,
            email: payload.email,
            sub: payload.sub,
            isImpersonating: payload.isImpersonating,
          };
        }
      }
    } catch (e) {
      console.error('Failed to parse impersonation token', e);
    }
  }

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
          impersonationUser={impersonationUser}
        >
          {impersonationUser && impersonationUser.isImpersonating && (
            <div className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground shadow-sm">
              <div className="flex items-center gap-2">
                <span aria-hidden="true">⚠️</span>
                <span>
                  You are currently impersonating <strong>{impersonationUser.name}</strong>. Some actions are restricted.
                </span>
              </div>
              <a
                href="/api/auth/stop-impersonation"
                className="rounded bg-destructive-foreground/10 px-2 py-1 text-xs font-semibold hover:bg-destructive-foreground/20"
              >
                Stop Impersonating
              </a>
            </div>
          )}
          <div className={cn(impersonationUser?.isImpersonating ? "mt-10" : "")}>
            {children}
          </div>
          <Toaster />
        </Providers>
        <SpeedInsights />
      </body>
    </html>
  );
}
