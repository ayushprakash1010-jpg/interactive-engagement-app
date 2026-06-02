import { create } from 'zustand';

export type ConnectionStatus = 'connected' | 'reconnecting' | 'disconnected';

type SocketStatusState = {
  status: ConnectionStatus;
  setStatus: (status: ConnectionStatus) => void;
};

/**
 * Lightweight live UI state for the socket connection (per the plan's
 * "connection status in Zustand"). Updated by the listeners wired in
 * `lib/socket.ts`; read by the `<ConnectionStatus />` indicator.
 */
export const useSocketStatus = create<SocketStatusState>((set) => ({
  status: 'disconnected',
  setStatus: (status) => set({ status }),
}));
