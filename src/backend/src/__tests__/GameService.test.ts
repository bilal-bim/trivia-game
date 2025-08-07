import { GameService } from '../services/GameService';
import { createTestGameService } from './setup';

describe('GameService', () => {
  let gameService: GameService;

  beforeEach(() => {
    gameService = createTestGameService();
  });

  afterEach(() => {
    gameService.shutdown();
  });

  describe('createRoom', () => {
    it('should create a new room with valid host name', () => {
      const hostName = 'TestHost';
      const result = gameService.createRoom(hostName);

      expect(result.roomCode).toMatch(/^[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{6}$/);
      expect(result.hostId).toBeDefined();
      expect(typeof result.hostId).toBe('string');
    });

    it('should create unique room codes', () => {
      const result1 = gameService.createRoom('Host1');
      const result2 = gameService.createRoom('Host2');

      expect(result1.roomCode).not.toBe(result2.roomCode);
    });
  });

  describe('joinRoom', () => {
    let roomCode: string;
    let hostId: string;

    beforeEach(() => {
      const result = gameService.createRoom('TestHost');
      roomCode = result.roomCode;
      hostId = result.hostId;
    });

    it('should allow player to join existing room', () => {
      const result = gameService.joinRoom(roomCode, 'Player1');

      expect(result.success).toBe(true);
      expect(result.playerId).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    it('should reject joining non-existent room', () => {
      const result = gameService.joinRoom('INVALID', 'Player1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Room not found');
      expect(result.playerId).toBeUndefined();
    });

    it('should reject duplicate player names', () => {
      gameService.joinRoom(roomCode, 'Player1');
      const result = gameService.joinRoom(roomCode, 'Player1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Player name already taken');
    });
  });

  describe('startGame', () => {
    let roomCode: string;
    let hostId: string;

    beforeEach(() => {
      const result = gameService.createRoom('TestHost');
      roomCode = result.roomCode;
      hostId = result.hostId;
      
      // Add a second player
      gameService.joinRoom(roomCode, 'Player1');
    });

    it('should allow host to start game with enough players', () => {
      const result = gameService.startGame(roomCode, hostId);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject start game with insufficient players', () => {
      // Create a new room with only host
      const newRoom = gameService.createRoom('LonelyHost');
      const result = gameService.startGame(newRoom.roomCode, newRoom.hostId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Need at least 2 players to start');
    });

    it('should reject non-host starting game', () => {
      const playerResult = gameService.joinRoom(roomCode, 'NotHost');
      const result = gameService.startGame(roomCode, playerResult.playerId!);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Only host can start the game');
    });
  });

  describe('startNextQuestion', () => {
    let roomCode: string;
    let hostId: string;

    beforeEach(() => {
      const result = gameService.createRoom('TestHost');
      roomCode = result.roomCode;
      hostId = result.hostId;
      
      gameService.joinRoom(roomCode, 'Player1');
      gameService.startGame(roomCode, hostId);
    });

    it('should start first question successfully', () => {
      const result = gameService.startNextQuestion(roomCode);

      expect(result.success).toBe(true);
      expect(result.question).toBeDefined();
      expect(result.questionNumber).toBe(1);
    });

    it('should progress through questions', () => {
      const result1 = gameService.startNextQuestion(roomCode);
      expect(result1.questionNumber).toBe(1);

      gameService.endQuestion(roomCode);
      
      const result2 = gameService.startNextQuestion(roomCode);
      expect(result2.questionNumber).toBe(2);
    });
  });

  describe('submitAnswer', () => {
    let roomCode: string;
    let hostId: string;
    let playerId: string;

    beforeEach(() => {
      const result = gameService.createRoom('TestHost');
      roomCode = result.roomCode;
      hostId = result.hostId;
      
      const joinResult = gameService.joinRoom(roomCode, 'Player1');
      playerId = joinResult.playerId!;
      
      gameService.startGame(roomCode, hostId);
      gameService.startNextQuestion(roomCode);
    });

    it('should accept valid answer', () => {
      const result = gameService.submitAnswer(playerId, 2);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject duplicate answers', () => {
      gameService.submitAnswer(playerId, 1);
      const result = gameService.submitAnswer(playerId, 2);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Answer already submitted');
    });
  });

  describe('removePlayer', () => {
    let roomCode: string;
    let hostId: string;
    let playerId: string;

    beforeEach(() => {
      const result = gameService.createRoom('TestHost');
      roomCode = result.roomCode;
      hostId = result.hostId;
      
      const joinResult = gameService.joinRoom(roomCode, 'Player1');
      playerId = joinResult.playerId!;
    });

    it('should remove player from room', () => {
      const result = gameService.removePlayer(playerId);

      expect(result.roomCode).toBe(roomCode);
      expect(result.wasHost).toBe(false);
    });

    it('should handle host leaving with other players', () => {
      const result = gameService.removePlayer(hostId);

      expect(result.roomCode).toBe(roomCode);
      expect(result.wasHost).toBe(true);

      // Check if new host was assigned
      const room = gameService.getRoom(roomCode);
      expect(room?.hostId).toBe(playerId);
    });
  });

  describe('getGameStats', () => {
    it('should return current game statistics', () => {
      gameService.createRoom('Host1');
      gameService.createRoom('Host2');

      const stats = gameService.getGameStats();

      expect(stats.totalGames).toBe(2);
      expect(stats.activeGames).toBeGreaterThanOrEqual(0);
      expect(stats.totalPlayers).toBeGreaterThanOrEqual(2);
    });
  });
});