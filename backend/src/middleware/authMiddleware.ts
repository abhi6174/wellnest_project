import { Request, Response, NextFunction } from 'express';
import { jwtUtils } from './jwtUtils';

// Extend Express Request to include user info
export interface AuthRequest extends Request {
    user?: {
        username: string;
        mspId: string;
    };
}

/**
 * Middleware to authenticate JWT tokens
 */
export const authMiddleware = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): void => {
    try {
        const authHeader = req.headers.authorization;
        const token = jwtUtils.getJwtFromHeader(authHeader);

        if (!token) {
            res.status(401).json({ message: 'No token provided' });
            return;
        }

        if (!jwtUtils.validateToken(token)) {
            res.status(401).json({ message: 'Invalid or expired token' });
            return;
        }

        // Extract user info from token
        const username = jwtUtils.getUsernameFromToken(token);
        const mspId = jwtUtils.getMspIdFromToken(token);

        // Attach user info to request
        req.user = { username, mspId };

        next();
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(401).json({ message: 'Authentication failed' });
    }
};
