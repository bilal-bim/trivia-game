import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import { GameService } from './services/GameService';
import { SocketService } from './services/SocketService';
import { createGameRoutes } from './routes/gameRoutes';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import { requestLogger } from './middlewares/requestLogger';
import { securityHeaders, rateLimit, sanitizeInput } from './middlewares/security';

const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

class TriviaGameServer {
  private app: express.Application;
  private server: any;
  private gameService: GameService;
  private socketService: SocketService;

  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.gameService = new GameService();
    this.socketService = new SocketService(this.server, this.gameService);
    
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    // Security middleware
    this.app.use(securityHeaders);
    this.app.use(sanitizeInput);
    
    // Rate limiting
    this.app.use(rateLimit(15 * 60 * 1000, 1000)); // 1000 requests per 15 minutes
    
    // CORS configuration
    const allowedOrigins = process.env.NODE_ENV === 'production' 
      ? [process.env.FRONTEND_URL || 'https://your-app.vercel.app']
      : ['http://localhost:3000', 'http://localhost:3003', 'http://localhost:3004', 'http://127.0.0.1:3000', 'http://127.0.0.1:3003', 'http://127.0.0.1:3004'];
    
    this.app.use(cors({
      origin: allowedOrigins,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true
    }));

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging
    if (NODE_ENV === 'development') {
      this.app.use(requestLogger);
    }
  }

  private setupRoutes(): void {
    // Health check route
    this.app.get('/', (req: express.Request, res: express.Response) => {
      res.json({
        success: true,
        message: 'Trivia Game Backend API',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        environment: NODE_ENV,
        uptime: process.uptime()
      });
    });

    // Game routes
    this.app.use('/api', createGameRoutes(this.gameService));
    
    // Alternative route mounting for backwards compatibility
    this.app.use('/', createGameRoutes(this.gameService));
  }

  private setupErrorHandling(): void {
    // 404 handler
    this.app.use(notFoundHandler);
    
    // Global error handler
    this.app.use(errorHandler);

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      this.shutdown();
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      this.shutdown();
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully');
      this.shutdown();
    });

    process.on('SIGINT', () => {
      console.log('SIGINT received, shutting down gracefully');
      this.shutdown();
    });
  }

  public start(): void {
    this.server.listen(PORT, () => {
      console.log('🎮 Trivia Game Backend Server Started');
      console.log('=====================================');
      console.log(`🌐 Server running on: http://localhost:${PORT}`);
      console.log(`🔗 Socket.IO enabled for: http://localhost:3000`);
      console.log(`📊 Environment: ${NODE_ENV}`);
      console.log(`⏰ Started at: ${new Date().toISOString()}`);
      console.log('=====================================');
      
      // Log available endpoints
      console.log('📡 Available Endpoints:');
      console.log('  GET  /                    - Server info');
      console.log('  GET  /health              - Health check');
      console.log('  POST /create-game         - Create game room');
      console.log('  POST /join-game           - Join game room');
      console.log('  GET  /game-stats          - Game statistics');
      console.log('  GET  /room/:roomCode      - Room information');
      console.log('');
      console.log('🔌 Socket.IO Events:');
      console.log('  Client → Server:');
      console.log('    create-room, join-room, start-game');
      console.log('    submit-answer, next-question');
      console.log('  Server → Client:');
      console.log('    room-created, player-joined, game-started');
      console.log('    question-start, time-update, question-end, game-over');
      console.log('=====================================');
    });

    this.server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
        console.log('Try using a different port with: PORT=3002 npm run dev');
      } else {
        console.error('❌ Server error:', error);
      }
      process.exit(1);
    });
  }

  private shutdown(): void {
    console.log('🔄 Shutting down server...');
    
    // Close server
    this.server.close(() => {
      console.log('✅ HTTP server closed');
      
      // Cleanup services
      this.socketService.shutdown();
      this.gameService.shutdown();
      
      console.log('✅ Services cleaned up');
      console.log('👋 Server shutdown complete');
      process.exit(0);
    });

    // Force shutdown after 30 seconds
    setTimeout(() => {
      console.error('❌ Forced shutdown after 30 seconds');
      process.exit(1);
    }, 30000);
  }
}

// Start the server
const server = new TriviaGameServer();
server.start();