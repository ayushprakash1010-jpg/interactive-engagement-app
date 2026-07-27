const PROXY_BASE = '/api/proxy';

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const normalizedPath = path.replace(/^\/+/, '');
  const res = await fetch(`${PROXY_BASE}/${normalizedPath}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  if (!res.ok) {
    let msg = `API Error: ${res.status}`;
    try {
      const data = await res.json();
      msg = data.message || msg;
    } catch {}
    throw new Error(msg);
  }

  // Handle 204 No Content
  if (res.status === 204) {
    return {} as T;
  }

  return res.json() as Promise<T>;
}

export const organizationsApi = {
  create: async (name: string): Promise<{ success: boolean }> => {
    return apiFetch<{ success: boolean }>('/organizations', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  },
};
