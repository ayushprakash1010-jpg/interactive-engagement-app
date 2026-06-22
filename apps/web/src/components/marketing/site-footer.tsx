import Link from 'next/link';
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
      <div className="mx-auto max-w-container-xl px-6 py-12">
        <div className="grid gap-8 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="space-y-3">
            <Link href="/" aria-label="Pulse home" className="inline-flex">
              <Wordmark width={116} />
            </Link>
            <p className="max-w-xs text-sm text-ink-muted">
              Pulse turns any audience into a conversation — live polls, Q&amp;A, quizzes, word
              clouds, and feedback for meetings, webinars, and classrooms.
            </p>
          </div>

          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="mb-3 font-sans text-sm font-semibold text-foreground">{col.title}</h3>
              <ul className="space-y-2">
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

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 text-sm text-ink-muted sm:flex-row">
          <p>&copy; {new Date().getFullYear()} Pulse. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-foreground">
              Log in
            </Link>
            <a
              href="/api/auth/signup?returnTo=/dashboard"
              className="hover:text-foreground"
            >
              Start here
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
