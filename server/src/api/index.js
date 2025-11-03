import express from 'express';
import { cargosRoutes } from './cargos/cargos_routes.js';
import { authRoutes } from './auth/auth_routes.js';
import { funcionarioRoutes } from './funcionarios/funcionario_routes.js';
import { epiRoutes } from './epis/epi_routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/cargos', cargosRoutes);
router.use('/funcionarios', funcionarioRoutes);
router.use('/epis', epiRoutes);

export default router;