// apps/api/src/realtime/realtime.gateway.spec.ts
import { ServerEvents, rooms } from '@iep/types';
import { RealtimeGateway } from './realtime.gateway';

/**
 * Minimal in-memory stand-in for the Redis hash commands the gateway uses,
 * so we can assert the dedup-by-anonId count behaviour without a real Redis.
 */
function createFakeRedis() {
  const hashes = new Map<string, Map<string, number>>();

  const hash = (key: string) => {
    let h = hashes.get(key);
    if (!h) {
      h = new Map();
      hashes.set(key, h);
    }
    return h;
  };

  return {
    client: {
      hincrby: jest.fn(async (key: string, field: string, by: number) => {
        const h = hash(key);
        const next = (h.get(field) ?? 0) + by;
        h.set(field, next);
        return next;
      }),
      hdel: jest.fn(async (key: string, field: string) => {
        hash(key).delete(field);
        return 1;
      }),
      hlen: jest.fn(async (key: string) => hash(key).size),
    },
  };
}

function createClient(id: string) {
  return {
    id,
    join: jest.fn(async () => undefined),
    emit: jest.fn(),
  } as any;
}

describe('RealtimeGateway participant count', () => {
  let gateway: RealtimeGateway;
  let emit: jest.Mock;
  let redis: ReturnType<typeof createFakeRedis>;

  const events = {
    findByEventCode: jest.fn(),
    findById: jest.fn(),
  };

  const participants = {
    upsertParticipant: jest.fn(async () => undefined),
    markDisconnected: jest.fn(async () => undefined),
    findParticipant: jest.fn(async () => null),
  };

  const activityService = {
    findById: jest.fn(),
    closeLiveActivity: jest.fn(),
    setStatus: jest.fn(),
    findLiveActivity: jest.fn(),
  };

  const responseService = {
    saveResponse: jest.fn(),
    computeTally: jest.fn(async () => null),
  };

  const questionsService = {
    findApprovedByEvent: jest.fn(async () => []),
    findByEvent: jest.fn(async () => []),
    create: jest.fn(),
    addVote: jest.fn(),
    updateStatus: jest.fn(),
    reply: jest.fn(),
  };

  const analyticsService = {
    invalidateCache: jest.fn(async () => undefined),
    invalidateCacheIfLive: jest.fn(async () => undefined),
    generateReport: jest.fn(async () => ({})),
    cacheFinalReport: jest.fn(async () => undefined),
  };

  const rateLimitService = {
    consume: jest.fn(async () => ({
      allowed: true,
      remaining: 99,
      retryAfter: 0,
    })),
    consumeForAction: jest.fn(async () => ({
      allowed: true,
      remaining: 99,
      retryAfter: 0,
    })),
  };

  const usageService = {
    recordParticipant: jest.fn(async () => undefined),
    checkParticipantLimit: jest.fn(async () => ({ allowed: true })),
    incrementParticipants: jest.fn(async () => undefined),
  };

  const event = {
    _id: 'evt1',
    eventCode: 'ABC123',
    status: 'live',
    activeActivityId: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    redis = createFakeRedis();

    events.findByEventCode.mockResolvedValue(event);
    responseService.computeTally.mockResolvedValue(null);
    questionsService.findApprovedByEvent.mockResolvedValue([]);
    questionsService.findByEvent.mockResolvedValue([]);
    questionsService.reply.mockResolvedValue(null);
    usageService.checkParticipantLimit.mockResolvedValue({ allowed: true });

    gateway = new RealtimeGateway(
      events as any,
      participants as any,
      redis as any,
      activityService as any,
      responseService as any,
      questionsService as any,
      analyticsService as any,
      rateLimitService as any,
      usageService as any,
      { verify: jest.fn(), sign: jest.fn() } as any,
    );

    emit = jest.fn();
    const to = jest.fn();
    const broadcaster = { to, emit };
    to.mockReturnValue(broadcaster);
    
    const fetchSockets = jest.fn().mockResolvedValue([]);
    const inMock = jest.fn().mockReturnValue({ fetchSockets });
    gateway.server = { to, in: inMock } as any;
  });

  const lastCount = () => {
    const calls = emit.mock.calls.filter(([name]) => name === ServerEvents.PARTICIPANT_COUNT);
    return calls.length ? calls[calls.length - 1][1].count : undefined;
  };

  it('counts two tabs of the same anonId as one participant', async () => {
    await gateway.handleEventJoin({ eventCode: 'ABC123', anonId: 'a' }, createClient('s1'));
    await gateway.handleEventJoin({ eventCode: 'ABC123', anonId: 'a' }, createClient('s2'));

    expect(lastCount()).toBe(1);
  });

  it('counts distinct anonIds separately', async () => {
    await gateway.handleEventJoin({ eventCode: 'ABC123', anonId: 'a' }, createClient('s1'));
    await gateway.handleEventJoin({ eventCode: 'ABC123', anonId: 'b' }, createClient('s2'));

    expect(lastCount()).toBe(2);
  });

  it('keeps a participant counted until their last socket disconnects', async () => {
    const s1 = createClient('s1');
    const s2 = createClient('s2');

    await gateway.handleEventJoin({ eventCode: 'ABC123', anonId: 'a' }, s1);
    await gateway.handleEventJoin({ eventCode: 'ABC123', anonId: 'a' }, s2);

    await gateway.handleDisconnect(s1);
    expect(lastCount()).toBe(1);
    expect(participants.markDisconnected).not.toHaveBeenCalled();

    await gateway.handleDisconnect(s2);
    expect(lastCount()).toBe(0);
    expect(participants.markDisconnected).toHaveBeenCalledWith('evt1', 'a');
  });

  it('rejects an invalid code with a friendly error and does not count it', async () => {
    events.findByEventCode.mockResolvedValueOnce(null);
    const client = createClient('s1');

    await gateway.handleEventJoin({ eventCode: 'NOPE12', anonId: 'a' }, client);

    expect(client.emit).toHaveBeenCalledWith(
      ServerEvents.ERROR,
      expect.objectContaining({ message: expect.any(String) }),
    );
    expect(participants.upsertParticipant).not.toHaveBeenCalled();
    expect(lastCount()).toBeUndefined();
  });

  it('rejects an ended event', async () => {
    events.findByEventCode.mockResolvedValueOnce({ ...event, status: 'ended' });
    const client = createClient('s1');

    await gateway.handleEventJoin({ eventCode: 'ABC123', anonId: 'a' }, client);

    expect(client.emit).toHaveBeenCalledWith(
      ServerEvents.ERROR,
      expect.objectContaining({ message: expect.any(String) }),
    );
  });

  it('observers join the room without being counted', async () => {
    const client = createClient('obs');

    await gateway.handleEventObserve({ eventCode: 'ABC123' }, client);

    expect(client.join).toHaveBeenCalledWith('event:evt1');
    expect(client.join).toHaveBeenCalledWith('host:evt1');
    expect(participants.upsertParticipant).not.toHaveBeenCalled();
    expect(client.emit).toHaveBeenCalledWith(ServerEvents.PARTICIPANT_COUNT, {
      count: 0,
    });
  });

  // ── Sprint 4: Q&A moderation gating ────────────────────────────────────────

  const roomsTargeted = () => (gateway.server.to as jest.Mock).mock.calls.map(([room]) => room);

  it('holds a question for the host only when moderation is ON', async () => {
    events.findByEventCode.mockResolvedValueOnce({
      ...event,
      settings: { requireModeration: true },
    });
    questionsService.create.mockResolvedValueOnce({
      _id: 'q1',
      eventId: 'evt1',
    });

    await gateway.handleQaAsk(
      { eventCode: 'ABC123', anonId: 'a', text: 'Hi?' },
      createClient('s1'),
    );

    // Created as pending and broadcast to the host room — NEVER the event room.
    expect(questionsService.create).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'pending' }),
    );
    expect(roomsTargeted()).toContain(rooms.host('evt1'));
    expect(roomsTargeted()).not.toContain(rooms.event('evt1'));
    expect(emit).toHaveBeenCalledWith(ServerEvents.QA_NEW, {
      question: { _id: 'q1', eventId: 'evt1' },
    });
  });

  it('broadcasts a question to everyone when moderation is OFF', async () => {
    events.findByEventCode.mockResolvedValueOnce({
      ...event,
      settings: { requireModeration: false },
    });
    questionsService.create.mockResolvedValueOnce({
      _id: 'q2',
      eventId: 'evt1',
    });

    await gateway.handleQaAsk(
      { eventCode: 'ABC123', anonId: 'a', text: 'Hi?' },
      createClient('s1'),
    );

    expect(questionsService.create).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'approved' }),
    );
    expect(roomsTargeted()).toContain(rooms.event('evt1'));
    expect(emit).toHaveBeenCalledWith(ServerEvents.QA_NEW, {
      question: { _id: 'q2', eventId: 'evt1' },
    });
  });

  it('on approval, broadcasts the question to the whole room', async () => {
    questionsService.updateStatus.mockResolvedValueOnce({
      _id: 'q3',
      eventId: 'evt1',
      status: 'approved',
    });
    events.findById.mockResolvedValueOnce({ _id: 'evt1', hostId: 'host1' });

    const client = createClient('s1');
    gateway['socketState'].set('s1', { role: 'observer', eventId: 'evt1', hostId: 'host1' });
    await gateway.handleQaModerate({ questionId: 'q3', status: 'approved' }, client);

    expect(questionsService.updateStatus).toHaveBeenCalledWith('q3', 'approved');
    expect(roomsTargeted()).toContain(rooms.event('evt1'));
    expect(emit).toHaveBeenCalledWith(
      ServerEvents.QA_NEW,
      expect.objectContaining({
        question: expect.objectContaining({ _id: 'q3' }),
      }),
    );
  });

  it('stores a host reply and broadcasts the answered question', async () => {
    questionsService.reply.mockResolvedValueOnce({
      _id: 'q4',
      eventId: 'evt1',
      status: 'answered',
      answerText: 'Here is the answer.',
    });
    events.findById.mockResolvedValueOnce({ _id: 'evt1', hostId: 'host1' });

    const client = createClient('s1');
    gateway['socketState'].set('s1', { role: 'observer', eventId: 'evt1', hostId: 'host1' });
    await gateway.handleQaReply(
      { questionId: 'q4', answerText: 'Here is the answer.' },
      client,
    );

    expect(questionsService.reply).toHaveBeenCalledWith('q4', 'Here is the answer.');
    expect(analyticsService.invalidateCacheIfLive).toHaveBeenCalledWith('evt1');
    expect(roomsTargeted()).toContain(rooms.host('evt1'));
    expect(roomsTargeted()).toContain(rooms.event('evt1'));
    expect(emit).toHaveBeenCalledWith(ServerEvents.QA_UPDATED, {
      question: expect.objectContaining({
        _id: 'q4',
        status: 'answered',
        answerText: 'Here is the answer.',
      }),
    });
  });

  it('rejects an empty host reply payload', async () => {
    const client = createClient('s1');

    await gateway.handleQaReply({ questionId: 'q4', answerText: '' }, client);

    expect(questionsService.reply).not.toHaveBeenCalled();
    expect(client.emit).toHaveBeenCalledWith(
      ServerEvents.ERROR,
      expect.objectContaining({ message: expect.any(String) }),
    );
  });
});

  // ── Admin Diagnostics ──────────────────────────────────────────────────────

