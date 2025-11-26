// server.js - VERSÃO CORRIGIDA COM MENSAGEM AI
import dotenv from 'dotenv';

// CARREGAR DOTENV PRIMEIRO
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Importação das rotas EXISTENTES (que funcionam)
import authRoutes from './routes/authRoutes.js';
import clienteRoutes from './routes/clienteRoutes.js';
import pedidoRoutes from './routes/pedidoRoutes.js';
import producaoRoutes from './routes/producaoRoutes.js';
import entregaRoutes from './routes/entregaRoutes.js';

// 🎯 ATUALIZADO: Substituir imageRoutes por mensagemRoutes
import mensagemRoutes from './routes/mensagemRoutes.js'; // 🆕 NOVA ROTA

// 🚨 COMENTE AS NOVAS ROTAS TEMPORARIAMENTE
import estoqueRoutes from './routes/estoqueRoutes.js';
import produtoRoutes from './routes/produtoRoutes.js';

const app = express();
const PORT = process.env.SERVER_PORT || 3001;

// 🔧 CORREÇÃO: Obter __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 🎯 Servir arquivos estáticos da pasta uploads (manter para compatibilidade)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configuração das rotas EXISTENTES
app.use('/api/auth', authRoutes);
app.use('/api/cliente', clienteRoutes);
app.use('/api/orders', pedidoRoutes);
app.use('/api', producaoRoutes);
app.use('/api/entrega', entregaRoutes);

// 🎯 ATUALIZADO: Substituir imageRoutes por mensagemRoutes
app.use('/api/mensagens', mensagemRoutes); // 🆕 NOVA ROTA

// 🚨 ROTAS COMENTADAS TEMPORARIAMENTE
app.use('/api/estoque', estoqueRoutes);
app.use('/api/produtos', produtoRoutes);

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
            mensagens_ai: true, // 🆕 NOVA FEATURE
            image_generation: false, // 🗑️ REMOVIDO
            image_serving: false, // 🗑️ REMOVIDO
            estoque: false,  // 🚨 COMENTADO TEMPORARIAMENTE
            produtos: false, // 🚨 COMENTADO TEMPORARIAMENTE
            gemini_ai: process.env.GEMINI_API_KEY ? '✅ Configurada' : '❌ Não encontrada' // 🆕 ATUALIZADO
        },
        environment: process.env.NODE_ENV || 'development'
    });
});

// Rota de debug (apenas desenvolvimento)
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
                    imageFiles: files.filter(f => f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.svg'))
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

// Rota de fallback para 404 ATUALIZADA
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Rota não encontrada',
        availableRoutes: {
            health: 'GET /api/health',
            auth: {
                register: 'POST /api/auth/register',
                login: 'POST /api/auth/login'
            },
            cliente: {
                get: 'GET /api/cliente/:id',
                update: 'PUT /api/cliente/:id'
            },
            orders: {
                create: 'POST /api/orders',
                status: 'GET /api/orders/:id/status',
                client: 'GET /api/orders/cliente/:clienteId'
            },
            // 🎯 ATUALIZADO: Substituir images por mensagens
            mensagens: {
                gerar: 'POST /api/mensagens/gerar-mensagem',
                salvar: 'POST /api/mensagens/salvar-no-pedido', 
                obter: 'GET /api/mensagens/:pedidoId/:produtoId'
            },
            estoque: {
                listar: 'GET /api/estoque/listar',
                repor: 'POST /api/estoque/repor/:id',
                editar: 'PUT /api/estoque/editar/:id',
                remover: 'DELETE /api/estoque/remover/:id'
            },
            produtos: {
                editar: 'PUT /api/produtos/editar/:produtoId',
                remover: 'DELETE /api/produtos/remover/:produtoId'
            },
            entrega: {
                confirmar: 'POST /api/entrega/confirmar',
                slots: 'GET /api/entrega/slots/disponiveis',
                cores: 'GET /api/entrega/cores-disponiveis'
            },
            producao: {
                callback: 'POST /api/callback'
            }
        }
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Backend SneakerLabs inicializado na porta ${PORT}`);
    console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`🤖 Nova Feature: Mensagens AI via Gemini`);
    console.log(`📝 Rotas disponíveis: /api/mensagens/gerar-mensagem`);
});