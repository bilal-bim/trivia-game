// Jest setup file
import { GameService } from '../services/GameService';

// Global test timeout
jest.setTimeout(10000);

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
};

// Helper to create test game service
export function createTestGameService(): GameService {
  return new GameService();
}

// Helper to create test player data
export function createTestPlayer(name: string = 'TestPlayer') {
  return {
    playerName: name
  };
}

// Helper to create test room data
export function createTestRoom() {
  return {
    playerName: 'HostPlayer'
  };
}

// Simple test to prevent "no tests" error
describe('Setup', () => {
  it('should export helper functions', () => {
    expect(createTestGameService).toBeDefined();
    expect(createTestPlayer).toBeDefined();
    expect(createTestRoom).toBeDefined();
  });
});