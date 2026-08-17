import { io, Socket } from 'socket.io-client';
import axios from 'axios';
import { useAuthStore } from '@/store';
import { API_BASE_URL } from './constants';

let socket: Socket | null = null;
let isRefreshingSocketAuth = false;

const metaEnv = (import.meta as any).env;
const SOCKET_URL = metaEnv?.VITE_API_URL
  ? metaEnv.VITE_API_URL.replace(/\/api\/?$/, '')
  : 'http://localhost:4000';

export const getSocket = (): Socket | null => {
  return socket;
};

export const connectSocket = (token?: string): Socket => {
  const currentToken = token || useAuthStore.getState().accessToken || '';

  if (socket) {
    socket.auth = { token: currentToken };
    if (!socket.connected) {
      socket.connect();
    }
    return socket;
  }

  socket = io(SOCKET_URL, {
    auth: (cb) => {
      const liveToken = useAuthStore.getState().accessToken || '';
      cb({ token: liveToken });
    },
    transports: ['websocket', 'polling'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });

  socket.on('connect', () => {
    console.log('⚡ Connected to real-time Socket.IO server');
  });

  socket.on('disconnect', (reason) => {
    console.log('🔌 Disconnected from Socket.IO server:', reason);
    if (reason === 'io server disconnect' || reason === 'transport close') {
      const liveToken = useAuthStore.getState().accessToken;
      if (liveToken) {
        socket?.connect();
      }
    }
  });

  socket.on('connect_error', async (error) => {
    console.warn('Socket connection error:', error.message);

    const errMsg = (error.message || '').toLowerCase();
    const isAuthErr = errMsg.includes('token') || errMsg.includes('auth') || errMsg.includes('jwt') || errMsg.includes('unauthorized');

    if (isAuthErr && !isRefreshingSocketAuth) {
      isRefreshingSocketAuth = true;
      try {
        const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true });
        const newAccessToken = res.data?.accessToken;
        if (newAccessToken) {
          useAuthStore.getState().setAccessToken(newAccessToken);
          if (socket) {
            socket.auth = { token: newAccessToken };
            socket.connect();
          }
        }
      } catch (refreshErr) {
        console.warn('Socket auth refresh failed:', refreshErr);
      } finally {
        isRefreshingSocketAuth = false;
      }
    }
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
  }
};

useAuthStore.subscribe((state, prevState) => {
  if (state.isAuthenticated && state.accessToken) {
    if (socket) {
      socket.auth = { token: state.accessToken };
      if (!socket.connected) {
        socket.connect();
      }
    } else {
      connectSocket(state.accessToken);
    }
  } else if (!state.isAuthenticated && prevState?.isAuthenticated) {
    disconnectSocket();
  }
});
