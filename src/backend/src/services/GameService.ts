import { v4 as uuidv4 } from 'uuid';
import { GameRoom, Player, Question, GameState, PlayerAnswer, QuestionResult, PlayerQuestionResult, GameSettings } from '../types';
import { generateRoomCode } from '../utils/roomCodeGenerator';
import { calculatePoints, calculateLeaderboard, isCorrectAnswer } from '../utils/scoring';
import questionsData from '../data/questions.json';

export class GameService {
  private gameRooms: Map<string, GameRoom> = new Map();
  private playerToRoom: Map<string, string> = new Map();
  private questions: Question[] = questionsData as Question[];
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up finished games every hour
    this.cleanupInterval = setInterval(() => {
      this.cleanupOldGames();
    }, 60 * 60 * 1000);
  }

  /**
   * Create a new game room
   */
  createRoom(hostName: string): { roomCode: string; hostId: string } {
    const roomCode = this.generateUniqueRoomCode();
    const hostId = uuidv4();
    
    const host: Player = {
      id: hostId,
      name: hostName,
      socketId: '',
      score: 0,
      isHost: true,
      isActive: true,
      joinedAt: new Date()
    };

    const gameRoom: GameRoom = {
      roomCode,
      hostId,
      players: new Map([[hostId, host]]),
      questions: this.getRandomQuestions(10), // Default 10 questions
      currentQuestionIndex: -1,
      gameState: 'waiting' as const,  // Explicitly set as const
      createdAt: new Date(),
      gameStartedAt: undefined,  // Explicitly set as undefined
      settings: {
        maxPlayers: 20,
        questionTimeLimit: 30,
        totalQuestions: 10,
        timeBonus: true
      },
      currentAnswers: new Map(),
      scores: new Map([[hostId, 0]])
    };
    
    console.log(`Room ${roomCode} created with state: ${gameRoom.gameState}, questionIndex: ${gameRoom.currentQuestionIndex}`);

    this.gameRooms.set(roomCode, gameRoom);
    this.playerToRoom.set(hostId, roomCode);

    return { roomCode, hostId };
  }

  /**
   * Join an existing game room
   */
  joinRoom(roomCode: string, playerName: string): { success: boolean; playerId?: string; error?: string } {
    const room = this.gameRooms.get(roomCode);
    
    if (!room) {
      return { success: false, error: 'Room not found' };
    }

    console.log(`Join room attempt - Room ${roomCode} state: ${room.gameState}`);
    console.log(`Room details: players=${room.players.size}, started=${room.gameStartedAt}, questionIndex=${room.currentQuestionIndex}`);

    if (room.gameState !== 'waiting') {
      console.log(`Cannot join room ${roomCode} - game state is ${room.gameState}, not 'waiting'`);
      // Reset room state if game hasn't actually started
      if (!room.gameStartedAt && room.currentQuestionIndex === -1) {
        console.log(`Resetting room ${roomCode} state to 'waiting' (was incorrectly set to ${room.gameState})`);
        room.gameState = 'waiting';
      } else {
        return { success: false, error: 'Game already started' };
      }
    }

    if (room.players.size >= room.settings.maxPlayers) {
      return { success: false, error: 'Room is full' };
    }

    // Check if player name already exists in room
    const existingPlayer = Array.from(room.players.values()).find(p => p.name === playerName);
    if (existingPlayer) {
      return { success: false, error: 'Player name already taken' };
    }

    const playerId = uuidv4();
    const player: Player = {
      id: playerId,
      name: playerName,
      socketId: '',
      score: 0,
      isHost: false,
      isActive: true,
      joinedAt: new Date()
    };

    room.players.set(playerId, player);
    room.scores.set(playerId, 0);
    this.playerToRoom.set(playerId, roomCode);

    return { success: true, playerId };
  }

  /**
   * Start the game
   */
  startGame(roomCode: string, hostId: string): { success: boolean; error?: string } {
    const room = this.gameRooms.get(roomCode);
    
    if (!room) {
      return { success: false, error: 'Room not found' };
    }

    if (room.hostId !== hostId) {
      return { success: false, error: 'Only host can start the game' };
    }

    if (room.gameState !== 'waiting') {
      return { success: false, error: 'Game already started' };
    }

    if (room.players.size < 2) {
      return { success: false, error: 'Need at least 2 players to start' };
    }

    room.gameState = 'starting';
    room.gameStartedAt = new Date();
    
    return { success: true };
  }

  /**
   * Start the next question
   */
  startNextQuestion(roomCode: string): { success: boolean; question?: Question; questionNumber?: number; error?: string } {
    const room = this.gameRooms.get(roomCode);
    
    if (!room) {
      return { success: false, error: 'Room not found' };
    }

    if (room.gameState === 'finished') {
      return { success: false, error: 'Game already finished' };
    }

    // Make sure game has been started before changing to question state
    if (room.gameState === 'waiting') {
      console.error(`ERROR: Trying to start next question but game is still in 'waiting' state for room ${roomCode}`);
      return { success: false, error: 'Game not started yet' };
    }

    room.currentQuestionIndex++;
    
    if (room.currentQuestionIndex >= room.questions.length) {
      room.gameState = 'finished';
      return { success: false, error: 'No more questions' };
    }

    room.gameState = 'question';
    room.currentAnswers.clear();
    room.questionStartTime = new Date();
    
    const question = room.questions[room.currentQuestionIndex];
    
    return { 
      success: true, 
      question,
      questionNumber: room.currentQuestionIndex + 1
    };
  }

  /**
   * Submit an answer
   */
  submitAnswer(playerId: string, answer: number): { success: boolean; error?: string } {
    const roomCode = this.playerToRoom.get(playerId);
    
    if (!roomCode) {
      return { success: false, error: 'Player not in any room' };
    }

    const room = this.gameRooms.get(roomCode);
    if (!room) {
      return { success: false, error: 'Room not found' };
    }

    if (room.gameState !== 'question') {
      return { success: false, error: 'No active question' };
    }

    if (room.currentAnswers.has(playerId)) {
      return { success: false, error: 'Answer already submitted' };
    }

    const timeElapsed = room.questionStartTime ? 
      Date.now() - room.questionStartTime.getTime() : 0;

    const playerAnswer: PlayerAnswer = {
      playerId,
      answer,
      submittedAt: new Date(),
      timeElapsed
    };

    room.currentAnswers.set(playerId, playerAnswer);
    
    return { success: true };
  }

  /**
   * End current question and calculate results
   */
  endQuestion(roomCode: string): { success: boolean; results?: QuestionResult; leaderboard?: any[]; error?: string } {
    const room = this.gameRooms.get(roomCode);
    
    if (!room) {
      return { success: false, error: 'Room not found' };
    }

    if (room.gameState !== 'question') {
      return { success: false, error: 'No active question' };
    }

    const currentQuestion = room.questions[room.currentQuestionIndex];
    const playerResults: PlayerQuestionResult[] = [];

    // Calculate results for each player
    Array.from(room.players.values()).forEach(player => {
      const answer = room.currentAnswers.get(player.id);
      const isCorrect = answer ? isCorrectAnswer(answer.answer, currentQuestion) : false;
      const pointsEarned = answer && isCorrect ? calculatePoints(answer, currentQuestion, room.settings) : 0;

      // Update player score
      const currentScore = room.scores.get(player.id) || 0;
      room.scores.set(player.id, currentScore + pointsEarned);

      playerResults.push({
        playerId: player.id,
        playerName: player.name,
        answer: answer?.answer ?? -1,
        isCorrect,
        pointsEarned,
        timeElapsed: answer?.timeElapsed ?? room.settings.questionTimeLimit * 1000
      });
    });

    const results: QuestionResult = {
      questionId: currentQuestion.id,
      correctAnswer: currentQuestion.correctAnswer,
      playerResults,
      totalAnswers: room.currentAnswers.size
    };

    const leaderboard = calculateLeaderboard(room.scores, room.players);
    
    room.gameState = 'results';
    
    return { success: true, results, leaderboard };
  }

  /**
   * Check if game is finished
   */
  isGameFinished(roomCode: string): boolean {
    const room = this.gameRooms.get(roomCode);
    if (!room) return true;
    
    return room.currentQuestionIndex >= room.questions.length - 1;
  }

  /**
   * Finish the game
   */
  finishGame(roomCode: string): { success: boolean; finalScores?: any[]; gameStats?: any; error?: string } {
    const room = this.gameRooms.get(roomCode);
    
    if (!room) {
      return { success: false, error: 'Room not found' };
    }

    room.gameState = 'finished';
    
    const finalScores = calculateLeaderboard(room.scores, room.players);
    const gameStats = {
      totalQuestions: room.questions.length,
      duration: room.gameStartedAt ? Date.now() - room.gameStartedAt.getTime() : 0
    };

    return { success: true, finalScores, gameStats };
  }

  /**
   * Remove player from room
   */
  removePlayer(playerId: string): { roomCode?: string; wasHost?: boolean } {
    const roomCode = this.playerToRoom.get(playerId);
    
    if (!roomCode) {
      return {};
    }

    const room = this.gameRooms.get(roomCode);
    if (!room) {
      return {};
    }

    const player = room.players.get(playerId);
    const wasHost = player?.isHost || false;

    room.players.delete(playerId);
    room.scores.delete(playerId);
    room.currentAnswers.delete(playerId);
    this.playerToRoom.delete(playerId);

    // If host left and there are other players, assign new host
    if (wasHost && room.players.size > 0) {
      const newHost = Array.from(room.players.values())[0];
      newHost.isHost = true;
      room.hostId = newHost.id;
    }

    // If no players left, mark room for cleanup
    if (room.players.size === 0) {
      room.gameState = 'abandoned';
    }

    return { roomCode, wasHost };
  }

  /**
   * Get room information
   */
  getRoom(roomCode: string): GameRoom | undefined {
    return this.gameRooms.get(roomCode);
  }

  /**
   * Get player's room code
   */
  getPlayerRoom(playerId: string): string | undefined {
    return this.playerToRoom.get(playerId);
  }

  /**
   * Update player socket ID
   */
  updatePlayerSocket(playerId: string, socketId: string): void {
    const roomCode = this.playerToRoom.get(playerId);
    if (roomCode) {
      const room = this.gameRooms.get(roomCode);
      if (room) {
        const player = room.players.get(playerId);
        if (player) {
          player.socketId = socketId;
        }
      }
    }
  }

  /**
   * Get all active players in a room (without socket IDs)
   */
  getRoomPlayers(roomCode: string): Omit<Player, 'socketId'>[] {
    const room = this.gameRooms.get(roomCode);
    if (!room) return [];

    return Array.from(room.players.values()).map(player => ({
      id: player.id,
      name: player.name,
      score: player.score,
      isHost: player.isHost,
      isActive: player.isActive,
      joinedAt: player.joinedAt
    }));
  }

  /**
   * Generate unique room code
   */
  private generateUniqueRoomCode(): string {
    let roomCode: string;
    do {
      roomCode = generateRoomCode();
    } while (this.gameRooms.has(roomCode));
    
    return roomCode;
  }

  /**
   * Get random questions for a game
   */
  private getRandomQuestions(count: number): Question[] {
    const shuffled = [...this.questions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, this.questions.length));
  }

  /**
   * Clean up old games
   */
  private cleanupOldGames(): void {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    
    for (const [roomCode, room] of this.gameRooms.entries()) {
      const shouldCleanup = 
        room.gameState === 'abandoned' ||
        room.gameState === 'finished' ||
        room.createdAt.getTime() < oneHourAgo;

      if (shouldCleanup) {
        // Clean up player mappings
        Array.from(room.players.keys()).forEach(playerId => {
          this.playerToRoom.delete(playerId);
        });
        
        this.gameRooms.delete(roomCode);
        console.log(`Cleaned up room: ${roomCode}`);
      }
    }
  }

  /**
   * Get game statistics
   */
  getGameStats() {
    const totalGames = this.gameRooms.size;
    const activeGames = Array.from(this.gameRooms.values())
      .filter(room => room.gameState === 'question' || room.gameState === 'results').length;
    const totalPlayers = Array.from(this.gameRooms.values())
      .reduce((sum, room) => sum + room.players.size, 0);

    return {
      totalGames,
      activeGames,
      totalPlayers,
      averageGameDuration: 0 // Could be calculated from completed games
    };
  }

  /**
   * Cleanup on shutdown
   */
  shutdown(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}