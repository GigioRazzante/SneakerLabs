// server.js - VERSÃO COMPLETA COM INICIALIZAÇÃO AUTOMÁTICA DO BANCO
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

// Importar configuração do banco
import pkg from 'pg';
const { Pool } = pkg;

// ============================================
// CONFIGURAÇÃO DO BANCO DE DADOS
// ============================================

const getDatabaseConfig = () => {
    // 1. PRIMEIRO: Tenta usar DATABASE_URL do Render (produção)
    if (process.env.DATABASE_URL) {
        console.log('📦 Usando DATABASE_URL do Render (produção)');
        return {
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false }
        };
    }
    
    // 2. SEGUNDO: Tenta variáveis de ambiente individuais
    const dbUser = process.env.DB_USER || 'postgres';
    const dbPassword = process.env.DB_PASSWORD || 'senai';
    const dbHost = process.env.DB_HOST || 'localhost';
    const dbPort = process.env.DB_PORT || '5432';
    const dbName = process.env.DB_NAME || 'SneakerLabs DB';
    
    const connectionString = `postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`;
    
    console.log('📦 Usando configuração local:', {
        host: dbHost,
        database: dbName,
        user: dbUser
    });
    
    return {
        connectionString,
        ssl: false
    };
};

const dbConfig = getDatabaseConfig();
const pool = new Pool(dbConfig);

// ============================================
// INICIALIZAÇÃO AUTOMÁTICA DO BANCO
// ============================================

