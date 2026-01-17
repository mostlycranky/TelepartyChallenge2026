import React, { useState, useEffect } from "react";
import { useTelepartyContext } from "../hooks/useTelepartyContext";
import { ConnectionState } from "../types/teleparty.types";

const RoomSetup: React.FC = () => {
  const { createRoom, joinRoom, connectionState } = useTelepartyContext();

  const [nickname, setNickname] = useState("");
  const [userIcon, setUserIcon] = useState("😊");
  const [roomIdToJoin, setRoomIdToJoin] = useState("");
  const [createdRoomId, setCreatedRoomId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  // Field-specific errors for better UX
  const [nicknameError, setNicknameError] = useState(false);
  const [roomIdError, setRoomIdError] = useState(false);

  const isConnected = connectionState === ConnectionState.CONNECTED;

  useEffect(() => {
    const savedNickname = localStorage.getItem('chat_nickname');
    const savedIcon = localStorage.getItem('chat_icon');
    if (savedNickname) setNickname(savedNickname);
    if (savedIcon) setUserIcon(savedIcon);
  }, []);

  const validateNickname = () => {
    if (!nickname.trim()) {
      setError("Please enter a nickname");
      setNicknameError(true);
      return false;
    }
    if (nickname.trim().length < 2) {
      setError("Nickname must be at least 2 characters");
      setNicknameError(true);
      return false;
    }
    return true;
  };

  const handleCreateRoom = async () => {
    setNicknameError(false);
    setError(null);
    
    if (!validateNickname()) return;
    
    setIsCreating(true);

    try {
      localStorage.setItem('chat_nickname', nickname.trim());
      localStorage.setItem('chat_icon', userIcon);
      const roomId = await createRoom(nickname.trim(), userIcon);
      setCreatedRoomId(roomId);
      
      // Save to sessionStorage for refresh persistence
      sessionStorage.setItem('current_room', JSON.stringify({
        roomId,
        nickname: nickname.trim(),
        userIcon
      }));
    } catch (err) {
      setError("Failed to create room. Please try again.");
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async () => {
    setNicknameError(false);
    setRoomIdError(false);
    setError(null);
    
    if (!validateNickname()) return;
    
    if (!roomIdToJoin.trim()) {
      setError("Please enter a room ID to join");
      setRoomIdError(true);
      return;
    }
    
    setIsJoining(true);

    try {
      localStorage.setItem('chat_nickname', nickname.trim());
      localStorage.setItem('chat_icon', userIcon);
      await joinRoom(nickname.trim(), roomIdToJoin.trim(), userIcon);
      
      // Save to sessionStorage for refresh persistence
      sessionStorage.setItem('current_room', JSON.stringify({
        roomId: roomIdToJoin.trim(),
        nickname: nickname.trim(),
        userIcon
      }));
    } catch (err) {
      setError("Failed to join room. Check the room ID and try again.");
      console.error(err);
      setIsJoining(false);
    }
  };

  const handleCopyRoomId = () => {
    if (createdRoomId) {
      navigator.clipboard.writeText(createdRoomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  const handleCopyLink = () => {
    if (createdRoomId) {
      const link = `${window.location.origin}/TelepartyChallenge2026/room/${createdRoomId}`;
      navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const emojis = ["😊", "😎", "🤓", "😂", "🥳", "😇", "🤪", "👻", "🎃", "🦊", "🐼", "🦁", "🐸", "🦋"];

  return (
    <div className="max-w-xl mx-auto">
      <div className="neo-card p-6 sm:p-8">
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2 animate-shake">
            <span>⚠️</span>
            <span>{error}</span>
            <button onClick={() => { setError(null); setNicknameError(false); setRoomIdError(false); }} className="ml-auto hover:text-red-300 text-lg">×</button>
          </div>
        )}

        {/* Nickname */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-300">
              Nickname <span className="text-red-400">*</span>
            </label>
            {nickname && (
              <button
                type="button"
                onClick={() => {
                  setNickname('');
                  localStorage.removeItem('chat_nickname');
                }}
                className="text-xs text-gray-500 hover:text-orange-400 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
          <input
            type="text"
            value={nickname}
            onChange={(e) => {
              setNickname(e.target.value);
              setNicknameError(false);
              setError(null);
            }}
            placeholder="Enter your nickname"
            className={`input-dark w-full ${nicknameError ? 'border-red-500 ring-2 ring-red-500/20' : ''}`}
            disabled={!isConnected}
            maxLength={20}
          />
          {nicknameError && (
            <p className="mt-1 text-xs text-red-400">Nickname is required</p>
          )}
        </div>

        {/* Avatar */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-gray-300">Avatar</label>
          <div className="grid grid-cols-7 gap-2">
            {emojis.map((emoji) => (
              <button
                key={emoji}
                onClick={() => setUserIcon(emoji)}
                className={`w-10 h-10 text-xl rounded-lg transition-all ${
                  userIcon === emoji 
                    ? 'bg-orange-500/20 border-2 border-orange-500 scale-110' 
                    : 'bg-white/5 border border-white/10 hover:bg-white/10'
                }`}
                disabled={!isConnected}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="grid sm:grid-cols-2 gap-4">
          {/* Join */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <h3 className="font-medium mb-3 text-gray-200">Join Room</h3>
            <input
              type="text"
              value={roomIdToJoin}
              onChange={(e) => {
                setRoomIdToJoin(e.target.value);
                setRoomIdError(false);
                setError(null);
              }}
              placeholder="Enter Room ID"
              className={`input-dark w-full text-sm mb-3 ${roomIdError ? 'border-red-500 ring-2 ring-red-500/20' : ''}`}
              disabled={!isConnected}
            />
            {roomIdError && (
              <p className="mb-2 text-xs text-red-400">Room ID is required</p>
            )}
            <button
              onClick={handleJoinRoom}
              disabled={!isConnected || isJoining}
              className="btn-ocean w-full text-sm disabled:opacity-40"
            >
              {isJoining ? "Joining..." : "Join"}
            </button>
          </div>

          {/* Create */}
          <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/20">
            <h3 className="font-medium mb-3 text-gray-200">Create Room</h3>
            <p className="text-xs text-gray-500 mb-3">Start a new private room</p>
            <button
              onClick={handleCreateRoom}
              disabled={!isConnected || isCreating}
              className="btn-fire w-full text-sm disabled:opacity-40"
            >
              {isCreating ? "Creating..." : "Create"}
            </button>
          </div>
        </div>

        {/* Created room ID */}
        {createdRoomId && (
          <div className="mt-4 p-4 rounded-xl bg-green-500/10 border border-green-500/20 animate-slide-up">
            <p className="text-sm text-green-400 mb-3 font-medium">🎉 Room created successfully!</p>
            <div className="flex items-center gap-2 mb-3">
              <code className="flex-1 p-2 rounded bg-black/30 text-green-400 text-xs font-mono overflow-auto">
                {createdRoomId}
              </code>
              <button
                onClick={handleCopyRoomId}
                className="px-3 py-2 rounded bg-green-500/20 text-green-400 text-sm hover:bg-green-500/30 transition-colors"
              >
                {copied ? "✓ Copied!" : "Copy ID"}
              </button>
            </div>
            <button
              onClick={handleCopyLink}
              className="w-full py-2 rounded bg-green-500/10 text-green-400 text-sm hover:bg-green-500/20 transition-colors border border-green-500/20"
            >
              📋 Copy Shareable Link
            </button>
            <p className="mt-2 text-xs text-gray-500 text-center">Share this link with friends to join!</p>
          </div>
        )}

        {/* Connection status */}
        {!isConnected && (
          <div className="mt-4 text-center text-sm text-yellow-400 flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            Connecting to server...
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomSetup;
