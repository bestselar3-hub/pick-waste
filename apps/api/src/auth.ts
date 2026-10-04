import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';

export type AppRole = 'admin' | 'customer' | 'driver';

export type AuthUser = {
  id: string;
  email: string;
  role: AppRole;
};

export type AuthenticatedRequest = Request & {
  user?: AuthUser;
};

const JWT_SECRET = process.env.JWT_SECRET ?? 'pickwaste-dev-secret';

export const signToken = (user: AuthUser) =>
  jwt.sign({ sub: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const token = header.replace('Bearer ', '');
    const payload = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;

    req.user = {
      id: String(payload.sub ?? ''),
      email: String(payload.email ?? ''),
      role: String(payload.role ?? 'customer') as AppRole
    };

    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const requireRole = (...allowedRoles: AppRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'You do not have permission to access this resource' });
    }

    return next();
  };
};

export const hashPassword = async (password: string) => bcrypt.hash(password, 10);
export const comparePassword = async (password: string, hashedPassword: string) => bcrypt.compare(password, hashedPassword);
