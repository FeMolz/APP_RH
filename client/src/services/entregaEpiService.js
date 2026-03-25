import { api } from './api';

const entregaEpiService = {
    getPendentes: async () => {
        return api.get('/api/entregas-epi/pendentes');
    },

    registrarEntrega: async (dados) => {
        return api.post('/api/entregas-epi', dados);
    },

    getRelatorio: async (funcionario_id, data_inicio, data_fim) => {
        return api.get(`/api/entregas-epi/relatorio?funcionario_id=${funcionario_id}&data_inicio=${data_inicio}&data_fim=${data_fim}`);
    }
};

export default entregaEpiService;
