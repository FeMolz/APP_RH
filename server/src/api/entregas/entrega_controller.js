import { entregaService } from './entrega_service.js';

export const entregaController = {
    async listarTodas(req, res, next) {
        try {
            const entregas = await entregaService.listarTodas();
            res.status(200).json(entregas);
        } catch (error) {
            next(error);
        }
    },

    async criar(req, res, next) {
        try {
            const dados = { ...req.body, usuario_id: req.user.id };
            console.log('Tentando criar entrega com dados:', dados);
            const entrega = await entregaService.criar(dados);
            res.status(201).json(entrega);
        } catch (error) {
            console.error('Erro ao criar entrega:', error);
            next(error);
        }
    },

    async listarPorFuncionario(req, res, next) {
        try {
            const { id } = req.params;
            const { status } = req.query;
            const entregas = await entregaService.listarPorFuncionario(id, status);
            res.json(entregas);
        } catch (error) {
            next(error);
        }
    },

    async listarVencidos(req, res, next) {
        try {
            const vencidos = await entregaService.listarVencidos();
            res.json(vencidos);
        } catch (error) {
            next(error);
        }
    },

    async devolver(req, res, next) {
        try {
            const { id } = req.params;
            const { data_devolucao } = req.body;
            const entrega = await entregaService.devolver(id, data_devolucao);
            res.json(entrega);
        } catch (error) {
            next(error);
        }
    }
};
