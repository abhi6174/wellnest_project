import dotenv from 'dotenv';

dotenv.config();

export const config = {
    port: process.env.PORT || 8080,
    nodeEnv: process.env.NODE_ENV || 'development',

    mongodb: {
        uri: process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/test?authSource=admin',
        username: process.env.MONGODB_USERNAME || 'admin',
        password: process.env.MONGODB_PASSWORD || 'password',
    },

    jwt: {
        secret: process.env.JWT_SECRET || 'mySecretKey123912738aopsgjnspkmndfsopkvajoirjg94gf2opfng2moknm',
        expirationMs: parseInt(process.env.JWT_EXPIRATION_MS || '3000000', 10),
    },

    fabric: {
        connectionProfilePath: process.env.FABRIC_CONNECTION_PROFILE_PATH || 'src/main/resources/static/connection-profiles',
        walletPath: process.env.FABRIC_WALLET_PATH || 'src/main/resources/static/connection-profiles',
    },

    encryption: {
        secretKey: process.env.ENCRYPTION_SECRET_KEY || 'MySuperSecretKey',
    },
};
