export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

export const GAME_CONFIG = {
  MIN_PLAYERS: 2,
  MAX_PLAYERS: 8,
  ROOM_CODE_LENGTH: 6,
  DEFAULT_QUESTION_TIME: 30,
  DEFAULT_TOTAL_QUESTIONS: 10,
};

export const STORAGE_KEYS = {
  PLAYER_NAME: 'trivia_player_name',
  LAST_ROOM: 'trivia_last_room',
};

export const COLORS = {
  primary: '#3b82f6',
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  gray: '#6b7280',
};