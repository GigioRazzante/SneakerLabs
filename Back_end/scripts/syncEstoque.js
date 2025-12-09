// scripts/syncEstoque.js - Sincroniza estoque com Queue Smart
import pool from '../config/database.js';
import fetch from 'node-fetch';

const MIDDLEWARE_URL = process.env.MIDDLEWARE_URL || 'http://52.72.137.244:3000';

async function sincronizarEstoque() {
  console.log('🔄 Sincronizando estoque com Queue Smart...');
  
  try {
    const client = await pool.connect();
    
    // 1. Buscar estoque do Queue Smart
    const response = await fetch(`${MIDDLEWARE_URL}/api/estoque`);
    if (!response.ok) throw new Error('Falha ao buscar estoque do middleware');
    
    const estoqueMiddleware = await response.json();
    console.log(`📦 Estoque do middleware:`, estoqueMiddleware);
    
    // 2. Atualizar banco local
    for (const item of estoqueMiddleware) {
      await client.query(`
        INSERT INTO estoque_maquina 
        (cor, quantidade, em_producao, estoque_pos, nome_produto, categoria, middleware_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (cor) 
        DO UPDATE SET
          quantidade = EXCLUDED.quantidade,
          em_producao = EXCLUDED.em_producao,
          estoque_pos = EXCLUDED.estoque_pos,
          updated_at = NOW()
      `, [
        item.cor,
        item.quantidade || 0,
        item.em_producao || 0,
        item.estoque_pos || 0,
        `Tênis ${item.cor.charAt(0).toUpperCase() + item.cor.slice(1)}`,
        'tenis',
        item.id || item._id
      ]);
    }
    
    console.log('✅ Estoque sincronizado com sucesso!');
    client.release();
    
  } catch (error) {
    console.error('❌ Erro na sincronização:', error.message);
  }
}

// Executar
sincronizarEstoque();