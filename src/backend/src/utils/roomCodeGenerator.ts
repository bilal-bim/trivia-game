/**
 * Generates a 6-digit room code
 * Excludes easily confused characters like 0, O, I, 1
 */
export function generateRoomCode(): string {
  const chars = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  let result = '';
  
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

/**
 * Validates room code format
 */
export function isValidRoomCode(code: string): boolean {
  const pattern = /^[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{6}$/;
  return pattern.test(code);
}