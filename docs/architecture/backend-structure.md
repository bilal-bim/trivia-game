# Backend Architecture Document
## Real-Time Multiplayer Trivia Game

**Version:** 1.0  
**Date:** August 5, 2025  
**Focus:** Implementation-ready backend structure

---

## 1. API Overview

The backend provides a hybrid REST + WebSocket architecture optimized for real-time multiplayer gameplay:

- **REST API**: Game management, room operations, question retrieval
- **WebSocket**: Real-time game events, player interactions, live updates
- **Architecture**: Node.js + Express + Socket.IO with Redis state management

**Core Principles:**
- Server-authoritative game logic
- Real-time synchronization across all clients
- Stateless REST endpoints with stateful WebSocket sessions
- Redis for active game state, PostgreSQL for persistent data

---

## 2. REST API Endpoints

### Game Room Management

#### POST /api/games/create
Creates a new game room with unique 6-digit room code.

**Request:**
```json
{
  "hostId": "string",
  "settings": {
    "questionCount": 10,
    "timePerQuestion": 30,
    "categories": ["general", "science"],
    "difficulty": "mixed",
    "maxPlayers": 20
  }
}
```

**Response (201):**
```json
{
  "roomCode": "ABC123",
  "hostId": "host-uuid",
  "settings": { /* game settings */ },
  "state": "waiting",
  "createdAt": "2025-08-05T10:00:00Z",
  "expiresAt": "2025-08-05T14:00:00Z"
}
```

**Error Responses:**
- `400`: Invalid settings
- `429`: Too many rooms created by this host
- `500`: Server error

#### POST /api/games/join
Joins an existing game room.

**Request:**
```json
{
  "roomCode": "ABC123",
  "playerId": "player-uuid",
  "nickname": "PlayerName"
}
```

**Response (200):**
```json
{
  "success": true,
  "room": {
    "code": "ABC123",
    "state": "waiting",
    "playerCount": 3,
    "maxPlayers": 20,
    "settings": { /* game settings */ }
  },
  "player": {
    "id": "player-uuid",
    "nickname": "PlayerName",
    "isHost": false,
    "joinedAt": "2025-08-05T10:05:00Z"
  }
}
```

**Error Responses:**
- `404`: Room not found
- `400`: Invalid nickname or room full
- `409`: Player already in room

#### GET /api/games/:roomCode
Retrieves current room information.

**Response (200):**
```json
{
  "roomCode": "ABC123",
  "state": "active",
  "currentQuestion": 5,
  "totalQuestions": 10,
  "players": [
    {
      "id": "player-uuid",
      "nickname": "PlayerName",
      "isHost": true,
      "isConnected": true,
      "score": 2400
    }
  ],
  "timeRemaining": 25,
  "settings": { /* game settings */ }
}
```

### Question Management

#### GET /api/questions/categories
Retrieves available question categories.

**Response (200):**
```json
{
  "categories": [
    {
      "id": "general",
      "name": "General Knowledge",
      "questionCount": 150
    },
    {
      "id": "science",
      "name": "Science & Nature",
      "questionCount": 120
    },
    {
      "id": "history",
      "name": "History",
      "questionCount": 100
    }
  ]
}
```

---

## 3. WebSocket Events

### Client → Server Events

#### joinRoom
Player requests to join a game room.

**Payload:**
```typescript
{
  roomCode: string;    // 6-digit room code
  nickname: string;    // Player display name (1-20 chars)
  playerId?: string;   // Optional reconnection ID
}
```

#### startGame
Host initiates the game session.

**Payload:**
```typescript
{
  roomCode: string;
}
```

#### submitAnswer
Player submits answer to current question.

**Payload:**
```typescript
{
  questionId: string;
  selectedAnswer: number;    // 0-3 for options A-D
  timestamp: number;         // Client timestamp for latency calc
}
```

#### nextQuestion
Host advances to next question (manual control).

**Payload:**
```typescript
{
  roomCode: string;
}
```

### Server → Client Events

#### playerJoined
Notifies all players when someone joins the room.

**Payload:**
```typescript
{
  player: {
    id: string;
    nickname: string;
    isHost: boolean;
    joinedAt: string;
  };
  totalPlayers: number;
}
```

#### gameStarted
Sent to all players when game begins.

**Payload:**
```typescript
{
  question: {
    id: string;
    text: string;
    options: string[];    // [A, B, C, D]
    timeLimit: number;    // seconds
  };
  questionNumber: number;
  totalQuestions: number;
  startTime: string;      // ISO timestamp
}
```

#### questionStart
New question presented to all players.

**Payload:**
```typescript
{
  question: {
    id: string;
    text: string;
    options: string[];
    timeLimit: number;
  };
  questionNumber: number;
  timeRemaining: number;
}
```

