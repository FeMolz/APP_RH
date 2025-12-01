import express from 'express';
import { cargosRoutes } from './cargos/cargos_routes.js';
import { authRoutes } from './auth/auth_routes.js';
import { funcionarioRoutes } from './funcionarios/funcionario_routes.js';
import { epiRoutes } from './epis/epi_routes.js';
import { formacaoRoutes } from './formacoes/formacao_routes.js';
import { quesitoRoutes } from './quesitos/quesito_routes.js';
import { entregaRoutes } from './entregas/entrega_routes.js';
import relatorioRoutes from './relatorios/relatorio_routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/cargos', cargosRoutes);
router.use('/funcionarios', funcionarioRoutes);
router.use('/epis', epiRoutes);
router.use('/formacoes', formacaoRoutes);
router.use('/quesitos', quesitoRoutes);
router.use('/entregas', entregaRoutes);
router.use('/relatorios', relatorioRoutes);

export default router;