'use client';

import * as React from 'react';
import { Bot, X, Send, Loader2, ChevronDown, Zap, AlertTriangle, Check, XCircle, Wrench, RotateCcw, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  sendCopilotMessage,
  type CopilotMessage,
  type PendingAction,
  type PageContext,
} from '@/lib/copilot-api';
import type { AdminMe } from '@/lib/admin-api';

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand">
        <Bot className="h-3.5 w-3.5" />
      </div>
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-surface-raised px-3.5 py-2.5">
        <span className="copilot-dot" style={{ animationDelay: '0ms' }} />
        <span className="copilot-dot" style={{ animationDelay: '160ms' }} />
        <span className="copilot-dot" style={{ animationDelay: '320ms' }} />
      </div>
    </div>
  );
}

function ToolBadge({ tools }: { tools: string[] }) {
  if (!tools.length) return null;
  const labels: Record<string, string> = {
    lookupUser: 'Looked up User',
    searchUsers: 'Searched Users',
    lookupEvent: 'Looked up Event',
    getLiveSessions: 'Fetched Live Sessions',
    searchTickets: 'Searched Support Tickets',
    investigateUser: 'Investigated User',
    investigateEvent: 'Investigated Event',
    proposeSuspendUser: 'Proposed Suspension',
    proposeUnsuspendUser: 'Proposed Reactivation',
    proposeForceEndSession: 'Proposed Session End',
    executeConfirmedAction: 'Executed Action',
  };
  return (
    <div className="mt-1.5 flex flex-wrap gap-1">
      {tools.map(t => (
        <span
          key={t}
          className="inline-flex items-center gap-1 rounded-full border border-brand/20 bg-brand/5 px-2 py-0.5 text-[10px] font-medium text-brand"
        >
          <Wrench className="h-2.5 w-2.5" />
          {labels[t] || t}
        </span>
      ))}
    </div>
  );
}

function ConfirmActionCard({
  action,
  onConfirm,
  onCancel,
  disabled,
}: {
  action: PendingAction;
  onConfirm: () => void;
  onCancel: () => void;
  disabled?: boolean;
}) {
  const iconMap: Record<PendingAction['actionType'], React.ReactNode> = {
    SUSPEND_USER: <AlertTriangle className="h-4 w-4 text-amber-500" />,
    UNSUSPEND_USER: <Check className="h-4 w-4 text-green-500" />,
    FORCE_END_SESSION: <XCircle className="h-4 w-4 text-red-500" />,
  };

  return (
    <div className="mt-2 overflow-hidden rounded-xl border border-amber-500/30 bg-amber-500/5">
      <div className="flex items-center gap-2 border-b border-amber-500/20 px-3 py-2">
        {iconMap[action.actionType]}
        <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
          Confirmation Required
        </span>
      </div>
      <div className="p-3 space-y-2">
        <p className="text-xs text-ink-secondary">{action.details}</p>
        <p className="text-[10px] text-ink-muted">
          <span className="font-medium">Reason:</span> {action.reason}
        </p>
        <div className="flex gap-2 pt-1">
          <button
            onClick={onConfirm}
            disabled={disabled}
            className="flex-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            Confirm
          </button>
          <button
            onClick={onCancel}
            disabled={disabled}
            className="flex-1 rounded-lg border border-input bg-surface-card px-3 py-1.5 text-xs font-medium text-ink-secondary transition hover:bg-surface-raised disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({
  msg,
  onConfirm,
  onCancelAction,
  isConfirming,
}: {
  msg: CopilotMessage & { pendingAction?: PendingAction; actionConfirmed?: boolean };
  onConfirm?: (actionId: string) => void;
  onCancelAction?: () => void;
  isConfirming?: boolean;
}) {
  const isUser = msg.role === 'user';

  return (
    <div className={cn('flex items-end gap-2', isUser && 'flex-row-reverse')}>
      {/* Avatar */}
      {!isUser && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand">
          <Bot className="h-3.5 w-3.5" />
        </div>
      )}

      <div className={cn('max-w-[85%] space-y-1', isUser && 'items-end flex flex-col')}>
        {/* Bubble */}
        <div
          className={cn(
            'rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed',
            isUser
              ? 'rounded-br-sm bg-brand text-white'
              : 'rounded-bl-sm bg-surface-raised text-foreground',
          )}
        >
          {isUser ? (
            msg.content
          ) : (
            <div
              className="prose prose-xs prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
              // Safe: content comes from Gemini, not user-controlled HTML
              dangerouslySetInnerHTML={{ __html: markdownToHtml(msg.content) }}
            />
          )}
        </div>

        {/* Tools used */}
        {!isUser && msg.toolsUsed && msg.toolsUsed.length > 0 && (
          <ToolBadge tools={msg.toolsUsed} />
        )}

        {/* Pending action confirmation card */}
        {!isUser && msg.pendingAction && !msg.actionConfirmed && (
          <ConfirmActionCard
            action={msg.pendingAction}
            onConfirm={() => onConfirm?.(msg.pendingAction!.actionId)}
            onCancel={() => onCancelAction?.()}
            disabled={isConfirming}
          />
        )}

        {/* Timestamp */}
        <span className="text-[10px] text-ink-muted px-1">
          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}