#### answerReceived
Confirms answer submission (to submitter only).

**Payload:**
```typescript
{
  success: boolean;
  selectedAnswer: number;
  timeElapsed: number;      // milliseconds
  points?: number;          // if revealed after timer
}
```

#### scoreUpdate
Updates all players with current scores.

**Payload:**
```typescript
{
  scores: [
    {
      playerId: string;
      nickname: string;
      totalScore: number;
      correctAnswers: number;
      currentStreak: number;
      rank: number;
    }
  ];
  correctAnswer: number;     // 0-3, revealed after question
  explanation?: string;      // optional answer explanation
}
```

#### gameEnded
Final game results and statistics.

**Payload:**
```typescript
{
  finalScores: PlayerScore[];
  gameStats: {
    totalQuestions: number;
    avgAccuracy: number;
    fastestAnswer: number;    // milliseconds
    highestStreak: number;
  };
  duration: number;           // total game time in seconds
}
```

---

## 4. Data Models (TypeScript Interfaces)

### Core Game Models

```typescript
interface GameRoom {
  id: string;
  code: string;                    // 6-digit room code
  hostId: string;
  state: 'waiting' | 'active' | 'paused' | 'finished';
  settings: GameSettings;
  players: Map<string, Player>;
  currentQuestion?: Question;
  questionIndex: number;
  questions: Question[];           // Selected questions for this game
  startTime?: Date;
  endTime?: Date;
  createdAt: Date;
  expiresAt: Date;                // 4 hours from creation
}

interface Player {
  id: string;
  nickname: string;
  socketId: string;
  isHost: boolean;
  isConnected: boolean;
  joinedAt: Date;
  lastActivity: Date;
  score: PlayerScore;
}

interface Question {
  id: string;
  text: string;
  options: [string, string, string, string];  // Always 4 options
  correctAnswer: number;           // Index 0-3
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;                  // Base points (default 1000)
  timeLimit: number;               // Seconds (default 30)
  explanation?: string;            // Optional answer explanation
}

interface GameSettings {
  questionCount: number;           // 5-50, default 10
  timePerQuestion: number;         // 10-60 seconds, default 30
  categories: string[];            // Selected categories
  difficulty: 'mixed' | 'easy' | 'medium' | 'hard';
  maxPlayers: number;              // 2-20, default 20
  allowLateJoin: boolean;          // Default true
  showCorrectAnswer: boolean;      // Default true
}
```

### Game State Models

```typescript
interface PlayerScore {
  playerId: string;
  nickname: string;
  totalScore: number;
  correctAnswers: number;
  incorrectAnswers: number;
  averageResponseTime: number;     // milliseconds
  currentStreak: number;
  maxStreak: number;
  rank: number;
  pointsBreakdown: {
    basePoints: number;
    speedBonus: number;
    streakBonus: number;
  };
}

interface AnswerSubmission {
  playerId: string;
  questionId: string;
  selectedAnswer: number;          // 0-3
  submittedAt: Date;
  timeElapsed: number;             // milliseconds from question start
  isCorrect?: boolean;             // Calculated server-side
  pointsEarned?: number;           // Calculated server-side
}

interface GameState {
  roomCode: string;
  phase: 'waiting' | 'question' | 'results' | 'finished';
  currentQuestion?: Question;
  questionIndex: number;
  questionStartTime?: Date;
  answersReceived: Map<string, AnswerSubmission>;
  timeRemaining: number;           // seconds
  playerScores: Map<string, PlayerScore>;
}
```

---

## 5. Game State Management

### State Flow Architecture

