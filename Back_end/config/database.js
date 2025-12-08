// Back_end/config/database.js - VERSÃO FINAL DE PRODUÇÃO
import pkg from 'pg';
const { Pool } = pkg;

console.log('🚀 Iniciando conexão com o banco...');

// ✅ USAR VARIÁVEL DE AMBIENTE (Render vai fornecer)
const DATABASE_URL = process.env.DATABASE_URL;

// URL de fallback apenas para desenvolvimento local
const NEON_DB_URL = 'postgresql://neondb_owner:npg_yoEJUAXkd9W5@ep-little-band-afek0jf4-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require';

const connectionString = DATABASE_URL || NEON_DB_URL;

// Detectar ambiente
const isNeon = connectionString.includes('neon.tech');
const isRender = connectionString.includes('render.com');

if (isNeon) {
    console.log('🔗 Conectando ao Neon PostgreSQL...');
} else if (isRender) {
    console.log('🔗 Conectando ao Render PostgreSQL...');
} else {
    console.log('🔗 Conectando a banco local...');
}

const pool = new Pool({
    connectionString: connectionString,
    ssl: { 
        rejectUnauthorized: false 
    },
    // Configurações otimizadas
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
    max: 10, // Neon Free: 10 conexões
    application_name: 'sneakerlabs-backend'
});

// Teste de conexão silencioso para produção
(async () => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT NOW() as hora');
        console.log(`✅ Banco conectado: ${result.rows[0].hora}`);
        client.release();
    } catch (err) {
        console.error('❌ ERRO: Falha na conexão com o banco:', err.message);
    }
})();

export default pool;