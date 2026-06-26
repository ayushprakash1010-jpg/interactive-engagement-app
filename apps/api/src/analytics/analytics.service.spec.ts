import { Test, TestingModule } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";
import { Types } from "mongoose";

import { AnalyticsService } from "./analytics.service";
import { EventEntity } from "../events/event.schema";
import { ActivityEntity } from "../activities/activity.schema";
import { ResponseEntity } from "../responses/response.schema";
import { QuestionEntity } from "../questions/question.schema";
import { ParticipantEntity } from "../participants/participant.schema";
import { UsersService } from "../users/users.service";
import { RedisService } from "../realtime/redis.service";

const seedEventId = "6660000000000000000000aa";
const seedHostId = new Types.ObjectId("6660000000000000000000bb");

describe("AnalyticsService", () => {
  let service: AnalyticsService;

  const mockRedisClient = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  const mockRedisService = {
    client: mockRedisClient,
  };

  const mockUsersService = {
    findById: jest.fn(),
  };

  const mockEventModel = {
    findById: jest.fn(),
  };

  const mockActivityModel = {
    find: jest.fn(),
  };

  const mockResponseModel = {
    countDocuments: jest.fn(),
    aggregate: jest.fn(),
    find: jest.fn(),
  };

  const mockQuestionModel = {
    countDocuments: jest.fn(),
    find: jest.fn(),
  };

  const mockParticipantModel = {
    countDocuments: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: getModelToken(EventEntity.name),
          useValue: mockEventModel,
        },
        {
          provide: getModelToken(ActivityEntity.name),
          useValue: mockActivityModel,
        },
        {
          provide: getModelToken(ResponseEntity.name),
          useValue: mockResponseModel,
        },
        {
          provide: getModelToken(QuestionEntity.name),
          useValue: mockQuestionModel,
        },
        {
          provide: getModelToken(ParticipantEntity.name),
          useValue: mockParticipantModel,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("invalidateCache calls redis.del with analytics key", async () => {
    mockRedisClient.del.mockResolvedValueOnce(1);

    await service.invalidateCache(seedEventId);

    expect(mockRedisClient.del).toHaveBeenCalledWith(
      `analytics:event:${seedEventId}`,
    );
  });

  it("cacheFinalReport stores report in redis", async () => {
    const report = { ok: true };
    mockRedisClient.set.mockResolvedValueOnce("OK");

    await service.cacheFinalReport(seedEventId, report);

    expect(mockRedisClient.set).toHaveBeenCalledWith(
      `analytics:event:${seedEventId}`,
      JSON.stringify(report),
    );
  });

  it("getAnalytics returns cached result if present", async () => {
    const fakeEvent = {
      _id: new Types.ObjectId(seedEventId),
      hostId: seedHostId,
      name: "Demo Event",
      eventCode: "ABC123",
      status: "draft",
    };

    const fakeUser = {
      _id: seedHostId.toString(),
      sub: "auth0|testhost",
      email: "test@example.com",
    };

    mockEventModel.findById.mockReturnValueOnce({
      lean: () => ({
        exec: jest.fn().mockResolvedValue(fakeEvent),
      }),
    });

    mockUsersService.findById.mockResolvedValueOnce({
      _id: seedHostId,
    });

    mockRedisClient.get.mockResolvedValueOnce(
      JSON.stringify({ cached: true, eventId: seedEventId }),
    );

    const result = await service.getAnalytics(seedEventId, fakeUser as any);

    expect(result).toEqual({ cached: true, eventId: seedEventId });
    expect(mockRedisClient.get).toHaveBeenCalledWith(
      `analytics:event:${seedEventId}`,
    );
  });

  it("generateReport computes participationRate correctly", async () => {
    const fakeEvent = {
      _id: new Types.ObjectId(seedEventId),
      hostId: seedHostId,
      name: "Demo Event",
      eventCode: "ABC123",
      status: "draft",
      createdAt: new Date(),
      startedAt: null,
      endedAt: null,
    };

    mockEventModel.findById.mockReturnValueOnce({
      lean: () => ({
        exec: jest.fn().mockResolvedValue(fakeEvent),
      }),
    });

    mockParticipantModel.countDocuments.mockReturnValueOnce({
      exec: jest.fn().mockResolvedValue(5),
    });
    mockParticipantModel.find.mockReturnValue({
      lean: () => ({
        exec: jest.fn().mockResolvedValue([]),
      }),
    });

    mockResponseModel.countDocuments.mockReturnValueOnce({
      exec: jest.fn().mockResolvedValue(4),
    });

    mockResponseModel.aggregate
      .mockResolvedValueOnce([{ count: 4 }]) // unique responders
      .mockResolvedValueOnce([]) // responsesPerActivityRaw / next aggregate
      .mockResolvedValueOnce([]); // engagementTimeline / next aggregate

    mockActivityModel.find
      .mockReturnValueOnce({
        sort: () => ({
          lean: () => ({
            exec: jest.fn().mockResolvedValue([]),
          }),
        }),
      })
      .mockReturnValue({
        sort: () => ({
          lean: () => ({
            exec: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

    mockQuestionModel.countDocuments
      .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(0) })
      .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(0) })
      .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(0) });

    mockQuestionModel.find.mockReturnValue({
      sort: () => ({
        limit: () => ({
          lean: () => ({
            exec: jest.fn().mockResolvedValue([]),
          }),
        }),
      }),
    });

    mockResponseModel.find.mockReturnValue({
      lean: () => ({
        exec: jest.fn().mockResolvedValue([]),
      }),
    });

    const result = await service.generateReport(seedEventId);

    expect(result.headlineStats.totalParticipants).toBe(5);
    expect(result.headlineStats.totalResponses).toBe(4);
    expect(result.headlineStats.uniqueResponders).toBe(4);
    // participationRate is a percentage (uniqueResponders / participants * 100),
    // matching how the web dashboard and PDF report render it.
    expect(result.headlineStats.participationRate).toBe(80);
  });

  it("generateReport aggregates every activity type from seeded responses", async () => {
    const fakeEvent = {
      _id: new Types.ObjectId(seedEventId),
      hostId: seedHostId,
      name: "Demo Event",
      eventCode: "ABC123",
      status: "ended",
      createdAt: new Date(),
      startedAt: null,
      endedAt: null,
    };

    const pollActivity = {
      _id: new Types.ObjectId("6660000000000000000000c1"),
      type: "poll",
      title: "Favorite color",
      config: {
        pollType: "single",
        question: "Favorite color?",
        options: [
          { id: "o1", label: "Red" },
          { id: "o2", label: "Blue" },
        ],
      },
    };

    const quizActivity = {
      _id: new Types.ObjectId("6660000000000000000000c2"),
      type: "quiz",
      title: "Trivia",
      config: {
        questions: [{ id: "q1", text: "2 + 2 = ?" }],
      },
    };

    const wordCloudActivity = {
      _id: new Types.ObjectId("6660000000000000000000c3"),
      type: "wordcloud",
      title: "One word",
      config: { prompt: "Describe today" },
    };

    const feedbackActivity = {
      _id: new Types.ObjectId("6660000000000000000000c4"),
      type: "feedback",
      title: "Session feedback",
      config: {
        prompt: "How did we do?",
        fields: [
          { id: "f1", type: "rating", label: "Rating" },
          { id: "f2", type: "text", label: "Comments" },
        ],
      },
    };

    mockEventModel.findById.mockReturnValueOnce({
      lean: () => ({ exec: jest.fn().mockResolvedValue(fakeEvent) }),
    });

    mockParticipantModel.countDocuments.mockReturnValueOnce({
      exec: jest.fn().mockResolvedValue(3),
    });
    mockParticipantModel.find.mockReturnValue({
      lean: () => ({
        exec: jest.fn().mockResolvedValue([]),
      }),
    });
    mockResponseModel.countDocuments.mockReturnValueOnce({
      exec: jest.fn().mockResolvedValue(6),
    });
    // Route by pipeline shape so call ordering between the two aggregates
    // (distinct responders vs. engagement timeline) doesn't matter.
    mockResponseModel.aggregate.mockImplementation((pipeline: unknown) => {
      const isTimeline = JSON.stringify(pipeline).includes("$dateToString");
      return Promise.resolve(
        isTimeline
          ? [{ minute: "2026-06-08T10:00:00.000Z", responses: 6 }]
          : [{ count: 3 }],
      );
    });

    const activityFind = (docs: unknown[]) => ({
      sort: () => ({
        lean: () => ({ exec: jest.fn().mockResolvedValue(docs) }),
      }),
    });
    mockActivityModel.find.mockImplementation((query: { type?: string }) => {
      const docsByType: Record<string, unknown[]> = {
        poll: [pollActivity],
        quiz: [quizActivity],
        wordcloud: [wordCloudActivity],
        feedback: [feedbackActivity],
      };

      return activityFind(query.type ? (docsByType[query.type] ?? []) : []);
    });

    const responseFind = (docs: unknown[]) => ({
      lean: () => ({ exec: jest.fn().mockResolvedValue(docs) }),
    });
    mockResponseModel.find.mockImplementation(
      (query: { activityId?: Types.ObjectId }) => {
        const activityId = query.activityId?.toString();

        if (activityId === pollActivity._id.toString()) {
          return responseFind([
            { participantAnonId: "a", selectedOptionIds: ["o1"] },
            { participantAnonId: "b", selectedOptionIds: ["o1"] },
            { participantAnonId: "c", selectedOptionIds: ["o2"] },
          ]);
        }

        if (activityId === quizActivity._id.toString()) {
          return responseFind([
            {
              participantAnonId: "a",
              quizQuestionId: "q1",
              isCorrect: true,
              awardedPoints: 10,
            },
            {
              participantAnonId: "b",
              quizQuestionId: "q1",
              isCorrect: false,
              awardedPoints: 0,
            },
          ]);
        }

        if (activityId === wordCloudActivity._id.toString()) {
          return responseFind([
            { participantAnonId: "a", words: ["Great", "great"] },
            { participantAnonId: "b", words: ["Okay"] },
          ]);
        }

        if (activityId === feedbackActivity._id.toString()) {
          return responseFind([
            {
              participantAnonId: "a",
              feedbackAnswers: [
                { fieldId: "f1", ratingValue: 5 },
                { fieldId: "f2", textValue: "Loved it" },
              ],
            },
            {
              participantAnonId: "b",
              feedbackAnswers: [{ fieldId: "f1", ratingValue: 3 }],
            },
          ]);
        }

        return responseFind([]);
      },
    );

    mockQuestionModel.countDocuments
      .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(2) }) // total
      .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(1) }) // approved
      .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(1) }); // answered
    mockQuestionModel.find.mockReturnValueOnce({
      sort: () => ({
        limit: () => ({
          lean: () => ({
            exec: jest.fn().mockResolvedValue([
              {
                _id: new Types.ObjectId("6660000000000000000000d1"),
                text: "Top question?",
                voteCount: 5,
                status: "approved",
                authorName: null,
                createdAt: new Date(),
              },
            ]),
          }),
        }),
      }),
    });

    const result = await service.generateReport(seedEventId);

    // poll tallies
    const poll = result.pollAnalytics[0];
    expect(poll.totalResponses).toBe(3);
    expect(poll.options).toEqual([
      { id: "o1", label: "Red", count: 2, percentage: 0.6667 },
      { id: "o2", label: "Blue", count: 1, percentage: 0.3333 },
    ]);

    // quiz scoring + leaderboard
    const quiz = result.quizAnalytics[0];
    expect(quiz.leaderboard[0]).toEqual({
      participantAnonId: "a",
      displayName: null,
      totalPoints: 10,
      correct: 1,
      incorrect: 0,
      percentage: 100,
    });
    expect(quiz.questionStats[0]).toMatchObject({
      questionId: "q1",
      total: 2,
      correct: 1,
      correctPct: 0.5,
    });

    // word cloud frequency (duplicates raise weight, case-insensitive)
    const wc = result.wordCloudAnalytics[0];
    expect(wc.words).toEqual([
      { text: "great", weight: 2 },
      { text: "okay", weight: 1 },
    ]);

    // feedback averages + text
    const fb = result.feedbackAnalytics[0];
    const ratingField = fb.fields.find((f: any) => f.fieldId === "f1") as any;
    const textField = fb.fields.find((f: any) => f.fieldId === "f2") as any;
    expect(ratingField.average).toBe(4);
    expect(ratingField.count).toBe(2);
    expect(textField.responses).toEqual(["Loved it"]);

    // Q&A summary
    expect(result.qaAnalytics.totalQuestions).toBe(2);
    expect(result.qaAnalytics.topQuestions[0].text).toBe("Top question?");

    // engagement timeline passes through the aggregation result
    expect(result.engagementTimeline).toEqual([
      { minute: "2026-06-08T10:00:00.000Z", responses: 6 },
    ]);
  });
});
