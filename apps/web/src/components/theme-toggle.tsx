'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme, type Theme } from '@/lib/theme';

const themeOrder: Theme[] = ['light', 'dark', 'system'];
const themeLabels: Record<Theme, string> = {
  light: 'Light',
  dark: 'Dark',
  system: 'System',
};

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const currentIndex = Math.max(themeOrder.indexOf(theme), 0);
  const nextTheme =
    themeOrder[(currentIndex + 1) % themeOrder.length] ?? 'system';
  const Icon =
    theme === 'system' ? Monitor : resolvedTheme === 'dark' ? Moon : Sun;

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-9 px-2.5"
      aria-label={`Theme: ${themeLabels[theme]}. Switch to ${themeLabels[nextTheme]}.`}
      title={`Theme: ${themeLabels[theme]}`}
      onClick={() => setTheme(nextTheme)}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      <span className="hidden sm:inline">{themeLabels[theme]}</span>
    </Button>
  );
}
