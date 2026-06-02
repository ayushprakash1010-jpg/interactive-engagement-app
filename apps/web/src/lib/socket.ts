import { io, type Socket } from 'socket.io-client';

import { useSocketStatus } from './socket-status';

/**
 * Prefer a dedicated socket URL, fall back to the API URL, then localhost.
 * (Appendix B: NEXT_PUBLIC_SOCKET_URL / NEXT_PUBLIC_API_URL.)
 */
const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:4000';

/**
 * Singleton Socket.IO client. Left to negotiate transports (websocket with
 * HTTP long-poll fallback) and auto-reconnect; connection lifecycle is mirrored
 * into the Zustand status store for the UI indicator.
 */
export const socket: Socket = io(SOCKET_URL, {
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
