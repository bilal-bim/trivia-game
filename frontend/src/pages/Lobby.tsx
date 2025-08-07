import React, { useState } from 'react';
import { useSocket } from '../hooks/useSocket';
import { useAppSelector } from '../hooks/redux';
import PlayerList from '../components/PlayerList';
import Loading from '../components/Loading';

const Lobby: React.FC = () => {
  const [isStarting, setIsStarting] = useState(false);
  const { startGame } = useSocket();
  const gameState = useAppSelector(state => state.game);

  const handleStartGame = () => {
    if (gameState.players.length < 2) {
      alert('You need at least 2 players to start the game!');
      return;
    }
    
    setIsStarting(true);
    startGame();
  };

  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(gameState.roomCode);
      // You might want to show a toast notification here
      alert('Room code copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy room code:', error);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Game Lobby
          </h1>
          <div className="flex items-center justify-center space-x-4">
            <div className="card inline-flex items-center space-x-3">
              <span className="text-gray-600">Room Code:</span>
              <span className="text-2xl font-mono font-bold text-primary-600">
                {gameState.roomCode}
              </span>
              <button
                onClick={copyRoomCode}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Copy room code"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="card">
              <PlayerList 
                players={gameState.players}
                currentPlayerId={gameState.players.find(p => p.isHost === gameState.isHost)?.id}
              />
              
              {gameState.players.length < 2 && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="text-yellow-800">
                      Waiting for more players to join (minimum 2 required)
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Game Info
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Players:</span>
                  <span className="font-medium">{gameState.players.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium text-green-600">Waiting</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Questions:</span>
                  <span className="font-medium">10</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time per question:</span>
                  <span className="font-medium">30s</span>
                </div>
              </div>
            </div>

            {gameState.isHost && (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Host Controls
                </h3>
                <button
                  onClick={handleStartGame}
                  disabled={gameState.players.length < 2 || isStarting}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isStarting ? (
                    <div className="flex items-center justify-center">
                      <Loading size="sm" />
                      <span className="ml-2">Starting Game...</span>
                    </div>
                  ) : (
                    'Start Game'
                  )}
                </button>
                
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Make sure all players are ready!
                </p>
              </div>
            )}

            {!gameState.isHost && (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Waiting for Host
                </h3>
                <div className="text-center">
                  <Loading size="sm" />
                  <p className="text-sm text-gray-600 mt-2">
                    The host will start the game when ready
                  </p>
                </div>
              </div>
            )}

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                How to Play
              </h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">1.</span>
                  Answer questions as quickly as possible
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">2.</span>
                  Faster correct answers earn more points
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">3.</span>
                  See your ranking after each question
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">4.</span>
                  The player with the most points wins!
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lobby;