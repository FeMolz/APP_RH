import { entregaEpiService } from './entrega_epi_service.js';

export const entregaEpiController = {

  async listarPendentes(req, res, next) {
    try {
      const pendencias = await entregaEpiService.listarPendentes();
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.status(200).json(pendencias);
    } catch (error) {
      next(error);
    }
  },

  async registrarEntrega(req, res, next) {
    try {
      const novaEntrega = await entregaEpiService.registrarEntrega(req.body);
      res.status(201).json(novaEntrega);
    } catch (error) {
      next(error);
    }
  }

};
