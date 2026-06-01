import Link from 'next/link';
import { Radio } from 'lucide-react';

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
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Radio className="h-4 w-4" />
              </span>
              <span className="tracking-tight">IEP</span>
            </Link>
            <p className="max-w-xs text-sm text-muted-foreground">
              Real-time polls, Q&amp;A, quizzes, word clouds, and feedback for
              meetings, webinars, and classrooms.
            </p>
          </div>

          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="mb-3 text-sm font-semibold">{col.title}</h3>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t pt-6 text-sm text-muted-foreground sm:flex-row">
          <p>
            &copy; {new Date().getFullYear()} Interactive Engagement Platform.
            All rights reserved.
          </p>
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
