import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, (...args: any[]) => void> = new Map();

  connect(url: string = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    console.log('Connecting to socket server at:', url);
    this.socket = io(url, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('Socket connected successfully!');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    // Re-attach any previously registered listeners
    this.listeners.forEach((callback, event) => {
      this.socket?.on(event, callback);
    });

    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
    }
  }

  emit(event: string, data: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn(`Socket not connected. Cannot emit event: ${event}`);
    }
  }

  on(event: string, callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on(event, callback);
      console.log(`Registered listener for event: ${event}`);
    }
    // Store the listener for re-attachment on reconnect
    this.listeners.set(event, callback);
  }

  off(event: string): void {
    if (this.socket) {
      this.socket.off(event);
    }
    this.listeners.delete(event);
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

export const socketService = new SocketService();