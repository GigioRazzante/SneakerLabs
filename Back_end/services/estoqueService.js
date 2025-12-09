// services/estoqueService.js - VERSÃO ADAPTADA PARA QUEUE SMART 4.0
import pool from '../config/database.js';
import queueMiddlewareService from './queueMiddlewareService.js';

class EstoqueService {
  
  // Listar nosso estoque virtual (para frontend)
  async listarEstoque() {
    const result = await pool.query('SELECT * FROM estoque_maquina ORDER BY categoria, nome_produto');
    return result.rows;
  }

  // 🎯 FUNÇÃO ATUALIZADA: Verificar estoque REAL no Queue Smart
  async verificarEstoqueQueueSmart(produtoConfig) {
    try {
      const { passoQuatroDeCinco } = produtoConfig; // COR é essencial
      
      if (!passoQuatroDeCinco) {
        console.warn('⚠️ Nenhuma cor especificada');
        return { disponivel: false, motivo: 'Cor não especificada' };
      }
      
      console.log(`[ESTOQUE] Verificando estoque real para cor: ${passoQuatroDeCinco}`);
      
      // Verificar no Queue Smart se tem peça disponível com essa cor
      const estoqueInfo = await queueMiddlewareService.verificarEstoqueQueueSmart(passoQuatroDeCinco);
      
      if (!estoqueInfo.disponivel) {
        console.log(`❌ Sem estoque real para cor ${passoQuatroDeCinco}`);
        return { 
          disponivel: false, 
          motivo: `Não há peças disponíveis na cor ${passoQuatroDeCinco}`,
          detalhes: estoqueInfo
        };
      }
      
      console.log(`✅ Estoque disponível: ${estoqueInfo.quantidade} peça(s) na cor ${passoQuatroDeCinco}`);
      return {
        disponivel: true,
        quantidade: estoqueInfo.quantidade,
        posicoes: estoqueInfo.posicoes,
        detalhes: estoqueInfo
      };
      
    } catch (error) {
      console.error('[ESTOQUE] Erro ao verificar estoque real:', error);
      return {
        disponivel: false,
        motivo: 'Erro ao verificar estoque',
        erro: error.message
      };
    }
  }

  // 🎯 FUNÇÃO SIMPLIFICADA: Baixar estoque VIRTUAL (apenas para registro interno)
  async baixarEstoquePedido(produtoConfig) {
    try {
      const { passoUmDeCinco, passoQuatroDeCinco } = produtoConfig;
      
      console.log(`[ESTOQUE VIRTUAL] Registrando baixa: ${passoUmDeCinco} ${passoQuatroDeCinco}`);
      
      // Apenas registra no log, não baixa realmente
      // Pois o estoque REAL é gerenciado pelo Queue Smart
      
      await pool.query(
        `INSERT INTO estoque_log (produto, cor, acao, quantidade, data)
         VALUES ($1, $2, $3, $4, NOW())`,
        [passoUmDeCinco, passoQuatroDeCinco, 'BAIXA_VIRTUAL', 1]
      );
      
      console.log(`[ESTOQUE VIRTUAL] Baixa registrada no log`);
      return true;
      
    } catch (error) {
      console.error('[ESTOQUE] Erro ao registrar baixa virtual:', error);
      // Não falha o pedido por erro no estoque virtual
      return true;
    }
  }

  // 🎯 FUNÇÃO: Repor estoque quando entrega confirmada
  async reporEstoquePedido(produtoConfig) {
    try {
      const { passoUmDeCinco, passoQuatroDeCinco } = produtoConfig;
      
      console.log(`[ESTOQUE VIRTUAL] Registrando reposição: ${passoUmDeCinco} ${passoQuatroDeCinco}`);
      
      // Apenas registra no log
      await pool.query(
        `INSERT INTO estoque_log (produto, cor, acao, quantidade, data)
         VALUES ($1, $2, $3, $4, NOW())`,
        [passoUmDeCinco, passoQuatroDeCinco, 'REPOSICAO_VIRTUAL', 1]
      );
      
      console.log(`[ESTOQUE VIRTUAL] Reposição registrada no log`);
      return true;
      
    } catch (error) {
      console.error('[ESTOQUE] Erro ao registrar reposição:', error);
      return true;
    }
  }

  // 🎯 NOVA: Verificar se podemos enviar pedido baseado no estoque REAL
  async podeEnviarParaQueueSmart(produtoConfig) {
    try {
      // 1. Verificar estoque real no Queue Smart
      const estoqueReal = await this.verificarEstoqueQueueSmart(produtoConfig);
      
      if (!estoqueReal.disponivel) {
        return {
          podeEnviar: false,
          motivo: estoqueReal.motivo,
          estoqueInfo: estoqueReal
        };
      }
      
      // 2. Verificar nosso estoque virtual (opcional)
      const estoqueVirtual = await this.verificarEstoqueVirtual(produtoConfig);
      
      if (!estoqueVirtual.disponivel) {
        console.warn('⚠️ Estoque virtual baixo, mas estoque real disponível');
        // Ainda permite enviar pois o REAL é o que importa
      }
      
      return {
        podeEnviar: true,
        estoqueReal: estoqueReal,
        estoqueVirtual: estoqueVirtual,
        mensagem: 'Estoque disponível para produção'
      };
      
    } catch (error) {
      console.error('[ESTOQUE] Erro ao verificar disponibilidade:', error);
      return {
        podeEnviar: false,
        motivo: 'Erro ao verificar estoque',
        erro: error.message
      };
    }
  }

  // Verificar estoque virtual (para compatibilidade)
  async verificarEstoqueVirtual(produtoConfig) {
    // Implementação simplificada - sempre retorna disponível
    // Pois o estoque REAL é o importante
    return {
      disponivel: true,
      mensagem: 'Estoque virtual OK (estoque real é o determinante)'
    };
  }

  // 🎯 FUNÇÃO: Sincronizar estoque com Queue Smart (para dashboard)
  async sincronizarEstoqueQueueSmart() {
    try {
      console.log('[ESTOQUE] Sincronizando com Queue Smart...');
      
      const estoqueCompleto = await queueMiddlewareService.verificarEstoqueCompleto();
      
      // Salvar snapshot no nosso banco
      await pool.query(
        `INSERT INTO estoque_snapshot (dados, total_posicoes, posicoes_disponiveis, timestamp)
         VALUES ($1, $2, $3, NOW())`,
        [JSON.stringify(estoqueCompleto), estoqueCompleto.totalPosicoes, estoqueCompleto.posicoesDisponiveis]
      );
      
      console.log(`[ESTOQUE] Snapshot salvo: ${estoqueCompleto.totalPosicoes} posições`);
      
      return {
        success: true,
        snapshot: estoqueCompleto,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('[ESTOQUE] Erro ao sincronizar:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default new EstoqueService();