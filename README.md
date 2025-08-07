# 🎮 Multiplayer Trivia Game

A real-time multiplayer trivia game built with React, Node.js, and Socket.IO. Challenge your friends with fun trivia questions!

## 🌟 Features

- **Real-time Multiplayer**: Play with friends anywhere in the world
- **Room System**: Create private rooms with unique codes
- **Live Scoring**: See scores update in real-time
- **Timer-based Questions**: 30-second countdown for each question
- **Responsive Design**: Works on desktop and mobile devices
- **10 Question Rounds**: Perfect length for quick games

## 🚀 Tech Stack

### Frontend
- React 18 with TypeScript
- Redux Toolkit for state management
- Socket.IO Client for real-time communication
- Tailwind CSS for styling
- Vite for fast development

### Backend
- Node.js with Express
- Socket.IO for WebSocket connections
- TypeScript for type safety
- In-memory game state management

## 🎯 How to Play

1. **Create a Room**: One player creates a room and gets a 6-character code
2. **Share the Code**: Share the room code with friends
3. **Join the Game**: Friends join using the room code
4. **Start Playing**: Host starts the game when everyone's ready
5. **Answer Questions**: Everyone answers the same questions
6. **See Results**: Scores update after each question
7. **Winner Announced**: Highest score wins!

## 🛠️ Local Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Backend Setup
```bash
cd src/backend
npm install
npm run dev
```
Backend runs on http://localhost:3001

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on http://localhost:3000

## 🌐 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy
- **Backend**: Deploy to Render
- **Frontend**: Deploy to Vercel
- Both services offer free tiers!

## 📝 Environment Variables

### Backend
- `NODE_ENV`: 'development' or 'production'
- `PORT`: Server port (default: 3001)
- `FRONTEND_URL`: Frontend URL for CORS

### Frontend
- `VITE_BACKEND_URL`: Backend API URL

## 🎨 Screenshots

### Home Screen
- Enter your name
- Create or join a room

### Lobby
- See all players
- Host can start the game

### Game Play
- Answer questions
- See timer countdown
- Submit answers

### Scoreboard
- View current standings
- See correct answers

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## 📄 License

MIT License - feel free to use this project for your own purposes!

## 🙏 Acknowledgments

- Questions sourced from various trivia databases
- Built with love for trivia enthusiasts

---

**Have fun playing!** 🎉