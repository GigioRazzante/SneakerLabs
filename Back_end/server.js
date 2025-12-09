// server.js - VERSÃO FINAL PARA DEPLOY NO RENDER
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

// Importar pool do database.js
import pool from './config/database.js';

// ============================================
// CONFIGURAÇÕES GLOBAIS
// ============================================

const MIDDLEWARE_URL = process.env.MIDDLEWARE_URL || 'http://52.72.137.244:3000';
const BACKEND_URL = process.env.BACKEND_URL || 'https://sneakerslab-backend.onrender.com';
const PORT = process.env.PORT || 10000;

// ============================================
// LOG DE INICIALIZAÇÃO
// ============================================

console.log('\n' + '='.repeat(60));
console.log('🚀 SNEAKERLABS BACKEND - INICIANDO...');
console.log('='.repeat(60));

console.log('\n🔧 CONFIGURAÇÕES:');
console.log(`   🌐 Ambiente: ${process.env.NODE_ENV || 'development'}`);
console.log(`   📡 Porta: ${PORT}`);
console.log(`   🔗 Middleware: ${MIDDLEWARE_URL}`);
console.log(`   🚀 Backend URL: ${BACKEND_URL}`);
console.log(`   📊 Banco: ${process.env.DATABASE_URL ? 'CONFIGURADO ✓' : 'NÃO CONFIGURADO ✗'}`);

// ============================================
// CONFIGURAÇÃO DO EXPRESS
// ============================================

const app = express();

// CORS SIMPLIFICADO E FUNCIONAL
app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-client-id', 'Accept', 'Origin']
}));

// HEADERS EXTRAS PARA CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-client-id, Accept, Origin, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    next();
});

// MIDDLEWARES
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============================================
// ROTAS PRINCIPAIS
// ============================================

app.use('/api/auth', authRoutes);
app.use('/api/cliente', clienteRoutes);
app.use('/api/orders', pedidoRoutes);
app.use('/api', producaoRoutes);
app.use('/api/entrega', entregaRoutes);
app.use('/api/mensagens', mensagemRoutes);
app.use('/api/estoque', estoqueRoutes);
app.use('/api/produtos', produtoRoutes);

// ============================================
// 🎯 ENDPOINTS DE TESTE PARA QUEUE SMART
// ============================================

// TESTE 1: Configuração do Middleware
app.get('/api/test/middleware-config', (req, res) => {
    res.json({
        success: true,
        config: {
            MIDDLEWARE_URL: MIDDLEWARE_URL,
            BACKEND_URL: BACKEND_URL,
            NODE_ENV: process.env.NODE_ENV || 'development',
            PORT: PORT
        },
        endpoints: {
            callback: `${BACKEND_URL}/api/callback`,
            health: `${BACKEND_URL}/api/health`
        },
        timestamp: new Date().toISOString()
    });
});

