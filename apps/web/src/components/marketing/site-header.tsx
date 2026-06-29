'use client';

import * as React from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { Wordmark } from '@/components/pulse';
import { useAuth } from '@/lib/use-auth';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#pricing', label: 'Pricing' },
];

const SIGNUP_HREF = '/api/auth/signup?returnTo=/dashboard';

export function SiteHeader() {
  const { isAuthenticated, isLoading } = useAuth();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll, { passive: true });
    // Run once on mount in case page is already scrolled
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full backdrop-blur-xl supports-[backdrop-filter]:bg-surface-canvas/70',
        'transition-[border-color,background-color,box-shadow] duration-[220ms] ease-[cubic-bezier(0.2,0,0,1)]',
        scrolled
          ? 'border-b border-border bg-surface-canvas/92 shadow-sm'
          : 'border-b border-transparent bg-surface-canvas/80',
      )}
    >
      <div className="mx-auto flex h-16 max-w-container-xl items-center justify-between px-6">
        <Link href="/" aria-label="Pulse home" className="flex items-center">
          <Wordmark width={116} />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-sm px-1 py-2 text-sm font-medium text-ink-muted transition-colors duration-[180ms] ease-[cubic-bezier(0.2,0,0,1)] hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          {!isLoading && isAuthenticated ? (
            <Button asChild>
              <Link href="/dashboard">Go to dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild>
                <a href={SIGNUP_HREF}>Start here</a>
              </Button>
            </>
          )}
        </div>

        <button
          className="inline-flex h-9 w-9 items-center justify-center rounded-sm text-ink-secondary transition-colors hover:bg-muted hover:text-foreground md:hidden"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          'border-t border-border bg-surface-canvas/95 shadow-lg md:hidden',
          'transition-[opacity,transform] duration-[220ms] ease-[cubic-bezier(0.2,0,0,1)]',
          mobileOpen ? 'block opacity-100' : 'hidden opacity-0',
        )}
      >
        <nav className="mx-auto flex max-w-container-xl flex-col gap-1 px-6 py-3">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-sm px-2 py-2 text-sm font-medium text-ink-muted transition-colors hover:bg-muted hover:text-foreground"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-2 flex flex-col gap-2">
            <div className="flex items-center justify-between rounded-md border border-border bg-surface-card px-2 py-2">
              <span className="text-sm font-medium text-ink-muted">Theme</span>
              <ThemeToggle />
            </div>
            {!isLoading && isAuthenticated ? (
              <Button asChild>
                <Link href="/dashboard">Go to dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="outline">
                  <Link href="/login">Log in</Link>
                </Button>
                <Button asChild>
                  <a href={SIGNUP_HREF}>Start here</a>
                </Button>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
