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
  },

  async gerarRelatorio(req, res, next) {
    try {
      const { funcionario_id, data_inicio, data_fim } = req.query;
      
      if (!funcionario_id || !data_inicio || !data_fim) {
        return res.status(400).json({ error: "Parâmetros funcionario_id, data_inicio e data_fim são obrigatórios." });
      }

      const entregas = await entregaEpiService.buscarEntregasPorPeriodo(
        funcionario_id,
        data_inicio,
        data_fim
      );
      
      res.status(200).json(entregas);
    } catch (error) {
      next(error);
    }
  }

};
