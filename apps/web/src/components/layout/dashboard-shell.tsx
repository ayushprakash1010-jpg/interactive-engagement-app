'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  ChevronRight,
  HelpCircle,
  LayoutDashboard,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Sparkles,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchBar } from '@/components/ui/search-bar';
import { Wordmark } from '@/components/pulse';
import { cn } from '@/lib/utils';

export type DashboardBreadcrumb = {
  label: React.ReactNode;
  href?: string;
};

export type DashboardNavItem = {
  label: string;
  href?: string;
  icon?: React.ElementType;
  exact?: boolean;
  disabled?: boolean;
  badge?: React.ReactNode;
  children?: DashboardNavItem[];
};

export interface DashboardShellProps {
  children: React.ReactNode;
  breadcrumbs?: DashboardBreadcrumb[];
  navItems?: DashboardNavItem[];
  analyticsHref?: string;
  settingsHref?: string;
  helpHref?: string;
  topNav?: React.ReactNode;
  topActions?: React.ReactNode;
  sidebarFooter?: React.ReactNode;
  search?: {
    value?: string;
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
    placeholder?: string;
  };
  containerClassName?: string;
  className?: string;
}

const baseNavItems = ({
  analyticsHref,
  settingsHref = '/dashboard/settings',
  helpHref = '/help',
}: Pick<
  DashboardShellProps,
  'analyticsHref' | 'settingsHref' | 'helpHref'
>): DashboardNavItem[] => [
  {
    label: 'Dashboard / Events',
    href: '/dashboard',
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: 'AI Studio',
    href: '/dashboard/ai',
    icon: Sparkles,
  },
  {
    label: 'Analytics',
    href: analyticsHref,
    icon: BarChart3,
    disabled: !analyticsHref,
  },
  {
    label: 'Settings',
    href: settingsHref,
    icon: Settings,
  },
  {
    label: 'Help',
    href: helpHref,
    icon: HelpCircle,
  },
];