```typescript
class GameStateManager {
  private rooms: Map<string, GameRoom> = new Map();
  private redis: RedisClient;
  
  // Room lifecycle management
  async createRoom(hostId: string, settings: GameSettings): Promise<GameRoom> {
    const room = new GameRoom(this.generateRoomCode(), hostId, settings);
    await this.redis.setex(`room:${room.code}`, 14400, JSON.stringify(room)); // 4 hour TTL
    this.rooms.set(room.code, room);
    return room;
  }
  
  async joinRoom(roomCode: string, player: Player): Promise<GameRoom> {
    const room = await this.getRoom(roomCode);
    if (!room) throw new Error('Room not found');
    if (room.players.size >= room.settings.maxPlayers) throw new Error('Room full');
    
    room.players.set(player.id, player);
    await this.saveRoom(room);
    return room;
  }
  
  // Game flow management
  async startGame(roomCode: string): Promise<Question> {
    const room = await this.getRoom(roomCode);
    room.state = 'active';
    room.startTime = new Date();
    room.questions = await this.selectQuestions(room.settings);
    room.currentQuestion = room.questions[0];
    room.questionIndex = 0;
    
    await this.saveRoom(room);
    await this.startQuestionTimer(roomCode);
    return room.currentQuestion;
  }
  
  async submitAnswer(roomCode: string, submission: AnswerSubmission): Promise<void> {
    const gameState = await this.getGameState(roomCode);
    if (!gameState.currentQuestion) throw new Error('No active question');
    
    // Validate submission timing
    const timeElapsed = Date.now() - gameState.questionStartTime!.getTime();
    if (timeElapsed > gameState.currentQuestion.timeLimit * 1000) {
      throw new Error('Answer submitted too late');
    }
    
    submission.timeElapsed = timeElapsed;
    submission.isCorrect = submission.selectedAnswer === gameState.currentQuestion.correctAnswer;
    submission.pointsEarned = this.calculatePoints(submission, gameState.currentQuestion);
    
    gameState.answersReceived.set(submission.playerId, submission);
    await this.saveGameState(roomCode, gameState);
  }
  
  private calculatePoints(submission: AnswerSubmission, question: Question): number {
    if (!submission.isCorrect) return 0;
    
    const basePoints = question.points;
    const speedBonus = Math.max(0, 500 - (submission.timeElapsed / 60)); // Up to 500 bonus
    const streakMultiplier = this.getStreakMultiplier(submission.playerId);
    
    return Math.round((basePoints + speedBonus) * streakMultiplier);
  }
}
```

### Redis State Structure

```typescript
// Room data structure in Redis
const roomKey = `room:${roomCode}`;
const roomData = {
  code: string;
  hostId: string;
  state: string;
  settings: GameSettings;
  players: Player[];
  currentQuestion?: Question;
  questionIndex: number;
  startTime?: string;
  expiresAt: string;
};

// Active game state
const gameStateKey = `game:${roomCode}:state`;
const gameState = {
  phase: string;
  currentQuestion?: Question;
  questionStartTime?: string;
  timeRemaining: number;
  answersReceived: AnswerSubmission[];
  playerScores: PlayerScore[];
};

// Player session data
const playerKey = `player:${playerId}`;
const playerSession = {
  id: string;
  nickname: string;
  currentRoom?: string;
  socketId: string;
  lastActivity: string;
};
```

---

## 6. Core Business Logic

### Question Selection Algorithm

```typescript
class QuestionSelector {
  async selectQuestions(settings: GameSettings): Promise<Question[]> {
    const criteria = {
      categories: settings.categories,
      difficulty: settings.difficulty,
      count: settings.questionCount
    };
    
    // Get questions from database with filtering
    let questions = await this.db.getQuestions(criteria);
    
    // Ensure balanced distribution across categories
    if (settings.categories.length > 1) {
      questions = this.balanceCategories(questions, settings.categories);
    }
    
    // Randomize order
    return this.shuffleArray(questions).slice(0, settings.questionCount);
  }
  
  private balanceCategories(questions: Question[], categories: string[]): Question[] {
    const questionsPerCategory = Math.ceil(questions.length / categories.length);
    const balanced: Question[] = [];
    
    for (const category of categories) {
      const categoryQuestions = questions
        .filter(q => q.category === category)
        .slice(0, questionsPerCategory);
      balanced.push(...categoryQuestions);
    }
    
    return this.shuffleArray(balanced);
  }
}
```

### Scoring Engine

```typescript
class ScoringEngine {
  calculateScore(submission: AnswerSubmission, question: Question, playerStreak: number): number {
    if (!submission.isCorrect) return 0;
    
    const basePoints = question.points; // Default 1000
    const speedBonus = this.calculateSpeedBonus(submission.timeElapsed, question.timeLimit);
    const streakMultiplier = this.getStreakMultiplier(playerStreak);
    
    return Math.round((basePoints + speedBonus) * streakMultiplier);
  }
  
  private calculateSpeedBonus(timeElapsed: number, timeLimit: number): number {
    // Max 500 bonus points for fastest answers
    const timeRatio = timeElapsed / (timeLimit * 1000);
    return Math.max(0, 500 * (1 - timeRatio));
  }
  
  private getStreakMultiplier(streak: number): number {
    // Streak multipliers: 1x, 1.1x, 1.2x, 1.3x, max 1.5x
    return Math.min(1.5, 1 + (streak * 0.1));
  }
  
  updatePlayerScore(playerId: string, submission: AnswerSubmission, question: Question): PlayerScore {
    const currentScore = this.getPlayerScore(playerId);
    const points = this.calculateScore(submission, question, currentScore.currentStreak);
    
    if (submission.isCorrect) {
      currentScore.correctAnswers++;
      currentScore.currentStreak++;
      currentScore.maxStreak = Math.max(currentScore.maxStreak, currentScore.currentStreak);
    } else {
      currentScore.incorrectAnswers++;
      currentScore.currentStreak = 0;
    }
    
    currentScore.totalScore += points;
    currentScore.averageResponseTime = this.updateAverageResponseTime(
      currentScore.averageResponseTime,
      submission.timeElapsed,
      currentScore.correctAnswers + currentScore.incorrectAnswers
    );
    
    return currentScore;
  }
}
```

