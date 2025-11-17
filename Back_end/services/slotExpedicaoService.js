// services/slotExpedicaoService.js - ATUALIZADO
import pool from '../config/database.js';

class SlotExpedicaoService {
  async alocarSlot(pedidoId) {
    try {
      // BUSCA slot livre baseado na SUA estrutura
      const slotLivreResult = await pool.query(
        'SELECT id, pedido_id FROM slots_expedicao WHERE status = $1 OR status IS NULL LIMIT 1',
        ['LIVRE']
      );

      if (slotLivreResult.rows.length === 0) {
        throw new Error('Nenhum slot livre disponível');
      }

      const slotId = slotLivreResult.rows[0].id;

      // ATUALIZA baseado na SUA estrutura de colunas
      const updateResult = await pool.query(
        `UPDATE slots_expedicao 
         SET status = $1, pedido_id = $2, data_ocupacao = $3, updated_at = $4
         WHERE id = $5 
         RETURNING *`,
        ['OCUPADO', pedidoId, new Date(), new Date(), slotId]
      );

      console.log(`✅ Slot ${slotId} alocado para pedido ${pedidoId}`);
      return updateResult.rows[0];
    } catch (error) {
      console.error('❌ Erro ao alocar slot:', error);
      throw new Error(`Erro ao alocar slot: ${error.message}`);
    }
  }

  async liberarSlot(pedidoId) {
    try {
      console.log(`🔍 Buscando slot para pedido ${pedidoId}...`);
      
      // BUSCA slot ocupado pelo pedido - baseado na SUA estrutura
      const slotOcupadoResult = await pool.query(
        'SELECT id, pedido_id FROM slots_expedicao WHERE pedido_id = $1 AND status = $2',
        [pedidoId, 'OCUPADO']
      );

      if (slotOcupadoResult.rows.length === 0) {
        console.log(`⚠️ Nenhum slot encontrado para pedido ${pedidoId}`);
        
        // Debug: ver todos os slots
        const todosSlots = await pool.query('SELECT id, status, pedido_id FROM slots_expedicao');
        console.log('📋 Slots disponíveis:', todosSlots.rows);
        
        return { message: 'Nenhum slot estava alocado para este pedido' };
      }

      const slotId = slotOcupadoResult.rows[0].id;

      // LIBERA slot - baseado na SUA estrutura
      const updateResult = await pool.query(
        `UPDATE slots_expedicao 
         SET status = $1, pedido_id = NULL, data_liberacao = $2, updated_at = $3
         WHERE id = $4 
         RETURNING *`,
        ['LIVRE', new Date(), new Date(), slotId]
      );

      console.log(`✅ Slot ${slotId} liberado do pedido ${pedidoId}`);
      return updateResult.rows[0];
    } catch (error) {
      console.error('❌ Erro ao liberar slot:', error);
      throw new Error(`Erro ao liberar slot: ${error.message}`);
    }
  }

  async getSlotsDisponiveis() {
    try {
      const result = await pool.query(
        'SELECT COUNT(*) as total_livres FROM slots_expedicao WHERE status = $1 OR status IS NULL',
        ['LIVRE']
      );
      return parseInt(result.rows[0].total_livres);
    } catch (error) {
      console.error('❌ Erro ao buscar slots disponíveis:', error);
      throw new Error(`Erro ao buscar slots disponíveis: ${error.message}`);
    }
  }
}

export default new SlotExpedicaoService();