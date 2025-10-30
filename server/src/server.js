import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const PORT = 3000; 

app.use(express.json());

const corsOptions = {
  origin: 'http://localhost:5173'
};
app.use(cors(corsOptions));

// --- ROTAS DA API ---

// Rota de teste
app.get('/api/teste', (req, res) => {
  res.json({ message: 'A API do RH está funcionando!' });
});


// --- FIM DAS ROTAS ---

app.listen(PORT, () => {
  console.log(`🚀 Servidor backend rodando na porta ${PORT}`);
});