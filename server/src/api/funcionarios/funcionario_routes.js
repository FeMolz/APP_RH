import { Router } from 'express';
import { funcionarioController } from './funcionario_controller.js';
import { isAuthenticated } from '../../middlewares/isAuthenticated.js';
import { isAdmin } from '../../middlewares/isAdmin.js';

const router = Router();

// Rota pública para aniversariantes
router.get('/birthdays', funcionarioController.listarAniversariantes);

// Rotas protegidas
router.use(isAuthenticated);

router.get('/', funcionarioController.listarTodosAtivos);

router.get('/inativos', funcionarioController.listarTodosInativos);

router.get('/:id', funcionarioController.buscarPorId);

router.post('/', isAdmin, funcionarioController.criarFuncionario);

router.put('/:id', isAdmin, funcionarioController.atualizarFuncionario);

// Desliga um funcionário (Soft Delete)
router.delete('/:id', isAdmin, funcionarioController.desligarFuncionario);

router.post('/:id/formacao', isAdmin, funcionarioController.adicionarFormacao);

export { router as funcionarioRoutes };