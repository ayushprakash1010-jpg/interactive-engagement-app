'use client';

import * as React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn('flex', className)}>
      <ol className="flex items-center space-x-2 text-sm text-ink-muted">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          return (
            <li key={item.label} className="flex items-center">
              {isLast ? (
                <span className="font-semibold text-foreground" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href || '#'}
                  className="hover:text-brand transition-colors"
                >
                  {item.label}
                </Link>
              )}
              {!isLast && (
                <ChevronRight className="mx-2 h-4 w-4 shrink-0 opacity-50" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
