import express from 'express';
import { Database } from './config/database';
import dotenv from 'dotenv';
import userRoutes from './routes/user.routes';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/api', userRoutes);

// Initialize database
async function initializeApp() {
    try {
        await Database.getInstance();
        
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to initialize app:', error);
        process.exit(1);
    }
}

initializeApp();