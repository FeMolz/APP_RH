import { Router } from 'express';
import { funcionarioController } from './funcionario_controller.js';
import { isAuthenticated } from '../../middlewares/isAuthenticated.js';
import { isAdmin } from '../../middlewares/isAdmin.js';

const router = Router();

// Rota pública para aniversariantes
router.get('/birthdays', funcionarioController.listarAniversariantes);

// Rotas protegidas
router.use(isAuthenticated);
router.use(isAdmin);

router.get('/', funcionarioController.listarTodosAtivos);

router.get('/inativos', funcionarioController.listarTodosInativos);

router.get('/:id', funcionarioController.buscarPorId);

router.post('/', funcionarioController.criarFuncionario);

router.put('/:id', funcionarioController.atualizarFuncionario);

// Desliga um funcionário (Soft Delete)
router.delete('/:id', funcionarioController.desligarFuncionario);

router.post('/:id/formacao', funcionarioController.adicionarFormacao);

export { router as funcionarioRoutes };