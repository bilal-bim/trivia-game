# Trivia Game Frontend

A real-time multiplayer trivia game built with React, TypeScript, and Socket.IO.

## Features

- Real-time multiplayer gameplay
- Live leaderboards and scoring
- Visual countdown timers
- Responsive design for mobile and desktop
- Interactive answer selection
- Animated game completion

## Tech Stack

- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Redux Toolkit** - State management
- **Tailwind CSS** - Utility-first styling
- **Socket.IO Client** - Real-time communication
- **Vite** - Fast build tool and dev server
- **Vitest** - Fast unit testing

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

3. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests in watch mode
- `npm run test:run` - Run tests once
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checks

## Game Flow

1. **Home** - Players enter their name and join/create a room
2. **Lobby** - Players wait for the host to start the game
3. **Question** - Players answer timed multiple-choice questions
4. **Scoreboard** - View results and rankings after each question
5. **Game Over** - Final leaderboard and play again option

## Environment Variables

```bash
VITE_SOCKET_URL=http://localhost:3001  # Backend server URL
VITE_APP_NAME=Trivia Game             # App name
VITE_APP_VERSION=1.0.0                # App version
VITE_DEBUG=false                      # Debug mode
```

## Building for Production

```bash
npm run build
```

This creates an optimized production build in the `dist` folder.
