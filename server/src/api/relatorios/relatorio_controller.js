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
                nome_arquivo: req.file.originalname,
                buffer: req.file.buffer,
                entrega_ids: parsedEntregaIds
            });

            // Don't send the huge buffer back in the response
            const { arquivo_dados, ...relatorioSemBuffer } = relatorio;
            res.status(201).json(relatorioSemBuffer);
        } catch (error) {
            console.error('Erro ao criar relatório:', error);
            res.status(500).json({ message: 'Erro interno ao salvar relatório.' });
        }
    },

    listar: async (req, res) => {
        try {
            const relatorios = await relatorioService.listar();
            // Map to remove buffer from list to save bandwidth
            const relatoriosSemBuffer = relatorios.map(r => {
                const { arquivo_dados, ...rest } = r;
                return rest;
            });
            res.json(relatoriosSemBuffer);
        } catch (error) {
            console.error('Erro ao listar relatórios:', error);
            res.status(500).json({ message: 'Erro interno ao listar relatórios.' });
        }
    },

    download: async (req, res) => {
        try {
            const { id } = req.params;
            const relatorio = await relatorioService.buscarPorId(id);

            if (!relatorio || !relatorio.arquivo_dados) {
                return res.status(404).json({ message: 'Relatório ou arquivo não encontrado.' });
            }

            // Set headers for download
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${relatorio.caminho_arquivo || 'relatorio.pdf'}"`);

            // Send buffer
            res.send(relatorio.arquivo_dados);

        } catch (error) {
            console.error('Erro ao baixar relatório:', error);
            res.status(500).json({ message: 'Erro interno ao baixar relatório.' });
        }
    }
};

export default relatorioController;
