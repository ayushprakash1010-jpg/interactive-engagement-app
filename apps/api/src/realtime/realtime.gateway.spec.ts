// apps/api/src/realtime/realtime.gateway.spec.ts
import { ServerEvents, rooms } from "@iep/types";
import { RealtimeGateway } from "./realtime.gateway";

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

describe("RealtimeGateway participant count", () => {
  let gateway: RealtimeGateway;
  let emit: jest.Mock;
  let redis: ReturnType<typeof createFakeRedis>;

  const events = {
    findByEventCode: jest.fn(),
  };

  const participants = {
    upsertParticipant: jest.fn(async () => undefined),
    markDisconnected: jest.fn(async () => undefined),
  };

  const activityService = {
    findById: jest.fn(),
    closeLiveActivity: jest.fn(),
    setStatus: jest.fn(),
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

  const event = {
    _id: "evt1",
    eventCode: "ABC123",
    status: "live",
    activeActivityId: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    redis = createFakeRedis();

    events.findByEventCode.mockResolvedValue(event);
    responseService.computeTally.mockResolvedValue(null);
    questionsService.findApprovedByEvent.mockResolvedValue([]);
    questionsService.findByEvent.mockResolvedValue([]);

    gateway = new RealtimeGateway(
      events as any,
      participants as any,
      redis as any,
      activityService as any,
      responseService as any,
      questionsService as any,
      analyticsService as any,
      rateLimitService as any,
    );

    emit = jest.fn();
    gateway.server = { to: jest.fn(() => ({ emit })) } as any;
  });

  const lastCount = () => {
    const calls = emit.mock.calls.filter(
      ([name]) => name === ServerEvents.PARTICIPANT_COUNT,
    );
    return calls.length ? calls[calls.length - 1][1].count : undefined;
  };

  it("counts two tabs of the same anonId as one participant", async () => {
    await gateway.handleEventJoin(
      { eventCode: "ABC123", anonId: "a" },
      createClient("s1"),
    );
    await gateway.handleEventJoin(
      { eventCode: "ABC123", anonId: "a" },
      createClient("s2"),
    );

    expect(lastCount()).toBe(1);
  });

  it("counts distinct anonIds separately", async () => {
    await gateway.handleEventJoin(
      { eventCode: "ABC123", anonId: "a" },
      createClient("s1"),
    );
    await gateway.handleEventJoin(
      { eventCode: "ABC123", anonId: "b" },
      createClient("s2"),
    );

    expect(lastCount()).toBe(2);
  });

  it("keeps a participant counted until their last socket disconnects", async () => {
    const s1 = createClient("s1");
    const s2 = createClient("s2");

    await gateway.handleEventJoin({ eventCode: "ABC123", anonId: "a" }, s1);
    await gateway.handleEventJoin({ eventCode: "ABC123", anonId: "a" }, s2);

    await gateway.handleDisconnect(s1);
    expect(lastCount()).toBe(1);
    expect(participants.markDisconnected).not.toHaveBeenCalled();

    await gateway.handleDisconnect(s2);
    expect(lastCount()).toBe(0);
    expect(participants.markDisconnected).toHaveBeenCalledWith("evt1", "a");
  });

  it("rejects an invalid code with a friendly error and does not count it", async () => {
    events.findByEventCode.mockResolvedValueOnce(null);
    const client = createClient("s1");

    await gateway.handleEventJoin({ eventCode: "NOPE12", anonId: "a" }, client);

    expect(client.emit).toHaveBeenCalledWith(
      ServerEvents.ERROR,
      expect.objectContaining({ message: expect.any(String) }),
    );
    expect(participants.upsertParticipant).not.toHaveBeenCalled();
    expect(lastCount()).toBeUndefined();
  });

  it("rejects an ended event", async () => {
    events.findByEventCode.mockResolvedValueOnce({ ...event, status: "ended" });
    const client = createClient("s1");

    await gateway.handleEventJoin({ eventCode: "ABC123", anonId: "a" }, client);

    expect(client.emit).toHaveBeenCalledWith(
      ServerEvents.ERROR,
      expect.objectContaining({ message: expect.any(String) }),
    );
  });

  it("observers join the room without being counted", async () => {
    const client = createClient("obs");

    await gateway.handleEventObserve({ eventCode: "ABC123" }, client);

    expect(client.join).toHaveBeenCalledWith("event:evt1");
    expect(client.join).toHaveBeenCalledWith("host:evt1");
    expect(participants.upsertParticipant).not.toHaveBeenCalled();
    expect(client.emit).toHaveBeenCalledWith(ServerEvents.PARTICIPANT_COUNT, {
      count: 0,
    });
  });

  // ── Sprint 4: Q&A moderation gating ────────────────────────────────────────

  const roomsTargeted = () =>
    (gateway.server.to as jest.Mock).mock.calls.map(([room]) => room);

  it("holds a question for the host only when moderation is ON", async () => {
    events.findByEventCode.mockResolvedValueOnce({
      ...event,
      settings: { requireModeration: true },
    });
    questionsService.create.mockResolvedValueOnce({
      _id: "q1",
      eventId: "evt1",
    });

    await gateway.handleQaAsk(
      { eventCode: "ABC123", anonId: "a", text: "Hi?" },
      createClient("s1"),
    );

    // Created as pending and broadcast to the host room — NEVER the event room.
    expect(questionsService.create).toHaveBeenCalledWith(
      expect.objectContaining({ status: "pending" }),
    );
    expect(roomsTargeted()).toContain(rooms.host("evt1"));
    expect(roomsTargeted()).not.toContain(rooms.event("evt1"));
    expect(emit).toHaveBeenCalledWith(ServerEvents.QA_NEW, {
      question: { _id: "q1", eventId: "evt1" },
    });
  });

  it("broadcasts a question to everyone when moderation is OFF", async () => {
    events.findByEventCode.mockResolvedValueOnce({
      ...event,
      settings: { requireModeration: false },
    });
    questionsService.create.mockResolvedValueOnce({
      _id: "q2",
      eventId: "evt1",
    });

    await gateway.handleQaAsk(
      { eventCode: "ABC123", anonId: "a", text: "Hi?" },
      createClient("s1"),
    );

    expect(questionsService.create).toHaveBeenCalledWith(
      expect.objectContaining({ status: "approved" }),
    );
    expect(roomsTargeted()).toContain(rooms.event("evt1"));
    expect(emit).toHaveBeenCalledWith(ServerEvents.QA_NEW, {
      question: { _id: "q2", eventId: "evt1" },
    });
  });

  it("on approval, broadcasts the question to the whole room", async () => {
    questionsService.updateStatus.mockResolvedValueOnce({
      _id: "q3",
      eventId: "evt1",
      status: "approved",
    });

    await gateway.handleQaModerate(
      { questionId: "q3", status: "approved" },
      createClient("s1"),
    );

    expect(questionsService.updateStatus).toHaveBeenCalledWith(
      "q3",
      "approved",
    );
    expect(roomsTargeted()).toContain(rooms.event("evt1"));
    expect(emit).toHaveBeenCalledWith(
      ServerEvents.QA_NEW,
      expect.objectContaining({
        question: expect.objectContaining({ _id: "q3" }),
      }),
    );
  });
});
