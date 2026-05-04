import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

declare global {
    namespace Express {
        interface Request {
            user?: any; // To avoid strict type issues everywhere, use any or an exact shape
        }
    }
}

export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
        [key: string]: any;
    };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded || typeof decoded === 'string') {
        return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
    }

    req.user = decoded as any;
    next();
};

export const requireRole = (role: string) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user || req.user.role !== role) {
            return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
        }
        next();
    };
};
