import { Server } from 'socket.io';

let io = null;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    // Join tenant organization room for isolated broadcasting
    socket.on('join_tenant', (organizationId) => {
      if (organizationId) {
        socket.join(`org_${organizationId}`);
      }
    });

    // Join user specific room
    socket.on('join_user', (userId) => {
      if (userId) {
        socket.join(`user_${userId}`);
      }
    });

    socket.on('disconnect', () => {
      // Clean up if needed
    });
  });

  return io;
};

export const getIO = () => {
  return io;
};

/**
 * Emit an event to all users within a tenant organization
 */
export const emitTenantEvent = (organizationId, event, data) => {
  if (io && organizationId) {
    io.to(`org_${organizationId}`).emit(event, data);
  }
};

/**
 * Emit an event directly to a specific user
 */
export const emitUserEvent = (userId, event, data) => {
  if (io && userId) {
    io.to(`user_${userId}`).emit(event, data);
  }
};
