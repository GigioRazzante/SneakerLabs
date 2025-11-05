import { Pool } from 'pg';

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'SneakerLabs DB',
    password: 'senai',
    port: 5432,
});

export default pool;