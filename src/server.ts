import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import messagesRoutes from './routes/message.routes';
import usersRoutes from './routes/users.routes';
import { createServer } from "http";
import { Server } from "socket.io";
import cors from 'cors';
import initializeWebSocket from './websocket';
import cookieParser from 'cookie-parser';
// import {authMiddleware} from './middleware/auth.middleware';
// Load environment variables
dotenv.config();
const app = express();
const server = createServer(app);

//allow all origins
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true  // This is important for cookies
  }));
app.use(express.json());
app.use(cookieParser());

// Initialize Socket.IO with the HTTP server
export const io = new Server(server);



// Routes
app.use('/api', authRoutes);
app.use('/api', messagesRoutes);
app.use('/users', usersRoutes);
// Initialize database
async function initializeApp() {
    try {
        initializeWebSocket();
        const PORT = process.env.PORT || 3000;
        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to initialize app:', error);
        process.exit(1);
    }
}

initializeApp();