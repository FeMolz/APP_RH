import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import apiRoutes from './api/index.js';
import { errorHandler } from './middlewares/errorHandler.js';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = 3001;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Limite de 100 requisições por IP a cada 15 minutos
  message: 'Muitas requisições deste IP, tente novamente mais tarde.'
});

app.use(helmet());
app.use(limiter);
app.use(express.json());

const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
};
app.use(cors(corsOptions));

app.use('/api', apiRoutes);
app.use('/uploads', express.static('uploads'));

// --- ROTAS DA API ---

// --- FIM DAS ROTAS ---

// Tratamento centralizado de erros (deve ser o último middleware)
app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor backend rodando na porta ${PORT}`);
});

server.on('error', (error) => {
  console.error('Erro ao iniciar o servidor:', error);
});