import * as bcrypt from 'bcryptjs';
import { UserEntity, IUserEntity } from '../models/UserEntity';

export class UserInfoService {
    private static instance: UserInfoService;

    private constructor() { }

    public static getInstance(): UserInfoService {
        if (!UserInfoService.instance) {
            UserInfoService.instance = new UserInfoService();
        }
        return UserInfoService.instance;
    }

    /**
     * Add new user to database
     */
    public async addUser(user: { username: string; password: string; mspId: string }): Promise<boolean> {
        try {
            // Check if user already exists
            const existingUser = await UserEntity.findOne({
                username: user.username,
                mspId: user.mspId,
            });

            if (existingUser) {
                console.log('User already exists');
                return false;
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(user.password, 10);

            // Create new user
            const newUser = new UserEntity({
                username: user.username,
                password: hashedPassword,
                mspId: user.mspId,
            });

            await newUser.save();
            console.log(`User registered: ${user.username} (${user.mspId})`);

            return true;
        } catch (error) {
            console.error('Error adding user:', error);
            return false;
        }
    }

    /**
     * Find user by username and mspId
     */
    public async findByUsername(username: string, mspId: string): Promise<IUserEntity | null> {
        try {
            const user = await UserEntity.findOne({ username, mspId });
            return user;
        } catch (error) {
            console.error('Error finding user:', error);
            return null;
        }
    }

    /**
     * Verify user password
     */
    public async verifyPassword(user: IUserEntity, password: string): Promise<boolean> {
        return bcrypt.compare(password, user.password);
    }
}

export const userInfoService = UserInfoService.getInstance();
