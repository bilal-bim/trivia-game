import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { GameState, Player, Question } from '../types';

const initialState: GameState = {
  roomCode: '',
  players: [],
  currentQuestion: null,
  questionNumber: 0,
  totalQuestions: 0,
  timeLeft: 0,
  phase: 'lobby',
  isHost: false,
  playerAnswer: null,
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setRoomCode: (state, action: PayloadAction<string>) => {
      state.roomCode = action.payload;
    },
    setPlayers: (state, action: PayloadAction<Player[]>) => {
      state.players = action.payload;
    },
    addPlayer: (state, action: PayloadAction<Player>) => {
      state.players.push(action.payload);
    },
    removePlayer: (state, action: PayloadAction<string>) => {
      state.players = state.players.filter(player => player.id !== action.payload);
    },
    setCurrentQuestion: (state, action: PayloadAction<Question>) => {
      state.currentQuestion = action.payload;
      state.playerAnswer = null;
    },
    setQuestionNumber: (state, action: PayloadAction<number>) => {
      state.questionNumber = action.payload;
    },
    setTotalQuestions: (state, action: PayloadAction<number>) => {
      state.totalQuestions = action.payload;
    },
    setTimeLeft: (state, action: PayloadAction<number>) => {
      state.timeLeft = action.payload;
    },
    setPhase: (state, action: PayloadAction<GameState['phase']>) => {
      state.phase = action.payload;
    },
    setIsHost: (state, action: PayloadAction<boolean>) => {
      state.isHost = action.payload;
    },
    setPlayerAnswer: (state, action: PayloadAction<number>) => {
      state.playerAnswer = action.payload;
    },
    updatePlayerScores: (state, action: PayloadAction<{ playerId: string; score: number }[]>) => {
      action.payload.forEach(({ playerId, score }) => {
        const player = state.players.find(p => p.id === playerId);
        if (player) {
          player.score = score;
        }
      });
    },
    resetGame: () => initialState,
  },
});

export const {
  setRoomCode,
  setPlayers,
  addPlayer,
  removePlayer,
  setCurrentQuestion,
  setQuestionNumber,
  setTotalQuestions,
  setTimeLeft,
  setPhase,
  setIsHost,
  setPlayerAnswer,
  updatePlayerScores,
  resetGame,
} = gameSlice.actions;

export default gameSlice.reducer;