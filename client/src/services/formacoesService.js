import { api } from './api';

const formacoesService = {
    getFormacoes: async (filters = {}) => {
        return api.get('/api/formacoes', filters);
    },

    createFormacao: async (data) => {
        return api.post('/api/formacoes', data);
    },

    updateFormacao: async (id, data) => {
        return api.put(`/api/formacoes/${id}`, data);
    },

    deleteFormacao: async (id) => {
        return api.delete(`/api/formacoes/${id}`);
    }
};

export default formacoesService;
