import { funcionarioService } from './funcionario_service.js';

export const funcionarioController = {

  // POST /funcionarios
  async criarFuncionario(req, res, next) {
    try {
      const novoFuncionario = await funcionarioService.criar(req.body);
      res.status(201).json(novoFuncionario);
    } catch (error) {
      if (error.code === 'P2002' && error.meta?.target?.includes('cpf')) {
        return res.status(409).json({ message: 'Este CPF já está cadastrado.' });
      }
      if (error.code === 'P2025') {
        return res.status(404).json({ message: 'Cargo não encontrado. Verifique o cargo_id.' });
      }
      next(error);
    }
  },

  // GET /funcionarios
  async listarTodosAtivos(req, res, next) {
    try {
      const funcionarios = await funcionarioService.listarAtivos();
      res.status(200).json(funcionarios);
    } catch (error) {
      next(error);
    }
  },

  // GET /funcionarios/:id
  async buscarPorId(req, res, next) {
    try {
      const { id } = req.params;
      const funcionario = await funcionarioService.buscarPorId(id);
      
      if (!funcionario) {
        return res.status(404).json({ message: 'Funcionário não encontrado.' });
      }
      res.status(200).json(funcionario);
    } catch (error) {
      next(error);
    }
  },

  // PUT /funcionarios/:id
  async atualizarFuncionario(req, res, next) {
    try {
      const { id } = req.params;
      const dados = req.body;
      const funcionarioAtualizado = await funcionarioService.atualizar(id, dados);
      res.status(200).json(funcionarioAtualizado);
    } catch (error) {
      if (error.code === 'P2002' && error.meta?.target?.includes('cpf')) {
        return res.status(409).json({ message: 'Este CPF já pertence a outro funcionário.' });
      }
      next(error);
    }
  },

  // DELETE /funcionarios/:id
  async desligarFuncionario(req, res, next) {
    try {
      const { id } = req.params;
      await funcionarioService.desligar(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },


  // POST /funcionarios/:id/formacao
  async adicionarFormacao(req, res, next) {
    try {
      const { id: funcionario_id } = req.params;
      const dadosFormacao = req.body;
      
      const novaFormacao = await funcionarioService.adicionarFormacao(funcionario_id, dadosFormacao);
      res.status(201).json(novaFormacao);
    } catch (error) {
      next(error);
    }
  },
};