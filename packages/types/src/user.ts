import { z } from 'zod';
import { objectId, timestamps } from './common.js';

/** Hosts/admins only. Authenticated via Auth0; `auth0Sub` is the token `sub` claim. */
export const userRole = z.enum(['host', 'admin']);
export type UserRole = z.infer<typeof userRole>;

export const userSchema = z.object({
  _id: objectId,
  auth0Sub: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  role: userRole,
  plan: z.string().default('free'),
  ...timestamps,
});
export type User = z.infer<typeof userSchema>;

/** Shape persisted on first verified Auth0 request (upsert). */
export const userUpsertSchema = userSchema.pick({
  auth0Sub: true,
  name: true,
  email: true,
  role: true,
});
export type UserUpsert = z.infer<typeof userUpsertSchema>;
