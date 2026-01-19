import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  if (typeof window === "undefined") return null;
  
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin, {
      transports: ["websocket", "polling"],
    });
  }
  
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
