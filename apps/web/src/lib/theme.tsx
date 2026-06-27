'use client';

import * as React from 'react';

export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'iep-theme';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
const THEME_TRANSITION_CLASS = 'theme-transitioning';
const THEME_TRANSITION_MS = 260;
let themeTransitionTimeout: number | undefined;
const ThemeContext = React.createContext<{
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
} | null>(null);

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function getStoredTheme(fallback: Theme): Theme {
  if (typeof window === 'undefined') return fallback;

  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === 'light' || stored === 'dark' || stored === 'system'
    ? stored
    : fallback;
}

function applyTheme(theme: Theme, systemTheme = getSystemTheme()) {
  const resolvedTheme = theme === 'system' ? systemTheme : theme;
  const root = document.documentElement;

  root.classList.toggle('dark', resolvedTheme === 'dark');
  root.dataset.theme = theme;
  root.dataset.resolvedTheme = resolvedTheme;

  return resolvedTheme;
}

function withThemeTransition(updateTheme: () => ResolvedTheme) {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches;

  if (reduceMotion) {
    root.classList.remove(THEME_TRANSITION_CLASS);
    return updateTheme();
  }

  if (themeTransitionTimeout) {
    window.clearTimeout(themeTransitionTimeout);
  }

  root.classList.add(THEME_TRANSITION_CLASS);
  const resolvedTheme = updateTheme();

  themeTransitionTimeout = window.setTimeout(() => {
    root.classList.remove(THEME_TRANSITION_CLASS);
    themeTransitionTimeout = undefined;
  }, THEME_TRANSITION_MS);

  return resolvedTheme;
}

function persistTheme(theme: Theme) {
  window.localStorage.setItem(STORAGE_KEY, theme);
  document.cookie = `${STORAGE_KEY}=${theme}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

export function ThemeProvider({
  children,
  initialTheme,
  initialResolvedTheme,
}: {
  children: React.ReactNode;
  initialTheme: Theme;
  initialResolvedTheme: ResolvedTheme;
}) {
  const [theme, setThemeState] = React.useState<Theme>(initialTheme);
  const [resolvedTheme, setResolvedTheme] =
    React.useState<ResolvedTheme>(initialResolvedTheme);

  React.useEffect(() => {
    const storedTheme = getStoredTheme(initialTheme);
    persistTheme(storedTheme);
    setThemeState(storedTheme);
    setResolvedTheme(applyTheme(storedTheme));
  }, [initialTheme]);

  React.useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      setResolvedTheme(
        withThemeTransition(() =>
          applyTheme(getStoredTheme(initialTheme), getSystemTheme()),
        ),
      );
    };

    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, [initialTheme]);

  const setTheme = React.useCallback((nextTheme: Theme) => {
    persistTheme(nextTheme);
    setThemeState(nextTheme);
    setResolvedTheme(withThemeTransition(() => applyTheme(nextTheme)));
  }, []);

  const value = React.useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [resolvedTheme, setTheme, theme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const value = React.useContext(ThemeContext);
  if (!value) {
    throw new Error('useTheme must be used within ThemeProvider');
  }

  return value;
}
