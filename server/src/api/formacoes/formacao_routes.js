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

export { router as formacaoRoutes };