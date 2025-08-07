import React, { useState } from 'react';
import { useSocket } from '../hooks/useSocket';
import { useAppSelector } from '../hooks/redux';
import Loading from '../components/Loading';

const Home: React.FC = () => {
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const { joinRoom, createRoom, isConnected } = useSocket();
  const gameState = useAppSelector(state => state.game);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!playerName.trim()) {
      newErrors.playerName = 'Player name is required';
    } else if (playerName.trim().length < 2) {
      newErrors.playerName = 'Player name must be at least 2 characters';
    } else if (playerName.trim().length > 20) {
      newErrors.playerName = 'Player name must be less than 20 characters';
    }
    
    if (isJoining && !roomCode.trim()) {
      newErrors.roomCode = 'Room code is required';
    } else if (isJoining && roomCode.trim().length !== 6) {
      newErrors.roomCode = 'Room code must be 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsJoining(true);
    try {
      joinRoom(roomCode.toUpperCase(), playerName.trim());
    } catch (error) {
      console.error('Failed to join room:', error);
      setErrors({ general: 'Failed to join room. Please try again.' });
    } finally {
      setIsJoining(false);
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsCreating(true);
    try {
      createRoom(playerName.trim());
    } catch (error) {
      console.error('Failed to create room:', error);
      setErrors({ general: 'Failed to create room. Please try again.' });
    } finally {
      setIsCreating(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card max-w-md w-full mx-4">
          <Loading message="Connecting to server..." />
        </div>
      </div>
    );
  }

  if (gameState.roomCode) {
    return null; // Will be handled by App component routing
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Trivia Game
          </h1>
          <p className="text-gray-600">
            Test your knowledge with friends!
          </p>
        </div>

        {errors.general && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">
            {errors.general}
          </div>
        )}

        <form className="space-y-4">
          <div>
            <label htmlFor="playerName" className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <input
              type="text"
              id="playerName"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className={`input-field ${errors.playerName ? 'border-red-300 focus:ring-red-500' : ''}`}
              placeholder="Enter your name"
              maxLength={20}
            />
            {errors.playerName && (
              <p className="mt-1 text-sm text-red-600">{errors.playerName}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-4">
              <h3 className="font-medium text-gray-800">Join Game</h3>
              <div>
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  className={`input-field ${errors.roomCode ? 'border-red-300 focus:ring-red-500' : ''}`}
                  placeholder="Room Code"
                  maxLength={6}
                />
                {errors.roomCode && (
                  <p className="mt-1 text-sm text-red-600">{errors.roomCode}</p>
                )}
              </div>
              <button
                type="button"
                onClick={handleJoinRoom}
                disabled={isJoining || !playerName.trim() || !roomCode.trim()}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isJoining ? (
                  <div className="flex items-center justify-center">
                    <Loading size="sm" />
                    <span className="ml-2">Joining...</span>
                  </div>
                ) : (
                  'Join Room'
                )}
              </button>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-gray-800">Create Game</h3>
              <div className="h-12 flex items-center">
                <p className="text-sm text-gray-500">
                  Host a new trivia game
                </p>
              </div>
              <button
                type="button"
                onClick={handleCreateRoom}
                disabled={isCreating || !playerName.trim()}
                className="btn-secondary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? (
                  <div className="flex items-center justify-center">
                    <Loading size="sm" />
                    <span className="ml-2">Creating...</span>
                  </div>
                ) : (
                  'Create Room'
                )}
              </button>
            </div>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Made with ❤️ for trivia lovers
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;