describe('RealtimeGateway Admin Diagnostics', () => {
  let gateway: RealtimeGateway;

  const activityService = {
    findLiveActivity: jest.fn(),
  };

  beforeEach(() => {
    gateway = new RealtimeGateway(
      {} as any,
      {} as any,
      {} as any,
      activityService as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      { verify: jest.fn(), sign: jest.fn() } as any,
    );
  });

  it('queries database for live activity to determine activeActivityId', async () => {
    const fetchSockets = jest.fn().mockResolvedValue(['socket1', 'socket2']);
    gateway.server = {
      in: jest.fn().mockReturnValue({ fetchSockets }),
    } as any;

    activityService.findLiveActivity.mockResolvedValueOnce({ _id: 'live-poll-123' });

    const result = await gateway.getEventDiagnostics('evt123');

    expect(gateway.server.in).toHaveBeenCalledWith('event:evt123');
    expect(activityService.findLiveActivity).toHaveBeenCalledWith('evt123');
    expect(result).toEqual({
      connectedSockets: 2,
      activeActivityId: 'live-poll-123',
    });
  });

  it('returns null activeActivityId when no activity is live', async () => {
    const fetchSockets = jest.fn().mockResolvedValue(['socket1']);
    gateway.server = {
      in: jest.fn().mockReturnValue({ fetchSockets }),
    } as any;

    activityService.findLiveActivity.mockResolvedValueOnce(null);

    const result = await gateway.getEventDiagnostics('evt123');

    expect(result).toEqual({
      connectedSockets: 1,
      activeActivityId: null,
    });
  });
});

