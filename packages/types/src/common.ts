import { z } from 'zod';

/** Mongo ObjectId rendered as a 24-char hex string in transit. */
export const objectId = z
  .string()
  .regex(/^[a-f\d]{24}$/i, 'Invalid ObjectId');

/** 6-char event join code (ambiguous chars 0/O/1/I excluded at generation time). */
export const eventCode = z
  .string()
  .length(6)
  .regex(/^[A-Z2-9]+$/, 'Invalid event code');

/** Client-generated anonymous participant id (uuid v4). */
export const anonId = z.string().uuid();

/** ISO timestamp helpers — Mongo stores Date, the API serializes to ISO strings. */
export const isoDate = z.union([z.string().datetime(), z.date()]);

export const timestamps = {
  createdAt: isoDate,
  updatedAt: isoDate,
};
