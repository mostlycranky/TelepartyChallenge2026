/**
 * TelepartyContext - Manages WebSocket connection and chat state
 * 
 * This context provides all the functionality needed for real-time chat:
 * - WebSocket connection management
 * - Room creation and joining
 * - Message sending and receiving
 * - Typing presence indicators
 */
import React, {
  createContext,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { TelepartyClient, SocketMessageTypes } from "teleparty-websocket-lib";
import type {
  ConnectionState as ConnectionStateType,
  ChatMessage,
  SessionChatMessage,
  TypingMessageData,
  SocketEventHandler,
  SetTypingMessageData,
  MessageList,
} from "../types/teleparty.types";
import { ConnectionState } from "../types/teleparty.types";
import type { SocketMessage } from "teleparty-websocket-lib/lib/SocketMessage";
import { createUniqueNickname } from "../utils/nickname";

// Context type definition for consuming components
export interface TelepartyContextType {
  connectionState: ConnectionStateType;
  roomId: string | null;
  nickname: string | null;
  userIcon: string | null;
  messages: SessionChatMessage[];
  isAnyoneTyping: boolean;
  createRoom: (nickname: string, icon?: string) => Promise<string>;
  joinRoom: (nickname: string, roomId: string, icon?: string) => Promise<void>;
  sendMessage: (body: string) => void;
  setTyping: (typing: boolean) => void;
  leaveRoom: () => void;
  reconnect: () => void;
}

const TelepartyContext = createContext<TelepartyContextType | null>(null);

export { TelepartyContext };

export const TelepartyProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const clientRef = useRef<TelepartyClient | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionStateType>(
    ConnectionState.CONNECTING
  );
  const [roomId, setRoomId] = useState<string | null>(null);
  const [nickname, setNickname] = useState<string | null>(null);
  const [userIcon, setUserIcon] = useState<string | null>(null);
  const [messages, setMessages] = useState<SessionChatMessage[]>([]);
  const [isAnyoneTyping, setIsAnyoneTyping] = useState(false);
  const currentUserId = useRef<string | undefined>(undefined);
  const savedRoomDataRef = useRef<{
    nickname: string;
    roomId: string;
    userIcon: string | null;
  } | null>(null);

  const handleMessage = useCallback((message: SocketMessage) => {
    const { data } = message;

    if (data && "userId" in data && data.userId !== currentUserId.current) {
      currentUserId.current = data.userId as string;
    }

    if (
      data &&
      typeof data === "object" &&
      "anyoneTyping" in data &&
      (data.anyoneTyping === false ||
        data.usersTyping.filter((x: string) => x !== currentUserId.current)
          .length > 0)
    ) {
      const typingData = data as TypingMessageData;
      setIsAnyoneTyping(typingData.anyoneTyping);
      return;
    }

    if (data && typeof data === "object" && "messages" in data) {
      const messageList = data as MessageList;
      const historyMessages: ChatMessage[] = messageList.messages.map(
        (msg: SessionChatMessage, index: number) => ({
          ...msg,
          id: `${msg.permId}-${msg.timestamp}-${index}`,
        })
      );
      setMessages(historyMessages);
      return;
    }

    if (
      data &&
      typeof data === "object" &&
      "body" in data &&
      typeof (data as Record<string, unknown>).body === "string"
    ) {
      const chatMessage = data as SessionChatMessage;
      const newMessage: ChatMessage = {
        ...chatMessage,
        id: `${chatMessage.permId}-${chatMessage.timestamp}-${Date.now()}`,
      };

      setMessages((prev) => [...prev, newMessage]);
      return;
    }
  }, []);

  useEffect(() => {
    const eventHandler: SocketEventHandler = {
      onConnectionReady: () => {
        setConnectionState(ConnectionState.CONNECTED);
      },
      onClose: () => {
        setConnectionState(ConnectionState.DISCONNECTED);
      },
      onMessage: handleMessage,
    };

    try {
      clientRef.current = new TelepartyClient(eventHandler);
    } catch (error) {
      console.error("Failed to initialize TelepartyClient:", error);
      // Use setTimeout to avoid setState in effect
      setTimeout(() => setConnectionState(ConnectionState.DISCONNECTED), 0);
    }
  }, [handleMessage]);

  const createRoom = useCallback(
    async (nickname: string, icon?: string): Promise<string> => {
      if (!clientRef.current) {
        throw new Error("Client not initialized");
      }
      if (connectionState !== ConnectionState.CONNECTED) {
        throw new Error("Not connected to server");
      }

      try {
        // Wait a bit to ensure userId is captured from connection
        await new Promise((resolve) => setTimeout(resolve, 100));

        const userId = currentUserId.current || Date.now().toString();
        const uniqueNickname = createUniqueNickname(nickname, userId);

        const newRoomId = await clientRef.current.createChatRoom(
          uniqueNickname,
          icon
        );
        setRoomId(newRoomId);
        setNickname(uniqueNickname);
        setUserIcon(icon || null);
        setMessages([]);
        return newRoomId;
      } catch (error) {
        console.error("Failed to create room:", error);
        throw error;
      }
    },
    [connectionState]
  );

  const joinRoom = useCallback(
    async (nickname: string, roomId: string, icon?: string) => {
      if (!clientRef.current) {
        throw new Error("Client not initialized");
      }
      if (connectionState !== ConnectionState.CONNECTED) {
        throw new Error("Not connected to server");
      }

      try {
        // Wait a bit to ensure userId is captured from connection
        await new Promise((resolve) => setTimeout(resolve, 100));

        const userId = currentUserId.current || Date.now().toString();
        const uniqueNickname = createUniqueNickname(nickname, userId);

        const messageList = await clientRef.current.joinChatRoom(
          uniqueNickname,
          roomId,
          icon
        );
        setRoomId(roomId);
        setNickname(uniqueNickname);
        setUserIcon(icon || null);

        savedRoomDataRef.current = {
          nickname: uniqueNickname,
          roomId,
          userIcon: icon || null,
        };

        if (messageList && messageList.messages) {
          const historyMessages: ChatMessage[] = messageList.messages.map(
            (msg: SessionChatMessage, index: number) => ({
              ...msg,
              id: `${msg.permId}-${msg.timestamp}-${index}`,
            })
          );
          setMessages(historyMessages);
        } else {
          setMessages([]);
        }
      } catch (error) {
        console.error("Failed to join room:", error);
        throw error;
      }
    },
    [connectionState]
  );

  const sendMessage = useCallback(
    (body: string) => {
      if (!clientRef.current) {
        throw new Error("Client not initialized");
      }
      if (!roomId) {
        throw new Error("Not in a room");
      }

      try {
        clientRef.current.sendMessage(SocketMessageTypes.SEND_MESSAGE, {
          body,
        });
      } catch (error) {
        console.error("Failed to send message:", error);
        throw error;
      }
    },
    [roomId]
  );

  const setTyping = useCallback(
    (typing: boolean) => {
      if (!clientRef.current) return;
      if (!roomId) return;

      try {
        const typingData: SetTypingMessageData = { typing };
        clientRef.current.sendMessage(
          SocketMessageTypes.SET_TYPING_PRESENCE,
          typingData
        );
      } catch (error) {
        console.error("Failed to set typing presence:", error);
      }
    },
    [roomId]
  );

  const leaveRoom = useCallback(() => {
    setRoomId(null);
    setNickname(null);
    setUserIcon(null);
    setMessages([]);
    setIsAnyoneTyping(false);
    savedRoomDataRef.current = null;
  }, []);

  const reconnect = useCallback(async () => {
    window.location.reload();
  }, []);

  const value: TelepartyContextType = {
    connectionState,
    roomId,
    nickname,
    userIcon,
    messages,
    isAnyoneTyping,
    createRoom,
    joinRoom,
    sendMessage,
    setTyping,
    leaveRoom,
    reconnect,
  };

  return (
    <TelepartyContext.Provider value={value}>
      {children}
    </TelepartyContext.Provider>
  );
};
