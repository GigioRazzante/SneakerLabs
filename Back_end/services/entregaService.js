// services/entregaService.js - ATUALIZADO
import pool from '../config/database.js';
import slotExpedicaoService from './slotExpedicaoService.js';

class EntregaService {
  async confirmarEntrega(pedidoId) {
    try {
      console.log(`🚚 Confirmando entrega do pedido ${pedidoId}`);

      // Tenta liberar slot, mas não falha se não encontrar
      let slotLiberado = null;
      try {
        slotLiberado = await slotExpedicaoService.liberarSlot(pedidoId);
        console.log(`✅ Slot liberado para pedido ${pedidoId}`);
      } catch (slotError) {
        console.log(`⚠️ Não foi possível liberar slot: ${slotError.message}`);
        // Continua o processo mesmo sem liberar slot
      }

      // Atualiza status do pedido para ENTREGUE
      await pool.query(
        'UPDATE pedidos SET status_geral = $1 WHERE id = $2',
        ['ENTREGUE', pedidoId]
      );

      console.log(`✅ Entrega confirmada - Pedido: ${pedidoId}`);

      return {
        success: true,
        message: slotLiberado 
          ? 'Entrega confirmada e slot liberado' 
          : 'Entrega confirmada (slot não estava alocado)',
        pedidoId: pedidoId
      };
    } catch (error) {
      console.error(`❌ Erro ao confirmar entrega: ${error.message}`);
      throw new Error(`Erro ao confirmar entrega: ${error.message}`);
    }
  }
}

export default new EntregaService();