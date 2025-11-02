import express from 'express';
import { cargosRoutes } from './cargos/cargos_routes.js';
import { authRoutes } from './auth/auth_routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/cargos', cargosRoutes);

export default router;