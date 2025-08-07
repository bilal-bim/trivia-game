# Frontend Architecture Document
## Real-Time Multiplayer Trivia Game

**Version:** 1.0  
**Date:** August 5, 2025  
**Tech Stack:** React 18 + TypeScript + Redux Toolkit + Socket.IO

---

## 1. Application Structure Overview

The frontend is built as a single-page application (SPA) using React 18 with TypeScript, optimized for real-time multiplayer gaming experiences. The architecture emphasizes mobile-first responsive design, real-time state synchronization, and seamless user experience across all device types.

**Core Principles:**
- Mobile-first responsive design with progressive enhancement
- Real-time state management with optimistic updates
- Component reusability through atomic design patterns
- Type-safe development with strict TypeScript configuration
- Performance optimization for 3G networks and low-end devices

---

## 2. Page Components and Routes

### 2.1 Route Configuration

```typescript
// src/router/routes.ts
import { createBrowserRouter } from 'react-router-dom'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'room/:roomCode',
        element: <GameRoom />,
        loader: validateRoomAccess,
      },
      {
        path: 'error',
        element: <ErrorPage />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])

// Route guards
const validateRoomAccess = async ({ params }: LoaderFunctionArgs) => {
  const { roomCode } = params
  if (!roomCode || !/^[A-Z0-9]{6}$/.test(roomCode)) {
    throw new Response('Invalid room code', { status: 400 })
  }
  return null
}
```

### 2.2 Page Components Structure

#### HomePage (`/`)
```typescript
// src/pages/HomePage.tsx
interface HomePageProps {}

const HomePage: React.FC<HomePageProps> = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <WelcomeSection />
        <GameActionCards />
        <RecentGamesSection />
      </main>
      <Footer />
    </div>
  )
}

// Child components
const GameActionCards = () => (
  <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
    <CreateGameCard />
    <JoinGameCard />
  </div>
)
```

#### GameRoom (`/room/:roomCode`)
```typescript
// src/pages/GameRoom.tsx
const GameRoom: React.FC = () => {
  const { roomCode } = useParams<{ roomCode: string }>()
  const gameState = useAppSelector(selectGameState)
  
  const renderGamePhase = () => {
    switch (gameState.phase) {
      case 'waiting':
        return <LobbyPage />
      case 'active':
        return <QuestionPage />
      case 'results':
        return <ScoreboardPage />
      case 'finished':
        return <GameResultsPage />
      default:
        return <LoadingSpinner />
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <GameHeader roomCode={roomCode} />
      <main className="container mx-auto px-4 py-6">
        <ConnectionStatus />
        {renderGamePhase()}
      </main>
    </div>
  )
}
```

---

## 3. Redux State Architecture

### 3.1 Store Configuration

```typescript
// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import playerSlice from './slices/playerSlice'
import gameSlice from './slices/gameSlice'
import questionsSlice from './slices/questionsSlice'
import scoreboardSlice from './slices/scoreboardSlice'
import uiSlice from './slices/uiSlice'

export const store = configureStore({
  reducer: {
    player: playerSlice,
    game: gameSlice,
    questions: questionsSlice,
    scoreboard: scoreboardSlice,
    ui: uiSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['socket/connected', 'socket/disconnected'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
})

setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
```

### 3.2 State Slices Implementation

#### Player Slice
```typescript
// src/store/slices/playerSlice.ts
interface PlayerState {
  id: string | null
  nickname: string | null
  isHost: boolean
  connectionStatus: 'connected' | 'disconnected' | 'reconnecting'
  currentRoom: string | null
  joinedAt: string | null
}

const initialState: PlayerState = {
  id: null,
  nickname: null,
  isHost: false,
  connectionStatus: 'disconnected',
  currentRoom: null,
  joinedAt: null,
}

export const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setPlayerInfo: (state, action: PayloadAction<{id: string, nickname: string}>) => {
      state.id = action.payload.id
      state.nickname = action.payload.nickname
    },
    setHostStatus: (state, action: PayloadAction<boolean>) => {
      state.isHost = action.payload
    },
    setConnectionStatus: (state, action: PayloadAction<PlayerState['connectionStatus']>) => {
      state.connectionStatus = action.payload
    },
    joinRoom: (state, action: PayloadAction<string>) => {
      state.currentRoom = action.payload
      state.joinedAt = new Date().toISOString()
    },
    leaveRoom: (state) => {
      state.currentRoom = null
      state.joinedAt = null
      state.isHost = false
    },
  },
})
```

