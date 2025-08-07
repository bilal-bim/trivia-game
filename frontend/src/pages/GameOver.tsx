import React from 'react';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { resetGame } from '../store/gameSlice';
import PlayerList from '../components/PlayerList';

const GameOver: React.FC = () => {
  const dispatch = useAppDispatch();
  const gameState = useAppSelector(state => state.game);

  const handlePlayAgain = () => {
    dispatch(resetGame());
    // This will trigger a re-render and show the Home component
  };

  const sortedPlayers = [...gameState.players].sort((a, b) => b.score - a.score);
  const winner = sortedPlayers[0];
  const currentPlayer = gameState.players.find(p => 
    p.isHost === gameState.isHost
  );
  const currentPlayerRank = sortedPlayers.findIndex(p => p.id === currentPlayer?.id) + 1;

  const getConfetti = () => {
    return Array.from({ length: 50 }, (_, i) => (
      <div
        key={i}
        className="absolute animate-bounce"
        style={{
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 2}s`,
          animationDuration: `${2 + Math.random() * 2}s`,
        }}
      >
        🎉
      </div>
    ));
  };

  const getRankMessage = (rank: number) => {
    switch (rank) {
      case 1:
        return { message: 'Congratulations! You won!', color: 'text-yellow-600', emoji: '🏆' };
      case 2:
        return { message: 'Great job! Second place!', color: 'text-gray-600', emoji: '🥈' };
      case 3:
        return { message: 'Well played! Third place!', color: 'text-amber-600', emoji: '🥉' };
      default:
        return { message: 'Thanks for playing!', color: 'text-blue-600', emoji: '🎯' };
    }
  };

  const rankInfo = getRankMessage(currentPlayerRank);

  return (
    <div className="min-h-screen py-8 px-4 relative overflow-hidden">
      {/* Confetti Animation */}
      <div className="fixed inset-0 pointer-events-none z-10">
        {getConfetti()}
      </div>

      <div className="max-w-4xl mx-auto relative z-20">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Game Over!
          </h1>
          
          <div className="card max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-6xl mb-4">
                {currentPlayerRank === 1 ? '🏆' : rankInfo.emoji}
              </div>
              <h2 className={`text-2xl font-bold mb-2 ${rankInfo.color}`}>
                {rankInfo.message}
              </h2>
              <p className="text-gray-600">
                You finished in position #{currentPlayerRank} out of {gameState.players.length} players
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <div className="card">
              <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">
                Final Leaderboard
              </h3>
              <PlayerList 
                players={gameState.players}
                showScores={true}
                currentPlayerId={currentPlayer?.id}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Game Statistics
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Questions:</span>
                  <span className="font-medium">{gameState.totalQuestions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Players:</span>
                  <span className="font-medium">{gameState.players.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Winner:</span>
                  <span className="font-medium">{winner?.name || 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Winning Score:</span>
                  <span className="font-medium">{winner?.score || 0} pts</span>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Your Performance
              </h3>
              <div className="space-y-3">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-800">
                    {currentPlayer?.score || 0}
                  </div>
                  <div className="text-sm text-gray-600">Total Points</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-center text-sm">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="font-bold text-gray-800">#{currentPlayerRank}</div>
                    <div className="text-gray-600">Final Rank</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="font-bold text-gray-800">
                      {Math.round((currentPlayer?.score || 0) / gameState.totalQuestions)}
                    </div>
                    <div className="text-gray-600">Avg/Question</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card text-center">
              <button
                onClick={handlePlayAgain}
                className="btn-primary w-full mb-4"
              >
                Play Again
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="btn-secondary w-full"
              >
                New Game
              </button>
            </div>
          </div>
        </div>

        {/* Winner Spotlight */}
        {winner && (
          <div className="card max-w-2xl mx-auto">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                🎉 Congratulations to our winner! 🎉
              </h3>
              
              <div className="flex items-center justify-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                  {winner.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-xl font-bold text-gray-800">{winner.name}</div>
                  <div className="text-lg text-yellow-600 font-semibold">{winner.score} points</div>
                </div>
                <div className="text-4xl">👑</div>
              </div>
              
              <p className="text-gray-600">
                Amazing performance throughout the game!
              </p>
            </div>
          </div>
        )}

        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Thanks for playing! Share this game with your friends.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GameOver;