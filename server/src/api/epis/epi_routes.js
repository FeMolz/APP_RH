import { Router } from 'express';
import { epiController } from './epi_controller.js';
import { isAuthenticated } from '../../middlewares/isAuthenticated.js';
import { isAdmin } from '../../middlewares/isAdmin.js';

const router = Router();

router.use(isAuthenticated);

router.get('/', epiController.listarTodosAtivos);

router.get('/:id', epiController.buscarPorId);

router.post('/', isAdmin, epiController.criarEpi);

router.put('/:id', isAdmin, epiController.atualizarEpi);

router.delete('/:id', isAdmin, epiController.inativarEpi);

export { router as epiRoutes };