#### Game Slice
```typescript
// src/store/slices/gameSlice.ts
interface GameState {
  roomCode: string | null
  phase: 'waiting' | 'active' | 'results' | 'finished'
  settings: GameSettings
  players: Player[]
  maxPlayers: number
  timeRemaining: number
  isTimerActive: boolean
  currentQuestionIndex: number
  totalQuestions: number
}

export const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    initializeGame: (state, action: PayloadAction<GameInitData>) => {
      state.roomCode = action.payload.roomCode
      state.settings = action.payload.settings
      state.players = action.payload.players
      state.phase = 'waiting'
    },
    updateGamePhase: (state, action: PayloadAction<GameState['phase']>) => {
      state.phase = action.payload
    },
    addPlayer: (state, action: PayloadAction<Player>) => {
      const existingPlayer = state.players.find(p => p.id === action.payload.id)
      if (!existingPlayer) {
        state.players.push(action.payload)
      }
    },
    removePlayer: (state, action: PayloadAction<string>) => {
      state.players = state.players.filter(p => p.id !== action.payload)
    },
    updateTimer: (state, action: PayloadAction<{timeRemaining: number, isActive: boolean}>) => {
      state.timeRemaining = action.payload.timeRemaining
      state.isTimerActive = action.payload.isActive
    },
    nextQuestion: (state) => {
      state.currentQuestionIndex += 1
      state.phase = 'active'
    },
  },
})
```

#### Questions Slice
```typescript
// src/store/slices/questionsSlice.ts
interface QuestionsState {
  currentQuestion: Question | null
  questionHistory: QuestionResult[]
  playerAnswer: number | null
  hasAnswered: boolean
  answerSubmittedAt: string | null
}

export const questionsSlice = createSlice({
  name: 'questions',
  initialState,
  reducers: {
    setCurrentQuestion: (state, action: PayloadAction<Question>) => {
      state.currentQuestion = action.payload
      state.playerAnswer = null
      state.hasAnswered = false
      state.answerSubmittedAt = null
    },
    submitAnswer: (state, action: PayloadAction<number>) => {
      state.playerAnswer = action.payload
      state.hasAnswered = true
      state.answerSubmittedAt = new Date().toISOString()
    },
    addToHistory: (state, action: PayloadAction<QuestionResult>) => {
      state.questionHistory.push(action.payload)
    },
    clearCurrentQuestion: (state) => {
      state.currentQuestion = null
      state.playerAnswer = null
      state.hasAnswered = false
    },
  },
})
```

#### Scoreboard Slice
```typescript
// src/store/slices/scoreboardSlice.ts
interface ScoreboardState {
  currentScores: PlayerScore[]
  roundResults: RoundResult[]
  finalRankings: FinalRanking[]
  showingResults: boolean
}

export const scoreboardSlice = createSlice({
  name: 'scoreboard',
  initialState,
  reducers: {
    updateScores: (state, action: PayloadAction<PlayerScore[]>) => {
      state.currentScores = action.payload.sort((a, b) => b.totalScore - a.totalScore)
    },
    addRoundResult: (state, action: PayloadAction<RoundResult>) => {
      state.roundResults.push(action.payload)
    },
    setFinalRankings: (state, action: PayloadAction<FinalRanking[]>) => {
      state.finalRankings = action.payload
    },
    toggleResultsDisplay: (state, action: PayloadAction<boolean>) => {
      state.showingResults = action.payload
    },
  },
})
```

### 3.3 Selectors

