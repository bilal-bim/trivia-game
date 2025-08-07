# Technical Architecture Document
## Real-Time Multiplayer Trivia Game

**Version:** 1.0  
**Date:** August 5, 2025  
**Project:** Interactive Trivia Game Platform  

---

## 1. Executive Summary

This document outlines the comprehensive technical architecture for a real-time multiplayer trivia game platform. The system enables up to 20 concurrent players per room to participate in synchronized trivia sessions with real-time scoring, WebSocket-based communication, and responsive cross-device compatibility.

The architecture prioritizes simplicity, scalability, and real-time performance while maintaining development efficiency through modern TypeScript-based stacks for both frontend and backend components.

**Core Architecture:** React + TypeScript frontend with Node.js + Express + Socket.IO backend, containerized for cloud deployment with horizontal scaling capabilities.

---

## 2. Technology Stack

### Frontend Stack
- **Framework:** React 18 with TypeScript
- **State Management:** Redux Toolkit (RTK Query for API calls)
- **Real-time Communication:** Socket.IO Client
- **Styling:** Tailwind CSS with responsive design utilities
- **Build Tool:** Vite for fast development and optimized builds
- **Testing:** Jest + React Testing Library + Cypress (E2E)
- **Type Safety:** Strict TypeScript configuration

### Backend Stack
- **Runtime:** Node.js 18+ LTS
- **Framework:** Express.js with TypeScript
- **Real-time Communication:** Socket.IO Server
- **API Protocol:** REST + WebSocket (Socket.IO)
- **Validation:** Zod for runtime type validation
- **Testing:** Jest + Supertest for API testing
- **Process Management:** PM2 for production deployment

### Data Layer
- **Primary Database:** PostgreSQL 15+ for persistent data
- **In-Memory Store:** Redis 7+ for session/game state management
- **Question Storage:** JSON files (MVP) → PostgreSQL (production)
- **Cache Strategy:** Redis for active games, PostgreSQL for historical data
- **Migration Tool:** TypeORM for database schema management

### DevOps & Infrastructure
- **Containerization:** Docker + Docker Compose
- **CI/CD Pipeline:** GitHub Actions
- **Cloud Deployment:** Render/Railway (MVP) → AWS/GCP (scale)
- **Process Management:** PM2 with cluster mode
- **Monitoring:** Winston logging + structured JSON output
- **Environment Management:** dotenv with validation

---

## 3. System Overview and Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
├─────────────────┬─────────────────┬─────────────────────────────┤
│   Desktop Web   │   Mobile Web    │     Admin Dashboard         │
│   (React App)   │   (React App)   │     (React App)             │
└─────────────────┴─────────────────┴─────────────────────────────┘
         │                  │                       │
         │                  │                       │
┌────────┴──────────────────┴───────────────────────┴─────────────┐
│                     LOAD BALANCER                               │
│                  (Nginx/Cloud LB)                               │
└─────────────────────────┬───────────────────────────────────────┘
                          │
         ┌────────────────┴────────────────┐
         │                                 │
┌────────▼─────────┐              ┌───────▼──────────┐
│   APPLICATION    │              │   APPLICATION    │
│   SERVER 1       │              │   SERVER N       │
│ ┌──────────────┐ │              │ ┌──────────────┐ │
│ │ Express.js   │ │              │ │ Express.js   │ │
│ │ Socket.IO    │ │              │ │ Socket.IO    │ │
│ │ Game Engine  │ │              │ │ Game Engine  │ │
│ └──────────────┘ │              │ └──────────────┘ │
└─────────┬────────┘              └─────────┬────────┘
          │                                 │
          └─────────────┬───────────────────┘
                        │
        ┌───────────────┴────────────────┐
        │                                │
