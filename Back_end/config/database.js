// Back_end/config/database.js - VERSÃO DEFINITIVA
import pkg from 'pg';
const { Pool } = pkg;

console.log('🚀 Configurando conexão com o banco do Render...');

// ✅ URL CORRETA - Use a EXTERNAL do seu Render
const RENDER_DB_URL = 'postgresql://sneakerlabsdb_user:btvZE5o6LiixUx48aA8eFVoL1lb6R0Wq@dpg-d4out3i4i8rc73b1akrg-a.oregon-postgres.render.com:5432/sneakerlabsdb?sslmode=require';

console.log(`🔗 Usando: ${RENDER_DB_URL.split('@')[1].split(':')[0]}`);

const pool = new Pool({
    connectionString: RENDER_DB_URL,
    ssl: {
        rejectUnauthorized: false
    },
    connectionTimeoutMillis: 30000,
    idleTimeoutMillis: 30000,
    max: 20
});

// Teste de conexão IMEDIATO
(async () => {
    try {
        console.log('🔄 Testando conexão com o banco...');
        const client = await pool.connect();
        
        // Teste 1: Verificar hora do servidor
        const timeResult = await client.query('SELECT NOW() as current_time');
        console.log(`✅ Conexão estabelecida! Hora do servidor: ${timeResult.rows[0].current_time}`);
        
        // Teste 2: Verificar banco
        const dbResult = await client.query('SELECT current_database() as db_name');
        console.log(`📊 Banco conectado: ${dbResult.rows[0].db_name}`);
        
        // Teste 3: Verificar versão do PostgreSQL
        const versionResult = await client.query('SELECT version()');
        console.log(`🔧 PostgreSQL: ${versionResult.rows[0].version.split(',')[0]}`);
        
        client.release();
        console.log('🎉 Conexão com Render PostgreSQL 100% funcional!');
        
    } catch (err) {
        console.error('❌ ERRO na conexão:', err.message);
        console.log('\n🔧 VERIFIQUE:');
        console.log('1. URL no Render Dashboard: Connections → External');
        console.log('2. Adicione "?sslmode=require" no final da URL');
        console.log('3. Aguarde 2 minutos após criar o banco');
        console.log('\n🌐 Para testar agora:');
        console.log('   psql "postgresql://sneakerlabsdb_user:btvZE5o6LiixUx48aA8eFVoL1lb6R0Wq@dpg-d4out3i4i8rc73b1akrg-a.oregon-postgres.render.com:5432/sneakerlabsdb"');
    }
})();

export default pool;