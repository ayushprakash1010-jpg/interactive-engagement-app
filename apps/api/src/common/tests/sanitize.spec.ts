import {
  sanitizeText,
  sanitizeOptionalText,
  sanitizeWords,
} from '../sanitize';

describe('sanitizeText', () => {
  it('trims surrounding whitespace', () => {
    expect(sanitizeText('  hello  ')).toBe('hello');
  });

  it('neutralizes angle brackets so markup cannot be stored', () => {
    const out = sanitizeText('<script>alert(1)</script>');
    expect(out).not.toContain('<');
    expect(out).not.toContain('>');
    expect(out).toContain('script');
  });

  it('strips control characters but keeps newlines and tabs', () => {
    const input = `line1\nline2\tend\x00\x07`;
    const out = sanitizeText(input);
    expect(out).toContain('line1');
    expect(out).toContain('line2');
    expect(out).not.toContain('\x00');
    expect(out).not.toContain('\x07');
  });

  it('strips Unicode line/paragraph separators', () => {
    const input = `a${String.fromCharCode(0x2028)}b${String.fromCharCode(0x2029)}c`;
    expect(sanitizeText(input)).toBe('abc');
  });

  it('caps length at the provided maximum', () => {
    expect(sanitizeText('x'.repeat(50), 10)).toHaveLength(10);
  });

  it('returns empty string for non-string input', () => {
    expect(sanitizeText(null)).toBe('');
    expect(sanitizeText(undefined)).toBe('');
    expect(sanitizeText(42)).toBe('');
  });
});

describe('sanitizeOptionalText', () => {
  it('returns undefined for nullish input', () => {
    expect(sanitizeOptionalText(null)).toBeUndefined();
    expect(sanitizeOptionalText(undefined)).toBeUndefined();
  });

  it('returns undefined when the value sanitizes to empty', () => {
    expect(sanitizeOptionalText('   ')).toBeUndefined();
  });

  it('returns the cleaned value otherwise', () => {
    expect(sanitizeOptionalText('  Ada  ')).toBe('Ada');
  });
});

describe('sanitizeWords', () => {
  it('drops blanks and trims each word', () => {
    expect(sanitizeWords([' fun ', '', '  ', 'great'])).toEqual([
      'fun',
      'great',
    ]);
  });

  it('caps the number of words', () => {
    const many = Array.from({ length: 100 }, (_, i) => `w${i}`);
    expect(sanitizeWords(many, 5)).toHaveLength(5);
  });

  it('returns an empty array for non-array input', () => {
    expect(sanitizeWords('nope')).toEqual([]);
  });
});
