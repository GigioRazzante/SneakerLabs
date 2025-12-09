// services/queueMiddlewareService.js - VERSÃO DEFINITIVA
const MIDDLEWARE_URL = process.env.MIDDLEWARE_URL || 'http://52.72.137.244:3000';

class QueueMiddlewareService {
  
  // 1. VERIFICAR ESTOQUE REAL no Queue Smart
  async verificarEstoqueQueueSmart(cor) {
    try {
      console.log(`📦 Verificando estoque no middleware para cor: ${cor}`);
      
      const response = await fetch(`${MIDDLEWARE_URL}/api/estoque/${cor}`);
      if (!response.ok) {
        throw new Error(`Falha ao buscar estoque: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`✅ Estoque ${cor}:`, data);
      
      return {
        disponivel: data.disponivel || (data.quantidade > 0),
        quantidade: data.quantidade || 0,
        em_producao: data.em_producao || 0,
        estoque_pos: data.estoque_pos || 0,
        middleware_id: data.id || data._id
      };
      
    } catch (error) {
      console.error(`❌ Erro ao verificar estoque ${cor}:`, error.message);
      
      // Fallback para banco local
      return await this.verificarEstoqueLocal(cor);
    }
  }
  
  // 2. Fallback para banco local
  async verificarEstoqueLocal(cor) {
    try {
      const client = await pool.connect();
      const result = await client.query(
        'SELECT * FROM estoque_maquina WHERE cor = $1',
        [cor]
      );
      client.release();
      
      if (result.rows.length > 0) {
        const item = result.rows[0];
        return {
          disponivel: item.quantidade > 0,
          quantidade: item.quantidade,
          em_producao: item.em_producao || 0,
          estoque_pos: item.estoque_pos || 0,
          fonte: 'banco_local_fallback'
        };
      }
      
      return { disponivel: false, quantidade: 0, fonte: 'nao_encontrado' };
      
    } catch (error) {
      console.error('❌ Erro no fallback:', error.message);
      return { disponivel: false, quantidade: 0, fonte: 'erro' };
    }
  }
  
  // 3. CRIAR ORDEM DE PRODUÇÃO no Queue Smart
  async criarOrdemProducao(pedidoId, produtos) {
    try {
      console.log(`🏭 Criando ordem de produção para pedido ${pedidoId}`);
      
      const ordemProducao = {
        pedido_id: pedidoId,
        produtos: produtos.map(p => ({
          cor: p.cor,
          quantidade: p.quantidade,
          tamanho: p.tamanho || 42
        })),
        timestamp: new Date().toISOString()
      };
      
      const response = await fetch(`${MIDDLEWARE_URL}/api/producao/criar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ordemProducao)
      });
      
      if (!response.ok) {
        throw new Error(`Falha ao criar ordem: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`✅ Ordem criada:`, data);
      
      return {
        success: true,
        ordem_id: data.ordem_id,
        middleware_id: data.middleware_id,
        estimativa_conclusao: data.estimativa_conclusao
      };
      
    } catch (error) {
      console.error('❌ Erro ao criar ordem de produção:', error.message);
      return { success: false, error: error.message };
    }
  }
  
  // 4. TESTAR CONEXÃO
  async testarConexao() {
    try {
      console.log(`🔗 Testando conexão com: ${MIDDLEWARE_URL}`);
      
      const response = await fetch(`${MIDDLEWARE_URL}/health`, {
        timeout: 5000
      });
      
      const data = await response.json();
      
      return {
        success: true,
        status: 'CONECTADO',
        url: MIDDLEWARE_URL,
        response: data,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      return {
        success: false,
        status: 'OFFLINE',
        url: MIDDLEWARE_URL,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

export default new QueueMiddlewareService();