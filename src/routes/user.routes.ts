import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
// import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const userController = new UserController();

// Public routes
router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/validate', userController.validateUser);

// Protected routes
// router.get('/users', authMiddleware, userController.getAllUsers);

export default router; 