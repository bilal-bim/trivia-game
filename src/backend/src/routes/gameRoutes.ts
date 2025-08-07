import { Router, Request, Response } from 'express';
import { GameService } from '../services/GameService';
import { CreateGameRequest, CreateGameResponse, JoinGameRequest, JoinGameResponse } from '../types';
import { createGameSchema, joinGameSchema, sanitizePlayerName, sanitizeRoomCode } from '../utils/validation';

export function createGameRoutes(gameService: GameService): Router {
  const router = Router();

  /**
   * POST /create-game
   * Create a new game room
   */
  router.post('/create-game', async (req: Request<{}, CreateGameResponse, CreateGameRequest>, res: Response<CreateGameResponse>) => {
    try {
      const { error, value } = createGameSchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          success: false,
          error: error.details[0].message
        });
      }

      const playerName = sanitizePlayerName(value.playerName);
      const { roomCode, hostId } = gameService.createRoom(playerName);

      res.status(201).json({
        success: true,
        roomCode,
        playerId: hostId
      });

      console.log(`REST API: Room created - ${roomCode} by ${playerName}`);
    } catch (error) {
      console.error('Error creating game via REST API:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  /**
   * POST /join-game
   * Join an existing game room
   */
  router.post('/join-game', async (req: Request<{}, JoinGameResponse, JoinGameRequest>, res: Response<JoinGameResponse>) => {
    try {
      const { error, value } = joinGameSchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          success: false,
          error: error.details[0].message
        });
      }

      const roomCode = sanitizeRoomCode(value.roomCode);
      const playerName = sanitizePlayerName(value.playerName);
      
      const result = gameService.joinRoom(roomCode, playerName);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error
        });
      }

      res.status(200).json({
        success: true,
        playerId: result.playerId
      });

      console.log(`REST API: Player ${playerName} joined room ${roomCode}`);
    } catch (error) {
      console.error('Error joining game via REST API:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  /**
   * GET /game-stats
   * Get current game statistics
   */
  router.get('/game-stats', (req: Request, res: Response) => {
    try {
      const stats = gameService.getGameStats();
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error getting game stats:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  /**
   * GET /room/:roomCode
   * Get room information (for debugging/admin purposes)
   */
  router.get('/room/:roomCode', (req: Request, res: Response) => {
    try {
      const roomCode = sanitizeRoomCode(req.params.roomCode);
      const room = gameService.getRoom(roomCode);
      
      if (!room) {
        return res.status(404).json({
          success: false,
          error: 'Room not found'
        });
      }

      // Return room info without sensitive data
      const roomInfo = {
        roomCode: room.roomCode,
        playerCount: room.players.size,
        gameState: room.gameState,
        currentQuestion: room.currentQuestionIndex + 1,
        totalQuestions: room.questions.length,
        createdAt: room.createdAt,
        gameStartedAt: room.gameStartedAt
      };

      res.status(200).json({
        success: true,
        data: roomInfo
      });
    } catch (error) {
      console.error('Error getting room info:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  /**
   * GET /health
   * Health check endpoint
   */
  router.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: 'Trivia Game Backend is running',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });

  return router;
}