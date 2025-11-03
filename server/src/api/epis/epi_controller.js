import { epiService } from './epi_service.js';

export const epiController = {

  async criarEpi(req, res, next) {
    try {
      const novoEpi = await epiService.criar(req.body);
      res.status(201).json(novoEpi);
    } catch (error) {
      if (error.code === 'P2002' && error.meta?.target?.includes('ca_numero')) {
        return res.status(409).json({ message: 'Este número de C.A. (Certificado de Aprovação) já está cadastrado.' });
      }
      next(error);
    }
  },

  async listarTodosAtivos(req, res, next) {
    try {
      const epis = await epiService.listarAtivos();
      res.status(200).json(epis);
    } catch (error) {
      next(error);
    }
  },

  async buscarPorId(req, res, next) {
    try {
      const { id } = req.params;
      const epi = await epiService.buscarPorId(id);
      
      if (!epi) {
        return res.status(404).json({ message: 'EPI não encontrado.' });
      }
      res.status(200).json(epi);
    } catch (error) {
      next(error);
    }
  },

  async atualizarEpi(req, res, next) {
    try {
      const { id } = req.params;
      const dados = req.body;
      const epiAtualizado = await epiService.atualizar(id, dados);
      res.status(200).json(epiAtualizado);
    } catch (error) {
      next(error);
    }
  },

  async inativarEpi(req, res, next) {
    try {
      const { id } = req.params;
      await epiService.inativar(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};