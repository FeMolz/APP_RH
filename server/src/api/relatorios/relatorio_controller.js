import relatorioService from './relatorio_service.js';
import path from 'path';
import fs from 'fs';

const relatorioController = {
    criar: async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ message: 'Nenhum arquivo enviado.' });
            }

            const { funcionario_id, entrega_ids } = req.body;

            // entrega_ids might come as a JSON string or array depending on how it's sent
            let parsedEntregaIds = [];
            if (entrega_ids) {
                parsedEntregaIds = Array.isArray(entrega_ids) ? entrega_ids : JSON.parse(entrega_ids);
            }

            const relatorio = await relatorioService.criar({
                funcionario_id,
                caminho_arquivo: req.file.path,
                entrega_ids: parsedEntregaIds
            });

            res.status(201).json(relatorio);
        } catch (error) {
            console.error('Erro ao criar relatório:', error);
            res.status(500).json({ message: 'Erro interno ao salvar relatório.' });
        }
    },

    listar: async (req, res) => {
        try {
            const relatorios = await relatorioService.listar();
            res.json(relatorios);
        } catch (error) {
            console.error('Erro ao listar relatórios:', error);
            res.status(500).json({ message: 'Erro interno ao listar relatórios.' });
        }
    },

    download: async (req, res) => {
        try {
            const { id } = req.params;
            const relatorio = await relatorioService.buscarPorId(id);

            if (!relatorio) {
                return res.status(404).json({ message: 'Relatório não encontrado.' });
            }

            const filePath = path.resolve(relatorio.caminho_arquivo);
            if (fs.existsSync(filePath)) {
                res.download(filePath);
            } else {
                res.status(404).json({ message: 'Arquivo não encontrado no servidor.' });
            }
        } catch (error) {
            console.error('Erro ao baixar relatório:', error);
            res.status(500).json({ message: 'Erro interno ao baixar relatório.' });
        }
    }
};

export default relatorioController;
