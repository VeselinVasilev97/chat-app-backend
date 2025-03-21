import { Router } from 'express';
import { UsersController } from '@/controllers/users.controller';
// import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const usersController = new UsersController();

router.post('/find', usersController.findUserByUsername);


// Protected routes
// router.get('/users', authMiddleware, userController.getAllUsers);

export default router; 