import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { GameService } from './GameService';
import { ServerToClientEvents, ClientToServerEvents } from '../types';
import { sanitizePlayerName, sanitizeRoomCode, createGameSchema, joinGameSchema, submitAnswerSchema } from '../utils/validation';

export class SocketService {
  private io: SocketIOServer<ClientToServerEvents, ServerToClientEvents>;
  private gameService: GameService;
  private questionTimers: Map<string, NodeJS.Timeout> = new Map();
  private socketToPlayer: Map<string, string> = new Map(); // socketId -> playerId

  constructor(server: HTTPServer, gameService: GameService) {
    this.gameService = gameService;
    
    const allowedOrigins = process.env.NODE_ENV === 'production' 
      ? [process.env.FRONTEND_URL || 'https://your-app.vercel.app']
      : ["http://localhost:3000", "http://localhost:3003", "http://localhost:3004", "http://127.0.0.1:3000", "http://127.0.0.1:3003", "http://127.0.0.1:3004"];
    
    this.io = new SocketIOServer(server, {
      cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
      console.log(`Client connected: ${socket.id}`);

      // Create room event
      socket.on('create-room', async (data, callback) => {
        try {
          const { error, value } = createGameSchema.validate(data);
          if (error) {
            callback({ success: false, error: error.details[0].message });
            return;
          }

          const playerName = sanitizePlayerName(value.playerName);
          const { roomCode, hostId } = this.gameService.createRoom(playerName);
          
          // Update player socket ID
          this.gameService.updatePlayerSocket(hostId, socket.id);
          this.socketToPlayer.set(socket.id, hostId);
          
          // Join socket room
          await socket.join(roomCode);
          
          callback({ success: true, roomCode, playerId: hostId });
          
          // Emit room created event
          socket.emit('room-created', { roomCode, hostId });
          
          // Send initial players update
          const players = this.gameService.getRoomPlayers(roomCode);
          console.log(`Sending initial players-update for room ${roomCode}, players:`, players);
          socket.emit('players-update', { players });
          
          console.log(`Room created: ${roomCode} by ${playerName} (${hostId})`);
        } catch (error) {
          console.error('Error creating room:', error);
          callback({ success: false, error: 'Failed to create room' });
        }
      });

      // Join room event
      socket.on('join-room', async (data, callback) => {
        try {
          const { error, value } = joinGameSchema.validate(data);
          if (error) {
            callback({ success: false, error: error.details[0].message });
            return;
          }

          const roomCode = sanitizeRoomCode(value.roomCode);
          const playerName = sanitizePlayerName(value.playerName);
          
          const result = this.gameService.joinRoom(roomCode, playerName);
          
          if (!result.success) {
            callback({ success: false, error: result.error });
            return;
          }

          // Update player socket ID
          this.gameService.updatePlayerSocket(result.playerId!, socket.id);
          this.socketToPlayer.set(socket.id, result.playerId!);
          
          // Join socket room
          await socket.join(roomCode);
          
          callback({ success: true, playerId: result.playerId });
          
          // Get player info
          const room = this.gameService.getRoom(roomCode);
          const player = room?.players.get(result.playerId!);
          
          if (player) {
            // Notify all players about the new player
            socket.to(roomCode).emit('player-joined', { 
              player: {
                id: player.id,
                name: player.name,
                score: player.score,
                isHost: player.isHost,
                isActive: player.isActive,
                joinedAt: player.joinedAt
              }
            });
            
            // Send room joined confirmation to the player
            socket.emit('room-joined', { 
              roomCode, 
              playerId: result.playerId!, 
              playerName: player.name 
            });
            
            // Send updated players list to all players
            const players = this.gameService.getRoomPlayers(roomCode);
            console.log(`Sending players-update to room ${roomCode}, players:`, players);
            this.io.to(roomCode).emit('players-update', { players });
            
            // Debug: Check who's in the room
            const socketsInRoom = await this.io.in(roomCode).fetchSockets();
            console.log(`Sockets in room ${roomCode}:`, socketsInRoom.map(s => s.id));
          }
          
          console.log(`Player ${playerName} (${result.playerId}) joined room ${roomCode}`);
        } catch (error) {
          console.error('Error joining room:', error);
          callback({ success: false, error: 'Failed to join room' });
        }
      });

      // Start game event
      socket.on('start-game', async (callback) => {
        try {
          const playerId = this.getPlayerIdFromSocket(socket);
          if (!playerId) {
            callback({ success: false, error: 'Player not found' });
            return;
          }

          const roomCode = this.gameService.getPlayerRoom(playerId);
          if (!roomCode) {
            callback({ success: false, error: 'Room not found' });
            return;
          }

          const result = this.gameService.startGame(roomCode, playerId);
          if (!result.success) {
            callback({ success: false, error: result.error });
            return;
          }

          callback({ success: true });

          const room = this.gameService.getRoom(roomCode);
          if (room) {
            // Notify all players that game started
            this.io.to(roomCode).emit('game-started', {
              totalQuestions: room.settings.totalQuestions,
              timeLimit: room.settings.questionTimeLimit
            });

            // Start first question after a short delay
            setTimeout(() => {
              this.startNextQuestion(roomCode);
            }, 3000);
          }

          console.log(`Game started in room ${roomCode}`);
        } catch (error) {
          console.error('Error starting game:', error);
          callback({ success: false, error: 'Failed to start game' });
        }
      });

      // Submit answer event
      socket.on('submit-answer', async (data, callback) => {
        try {
          const { error, value } = submitAnswerSchema.validate(data);
          if (error) {
            callback({ success: false, error: error.details[0].message });
            return;
          }

          const playerId = this.getPlayerIdFromSocket(socket);
          if (!playerId) {
            callback({ success: false, error: 'Player not found' });
            return;
          }

          const result = this.gameService.submitAnswer(playerId, value.answer);
          callback({ success: result.success, error: result.error });

          if (result.success) {
            console.log(`Player ${playerId} submitted answer: ${value.answer}`);
          }
        } catch (error) {
          console.error('Error submitting answer:', error);
          callback({ success: false, error: 'Failed to submit answer' });
        }
      });

      // Next question event (host only)
      socket.on('next-question', async (callback) => {
        try {
          const playerId = this.getPlayerIdFromSocket(socket);
          if (!playerId) {
            callback({ success: false, error: 'Player not found' });
            return;
          }

          const roomCode = this.gameService.getPlayerRoom(playerId);
          if (!roomCode) {
            callback({ success: false, error: 'Room not found' });
            return;
          }

          const room = this.gameService.getRoom(roomCode);
          if (!room || room.hostId !== playerId) {
            callback({ success: false, error: 'Only host can advance questions' });
            return;
          }

          callback({ success: true });
          this.startNextQuestion(roomCode);
        } catch (error) {
          console.error('Error advancing question:', error);
          callback({ success: false, error: 'Failed to advance question' });
        }
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
        this.handlePlayerDisconnect(socket);
      });
    });
  }

