// server.js - ATUALIZADO PARA STABLE DIFFUSION E SERVIÇO DE IMAGENS
import dotenv from 'dotenv';

// CARREGAR DOTENV PRIMEIRO, ANTES DE QUALQUER OUTRO IMPORT
dotenv.config();

// DEBUG imediatamente após carregar
console.log('🔑 DEBUG Variáveis de ambiente (imediatamente):');
console.log('STABILITY_AI_API_KEY existe?', !!process.env.STABILITY_AI_API_KEY);
console.log('STABILITY_AI_API_KEY comprimento:', process.env.STABILITY_AI_API_KEY ? process.env.STABILITY_AI_API_KEY.length : 'não existe');

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Importação das rotas EXISTENTES
import authRoutes from './routes/authRoutes.js';
import clienteRoutes from './routes/clienteRoutes.js';
import pedidoRoutes from './routes/pedidoRoutes.js';
import producaoRoutes from './routes/producaoRoutes.js';
import entregaRoutes from './routes/entregaRoutes.js';

// ROTA DE IMAGENS (agora com Stable Diffusion)
import imageRoutes from './routes/imageRoutes.js';

const app = express();
const PORT = process.env.SERVER_PORT || 3001;

// 🔧 CORREÇÃO: Obter __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json({ limit: '50mb' })); // Aumentar limite para imagens base64
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 🎯 **CORREÇÃO CRÍTICA: Servir arquivos estáticos da pasta uploads**
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configuração das rotas EXISTENTES
app.use('/api/auth', authRoutes);
app.use('/api/cliente', clienteRoutes);
app.use('/api/orders', pedidoRoutes);
app.use('/api', producaoRoutes);
app.use('/api/entrega', entregaRoutes);

// ROTA DE IMAGENS - Stable Diffusion
app.use('/api/images', imageRoutes);

// 🎯 **NOVA ROTA: Servir imagens específicas dos sneakers**
app.get('/api/images/sneaker/:pedidoId/:produtoId', async (req, res) => {
    try {
        const { pedidoId, produtoId } = req.params;
        
        // Importação dinâmica para evitar circular dependency
        const { serveSneakerImage } = await import('./controllers/imageGenerationController.js');
        serveSneakerImage(req, res);
    } catch (error) {
        console.error('❌ Erro ao servir imagem:', error);
        res.status(500).json({ error: 'Erro ao carregar imagem' });
    }
});

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
            stable_diffusion: true,
            image_serving: true, // 🆕 Novo recurso
            stability_ai_api_key: process.env.STABILITY_AI_API_KEY ? '✅ Configurada' : '❌ Não encontrada'
        },
        environment: process.env.NODE_ENV || 'development'
    });
});

// 🎯 **NOVA ROTA: Listar arquivos de upload (apenas desenvolvimento)**
if (process.env.NODE_ENV === 'development') {
    app.get('/api/debug/uploads', async (req, res) => {
        try {
            const fs = await import('fs/promises');
            const uploadsPath = path.join(__dirname, 'uploads');
            
            try {
                const files = await fs.readdir(uploadsPath, { recursive: true });
                res.json({ 
                    uploadsPath,
                    files: files.filter(f => f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.svg'))
                });
            } catch (error) {
                res.json({ 
                    uploadsPath,
                    error: 'Pasta uploads não existe ou está vazia',
                    message: error.message 
                });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
}

app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log(`🚀 Backend SneakerLabs inicializado`);
    console.log('='.repeat(50));
    console.log(`📍 Porta: ${PORT}`);
    console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🗄️  Banco: ${process.env.DB_NAME || 'SneakerLabs DB'}`);
    console.log(`🎨 Stable Diffusion: ${process.env.STABILITY_AI_API_KEY ? '✅ API Key Configurada' : '❌ API Key Não Encontrada'}`);
    console.log(`📁 Servindo arquivos: ✅ Pasta uploads`);
    console.log('='.repeat(50));
    console.log(`🔍 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`🎨 Image Generation: http://localhost:${PORT}/api/images/generate`);
    console.log(`📦 API Orders: http://localhost:${PORT}/api/orders`);
    console.log(`📁 Uploads Debug: http://localhost:${PORT}/api/debug/uploads`);
    console.log('='.repeat(50));
});