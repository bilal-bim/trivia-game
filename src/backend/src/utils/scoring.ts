import { PlayerAnswer, Question, GameSettings } from '../types';

/**
 * Calculate points for a correct answer with time bonus
 */
export function calculatePoints(
  answer: PlayerAnswer,
  question: Question,
  settings: GameSettings
): number {
  if (!answer) return 0;
  
  const basePoints = getBasePoints(question.difficulty);
  const maxTime = settings.questionTimeLimit * 1000; // Convert to milliseconds
  const timeElapsed = answer.timeElapsed;
  
  // Time bonus: faster answers get more points (up to 50% bonus)
  let timeBonus = 0;
  if (settings.timeBonus && timeElapsed < maxTime) {
    const timeRatio = 1 - (timeElapsed / maxTime);
    timeBonus = Math.floor(basePoints * 0.5 * timeRatio);
  }
  
  return basePoints + timeBonus;
}

/**
 * Get base points based on question difficulty
 */
function getBasePoints(difficulty: string): number {
  switch (difficulty) {
    case 'easy': return 100;
    case 'medium': return 200;
    case 'hard': return 300;
    default: return 100;
  }
}

/**
 * Calculate leaderboard from current scores
 */
export function calculateLeaderboard(scores: Map<string, number>, players: Map<string, any>): Array<{
  playerId: string;
  playerName: string;
  score: number;
}> {
  const leaderboard = Array.from(scores.entries())
    .map(([playerId, score]) => ({
      playerId,
      playerName: players.get(playerId)?.name || 'Unknown',
      score
    }))
    .sort((a, b) => b.score - a.score);
    
  return leaderboard;
}

/**
 * Check if answer is correct
 */
export function isCorrectAnswer(answer: number, question: Question): boolean {
  return answer === question.correctAnswer;
}