import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthPayload {
  userId: string;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

const getSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret === 'your_jwt_secret_change_in_production') {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET must be set in production');
    }
    return 'dev-jwt-secret-do-not-use-in-production';
  }
  return secret;
};

export function generateToken(payload: AuthPayload): string {
  return jwt.sign(payload, getSecret(), { expiresIn: '7d' });
}

export function authRequired(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: { message: 'Authentication required', code: 'UNAUTHORIZED' },
    });
  }

  const token = header.slice(7);
  try {
    const decoded = jwt.verify(token, getSecret()) as AuthPayload;
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({
      success: false,
      error: { message: 'Invalid or expired token', code: 'UNAUTHORIZED' },
    });
  }
}

export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    const token = header.slice(7);
    try {
      const decoded = jwt.verify(token, getSecret()) as AuthPayload;
      req.user = decoded;
    } catch {
      // Token invalid, continue without user
    }
  }
  next();
}
