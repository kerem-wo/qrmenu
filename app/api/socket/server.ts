/**
 * Socket.io Server Implementation for Real-time Notifications
 * 
 * Note: For Vercel/serverless environments, consider using:
 * - Server-Sent Events (SSE)
 * - Pusher
 * - Ably
 * - Supabase Realtime
 */

import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import type { ServerOptions } from "socket.io";

let io: SocketIOServer | null = null;

/**
 * Initialize Socket.io server
 */
export function initSocketIO(httpServer: HTTPServer, options?: Partial<ServerOptions>) {
  if (io) {
    return io;
  }

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NEXTAUTH_URL || "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
    ...options,
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join restaurant room
    socket.on("join:restaurant", (restaurantId: string) => {
      socket.join(`restaurant:${restaurantId}`);
      console.log(`Socket ${socket.id} joined restaurant:${restaurantId}`);
    });

    // Leave restaurant room
    socket.on("leave:restaurant", (restaurantId: string) => {
      socket.leave(`restaurant:${restaurantId}`);
      console.log(`Socket ${socket.id} left restaurant:${restaurantId}`);
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}

/**
 * Get Socket.io instance
 */
export function getSocketIO(): SocketIOServer | null {
  return io;
}

/**
 * Emit event to restaurant room
 */
export function emitToRestaurant(restaurantId: string, event: string, data: any) {
  if (io) {
    io.to(`restaurant:${restaurantId}`).emit(event, data);
  }
}

/**
 * Emit new order notification
 */
export function notifyNewOrder(restaurantId: string, order: any) {
  emitToRestaurant(restaurantId, "order:new", order);
}

/**
 * Emit order status update
 */
export function notifyOrderUpdate(restaurantId: string, orderId: string, status: string) {
  emitToRestaurant(restaurantId, "order:update", { orderId, status });
}
