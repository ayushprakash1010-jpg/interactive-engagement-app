import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

type SocketStatus = 'connected' | 'reconnecting' | 'disconnected';

interface SocketStore {
  socket: Socket | null;
  status: SocketStatus;
  setSocket: (socket: Socket | null) => void;
  setStatus: (status: SocketStatus) => void;
  connect: () => Socket;
  disconnect: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export const useSocketStore = create<SocketStore>((set, get) => ({
  socket: null,
  status: 'disconnected',

  setSocket: (socket) => set({ socket }),
  setStatus: (status) => set({ status }),

  connect: () => {
    console.log('CONNECT FUNCTION CALLED');

    const existing = get().socket;

    if (existing) {
      console.log('SOCKET ALREADY EXISTS');
      return existing;
    }

    console.log('CREATING NEW SOCKET');

    const socket = io(API_URL, {
      transports: ['websocket'],
      withCredentials: true,
    });

    socket.on('connect', () => {
      console.log('SOCKET CONNECTED');
      set({ status: 'connected' });
    });

    socket.on('disconnect', () => {
      console.log('SOCKET DISCONNECTED');
      set({ status: 'disconnected' });
    });

    socket.on('connect_error', (err) => {
      console.error('SOCKET CONNECT ERROR:', err);
    });

    socket.io.on('reconnect_attempt', () => {
      console.log('SOCKET RECONNECT ATTEMPT');
      set({ status: 'reconnecting' });
    });

    set({ socket });

    console.log('SOCKET STORED IN ZUSTAND');

    return socket;
  },

  disconnect: () => {
    const socket = get().socket;

    if (socket) {
      console.log('DISCONNECTING SOCKET');
      socket.disconnect();
    }

    set({
      socket: null,
      status: 'disconnected',
    });
  },
}));