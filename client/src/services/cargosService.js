import { api } from './api';

const cargosService = {
    getCargos: async () => {
        return api.get('/api/cargos');
    },

    getInativos: async () => {
        return api.get('/api/cargos/inativos');
    },

    getCargoById: async (id) => {
        return api.get(`/api/cargos/${id}`);
    },

    createCargo: async (data) => {
        return api.post('/api/cargos', data);
    },

    updateCargo: async (id, data) => {
        return api.put(`/api/cargos/${id}`, data);
    },

    deleteCargo: async (id) => {
        return api.delete(`/api/cargos/${id}`);
    },


};

export default cargosService;
