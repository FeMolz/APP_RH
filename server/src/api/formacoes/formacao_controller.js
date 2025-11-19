import { formacaoService } from './formacao_service.js';

export const formacaoController = {

  handleDeletar: async (req, res, next) => {
    try {
      const { id } = req.params;
      await formacaoService.deletar(id);
      res.status(204).send();
    } catch (error) {
      if (error.code === 'P2025') {
        return res.status(404).json({ message: 'Registro de formação não encontrado.' });
      }
      next(error);
    }
  },

  handleCreate: async (req, res, next) => {
    try {
      const data = req.body;
      const formacao = await formacaoService.create(data);
      res.status(201).json(formacao);
    } catch (error) {
      next(error);
    }
  },

  handleListar: async (req, res, next) => {
    try {
      const formacoes = await formacaoService.listar();
      res.status(200).json(formacoes);
    } catch (error) {
      next(error);
    }
  },

  handleAtualizar: async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = req.body;
      const formacao = await formacaoService.atualizar(id, data);
      res.status(200).json(formacao);
    } catch (error) {
      next(error);
    }
  },
};