import React, { useCallback } from 'react';
import { useSocket } from '../hooks/useSocket';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { setPlayerAnswer } from '../store/gameSlice';
import AnswerButton from '../components/AnswerButton';
import TimerBar from '../components/TimerBar';

const Question: React.FC = () => {
  const dispatch = useAppDispatch();
  const { submitAnswer } = useSocket();
  const gameState = useAppSelector(state => state.game);

  const handleAnswerSelect = useCallback((answerIndex: number) => {
    if (gameState.playerAnswer !== null) return; // Already answered
    
    dispatch(setPlayerAnswer(answerIndex));
    submitAnswer(answerIndex);
  }, [gameState.playerAnswer, dispatch, submitAnswer]);

  if (!gameState.currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading question...</p>
          </div>
        </div>
      </div>
    );
  }

  const { question, options } = gameState.currentQuestion;
  const isAnswered = gameState.playerAnswer !== null;

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm font-medium text-gray-600">
              Question {gameState.questionNumber} of {gameState.totalQuestions}
            </div>
            <div className="text-sm font-medium text-gray-600">
              {gameState.players.length} players
            </div>
          </div>
          
          <TimerBar 
            timeLeft={gameState.timeLeft}
            totalTime={gameState.currentQuestion.timeLimit}
            isActive={!isAnswered}
          />
        </div>

        <div className="card mb-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 leading-tight">
              {question}
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {options.map((option, index) => (
              <AnswerButton
                key={index}
                option={option}
                index={index}
                isSelected={gameState.playerAnswer === index}
                onClick={handleAnswerSelect}
                disabled={isAnswered}
              />
            ))}
          </div>

          {isAnswered && (
            <div className="mt-8 text-center">
              <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-lg">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Answer submitted! Waiting for others...
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {gameState.players.map((player) => (
            <div
              key={player.id}
              className="card text-center"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-2">
                {player.name.charAt(0).toUpperCase()}
              </div>
              <div className="text-sm font-medium text-gray-800 truncate" title={player.name}>
                {player.name}
              </div>
              <div className="text-xs text-gray-600">
                {player.score} pts
              </div>
              <div className="mt-2 flex items-center justify-center">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="ml-1 text-xs text-green-600">
                  {/* You could show answering status here if available from backend */}
                  Online
                </span>
              </div>
            </div>
          ))}
        </div>

        {gameState.timeLeft <= 5 && gameState.timeLeft > 0 && !isAnswered && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 text-center">
              <div className="text-6xl font-bold text-red-600 animate-bounce mb-4">
                {gameState.timeLeft}
              </div>
              <p className="text-lg text-gray-600">
                Time's running out!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Question;