┌───────▼────────┐              ┌────────▼──────────┐
│     REDIS      │              │   POSTGRESQL      │
│  (Game State)  │              │ (Persistent Data) │
│ ┌────────────┐ │              │ ┌───────────────┐ │
│ │ Active     │ │              │ │ Questions     │ │
│ │ Game Rooms │ │              │ │ Game History  │ │
│ │ Player     │ │              │ │ Statistics    │ │
│ │ Sessions   │ │              │ │ Admin Data    │ │
│ └────────────┘ │              │ └───────────────┘ │
└────────────────┘              └───────────────────┘
```

### Component Overview

**Frontend Application:**
- React SPA with client-side routing
- Redux store for application state
- Socket.IO client for real-time communication
- Responsive design for all device types

**Backend Services:**
- Express.js REST API for game management
- Socket.IO server for real-time events
- Game engine for business logic
- Authentication middleware (session-based)

**Data Storage:**
- Redis for active game sessions and player state
- PostgreSQL for questions, game history, and statistics
- File system for question imports and static assets

---

## 4. Frontend Architecture

### 4.1 Component Hierarchy

```
App
├── Router (React Router v6)
│   ├── HomePage
│   │   ├── CreateGameForm
│   │   └── JoinGameForm
│   ├── GameRoom
│   │   ├── WaitingLobby
│   │   │   ├── PlayerList
│   │   │   ├── GameSettings
│   │   │   └── HostControls
│   │   ├── ActiveGame
│   │   │   ├── QuestionDisplay
│   │   │   ├── AnswerOptions
│   │   │   ├── Timer
│   │   │   └── PlayerStatus
│   │   └── GameResults
│   │       ├── Leaderboard
│   │       ├── QuestionReview
│   │       └── ShareResults
│   ├── AdminDashboard
│   │   ├── QuestionManager
│   │   ├── GameAnalytics
│   │   └── SystemStatus
│   └── ErrorBoundary
└── GlobalComponents
    ├── Header
    ├── Footer
    ├── LoadingSpinner
    ├── ErrorAlert
    └── ConnectionStatus
```

### 4.2 State Management Architecture

**Redux Store Structure:**
```typescript
interface RootState {
  game: {
    currentRoom: Room | null
    gameState: 'waiting' | 'active' | 'finished'
    currentQuestion: Question | null
    players: Player[]
    scores: PlayerScore[]
    timeRemaining: number
    isHost: boolean
  }
  ui: {
    isLoading: boolean
    errors: string[]
    notifications: Notification[]
    connectionStatus: 'connected' | 'disconnected' | 'reconnecting'
  }
  user: {
    playerId: string
    nickname: string
    roomCode: string | null
  }
}
```

**Key Redux Slices:**
- `gameSlice`: Game state, questions, scores, players
- `uiSlice`: Loading states, errors, notifications
- `userSlice`: Player information and preferences

### 4.3 Real-time Event Handling

**Socket.IO Client Events:**
```typescript
// Outbound Events
interface ClientEvents {
  'join-room': { roomCode: string; nickname: string }
  'start-game': { roomCode: string }
  'submit-answer': { questionId: string; answer: string; timestamp: number }
  'host-next-question': { roomCode: string }
  'host-end-game': { roomCode: string }
}

// Inbound Events
interface ServerEvents {
  'room-joined': { room: Room; players: Player[] }
  'player-joined': { player: Player }
  'game-started': { question: Question }
  'question-changed': { question: Question; questionNumber: number }
  'scores-updated': { scores: PlayerScore[] }
  'game-ended': { finalScores: PlayerScore[]; gameStats: GameStats }
  'error': { message: string; code: string }
}
```

### 4.4 Routing Strategy

**Route Structure:**
```typescript
const routes = [
  { path: '/', element: <HomePage /> },
  { path: '/room/:roomCode', element: <GameRoom /> },
  { path: '/admin', element: <AdminDashboard /> },
  { path: '/error', element: <ErrorPage /> },
  { path: '*', element: <NotFoundPage /> }
]
```

**Navigation Guards:**
- Room access validation
- Host permission checks
- Connection status verification

---

## 5. Backend Architecture

### 5.1 API Design

**REST Endpoints:**
```typescript
// Room Management
POST /api/rooms              // Create new game room
GET  /api/rooms/:code        // Get room details
PUT  /api/rooms/:code        // Update room settings
DELETE /api/rooms/:code      // Delete room

