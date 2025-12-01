import { api } from './api';

const funcionariosService = {
    createFuncionario: async (data) => {
        return api.post('/api/funcionarios', data);
    },

    getCargos: async () => {
        return api.get('/api/cargos');
    },

    getFuncionarios: async (filters = {}) => {
        return api.get('/api/funcionarios', filters);
    },

    getInativos: async () => {
        return api.get('/api/funcionarios/inativos');
    },

    updateFuncionario: async (id, data) => {
        return api.put(`/api/funcionarios/${id}`, data);
    },

    deleteFuncionario: async (id) => {
        return api.delete(`/api/funcionarios/${id}`);
    }
};

export default funcionariosService;
