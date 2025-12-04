// services/slotExpedicaoService.js - VERSÃO DEFINITIVA
import pool from '../config/database.js';

class SlotExpedicaoService {
  async alocarSlot(pedidoId) {
    try {
      // Busca slot livre: status NULL OU diferente de 'OCUPADO'
      const slotLivreResult = await pool.query(
        `SELECT id FROM slots_expedicao 
         WHERE (status IS NULL OR status != 'OCUPADO') 
           AND pedido_id IS NULL 
         LIMIT 1`
      );

      if (slotLivreResult.rows.length === 0) {
        throw new Error('Nenhum slot livre disponível');
      }

      const slotId = slotLivreResult.rows[0].id;

      const updateResult = await pool.query(
        `UPDATE slots_expedicao 
         SET status = 'OCUPADO', 
             pedido_id = $1, 
             data_ocupacao = NOW(), 
             updated_at = NOW()
         WHERE id = $2 
         RETURNING *`,
        [pedidoId, slotId]
      );

      return updateResult.rows[0];
    } catch (error) {
      console.error('Erro ao alocar slot:', error);
      throw error;
    }
  }

  async liberarSlot(pedidoId) {
    try {
      const slotOcupadoResult = await pool.query(
        `SELECT id FROM slots_expedicao 
         WHERE pedido_id = $1 AND status = 'OCUPADO'`,
        [pedidoId]
      );

      if (slotOcupadoResult.rows.length === 0) {
        return { message: 'Nenhum slot estava alocado para este pedido' };
      }

      const slotId = slotOcupadoResult.rows[0].id;

      const updateResult = await pool.query(
        `UPDATE slots_expedicao 
         SET status = NULL, 
             pedido_id = NULL, 
             data_liberacao = NOW(), 
             updated_at = NOW()
         WHERE id = $1 
         RETURNING *`,
        [slotId]
      );

      return updateResult.rows[0];
    } catch (error) {
      console.error('Erro ao liberar slot:', error);
      throw error;
    }
  }

  async getSlotsDisponiveis() {
    try {
      const result = await pool.query(
        `SELECT COUNT(*) as total_livres 
         FROM slots_expedicao 
         WHERE (status IS NULL OR status != 'OCUPADO') 
           AND pedido_id IS NULL`
      );
      return parseInt(result.rows[0].total_livres);
    } catch (error) {
      console.error('Erro ao buscar slots:', error);
      throw error;
    }
  }
}

export default new SlotExpedicaoService();