// Question Management
GET  /api/questions          // Get questions (filtered)
POST /api/questions          // Add new question (admin)
PUT  /api/questions/:id      // Update question (admin)
DELETE /api/questions/:id    // Delete question (admin)

// Game Management
POST /api/games/:roomCode/start    // Start game session
GET  /api/games/:roomCode/state    // Get current game state
POST /api/games/:roomCode/end      // End game session

// Analytics (Admin)
GET  /api/analytics/games          // Game statistics
GET  /api/analytics/questions      // Question performance
```

### 5.2 WebSocket Event Architecture

**Server-side Socket.IO Events:**
```typescript
interface GameSocketHandlers {
  // Room Management
  'join-room': (data: JoinRoomData) => void
  'leave-room': (data: LeaveRoomData) => void
  
  // Game Flow
  'start-game': (data: StartGameData) => void
  'submit-answer': (data: SubmitAnswerData) => void
  'next-question': (data: NextQuestionData) => void
  'end-game': (data: EndGameData) => void
  
  // Host Controls
  'pause-game': (data: PauseGameData) => void
  'resume-game': (data: ResumeGameData) => void
  'skip-question': (data: SkipQuestionData) => void
}
```

### 5.3 Game Engine Design

**Core Game Classes:**
```typescript
class GameRoom {
  id: string
  code: string
  hostId: string
  players: Map<string, Player>
  settings: GameSettings
  state: 'waiting' | 'active' | 'paused' | 'finished'
  currentQuestion?: Question
  questionIndex: number
  startTime?: Date
  
  addPlayer(player: Player): void
  removePlayer(playerId: string): void
  startGame(): void
  nextQuestion(): void
  submitAnswer(playerId: string, answer: AnswerSubmission): void
  calculateScores(): PlayerScore[]
  endGame(): GameResults
}

class GameEngine {
  private rooms: Map<string, GameRoom>
  private questionPool: QuestionPool
  private scoreCalculator: ScoreCalculator
  
  createRoom(hostId: string, settings: GameSettings): GameRoom
  joinRoom(roomCode: string, player: Player): GameRoom
  processAnswer(roomCode: string, playerId: string, answer: AnswerSubmission): void
  advanceQuestion(roomCode: string): void
  endGame(roomCode: string): GameResults
}
```

### 5.4 Data Models

**Core Data Structures:**
```typescript
interface Question {
  id: string
  text: string
  options: string[]  // [A, B, C, D]
  correctAnswer: number  // Index 0-3
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  points: number
  timeLimit: number
}

interface Player {
  id: string
  nickname: string
  socketId: string
  isHost: boolean
  isConnected: boolean
  joinedAt: Date
}

interface GameSettings {
  questionCount: number
  timePerQuestion: number
  categories: string[]
  difficulty: 'mixed' | 'easy' | 'medium' | 'hard'
  maxPlayers: number
}

interface AnswerSubmission {
  questionId: string
  selectedAnswer: number
  submittedAt: Date
  timeElapsed: number
}

interface PlayerScore {
  playerId: string
  nickname: string
  totalScore: number
  correctAnswers: number
  averageResponseTime: number
  currentStreak: number
  maxStreak: number
  rank: number
}
```

---

## 6. Database and Data Storage Design

### 6.1 PostgreSQL Schema

**Tables Structure:**
```sql
-- Questions table
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  options JSONB NOT NULL, -- ['A', 'B', 'C', 'D']
  correct_answer INTEGER NOT NULL CHECK (correct_answer >= 0 AND correct_answer <= 3),
  category VARCHAR(50) NOT NULL,
  difficulty VARCHAR(10) NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  points INTEGER DEFAULT 1000,
  time_limit INTEGER DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Game sessions (for analytics)
CREATE TABLE game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code VARCHAR(6) NOT NULL,
  host_id VARCHAR(100) NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE,
  question_count INTEGER NOT NULL,
  player_count INTEGER NOT NULL,
  settings JSONB NOT NULL,
  final_scores JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Player responses (for analytics)
