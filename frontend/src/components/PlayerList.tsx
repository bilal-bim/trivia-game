import React from 'react';
import type { Player } from '../types';

interface PlayerListProps {
  players: Player[];
  showScores?: boolean;
  currentPlayerId?: string;
}

const PlayerList: React.FC<PlayerListProps> = ({ 
  players, 
  showScores = false, 
  currentPlayerId 
}) => {
  const sortedPlayers = showScores 
    ? [...players].sort((a, b) => b.score - a.score)
    : players;

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return (
          <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-white font-bold">
            1
          </div>
        );
      case 1:
        return (
          <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold">
            2
          </div>
        );
      case 2:
        return (
          <div className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center text-white font-bold">
            3
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center text-white font-bold">
            {index + 1}
          </div>
        );
    }
  };

  const getPlayerClasses = (player: Player, index: number) => {
    let baseClasses = 'flex items-center justify-between p-3 rounded-lg transition-all duration-200';
    
    if (player.id === currentPlayerId) {
      baseClasses += ' bg-primary-100 border-2 border-primary-300';
    } else {
      baseClasses += ' bg-white border border-gray-200';
    }
    
    if (showScores && index === 0) {
      baseClasses += ' ring-2 ring-yellow-400 shadow-lg';
    }
    
    return baseClasses;
  };

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">
        Players ({players.length})
      </h3>
      
      {sortedPlayers.map((player, index) => (
        <div
          key={player.id}
          className={getPlayerClasses(player, index)}
        >
          <div className="flex items-center space-x-3">
            {showScores && getRankIcon(index)}
            
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                {player.name.charAt(0).toUpperCase()}
              </div>
              
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-800">{player.name}</span>
                  {player.isHost && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                      Host
                    </span>
                  )}
                  {player.id === currentPlayerId && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                      You
                    </span>
                  )}
                </div>
                
                {showScores && (
                  <div className="text-sm text-gray-600">
                    {player.score} points
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {showScores && (
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-800">
                {player.score}
              </div>
              <div className="text-xs text-gray-500">
                points
              </div>
            </div>
          )}
          
          {!showScores && (
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="ml-2 text-sm text-green-600">Online</span>
            </div>
          )}
        </div>
      ))}
      
      {players.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
          <p>No players yet</p>
        </div>
      )}
    </div>
  );
};

export default PlayerList;