const inicializarBancoSneakerLabs = async () => {
  console.log('🔧 Inicializando banco de dados SneakerLabs...');
  
  try {
    const client = await pool.connect();
    
    // 1. CLIENTES (exata do seu authController)
    await client.query(`
      CREATE TABLE IF NOT EXISTS clientes (
        id SERIAL PRIMARY KEY,
        email VARCHAR(100) UNIQUE NOT NULL,
        senha VARCHAR(255) NOT NULL,
        nome_usuario VARCHAR(50) UNIQUE NOT NULL,
        data_nascimento DATE,
        telefone VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        cor_perfil VARCHAR(7) DEFAULT '#3498db'
      )
    `);
    console.log('✅ Tabela "clientes" criada/verificada');

    // 2. ESTOQUE_MAQUINA (exata do seu estoqueController)
    await client.query(`
      CREATE TABLE IF NOT EXISTS estoque_maquina (
        id SERIAL PRIMARY KEY,
        nome_produto VARCHAR(100) NOT NULL,
        quantidade INTEGER NOT NULL DEFAULT 0,
        quantidade_minima INTEGER DEFAULT 10,
        localizacao VARCHAR(50),
        categoria VARCHAR(50),
        codigo VARCHAR(50) UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabela "estoque_maquina" criada/verificada');

    // 3. PEDIDOS (exata do seu pedidoController)
    await client.query(`
      CREATE TABLE IF NOT EXISTS pedidos (
        id SERIAL PRIMARY KEY,
        cliente_id INTEGER NOT NULL,
        status_geral VARCHAR(50) DEFAULT 'pendente',
        valor_total DECIMAL(10,2) DEFAULT 0.00,
        data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Tabela "pedidos" criada/verificada');

    // 4. PRODUTOS_DO_PEDIDO (exata do seu pedidoController)
    await client.query(`
      CREATE TABLE IF NOT EXISTS produtos_do_pedido (
        id SERIAL PRIMARY KEY,
        pedido_id INTEGER NOT NULL,
        passo_um VARCHAR(100),
        passo_dois VARCHAR(100),
        passo_tres VARCHAR(100),
        passo_quatro VARCHAR(100),
        passo_cinco VARCHAR(100),
        status_producao VARCHAR(50) DEFAULT 'aguardando',
        valor DECIMAL(10,2) DEFAULT 0.00,
        codigo_rastreio VARCHAR(100),
        sneaker_config JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        imagem_url TEXT,
        imagem_nome_arqui VARCHAR(255),
        imagem_caminho TEXT,
        slot_expedicao INTEGER,
        mensagem_personalizada TEXT,
        FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Tabela "produtos_do_pedido" criada/verificada');

    // 5. SLOTS_EXPEDICAO (exata do seu slotExpedicaoService)
    await client.query(`
      CREATE TABLE IF NOT EXISTS slots_expedicao (
        id SERIAL PRIMARY KEY,
        status VARCHAR(50),
        pedido_id INTEGER,
        data_ocupacao TIMESTAMP,
        data_liberacao TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE SET NULL
      )
    `);
    console.log('✅ Tabela "slots_expedicao" criada/verificada');

    // 🎯 INSERIR DADOS INICIAIS NO ESTOQUE
    console.log('📦 Inserindo dados iniciais no estoque...');
    await client.query(`
      INSERT INTO estoque_maquina 
        (nome_produto, quantidade, quantidade_minima, categoria, codigo, localizacao) 
      VALUES
        ('Bloco Caixa Casual - 1 Andar', 50, 10, 'bloco', 'B1', 'Área de Blocos'),
        ('Bloco Caixa Corrida - 2 Andares', 40, 8, 'bloco', 'B2', 'Área de Blocos'),
        ('Bloco Caixa Skate - 3 Andares', 30, 6, 'bloco', 'B3', 'Área de Blocos'),
        ('Lâmina Ilustrativa - Couro', 100, 20, 'material', 'M1', 'Gaveta Lâminas'),
        ('Lâmina Ilustrativa - Camurça', 90, 18, 'material', 'M2', 'Gaveta Lâminas'),
        ('Lâmina Ilustrativa - Tecido', 120, 24, 'material', 'M3', 'Gaveta Lâminas'),
        ('Lâmina Ilustrativa - Solado Borracha', 80, 16, 'solado', 'S1', 'Gaveta Solados'),
        ('Lâmina Colorida - Branco', 150, 30, 'cor', 'L1', 'Gaveta Cores'),
        ('Lâmina Colorida - Preto', 140, 28, 'cor', 'L2', 'Gaveta Cores'),
        ('Adesivo Ilustrativo - Cadarço Normal', 200, 40, 'detalhe', 'D1', 'Caixa Adesivos')
      ON CONFLICT (codigo) DO NOTHING
    `);
    console.log('✅ 10 itens inseridos no estoque');

    // 🎯 CRIAR SLOTS VAZIOS
    await client.query(`
      INSERT INTO slots_expedicao (status) VALUES 
        (NULL), (NULL), (NULL), (NULL), (NULL)
      ON CONFLICT DO NOTHING
    `);
    console.log('✅ 5 slots de expedição criados');

    // 🎯 VERIFICAÇÃO FINAL
    const tabelas = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('\n📊 TABELAS CRIADAS NO BANCO:');
    tabelas.rows.forEach(t => console.log(`   ✅ ${t.table_name}`));
    
    // Verificar dados no estoque
    const estoqueCount = await client.query('SELECT COUNT(*) FROM estoque_maquina');
    console.log(`\n📦 ESTOQUE: ${estoqueCount.rows[0].count} itens cadastrados`);
    
    // Teste de conexão
    const horaServer = await client.query('SELECT NOW()');
    console.log(`⏰ Hora do servidor: ${horaServer.rows[0].now}`);
    
    client.release();
    console.log('\n🎉 BANCO DE DADOS INICIALIZADO COM SUCESSO!');
    console.log('============================================');
    
  } catch (error) {
    console.error('❌ ERRO AO INICIALIZAR BANCO:', error.message);
    console.error('💡 Verifique se:');
    console.error('   1. DATABASE_URL está configurada no Render');
    console.error('   2. O banco PostgreSQL está acessível');
    console.error('   3. As permissões estão corretas');
  }
};

// ============================================
// CONFIGURAÇÃO DO EXPRESS
// ============================================

const app = express();
const PORT = process.env.PORT || 3001;

// Configuração de CORS
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
        res.status(500).json({
            status: 'unhealthy',
            error: error.message,
            database: 'disconnected'
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
        middlewares: {
            aws_middleware: {
                url: process.env.MIDDLEWARE_URL || 'http://52.1.197.112:3000',
                status: 'configurado'
            },
            openai: process.env.OPENAI_API_KEY ? '✅ Configurado' : '❌ Não configurado',
            estoque_automatico: '✅ Ativado',
            slots_expedicao: '✅ Ativado',
            inicializacao_banco: '✅ Automática'
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

// Rota para verificar dados do estoque (para testes)
app.get('/api/test/estoque', async (req, res) => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM estoque_maquina ORDER BY categoria, nome_produto');
        client.release();
        
        res.json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
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
// INICIAR SERVIDOR E BANCO
// ============================================

const startServer = async () => {
  try {
    // Inicializar banco de dados
    await inicializarBancoSneakerLabs();
    
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
    
  } catch (error) {
    console.error('❌ ERRO CRÍTICO AO INICIAR SERVIDOR:', error);
    process.exit(1);
  }
};

// Iniciar tudo
startServer();