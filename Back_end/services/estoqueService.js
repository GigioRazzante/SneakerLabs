// services/estoqueService.js
import pool from '../config/database.js';

class EstoqueService {
  async listarEstoque() {
    const result = await pool.query('SELECT * FROM estoque_maquina ORDER BY tipo, nome');
    return result.rows;
  }

  async reporItem(id, quantidade) {
    const result = await pool.query(
      'UPDATE estoque_maquina SET quantidade = quantidade + $1 WHERE id = $2 RETURNING *',
      [quantidade, id]
    );
    
    if (result.rows.length === 0) {
      throw new Error('Item não encontrado no estoque');
    }
    
    return result.rows[0];
  }

  // Verificar se tem estoque para um pedido
  async verificarEstoqueParaProducao(blocosNecessarios, laminasNecessarias) {
    // Implementar lógica baseada no generateBoxPayload
    const estoque = await this.listarEstoque();
    // Verificar se tem lâminas e blocos suficientes
    return { podeProduzir: true, itensFaltantes: [] };
  }
}

export default new EstoqueService();