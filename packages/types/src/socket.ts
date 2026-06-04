/**
 * Real-time contract (Section 4 of the technical plan).
 * Event-name constants shared by the web client and the NestJS gateway so the
 * two never drift. Payload schemas live alongside their domain modules.
 */

/** Socket.IO room helpers, keyed by eventId. */
export const rooms = {
  /** everyone in a session */
  event: (eventId: string) => `event:${eventId}`,
  /** host/projector only (moderation + private counts) */
  host: (eventId: string) => `host:${eventId}`,
};

/** Client -> Server events. */
export const ClientEvents = {
  EVENT_JOIN: 'event:join',
  /**
   * Read-only room subscription for host dashboard + projector surfaces.
   * Joins the event room (and host room) to receive broadcasts WITHOUT being
   * registered or counted as a participant.
   */
  EVENT_OBSERVE: 'event:observe',
  ACTIVITY_RESPOND: 'activity:respond',
  QUIZ_ANSWER: 'quiz:answer',
  WORDCLOUD_SUBMIT: 'wordcloud:submit',
  QA_ASK: 'qa:ask',
  QA_UPVOTE: 'qa:upvote',
  ACTIVITY_LAUNCH: 'activity:launch',
  ACTIVITY_CLOSE: 'activity:close',
  QA_MODERATE: 'qa:moderate',
  SESSION_END: 'session:end',
} as const;
export type ClientEvent = (typeof ClientEvents)[keyof typeof ClientEvents];

/** Server -> Client broadcasts. */
export const ServerEvents = {
  PARTICIPANT_COUNT: 'participant:count',
  ACTIVITY_LAUNCHED: 'activity:launched',
  ACTIVITY_CLOSED: 'activity:closed',
  ACTIVITY_RESPONDED: 'activity:responded',
  POLL_RESULTS: 'poll:results',
  QUIZ_QUESTION: 'quiz:question',
  QUIZ_LEADERBOARD: 'quiz:leaderboard',
  WORDCLOUD_UPDATE: 'wordcloud:update',
  QA_NEW: 'qa:new',
  QA_UPDATED: 'qa:updated',
  SESSION_ENDED: 'session:ended',
  SESSION_SNAPSHOT: 'session:snapshot',
  ERROR: 'iep:error',
} as const;
export type ServerEvent = (typeof ServerEvents)[keyof typeof ServerEvents];