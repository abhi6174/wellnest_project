import jwt from 'jsonwebtoken';
import { config } from '../config';

export interface JwtPayload {
    username: string;
    mspId: string;
    iat?: number;
    exp?: number;
}

export class JwtUtils {
    private static instance: JwtUtils;

    private constructor() { }

    public static getInstance(): JwtUtils {
        if (!JwtUtils.instance) {
            JwtUtils.instance = new JwtUtils();
        }
        return JwtUtils.instance;
    }

    /**
     * Extract JWT from Authorization header
     */
    public getJwtFromHeader(authHeader: string | undefined): string | null {
        if (authHeader && authHeader.startsWith('Bearer ')) {
            return authHeader.substring(7);
        }
        return null;
    }

    /**
     * Generate JWT token from username and mspId
     */
    public generateToken(username: string, mspId: string): string {
        const payload: JwtPayload = {
            username,
            mspId,
        };

        return jwt.sign(payload, config.jwt.secret, {
            expiresIn: config.jwt.expirationMs,
        });
    }

    /**
     * Get username from JWT token
     */
    public getUsernameFromToken(token: string): string {
        const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
        return decoded.username;
    }

    /**
     * Get mspId from JWT token
     */
    public getMspIdFromToken(token: string): string {
        const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
        return decoded.mspId;
    }

    /**
     * Validate JWT token
     */
    public validateToken(token: string): boolean {
        try {
            jwt.verify(token, config.jwt.secret);
            return true;
        } catch (error) {
            if (error instanceof jwt.JsonWebTokenError) {
                console.error('Invalid JWT token:', error.message);
            } else if (error instanceof jwt.TokenExpiredError) {
                console.error('JWT token is expired:', error.message);
            } else {
                console.error('JWT validation error:', error);
            }
            return false;
        }
    }
}

export const jwtUtils = JwtUtils.getInstance();