CREATE TABLE player_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_session_id UUID REFERENCES game_sessions(id),
  player_id VARCHAR(100) NOT NULL,
  question_id UUID REFERENCES questions(id),
  selected_answer INTEGER NOT NULL,
  is_correct BOOLEAN NOT NULL,
  response_time INTEGER NOT NULL, -- milliseconds
  points_earned INTEGER NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_questions_category ON questions(category);
CREATE INDEX idx_questions_difficulty ON questions(difficulty);
CREATE INDEX idx_game_sessions_started_at ON game_sessions(started_at);
CREATE INDEX idx_player_responses_game_session ON player_responses(game_session_id);
```

### 6.2 Redis Data Structure

**Redis Key Patterns:**
```typescript
// Active game rooms
`room:${roomCode}` -> GameRoom object
`room:${roomCode}:players` -> Set of player IDs
`room:${roomCode}:answers:${questionId}` -> Hash of player answers

// Player sessions
`player:${playerId}` -> Player object
`player:${playerId}:room` -> Current room code

// Game state
`game:${roomCode}:state` -> Current game state
`game:${roomCode}:question` -> Current question
`game:${roomCode}:scores` -> Current scores

// Temporary data (with TTL)
`temp:room:${roomCode}` -> TTL 4 hours
`temp:player:${playerId}` -> TTL 4 hours
```

### 6.3 Data Flow Architecture

**Question Loading Strategy:**
1. **Startup**: Load frequently used questions into Redis cache
2. **Runtime**: Fetch questions from Redis, fallback to PostgreSQL
3. **Updates**: Invalidate cache when questions are modified

**Game State Management:**
1. **Room Creation**: Store in Redis with 4-hour TTL
2. **Active Game**: All state in Redis for real-time performance
3. **Game End**: Persist results to PostgreSQL, cleanup Redis

**Backup Strategy:**
1. **Redis Persistence**: RDB snapshots + AOF logging
2. **PostgreSQL Backups**: Daily automated backups
3. **Game Recovery**: Ability to restore active games from Redis snapshots

---

## 7. Real-time Communication Protocol

### 7.1 Socket.IO Event Flow

**Room Management Flow:**
```mermaid
sequenceDiagram
    participant C as Client
    participant S as Server
    participant R as Redis
    
    C->>S: join-room {roomCode, nickname}
    S->>R: Get room data
    R-->>S: Room exists/not found
    alt Room exists
        S->>R: Add player to room
        S->>C: room-joined {room, players}
        S-->>All: player-joined {player}
    else Room not found
        S->>C: error {message: "Room not found"}
    end
```

**Game Flow Protocol:**
```mermaid
sequenceDiagram
    participant H as Host
    participant S as Server
    participant P as Players
    participant R as Redis
    
    H->>S: start-game
    S->>R: Update room state to 'active'
    S->>R: Get first question
    S-->>All: game-started {question}
    
    loop For each question
        P->>S: submit-answer {answer, timestamp}
        S->>R: Store answer
        Note over S: Wait for timer or all answers
        S->>R: Calculate scores
        S-->>All: scores-updated {scores}
        S->>R: Get next question
        S-->>All: question-changed {question}
    end
    
    S-->>All: game-ended {finalScores}
```

### 7.2 Connection Management

**Connection Lifecycle:**
```typescript
class ConnectionManager {
  handleConnection(socket: Socket): void {
    // Authentication and session setup
    socket.on('authenticate', this.authenticateUser)
    
    // Room event handlers
    socket.on('join-room', this.handleJoinRoom)
    socket.on('leave-room', this.handleLeaveRoom)
    
    // Game event handlers
    socket.on('start-game', this.handleStartGame)
    socket.on('submit-answer', this.handleSubmitAnswer)
    
    // Connection management
    socket.on('disconnect', this.handleDisconnect)
    socket.on('reconnect', this.handleReconnect)
  }
  
  handleDisconnect(socket: Socket): void {
    // Mark player as disconnected
    // Keep room state for potential reconnection
    // Cleanup after timeout
  }
  
