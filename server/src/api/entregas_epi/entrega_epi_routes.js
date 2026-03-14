import { Router } from 'express';
import { entregaEpiController } from './entrega_epi_controller.js';
import { isAuthenticated } from '../../middlewares/isAuthenticated.js';
import { isAdmin } from '../../middlewares/isAdmin.js';

const router = Router();

router.use(isAuthenticated);

// Acesso à tela e visualização das peendencias restritos aos Admins (Técnicos de Segurança/RH)
router.get('/pendentes', isAdmin, entregaEpiController.listarPendentes);
router.post('/', isAdmin, entregaEpiController.registrarEntrega);

export { router as entregasEpiRoutes };
