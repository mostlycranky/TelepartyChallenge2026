import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTelepartyContext } from "../hooks/useTelepartyContext";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import TypingIndicator from "./TypingIndicator";
import { getDisplayName } from "../utils/nickname";

const ChatRoom: React.FC = () => {
  const { roomId, nickname, leaveRoom } = useTelepartyContext();
  const [copied, setCopied] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const navigate = useNavigate();

  const handleCopyRoomId = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareRoom = () => {
    if (roomId) {
      const url = window.location.href;
      navigator.clipboard.writeText(url);
      setCopied(true);
      setShowTooltip(true);
      setTimeout(() => {
        setCopied(false);
        setShowTooltip(false);
      }, 2000);
    }
  };

  const handleLeaveRoom = () => {
    if (confirm("Are you sure you want to leave this room?")) {
      leaveRoom();
      navigate("/", { replace: true });
    }
  };

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-6rem)] md:h-[calc(100vh-8rem)] px-3 md:px-0">
      {/* Header */}
      <div className="neo-card mb-4 md:mb-6 p-4 md:p-6 relative overflow-hidden">
        {/* Decorative accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-yellow-500 to-teal-500"></div>
        
        <div className="flex items-center justify-between flex-wrap gap-3 md:gap-4">
          <div className="flex-1 min-w-0">
            {/* User info with avatar */}
            <div className="flex items-center gap-3 mb-3">
              <div className="avatar-ring">
                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-xl">
                  {getDisplayName(nickname || "").charAt(0).toUpperCase()}
                </div>
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-bold text-white truncate">
                  {getDisplayName(nickname || "")}
                </h2>
                <p className="text-xs text-gray-500">Active now</p>
              </div>
            </div>
            
            {/* Room info */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1.5 text-xs text-gray-400">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
                Room:
              </span>
              <code className="text-xs font-mono text-teal-400 bg-teal-500/10 px-3 py-1.5 rounded-lg border border-teal-500/20">
                {roomId}
              </code>
              <button
                onClick={handleCopyRoomId}
                className="text-xs px-3 py-1.5 rounded-lg text-gray-400 hover:text-white transition-all hover:bg-white/5"
              >
                {copied ? "✓ Copied!" : "📋 Copy"}
              </button>
              <div className="relative">
                <button
                  onClick={handleShareRoom}
                  className="text-xs px-3 py-1.5 rounded-lg text-orange-400 hover:text-orange-300 transition-all hover:bg-orange-500/10"
                >
                  🔗 Share
                </button>
                {showTooltip && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg text-xs bg-black/90 text-white whitespace-nowrap animate-bounce-in">
                    Link copied!
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Leave button */}
          <button
            onClick={handleLeaveRoom}
            className="btn-danger px-4 py-2 md:px-5 md:py-2.5 text-sm rounded-xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-transform"
          >
            <span>👋</span>
            <span className="hidden sm:inline">Leave</span>
          </button>
        </div>
      </div>

      {/* Chat Container */}
      <div className="neo-card flex flex-col h-[calc(100%-7rem)] md:h-[calc(100%-9rem)] overflow-hidden">
        {/* Messages Area */}
        <div className="flex-1 overflow-hidden">
          <MessageList />
        </div>

        {/* Typing Indicator */}
        <TypingIndicator />
        
        {/* Message Input */}
        <MessageInput />
      </div>
    </div>
  );
};

export default ChatRoom;
