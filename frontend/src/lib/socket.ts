import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store';

let socket: Socket | null = null;

const metaEnv = (import.meta as any).env;
const SOCKET_URL = metaEnv?.VITE_API_URL
  ? metaEnv.VITE_API_URL.replace(/\/api\/?$/, '')
  : 'http://localhost:4000';

export const getSocket = (): Socket | null => {
  return socket;
};

export const connectSocket = (token: string): Socket => {
  if (socket && socket.connected) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('Connected to real-time Socket.IO server');
  });

  socket.on('disconnect', (reason) => {
    console.log(' Disconnected from Socket.IO server:', reason);
  });

  socket.on('connect_error', (error) => {
    console.warn('Socket connection error:', error.message);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Sync socket connection state with auth store changes
useAuthStore.subscribe((state) => {
  if (state.isAuthenticated && state.accessToken) {
    disconnectSocket();
    connectSocket(state.accessToken);
  } else {
    disconnectSocket();
  }
});
