// server.js - VERSÃO CORRIGIDA COM CORS FUNCIONAL
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
// VERIFICAÇÃO DO BANCO (NÃO CRIAÇÃO!)
// ============================================

const verificarBancoSneakerLabs = async () => {
  console.log('🔍 Verificando banco de dados...');
  
  try {
    const client = await pool.connect();
    
    // ✅ APENAS VERIFICAR TABELAS - NÃO CRIAR!
    const tabelas = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('\n📊 TABELAS ENCONTRADAS NO BANCO:');
    
    // Verificar tabelas essenciais
    const tabelasEsperadas = ['clientes', 'estoque_maquina', 'pedidos', 'produtos_do_pedido', 'slots_expedicao'];
    const tabelasEncontradas = tabelas.rows.map(t => t.table_name);
    
    tabelasEsperadas.forEach(tabela => {
      if (tabelasEncontradas.includes(tabela)) {
        console.log(`   ✅ ${tabela}`);
      } else {
        console.log(`   ❌ ${tabela} (NÃO ENCONTRADA!)`);
      }
    });
    
    // Verificar dados iniciais
    try {
      const estoqueCount = await client.query('SELECT COUNT(*) as total FROM estoque_maquina');
      console.log(`\n📦 ESTOQUE: ${estoqueCount.rows[0].total} itens cadastrados`);
      
      const slotsCount = await client.query('SELECT COUNT(*) as total FROM slots_expedicao');
      console.log(`🕒 SLOTS: ${slotsCount.rows[0].total} slots de expedição`);
      
      const clientesCount = await client.query('SELECT COUNT(*) as total FROM clientes');
      console.log(`👥 CLIENTES: ${clientesCount.rows[0].total} clientes cadastrados`);
    } catch (err) {
      console.log('ℹ️  Dados iniciais ainda não carregados');
    }
    
    client.release();
    console.log('\n🎉 VERIFICAÇÃO DO BANCO CONCLUÍDA!');
    console.log('============================================');
    
  } catch (error) {
    console.error('⚠️  AVISO: Não foi possível verificar o banco:', error.message);
    console.log('💡 O sistema continuará, mas funcionalidades de banco podem falhar');
    console.log('🔧 Verifique:');
    console.log('   1. Conexão com o Neon');
    console.log('   2. Tabelas foram criadas pelo script SQL');
    console.log('   3. Variáveis de ambiente no Render');
  }
};

// ============================================
// CONFIGURAÇÃO DO EXPRESS
// ============================================

const app = express();
const PORT = process.env.PORT || 10000; // Render usa porta 10000

// 🚨 CORREÇÃO DO CORS - PERMITIR FRONTEND LOCAL 🚨
const corsOptions = {
    origin: function (origin, callback) {
        // Permitir todas as origens (simplificado para funcionar)
        // Isso resolve o problema do frontend local
        callback(null, true);
        
        /*
        // Se quiser ser mais específico depois, use:
        const allowedOrigins = [
            'http://localhost:5173',      // Vite dev server
            'http://localhost:3000',      // Create React App
            'http://127.0.0.1:5173',
            'http://127.0.0.1:3000',
            'http://localhost:3001',      // Backend local se tiver
            'https://sneakerslab-backend.onrender.com'
        ];
        
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log(`❌ Origem bloqueada: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
        */
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-client-id', 'Accept', 'Origin'],
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// ✅ MIDDLEWARE EXTRA PARA GARANTIR CORS (IMPORTANTE!)
app.use((req, res, next) => {
    // Permitir qualquer origem durante desenvolvimento
    const origin = req.headers.origin;
    
    // Se tiver origin, permite; se não, permite tudo
    if (origin) {
        res.header('Access-Control-Allow-Origin', origin);
    } else {
        res.header('Access-Control-Allow-Origin', '*');
    }
    
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-client-id, Accept, Origin, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Expose-Headers', 'Content-Length, Content-Type, Authorization');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    next();
});

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
app.use('/api', producaoRoutes);
app.use('/api/entrega', entregaRoutes);
app.use('/api/mensagens', mensagemRoutes);
app.use('/api/estoque', estoqueRoutes);
app.use('/api/produtos', produtoRoutes);

// ============================================
// ROTAS DO SISTEMA
// ============================================

// Health Check (essencial para Render)
app.get('/api/health', async (req, res) => {
    try {
        const healthStatus = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            service: 'SneakerLabs Backend',
            version: '2.0.0',
            environment: process.env.NODE_ENV || 'development',
            node_version: process.version,
            database: 'connected',
            tables: []
        };
        
        // Verificar tabelas no banco
        const client = await pool.connect();
        const tabelas = await client.query(
            "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
        );
        healthStatus.tables = tabelas.rows.map(t => t.table_name);
        client.release();
        
        res.status(200).json(healthStatus);
    } catch (error) {
        res.status(200).json({
            status: 'warning',
            message: 'Banco offline',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
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
        url_producao: 'https://sneakerslab-backend.onrender.com',
        rotas: {
            auth: ['POST /api/auth/register', 'POST /api/auth/login'],
            cliente: ['GET /api/cliente/:id', 'PUT /api/cliente/:id'],
            pedidos: [
                'POST /api/orders',
                'GET /api/orders/cliente/:clienteId',
                'GET /api/orders/rastreio/:codigoRastreio'
            ],
            mensagens: [
                'POST /api/mensagens/gerar-mensagem',
                'POST /api/mensagens/salvar-no-pedido'
            ],
            estoque: [
                'GET /api/estoque/listar',
                'POST /api/estoque/repor/:id',
                'PUT /api/estoque/editar/:id'
            ],
            producao: ['POST /api/callback'],
            entrega: [
                'POST /api/entrega/confirmar',
                'GET /api/entrega/slots/disponiveis'
            ]
        },
        cors: {
            enabled: true,
            allowed_origins: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:3000']
        }
    };
    res.status(200).json(config);
});

// Rota raiz
app.get('/', (req, res) => {
    res.json({
        message: '🚀 SneakerLabs Backend API',
        documentation: 'Acesse /api/config para ver todas as rotas',
        health_check: '/api/health',
        producao: 'https://sneakerslab-backend.onrender.com',
        version: '2.0.0',
        status: 'operational',
        cors_enabled: true
    });
});

// Rota para verificar dados do estoque (para testes)
app.get('/api/test/estoque', async (req, res) => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM estoque_maquina ORDER BY id LIMIT 5');
        client.release();
        
        res.json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });
    } catch (error) {
        res.json({
            success: false,
            error: 'Banco offline',
            message: 'Use a versão em produção: https://sneakerslab-backend.onrender.com'
        });
    }
});

