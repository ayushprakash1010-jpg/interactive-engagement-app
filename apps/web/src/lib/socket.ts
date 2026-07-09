import { io, type Socket } from 'socket.io-client';

import { useSocketStatus } from './socket-status';

/**
 * Resolve the Socket.IO connection options at runtime.
 *
 * - HTTP (localhost dashboard): connect directly to the NestJS backend on
 *   localhost:4000 with WebSocket + polling transports.
 *
 * - HTTPS (Zoom App via localtunnel): connect to the SAME origin and use our
 *   /api/socketio proxy route so the browser never touches the backend directly.
 *   Force polling-only transport because WebSocket upgrades can't be proxied
 *   through a Next.js API route.
 */
function resolveSocketOptions(): { url: string; path: string; transports?: string[] } {
  // During SSR window is undefined – sensible defaults, won't actually connect.
  if (typeof window === 'undefined') {
    return { url: 'http://localhost:4000', path: '/socket.io' };
  }

  if (window.location.protocol === 'https:') {
    // Use the Next.js API proxy so requests stay same-origin (HTTPS).
    // No localtunnel 511, no Mixed Content.
    return {
      url: window.location.origin,
      path: '/api/socketio',
      transports: ['polling'],
    };
  }

  // Plain HTTP local dev — connect directly, full WebSocket support.
  return { url: 'http://localhost:4000', path: '/socket.io' };
}

const { url: SOCKET_URL, path: SOCKET_PATH, transports: SOCKET_TRANSPORTS } = resolveSocketOptions();

/**
 * Singleton Socket.IO client. Left to negotiate transports (websocket with
 * HTTP long-poll fallback) and auto-reconnect; connection lifecycle is mirrored
 * into the Zustand status store for the UI indicator.
 */
export const socket: Socket = io(SOCKET_URL, {
  path: SOCKET_PATH,
  transports: SOCKET_TRANSPORTS,
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 500,
});

const { setStatus } = useSocketStatus.getState();

socket.on('connect', () => setStatus('connected'));
socket.on('disconnect', () => setStatus('disconnected'));
socket.io.on('reconnect_attempt', () => setStatus('reconnecting'));
socket.io.on('reconnect', () => setStatus('connected'));
socket.io.on('error', () => setStatus('disconnected'));