  handleReconnect(socket: Socket, sessionId: string): void {
    // Restore player session
    // Send current game state
    // Resume participation
  }
}
```

### 7.3 Message Reliability

**Guaranteed Delivery Pattern:**
```typescript
interface ReliableMessage {
  id: string
  event: string
  payload: any
  timestamp: number
  retryCount: number
}

class MessageQueue {
  private pendingMessages: Map<string, ReliableMessage>
  
  sendReliable(socket: Socket, event: string, payload: any): void {
    const message: ReliableMessage = {
      id: generateId(),
      event,
      payload,
      timestamp: Date.now(),
      retryCount: 0
    }
    
    this.pendingMessages.set(message.id, message)
    socket.emit(event, { ...payload, messageId: message.id })
    
    // Set retry timeout
    setTimeout(() => this.retryMessage(socket, message.id), 5000)
  }
  
  confirmReceived(messageId: string): void {
    this.pendingMessages.delete(messageId)
  }
}
```

---

## 8. Security Considerations

### 8.1 Input Validation and Sanitization

**Server-side Validation:**
```typescript
import { z } from 'zod'

const JoinRoomSchema = z.object({
  roomCode: z.string().length(6).regex(/^[A-Z0-9]{6}$/),
  nickname: z.string().min(1).max(20).regex(/^[a-zA-Z0-9\s]+$/)
})

const SubmitAnswerSchema = z.object({
  questionId: z.string().uuid(),
  answer: z.number().int().min(0).max(3),
  timestamp: z.number().positive()
})

// Middleware for validation
const validateInput = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body)
      next()
    } catch (error) {
      res.status(400).json({ error: 'Invalid input' })
    }
  }
}
```

### 8.2 Rate Limiting and Anti-Abuse

**Rate Limiting Strategy:**
```typescript
import rateLimit from 'express-rate-limit'

// API rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
})

// Socket.IO rate limiting
class SocketRateLimiter {
  private attempts: Map<string, number[]> = new Map()
  
  isAllowed(socketId: string, event: string): boolean {
    const key = `${socketId}:${event}`
    const now = Date.now()
    const window = 60000 // 1 minute
    const maxAttempts = 30
    
    const attempts = this.attempts.get(key) || []
    const recentAttempts = attempts.filter(time => now - time < window)
    
    if (recentAttempts.length >= maxAttempts) {
      return false
    }
    
    recentAttempts.push(now)
    this.attempts.set(key, recentAttempts)
    return true
  }
}
```

### 8.3 Game Integrity Protection

**Anti-Cheating Measures:**
```typescript
class GameIntegrityValidator {
  validateAnswerSubmission(
    playerId: string,
    answer: AnswerSubmission,
    gameState: GameState
  ): boolean {
    // Check if question is currently active
    if (!gameState.currentQuestion || 
        gameState.currentQuestion.id !== answer.questionId) {
      return false
    }
    
    // Check if player already answered
    if (gameState.playerAnswers.has(playerId)) {
      return false
    }
    
    // Validate timing (server-side timing check)
    const questionStartTime = gameState.questionStartTime
    const maxTime = gameState.currentQuestion.timeLimit * 1000
    const actualTime = Date.now() - questionStartTime
    
    if (actualTime > maxTime + 1000) { // 1s grace period
      return false
    }
    
    // Validate answer range
    if (answer.selectedAnswer < 0 || answer.selectedAnswer > 3) {
      return false
    }
    
    return true
  }
  
  detectSuspiciousActivity(playerId: string, responses: AnswerSubmission[]): boolean {
    // Check for consistently fast responses (potential bot)
    const avgResponseTime = responses.reduce((sum, r) => sum + r.timeElapsed, 0) / responses.length
    if (avgResponseTime < 500 && responses.length > 5) {
      return true // Suspicious
    }
    
    // Check for perfect accuracy with fast responses
    const correctCount = responses.filter(r => this.isCorrect(r)).length
    const accuracy = correctCount / responses.length
    if (accuracy > 0.95 && avgResponseTime < 2000 && responses.length > 10) {
      return true // Suspicious
    }
    
    return false
  }
}
```

### 8.4 Data Privacy and Compliance

**Privacy Protection:**
```typescript
interface PlayerDataPolicy {
  // No persistent storage of personal data
  // Nicknames are ephemeral and not linked to identities
  // IP addresses logged only for security purposes
  // Game statistics are anonymized
}

