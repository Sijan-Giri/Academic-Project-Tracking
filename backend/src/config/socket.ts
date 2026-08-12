import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from './env';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  role?: string;
}

let io: Server | null = null;

export const initSocket = (httpServer: HttpServer): Server => {
  const allowedOrigins = (env.CORSORIGIN || 'http://localhost:5173').split(',').map(o => o.trim());

  io = new Server(httpServer, {
    
    pingInterval: 20_000,   
    pingTimeout: 10_000,    
    
    maxHttpBufferSize: 1e6, 
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (
          allowedOrigins.includes(origin) ||
          allowedOrigins.includes('*') ||
          process.env.NODE_ENV === 'development' ||
          origin.startsWith('http://localhost:') ||
          origin.startsWith('http://127.0.0.1:')
        ) {
          return callback(null, true);
        }
        callback(new Error('Not allowed by CORS'));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    },
  });

  io.use((socket: AuthenticatedSocket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as { userId: string; role: string };
      socket.userId = decoded.userId;
      socket.role = decoded.role;
      next();
    } catch (err) {
      next(new Error('Invalid socket authentication token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    if (socket.userId) {
      const userRoom = `user:${socket.userId}`;
      socket.join(userRoom);
    }

    if (socket.role) {
      const roleRoom = `role:${socket.role}`;
      socket.join(roleRoom);
    }

    socket.on('join:team', (teamId: string) => {
      if (teamId) {
        socket.join(`team:${teamId}`);
      }
    });

    socket.on('leave:team', (teamId: string) => {
      if (teamId) {
        socket.leave(`team:${teamId}`);
      }
    });
  });

  console.log('⚡ Socket.IO initialized successfully');
  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

export const emitToUser = (userId: string, event: string, data: any) => {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, data);
};

export const emitToRole = (role: string, event: string, data: any) => {
  if (!io) return;
  io.to(`role:${role}`).emit(event, data);
};

export const emitToTeam = (teamId: string, event: string, data: any) => {
  if (!io) return;
  io.to(`team:${teamId}`).emit(event, data);
};

export const broadcastEvent = (event: string, data: any) => {
  if (!io) return;
  io.emit(event, data);
};
