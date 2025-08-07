# Trivia Game Backend

A real-time multiplayer trivia game backend built with Node.js, Express.js, Socket.IO, and TypeScript.

## Features

- 🎮 Real-time multiplayer trivia game
- 🔌 WebSocket communication with Socket.IO
- 🛡️ TypeScript for type safety
- 🎯 Room-based game sessions with 6-digit codes
- ⏱️ Timed questions with scoring bonuses
- 🏆 Real-time leaderboards
- 🔒 Input validation and sanitization
- 📊 Game statistics and monitoring
- 🧪 Comprehensive test suite

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test
```

## API Endpoints

### REST API

- `GET /` - Server information
- `GET /health` - Health check
- `POST /create-game` - Create new game room
- `POST /join-game` - Join existing game room
- `GET /game-stats` - Current game statistics
- `GET /room/:roomCode` - Room information

### WebSocket Events

#### Client → Server
- `create-room` - Create new game room
- `join-room` - Join existing room
- `start-game` - Start the game (host only)
- `submit-answer` - Submit answer to current question
- `next-question` - Advance to next question (host only)

#### Server → Client
- `room-created` - Room creation confirmation
- `player-joined` - Player joined notification
- `player-left` - Player disconnection notification
- `game-started` - Game start notification
- `question-start` - New question with timer
- `time-update` - Timer countdown updates
- `question-end` - Question results
- `game-over` - Final game results
- `error` - Error messages

## Game Flow

1. **Room Creation**: Host creates room, gets 6-digit code
2. **Player Joining**: Players join using room code
3. **Game Start**: Host starts game with minimum 2 players
4. **Questions**: Timed questions with multiple choice answers
5. **Scoring**: Points based on correctness and response time
6. **Results**: Real-time leaderboard updates
7. **Game End**: Final scores and statistics

## Architecture

```
src/
├── data/           # Static game data (questions)
├── middlewares/    # Express middlewares
├── routes/         # REST API routes
├── services/       # Business logic services
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
└── __tests__/      # Test files
```

## Configuration

Copy `.env.example` to `.env` and configure:

```env
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Start production server:
   ```bash
   npm start
   ```

3. Or use PM2 for production:
   ```bash
   pm2 start dist/server.js --name trivia-backend
   ```

## Game Rules

- **Players**: 2-20 per room
- **Questions**: Multiple choice (4 options)
- **Time Limit**: 30 seconds per question (configurable)
- **Scoring**: Base points + time bonus
  - Easy: 100 points
  - Medium: 200 points  
  - Hard: 300 points
  - Time bonus: Up to 50% based on speed
- **Room Codes**: 6-character alphanumeric (excluding confusing characters)

## Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **WebSockets**: Socket.IO
- **Language**: TypeScript
- **Testing**: Jest
- **Validation**: Joi
- **CORS**: cors middleware
- **Process Management**: PM2 (production)

## Contributing

1. Fork the repository
2. Create feature branch
3. Add tests for new features
4. Run test suite
5. Submit pull request

## License

MIT License - see LICENSE file for details.