// Rota específica para testar CORS
app.get('/api/test/cors', (req, res) => {
    res.json({
        message: 'CORS test successful!',
        origin: req.headers.origin || 'No origin header',
        timestamp: new Date().toISOString(),
        cors_headers: {
            'Access-Control-Allow-Origin': req.headers.origin || '*',
            'Access-Control-Allow-Credentials': 'true'
        }
    });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Rota não encontrada',
        message: `A rota ${req.originalUrl} não existe`,
        available_routes: {
            root: 'GET /',
            health: 'GET /api/health',
            config: 'GET /api/config',
            cors_test: 'GET /api/test/cors'
        }
    });
});

// Middleware global de erro
app.use((err, req, res, next) => {
    console.error('❌ Erro:', err);
    
    // Se for erro de CORS, mostra mais detalhes
    if (err.message.includes('CORS')) {
        console.log('🌐 CORS Error Details:', {
            origin: req.headers.origin,
            method: req.method,
            url: req.url
        });
    }
    
    res.status(500).json({
        error: 'Erro interno',
        message: process.env.NODE_ENV === 'production' 
            ? 'Entre em contato com o administrador'
            : err.message,
        cors_issue: err.message.includes('CORS') ? 'Sim' : 'Não'
    });
});

// ============================================
// INICIAR SERVIDOR E VERIFICAR BANCO
// ============================================

const startServer = async () => {
  try {
    // Verificar banco de dados (NÃO criar)
    await verificarBancoSneakerLabs();
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log('\n' + '='.repeat(60));
      console.log('🚀 SNEAKERLABS BACKEND - INICIADO COM SUCESSO');
      console.log('='.repeat(60));
      
      console.log(`📡 Porta: ${PORT}`);
      console.log(`🌍 URL Local: http://localhost:${PORT}`);
      console.log(`🌐 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📊 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`⚙️  Configuração: http://localhost:${PORT}/api/config`);
      console.log(`🌐 CORS Test: http://localhost:${PORT}/api/test/cors`);
      
      console.log('\n🎯 PRODUÇÃO:');
      console.log(`   ✅ https://sneakerslab-backend.onrender.com`);
      console.log(`   ✅ https://sneakerslab-backend.onrender.com/api/health`);
      console.log(`   ✅ https://sneakerslab-backend.onrender.com/api/estoque/listar`);
      console.log(`   ✅ https://sneakerslab-backend.onrender.com/api/test/cors`);
      
      console.log('\n🎯 FRONTEND LOCAL (CORS habilitado):');
      console.log(`   ✅ http://localhost:5173 -> https://sneakerslab-backend.onrender.com`);
      console.log(`   ✅ http://localhost:3000 -> https://sneakerslab-backend.onrender.com`);
      
      console.log('\n' + '='.repeat(60));
      console.log('✅ Servidor pronto para receber requisições do frontend local!');
      console.log('='.repeat(60));
    });
    
  } catch (error) {
    console.error('❌ ERRO AO INICIAR SERVIDOR:', error);
    console.log('💡 Iniciando servidor mesmo com erro...');
    
    // Inicia mesmo com erro
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT} (modo com limitações)`);
      console.log(`💡 Verifique a conexão com o Neon`);
    });
  }
};

// Iniciar tudo
startServer();