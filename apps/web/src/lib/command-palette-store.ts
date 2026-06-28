'use client';

import * as React from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type RecentCommand = {
  id: string;
  title: string;
  group: string;
  timestamp: number;
};

type PaletteState = {
  open: boolean;
  recentCommands: RecentCommand[];
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const RECENT_KEY = 'iep:command-palette:recent:v1';
const MAX_RECENT = 10;
const EMPTY_STATE: PaletteState = { open: false, recentCommands: [] };

// ---------------------------------------------------------------------------
// Module-level store (same pattern as notification-store.ts)
// ---------------------------------------------------------------------------

const listeners = new Set<() => void>();
let state: PaletteState = { open: false, recentCommands: [] };
let hydrated = false;

function emitChange() {
  listeners.forEach((listener) => listener());
}

function isRecentCommand(value: unknown): value is RecentCommand {
  if (typeof value !== 'object' || value === null) return false;
  const item = value as Partial<RecentCommand>;
  return (
    typeof item.id === 'string' &&
    typeof item.title === 'string' &&
    typeof item.group === 'string' &&
    typeof item.timestamp === 'number'
  );
}

function hydrate() {
  if (hydrated || typeof window === 'undefined') return;
  hydrated = true;

  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    if (!raw) return;

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return;

    state = {
      ...state,
      recentCommands: parsed
        .filter(isRecentCommand)
        .slice(0, MAX_RECENT),
    };
  } catch {
    // Persistence is best-effort
  }
}

function persistRecent(recentCommands: RecentCommand[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(recentCommands));
  } catch {
    // Best-effort
  }
}

function setState(next: PaletteState) {
  state = next;
  emitChange();
}

function getSnapshot() {
  hydrate();
  return state;
}

function getServerSnapshot() {
  return EMPTY_STATE;
}

function subscribe(listener: () => void) {
  hydrate();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function openCommandPalette() {
  hydrate();
  setState({ ...state, open: true });
}

export function closeCommandPalette() {
  setState({ ...state, open: false });
}

export function setCommandPaletteOpen(open: boolean) {
  if (open) {
    openCommandPalette();
  } else {
    closeCommandPalette();
  }
}

export function recordRecentCommand(command: Omit<RecentCommand, 'timestamp'>) {
  hydrate();

  const next: RecentCommand = { ...command, timestamp: Date.now() };
  const filtered = state.recentCommands.filter((c) => c.id !== command.id);
  const recentCommands = [next, ...filtered].slice(0, MAX_RECENT);

  persistRecent(recentCommands);
  setState({ ...state, recentCommands });
}

// ---------------------------------------------------------------------------
// React hook
// ---------------------------------------------------------------------------

export function useCommandPalette() {
  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
