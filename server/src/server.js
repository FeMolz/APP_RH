const express = require('express')
const cors = require('cors')

const app = express()

const corsOptions = {
  origin: 'http://localhost:5173'
};

app.use(cors(corsOptions));

app.use(express.json())

app.get('/api/v1/teste', (req, res) => {
  res.json({ message: 'CORS está funcionando!' });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor backend rodando na porta ${PORT}`);
});