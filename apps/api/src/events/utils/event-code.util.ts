// apps/api/src/events/utils/event-code.util.ts

/**
 * Unambiguous alphanumeric charset — excludes 0/O/1/I to prevent
 * misreads when codes are displayed or typed manually.
 */
export const EVENT_CODE_CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const EVENT_CODE_LENGTH = 6;

/**
 * Generates a single random 6-character event code from the safe charset.
 * Cryptographically random via crypto.getRandomValues() in Node 19+ / Web,
 * falling back to Math.random() for older Node runtimes.
 */
export function generateEventCode(): string {
  const chars = EVENT_CODE_CHARSET;
  let code = '';

  for (let i = 0; i < EVENT_CODE_LENGTH; i++) {
    // Use crypto if available (Node ≥ 15), otherwise fall back
    if (
      typeof globalThis.crypto !== 'undefined' &&
      typeof globalThis.crypto.getRandomValues === 'function'
    ) {
      const buf = new Uint32Array(1);
      globalThis.crypto.getRandomValues(buf);
      code += chars[buf[0] % chars.length];
    } else {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
  }

  return code;
}

/**
 * Validates that a string is a well-formed event code.
 * Useful in tests and incoming payload guards.
 */
export function isValidEventCode(code: string): boolean {
  if (code.length !== EVENT_CODE_LENGTH) return false;
  return code.split('').every((c) => EVENT_CODE_CHARSET.includes(c));
}