### Game Timer Management

```typescript
class GameTimer {
  private timers: Map<string, NodeJS.Timeout> = new Map();
  
  startQuestionTimer(roomCode: string, timeLimit: number): void {
    // Clear any existing timer
    this.clearTimer(roomCode);
    
    const timer = setTimeout(async () => {
      await this.onQuestionTimeout(roomCode);
    }, timeLimit * 1000);
    
    this.timers.set(roomCode, timer);
  }
  
  private async onQuestionTimeout(roomCode: string): Promise<void> {
    const gameState = await this.gameManager.getGameState(roomCode);
    
    // Calculate scores for submitted answers
    const scores = await this.scoringEngine.calculateRoundScores(roomCode);
    
    // Broadcast results to all players
    this.io.to(roomCode).emit('scoreUpdate', {
      scores,
      correctAnswer: gameState.currentQuestion!.correctAnswer,
      explanation: gameState.currentQuestion!.explanation
    });
    
    // Advance to next question or end game
    if (gameState.questionIndex < gameState.totalQuestions - 1) {
      setTimeout(() => this.advanceToNextQuestion(roomCode), 3000); // 3s delay
    } else {
      setTimeout(() => this.endGame(roomCode), 3000);
    }
  }
  
  clearTimer(roomCode: string): void {
    const timer = this.timers.get(roomCode);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(roomCode);
    }
  }
}
```

---

## 7. Folder Structure

```
backend/
├── src/
│   ├── controllers/           # HTTP request handlers
│   │   ├── gameController.ts
│   │   ├── questionController.ts
│   │   └── healthController.ts
│   ├── services/             # Business logic services
│   │   ├── gameService.ts
│   │   ├── questionService.ts
│   │   ├── scoringService.ts
│   │   └── playerService.ts
│   ├── models/               # Data models and interfaces
│   │   ├── Game.ts
│   │   ├── Player.ts
│   │   ├── Question.ts
│   │   └── GameState.ts
│   ├── socket/               # WebSocket event handlers
│   │   ├── socketManager.ts
│   │   ├── gameEvents.ts
│   │   ├── playerEvents.ts
│   │   └── connectionManager.ts
│   ├── middleware/           # Express middleware
│   │   ├── auth.ts
│   │   ├── validation.ts
│   │   ├── rateLimit.ts
│   │   └── errorHandler.ts
│   ├── utils/                # Utility functions
│   │   ├── roomCodeGenerator.ts
│   │   ├── questionSelector.ts
│   │   ├── scoreCalculator.ts
│   │   └── logger.ts
│   ├── database/             # Database setup and models
│   │   ├── connection.ts
│   │   ├── migrations/
│   │   ├── seeds/
│   │   └── repositories/
│   ├── config/               # Configuration files
│   │   ├── database.ts
│   │   ├── redis.ts
│   │   ├── socket.ts
│   │   └── environment.ts
│   └── app.ts               # Express app setup
├── tests/                   # Test files
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docs/                    # API documentation
├── scripts/                 # Utility scripts
├── package.json
├── tsconfig.json
├── .env.example
└── Dockerfile
```

### Key Implementation Files

**app.ts** - Application entry point
```typescript
import express from 'express';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { setupRoutes } from './routes';
import { setupSocket } from './socket/socketManager';

const app = express();
const server = createServer(app);
const io = new SocketServer(server);

setupRoutes(app);
setupSocket(io);

server.listen(process.env.PORT || 3001);
```

**socket/socketManager.ts** - Central WebSocket management
```typescript
import { Server } from 'socket.io';
import { gameEvents } from './gameEvents';
import { playerEvents } from './playerEvents';

export function setupSocket(io: Server): void {
  io.on('connection', (socket) => {
    // Register event handlers
    gameEvents(socket, io);
    playerEvents(socket, io);
    
    socket.on('disconnect', () => {
      // Handle cleanup
    });
  });
}
```

**services/gameService.ts** - Core game business logic
```typescript
export class GameService {
  constructor(
    private redis: RedisClient,
    private questionService: QuestionService,
    private scoringService: ScoringService
  ) {}
  
  async createGame(hostId: string, settings: GameSettings): Promise<GameRoom> {
    // Implementation
  }
  
  async startGame(roomCode: string): Promise<Question> {
    // Implementation
  }
  
  async submitAnswer(roomCode: string, submission: AnswerSubmission): Promise<void> {
    // Implementation
  }
}
```

This backend architecture provides a solid foundation for the real-time trivia game, with clear separation of concerns, type safety, and scalable patterns for both MVP and future growth.