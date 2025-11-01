import express from 'express';
import { cargosRoutes } from './cargos/cargos_routes.js';

const router = express.Router();

router.use('/cargos', cargosRoutes);

export default router;