```typescript
// src/store/selectors.ts
export const selectPlayer = (state: RootState) => state.player
export const selectIsHost = (state: RootState) => state.player.isHost
export const selectConnectionStatus = (state: RootState) => state.player.connectionStatus

export const selectGame = (state: RootState) => state.game
export const selectGamePhase = (state: RootState) => state.game.phase
export const selectPlayers = (state: RootState) => state.game.players
export const selectTimeRemaining = (state: RootState) => state.game.timeRemaining

export const selectCurrentQuestion = (state: RootState) => state.questions.currentQuestion
export const selectHasAnswered = (state: RootState) => state.questions.hasAnswered
export const selectQuestionHistory = (state: RootState) => state.questions.questionHistory

export const selectCurrentScores = (state: RootState) => state.scoreboard.currentScores
export const selectPlayerRanking = (playerId: string) => (state: RootState) => {
  const scores = state.scoreboard.currentScores
  return scores.findIndex(score => score.playerId === playerId) + 1
}
```

---

## 4. Component Hierarchy

### 4.1 Atomic Design Structure

```
src/components/
├── atoms/
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx
│   │   └── Button.stories.tsx
│   ├── Input/
│   ├── Timer/
│   ├── Badge/
│   └── Spinner/
├── molecules/
│   ├── PlayerCard/
│   ├── ScoreDisplay/
│   ├── AnswerOption/
│   ├── QuestionCard/
│   └── GameSettings/
├── organisms/
│   ├── PlayerList/
│   ├── QuestionDisplay/
│   ├── Scoreboard/
│   ├── GameControls/
│   └── ConnectionStatus/
└── templates/
    ├── GameLayout/
    ├── LobbyLayout/
    └── ResultsLayout/
```

### 4.2 Key Components Implementation

#### Lobby Page Components
```typescript
// src/components/organisms/PlayerList.tsx
interface PlayerListProps {
  players: Player[]
  maxPlayers: number
  isHost: boolean
}

const PlayerList: React.FC<PlayerListProps> = ({ players, maxPlayers, isHost }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Players ({players.length}/{maxPlayers})</h2>
        {isHost && <HostControls />}
      </div>
      <div className="space-y-2">
        {players.map(player => (
          <PlayerCard key={player.id} player={player} />
        ))}
      </div>
      <PlayerJoinIndicator />
    </div>
  )
}

// src/components/molecules/PlayerCard.tsx
const PlayerCard: React.FC<{ player: Player }> = ({ player }) => (
  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
    <div className="flex items-center space-x-3">
      <Avatar name={player.nickname} />
      <span className="font-medium">{player.nickname}</span>
      {player.isHost && <Badge variant="host">Host</Badge>}
    </div>
    <ConnectionIndicator status={player.connectionStatus} />
  </div>
)
```

#### Question Page Components
```typescript
// src/components/organisms/QuestionDisplay.tsx
const QuestionDisplay: React.FC = () => {
  const currentQuestion = useAppSelector(selectCurrentQuestion)
  const timeRemaining = useAppSelector(selectTimeRemaining)
  const hasAnswered = useAppSelector(selectHasAnswered)
  
  if (!currentQuestion) return <LoadingSpinner />

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <QuestionHeader 
          questionNumber={currentQuestion.number}
          totalQuestions={currentQuestion.total}
        />
        <Timer timeRemaining={timeRemaining} isActive />
        <QuestionText text={currentQuestion.text} />
      </div>
      <AnswerOptions 
        options={currentQuestion.options}
        disabled={hasAnswered}
        onAnswer={handleAnswerSubmit}
      />
      <PlayerAnswerStatus />
    </div>
  )
}

// src/components/molecules/AnswerOptions.tsx
interface AnswerOptionsProps {
  options: string[]
  disabled: boolean
  onAnswer: (index: number) => void
}

const AnswerOptions: React.FC<AnswerOptionsProps> = ({ options, disabled, onAnswer }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {options.map((option, index) => (
      <AnswerButton
        key={index}
        option={option}
        index={index}
        letter={String.fromCharCode(65 + index)} // A, B, C, D
        disabled={disabled}
        onClick={() => onAnswer(index)}
      />
    ))}
  </div>
)
```

