import { useEffect, useCallback, useState } from 'react';
import { socketService } from '../services/socket';
import { useAppDispatch } from './redux';
import {
  setRoomCode,
  setPlayers,
  removePlayer,
  setCurrentQuestion,
  setQuestionNumber,
  setTotalQuestions,
  setTimeLeft,
  setPhase,
  setIsHost,
  updatePlayerScores,
} from '../store/gameSlice';

export const useSocket = () => {
  const dispatch = useAppDispatch();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = socketService.connect();
    console.log('Socket initialization in useSocket hook');

    // Handle connection state
    socket.on('connect', () => {
      console.log('Socket connected in hook!');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected in hook!');
      setIsConnected(false);
    });

    // Handle socket events
    socketService.on('room-joined', (data) => {
      console.log('Room joined event received:', data);
      dispatch(setRoomCode(data.roomCode));
      // Players will be updated via players-update event
      // The joining player is not a host
      dispatch(setIsHost(false));
    });

    socketService.on('room-created', (data) => {
      console.log('Room created event received:', data);
      dispatch(setRoomCode(data.roomCode));
      dispatch(setIsHost(true));
      // Players will be updated via the players-update event
    });

    socketService.on('players-update', (data) => {
      console.log('Players update received:', data);
      dispatch(setPlayers(data.players));
    });

    socketService.on('player-joined', (data) => {
      console.log('Player joined:', data);
      // Players list will be updated via players-update event
    });

    socketService.on('player-left', (data) => {
      console.log('Player left:', data);
      dispatch(removePlayer(data.playerId));
    });

    socketService.on('game-started', () => {
      dispatch(setPhase('question'));
    });

    socketService.on('question-start', (data) => {
      dispatch(setCurrentQuestion(data.question));
      dispatch(setQuestionNumber(data.questionNumber));
      dispatch(setTotalQuestions(data.totalQuestions));
      dispatch(setPhase('question'));
      dispatch(setTimeLeft(data.question.timeLimit));
    });

    socketService.on('time-update', (data) => {
      dispatch(setTimeLeft(data.timeLeft));
    });

    socketService.on('question-end', (data) => {
      dispatch(updatePlayerScores(data.scores));
      dispatch(setPhase('scoreboard'));
    });

    socketService.on('game-over', (data) => {
      dispatch(setPlayers(data.finalScores));
      dispatch(setPhase('gameOver'));
    });

    socketService.on('error', (data) => {
      console.error('Socket error:', data.message);
      // You might want to show a toast notification here
    });

    return () => {
      socketService.disconnect();
    };
  }, [dispatch]);

  const joinRoom = useCallback((roomCode: string, playerName: string) => {
    console.log('Attempting to join room:', roomCode, 'as', playerName);
    const socket = socketService.getSocket();
    if (socket) {
      socket.emit('join-room', { roomCode, playerName }, (response: any) => {
        console.log('Join room response:', response);
        if (response.success) {
          console.log('Successfully joined room with playerId:', response.playerId);
          // Set room code and navigate to lobby
          dispatch(setRoomCode(roomCode));
          dispatch(setPhase('lobby'));
          dispatch(setIsHost(false));
          // The players list will be updated via the players-update event
        } else {
          console.error('Failed to join room:', response.error);
          alert(`Failed to join room: ${response.error}`);
        }
      });
    }
  }, [dispatch]);

  const createRoom = useCallback((playerName: string) => {
    console.log('Attempting to create room as:', playerName);
    const socket = socketService.getSocket();
    if (socket) {
      socket.emit('create-room', { playerName }, (response: any) => {
        console.log('Create room response:', response);
        if (response.success) {
          console.log('Room created with code:', response.roomCode);
          // Set room code and navigate to lobby
          dispatch(setRoomCode(response.roomCode));
          dispatch(setPhase('lobby'));
          dispatch(setIsHost(true));
          // Initialize with the host player
          dispatch(setPlayers([{
            id: response.playerId,
            name: playerName,
            score: 0,
            isHost: true
          }]));
        } else {
          console.error('Failed to create room:', response.error);
        }
      });
    }
  }, [dispatch]);

  const startGame = useCallback(() => {
    const socket = socketService.getSocket();
    if (socket) {
      socket.emit('start-game', (response: any) => {
        console.log('Start game response:', response);
      });
    }
  }, []);

  const submitAnswer = useCallback((answer: number) => {
    const socket = socketService.getSocket();
    if (socket) {
      socket.emit('submit-answer', { answer }, (response: any) => {
        console.log('Submit answer response:', response);
      });
    }
  }, []);

  const nextQuestion = useCallback(() => {
    const socket = socketService.getSocket();
    if (socket) {
      socket.emit('next-question', (response: any) => {
        console.log('Next question response:', response);
      });
    }
  }, []);

  return {
    joinRoom,
    createRoom,
    startGame,
    submitAnswer,
    nextQuestion,
    isConnected,
  };
};