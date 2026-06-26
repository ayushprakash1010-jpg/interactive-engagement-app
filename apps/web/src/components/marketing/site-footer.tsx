import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Wordmark } from '@/components/pulse';

const FOOTER_COLUMNS = [
  {
    title: 'Product',
    links: [
      { href: '#features', label: 'Features' },
      { href: '#how-it-works', label: 'How it works' },
      { href: '#pricing', label: 'Pricing' },
    ],
  },
  {
    title: 'Use cases',
    links: [
      { href: '#features', label: 'Webinars' },
      { href: '#features', label: 'Classrooms' },
      { href: '#features', label: 'Corporate events' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '#', label: 'About' },
      { href: '#', label: 'Contact' },
      { href: '#', label: 'Privacy' },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface-raised">
      <div className="mx-auto max-w-container-xl px-6 py-14">
        <div className="grid gap-10 lg:grid-cols-[1.35fr_2fr] lg:items-start">
          <div className="max-w-sm">
            <Link href="/" aria-label="Pulse home" className="inline-flex">
              <Wordmark width={116} />
            </Link>
            <p className="mt-4 text-sm leading-6 text-ink-muted">
              Pulse turns any audience into a conversation - live polls, Q&A, quizzes, word clouds,
              and feedback for meetings, webinars, and classrooms.
            </p>
            <a
              href="/api/auth/signup?returnTo=/dashboard"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand transition-colors hover:text-brand-hover"
            >
              Start here
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {FOOTER_COLUMNS.map((col) => (
              <div key={col.title}>
                <h3 className="font-sans text-sm font-semibold text-foreground">{col.title}</h3>
                <ul className="mt-4 space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-ink-muted transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col justify-between gap-4 border-t border-border pt-6 text-sm text-ink-muted sm:flex-row sm:items-center">
          <p>&copy; {new Date().getFullYear()} Pulse. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/login" className="transition-colors hover:text-foreground">
              Log in
            </Link>
            <a
              href="/api/auth/signup?returnTo=/dashboard"
              className="transition-colors hover:text-foreground"
            >
              Start here
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