#### Scoreboard Components
```typescript
// src/components/organisms/Scoreboard.tsx
const Scoreboard: React.FC = () => {
  const scores = useAppSelector(selectCurrentScores)
  const isHost = useAppSelector(selectIsHost)
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Leaderboard</h2>
        {isHost && <NextQuestionButton />}
      </div>
      <div className="space-y-3">
        {scores.map((score, index) => (
          <ScoreRow
            key={score.playerId}
            score={score}
            rank={index + 1}
            isCurrentPlayer={score.playerId === currentPlayerId}
          />
        ))}
      </div>
      <GameProgress />
    </div>
  )
}

// src/components/molecules/ScoreRow.tsx
const ScoreRow: React.FC<ScoreRowProps> = ({ score, rank, isCurrentPlayer }) => (
  <div className={`
    flex items-center justify-between p-4 rounded-lg transition-all
    ${isCurrentPlayer ? 'bg-blue-100 border-2 border-blue-300' : 'bg-gray-50'}
    ${rank <= 3 ? 'shadow-md' : ''}
  `}>
    <div className="flex items-center space-x-4">
      <RankBadge rank={rank} />
      <div>
        <p className="font-semibold">{score.nickname}</p>
        <p className="text-sm text-gray-600">
          {score.correctAnswers} correct • {score.streak} streak
        </p>
      </div>
    </div>
    <div className="text-right">
      <p className="text-lg font-bold">{score.totalScore}</p>
      <ScoreChange change={score.lastRoundChange} />
    </div>
  </div>
)
```

---

## 5. Socket.IO Integration

### 5.1 Socket Connection Management

```typescript
// src/services/socket.ts
import { io, Socket } from 'socket.io-client'
import { store } from '../store'
import { socketMiddleware } from '../store/middleware/socketMiddleware'

class SocketService {
  private socket: Socket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5

  connect(): void {
    this.socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001', {
      transports: ['websocket', 'polling'],
      upgrade: true,
      rememberUpgrade: true,
      timeout: 20000,
    })

    this.setupEventListeners()
  }

  private setupEventListeners(): void {
    if (!this.socket) return

    // Connection events
    this.socket.on('connect', this.handleConnect)
    this.socket.on('disconnect', this.handleDisconnect)
    this.socket.on('connect_error', this.handleConnectError)

    // Game events
    this.socket.on('room-joined', this.handleRoomJoined)
    this.socket.on('player-joined', this.handlePlayerJoined)
    this.socket.on('player-left', this.handlePlayerLeft)
    this.socket.on('game-started', this.handleGameStarted)
    this.socket.on('question-started', this.handleQuestionStarted)
    this.socket.on('question-ended', this.handleQuestionEnded)
    this.socket.on('scores-updated', this.handleScoresUpdated)
    this.socket.on('game-ended', this.handleGameEnded)
    this.socket.on('error', this.handleError)
  }

  // Event handlers
  private handleConnect = (): void => {
    console.log('Socket connected')
    this.reconnectAttempts = 0
    store.dispatch(playerSlice.actions.setConnectionStatus('connected'))
  }

  private handleDisconnect = (reason: string): void => {
    console.log('Socket disconnected:', reason)
    store.dispatch(playerSlice.actions.setConnectionStatus('disconnected'))
    
    if (reason === 'io server disconnect') {
      // Server initiated disconnect, don't reconnect
      return
    }
    
    this.attemptReconnect()
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      store.dispatch(playerSlice.actions.setConnectionStatus('reconnecting'))
      
      setTimeout(() => {
        this.socket?.connect()
      }, Math.pow(2, this.reconnectAttempts) * 1000) // Exponential backoff
    }
  }

  // Game actions
  joinRoom(roomCode: string, nickname: string): void {
    this.socket?.emit('join-room', { roomCode, nickname })
  }

  startGame(): void {
    this.socket?.emit('start-game')
  }

  submitAnswer(questionId: string, answer: number): void {
    this.socket?.emit('submit-answer', {
      questionId,
      answer,
      timestamp: Date.now()
    })
  }

  nextQuestion(): void {
    this.socket?.emit('next-question')
  }

  endGame(): void {
    this.socket?.emit('end-game')
  }
}

export const socketService = new SocketService()
```

### 5.2 Socket Middleware

```typescript
// src/store/middleware/socketMiddleware.ts
import { Middleware } from '@reduxjs/toolkit'
import { socketService } from '../../services/socket'

export const socketMiddleware: Middleware = (store) => (next) => (action) => {
  // Handle socket actions
  switch (action.type) {
    case 'socket/connect':
      socketService.connect()
      break
      
    case 'socket/joinRoom':
      socketService.joinRoom(action.payload.roomCode, action.payload.nickname)
      break
      
    case 'socket/submitAnswer':
      socketService.submitAnswer(action.payload.questionId, action.payload.answer)
      break
      
    case 'socket/startGame':
      if (store.getState().player.isHost) {
        socketService.startGame()
      }
      break
  }

  return next(action)
}
```

