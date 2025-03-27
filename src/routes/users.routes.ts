import { Router } from 'express';
import { UsersController } from '@/controllers/users.controller';
// import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const usersController = new UsersController();

router.post('/friend-request', usersController.sendFriendRequest);

router.get('/user/:email', usersController.findUser);

router.get('/search/:searchTerm', usersController.findMatchingUsers);

// Protected routes
// router.get('/users', authMiddleware, userController.getAllUsers);

export default router;
