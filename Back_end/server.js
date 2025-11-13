// server.js - ATUALIZADO PARA FAL.AI E SERVIÇO DE IMAGENS
import dotenv from 'dotenv';

// CARREGAR DOTENV PRIMEIRO, ANTES DE QUALQUER OUTRO IMPORT
dotenv.config();

// DEBUG imediatamente após carregar
console.log('🔑 DEBUG Variáveis de ambiente:');
console.log('FAL_AI_KEY existe?', !!process.env.FAL_AI_KEY);
console.log('SERVER_PORT:', process.env.SERVER_PORT);

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

// ROTA DE IMAGENS (agora com Fal.ai)
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

// ROTA DE IMAGENS - Fal.ai (TODAS as rotas de imagem estão no imageRoutes)
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
            image_generation: true,
            image_serving: true,
            fal_ai: process.env.FAL_AI_KEY ? '✅ Configurada' : '❌ Não encontrada'
        },
        environment: process.env.NODE_ENV || 'development',
        routes: {
            health: 'GET /api/health',
            images: {
                generate: 'POST /api/images/generate',
                save: 'POST /api/images/save-to-order',
                serve: 'GET /api/images/sneaker/:pedidoId/:produtoId'
            },
            orders: {
                create: 'POST /api/orders',
                status: 'GET /api/orders/:id',
                client: 'GET /api/orders/client/:clienteId'
            },
            debug: 'GET /api/debug/uploads (apenas desenvolvimento)'
        }
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
                    totalFiles: files.length,
                    imageFiles: files.filter(f => f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.svg')),
                    allFiles: files
                });
            } catch (error) {
                res.json({ 
                    uploadsPath,
                    error: 'Pasta uploads não existe ou está vazia',
                    message: error.message,
                    suggestion: 'A pasta será criada automaticamente quando a primeira imagem for gerada'
                });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
}

// Rota de fallback para 404
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Rota não encontrada',
        availableRoutes: {
            health: 'GET /api/health',
            images: {
                generate: 'POST /api/images/generate',
                save: 'POST /api/images/save-to-order', 
                serve: 'GET /api/images/sneaker/:pedidoId/:produtoId'
            },
            orders: {
                create: 'POST /api/orders',
                status: 'GET /api/orders/:id',
                client: 'GET /api/orders/client/:clienteId'
            },
            debug: 'GET /api/debug/uploads (apenas desenvolvimento)'
        }
    });
});

app.listen(PORT, () => {
    console.log('='.repeat(60));
    console.log(`🚀 Backend SneakerLabs inicializado com sucesso!`);
    console.log('='.repeat(60));
    console.log(`📍 Porta: ${PORT}`);
    console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🗄️  Banco: ${process.env.DB_NAME || 'SneakerLabs DB'}`);
    console.log(`🎨 Fal.ai: ${process.env.FAL_AI_KEY ? '✅ API Key Configurada' : '❌ API Key Não Encontrada'}`);
    console.log(`📁 Servindo arquivos: ✅ Pasta uploads configurada`);
    console.log('='.repeat(60));
    console.log(`🔍 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`🎨 Image Routes:`);
    console.log(`   ├── Generate: POST http://localhost:${PORT}/api/images/generate`);
    console.log(`   ├── Save: POST http://localhost:${PORT}/api/images/save-to-order`);
    console.log(`   └── Serve: GET http://localhost:${PORT}/api/images/sneaker/1/1`);
    console.log(`📦 Order Routes:`);
    console.log(`   ├── Create: POST http://localhost:${PORT}/api/orders`);
    console.log(`   ├── Status: GET http://localhost:${PORT}/api/orders/1`);
    console.log(`   └── Client: GET http://localhost:${PORT}/api/orders/client/1`);
    console.log(`🐛 Debug: GET http://localhost:${PORT}/api/debug/uploads`);
    console.log('='.repeat(60));
});