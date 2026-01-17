import { useEffect, useRef } from "react";
import { useTelepartyContext } from "../hooks/useTelepartyContext";
import { getDisplayName } from "../utils/nickname";

const MessageList: React.FC = () => {
  const { messages, nickname } = useTelepartyContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const isOwnMessage = (messageNickname: string): boolean => {
    return nickname === messageNickname;
  };

  return (
    <div
      ref={containerRef}
      className="h-full overflow-y-auto p-4 md:p-6 space-y-4"
      style={{ maxHeight: "calc(100vh - 22rem)" }}
    >
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-4 py-12">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500/20 to-yellow-500/20 flex items-center justify-center animate-float">
            <span className="text-4xl">💭</span>
          </div>
          <div className="text-center">
            <p className="font-medium text-gray-400">No messages yet</p>
            <p className="text-sm text-gray-600">Be the first to say hello!</p>
          </div>
        </div>
      ) : (
        messages.map((message, index) => {
          const messageKey = `msg-${message.permId}-${message.timestamp}-${index}`;
          
          // System message styling
          if (message.isSystemMessage) {
            return (
              <div key={messageKey} className="flex justify-center my-4 animate-slide-up">
                <div className="msg-system flex items-center gap-2">
                  <span className="text-teal-400 font-medium">
                    {getDisplayName(message.userNickname ?? "System")}
                  </span>
                  <span className="text-gray-400">{message.body}</span>
                  <span className="text-xs text-gray-500 ml-1">
                    {formatTimestamp(message.timestamp)}
                  </span>
                </div>
              </div>
            );
          }

          const isOwn = isOwnMessage(message.userNickname ?? "");

          return (
            <div
              key={messageKey}
              className={`flex ${isOwn ? "justify-end" : "justify-start"} animate-slide-up`}
            >
              <div className={`max-w-[80%] md:max-w-[65%] group`}>
                {/* Username for others' messages */}
                {!isOwn && (
                  <div className="flex items-center gap-2 mb-1.5 px-1">
                    {message.userIcon && (
                      <span className="text-lg">{message.userIcon}</span>
                    )}
                    <span className="text-xs font-semibold text-teal-400">
                      {getDisplayName(message.userNickname ?? "Anonymous")}
                    </span>
                  </div>
                )}

                {/* Message bubble */}
                <div
                  className={`${isOwn ? 'msg-sent' : 'msg-received'} relative`}
                >
                  <p className="break-words leading-relaxed text-sm md:text-base">
                    {message.body}
                  </p>
                  
                  {/* Timestamp */}
                  <div className={`text-[10px] mt-2 ${isOwn ? 'text-white/60 text-right' : 'text-gray-500'}`}>
                    {formatTimestamp(message.timestamp)}
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
