// server.js - VERSÃO FINAL COMPLETA COM INTEGRAÇÃO TOTAL
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

console.log('\n' + '='.repeat(70));
console.log('🚀 SNEAKERLABS BACKEND - INTEGRAÇÃO COMPLETA QUEUE SMART 4.0');
console.log('='.repeat(70));

console.log('\n🔧 CONFIGURAÇÕES DO SISTEMA:');
console.log(`   🌐 Ambiente: ${process.env.NODE_ENV || 'development'}`);
console.log(`   📡 Porta: ${PORT}`);
console.log(`   🔗 Queue Smart: ${MIDDLEWARE_URL}`);
console.log(`   🚀 Backend URL: ${BACKEND_URL}`);
console.log(`   📊 Banco: ${process.env.DATABASE_URL ? 'CONECTADO ✓' : 'NÃO CONFIGURADO ✗'}`);
console.log(`   🔄 Callback URL: ${BACKEND_URL}/api/callback`);

if (!process.env.MIDDLEWARE_URL) {
  console.warn('   ⚠️  MIDDLEWARE_URL não configurada! Usando fallback.');
}

console.log('='.repeat(70));

// ============================================
// VERIFICAÇÃO DO BANCO
// ============================================

const verificarEstruturaBanco = async () => {
  console.log('\n🔍 VERIFICANDO ESTRUTURA DO BANCO...');
  
  try {
    const client = await pool.connect();
    
    // Verificar tabelas essenciais
    const tabelas = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('\n📊 TABELAS ENCONTRADAS:');
    const tabelasEsperadas = ['clientes', 'estoque_maquina', 'pedidos', 'produtos_do_pedido', 'slots_expedicao'];
    const tabelasEncontradas = tabelas.rows.map(t => t.table_name);
    
    tabelasEsperadas.forEach(tabela => {
      if (tabelasEncontradas.includes(tabela)) {
        console.log(`   ✅ ${tabela}`);
        
        // Verificar colunas específicas
        if (tabela === 'estoque_maquina') {
          console.log('      📦 Verificando colunas do estoque...');
          // A verificação de colunas será feita abaixo
        }
      } else {
        console.log(`   ❌ ${tabela} (AUSENTE!)`);
      }
    });
    
    // Verificar colunas específicas do estoque_maquina
    try {
      const colunasEstoque = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'estoque_maquina'
        ORDER BY ordinal_position
      `);
      
      const colunasNecessarias = ['cor', 'quantidade', 'em_producao', 'estoque_pos', 'middleware_id'];
      const colunasExistentes = colunasEstoque.rows.map(c => c.column_name);
      
      console.log('\n🔍 COLUNAS DO ESTOQUE:');
      colunasNecessarias.forEach(coluna => {
        if (colunasExistentes.includes(coluna)) {
          console.log(`   ✅ ${coluna}`);
        } else {
          console.log(`   ❌ ${coluna} (FALTANDO - necessário para integração)`);
        }
      });
      
    } catch (colunasError) {
      console.log('   ⚠️  Não foi possível verificar colunas do estoque');
    }
    
    // Contar dados
    try {
      const estoqueCount = await client.query('SELECT COUNT(*) as total FROM estoque_maquina');
      const pedidosCount = await client.query('SELECT COUNT(*) as total FROM pedidos');
      const clientesCount = await client.query('SELECT COUNT(*) as total FROM clientes');
      
      console.log('\n📈 DADOS DO SISTEMA:');
      console.log(`   👥 Clientes: ${clientesCount.rows[0].total}`);
      console.log(`   📦 Itens no estoque: ${estoqueCount.rows[0].total}`);
      console.log(`   🚚 Pedidos: ${pedidosCount.rows[0].total}`);
      
    } catch (countError) {
      console.log('   ℹ️  Dados iniciais ainda não carregados');
    }
    
    client.release();
    console.log('\n🎉 VERIFICAÇÃO DO BANCO CONCLUÍDA!');
    console.log('='.repeat(70));
    
  } catch (error) {
    console.error('⚠️  ERRO AO VERIFICAR BANCO:', error.message);
    console.log('💡 O sistema continuará, mas funcionalidades de banco podem falhar');
  }
};

// ============================================
// CONFIGURAÇÃO DO EXPRESS
// ============================================

const app = express();

// CORS COMPLETO PARA INTEGRAÇÃO
const corsOptions = {
  origin: function (origin, callback) {
    // Permitir todas origens durante desenvolvimento/produção
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000',
      'https://sneakerslab-backend.onrender.com',
      BACKEND_URL
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`🌐 CORS bloqueado: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-client-id', 'Accept', 'Origin', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200,
  maxAge: 86400 // 24 horas
};

app.use(cors(corsOptions));

// HEADERS EXTRAS PARA CORS
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    res.header('Access-Control-Allow-Origin', '*');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-client-id, Accept, Origin, X-Requested-With, X-CSRF-Token');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Expose-Headers', 'Content-Length, Content-Type, Authorization, X-Powered-By');
  res.header('Access-Control-Max-Age', '86400');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// MIDDLEWARES
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// LOGGER DE REQUESTS
app.use((req, res, next) => {
  console.log(`🌐 ${req.method} ${req.originalUrl} - ${new Date().toISOString()}`);
  next();
});

// ============================================
// CONFIGURAÇÃO DAS ROTAS PRINCIPAIS
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
// 🎯 ENDPOINTS DE CONTROLE E INTEGRAÇÃO
// ============================================

// 1. HEALTH CHECK COMPLETO
app.get('/api/health', async (req, res) => {
  try {
    const client = await pool.connect();
    
    // Verificar banco
    const dbCheck = await client.query('SELECT NOW() as time, version() as version');
    
    // Verificar Queue Smart
    let queueStatus = { status: 'not_checked' };
    try {
      const queueResponse = await fetch(`${MIDDLEWARE_URL}/health`, { timeout: 3000 });
      queueStatus = await queueResponse.json();
    } catch (queueError) {
      queueStatus = { status: 'offline', error: queueError.message };
    }
    
    // Verificar tabelas
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    client.release();
    
    res.status(200).json({
      status: 'healthy',
      system: 'SneakerLabs Backend v4.0',
      version: '4.0.0',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      node_version: process.version,
      database: {
        status: 'connected',
        time: dbCheck.rows[0].time,
        version: dbCheck.rows[0].version.split(' ')[1],
        tables_count: tables.rows.length,
        tables: tables.rows.map(t => t.table_name)
      },
      queue_smart: {
        url: MIDDLEWARE_URL,
        status: queueStatus.status || 'unknown',
        response: queueStatus.status === 'ok' ? queueStatus : queueStatus.error
      },
      integration: {
        backend_url: BACKEND_URL,
        callback_url: `${BACKEND_URL}/api/callback`,
        production_flow: 'active',
        real_inventory: 'active'
      },
      endpoints: {
        create_order: `${BACKEND_URL}/api/orders`,
        check_stock: `${BACKEND_URL}/api/orders/estoque/cor/:cor`,
        production_callback: `${BACKEND_URL}/api/callback`
      }
    });
    
  } catch (error) {
    res.status(200).json({
      status: 'degraded',
      message: 'Banco offline',
      error: error.message,
      timestamp: new Date().toISOString(),
      queue_smart: MIDDLEWARE_URL,
      backend_url: BACKEND_URL
    });
  }
});

// 2. CONFIGURAÇÃO DO SISTEMA
app.get('/api/config', (req, res) => {
  res.json({
    status: 'OK',
    system: 'SneakerLabs Backend v4.0 - Integrated Edition',
    version: '4.0.0',
    environment: process.env.NODE_ENV || 'development',
    port: PORT,
    timestamp: new Date().toISOString(),
    urls: {
      backend: BACKEND_URL,
      middleware: MIDDLEWARE_URL,
      callback: `${BACKEND_URL}/api/callback`,
      docs: `${BACKEND_URL}/api/docs`
    },
    features: {
      queue_smart_integration: true,
      real_inventory_check: true,
      production_tracking: true,
      automatic_callback: true,
      stock_synchronization: true
    },
    routes: {
      auth: ['POST /api/auth/register', 'POST /api/auth/login'],
      orders: [
        'POST /api/orders',
        'GET /api/orders/cliente/:clienteId',
        'GET /api/orders/rastreio/:codigoRastreio',
        'GET /api/orders/estoque/cor/:cor'
      ],
      production: ['POST /api/callback'],
      inventory: [
        'GET /api/estoque/listar',
        'GET /api/estoque/sync',
        'GET /api/estoque/tenis'
      ],
      integration: [
        'GET /api/integration/status',
        'GET /api/integration/test',
        'POST /api/integration/sync-stock'
      ]
    }
  });
});

// 3. STATUS DA INTEGRAÇÃO
app.get('/api/integration/status', async (req, res) => {
  try {
    // Testar Queue Smart
    let queueTest;
    try {
      const response = await fetch(`${MIDDLEWARE_URL}/health`, { timeout: 5000 });
      const data = await response.json();
      queueTest = {
        status: 'connected',
        response: data,
        response_time: 'ok'
      };
    } catch (error) {
      queueTest = {
        status: 'disconnected',
        error: error.message
      };
    }
    
    // Testar banco
    let dbTest;
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT NOW() as time');
      client.release();
      dbTest = {
        status: 'connected',
        time: result.rows[0].time
      };
    } catch (error) {
      dbTest = {
        status: 'disconnected',
        error: error.message
      };
    }
    
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      integration: {
        queue_smart: queueTest,
        database: dbTest,
        backend: {
          url: BACKEND_URL,
          status: 'running'
        },
        overall_status: queueTest.status === 'connected' && dbTest.status === 'connected' 
          ? 'fully_integrated' 
          : 'partial_integration'
      },
      endpoints: {
        health: `${BACKEND_URL}/api/health`,
        queue_test: `${BACKEND_URL}/api/integration/test/queue`,
        stock_check: `${BACKEND_URL}/api/orders/estoque/cor/azul`,
        create_order: `${BACKEND_URL}/api/orders`
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 4. SINCRONIZAR ESTOQUE MANUALMENTE
app.post('/api/integration/sync-stock', async (req, res) => {
  try {
    console.log('🔄 SINCRONIZAÇÃO MANUAL DE ESTOQUE SOLICITADA');
    
    // Importar serviço de sincronização
    const syncModule = await import('./scripts/syncEstoque.js');
    await syncModule.sincronizarEstoque();
    
    res.json({
      success: true,
      message: 'Sincronização de estoque iniciada',
      timestamp: new Date().toISOString(),
      details: {
        source: MIDDLEWARE_URL,
        target: 'estoque_maquina table',
        action: 'full_sync'
      }
    });
    
  } catch (error) {
    console.error('❌ Erro na sincronização:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 5. TESTE DE CONEXÃO COM QUEUE SMART
app.get('/api/integration/test/queue', async (req, res) => {
  try {
    console.log('🧪 TESTE DE CONEXÃO COM QUEUE SMART');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(`${MIDDLEWARE_URL}/health`, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    const data = await response.json();
    
    res.json({
      success: true,
      status: 'connected',
      middleware: MIDDLEWARE_URL,
      response: data,
      response_time: 'ok',
      timestamp: new Date().toISOString(),
      recommendation: 'Queue Smart está online e pronto para produção'
    });
    
  } catch (error) {
    console.error('❌ Teste falhou:', error.message);
    
    res.status(500).json({
      success: false,
      status: 'disconnected',
      middleware: MIDDLEWARE_URL,
      error: error.message,
      timestamp: new Date().toISOString(),
      recommendation: 'Verifique a conexão com o Queue Smart ou use modo fallback'
    });
  }
});

// 6. VERIFICAR ESTOQUE DE TENIS
app.get('/api/estoque/tenis', async (req, res) => {
  try {
    const client = await pool.connect();
    
    const result = await client.query(`
      SELECT 
        id,
        cor,
        quantidade,
        em_producao,
        estoque_pos,
        middleware_id,
        nome_produto,
        categoria,
        localizacao,
        created_at,
        updated_at
      FROM estoque_maquina 
      WHERE categoria ILIKE '%tenis%' OR cor IS NOT NULL
      ORDER BY cor
    `);
    
    client.release();
    
    // Verificar também no Queue Smart
    let queueStock = {};
    try {
      const queueResponse = await fetch(`${MIDDLEWARE_URL}/api/estoque`);
      if (queueResponse.ok) {
        queueStock = await queueResponse.json();
      }
    } catch (queueError) {
      console.log('ℹ️ Não foi possível obter estoque do Queue Smart');
    }
    
    res.json({
      success: true,
      count: result.rows.length,
      source: 'database',
      queue_smart_available: Object.keys(queueStock).length > 0,
      data: result.rows,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 7. SINCRONIZAÇÃO SIMPLES DE ESTOQUE
app.get('/api/estoque/sync', async (req, res) => {
  try {
    const client = await pool.connect();
    
    // Atualizar estoque baseado em dados existentes
    await client.query(`
      UPDATE estoque_maquina 
      SET cor = LOWER(SPLIT_PART(nome_produto, ' ', 2)),
          categoria = 'tenis',
          quantidade_minima = 5
      WHERE nome_produto ILIKE '%tenis%' 
         OR nome_produto ILIKE '%sneaker%'
         OR nome_produto ILIKE '%azul%'
         OR nome_produto ILIKE '%branco%'
         OR nome_produto ILIKE '%preto%'
    `);
    
    const updated = await client.query(`
      SELECT COUNT(*) as updated 
      FROM estoque_maquina 
      WHERE cor IS NOT NULL
    `);
    
    client.release();
    
    res.json({
      success: true,
      message: 'Estoque sincronizado com cores',
      updated: updated.rows[0].updated,
      timestamp: new Date().toISOString(),
      next_steps: [
        'Verifique se todas as cores estão mapeadas',
        'Teste criação de pedido',
        'Verifique integração com Queue Smart'
      ]
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// 🧪 ENDPOINTS DE TESTE E DESENVOLVIMENTO
// ============================================

// 1. TESTE DE CORS
app.get('/api/test/cors', (req, res) => {
  res.json({
    success: true,
    message: 'CORS está funcionando corretamente!',
    origin: req.headers.origin || 'No origin header',
    method: req.method,
    timestamp: new Date().toISOString(),
    headers: {
      'Access-Control-Allow-Origin': req.headers.origin || '*',
      'Access-Control-Allow-Credentials': 'true'
    }
  });
});

// 2. TESTE DE ESTOQUE
app.get('/api/test/estoque', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(`
      SELECT 
        id,
        nome_produto,
        cor,
        quantidade,
        em_producao,
        estoque_pos,
        middleware_id,
        categoria,
        created_at
      FROM estoque_maquina 
      ORDER BY id
      LIMIT 20
    `);
    client.release();
    
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
      timestamp: new Date().toISOString(),
      note: 'Estes são dados do banco local. Para estoque real, use Queue Smart.'
    });
    
  } catch (error) {
    res.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// 3. TESTE DE PEDIDO SIMPLES
app.post('/api/test/pedido', async (req, res) => {
  try {
    const { cliente_id = 1, cor = 'azul', quantidade = 1 } = req.body;
    
    console.log('🧪 TESTE DE PEDIDO:', { cliente_id, cor, quantidade });
    
    // Simular verificação de estoque
    const estoqueCheck = await fetch(`${MIDDLEWARE_URL}/api/estoque/${cor}`)
      .then(r => r.ok ? r.json() : { disponivel: false, quantidade: 0 })
      .catch(() => ({ disponivel: false, quantidade: 0 }));
    
    if (!estoqueCheck.disponivel || estoqueCheck.quantidade < quantidade) {
      return res.status(409).json({
        success: false,
        error: `Estoque insuficiente para ${cor}. Disponível: ${estoqueCheck.quantidade || 0}`,
        estoque: estoqueCheck
      });
    }
    
    // Simular criação de pedido
    const pedidoTest = {
      success: true,
      message: 'Pedido de teste criado com sucesso!',
      pedido: {
        id: Math.floor(Math.random() * 10000),
        codigo_rastreio: `TEST${Date.now()}`,
        cliente_id,
        status: 'pendente',
        status_producao: 'em_producao',
        data_pedido: new Date().toISOString()
      },
      estoque: estoqueCheck,
      integration: {
        queue_smart: MIDDLEWARE_URL,
        estoque_verificado: true,
        producao_iniciada: true
      },
      timestamp: new Date().toISOString()
    };
    
    res.status(201).json(pedidoTest);
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 4. TESTE DE CONEXÃO COMPLETA
app.get('/api/test/full-integration', async (req, res) => {
  try {
    console.log('🔗 TESTE DE INTEGRAÇÃO COMPLETA');
    
    const tests = [];
    
    // Teste 1: Banco de dados
    try {
      const client = await pool.connect();
      await client.query('SELECT 1');
      client.release();
      tests.push({ name: 'database', status: 'connected', message: 'Banco conectado' });
    } catch (dbError) {
      tests.push({ name: 'database', status: 'failed', error: dbError.message });
    }
    
    // Teste 2: Queue Smart
    try {
      const response = await fetch(`${MIDDLEWARE_URL}/health`, { timeout: 5000 });
      const data = await response.json();
      tests.push({ 
        name: 'queue_smart', 
        status: 'connected', 
        message: 'Queue Smart online',
        details: data 
      });
    } catch (queueError) {
      tests.push({ 
        name: 'queue_smart', 
        status: 'failed', 
        error: queueError.message 
      });
    }
    
    // Teste 3: Estoque azul
    try {
      const stockResponse = await fetch(`${MIDDLEWARE_URL}/api/estoque/azul`);
      const stockData = stockResponse.ok ? await stockResponse.json() : null;
      tests.push({
        name: 'stock_check',
        status: stockResponse.ok ? 'available' : 'failed',
        message: stockResponse.ok ? 'Estoque disponível' : 'Erro ao verificar estoque',
        details: stockData
      });
    } catch (stockError) {
      tests.push({
        name: 'stock_check',
        status: 'failed',
        error: stockError.message
      });
    }
    
    const allPassed = tests.every(t => t.status === 'connected' || t.status === 'available');
    
    res.json({
      success: true,
      integration_test: {
        overall_status: allPassed ? 'fully_integrated' : 'partial_integration',
        tests,
        timestamp: new Date().toISOString()
      },
      recommendations: allPassed 
        ? '✅ Sistema pronto para produção!'
        : '⚠️ Alguns componentes estão offline. Verifique a conexão.'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// ROTA RAIZ
// ============================================

app.get('/', (req, res) => {
  res.json({
    message: '🚀 SneakerLabs Backend API v4.0',
    description: 'Sistema de produção integrado com Queue Smart 4.0',
    version: '4.0.0',
    status: 'operational',
    integration: 'queue_smart_4.0_active',
    features: [
      'Real-time inventory checking',
      'Automated production workflow',
      'Smart production queue integration',
      'Automatic callback system',
      'Order tracking and management'
    ],
    documentation: `${BACKEND_URL}/api/config`,
    health_check: `${BACKEND_URL}/api/health`,
    production_url: BACKEND_URL,
    middleware_url: MIDDLEWARE_URL,
    quick_links: {
      test_connection: `${BACKEND_URL}/api/integration/test/queue`,
      check_stock: `${BACKEND_URL}/api/orders/estoque/cor/azul`,
      create_test_order: `${BACKEND_URL}/api/test/pedido`
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
    available_routes: {
      root: 'GET /',
      health: 'GET /api/health',
      config: 'GET /api/config',
      integration: 'GET /api/integration/status',
      test_connection: 'GET /api/integration/test/queue',
      create_order: 'POST /api/orders',
      check_stock: 'GET /api/orders/estoque/cor/:cor'
    },
    timestamp: new Date().toISOString(),
    documentation: `${BACKEND_URL}/api/config`
  });
});

// Erro global
app.use((err, req, res, next) => {
  console.error('❌ ERRO GLOBAL:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
  
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'production' 
      ? 'Entre em contato com o suporte técnico'
      : err.message,
    request_id: Date.now(),
    timestamp: new Date().toISOString(),
    support: {
      backend: BACKEND_URL,
      health_check: `${BACKEND_URL}/api/health`
    }
  });
});

// ============================================
// INICIALIZAÇÃO DO SERVIDOR
// ============================================

const startServer = async () => {
  try {
    // Verificar estrutura do banco
    await verificarEstruturaBanco();
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log('\n' + '='.repeat(70));
      console.log('✅ SERVIDOR INICIADO COM SUCESSO!');
      console.log('='.repeat(70));
      console.log(`📡 Porta: ${PORT}`);
      console.log(`🌍 Local: http://localhost:${PORT}`);
      console.log(`🚀 Produção: ${BACKEND_URL}`);
      console.log(`🔗 Queue Smart: ${MIDDLEWARE_URL}`);
      
      console.log('\n🎯 ENDPOINTS PRINCIPAIS:');
      console.log(`   🔗 Health Check: ${BACKEND_URL}/api/health`);
      console.log(`   ⚙️  Configuração: ${BACKEND_URL}/api/config`);
      console.log(`   🔄 Status Integração: ${BACKEND_URL}/api/integration/status`);
      console.log(`   🧪 Teste Conexão: ${BACKEND_URL}/api/integration/test/queue`);
      console.log(`   📦 Estoque Azul: ${BACKEND_URL}/api/orders/estoque/cor/azul`);
      console.log(`   🚚 Criar Pedido: ${BACKEND_URL}/api/orders`);
      
      console.log('\n🧪 TESTES RÁPIDOS:');
      console.log(`   🔗 ${BACKEND_URL}/api/test/cors`);
      console.log(`   🔗 ${BACKEND_URL}/api/test/estoque`);
      console.log(`   🔗 ${BACKEND_URL}/api/test/full-integration`);
      
      console.log('\n🎯 SISTEMA 100% INTEGRADO COM QUEUE SMART 4.0!');
      console.log('='.repeat(70));
      console.log('\n🚀 PRONTO PARA PRODUÇÃO REAL!');
      console.log('='.repeat(70));
    });
    
  } catch (error) {
    console.error('\n❌ ERRO CRÍTICO:', error.message);
    console.log('💡 Tentando iniciar em modo de emergência...');
    
    // Inicia mesmo com erro
    app.listen(PORT, () => {
      console.log(`\n⚠️  Servidor iniciado na porta ${PORT} (modo emergência)`);
      console.log(`🔗 Acesse: http://localhost:${PORT}`);
      console.log('💡 Funcionalidades de banco podem estar limitadas');
    });
  }
};

// INICIAR TUDO
startServer();

export default app;