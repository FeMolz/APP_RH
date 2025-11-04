import { Router } from 'express';
import { funcionarioController } from './funcionario_controller.js';
import { isAuthenticated } from '../../middlewares/isAuthenticated.js';
import { isAdmin } from '../../middlewares/isAdmin.js';

const router = Router();

router.use(isAuthenticated);
router.use(isAdmin);

router.get('/', funcionarioController.listarTodosAtivos);

router.get('/:id', funcionarioController.buscarPorId);

router.post('/', funcionarioController.criarFuncionario);

router.put('/:id', funcionarioController.atualizarFuncionario);

// Desliga um funcionário (Soft Delete)
router.delete('/:id', funcionarioController.desligarFuncionario);

router.post('/:id/formacao', funcionarioController.adicionarFormacao);

export { router as funcionarioRoutes };