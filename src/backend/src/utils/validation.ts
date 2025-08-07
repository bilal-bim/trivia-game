import Joi from 'joi';

export const createGameSchema = Joi.object({
  playerName: Joi.string()
    .trim()
    .min(1)
    .max(20)
    .pattern(/^[a-zA-Z0-9\s\-_]+$/)
    .required()
    .messages({
      'string.empty': 'Player name is required',
      'string.min': 'Player name must be at least 1 character',
      'string.max': 'Player name must be less than 20 characters',
      'string.pattern.base': 'Player name contains invalid characters'
    })
});

export const joinGameSchema = Joi.object({
  roomCode: Joi.string()
    .trim()
    .length(6)
    .pattern(/^[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{6}$/)
    .required()
    .messages({
      'string.empty': 'Room code is required',
      'string.length': 'Room code must be exactly 6 characters',
      'string.pattern.base': 'Invalid room code format'
    }),
  playerName: Joi.string()
    .trim()
    .min(1)
    .max(20)
    .pattern(/^[a-zA-Z0-9\s\-_]+$/)
    .required()
    .messages({
      'string.empty': 'Player name is required',
      'string.min': 'Player name must be at least 1 character',
      'string.max': 'Player name must be less than 20 characters',
      'string.pattern.base': 'Player name contains invalid characters'
    })
});

export const submitAnswerSchema = Joi.object({
  answer: Joi.number()
    .integer()
    .min(0)
    .max(3)
    .required()
    .messages({
      'number.base': 'Answer must be a number',
      'number.integer': 'Answer must be an integer',
      'number.min': 'Answer must be between 0 and 3',
      'number.max': 'Answer must be between 0 and 3'
    })
});

/**
 * Sanitizes player name input
 */
export function sanitizePlayerName(name: string): string {
  return name.trim().replace(/\s+/g, ' ').substring(0, 20);
}

/**
 * Sanitizes room code input
 */
export function sanitizeRoomCode(code: string): string {
  return code.trim().toUpperCase();
}