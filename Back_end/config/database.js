import pkg from 'pg';
const { Pool } = pkg;

// Configuração FLEXÍVEL para Render.com e desenvolvimento local
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
    const dbName = process.env.DB_NAME || 'sneakerlabsdb';  // ← CORRIGIDO!
    
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

// Teste de conexão
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ Erro ao conectar ao banco:', err.message);
        console.log('💡 Verifique:');
        console.log('   1. PostgreSQL está rodando?');
        console.log('   2. Credenciais no .env.local estão corretas?');
        console.log('   3. DATABASE_URL configurada no Render?');
    } else {
        console.log('✅ Banco conectado com sucesso!');
        console.log(`   ⏰ Hora do servidor: ${res.rows[0].now}`);
    }
});

export default pool;