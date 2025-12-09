// services/queueMiddlewareService.js - VERSÃO SIMPLIFICADA E FUNCIONAL
import fetch from 'node-fetch';

// URLs
const MIDDLEWARE_URL = 'http://52.72.137.244:3000';
const CALLBACK_URL = 'https://sneakerslab-backend.onrender.com/api/callback';

class QueueMiddlewareService {
  
  // Gerar payload simples para Queue Smart
  generateQueuePayload(orderDetails, pedidoId, produtoDbId) {
    // ID único
    const orderId = `SNK-${pedidoId}-${produtoDbId}`;
    
    // Cor (obrigatória) - converter para minúsculas
    const cor = (orderDetails.passoQuatroDeCinco || 'branco').toLowerCase();
    
    // SKU baseado no estilo
    const estilo = orderDetails.passoUmDeCinco || 'casual';
    const sku = `SNK-${estilo.toUpperCase()}`;

    return {
      payload: {
        orderId: orderId,
        sku: sku,
        cor: cor
      },
      callbackUrl: CALLBACK_URL,
      estoquePos: null  // Busca automática por cor
    };
  }

  // Enviar para Queue Smart
  async enviarParaQueueSmart(payload) {
    try {
      console.log(`🚀 Enviando para Queue Smart: ${MIDDLEWARE_URL}/queue/items`);
      
      const response = await fetch(`${MIDDLEWARE_URL}/queue/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Queue Smart error ${response.status}: ${error}`);
      }

      const data = await response.json();
      console.log(`✅ Queue Smart ID: ${data.id || data._id}`);
      
      return {
        id: data.id || data._id,
        success: true
      };
      
    } catch (error) {
      console.error('❌ Erro Queue Smart:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Verificar status
  async verificarStatusQueueSmart(middlewareId) {
    try {
      const response = await fetch(`${MIDDLEWARE_URL}/queue/items/${middlewareId}`);
      
      if (!response.ok) {
        throw new Error(`Erro status: ${response.status}`);
      }

      return await response.json();
      
    } catch (error) {
      console.error('❌ Erro verificar status:', error.message);
      throw error;
    }
  }

  // Verificar estoque por cor
  async verificarEstoqueQueueSmart(cor) {
    try {
      const corFormatada = cor.toLowerCase();
      const response = await fetch(`${MIDDLEWARE_URL}/estoque?color=${corFormatada}`);
      
      if (!response.ok) {
        throw new Error(`Erro estoque: ${response.status}`);
      }

      const data = await response.json();
      return {
        cor: cor,
        disponivel: data.length > 0,
        quantidade: data.length
      };
      
    } catch (error) {
      console.error('❌ Erro verificar estoque:', error.message);
      throw error;
    }
  }

  // Teste rápido de conexão
  async testarConexao() {
    try {
      const response = await fetch(`${MIDDLEWARE_URL}/health`);
      const data = await response.json();
      
      return {
        success: true,
        status: data.status,
        message: 'Queue Smart conectado'
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Exportar instância
export default new QueueMiddlewareService();