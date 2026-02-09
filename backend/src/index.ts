import express, { Application } from 'express';
import cors from 'cors';
import { config } from './config';
import { connectDatabase } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import { insertPredefinedUsers } from './config/PredefinedUsers';

// Import controllers
import fabricController from './controllers/FabricController';
import doctorController from './controllers/DoctorController';
import patientController from './controllers/PatientController';

const app: Application = express();

// Middleware
app.use(cors({
    origin: '*', // Allow all origins - adjust for production
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/fabric', fabricController);
app.use('/fabric/doctor', doctorController);
app.use('/fabric/patient', patientController);

// Health check endpoint
app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'OK', message: 'WELLNEST Backend is running' });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const startServer = async () => {
    try {
        // Connect to MongoDB
        await connectDatabase();

        // Seed Predefined Users
        await insertPredefinedUsers();

        // Start listening
        app.listen(config.port, () => {
            console.log('='.repeat(50));
            console.log('🚀 WELLNEST Backend Server Started');
            console.log('='.repeat(50));
            console.log(`📡 Server running on port: ${config.port}`);
            console.log(`🌍 Environment: ${config.nodeEnv}`);
            console.log(`🗄️  MongoDB: Connected`);
            console.log(`🔗 Fabric Network: Ready`);
            console.log('='.repeat(50));
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

export default app;