// TESTE 2: Ping direto no Middleware
app.get('/api/test/middleware-ping', async (req, res) => {
    try {
        console.log(`🔗 Testando conexão com: ${MIDDLEWARE_URL}/health`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(`${MIDDLEWARE_URL}/health`, {
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        res.json({
            success: true,
            middleware: MIDDLEWARE_URL,
            status: 'CONECTADO',
            response: data,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Falha na conexão:', error.message);
        res.status(500).json({
            success: false,
            middleware: MIDDLEWARE_URL,
            error: error.message,
            status: 'OFFLINE',
            timestamp: new Date().toISOString()
        });
    }
});

// TESTE 3: Conexão completa com Queue Smart
app.get('/api/test/queue-smart', async (req, res) => {
    try {
        console.log('🧪 Testando integração completa...');
        
        // Teste 1: Verificar se o serviço existe
        let queueService;
        try {
            const module = await import('./services/queueMiddlewareService.js');
            queueService = module.default;
            console.log('   ✅ Serviço importado');
        } catch (error) {
            console.log('   ⚠️  Serviço não disponível, testando conexão direta...');
            
            // Teste direto se o serviço não existe
            const pingResponse = await fetch(`${MIDDLEWARE_URL}/health`);
            if (pingResponse.ok) {
                return res.json({
                    success: true,
                    status: 'MIDDLEWARE_ONLINE',
                    message: 'Queue Smart está online, mas serviço local não configurado',
                    middleware_url: MIDDLEWARE_URL,
                    timestamp: new Date().toISOString()
                });
            }
            throw new Error('Serviço Queue Smart não disponível');
        }
        
        // Teste 2: Testar conexão via serviço
        const testeConexao = await queueService.testarConexao();
        
        res.json({
            success: true,
            status: 'INTEGRADO',
            teste: testeConexao,
            middleware_url: MIDDLEWARE_URL,
            backend_url: BACKEND_URL,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Teste falhou:', error.message);
        res.status(500).json({
            success: false,
            status: 'FALHA',
            error: error.message,
            middleware_url: MIDDLEWARE_URL,
            timestamp: new Date().toISOString()
        });
    }
});

// TESTE 4: Verificar estoque específico
app.get('/api/test/estoque-queue/:cor', async (req, res) => {
    const { cor } = req.params;
    
    try {
        console.log(`📦 Verificando estoque para cor: ${cor}`);
        
        // Tentar usar o serviço
        try {
            const module = await import('./services/queueMiddlewareService.js');
            const queueService = module.default;
            const estoque = await queueService.verificarEstoqueQueueSmart(cor);
            
            res.json({
                success: true,
                cor: cor,
                estoque: estoque,
                fonte: 'queue_middleware_service',
                timestamp: new Date().toISOString()
            });
            
        } catch (serviceError) {
            // Fallback: verificar no banco local
            console.log('   ⚠️  Usando fallback para banco local');
            const client = await pool.connect();
            const result = await client.query(
                'SELECT * FROM estoque_maquina WHERE cor = $1',
                [cor]
            );
            client.release();
            
            res.json({
                success: true,
                cor: cor,
                estoque: result.rows,
                fonte: 'banco_local_fallback',
                timestamp: new Date().toISOString()
            });
        }
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            cor: cor,
            timestamp: new Date().toISOString()
        });
    }
});

// ============================================
// ROTAS DO SISTEMA
// ============================================

// Health Check
app.get('/api/health', async (req, res) => {
    try {
        const client = await pool.connect();
        const tabelas = await client.query(
            "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
        );
        client.release();
        
        res.status(200).json({
            status: 'healthy',
            service: 'SneakerLabs Backend',
            version: '3.0.0',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || 'development',
            database: 'connected',
            tables_count: tabelas.rows.length,
            middleware: MIDDLEWARE_URL,
            backend_url: BACKEND_URL
        });
    } catch (error) {
        res.status(200).json({
            status: 'degraded',
            service: 'SneakerLabs Backend',
            error: error.message,
            timestamp: new Date().toISOString(),
            database: 'offline',
            middleware: MIDDLEWARE_URL
        });
    }
});

// Rota de Configuração
app.get('/api/config', (req, res) => {
    res.json({
        status: 'OK',
        sistema: 'SneakerLabs Backend',
        versao: '3.0.0',
        ambiente: process.env.NODE_ENV || 'development',
        porta: PORT,
        timestamp: new Date().toISOString(),
        urls: {
            backend: BACKEND_URL,
            middleware: MIDDLEWARE_URL,
            callback: `${BACKEND_URL}/api/callback`
        },
        endpoints_teste: {
            middleware_config: `${BACKEND_URL}/api/test/middleware-config`,
            middleware_ping: `${BACKEND_URL}/api/test/middleware-ping`,
            queue_smart: `${BACKEND_URL}/api/test/queue-smart`,
            estoque_azul: `${BACKEND_URL}/api/test/estoque-queue/azul`
        }
    });
});

// Rota Raiz
app.get('/', (req, res) => {
    res.json({
        message: '🚀 SneakerLabs Backend API',
        description: 'Sistema de gestão com integração Queue Smart 4.0',
        version: '3.0.0',
        status: 'operational',
        docs: `${BACKEND_URL}/api/config`,
        health: `${BACKEND_URL}/api/health`,
        teste_conexao: `${BACKEND_URL}/api/test/middleware-ping`
    });
});

// Teste de Estoque Local
app.get('/api/test/estoque', async (req, res) => {
    try {
        const client = await pool.connect();
        const result = await client.query(
            'SELECT id, cor, quantidade, em_producao FROM estoque_maquina ORDER BY id'
        );
        client.release();
        
        res.json({
            success: true,
            count: result.rows.length,
            estoque: result.rows,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Teste CORS
app.get('/api/test/cors', (req, res) => {
    res.json({
        success: true,
        message: 'CORS funcionando!',
        origin: req.headers.origin || 'N/A',
        timestamp: new Date().toISOString(),
        headers: {
            'Access-Control-Allow-Origin': req.headers.origin || '*',
            'Access-Control-Allow-Credentials': 'true'
        }
    });
});

// ============================================
// MANUSEIO DE ERROS
// ============================================

// Rota não encontrada
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Rota não encontrada',
        path: req.originalUrl,
        available_routes: [
            'GET /',
            'GET /api/health',
            'GET /api/config',
            'GET /api/test/middleware-ping',
            'GET /api/test/queue-smart',
            'GET /api/test/middleware-config',
            'POST /api/orders',
            'POST /api/callback'
        ],
        timestamp: new Date().toISOString()
    });
});

// Erro global
app.use((err, req, res, next) => {
    console.error('❌ Erro:', err.message);
    
    res.status(500).json({
        error: 'Erro interno do servidor',
        message: process.env.NODE_ENV === 'production' 
            ? 'Contate o administrador' 
            : err.message,
        timestamp: new Date().toISOString()
    });
});

// ============================================
// INICIALIZAÇÃO DO SERVIDOR
// ============================================

const startServer = async () => {
    try {
        // Testar conexão com banco
        console.log('\n🔍 Testando conexão com banco...');
        const client = await pool.connect();
        const result = await client.query('SELECT NOW() as time');
        console.log(`   ✅ Banco conectado: ${result.rows[0].time}`);
        client.release();
        
        // Iniciar servidor
        app.listen(PORT, () => {
            console.log('\n' + '='.repeat(60));
            console.log('✅ SERVIDOR INICIADO COM SUCESSO!');
            console.log('='.repeat(60));
            console.log(`📡 Porta: ${PORT}`);
            console.log(`🌐 URL: http://localhost:${PORT}`);
            console.log(`🚀 Produção: ${BACKEND_URL}`);
            console.log(`🔗 Middleware: ${MIDDLEWARE_URL}`);
            
            console.log('\n🧪 TESTES DISPONÍVEIS:');
            console.log(`   🔗 ${BACKEND_URL}/api/test/middleware-ping`);
            console.log(`   ⚙️  ${BACKEND_URL}/api/test/middleware-config`);
            console.log(`   🧪 ${BACKEND_URL}/api/test/queue-smart`);
            console.log(`   📦 ${BACKEND_URL}/api/test/estoque-queue/azul`);
            
            console.log('\n🎯 PRONTO PARA RECEBER PEDIDOS!');
            console.log('='.repeat(60));
        });
        
    } catch (error) {
        console.error('\n❌ ERRO AO INICIAR:', error.message);
        console.log('💡 Iniciando sem banco...');
        
        app.listen(PORT, () => {
            console.log(`\n⚠️  Servidor rodando na porta ${PORT} (modo limitado)`);
            console.log(`🔗 Acesse: http://localhost:${PORT}`);
        });
    }
};

// Iniciar servidor
startServer();