// Very light markdown → HTML (bold, italic, code, lists, headings)
function markdownToHtml(md: string): string {
  return md
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    // headers
    .replace(/^### (.+)$/gm, '<h3 class="text-xs font-bold mt-2 mb-1">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xs font-bold mt-2 mb-1">$2</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-xs font-bold mt-2 mb-1">$1</h1>')
    // bold + italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // inline code
    .replace(/`(.+?)`/g, '<code class="rounded bg-surface-sunken px-1 py-0.5 font-mono text-[10px]">$1</code>')
    // unordered lists
    .replace(/^[-*] (.+)$/gm, '<li class="ml-3 list-disc">$1</li>')
    .replace(/(<li[\s\S]+?<\/li>)/g, '<ul class="my-1 space-y-0.5">$1</ul>')
    // newlines
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
}

// ---------------------------------------------------------------------------
// Suggestion chips
// ---------------------------------------------------------------------------

function SuggestionChips({
  suggestions,
  onSelect,
}: {
  suggestions: string[];
  onSelect: (s: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5 px-1">
      {suggestions.map(s => (
        <button
          key={s}
          onClick={() => onSelect(s)}
          className="rounded-full border border-brand/25 bg-brand/5 px-2.5 py-1 text-[11px] font-medium text-brand transition hover:bg-brand/15"
        >
          {s}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main CopilotPanel component
// ---------------------------------------------------------------------------

type ExtendedMessage = CopilotMessage & {
  pendingAction?: PendingAction;
  actionConfirmed?: boolean;
};

export interface CopilotPanelProps {
  user: AdminMe;
  pageContext?: PageContext;
}

export function CopilotPanel({ user, pageContext }: CopilotPanelProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<ExtendedMessage[]>([]);
  const [input, setInput] = React.useState('');
  const [conversationId, setConversationId] = React.useState<string | undefined>();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isConfirming, setIsConfirming] = React.useState(false);
  const [suggestions, setSuggestions] = React.useState<string[]>([
    'How many live sessions right now?',
    'Show me the latest platform stats',
    'Find suspended users',
    'What were the last 5 admin actions?',
  ]);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);


  const scrollToBottom = React.useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, messages, scrollToBottom]);

  const sendMessage = React.useCallback(
    async (text: string, confirmActionId?: string) => {
      const trimmed = text.trim();
      if (!trimmed && !confirmActionId) return;
      if (isLoading) return;

      if (trimmed) {
        setMessages(prev => [
          ...prev,
          { role: 'user', content: trimmed, timestamp: new Date().toISOString() },
        ]);
      }
      setInput('');
      setIsLoading(true);

      try {
        const resp = await sendCopilotMessage({
          message: trimmed || 'Confirmed.',
          conversationId,
          pageContext,
          confirmActionId,
        });

        setConversationId(resp.conversationId);

        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: resp.reply,
            timestamp: new Date().toISOString(),
            toolsUsed: resp.toolsUsed,
            pendingAction: resp.pendingAction,
          },
        ]);

        if (resp.suggestions?.length) {
          setSuggestions(resp.suggestions);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An error occurred';
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: `⚠️ ${message}`,
            timestamp: new Date().toISOString(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [conversationId, isLoading, pageContext],
  );

  // Sprint 4: Listen for "Investigate with Copilot" events from detail pages
  React.useEffect(() => {
    const handler = (e: Event) => {
      const { prompt, resourceType, resourceId } = (e as CustomEvent).detail as {
        prompt: string;
        resourceType: string;
        resourceId: string;
      };
      setIsOpen(true);
      // Small delay so panel is visible before sending
      setTimeout(() => sendMessage(prompt), 300);
    };
    window.addEventListener('pulse:investigate', handler);
    return () => window.removeEventListener('pulse:investigate', handler);
  }, [sendMessage]);

  const handleConfirmAction = React.useCallback(
    async (actionId: string) => {
      setIsConfirming(true);
      // Mark the pending action as confirmed in UI
      setMessages(prev =>
        prev.map(m =>
          m.pendingAction?.actionId === actionId ? { ...m, actionConfirmed: true } : m,
        ),
      );
      try {
        await sendMessage('', actionId);
      } finally {
        setIsConfirming(false);
      }
    },
    [sendMessage],
  );

  const handleCancelAction = React.useCallback((actionId: string) => {
    setMessages(prev =>
      prev.map(m =>
        m.pendingAction?.actionId === actionId
          ? { ...m, actionConfirmed: true }
          : m,
      ),
    );
    setMessages(prev => [
      ...prev,
      {
        role: 'assistant',
        content: '❌ Action cancelled.',
        timestamp: new Date().toISOString(),
      },
    ]);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearConversation = () => {
    setMessages([]);
    setConversationId(undefined);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Floating trigger button */}
      <button
        id="copilot-toggle-btn"
        onClick={() => setIsOpen(v => !v)}
        aria-label="Open Pulse Assistant"
        className={cn(
          'fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-2xl transition-all duration-300',
          'bg-brand text-white hover:scale-110 hover:shadow-brand/40',
          isOpen && 'scale-90 opacity-0 pointer-events-none',
        )}
      >
        <Bot className="h-6 w-6" />
        <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-green-400 ring-2 ring-surface-canvas">
          <span className="h-1.5 w-1.5 rounded-full bg-green-700" />
        </span>
      </button>

      {/* Chat panel */}
      <div
        id="copilot-panel"
        className={cn(
          'fixed bottom-6 right-6 z-50 flex flex-col overflow-hidden rounded-2xl shadow-2xl shadow-black/30 transition-all duration-300',
          'w-[380px] border border-white/10 bg-surface-card backdrop-blur-xl',
          isOpen
            ? 'h-[600px] scale-100 opacity-100'
            : 'h-0 scale-95 opacity-0 pointer-events-none',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-brand/10 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/20 text-brand">
              <Bot className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Pulse Assistant</p>
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                <span className="text-[10px] text-ink-muted">Powered by Gemini</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <button
                onClick={clearConversation}
                className="rounded-lg p-1.5 text-ink-muted transition hover:bg-surface-raised hover:text-foreground"
                title="Clear conversation"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1.5 text-ink-muted transition hover:bg-surface-raised hover:text-foreground"
              title="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Page context badge */}
        {pageContext && (
          <div className="flex items-center gap-1.5 border-b border-white/5 bg-brand/5 px-4 py-1.5">
            <Zap className="h-3 w-3 text-brand" />
            <span className="text-[10px] text-brand">
              Context: {pageContext.type} <span className="font-mono opacity-70">#{pageContext.id.slice(-8)}</span>
            </span>
          </div>
        )}

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Welcome state */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 py-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                <MessageSquare className="h-7 w-7" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Hello, {user.name.split(' ')[0]}!</p>
                <p className="mt-0.5 text-xs text-ink-muted">
                  I&apos;m your Admin Copilot. Ask me anything about users, events, tickets, or platform health.
                </p>
              </div>
              <SuggestionChips suggestions={suggestions} onSelect={s => sendMessage(s)} />
            </div>
          )}

          {/* Message list */}
          {messages.map((msg, i) => (
            <MessageBubble
              key={i}
              msg={msg}
              onConfirm={handleConfirmAction}
              onCancelAction={() => {
                if (msg.pendingAction) handleCancelAction(msg.pendingAction.actionId);
              }}
              isConfirming={isConfirming}
            />
          ))}

          {/* Typing indicator */}
          {isLoading && <TypingIndicator />}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions (when messages exist) */}
        {messages.length > 0 && !isLoading && (
          <div className="border-t border-white/5 px-3 py-2">
            <SuggestionChips
              suggestions={suggestions.slice(0, 3)}
              onSelect={s => sendMessage(s)}
            />
          </div>
        )}

        {/* Input area */}
        <div className="border-t border-white/10 p-3">
          <div className="flex items-end gap-2 rounded-xl border border-input bg-surface-raised p-2">
            <textarea
              ref={inputRef}
              id="copilot-input"
              rows={1}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Pulse Assistant anything…"
              disabled={isLoading}
              className="max-h-28 flex-1 resize-none bg-transparent text-xs text-foreground placeholder:text-ink-muted focus:outline-none disabled:opacity-50"
              style={{ height: 'auto', minHeight: '1.5rem' }}
              onInput={e => {
                const t = e.currentTarget;
                t.style.height = 'auto';
                t.style.height = `${t.scrollHeight}px`;
              }}
            />
            <button
              id="copilot-send-btn"
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand text-white transition hover:bg-brand/90 disabled:opacity-40"
            >
              {isLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
          <p className="mt-1.5 text-center text-[10px] text-ink-muted">
            Shift+Enter for new line · Enter to send
          </p>
        </div>
      </div>

      {/* Typing dot animation styles */}
      <style>{`
        .copilot-dot {
          display: inline-block;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: hsl(var(--ink-muted));
          animation: copilot-bounce 1.2s infinite ease-in-out;
        }
        @keyframes copilot-bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </>
  );
}
