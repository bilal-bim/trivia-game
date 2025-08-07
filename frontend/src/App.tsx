import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { useAppSelector } from './hooks/redux';
import { useSocket } from './hooks/useSocket';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';
import Lobby from './pages/Lobby';
import Question from './pages/Question';
import Scoreboard from './pages/Scoreboard';
import GameOver from './pages/GameOver';

const GameRouter: React.FC = () => {
  useSocket(); // Initialize socket connection and event handlers
  const gameState = useAppSelector(state => state.game);

  // Route based on game phase
  if (!gameState.roomCode) {
    return <Home />;
  }

  switch (gameState.phase) {
    case 'lobby':
      return <Lobby />;
    case 'question':
      return <Question />;
    case 'scoreboard':
      return <Scoreboard />;
    case 'gameOver':
      return <GameOver />;
    default:
      return <Home />;
  }
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ErrorBoundary>
        <div className="App">
          <GameRouter />
        </div>
      </ErrorBoundary>
    </Provider>
  );
};

export default App;
