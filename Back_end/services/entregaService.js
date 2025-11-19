// services/entregaService.js - ATUALIZADO
import pool from '../config/database.js';
import slotExpedicaoService from './slotExpedicaoService.js';
import estoqueService from './estoqueService.js';

class EntregaService {
  async confirmarEntrega(pedidoId) {
    try {
      console.log(`🚚 Confirmando entrega do pedido ${pedidoId}`);

      // 1. Buscar produtos do pedido para atualizar estoque
      console.log(`📦 Buscando produtos do pedido ${pedidoId} para atualizar estoque...`);
      const produtosResult = await pool.query(
        `SELECT 
          id, passo_um, passo_dois, passo_tres, passo_quatro, passo_cinco,
          status_producao
         FROM produtos_do_pedido 
         WHERE pedido_id = $1`,
        [pedidoId]
      );

      const produtos = produtosResult.rows;
      console.log(`📋 Encontrados ${produtos.length} produtos no pedido`);

      // 2. Atualizar estoque para CADA produto (repor os itens usados)
      let estoqueAtualizado = false;
      for (const produto of produtos) {
        try {
          console.log(`🔄 Repondo estoque para produto ${produto.id}...`);
          
          // Criar objeto de configuração igual ao usado na baixa
          const produtoConfig = {
            passoUmDeCinco: produto.passo_um,
            passoDoisDeCinco: produto.passo_dois,
            passoTresDeCinco: produto.passo_tres,
            passoQuatroDeCinco: produto.passo_quatro,
            passoCincoDeCinco: produto.passo_cinco
          };

          // 🎯 CHAMAR FUNÇÃO PARA REPOR ESTOQUE
          await estoqueService.reporEstoquePedido(produtoConfig);
          console.log(`✅ Estoque reposto para produto ${produto.id}`);
          estoqueAtualizado = true;
          
        } catch (estoqueError) {
          console.error(`❌ Erro ao repor estoque para produto ${produto.id}:`, estoqueError);
          // Continua com outros produtos mesmo se um falhar
        }
      }

      // 3. Liberar slot de expedição
      let slotLiberado = null;
      try {
        slotLiberado = await slotExpedicaoService.liberarSlot(pedidoId);
        console.log(`✅ Slot liberado para pedido ${pedidoId}`);
      } catch (slotError) {
        console.log(`⚠️ Não foi possível liberar slot: ${slotError.message}`);
      }

      // 4. Atualizar status do pedido para ENTREGUE
      await pool.query(
        'UPDATE pedidos SET status_geral = $1 WHERE id = $2',
        ['ENTREGUE', pedidoId]
      );

      console.log(`✅ Entrega confirmada - Pedido: ${pedidoId}`);

      return {
        success: true,
        message: estoqueAtualizado 
          ? 'Entrega confirmada, estoque atualizado e slot liberado' 
          : 'Entrega confirmada (estoque não atualizado)',
        pedidoId: pedidoId,
        estoqueAtualizado: estoqueAtualizado,
        slotLiberado: !!slotLiberado
      };
    } catch (error) {
      console.error(`❌ Erro ao confirmar entrega: ${error.message}`);
      throw new Error(`Erro ao confirmar entrega: ${error.message}`);
    }
  }
}

export default new EntregaService();