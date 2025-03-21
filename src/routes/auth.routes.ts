import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
// import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const authController = new AuthController();
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/validate', authController.validateUser);


// Protected routes
// router.get('/users', authMiddleware, userController.getAllUsers);

export default router; 