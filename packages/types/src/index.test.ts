import { describe, expect, it } from 'vitest';
import {
  ClientEvents,
  ServerEvents,
  createEventSchema,
  eventCode,
  joinEventSchema,
  rooms,
  userSchema,
} from './index.js';

describe('@iep/types', () => {
  it('validates a well-formed event code', () => {
    expect(eventCode.safeParse('ABC234').success).toBe(true);
    expect(eventCode.safeParse('ABC011').success).toBe(false); // contains 0 and 1
    expect(eventCode.safeParse('abc234').success).toBe(false); // lowercase
    expect(eventCode.safeParse('ABC23').success).toBe(false); // too short
  });

  it('parses a valid user with auth0Sub', () => {
    const parsed = userSchema.parse({
      _id: 'a'.repeat(24),
      auth0Sub: 'auth0|abc123',
      name: 'Ada',
      email: 'ada@example.com',
      role: 'host',
      plan: 'free',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    expect(parsed.auth0Sub).toBe('auth0|abc123');
  });

  it('rejects an invalid create-event body', () => {
    expect(createEventSchema.safeParse({ name: '' }).success).toBe(false);
    expect(createEventSchema.safeParse({ name: 'Town Hall' }).success).toBe(true);
  });

  it('requires a uuid anonId on join', () => {
    expect(
      joinEventSchema.safeParse({ eventCode: 'ABC234', anonId: 'not-a-uuid' }).success,
    ).toBe(false);
  });

  it('builds namespaced rooms and exposes event-name constants', () => {
    expect(rooms.event('e1')).toBe('event:e1');
    expect(rooms.host('e1')).toBe('host:e1');
    expect(ClientEvents.EVENT_JOIN).toBe('event:join');
    expect(ServerEvents.POLL_RESULTS).toBe('poll:results');
  });
});
