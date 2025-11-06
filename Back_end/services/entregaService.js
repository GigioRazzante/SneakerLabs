import pool from '../config/database.js';
import slotExpedicaoService from './slotExpedicaoService.js';

class EntregaService {
  async confirmarEntrega(pedidoId) {
    try {
      console.log(`🚚 Confirmando entrega do pedido ${pedidoId}`);

      const pedidoResult = await pool.query(
        'SELECT status_geral FROM pedidos WHERE id = $1',
        [pedidoId]
      );

      if (pedidoResult.rows.length === 0) {
        throw new Error('Pedido não encontrado');
      }

      if (pedidoResult.rows[0].status_geral !== 'CONCLUIDO') {
        throw new Error('Pedido não está concluído para entrega');
      }

      const slotLiberado = await slotExpedicaoService.liberarSlot(pedidoId);
      
      await pool.query(
        'UPDATE pedidos SET status_geral = $1 WHERE id = $2',
        ['ENTREGUE', pedidoId]
      );

      console.log(`✅ Entrega confirmada - Pedido: ${pedidoId}, Slot liberado: ${slotLiberado.id}`);

      return {
        success: true,
        message: 'Entrega confirmada e slot liberado',
        pedidoId: pedidoId,
        slotLiberado: slotLiberado
      };
    } catch (error) {
      console.error(`❌ Erro ao confirmar entrega: ${error.message}`);
      throw new Error(`Erro ao confirmar entrega: ${error.message}`);
    }
  }
}

export default new EntregaService();