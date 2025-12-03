// server.js - VERSÃO OTIMIZADA PARA PRODUÇÃO/RENDER
import dotenv from 'dotenv';

// CARREGAR DOTENV PRIMEIRO
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Obter __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Importação das rotas
import authRoutes from './routes/authRoutes.js';
import clienteRoutes from './routes/clienteRoutes.js';
import pedidoRoutes from './routes/pedidoRoutes.js';
import producaoRoutes from './routes/producaoRoutes.js';
import entregaRoutes from './routes/entregaRoutes.js';
import mensagemRoutes from './routes/mensagemRoutes.js';
import estoqueRoutes from './routes/estoqueRoutes.js';
import produtoRoutes from './routes/produtoRoutes.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Configuração de CROS
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://seu-frontend.onrender.com'] // Altere para seu frontend
        : '*', // Em desenvolvimento permite tudo
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-client-id', 'Accept'],
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Servir arquivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============================================
// CONFIGURAÇÃO DAS ROTAS
// ============================================
app.use('/api/auth', authRoutes);
app.use('/api/cliente', clienteRoutes);
app.use('/api/orders', pedidoRoutes);
app.use('/api', producaoRoutes); // Callbacks do middleware
app.use('/api/entrega', entregaRoutes);
app.use('/api/mensagens', mensagemRoutes);
app.use('/api/estoque', estoqueRoutes);
app.use('/api/produtos', produtoRoutes);

// ============================================
// ROTAS DO SISTEMA
// ============================================

// Health Check (essencial para Render)
app.get('/api/health', (req, res) => {
    const healthStatus = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        service: 'SneakerLabs Backend',
        version: '2.0.0',
        environment: process.env.NODE_ENV || 'development',
        node_version: process.version
    };
    res.status(200).json(healthStatus);
});

// Rota de configuração simplificada
app.get('/api/config', (req, res) => {
    const config = {
        status: 'OK',
        sistema: 'SneakerLabs Backend',
        versao: '2.0.0',
        ambiente: process.env.NODE_ENV || 'development',
        porta: PORT,
        timestamp: new Date().toISOString(),
        middlewares: {
            aws_middleware: {
                url: process.env.MIDDLEWARE_URL || 'http://52.1.197.112:3000',
                status: 'configurado'
            },
            openai: process.env.OPENAI_API_KEY ? '✅ Configurado' : '❌ Não configurado',
            estoque_automatico: '✅ Ativado',
            slots_expedicao: '✅ Ativado'
        },
        rotas: {
            auth: ['POST /api/auth/register', 'POST /api/auth/login'],
            cliente: ['GET /api/cliente/:id', 'PUT /api/cliente/:id'],
            pedidos: [
                'POST /api/orders',
                'GET /api/orders/cliente/:clienteId',
                'GET /api/orders/rastreio/:codigoRastreio',
                'GET /api/orders/:id/status'
            ],
            mensagens: [
                'POST /api/mensagens/gerar-mensagem',
                'POST /api/mensagens/salvar-no-pedido',
                'GET /api/mensagens/:pedidoId/:produtoId'
            ],
            estoque: [
                'GET /api/estoque/listar',
                'POST /api/estoque/repor/:id',
                'PUT /api/estoque/editar/:id',
                'DELETE /api/estoque/remover/:id'
            ],
            producao: ['POST /api/callback'],
            entrega: [
                'POST /api/entrega/confirmar',
                'GET /api/entrega/slots/disponiveis'
            ],
            produtos: [
                'PUT /api/produtos/editar/:produtoId',
                'DELETE /api/produtos/remover/:produtoId'
            ]
        }
    };
    res.status(200).json(config);
});

// Rota raiz
app.get('/', (req, res) => {
    res.json({
        message: '🚀 SneakerLabs Backend API',
        documentation: 'Acesse /api/config para ver todas as rotas disponíveis',
        health_check: '/api/health',
        version: '2.0.0',
        status: 'operational'
    });
});

// Rota de informações do sistema (apenas desenvolvimento)
if (process.env.NODE_ENV === 'development') {
    app.get('/api/system-info', (req, res) => {
        const systemInfo = {
            node: process.version,
            platform: process.platform,
            memory: process.memoryUsage(),
            pid: process.pid,
            uptime: process.uptime(),
            environment: process.env.NODE_ENV,
            database: process.env.DATABASE_URL ? '✅ Configurado' : '❌ Não configurado'
        };
        res.json(systemInfo);
    });
}

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Rota não encontrada',
        message: `A rota ${req.originalUrl} não existe neste servidor`,
        available_routes: {
            root: 'GET /',
            health: 'GET /api/health',
            config: 'GET /api/config',
            auth: 'POST /api/auth/register, POST /api/auth/login'
        },
        timestamp: new Date().toISOString()
    });
});

// Middleware global de erro
app.use((err, req, res, next) => {
    console.error('❌ Erro não tratado:', err);
    
    const statusCode = err.statusCode || 500;
    const message = process.env.NODE_ENV === 'production' 
        ? 'Erro interno do servidor'
        : err.message;
    
    res.status(statusCode).json({
        error: 'Erro interno',
        message: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// ============================================
// INICIAR SERVIDOR
// ============================================
app.listen(PORT, () => {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 SNEAKERLABS BACKEND - INICIADO COM SUCESSO');
    console.log('='.repeat(60));
    
    console.log(`📡 Porta: ${PORT}`);
    console.log(`🌍 URL Local: http://localhost:${PORT}`);
    console.log(`🌐 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📊 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`⚙️  Configuração: http://localhost:${PORT}/api/config`);
    
    console.log('\n📦 Rotas carregadas:');
    console.log('   ✅ /api/auth - Autenticação');
    console.log('   ✅ /api/cliente - Gestão de clientes');
    console.log('   ✅ /api/orders - Pedidos e rastreio');
    console.log('   ✅ /api/mensagens - Mensagens IA personalizadas');
    console.log('   ✅ /api/estoque - Sistema de estoque');
    console.log('   ✅ /api/produtos - Gestão de produtos');
    console.log('   ✅ /api/entrega - Sistema de entrega');
    console.log('   ✅ /api/callback - Webhooks de produção');
    
    // Verificar configurações importantes
    console.log('\n🔧 Configurações do sistema:');
    console.log(`   📦 Banco de dados: ${process.env.DATABASE_URL ? '✅ Configurado' : '⚠️  Usando local'}`);
    console.log(`   🤖 OpenAI: ${process.env.OPENAI_API_KEY ? '✅ Configurado' : '⚠️  Modo local'}`);
    console.log(`   🔗 Middleware AWS: ${process.env.MIDDLEWARE_URL || 'http://52.1.197.112:3000'}`);
    
    // Configuração do pedidoController (simplificada)
    const middlewareMode = process.env.USAR_MIDDLEWARE_REAL === 'true' ? 'PRODUÇÃO REAL' : 'SIMULAÇÃO';
    console.log(`   🎯 Modo produção: ${middlewareMode}`);
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Servidor pronto para receber requisições');
    console.log('='.repeat(60));
});