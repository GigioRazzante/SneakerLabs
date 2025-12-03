import pg from 'pg';
const { Pool } = pg;

// Configuração para Render.com (produção)
const productionConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
};

// Configuração para desenvolvimento local
const developmentConfig = {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'SneakerLabsDB',
    password: process.env.DB_PASSWORD || 'senai',
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: false
};

// Usar configuração baseada no ambiente
const dbConfig = process.env.NODE_ENV === 'production' 
    ? productionConfig 
    : developmentConfig;

const pool = new Pool(dbConfig);

// Log de conexão
console.log(`📦 Banco configurado para: ${process.env.NODE_ENV || 'development'}`);

export default pool;