import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTelepartyContext } from '../hooks/useTelepartyContext';
import ChatRoom from '../components/ChatRoom';
import ConnectionStatus from '../components/ConnectionStatus';
import { ConnectionState } from '../types/teleparty.types';

const RoomPage: React.FC = () => {
  const { roomId: urlRoomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { roomId, connectionState, joinRoom } = useTelepartyContext();
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for nickname modal (when user accesses room link directly)
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [nickname, setNickname] = useState('');
  const [userIcon, setUserIcon] = useState('😊');
  const [nicknameError, setNicknameError] = useState<string | null>(null);

  const emojis = ["😊", "😎", "🤓", "😂", "🥳", "😇", "🤪", "👻", "🎃", "🦊", "🐼", "🦁", "🐸", "🦋"];

  useEffect(() => {
    if (!urlRoomId) {
      navigate('/', { replace: true });
      return;
    }

    // Already in the room
    if (roomId === urlRoomId) {
      return;
    }

    const autoJoinRoom = async () => {
      if (connectionState === ConnectionState.CONNECTED && !isJoining && !roomId) {
        // Get saved nickname/icon if any
        const savedNickname = localStorage.getItem('chat_nickname');
        const savedIcon = localStorage.getItem('chat_icon');
        
        // Always show modal when joining via shared link
        // Pre-fill with saved values if available
        setNickname(savedNickname || '');
        setUserIcon(savedIcon || '😊');
        setShowNicknameModal(true);
      }
    };

    autoJoinRoom();
  }, [urlRoomId, roomId, connectionState, isJoining, joinRoom, navigate]);

  // Handle nickname form submit
  const handleNicknameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nickname.trim()) {
      setNicknameError('Please enter a nickname to join the room');
      return;
    }

    if (nickname.trim().length < 2) {
      setNicknameError('Nickname must be at least 2 characters');
      return;
    }

    setNicknameError(null);
    setShowNicknameModal(false);
    setIsJoining(true);
    setError(null);

    try {
      // Save nickname for future use
      localStorage.setItem('chat_nickname', nickname.trim());
      localStorage.setItem('chat_icon', userIcon);
      
      await joinRoom(nickname.trim(), urlRoomId!, userIcon);
      
      // Save to sessionStorage for refresh persistence
      sessionStorage.setItem('current_room', JSON.stringify({
        roomId: urlRoomId,
        nickname: nickname.trim(),
        userIcon: userIcon
      }));
    } catch (err) {
      console.error('Failed to join room:', err);
      setError('Failed to join room. The room may not exist or has expired.');
    } finally {
      setIsJoining(false);
    }
  };
  // Check if user has saved nickname
  const hasSavedNickname = Boolean(localStorage.getItem('chat_nickname'));

  // Nickname Modal
  if (showNicknameModal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 flex items-center justify-center p-4">
        <div className="neo-card p-6 sm:p-8 max-w-md w-full animate-slide-up">
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">💬</div>
            <h2 className="text-xl font-bold text-white mb-2">
              {hasSavedNickname ? 'Ready to Join?' : 'Join Room'}
            </h2>
            <p className="text-gray-400 text-sm">
              {hasSavedNickname 
                ? 'Confirm your nickname or change it before joining' 
                : 'Enter your nickname to join this chat room'}
            </p>
          </div>

          <form onSubmit={handleNicknameSubmit}>
            {nicknameError && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2 animate-shake">
                <span>⚠️</span>
                <span>{nicknameError}</span>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Nickname <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => {
                  setNickname(e.target.value);
                  setNicknameError(null);
                }}
                placeholder="Enter your nickname"
                className={`input-dark w-full ${nicknameError ? 'border-red-500 focus:border-red-500' : ''}`}
                maxLength={20}
                autoFocus
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-gray-300">Choose Avatar</label>
              <div className="grid grid-cols-7 gap-2">
                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setUserIcon(emoji)}
                    className={`w-10 h-10 text-xl rounded-lg transition-all ${
                      userIcon === emoji 
                        ? 'bg-orange-500/20 border-2 border-orange-500 scale-110' 
                        : 'bg-white/5 border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate('/', { replace: true })}
                className="flex-1 py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 btn-fire"
              >
                Join Room
              </button>
            </div>
          </form>

          <div className="mt-4 pt-4 border-t border-white/10 text-center">
            <p className="text-gray-500 text-xs">Room ID: {urlRoomId}</p>
          </div>
        </div>
        <ConnectionStatus />
      </div>
    );
  }

  // Loading/Error state when not in room yet
  if (!roomId || roomId !== urlRoomId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 pb-12 md:pb-16">
        <div className="container-custom py-4 md:py-8">
          <div className="text-center mb-6 md:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 md:mb-3 bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 bg-clip-text text-transparent">
              Group Chat
            </h1>
            <p className="text-gray-400 text-sm md:text-base">Connect and chat in real-time</p>
          </div>

          <div className="max-w-lg mx-auto">
            <div className="neo-card p-8 text-center">
              {error ? (
                <div className="text-red-400">
                  <p className="text-4xl mb-4">😕</p>
                  <p className="text-lg font-medium mb-2">Oops!</p>
                  <p className="text-sm mb-4">{error}</p>
                  <button
                    onClick={() => navigate('/', { replace: true })}
                    className="btn-ocean"
                  >
                    Go to Homepage
                  </button>
                </div>
              ) : connectionState === ConnectionState.CONNECTING ? (
                <div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-yellow-400 text-sm font-medium backdrop-blur-sm mb-4">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                    Connecting to server...
                  </div>
                </div>
              ) : (
                <div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/30 rounded-full text-orange-400 text-sm font-medium backdrop-blur-sm mb-4">
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                    Joining room...
                  </div>
                  <p className="text-gray-400 text-sm mt-4">Room ID: {urlRoomId}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <ConnectionStatus />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 pb-16">
      <div className="container-custom py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-3 bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 bg-clip-text text-transparent">
            Group Chat
          </h1>
          <p className="text-gray-400">Connect and chat in real-time</p>
        </div>

        <ChatRoom />
      </div>
      <ConnectionStatus />
    </div>
  );
};

export default RoomPage;
