import { Router } from 'express';
import { epiController } from './epi_controller.js';
import { isAuthenticated } from '../../middlewares/isAuthenticated.js';
import { isAdmin } from '../../middlewares/isAdmin.js';

const router = Router();

router.use(isAuthenticated);
router.use(isAdmin);

router.get('/', epiController.listarTodosAtivos);

router.get('/:id', epiController.buscarPorId);

router.post('/', epiController.criarEpi);

router.put('/:id', epiController.atualizarEpi);

router.delete('/:id', epiController.inativarEpi);

export { router as epiRoutes };