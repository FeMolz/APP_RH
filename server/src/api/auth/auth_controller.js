import { authService } from './auth_service.js';

export const authController = {

  handleRegister: async (req, res, next) => {
    try {
      const novoUsuario = await authService.register(req.body);
      res.status(201).json(novoUsuario);
    } catch (error) {
      if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
        return res.status(409).json({ message: 'Este email já está em uso.' });
      }
      next(error);
    }
  },

  handleLogin: async (req, res, next) => {
    try {
      const loginData = await authService.login(req.body);
      res.status(200).json(loginData);
    } catch (error) {
      res.status(401).json({ message: error.message });
    }
  },
};