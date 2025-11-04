import { quesitoService } from './quesito_service.js';

export const quesitoController = {

  // POST /quesitos
  async handleCriar(req, res, next) {
    try {
      const novoQuesito = await quesitoService.criar(req.body);
      res.status(201).json(novoQuesito);
    } catch (error) {
      if (error.code === 'P2002' && error.meta?.target?.includes('descricao_quesito')) {
        return res.status(409).json({ message: 'Esta descrição de quesito já existe.' });
      }
      next(error);
    }
  },

  // GET /quesitos
  async handleListar(req, res, next) {
    try {
      const quesitos = await quesitoService.listar();
      res.status(200).json(quesitos);
    } catch (error) {
      next(error);
    }
  },

  // GET /quesitos/:id
  async handleBuscarPorId(req, res, next) {
    try {
      const { id } = req.params;
      const quesito = await quesitoService.buscarPorId(id);
      if (!quesito) {
        return res.status(404).json({ message: 'Quesito não encontrado.' });
      }
      res.status(200).json(quesito);
    } catch (error) {
      next(error);
    }
  },

  // PUT /quesitos/:id
  async handleAtualizar(req, res, next) {
    try {
      const { id } = req.params;
      const quesitoAtualizado = await quesitoService.atualizar(id, req.body);
      res.status(200).json(quesitoAtualizado);
    } catch (error) {
      next(error);
    }
  },

  // DELETE /quesitos/:id
  async handleDeletar(req, res, next) {
    try {
      const { id } = req.params;
      await quesitoService.deletar(id);
      res.status(204).send();
    } catch (error) {
      if (error.message.includes('Não é possível deletar')) {
        return res.status(409).json({ message: error.message }); 
      }
      next(error);
    }
  },
};