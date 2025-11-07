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

// --- ROTAS DA API ---

// --- FIM DAS ROTAS ---

app.listen(PORT, () => {
  console.log(`🚀 Servidor backend rodando na porta ${PORT}`);
});