import React, { useState, useRef, useEffect } from 'react';
import { useTelepartyContext } from '../hooks/useTelepartyContext';

const MessageInput: React.FC = () => {
  const { sendMessage, setTyping, connectionState, roomId } = useTelepartyContext();
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const typingTimeoutRef = useRef<number | null>(null);
  const isTypingRef = useRef(false);

  const isDisabled = connectionState !== 'connected' || !roomId;

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isTypingRef.current) {
        setTyping(false);
      }
    };
  }, [setTyping]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    if (!isTypingRef.current && e.target.value.length > 0) {
      isTypingRef.current = true;
      setTyping(true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (e.target.value.length > 0) {
      typingTimeoutRef.current = setTimeout(() => {
        if (isTypingRef.current) {
          isTypingRef.current = false;
          setTyping(false);
        }
      }, 3000);
    } else {
      if (isTypingRef.current) {
        isTypingRef.current = false;
        setTyping(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || isDisabled) {
      return;
    }

    try {
      sendMessage(message.trim());
      setMessage('');
      
      if (isTypingRef.current) {
        isTypingRef.current = false;
        setTyping(false);
      }
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (isTypingRef.current) {
      isTypingRef.current = false;
      setTyping(false);
    }
  };

  const charCountColor = message.length > 450 ? 'text-red-400' : message.length > 400 ? 'text-yellow-400' : 'text-gray-500';

  return (
    <div className={`p-4 md:p-5 transition-all duration-300 ${isFocused ? 'bg-white/5' : ''}`}
         style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <form onSubmit={handleSubmit} className="flex gap-3 items-end">
        {/* Text Input */}
        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={handleBlur}
            placeholder={isDisabled ? '⏳ Connecting...' : 'Type a message...'}
            className="input-dark w-full resize-none pr-16"
            rows={2}
            disabled={isDisabled}
            maxLength={500}
          />
          
          {/* Character counter inside input */}
          {message.length > 0 && (
            <span className={`absolute bottom-3 right-3 text-xs font-medium ${charCountColor}`}>
              {message.length}/500
            </span>
          )}
        </div>
        
        {/* Send Button */}
        <button
          type="submit"
          disabled={isDisabled || !message.trim()}
          className="btn-fire h-[52px] px-6 md:px-8 flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:transform-none"
        >
          <span className="hidden md:inline font-semibold">Send</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
      
      {/* Keyboard hint */}
      <p className="text-[10px] text-gray-600 mt-2 text-center">
        Press <kbd className="px-1.5 py-0.5 rounded bg-white/5 text-gray-400">Enter</kbd> to send • <kbd className="px-1.5 py-0.5 rounded bg-white/5 text-gray-400">Shift+Enter</kbd> for new line
      </p>
    </div>
  );
};

export default MessageInput;