### 5.3 Real-time Event Handlers

```typescript
// src/hooks/useSocketEvents.ts
export const useSocketEvents = (): void => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const handleRoomJoined = (data: RoomJoinedEvent) => {
      dispatch(gameSlice.actions.initializeGame(data))
      dispatch(playerSlice.actions.joinRoom(data.roomCode))
    }

    const handlePlayerJoined = (data: PlayerJoinedEvent) => {
      dispatch(gameSlice.actions.addPlayer(data.player))
      // Show notification
      dispatch(uiSlice.actions.addNotification({
        type: 'info',
        message: `${data.player.nickname} joined the game`
      }))
    }

    const handleQuestionStarted = (data: QuestionStartedEvent) => {
      dispatch(questionsSlice.actions.setCurrentQuestion(data.question))
      dispatch(gameSlice.actions.updateGamePhase('active'))
      dispatch(gameSlice.actions.updateTimer({
        timeRemaining: data.timeLimit,
        isActive: true
      }))
    }

    const handleScoresUpdated = (data: ScoresUpdatedEvent) => {
      dispatch(scoreboardSlice.actions.updateScores(data.scores))
      dispatch(scoreboardSlice.actions.addRoundResult(data.roundResult))
    }

    // Register event listeners
    socketService.on('room-joined', handleRoomJoined)
    socketService.on('player-joined', handlePlayerJoined)
    socketService.on('question-started', handleQuestionStarted)
    socketService.on('scores-updated', handleScoresUpdated)

    return () => {
      // Cleanup listeners
      socketService.off('room-joined', handleRoomJoined)
      socketService.off('player-joined', handlePlayerJoined)
      socketService.off('question-started', handleQuestionStarted)
      socketService.off('scores-updated', handleScoresUpdated)
    }
  }, [dispatch])
}
```

---

## 6. Routing Configuration

### 6.1 Protected Routes

```typescript
// src/components/ProtectedRoute.tsx
interface ProtectedRouteProps {
  children: React.ReactNode
  requiresRoom?: boolean
  requiresHost?: boolean
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiresRoom = false,
  requiresHost = false
}) => {
  const player = useAppSelector(selectPlayer)
  const navigate = useNavigate()

  useEffect(() => {
    if (requiresRoom && !player.currentRoom) {
      navigate('/', { replace: true })
      return
    }

    if (requiresHost && !player.isHost) {
      navigate(`/room/${player.currentRoom}`, { replace: true })
      return
    }
  }, [player, navigate, requiresRoom, requiresHost])

  if (requiresRoom && !player.currentRoom) {
    return <LoadingSpinner />
  }

  if (requiresHost && !player.isHost) {
    return <LoadingSpinner />
  }

  return <>{children}</>
}
```

### 6.2 Navigation Utilities

```typescript
// src/hooks/useNavigation.ts
export const useNavigation = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const navigateToHome = useCallback(() => {
    dispatch(gameSlice.actions.leaveGame())
    dispatch(playerSlice.actions.leaveRoom())
    navigate('/')
  }, [navigate, dispatch])

  const navigateToRoom = useCallback((roomCode: string) => {
    navigate(`/room/${roomCode}`)
  }, [navigate])

  const navigateToError = useCallback((error: string) => {
    navigate('/error', { state: { error } })
  }, [navigate])

  return {
    navigateToHome,
    navigateToRoom,
    navigateToError,
  }
}
```

---

## 7. Shared Components

### 7.1 UI Components Library

```typescript
// src/components/atoms/Button/Button.tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  icon?: React.ReactNode
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className,
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
  }
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  return (
    <button
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Spinner size="sm" className="mr-2" />}
      {icon && !isLoading && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  )
}
```

### 7.2 Game-Specific Components

