import { api } from './api';

const entregaEpiService = {
    getPendentes: async () => {
        return api.get('/api/entregas-epi/pendentes');
    },

    registrarEntrega: async (dados) => {
        return api.post('/api/entregas-epi', dados);
    }
};

export default entregaEpiService;
