// server.js - CORRIGIDO
import dotenv from 'dotenv';

// CARREGAR DOTENV PRIMEIRO, ANTES DE QUALQUER OUTRO IMPORT
dotenv.config();

// DEBUG imediatamente após carregar
console.log('🔑 DEBUG Variáveis de ambiente (imediatamente):');
console.log('OPENAI_API_KEY existe?', !!process.env.OPENAI_API_KEY);
console.log('OPENAI_API_KEY comprimento:', process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 'não existe');

import express from 'express';
import cors from 'cors';

// Importação das rotas EXISTENTES
import authRoutes from './routes/authRoutes.js';
import clienteRoutes from './routes/clienteRoutes.js';
import pedidoRoutes from './routes/pedidoRoutes.js';
import producaoRoutes from './routes/producaoRoutes.js';
import entregaRoutes from './routes/entregaRoutes.js';

// ROTA DE IMAGENS (agora com OpenAI/DALL-E)
import imageRoutes from './routes/imageRoutes.js';

const app = express();
const PORT = process.env.SERVER_PORT || 3001;

app.use(cors());
app.use(express.json());

// Configuração das rotas EXISTENTES
app.use('/api/auth', authRoutes);
app.use('/api/cliente', clienteRoutes);
app.use('/api/orders', pedidoRoutes);
app.use('/api', producaoRoutes);
app.use('/api/entrega', entregaRoutes);

// ROTA DE IMAGENS - OpenAI/DALL-E
app.use('/api/images', imageRoutes);

// Rota de health check ATUALIZADA
app.get('/api/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        message: 'Backend SneakerLabs funcionando!',
        timestamp: new Date().toISOString(),
        features: {
            auth: true,
            clientes: true,
            pedidos: true,
            producao: true,
            entrega: true,
            openai_images: true,
            openai_api_key: process.env.OPENAI_API_KEY ? '✅ Configurada' : '❌ Não encontrada'
        },
        environment: process.env.NODE_ENV || 'development'
    });
});

app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log(`🚀 Backend SneakerLabs inicializado`);
    console.log('='.repeat(50));
    console.log(`📍 Porta: ${PORT}`);
    console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🗄️  Banco: ${process.env.DB_NAME || 'SneakerLabs DB'}`);
    console.log(`🎨 OpenAI: ${process.env.OPENAI_API_KEY ? '✅ API Key Configurada' : '❌ API Key Não Encontrada'}`);
    console.log('='.repeat(50));
    console.log(`🔍 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`🎨 Image Generation: http://localhost:${PORT}/api/images/generate`);
    console.log(`📦 API Orders: http://localhost:${PORT}/api/orders`);
    console.log('='.repeat(50));
});