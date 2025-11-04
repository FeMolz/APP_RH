import { Router } from 'express';
import { quesitoController } from './quesito_controller.js';
import { isAuthenticated } from '../../middlewares/isAuthenticated.js';
import { isAdmin } from '../../middlewares/isAdmin.js';

const router = Router();

router.use(isAuthenticated);
router.use(isAdmin);

router.get('/', quesitoController.handleListar);

router.get('/:id', quesitoController.handleBuscarPorId);

router.post('/', quesitoController.handleCriar);

router.put('/:id', quesitoController.handleAtualizar);

router.delete('/:id', quesitoController.handleDeletar);

export { router as quesitoRoutes };