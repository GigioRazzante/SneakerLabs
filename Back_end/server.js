import express from 'express';
import cors from 'cors';

// Importação das rotas
import authRoutes from './routes/authRoutes.js';
import clienteRoutes from './routes/clienteRoutes.js';
import pedidoRoutes from './routes/pedidoRoutes.js';
import producaoRoutes from './routes/producaoRoutes.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Configuração das rotas
app.use('/api/auth', authRoutes);
app.use('/api/cliente', clienteRoutes);
app.use('/api/orders', pedidoRoutes);
app.use('/api', producaoRoutes);

// Rota de health check
app.get('/api/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        message: 'Backend SneakerLabs funcionando!',
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Backend rodando na porta ${PORT}`);
    console.log(`📞 Health check: http://localhost:${PORT}/api/health`);
});