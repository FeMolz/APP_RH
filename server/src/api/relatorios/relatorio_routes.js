import express from 'express';
import relatorioController from './relatorio_controller.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configure multer for file upload
// Configure multer for memory storage (to save in DB)
const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

router.post('/', upload.single('file'), relatorioController.criar);
router.get('/', relatorioController.listar);
router.get('/:id/download', relatorioController.download);

export default router;