class DataProtectionManager {
  anonymizeGameData(gameSession: GameSession): AnonymizedGameSession {
    return {
      ...gameSession,
      players: gameSession.players.map(player => ({
        id: this.hashPlayerId(player.id),
        nickname: this.sanitizeNickname(player.nickname),
        // Remove any potentially identifying information
      }))
    }
  }
  
  cleanupExpiredData(): void {
    // Remove game sessions older than 30 days
    // Clear Redis keys for ended games
    // Purge logs older than 90 days
  }
}
```

---

## 9. Scalability Strategy

### 9.1 Horizontal Scaling Architecture

**Multi-Instance Deployment:**
```typescript
// Load balancer configuration for Socket.IO
const redisAdapter = require('socket.io-redis')

const io = new Server(server, {
  cors: { origin: process.env.ALLOWED_ORIGINS?.split(',') }
})

// Enable sticky sessions for Socket.IO
io.adapter(redisAdapter({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT
}))

// Process clustering
if (cluster.isMaster) {
  const numWorkers = os.cpus().length
  for (let i = 0; i < numWorkers; i++) {
    cluster.fork()
  }
} else {
  startServer()
}
```

### 9.2 Database Scaling Strategy

**Read Replicas and Sharding:**
```typescript
class DatabaseManager {
  private writeDb: PostgresConnection
  private readDb: PostgresConnection[]
  private redis: RedisCluster
  
  // Question queries go to read replicas
  async getQuestions(criteria: QuestionCriteria): Promise<Question[]> {
    const replica = this.selectReadReplica()
    return replica.query('SELECT * FROM questions WHERE ...', criteria)
  }
  
  // Game data writes go to primary
  async saveGameSession(session: GameSession): Promise<void> {
    return this.writeDb.query('INSERT INTO game_sessions ...', session)
  }
  
  // Active game state in Redis cluster
  async getGameState(roomCode: string): Promise<GameState> {
    return this.redis.get(`room:${roomCode}`)
  }
}
```

### 9.3 Performance Optimization

**Caching Strategy:**
```typescript
class PerformanceOptimizer {
  private questionCache: LRUCache<string, Question[]>
  private gameStateCache: Map<string, GameState>
  
  // Pre-load popular question sets
  async warmupCache(): Promise<void> {
    const popularCategories = ['general', 'pop-culture', 'science']
    for (const category of popularCategories) {
      const questions = await this.db.getQuestions({ category })
      this.questionCache.set(category, questions)
    }
  }
  
  // Batch operations for better performance
  async batchUpdateScores(roomCode: string, scores: PlayerScore[]): Promise<void> {
    const pipeline = this.redis.pipeline()
    scores.forEach(score => {
      pipeline.hset(`room:${roomCode}:scores`, score.playerId, JSON.stringify(score))
    })
    await pipeline.exec()
  }
}
```

### 9.4 Auto-scaling Configuration

**Cloud Deployment Scaling:**
```yaml
# Docker Compose for development
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - REDIS_URL=redis://redis:6379
      - DATABASE_URL=postgresql://user:pass@postgres:5432/trivia
    depends_on:
      - redis
      - postgres
    deploy:
      replicas: 3
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M
          
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    deploy:
      replicas: 1
      
  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=trivia
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data
      
volumes:
  postgres_data:
```

---

## 10. Deployment Architecture

### 10.1 Containerization Strategy

**Dockerfile Optimization:**
```dockerfile
# Multi-stage build for production
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production image
FROM node:18-alpine AS production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

WORKDIR /app

COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

USER nextjs

EXPOSE 3000

CMD ["node", "dist/server.js"]
```

### 10.2 Environment Management

**Configuration Strategy:**
```typescript
// Environment validation
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  PORT: z.string().transform(Number).default('3000'),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  CORS_ORIGIN: z.string().optional(),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info')
})

