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
import LOG_COLORS from './utils/general';

// Load environment variables
dotenv.config();
const app = express();
const server = createServer(app);

// Allow all origins
app.use(cors({
  origin: ["http://localhost:5173"], // Add your frontend URL here
  credentials: true  // Important for cookies
}));
app.use(express.json());
app.use(cookieParser());

// Initialize Socket.IO with custom options
export const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // Make sure this is your frontend URL
    credentials: true  // Important for cookie handling
  },
  pingTimeout: 20000,     // Set to 5 seconds for fast disconnection detection
  pingInterval: 2500,    // Set to 2.5 seconds for sending pings
  transports: ['websocket', 'polling'], // Keep both options for fallback
  connectionStateRecovery: {
    // the backup duration of the sessions and the packets
    maxDisconnectionDuration: 2 * 60 * 1000,
    // whether to skip middlewares upon successful recovery
    // skipMiddlewares: true,
  },
});

// Routes
app.use('/api', authRoutes);
app.use('/api', messagesRoutes);
app.use('/api', usersRoutes);

// Initialize database and start server
async function initializeApp() {
  try {
    initializeWebSocket();
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      console.log(LOG_COLORS.green, `Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to initialize app:', error);
    process.exit(1);
  }
}

initializeApp();
