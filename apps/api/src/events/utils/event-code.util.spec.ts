// apps/api/src/events/utils/event-code.util.spec.ts
import {
  EVENT_CODE_CHARSET,
  EVENT_CODE_LENGTH,
  generateEventCode,
  isValidEventCode,
} from './event-code.util';

describe('generateEventCode', () => {
  it('produces a code of the configured length', () => {
    expect(generateEventCode()).toHaveLength(EVENT_CODE_LENGTH);
  });

  it('only uses characters from the safe charset', () => {
    for (let i = 0; i < 1000; i++) {
      const code = generateEventCode();
      for (const char of code) {
        expect(EVENT_CODE_CHARSET).toContain(char);
      }
    }
  });

  it('never emits the ambiguous characters 0, O, 1, or I', () => {
    const ambiguous = ['0', 'O', '1', 'I'];
    for (let i = 0; i < 1000; i++) {
      const code = generateEventCode();
      for (const bad of ambiguous) {
        expect(code).not.toContain(bad);
      }
    }
  });

  it('generates a high proportion of unique codes (low collision rate)', () => {
    const seen = new Set<string>();
    const iterations = 5000;
    for (let i = 0; i < iterations; i++) {
      seen.add(generateEventCode());
    }
    // With a 32^6 (~1.07e9) space, 5000 draws should collide rarely.
    // Allow a tiny margin so the test is not flaky.
    expect(seen.size).toBeGreaterThan(iterations - 5);
  });
});

describe('isValidEventCode', () => {
  it('accepts freshly generated codes', () => {
    for (let i = 0; i < 100; i++) {
      expect(isValidEventCode(generateEventCode())).toBe(true);
    }
  });

  it('rejects codes of the wrong length', () => {
    expect(isValidEventCode('ABC')).toBe(false);
    expect(isValidEventCode('ABCDEFG')).toBe(false);
    expect(isValidEventCode('')).toBe(false);
  });

  it('rejects codes containing characters outside the charset', () => {
    // Correct length but contains ambiguous / lowercase chars.
    expect(isValidEventCode('ABCDE0')).toBe(false);
    expect(isValidEventCode('ABCDEI')).toBe(false);
    expect(isValidEventCode('abcdef')).toBe(false);
  });
});
