import { z } from 'zod';

/**
 * Environment schema for apps/api. ConfigModule validates process.env against
 * this at boot so a missing/invalid var fails fast instead of at first use.
 */
export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  MONGODB_URI: z.string().min(1).default('mongodb://localhost:27017/iep'),
  REDIS_URL: z.string().min(1).default('redis://localhost:6379'),
  WEB_ORIGIN: z.string().min(1).default('http://localhost:3000'),
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
  // Auth0 — consumed from Sprint 1 onward; optional in the Sprint 0 skeleton.
  AUTH0_ISSUER_BASE_URL: z.string().url().optional(),
  AUTH0_AUDIENCE: z.string().optional(),

  // Google Gemini AI
  GEMINI_API_KEY: z.string().min(1),
  // Rate limiting — wired in Sprint 7.
  RATE_LIMIT_WINDOW: z.coerce.number().int().positive().default(60),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),

  PUPPETEER_EXECUTABLE_PATH: z.string().optional(),

  // Zoom
  ZOOM_CLIENT_ID: z.string().optional(),
  ZOOM_CLIENT_SECRET: z.string().optional(),
  ZOOM_REDIRECT_URI: z.string().optional(),

  // Microsoft Teams
  TEAMS_CLIENT_ID: z.string().optional(),
  TEAMS_CLIENT_SECRET: z.string().optional(),
  TEAMS_REDIRECT_URI: z.string().optional(),
  TEAMS_TENANT_ID: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): Env {
  const parsed = envSchema.safeParse(config);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(`Invalid environment variables:\n${issues}`);
  }
  return parsed.data;
}
