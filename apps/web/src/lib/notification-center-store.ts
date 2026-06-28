'use client';

import * as React from 'react';

// ---------------------------------------------------------------------------
// Tiny signal store so the command palette can open the NotificationCenter
// without tight coupling. NotificationCenter subscribes; palette dispatches.
// ---------------------------------------------------------------------------

type SignalState = { openSignal: number };

const EMPTY: SignalState = { openSignal: 0 };

const listeners = new Set<() => void>();
let state: SignalState = { openSignal: 0 };

function emitChange() {
  listeners.forEach((listener) => listener());
}

function getSnapshot() {
  return state;
}

function getServerSnapshot() {
  return EMPTY;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// Increment the signal counter — NotificationCenter will react to the change.
export function requestOpenNotificationCenter() {
  state = { openSignal: state.openSignal + 1 };
  emitChange();
}

export function useNotificationCenterSignal() {
  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
