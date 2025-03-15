import { Router } from 'express';
import { MessagesController } from '../controllers/messages.controller';

// import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const messageRoutes = new MessagesController();

// Private routes
router.get('/messages', messageRoutes.getMessages);



export default router; 