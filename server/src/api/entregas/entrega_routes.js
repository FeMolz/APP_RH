import { Router } from 'express';
import { entregaController } from './entrega_controller.js';
import { isAuthenticated } from '../../middlewares/isAuthenticated.js';

const router = Router();

router.use(isAuthenticated);

router.get('/', entregaController.listarTodas);
router.get('/vencidos', entregaController.listarVencidos);
router.get('/relatorio', entregaController.listarParaRelatorio);
router.get('/:id', entregaController.listarPorFuncionario);
router.post('/', entregaController.criar);
router.put('/:id/devolver', entregaController.devolver);

export { router as entregaRoutes };
