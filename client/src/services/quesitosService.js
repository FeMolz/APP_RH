import { api } from './api';

const quesitosService = {
    getQuesitos: async () => {
        return api.get('/api/quesitos');
    },

    createQuesito: async (data) => {
        return api.post('/api/quesitos', data);
    },

    updateQuesito: async (id, data) => {
        return api.put(`/api/quesitos/${id}`, data);
    },

    deleteQuesito: async (id) => {
        return api.delete(`/api/quesitos/${id}`);
    }
};

export default quesitosService;
