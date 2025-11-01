import { cargosService } from './cargos_service.js';

export const cargosController = {
  
  async criarCargo(req, res, next) {
    try {
      const novoCargo = await cargosService.criar(req.body);
      res.status(201).json(novoCargo);
    } catch (error) {
      next(error);
    }
  },

  async listarTodosAtivos(req, res, next) {
    try {
      const cargos = await cargosService.listarAtivos();
      res.status(200).json(cargos);
    } catch (error) {
      next(error);
    }
  },

  async buscarPorId(req, res, next) {
    try {
      const { id } = req.params;
      const cargo = await cargosService.buscarPorId(id);
      
      if (!cargo) {
        return res.status(404).json({ message: 'Cargo não encontrado.' });
      }
      res.status(200).json(cargo);
    } catch (error) {
      next(error);
    }
  },

  async atualizarCargo(req, res, next) {
    try {
      const { id } = req.params;
      const dados = req.body;
      const cargoAtualizado = await cargosService.atualizar(id, dados);
      res.status(200).json(cargoAtualizado);
    } catch (error) {
      next(error);
    }
  },

  async inativarCargo(req, res, next) {
    try {
      const { id } = req.params;
      await cargosService.inativar(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};