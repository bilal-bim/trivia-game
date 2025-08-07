export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
}

export interface Player {
  id: string;
  name: string;
  socketId: string;
  score: number;
  isHost: boolean;
  isActive: boolean;
  joinedAt: Date;
}

export interface GameRoom {
  roomCode: string;
  hostId: string;
  players: Map<string, Player>;
  questions: Question[];
  currentQuestionIndex: number;
  gameState: GameState;
  createdAt: Date;
  gameStartedAt?: Date;
  settings: GameSettings;
  currentAnswers: Map<string, PlayerAnswer>;
  questionStartTime?: Date;
  scores: Map<string, number>;
}

export interface GameSettings {
  maxPlayers: number;
  questionTimeLimit: number; // seconds
  totalQuestions: number;
  timeBonus: boolean;
}

export interface PlayerAnswer {
  playerId: string;
  answer: number;
  submittedAt: Date;
  timeElapsed: number; // milliseconds
}

export type GameState = 
  | 'waiting'     // Waiting for players to join
  | 'starting'    // Game is about to start
  | 'question'    // Question is active
  | 'results'     // Showing question results
  | 'finished'    // Game completed
  | 'abandoned';  // Game abandoned

export interface QuestionResult {
  questionId: string;
  correctAnswer: number;
  playerResults: PlayerQuestionResult[];
  totalAnswers: number;
}

export interface PlayerQuestionResult {
  playerId: string;
  playerName: string;
  answer: number;
  isCorrect: boolean;
  pointsEarned: number;
  timeElapsed: number;
}

export interface GameStats {
  totalGames: number;
  activeGames: number;
  totalPlayers: number;
  averageGameDuration: number;
}

// Socket.IO Event Types
export interface ServerToClientEvents {
  'room-created': (data: { roomCode: string; hostId: string }) => void;
  'room-joined': (data: { roomCode: string; playerId: string; playerName: string }) => void;
  'player-joined': (data: { player: Omit<Player, 'socketId'> }) => void;
  'player-left': (data: { playerId: string; playerName: string }) => void;
  'game-started': (data: { totalQuestions: number; timeLimit: number }) => void;
  'question-start': (data: { 
    question: Omit<Question, 'correctAnswer'>; 
    questionNumber: number; 
    totalQuestions: number; 
    timeLimit: number;
  }) => void;
  'time-update': (data: { timeRemaining: number }) => void;
  'question-end': (data: { 
    results: QuestionResult; 
    leaderboard: { playerId: string; playerName: string; score: number }[];
  }) => void;
  'game-over': (data: { 
    finalScores: { playerId: string; playerName: string; score: number }[];
    gameStats: { totalQuestions: number; duration: number };
  }) => void;
  'error': (data: { message: string; code?: string }) => void;
  'players-update': (data: { players: Omit<Player, 'socketId'>[] }) => void;
}

export interface ClientToServerEvents {
  'create-room': (data: { playerName: string }, callback: (response: { success: boolean; roomCode?: string; playerId?: string; error?: string }) => void) => void;
  'join-room': (data: { roomCode: string; playerName: string }, callback: (response: { success: boolean; playerId?: string; error?: string }) => void) => void;
  'start-game': (callback: (response: { success: boolean; error?: string }) => void) => void;
  'submit-answer': (data: { answer: number }, callback: (response: { success: boolean; error?: string }) => void) => void;
  'next-question': (callback: (response: { success: boolean; error?: string }) => void) => void;
  'disconnect': () => void;
}

// API Request/Response Types
export interface CreateGameRequest {
  playerName: string;
}

export interface CreateGameResponse {
  success: boolean;
  roomCode?: string;
  playerId?: string;
  error?: string;
}

export interface JoinGameRequest {
  roomCode: string;
  playerName: string;
}

export interface JoinGameResponse {
  success: boolean;
  playerId?: string;
  error?: string;
}