export const env = envSchema.parse(process.env)

// Environment-specific configurations
const configs = {
  development: {
    cors: { origin: 'http://localhost:3000' },
    logging: { level: 'debug' },
    database: { pool: { min: 2, max: 10 } }
  },
  production: {
    cors: { origin: process.env.ALLOWED_ORIGINS?.split(',') },
    logging: { level: 'info' },
    database: { pool: { min: 5, max: 50 } }
  }
}
```

### 10.3 CI/CD Pipeline

**GitHub Actions Workflow:**
```yaml
name: Deploy Trivia Game

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run linting
        run: npm run lint
        
      - name: Run tests
        run: npm run test:ci
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
          REDIS_URL: redis://localhost:6379
          
      - name: Build application
        run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Render
        uses: johnbeynon/render-deploy-action@v0.0.8
        with:
          service-id: ${{ secrets.RENDER_SERVICE_ID }}
          api-key: ${{ secrets.RENDER_API_KEY }}
```

### 10.4 Monitoring and Logging

**Application Monitoring:**
```typescript
import winston from 'winston'
import { Request, Response, NextFunction } from 'express'

// Structured logging
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
})

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now()
  
  res.on('finish', () => {
    const duration = Date.now() - start
    logger.info('HTTP Request', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    })
  })
  
  next()
}

// Game event logging
export const logGameEvent = (event: string, data: any) => {
  logger.info('Game Event', {
    event,
    roomCode: data.roomCode,
    playerId: data.playerId,
    timestamp: new Date().toISOString(),
    data
  })
}
```

---

## 11. Development Workflow

### 11.1 Development Environment Setup

**Local Development Stack:**
```bash
# Clone and setup
git clone <repository>
cd trivia-game

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with local database URLs

# Start services
docker-compose up -d postgres redis

# Run database migrations
npm run db:migrate

# Seed questions
npm run db:seed

# Start development servers
npm run dev        # Backend on :3001
npm run dev:client # Frontend on :3000
```

### 11.2 Code Quality Standards

**ESLint and Prettier Configuration:**
```json
{
  "extends": [
    "@typescript-eslint/recommended",
    "react-app",
    "react-app/jest"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "react-hooks/exhaustive-deps": "warn",
    "no-console": "warn"
  }
}
```

**Pre-commit Hooks:**
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "npm run test"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

### 11.3 Testing Strategy

**Testing Pyramid:**
```typescript
// Unit Tests (Jest)
describe('GameEngine', () => {
  it('should calculate scores correctly', () => {
    const engine = new GameEngine()
    const scores = engine.calculateScores(mockAnswers, mockQuestion)
    expect(scores[0].totalScore).toBe(1200) // Base + speed bonus
  })
})

// Integration Tests (Supertest)
describe('POST /api/rooms', () => {
  it('should create a new room', async () => {
    const response = await request(app)
      .post('/api/rooms')
      .send({ settings: mockGameSettings })
      .expect(201)
    
    expect(response.body).toHaveProperty('roomCode')
    expect(response.body.roomCode).toMatch(/^[A-Z0-9]{6}$/)
  })
})

// E2E Tests (Cypress)
describe('Complete Game Flow', () => {
  it('should allow players to join and complete a game', () => {
    cy.visit('/')
    cy.get('[data-testid=create-room]').click()
    cy.get('[data-testid=room-code]').should('be.visible')
    // ... continue game flow
  })
})
```

### 11.4 Database Migration Strategy

**Migration System:**
```typescript
// migrations/001_initial_schema.ts
import { MigrationInterface, QueryRunner } from 'typeorm'

export class InitialSchema1691234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE questions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        text TEXT NOT NULL,
        options JSONB NOT NULL,
        correct_answer INTEGER NOT NULL,
        category VARCHAR(50) NOT NULL,
        difficulty VARCHAR(10) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE questions`)
  }
}
```

---

## 12. Technology Justifications

### 12.1 Frontend Technology Choices

