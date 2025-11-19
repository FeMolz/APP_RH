import { Router } from 'express';
import { formacaoController } from './formacao_controller.js';
import { isAuthenticated } from '../../middlewares/isAuthenticated.js';
import { isAdmin } from '../../middlewares/isAdmin.js';

const router = Router();

router.delete(
  '/:id',
  isAuthenticated,
  isAdmin,
  formacaoController.handleDeletar
);

router.post(
  '/',
  isAuthenticated,
  isAdmin,
  formacaoController.handleCreate
);

router.get(
  '/',
  isAuthenticated,
  isAdmin,
  formacaoController.handleListar
);

router.put(
  '/:id',
  isAuthenticated,
  isAdmin,
  formacaoController.handleAtualizar
);

export { router as formacaoRoutes };