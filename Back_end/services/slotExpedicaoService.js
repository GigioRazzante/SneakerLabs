import pool from '../config/database.js';

class SlotExpedicaoService {
  async alocarSlot(pedidoId) {
    try {
      const slotLivreResult = await pool.query(
        'SELECT id FROM slots_expedicao WHERE status = $1 LIMIT 1',
        ['LIVRE']
      );

      if (slotLivreResult.rows.length === 0) {
        throw new Error('Nenhum slot livre disponível');
      }

      const slotId = slotLivreResult.rows[0].id;

      const updateResult = await pool.query(
        `UPDATE slots_expedicao 
         SET status = $1, pedido_id = $2, data_ocupacao = $3, data_liberacao = NULL 
         WHERE id = $4 
         RETURNING *`,
        ['OCUPADO', pedidoId, new Date(), slotId]
      );

      return updateResult.rows[0];
    } catch (error) {
      throw new Error(`Erro ao alocar slot: ${error.message}`);
    }
  }

  async liberarSlot(pedidoId) {
    try {
      const slotOcupadoResult = await pool.query(
        'SELECT id FROM slots_expedicao WHERE pedido_id = $1 AND status = $2',
        [pedidoId, 'OCUPADO']
      );

      if (slotOcupadoResult.rows.length === 0) {
        throw new Error('Slot não encontrado para este pedido');
      }

      const slotId = slotOcupadoResult.rows[0].id;

      const updateResult = await pool.query(
        `UPDATE slots_expedicao 
         SET status = $1, pedido_id = NULL, data_liberacao = $2 
         WHERE id = $3 
         RETURNING *`,
        ['LIVRE', new Date(), slotId]
      );

      return updateResult.rows[0];
    } catch (error) {
      throw new Error(`Erro ao liberar slot: ${error.message}`);
    }
  }

  async getSlotsDisponiveis() {
    try {
      const result = await pool.query(
        'SELECT COUNT(*) as total_livres FROM slots_expedicao WHERE status = $1',
        ['LIVRE']
      );
      return parseInt(result.rows[0].total_livres);
    } catch (error) {
      throw new Error(`Erro ao buscar slots disponíveis: ${error.message}`);
    }
  }
}

export default new SlotExpedicaoService();