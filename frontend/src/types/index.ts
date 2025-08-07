export interface Player {
  id: string;
  name: string;
  score: number;
  isHost: boolean;
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  timeLimit: number;
}

export interface GameState {
  roomCode: string;
  players: Player[];
  currentQuestion: Question | null;
  questionNumber: number;
  totalQuestions: number;
  timeLeft: number;
  phase: 'lobby' | 'question' | 'scoreboard' | 'gameOver';
  isHost: boolean;
  playerAnswer: number | null;
}

export interface SocketEvents {
  // Client to Server
  'join-room': { roomCode: string; playerName: string };
  'create-room': { playerName: string };
  'start-game': {};
  'submit-answer': { answer: number };
  'next-question': {};
  
  // Server to Client
  'room-joined': { roomCode: string; player: Player; players: Player[] };
  'room-created': { roomCode: string; player: Player };
  'player-joined': { player: Player; players: Player[] };
  'player-left': { playerId: string; players: Player[] };
  'game-started': {};
  'question-start': { question: Question; questionNumber: number; totalQuestions: number };
  'time-update': { timeLeft: number };
  'question-end': { correctAnswer: number; scores: { playerId: string; score: number }[] };
  'game-over': { finalScores: Player[] };
  'error': { message: string };
}

export type GamePhase = 'lobby' | 'question' | 'scoreboard' | 'gameOver';