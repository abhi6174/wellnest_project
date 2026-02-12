import { Router, Request, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import { jwtUtils } from '../middleware/jwtUtils';
import { fabricService } from '../services/FabricService';
import { userInfoService } from '../services/UserInfoService';
import { fabricUserRegistration } from '../services/FabricUserRegistration';
import { LoginRequest } from '../types/LoginRequest';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * POST /fabric/login
 * User authentication
 */
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { username, password, mspId }: LoginRequest = req.body;

        if (!username || !password || !mspId) {
            res.status(400).json({ message: 'Username, password, and mspId are required' });
            return;
        }

        // Find user
        const user = await userInfoService.findByUsername(username, mspId);

        if (!user) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        // Verify password
        const isPasswordValid = await userInfoService.verifyPassword(user, password);

        if (!isPasswordValid) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        // Generate JWT
        const token = jwtUtils.generateToken(username, mspId);

        console.log(`User ${username} authenticated successfully`);
        res.status(200).json({ token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Login failed' });
    }
});

/**
 * POST /fabric/submit
 * Submit transaction to blockchain
 */
router.post('/submit', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { channelName, chaincodeName, functionName, args } = req.body;

        if (!channelName || !chaincodeName || !functionName) {
            res.status(400).json({ message: 'Missing required parameters' });
            return;
        }

        const username = req.user!.username;
        const mspId = req.user!.mspId;

        console.log('JWT received, submitting transaction');

        const result = await fabricService.submitTransaction(
            channelName,
            chaincodeName,
            functionName,
            args || [],
            username,
            mspId
        );

        res.status(200).send(result);
    } catch (error) {
        console.error('Submit transaction error:', error);
        res.status(500).json({ message: 'Transaction submission failed' });
    }
});

/**
 * GET /fabric/query
 * Query blockchain
 */
router.get('/query', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { channelName, chaincodeName, functionName } = req.query;
        const args = req.query.args ? (Array.isArray(req.query.args) ? req.query.args : [req.query.args]) : [];

        if (!channelName || !chaincodeName || !functionName) {
            res.status(400).json({ message: 'Missing required parameters' });
            return;
        }

        const username = req.user!.username;
        const mspId = req.user!.mspId;

        const result = await fabricService.evaluateTransaction(
            channelName as string,
            chaincodeName as string,
            functionName as string,
            args as string[],
            username,
            mspId
        );

        res.status(200).send(result);
    } catch (error) {
        console.error('Query transaction error:', error);
        res.status(500).json({ message: 'Query failed' });
    }
});

/**
 * POST /fabric/enrollAdmin
 * Enroll admin (placeholder)
 */
router.post('/enrollAdmin', async (_req: Request, res: Response) => {
    res.status(200).send('Admin enrolled successfully');
});

/**
 * POST /fabric/register
 * Register new user
 */
router.post('/register', authMiddleware, upload.single('file'), async (req: AuthRequest, res: Response) => {
    try {
        const { username, password } = req.body;
        const mspId = req.user!.mspId;

        if (!username || !password) {
            res.status(400).json({ message: 'Username and password are required' });
            return;
        }

        console.log('Register controller');

        // No file upload during V2 registration
        // Initial EHR data is empty.

        console.log('Received registration request');

        // Add user to database
        let userAdded = await userInfoService.addUser({ username, password, mspId });

        // If adding to DB failed, check if user already exists
        if (!userAdded) {
            const existingUser = await userInfoService.findByUsername(username, mspId);
            if (existingUser) {
                console.log(`User ${username} already exists in DB, proceeding to Fabric enrollment`);
                userAdded = true;
            }
        }

        // Add user to Fabric network
        const fabricUserAdded = await fabricUserRegistration.addUser(username, password, mspId);

        if (userAdded && fabricUserAdded) {
            res.status(200).send('User registered successfully');
        } else {
            res.status(500).send('User registration failed');
        }
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Registration failed' });
    }
});

export default router;