**React + TypeScript:**
- **Justification:** Mature ecosystem, excellent TypeScript support, strong community
- **Trade-offs:** Learning curve for TypeScript, bundle size considerations
- **Alternatives Considered:** Vue.js (smaller ecosystem), Angular (too heavy)

**Redux Toolkit:**
- **Justification:** Predictable state management, excellent DevTools, time-travel debugging
- **Trade-offs:** Boilerplate overhead, overkill for simple state
- **Alternatives Considered:** Zustand (less mature), Context API (performance issues)

**Socket.IO Client:**
- **Justification:** Automatic fallbacks, room management, reliable messaging
- **Trade-offs:** Larger bundle size than native WebSockets
- **Alternatives Considered:** Native WebSockets (no fallbacks), ws library (more complex)

**Tailwind CSS:**
- **Justification:** Utility-first, excellent mobile support, consistent design system
- **Trade-offs:** Initial learning curve, potential bloat without purging
- **Alternatives Considered:** Styled-components (runtime overhead), Material-UI (heavy)

### 12.2 Backend Technology Choices

**Node.js + Express:**
- **Justification:** JavaScript everywhere, excellent WebSocket support, fast development
- **Trade-offs:** Single-threaded limitations for CPU-intensive tasks
- **Alternatives Considered:** Python/FastAPI (slower for real-time), Go (steeper learning curve)

**Socket.IO Server:**
- **Justification:** Battle-tested for real-time apps, clustering support, automatic scaling
- **Trade-offs:** Slightly heavier than native WebSockets
- **Alternatives Considered:** Native WebSocket (more complex), Socket.IO (best fit)

**PostgreSQL:**
- **Justification:** ACID compliance, excellent JSON support, mature ecosystem
- **Trade-offs:** Slightly more complex than NoSQL for simple data
- **Alternatives Considered:** MongoDB (less consistency), SQLite (not scalable)

**Redis:**
- **Justification:** Excellent performance for session storage, pub/sub support
- **Trade-offs:** Additional infrastructure component
- **Alternatives Considered:** In-memory (not scalable), Memcached (less features)

### 12.3 Infrastructure Choices

**Docker Containerization:**
- **Justification:** Consistent environments, easy scaling, cloud-native deployment
- **Trade-offs:** Additional complexity for development setup
- **Alternatives Considered:** VM deployment (less efficient), serverless (cold starts)

**Render/Railway for MVP:**
- **Justification:** Simple deployment, cost-effective for MVP, good developer experience
- **Trade-offs:** Limited scaling options, vendor lock-in
- **Alternatives Considered:** AWS (complex setup), Heroku (expensive), GCP (overkill)

---

## 13. Next Steps and Implementation Plan

### 13.1 Development Phases

**Phase 1: Core MVP (Weeks 1-4)**
- Basic room creation and joining
- Real-time question/answer flow
- Simple scoring system
- Mobile-responsive UI

**Phase 2: Enhanced Features (Weeks 5-8)**
- Host controls and game settings
- Advanced scoring with streaks
- Connection recovery
- Game analytics

**Phase 3: Polish and Scale (Weeks 9-12)**
- Performance optimization
- Advanced security measures
- Comprehensive testing
- Production deployment

### 13.2 Architecture Evolution

**Immediate Implementation:**
- Single-server deployment with Redis
- File-based question storage
- Basic WebSocket communication

**Scale-up Strategy:**
- Multi-server with Redis cluster
- PostgreSQL with read replicas
- CDN for static assets
- Advanced monitoring

### 13.3 Success Metrics

**Technical Metrics:**
- Page load time < 3 seconds
- 99%+ message delivery rate
- Support for 100+ concurrent rooms
- < 1 second answer submission latency

**Business Metrics:**
- 85%+ game completion rate
- 70%+ user retention for hosts
- Average session length 15-20 minutes
- Mobile usage > 60%

---

This architecture provides a solid foundation for the real-time multiplayer trivia game, balancing simplicity for MVP development with scalability for future growth. The technology stack is modern, well-supported, and optimized for real-time applications while maintaining development velocity and operational simplicity.