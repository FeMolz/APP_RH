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

  async listarTodosInativos(req, res, next) {
    try {
      const cargos = await cargosService.listarInativos();
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

  async handleAdicionarQuesito(req, res, next) {
    try {
      const { id: cargo_id } = req.params;
      const { quesito_id } = req.body;

      if (!quesito_id) {
        return res.status(400).json({ message: 'O campo quesito_id é obrigatório.' });
      }

      await cargosService.adicionarQuesito(cargo_id, quesito_id);
      res.status(201).json({ message: 'Quesito vinculado com sucesso.' });
    } catch (error) {
      if (error.code === 'P2003') {
        return res.status(404).json({ message: 'Cargo ou Quesito não encontrado.' });
      }
      if (error.code === 'P2002') {
        return res.status(409).json({ message: 'Este quesito já está vinculado a este cargo.' });
      }
      next(error);
    }
  },

  async handleRemoverQuesito(req, res, next) {
    try {
      const { id: cargo_id, quesitoId: quesito_id } = req.params;

      await cargosService.removerQuesito(cargo_id, quesito_id);
      res.status(204).send();
    } catch (error) {
      if (error.code === 'P2025') {
        return res.status(404).json({ message: 'Vínculo entre cargo e quesito não encontrado.' });
      }
      next(error);
    }
  },
};