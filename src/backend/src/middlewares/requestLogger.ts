import { Request, Response, NextFunction } from 'express';

/**
 * Request logging middleware
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  const { method, url, ip } = req;
  
  // Log request
  console.log(`→ ${method} ${url} - ${ip} - ${new Date().toISOString()}`);

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    const statusEmoji = statusCode >= 400 ? '❌' : '✅';
    
    console.log(`← ${statusEmoji} ${method} ${url} - ${statusCode} - ${duration}ms`);
  });

  next();
}

/**
 * Rate limiting information logger
 */
export function rateLimitLogger(req: Request, res: Response, next: NextFunction): void {
  // Simple rate limiting tracking
  const clientId = req.ip || 'unknown';
  const now = Date.now();
  
  // In production, you'd use Redis or a proper rate limiting solution
  req.rateLimit = {
    clientId,
    timestamp: now
  };

  next();
}

declare global {
  namespace Express {
    interface Request {
      rateLimit?: {
        clientId: string;
        timestamp: number;
      };
    }
  }
}