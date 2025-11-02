import { Router } from 'express';
import { cargosController } from './cargos_controller.js';
import { isAuthenticated } from '../../middlewares/isAuthenticated.js';
import { isAdmin } from '../../middlewares/isAdmin.js';

const router = Router();

router.get(
  '/', 
  isAuthenticated, 
  cargosController.listarTodosAtivos
);

router.get(
  '/:id', 
  isAuthenticated, 
  cargosController.buscarPorId
);

router.post(
  '/', 
  isAuthenticated, 
  isAdmin, 
  cargosController.criarCargo
);

router.put(
  '/:id', 
  isAuthenticated, 
  isAdmin, 
  cargosController.atualizarCargo
);

router.delete(
  '/:id', 
  isAuthenticated, 
  isAdmin, 
  cargosController.inativarCargo
);

export { router as cargosRoutes };