  private async startNextQuestion(roomCode: string): Promise<void> {
    // Clear any existing timer for this room
    const existingTimer = this.questionTimers.get(roomCode);
    if (existingTimer) {
      clearTimeout(existingTimer);
      this.questionTimers.delete(roomCode);
    }

    const result = this.gameService.startNextQuestion(roomCode);
    
    if (!result.success) {
      // Game finished or no more questions
      if (result.error === 'No more questions') {
        this.finishGame(roomCode);
      }
      return;
    }

    const room = this.gameService.getRoom(roomCode);
    if (!room || !result.question) return;

    // Send question without correct answer
    const questionForClient = {
      id: result.question.id,
      question: result.question.question,
      options: result.question.options,
      difficulty: result.question.difficulty,
      category: result.question.category
    };

    this.io.to(roomCode).emit('question-start', {
      question: questionForClient,
      questionNumber: result.questionNumber!,
      totalQuestions: room.settings.totalQuestions,
      timeLimit: room.settings.questionTimeLimit
    });

    // Start countdown timer
    let timeRemaining = room.settings.questionTimeLimit;
    const countdownInterval = setInterval(() => {
      if (timeRemaining > 0) {
        this.io.to(roomCode).emit('time-update', { timeRemaining });
        timeRemaining--;
      } else {
        clearInterval(countdownInterval);
      }
    }, 1000);

    // Set timer to end question
    const questionTimer = setTimeout(() => {
      clearInterval(countdownInterval);
      this.endQuestion(roomCode);
    }, room.settings.questionTimeLimit * 1000);

    this.questionTimers.set(roomCode, questionTimer);
  }

  private endQuestion(roomCode: string): void {
    const result = this.gameService.endQuestion(roomCode);
    
    if (!result.success) {
      console.error(`Failed to end question for room ${roomCode}:`, result.error);
      return;
    }

    // Send question results
    this.io.to(roomCode).emit('question-end', {
      results: result.results!,
      leaderboard: result.leaderboard!
    });

    // Check if game is finished
    if (this.gameService.isGameFinished(roomCode)) {
      setTimeout(() => {
        this.finishGame(roomCode);
      }, 5000); // Show results for 5 seconds before ending
    } else {
      // Auto-advance to next question after 5 seconds
      setTimeout(() => {
        this.startNextQuestion(roomCode);
      }, 5000);
    }
  }

  private finishGame(roomCode: string): void {
    const result = this.gameService.finishGame(roomCode);
    
    if (result.success) {
      this.io.to(roomCode).emit('game-over', {
        finalScores: result.finalScores!,
        gameStats: result.gameStats!
      });
    }

    // Clear any timers for this room
    const timer = this.questionTimers.get(roomCode);
    if (timer) {
      clearTimeout(timer);
      this.questionTimers.delete(roomCode);
    }

    console.log(`Game finished in room ${roomCode}`);
  }

  private handlePlayerDisconnect(socket: Socket): void {
    const playerId = this.getPlayerIdFromSocket(socket);
    if (!playerId) return;

    // Clean up socket mapping
    this.socketToPlayer.delete(socket.id);

    const { roomCode, wasHost } = this.gameService.removePlayer(playerId);
    
    if (roomCode) {
      const room = this.gameService.getRoom(roomCode);
      const playerName = socket.data?.playerName || 'Unknown';
      
      // Notify remaining players
      socket.to(roomCode).emit('player-left', { 
        playerId, 
        playerName 
      });

      if (room && room.players.size > 0) {
        // Send updated players list
        const players = this.gameService.getRoomPlayers(roomCode);
        this.io.to(roomCode).emit('players-update', { players });

        // If host left, notify about new host
        if (wasHost) {
          const newHost = Array.from(room.players.values()).find(p => p.isHost);
          if (newHost) {
            console.log(`New host assigned in room ${roomCode}: ${newHost.name}`);
          }
        }
      }

      console.log(`Player ${playerId} left room ${roomCode}`);
    }
  }

  private getPlayerIdFromSocket(socket: Socket): string | null {
    return this.socketToPlayer.get(socket.id) || null;
  }

  getIO(): SocketIOServer<ClientToServerEvents, ServerToClientEvents> {
    return this.io;
  }

  shutdown(): void {
    // Clear all timers
    for (const timer of this.questionTimers.values()) {
      clearTimeout(timer);
    }
    this.questionTimers.clear();
    
    // Clear socket mappings
    this.socketToPlayer.clear();
    
    this.io.close();
  }
}