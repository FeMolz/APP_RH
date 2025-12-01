import { api } from './api';

const episService = {
    getEpis: async () => {
        return api.get('/api/epis');
    },

    getEpiById: async (id) => {
        return api.get(`/api/epis/${id}`);
    },

    createEpi: async (data) => {
        return api.post('/api/epis', data);
    },

    updateEpi: async (id, data) => {
        return api.put(`/api/epis/${id}`, data);
    },

    deleteEpi: async (id) => {
        return api.delete(`/api/epis/${id}`);
    }
};

export default episService;
