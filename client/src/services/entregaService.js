import { api } from './api';

export const entregaService = {
    listarTodas: async () => {
        return api.get('/api/entregas');
    },

    listarVencidos: async () => {
        return api.get('/api/entregas/vencidos');
    },

    listarPorFuncionario: async (id, status = null) => {
        const params = status ? { status } : {};
        return api.get(`/api/entregas/${id}`, params);
    },

    criar: async (dados) => {
        return api.post('/api/entregas', dados);
    },

    devolver: async (id) => {
        return api.put(`/api/entregas/${id}/devolver`);
    }
};
