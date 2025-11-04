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
};