function isActivePath(pathname: string, item: DashboardNavItem) {
  if (!item.href || item.disabled) return false;
  return item.exact
    ? pathname === item.href
    : pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function DashboardNavLink({
  item,
  collapsed,
  onNavigate,
  depth = 0,
}: {
  item: DashboardNavItem;
  collapsed?: boolean;
  onNavigate?: () => void;
  depth?: number;
}) {
  const pathname = usePathname();
  const active = isActivePath(pathname, item);
  
  // If a child is active, keep the accordion open by default
  const isChildActive = item.children?.some(child => isActivePath(pathname, child));
  const [isOpen, setIsOpen] = React.useState(isChildActive || false);

  const Icon = item.icon;

  const className = cn(
    'group flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors',
    depth > 0 && 'ml-4', // Indent child items
    active
      ? 'bg-brand-subtle text-brand-subtle-text'
      : 'text-ink-secondary hover:bg-surface-sunken hover:text-foreground',
    item.disabled &&
      'cursor-not-allowed opacity-45 hover:bg-transparent hover:text-ink-secondary',
    collapsed && 'justify-center px-0',
  );

  const content = (
    <>
      {Icon && (
        <Icon
          className={cn(
            'h-4 w-4 shrink-0',
            item.label === 'AI Studio' && !active && 'text-ai',
          )}
        />
      )}
      {!collapsed && (
        <>
          <span className="min-w-0 flex-1 truncate text-left">{item.label}</span>
          {item.badge}
          {item.children && item.children.length > 0 && (
            <ChevronRight
              className={cn(
                "h-4 w-4 shrink-0 transition-transform duration-200",
                isOpen && "rotate-90"
              )}
            />
          )}
        </>
      )}
    </>
  );

  // If item has children and NO href, render it as an accordion toggle
  if (item.children && item.children.length > 0 && !item.href) {
    return (
      <div className="flex flex-col gap-1">
        <button
          type="button"
          className={className}
          onClick={() => setIsOpen(!isOpen)}
          title={collapsed ? item.label : undefined}
          aria-expanded={isOpen}
        >
          {content}
        </button>
        {isOpen && !collapsed && (
          <div className="flex flex-col gap-1">
            {item.children.map((child) => (
              <DashboardNavLink
                key={`${child.label}-${child.href ?? 'disabled'}`}
                item={child}
                collapsed={collapsed}
                onNavigate={onNavigate}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  const linkContent = item.href && !item.disabled ? (
    <Link
      href={item.href}
      className={className}
      aria-current={active ? 'page' : undefined}
      title={collapsed ? item.label : undefined}
      onClick={onNavigate}
    >
      {content}
    </Link>
  ) : (
    <span className={className} aria-disabled={item.disabled ? 'true' : undefined} title={item.label}>
      {content}
    </span>
  );

  if (!item.children?.length) {
    return linkContent;
  }

  return (
    <div className="flex flex-col gap-1">
      {linkContent}
      {!collapsed && item.children.map((child) => (
        <DashboardNavLink
          key={`${child.label}-${child.href ?? 'disabled'}`}
          item={child}
          collapsed={collapsed}
          onNavigate={onNavigate}
          depth={depth + 1}
        />
      ))}
    </div>
  );
}

function DashboardSidebar({
  navItems,
  collapsed,
  onToggleCollapsed,
  footer,
  mobile,
  onNavigate,
}: {
  navItems: DashboardNavItem[];
  collapsed: boolean;
  onToggleCollapsed?: () => void;
  footer?: React.ReactNode;
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r border-border bg-surface-card',
        collapsed && !mobile ? 'w-20' : 'w-72',
      )}
    >
      <div className="flex h-16 items-center justify-between gap-2 border-b border-border px-4">
        <Link href="/dashboard" aria-label="Pulse dashboard" onClick={onNavigate}>
          {collapsed && !mobile ? <Wordmark width={34} /> : <Wordmark width={112} />}
        </Link>
        {mobile ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Close navigation"
            onClick={onNavigate}
          >
            <X className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            onClick={onToggleCollapsed}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map((item) => (
          <DashboardNavLink
            key={`${item.label}-${item.href ?? 'disabled'}`}
            item={item}
            collapsed={collapsed && !mobile}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      {footer && (
        <div
          className={cn(
            'border-t border-border p-4',
            collapsed && !mobile && 'px-3',
          )}
        >
          {footer}
        </div>
      )}
    </aside>
  );
}

function DashboardBreadcrumbs({
  breadcrumbs,
}: {
  breadcrumbs?: DashboardBreadcrumb[];
}) {
  if (!breadcrumbs || breadcrumbs.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="min-w-0">
      <ol className="flex min-w-0 flex-wrap items-center gap-1 text-sm text-ink-muted">
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;
          return (
            <li key={index} className="flex min-w-0 items-center gap-1">
              {index > 0 && (
                <ChevronRight aria-hidden="true" className="h-4 w-4 shrink-0" />
              )}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="truncate transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn(
                    'truncate',
                    isLast && 'font-medium text-foreground',
                  )}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function DashboardShell({
  children,
  breadcrumbs,
  navItems,
  analyticsHref,
  settingsHref,
  helpHref,
  topNav,
  topActions,
  sidebarFooter,
  search,
  containerClassName,
  className,
}: DashboardShellProps) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const resolvedNavItems = React.useMemo(
    () =>
      navItems ??
      baseNavItems({
        analyticsHref,
        settingsHref,
        helpHref,
      }),
    [analyticsHref, helpHref, navItems, settingsHref],
  );

  return (
    <div className={cn('min-h-screen bg-surface-canvas', className)}>
      <div className="hidden md:block">
        <div className="fixed inset-y-0 left-0 z-30">
          <DashboardSidebar
            navItems={resolvedNavItems}
            collapsed={collapsed}
            onToggleCollapsed={() => setCollapsed((value) => !value)}
            footer={sidebarFooter}
          />
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 bg-black/30"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative h-full w-72">
            <DashboardSidebar
              navItems={resolvedNavItems}
              collapsed={false}
              mobile
              footer={sidebarFooter}
              onNavigate={() => setMobileOpen(false)}
            />
          </div>
        </div>
      )}

      <div
        className={cn(
          'min-h-screen transition-[padding] duration-base ease-standard',
          collapsed ? 'md:pl-20' : 'md:pl-72',
        )}
      >
        <header className="sticky top-0 z-20 border-b border-border bg-surface-card/90 backdrop-blur">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Open navigation"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </Button>

            <div className="min-w-0 flex-1">
              {topNav ?? <DashboardBreadcrumbs breadcrumbs={breadcrumbs} />}
            </div>

            {search && (
              <SearchBar
                value={search.value}
                onChange={search.onChange}
                placeholder={search.placeholder ?? 'Search'}
                wrapperClassName="hidden w-64 lg:block"
              />
            )}

            {topActions && (
              <div className="flex shrink-0 items-center gap-2">{topActions}</div>
            )}
          </div>
        </header>

        <main
          className={cn(
            'mx-auto w-full max-w-6xl px-4 py-8 sm:px-6',
            containerClassName,
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
