import React, { useState } from 'react';
import { useSocket } from '../hooks/useSocket';
import { useAppSelector } from '../hooks/redux';
import PlayerList from '../components/PlayerList';
import AnswerButton from '../components/AnswerButton';
import Loading from '../components/Loading';

const Scoreboard: React.FC = () => {
  const [isAdvancing, setIsAdvancing] = useState(false);
  const { nextQuestion } = useSocket();
  const gameState = useAppSelector(state => state.game);

  const handleNextQuestion = () => {
    setIsAdvancing(true);
    nextQuestion();
  };

  const currentPlayer = gameState.players.find(p => 
    // Assuming we have some way to identify current player - you might need to adjust this
    p.isHost === gameState.isHost
  );

  const correctAnswer = gameState.currentQuestion?.correctAnswer ?? -1;
  const playerAnswer = gameState.playerAnswer;

  const isCorrect = playerAnswer === correctAnswer;
  const sortedPlayers = [...gameState.players].sort((a, b) => b.score - a.score);
  const currentRank = sortedPlayers.findIndex(p => p.id === currentPlayer?.id) + 1;

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Question {gameState.questionNumber} Results
          </h1>
          <div className="text-gray-600">
            {gameState.questionNumber} of {gameState.totalQuestions} complete
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Question & Answer
            </h3>
            
            {gameState.currentQuestion && (
              <div className="space-y-4">
                <p className="text-gray-700 font-medium">
                  {gameState.currentQuestion.question}
                </p>
                
                <div className="space-y-2">
                  {gameState.currentQuestion.options.map((option, index) => (
                    <AnswerButton
                      key={index}
                      option={option}
                      index={index}
                      isSelected={playerAnswer === index}
                      isCorrect={index === correctAnswer}
                      isRevealed={true}
                      onClick={() => {}}
                      disabled={true}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Your Performance
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                {isCorrect ? (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-3">
                      <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-lg font-semibold text-green-600">Correct!</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-3">
                      <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-lg font-semibold text-red-600">Incorrect</p>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-gray-800">
                    {currentPlayer?.score || 0}
                  </div>
                  <div className="text-sm text-gray-600">Total Points</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-gray-800">
                    #{currentRank}
                  </div>
                  <div className="text-sm text-gray-600">Current Rank</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card mb-8">
          <PlayerList 
            players={gameState.players}
            showScores={true}
            currentPlayerId={currentPlayer?.id}
          />
        </div>

        {gameState.isHost && (
          <div className="text-center">
            {gameState.questionNumber < gameState.totalQuestions ? (
              <button
                onClick={handleNextQuestion}
                disabled={isAdvancing}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAdvancing ? (
                  <div className="flex items-center justify-center">
                    <Loading size="sm" />
                    <span className="ml-2">Loading Next Question...</span>
                  </div>
                ) : (
                  'Next Question'
                )}
              </button>
            ) : (
              <div className="card max-w-md mx-auto">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Game Complete!
                  </h3>
                  <p className="text-gray-600 mb-4">
                    All questions have been answered. See final results!
                  </p>
                  <button
                    onClick={handleNextQuestion}
                    disabled={isAdvancing}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAdvancing ? (
                      <div className="flex items-center justify-center">
                        <Loading size="sm" />
                        <span className="ml-2">Loading Results...</span>
                      </div>
                    ) : (
                      'View Final Results'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {!gameState.isHost && (
          <div className="text-center">
            <div className="card max-w-md mx-auto">
              <div className="text-center">
                <Loading size="sm" />
                <p className="text-gray-600 mt-2">
                  Waiting for host to continue...
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Scoreboard;