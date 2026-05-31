/** Base URL of the NestJS API. Public so client components can use it too. */
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export type HealthStatus = {
  ok: boolean;
  status: 'ok' | 'error' | 'unreachable';
  details?: Record<string, { status: string }>;
  error?: string;
};

/**
 * Fetch the API health endpoint server-side. Never throws — returns a
 * structured status so the page can render an "unreachable" state cleanly.
 */
export async function fetchHealth(): Promise<HealthStatus> {
  try {
    const res = await fetch(`${API_URL}/health`, { cache: 'no-store' });
    const body = (await res.json()) as {
      status?: string;
      details?: Record<string, { status: string }>;
    };
    return {
      ok: res.ok,
      status: res.ok ? 'ok' : 'error',
      details: body.details,
    };
  } catch (error) {
    return {
      ok: false,
      status: 'unreachable',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
