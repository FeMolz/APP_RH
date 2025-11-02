import { Router } from 'express';
import { authController } from './auth_controller.js';

const router = Router();

router.post('/register', authController.handleRegister);

router.post('/login', authController.handleLogin);

export { router as authRoutes };