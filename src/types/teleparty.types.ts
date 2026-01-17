// Re-export types from teleparty-websocket-lib
export type {
  SessionChatMessage,
  SocketEventHandler,
  TelepartyClient,
  MessageList,
} from "teleparty-websocket-lib";

export { SocketMessageTypes } from "teleparty-websocket-lib";

// Import for extension
import type { SessionChatMessage } from "teleparty-websocket-lib";

// Custom types for the application
export const ConnectionState = {
  DISCONNECTED: "disconnected",
  CONNECTING: "connecting",
  CONNECTED: "connected",
} as const;

export type ConnectionState =
  (typeof ConnectionState)[keyof typeof ConnectionState];

export interface ChatMessage extends SessionChatMessage {
  id: string; // Unique ID for React keys
}

// SendMessageData is not exported by the library, so we define it based on docs
export interface SendMessageData {
  body: string;
}

// SetTypingMessageData is not exported by the library, so we define it based on docs
export interface SetTypingMessageData {
  typing: boolean;
}

// TypingMessageData is not exported by the library, so we define it based on docs
export interface TypingMessageData {
  anyoneTyping: boolean;
  usersTyping: string[]; // Array of permIds
}