describe('RealtimeGateway Security Hardening', () => {
  let gateway: RealtimeGateway;
  let emit: jest.Mock;
  const events = { findById: jest.fn(), findByEventCode: jest.fn() };
  const jwtService = { verify: jest.fn() };
  const questionsService = { findApprovedByEvent: jest.fn(async () => []), findByEvent: jest.fn(async () => []) };
  const responseService = { saveResponse: jest.fn() };
  const analyticsService = { invalidateCacheIfLive: jest.fn() };
  const activityService = { findById: jest.fn().mockResolvedValue({ eventId: 'evt1', status: 'live', type: 'poll' }), findLiveActivity: jest.fn() };
  const participants = { upsertParticipant: jest.fn(), findParticipant: jest.fn().mockResolvedValue(null) };

  beforeEach(() => {
    gateway = new RealtimeGateway(
      events as any,
      participants as any,
      createFakeRedis() as any,
      activityService as any,
      responseService as any,
      questionsService as any,
      analyticsService as any,
      { consumeForAction: jest.fn(async () => ({ allowed: true })) } as any,
      { checkParticipantLimit: jest.fn(async () => ({ allowed: true })), incrementParticipants: jest.fn() } as any,
      jwtService as any,
    );
    emit = jest.fn();
    const to = jest.fn().mockReturnValue({ emit });
    gateway.server = { to, in: jest.fn().mockReturnValue({ fetchSockets: jest.fn().mockResolvedValue([]) }) } as any;
  });

  it('rejects host-only actions from a participant', async () => {
    const client = createClient('s1');
    gateway['socketState'].set('s1', { role: 'participant', eventId: 'evt1', anonId: 'anon1' });
    
    await gateway.handleActivityLaunch({ activityId: 'act1' }, client);
    
    expect(client.emit).toHaveBeenCalledWith(
      ServerEvents.ERROR,
      expect.objectContaining({ message: 'Participants cannot perform host actions' }),
    );
  });

  it('rejects cross-event host access', async () => {
    const client = createClient('s1');
    gateway['socketState'].set('s1', { role: 'observer', eventId: 'evt1', hostId: 'host1' });
    
    // Observer tries to launch activity for a DIFFERENT event.
    activityService.findById.mockResolvedValueOnce({ eventId: 'evt2' });

    await gateway.handleActivityLaunch({ activityId: 'act1' }, client);
    
    expect(client.emit).toHaveBeenCalledWith(
      ServerEvents.ERROR,
      expect.objectContaining({ message: 'Action not authorized for this event' }),
    );
  });

  it('rejects a host action if the observer hostId does not match the event hostId', async () => {
    const client = createClient('s1');
    gateway['socketState'].set('s1', { role: 'observer', eventId: 'evt1', hostId: 'hostA' });
    
    activityService.findById.mockResolvedValueOnce({ eventId: 'evt1' });
    events.findById.mockResolvedValue({ _id: 'evt1', hostId: 'hostB' }); // Event owned by someone else

    await gateway.handleActivityLaunch({ activityId: 'act1' }, client);
    
    expect(client.emit).toHaveBeenCalledWith(
      ServerEvents.ERROR,
      expect.objectContaining({ message: 'You are not the host of this event' }),
    );
  });

  it('ignores invalid or expired hostTokens and downgrades observer to unauthenticated', async () => {
    const client = createClient('s1');
    jwtService.verify.mockImplementation(() => { throw new Error('jwt expired'); });
    events.findByEventCode.mockResolvedValue({ _id: 'evt1', eventCode: 'ABC' });
    
    await gateway.handleEventObserve({ eventCode: 'ABC', hostToken: 'expired-token' } as any, client);
    
    // The socket should be recorded without a hostId
    const state = gateway['socketState'].get('s1');
    expect(state).toBeDefined();
    expect((state as any).hostId).toBeUndefined();
  });

  it('binds participant anonId to the socket on EVENT_JOIN, preventing spoofing in later payloads', async () => {
    const client = createClient('s1');
    events.findByEventCode.mockResolvedValue({ _id: 'evt1', eventCode: 'ABC' });
    
    await gateway.handleEventJoin({ eventCode: 'ABC', anonId: 'real-anon' }, client);
    
    const state = gateway['socketState'].get('s1');
    expect(state).toEqual({ role: 'participant', eventId: 'evt1', anonId: 'real-anon' });

    activityService.findById.mockResolvedValueOnce({ _id: 'act1', eventId: 'evt1', status: 'live', type: 'poll' });

    await gateway.handleActivityRespond({ activityId: 'act1', anonId: 'fake-anon', selectedOptionIds: ['opt1'] }, client);

    // It should have forced the real anonId from the socket state!
    expect(responseService.saveResponse).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ participantAnonId: 'real-anon' })
    );
  });
});

