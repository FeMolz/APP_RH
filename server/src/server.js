import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import apiRoutes from './api/index.js';

const app = express();
const prisma = new PrismaClient();
const PORT = 3001;

app.use(express.json());

const corsOptions = {
  origin: 'http://localhost:5173'
};
app.use(cors(corsOptions));

app.use('/api', apiRoutes);
app.use('/uploads', express.static('uploads'));

// --- ROTAS DA API ---

// --- FIM DAS ROTAS ---

const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor backend rodando na porta ${PORT}`);
});

server.on('error', (error) => {
  console.error('Erro ao iniciar o servidor:', error);
});