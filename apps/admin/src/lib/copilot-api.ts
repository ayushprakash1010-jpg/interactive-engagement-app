/**
 * Copilot API client — typed fetch wrapper for Pulse Assistant.
 *
 * All requests go through the same admin proxy (/api/proxy) which attaches
 * the Auth0 Bearer token before forwarding to NestJS.
 */

const PROXY_BASE = '/api/proxy';

export class AdminApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'AdminApiError';
  }
}

async function copilotFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${PROXY_BASE}/${path.replace(/^\/+/, '')}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json() as { message?: string | string[] };
      if (body?.message) {
        message = Array.isArray(body.message) ? body.message.join(', ') : body.message;
      }
    } catch {}
    throw new AdminApiError(message, res.status);
  }

  if (res.status === 204) return undefined as T;
  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CopilotRole = 'user' | 'assistant';

export interface CopilotMessage {
  role: CopilotRole;
  content: string;
  timestamp: string;
  toolsUsed?: string[];
}

export interface PendingAction {
  actionId: string;
  actionType: 'SUSPEND_USER' | 'UNSUSPEND_USER' | 'FORCE_END_SESSION';
  targetId: string;
  targetLabel: string;
  reason: string;
  details: string;
}

export interface CopilotChatResponse {
  reply: string;
  conversationId: string;
  toolsUsed: string[];
  pendingAction?: PendingAction;
  suggestions?: string[];
}

export interface CopilotConversation {
  _id: string;
  adminId: string;
  messages: CopilotMessage[];
  pageContext?: { type: string; id: string } | null;
  createdAt: string;
}

export type PageContext = {
  type: 'user' | 'event' | 'ticket' | 'article' | 'live-session';
  id: string;
};

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

export async function sendCopilotMessage(opts: {
  message: string;
  conversationId?: string;
  pageContext?: PageContext;
  confirmActionId?: string;
}): Promise<CopilotChatResponse> {
  return copilotFetch<CopilotChatResponse>('admin/copilot/chat', {
    method: 'POST',
    body: JSON.stringify(opts),
  });
}

export async function createCopilotConversation(pageContext?: PageContext): Promise<{ conversationId: string }> {
  return copilotFetch<{ conversationId: string }>('admin/copilot/conversations', {
    method: 'POST',
    body: JSON.stringify({ pageContext }),
  });
}

export async function listCopilotConversations(): Promise<CopilotConversation[]> {
  return copilotFetch<CopilotConversation[]>('admin/copilot/conversations');
}

export async function getCopilotConversation(id: string): Promise<CopilotConversation> {
  return copilotFetch<CopilotConversation>(`admin/copilot/conversations/${id}`);
}
