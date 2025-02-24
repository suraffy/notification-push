import { Server, Socket } from "socket.io";

// Define event names and their payload types
export interface ServerToClientEvents {
  "receive-notification": (message: string) => void;
}

export interface ClientToServerEvents {
  "send-notification": (message: string) => void;
}

// Extend the Socket type to include your custom events
export type CustomSocket = Socket<ClientToServerEvents, ServerToClientEvents>;
