import pkg from 'pg';
const { Pool } = pkg;

console.log('🚀 Iniciando conexão com banco de dados...');

// ============================================
// CONFIGURAÇÃO APENAS PARA RENDER
// ============================================

// NO RENDER: Esta variável existe automaticamente
// NO LOCAL: Crie um arquivo .env com DATABASE_URL para testar
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    console.log('⚠️  AVISO: DATABASE_URL não encontrada');
    console.log('💡 Para desenvolvimento LOCAL:');
    console.log('   1. Crie um arquivo .env na pasta Back_end');
    console.log('   2. Adicione: DATABASE_URL=sua_url_do_render');
    console.log('');
    console.log('💡 Para PRODUÇÃO no Render:');
    console.log('   - A DATABASE_URL já está configurada automaticamente');
    console.log('   - Faça git push e teste na nuvem:');
    console.log('   - https://sneakerslab-backend.onrender.com');
    console.log('');
    console.log('🎯 Continuando sem banco local...');
}

const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: DATABASE_URL ? { rejectUnauthorized: false } : false
});

// Teste de conexão (apenas se tiver DATABASE_URL)
if (DATABASE_URL) {
    pool.query('SELECT NOW()', (err, res) => {
        if (err) {
            console.error('❌ Erro ao conectar ao banco:', err.message);
            console.log('🔍 Verifique sua DATABASE_URL no arquivo .env');
        } else {
            console.log('✅ Banco conectado com sucesso!');
            console.log(`   ⏰ Hora do servidor: ${res.rows[0].now}`);
            console.log(`   📍 Conectado ao: ${DATABASE_URL.includes('render.com') ? 'RENDER' : 'banco configurado'}`);
        }
    });
} else {
    console.log('⚠️  Executando SEM banco de dados (modo de emergência)');
    console.log('💡 URLs ainda funcionarão, mas rotas de banco darão erro');
}

export default pool;