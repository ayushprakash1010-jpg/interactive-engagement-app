import { v4 as uuidv4 } from 'uuid';

const ANON_ID_KEY = 'iep-anon-id';
const DISPLAY_NAME_KEY = 'iep-display-name';

/** Persistent anonymous identity for a participant (created once per browser). */
export function getAnonId(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  let anonId = localStorage.getItem(ANON_ID_KEY);

  if (!anonId) {
    anonId = uuidv4();
    localStorage.setItem(ANON_ID_KEY, anonId);
  }

  return anonId;
}

/** Optional display name, remembered across reconnects/visits. */
export function getDisplayName(): string {
  if (typeof window === 'undefined') {
    return '';
  }
  return localStorage.getItem(DISPLAY_NAME_KEY) ?? '';
}

export function setDisplayName(name: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  const trimmed = name.trim();
  if (trimmed) {
    localStorage.setItem(DISPLAY_NAME_KEY, trimmed);
  } else {
    localStorage.removeItem(DISPLAY_NAME_KEY);
  }
}