```typescript
// src/components/molecules/Timer/Timer.tsx
interface TimerProps {
  timeRemaining: number
  totalTime: number
  isActive: boolean
  onTimeUp?: () => void
}

const Timer: React.FC<TimerProps> = ({ timeRemaining, totalTime, isActive, onTimeUp }) => {
  const percentage = (timeRemaining / totalTime) * 100
  const isUrgent = percentage <= 25

  useEffect(() => {
    if (timeRemaining === 0 && onTimeUp) {
      onTimeUp()
    }
  }, [timeRemaining, onTimeUp])

  return (
    <div className="flex flex-col items-center mb-6">
      <div className={`
        relative w-24 h-24 rounded-full border-4 mb-2
        ${isUrgent ? 'border-red-500 animate-pulse' : 'border-blue-500'}
      `}>
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-gray-200"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - percentage / 100)}`}
            className={isUrgent ? 'text-red-500' : 'text-blue-500'}
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-xl font-bold ${isUrgent ? 'text-red-500' : 'text-blue-500'}`}>
            {timeRemaining}
          </span>
        </div>
      </div>
      <p className="text-sm text-gray-600 text-center">
        {isActive ? 'Time remaining' : 'Waiting...'}
      </p>
    </div>
  )
}
```

---

## 8. Folder Structure

```
src/
├── components/
│   ├── atoms/
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Timer/
│   │   ├── Badge/
│   │   ├── Avatar/
│   │   ├── Spinner/
│   │   └── Card/
│   ├── molecules/
│   │   ├── PlayerCard/
│   │   ├── ScoreDisplay/
│   │   ├── AnswerOption/
│   │   ├── QuestionCard/
│   │   ├── GameSettings/
│   │   ├── ScoreRow/
│   │   └── ConnectionIndicator/
│   ├── organisms/
│   │   ├── PlayerList/
│   │   ├── QuestionDisplay/
│   │   ├── Scoreboard/
│   │   ├── GameControls/
│   │   ├── Header/
│   │   ├── Footer/
│   │   └── ConnectionStatus/
│   └── templates/
│       ├── GameLayout/
│       ├── LobbyLayout/
│       └── ResultsLayout/
├── pages/
│   ├── HomePage/
│   ├── GameRoom/
│   ├── ErrorPage/
│   └── NotFoundPage/
├── store/
│   ├── slices/
│   │   ├── playerSlice.ts
│   │   ├── gameSlice.ts
│   │   ├── questionsSlice.ts
│   │   ├── scoreboardSlice.ts
│   │   └── uiSlice.ts
│   ├── middleware/
│   │   └── socketMiddleware.ts
│   ├── selectors.ts
│   └── index.ts
├── services/
│   ├── socket.ts
│   ├── api.ts
│   └── storage.ts
├── hooks/
│   ├── useSocketEvents.ts
│   ├── useNavigation.ts
│   ├── useGameTimer.ts
│   ├── useLocalStorage.ts
│   └── useDeviceType.ts
├── utils/
│   ├── formatters.ts
│   ├── validators.ts
│   ├── constants.ts
│   └── helpers.ts
├── types/
│   ├── game.ts
│   ├── player.ts
│   ├── question.ts
│   └── socket.ts
├── styles/
│   ├── globals.css
│   ├── components.css
│   └── utilities.css
├── assets/
│   ├── icons/
│   ├── images/
│   └── sounds/
├── router/
│   ├── routes.ts
│   └── guards.ts
├── config/
│   ├── environment.ts
│   └── constants.ts
└── tests/
    ├── __mocks__/
    ├── utils/
    └── fixtures/
```

### Key Folder Descriptions:

- **components/**: Organized by atomic design principles (atoms, molecules, organisms, templates)
- **pages/**: Top-level route components representing full pages
- **store/**: Redux Toolkit configuration, slices, and middleware
- **services/**: External service integrations (Socket.IO, API calls)
- **hooks/**: Custom React hooks for shared logic
- **utils/**: Pure utility functions and helpers
- **types/**: TypeScript type definitions
- **router/**: Routing configuration and navigation guards
- **config/**: Environment and application configuration

This structure provides clear separation of concerns, promotes reusability, and maintains scalability as the application grows.

The frontend architecture emphasizes real-time responsiveness, mobile-first design, and type safety while maintaining developer productivity through well-organized code structure and comprehensive tooling setup.