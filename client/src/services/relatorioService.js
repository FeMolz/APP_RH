import { api } from './api';

export const relatorioService = {
    criar: async (formData) => {
        // api.post now handles FormData automatically
        const response = await api.post('/api/relatorios', formData);
        return response;
    },

    listar: async () => {
        const response = await api.get('/api/relatorios');
        return response;
    },

    download: async (id) => {
        const response = await api.get(`/api/relatorios/${id}/download`, {}, {
            responseType: 'blob'
        });
        return response;
    }
};
