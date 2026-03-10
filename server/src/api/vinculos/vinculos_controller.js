import * as vinculosService from './vinculos_service.js';

export const getCargoVinculos = async (req, res) => {
    try {
        const { cargoId } = req.params;
        const vinculos = await vinculosService.getCargoVinculos(cargoId);
        res.json(vinculos);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar vínculos', details: error.message });
    }
};

export const updateVinculos = async (req, res) => {
    try {
        const { cargoId } = req.params;
        const { tipo, ids } = req.body;

        if (!['epi', 'quesito'].includes(tipo)) {
            return res.status(400).json({ error: 'Tipo inválido (deve ser epi ou quesito).' });
        }

        if (!Array.isArray(ids)) {
            return res.status(400).json({ error: 'IDs devem ser fornecidos em um array.' });
        }

        await vinculosService.updateVinculos(cargoId, tipo, ids);
        res.json({ message: 'Vínculos atualizados com sucesso.' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar vínculos', details: error.message });
    }
};
