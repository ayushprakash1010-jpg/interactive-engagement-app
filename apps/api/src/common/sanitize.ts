/**
 * Lightweight text sanitization for user-supplied content (Sprint 7 security).
 *
 * Participant input (question text, open poll/feedback answers, display names,
 * word-cloud words) is stored and later echoed back to other clients over
 * Socket.IO and rendered in the web app. React escapes by default, but we
 * defend in depth at the storage boundary so a raw API/DB consumer or an
 * export (CSV/PDF) never receives active markup or control characters.
 *
 * This intentionally does NOT try to be a full HTML sanitizer — we store plain
 * text, so the safest transform is to neutralize angle brackets, strip control
 * characters, collapse whitespace, and bound length.
 */

const DEFAULT_MAX_LENGTH = 2000;

// Strip control chars (except tab/newline/carriage-return) and the Unicode
// line/paragraph separators (U+2028 / U+2029) that corrupt CSV/PDF exports.
// Built via RegExp() from an ASCII-only pattern so the source file contains no
// literal control characters. Matching control chars is the intent here.
// prettier-ignore
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = new RegExp('[\\u0000-\\u0008\\u000B\\u000C\\u000E-\\u001F\\u007F\\u2028\\u2029]', 'g');

// Fullwidth replacements for angle brackets (U+FF1C / U+FF1E).
const FULLWIDTH_LT = String.fromCharCode(0xff1c);
const FULLWIDTH_GT = String.fromCharCode(0xff1e);

/**
 * Sanitize a single line of user text. Returns a trimmed, control-char-free
 * string with angle brackets neutralized and length capped. Non-strings and
 * nullish values become an empty string.
 */
export function sanitizeText(
  input: unknown,
  maxLength: number = DEFAULT_MAX_LENGTH,
): string {
  if (typeof input !== 'string') {
    return '';
  }

  const cleaned = input
    .replace(CONTROL_CHARS, '')
    // Neutralize markup so stored text can never be interpreted as HTML.
    .replace(/</g, FULLWIDTH_LT)
    .replace(/>/g, FULLWIDTH_GT)
    .replace(/[ \t]{2,}/g, ' ')
    .trim();

  return cleaned.length > maxLength
    ? cleaned.slice(0, maxLength).trim()
    : cleaned;
}

/**
 * Sanitize an optional field: preserves "absent" (returns undefined for nullish
 * / empty-after-sanitize) so callers can distinguish "not provided" from "".
 */
export function sanitizeOptionalText(
  input: unknown,
  maxLength: number = DEFAULT_MAX_LENGTH,
): string | undefined {
  if (input == null) {
    return undefined;
  }
  const cleaned = sanitizeText(input, maxLength);
  return cleaned.length > 0 ? cleaned : undefined;
}

/**
 * Sanitize an array of short word-cloud entries, dropping blanks. Caps the
 * number of words and the length of each word.
 */
export function sanitizeWords(
  input: unknown,
  maxWords = 50,
  maxWordLength = 80,
): string[] {
  if (!Array.isArray(input)) {
    return [];
  }

  const words: string[] = [];
  for (const raw of input) {
    const word = sanitizeText(raw, maxWordLength);
    if (word) {
      words.push(word);
    }
    if (words.length >= maxWords) {
      break;
    }
  }
  return words;
}
