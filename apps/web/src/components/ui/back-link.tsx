import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BackLinkProps
  extends Omit<React.ComponentProps<typeof Link>, 'href'> {
  href: string;
}

function BackLink({ href, className, children, ...props }: BackLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center gap-1 text-sm text-ink-muted transition-colors hover:text-foreground',
        className,
      )}
      {...props}
    >
      <ArrowLeft className="h-4 w-4" />
      {children}
    </Link>
  );
}

export { BackLink };
