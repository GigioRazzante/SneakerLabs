// services/queueMiddlewareService.js - VERSÃO COMPLETA COM INTEGRAÇÃO 100%
const MIDDLEWARE_URL = process.env.MIDDLEWARE_URL || 'http://52.72.137.244:3000';
const BACKEND_URL = process.env.BACKEND_URL || 'https://sneakerslab-backend.onrender.com';

class QueueMiddlewareService {
  
  constructor() {
    console.log('🎯 Queue Middleware Service inicializado');
    console.log(`🔗 URL: ${MIDDLEWARE_URL}`);
    console.log(`🔄 Callback: ${BACKEND_URL}/api/callback`);
  }
  
  // ============================================
  // FUNÇÕES AUXILIARES DE TRADUÇÃO (Mapeamento para Queue Smart)
  // ============================================
  traduzirEstilo(estilo) {
    const traducoes = {
      'Casual': 'CASUAL',
      'Corrida': 'RUNNING', 
      'Skate': 'SKATE',
    };
    return traducoes[estilo] || 'CASUAL';
  }

  traduzirMaterial(material) {
    const traducoes = {
      'Couro': 'LEATHER',
      'Camurça': 'SUEDE',
      'Tecido': 'TEXTILE',
    };
    return traducoes[material] || 'LEATHER';
  }

  traduzirSolado(solado) {
    const traducoes = {
      'Borracha': 'RUBBER_SOLE',
      'EVA': 'EVA_SOLE',
      'Air': 'AIR_SOLE',
    };
    return traducoes[solado] || 'RUBBER_SOLE';
  }

  traduzirCor(cor) {
    // Garante que a cor comece com letra maiúscula para o mapeamento
    const corCapitalizada = cor ? cor.charAt(0).toUpperCase() + cor.slice(1).toLowerCase() : 'Branco';
    const traducoes = {
      'Branco': 'WHITE',
      'Preto': 'BLACK',
      'Azul': 'BLUE',
      'Vermelho': 'RED',
      'Verde': 'GREEN',
      'Amarelo': 'YELLOW',
    };
    return traducoes[corCapitalizada] || 'WHITE';
  }
  
  traduzirCadarco(detalhes) {
    const traducoes = {
      'Cadarço normal': 'STANDARD_LACES',
      'Cadarço colorido': 'COLORED_LACES',
      'Sem cadarço': 'NO_LACES'
    };
    return traducoes[detalhes] || 'STANDARD_LACES';
  }

  // ============================================
  // 1. VERIFICAR ESTOQUE REAL (por cor)
  // Endpoint conforme Queue Smart API: GET /estoque?color={color}
  // ============================================
  async verificarEstoqueQueueSmart(cor) {
    try {
      const corTraduzida = this.traduzirCor(cor);
      console.log(`📦 Verificando estoque no middleware para cor: ${corTraduzida}`);
      
      // Corrigido para o endpoint oficial do Queue Smart: /estoque?color=...
      const response = await fetch(`${MIDDLEWARE_URL}/estoque?color=${corTraduzida}`);
      if (!response.ok) {
        throw new Error(`Falha ao buscar estoque: ${response.status}`);
      }
      
      const data = await response.json(); // Retorna um array de posições disponíveis
      const quantidade = data.length; // Número de peças disponíveis com aquela cor
      const disponivel = quantidade > 0;
      
      console.log(`✅ Estoque ${corTraduzida}:`, { disponivel, quantidade, posicoes: data.map(d => d.pos) });
      
      return {
        disponivel: disponivel,
        quantidade: quantidade,
        em_producao: 0, 
        estoque_pos: disponivel ? data[0].pos : null, // Posição da primeira peça disponível
        middleware_id: disponivel ? data[0].pos : null,
        fonte: 'queue_smart_v4'
      };
      
    } catch (error) {
      console.error(`❌ Erro ao verificar estoque ${cor}:`, error.message);
      
      // Fallback simulado
      return { disponivel: false, quantidade: 0, fonte: 'erro_queue_smart' };
    }
  }
  
  // ============================================
  // 2. CRIAR ORDEM DE PRODUÇÃO (MÉTODO ANTIGO - APENAS COR)
  // Mantido, mas não utiliza o Queue Smart 4.0 API (chama endpoint antigo/customizado)
  // ============================================
  async criarOrdemProducao(pedidoId, produtos) {
    try {
      console.log(`🏭 Criando ordem de produção para pedido ${pedidoId} (método antigo)`);
      
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
      console.log(`✅ Ordem criada (antiga):`, data);
      
      return {
        success: true,
        ordem_id: data.ordem_id,
        middleware_id: data.middleware_id,
        estimativa_conclusao: data.estimativa_conclusao
      };
      
    } catch (error) {
      console.error('❌ Erro ao criar ordem de produção (antiga):', error.message);
      return { success: false, error: error.message };
    }
  }
  
  // ============================================
  // 3. 🎯 CRIAR ORDEM DE PRODUÇÃO COMPLETA (NOVO!)
  // Endpoint conforme Queue Smart API: POST /queue/items
  // ============================================
  async criarOrdemProducaoCompleta(pedidoId, configSneaker, produtoIndex = 0) {
    try {
      console.log(`🏭 Criando ordem de produção COMPLETA para Queue Smart`);
      
      // 🎯 FORMATO QUE O QUEUE SMART 4.0 ESPERA
      const payload = {
        orderId: `SNK-${pedidoId}-${produtoIndex}-${Date.now()}`,
        sku: "SNK-01",
        // Configurações do Sneaker
        style: configSneaker.style || this.traduzirEstilo(configSneaker.estilo),
        material: configSneaker.material || this.traduzirMaterial(configSneaker.material),
        color: configSneaker.color || this.traduzirCor(configSneaker.cor), // Importante para busca automática de peça
        sole: configSneaker.sole || this.traduzirSolado(configSneaker.solado),
        laces: configSneaker.laces || this.traduzirCadarco(configSneaker.detalhes),
        size: configSneaker.size || 42,
        // Informações adicionais
        customerId: pedidoId.toString(),
        priority: 'NORMAL',
        productionLine: 'LINE_01',
        estimatedTime: '5-7 dias',
        notes: 'Pedido criado via SneakerLabs'
      };
      
      console.log('📤 Payload final para Queue Smart:', payload);
      
      // Monta o corpo da requisição que o middleware espera (Removido 'simulated' para compliance)
      const requestBody = {
        payload: payload,
        callbackUrl: `${BACKEND_URL}/api/callback`,
        // estoquePos: <opcional>
      };
      
      const response = await fetch(`${MIDDLEWARE_URL}/queue/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        console.log('✅ Resposta da Ordem COMPLETA:', data);
        return {
            success: true,
            // A API retorna o ID do item da fila
            ordem_id: data.id, 
            middleware_id: data.id,
            estimativa_conclusao: payload.estimatedTime
        };
      } else if (response.status === 409) {
          console.error(`❌ Conflito (409) - Sem peça disponível para a cor: ${payload.color}`, data);
          return { success: false, error: data.error || 'Conflito: Peça indisponível no estoque.', isConflict: true };
      } else {
        console.error(`❌ Erro do Queue Smart: ${response.status}`, data);
        throw new Error(`Queue Smart error (${response.status}): ${data.error || 'Falha desconhecida'}`);
      }
      
    } catch (error) {
      console.error('❌ Erro ao enviar ordem COMPLETA para Queue Smart:', error);
      
      return { 
        success: false, 
        error: error.message, 
        fallback: 'Ordem simulada' 
      };
    }
  }
  
  // ============================================
  // 4. 🎯 TESTAR CONEXÃO (NOVO!)
  // Endpoint conforme Queue Smart API: GET /health
  // ============================================
  async testarConexao() {
    try {
      console.log(`🔗 Testando conexão com Middleware: ${MIDDLEWARE_URL}`);
      
      const response = await fetch(`${MIDDLEWARE_URL}/health`, {
        timeout: 5000
      });
      
      const data = await response.json();
      
      return {
        success: true,
        status: data.status.toUpperCase(),
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
        timestamp: new Date().toISOString(),
        note: 'Falha ao conectar ao Middleware. Usando modo simulado para desenvolvimento'
      };
    }
  }
  
  // ============================================
  // 5. 🎯 VERIFICAR ESTOQUE COMPLETO (NOVO!)
  // Endpoint conforme Queue Smart API: GET /estoque
  // ============================================
  async verificarEstoqueCompleto() {
    try {
      console.log(`📊 Verificando estoque completo no Queue Smart`);
      
      const response = await fetch(`${MIDDLEWARE_URL}/estoque`); // Endpoint /estoque retorna todas as posições
      if (!response.ok) {
        throw new Error(`Falha: ${response.status}`);
      }
      
      const data = await response.json(); // Data é um array de Estoque
      
      const totalPosicoes = data.length;
      // Uma posição está 'disponível' se o campo 'op' (ID da Ordem de Produção) for nulo/ausente.
      const posicoesDisponiveis = data.filter(item => !item.op).length; 
      
      return {
        success: true,
        totalPosicoes: totalPosicoes,
        posicoesDisponiveis: posicoesDisponiveis,
        estoqueDetalhado: data, 
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('❌ Erro ao verificar estoque completo:', error.message);
      return { 
        success: false, 
        error: 'Falha ao conectar para buscar estoque completo.', 
        details: error.message
      };
    }
  }
  
  // ============================================
  // 6. 🎯 VERIFICAR STATUS DE PRODUÇÃO (NOVO!)
  // Endpoint conforme Queue Smart API: GET /queue/items/{id}
  // ============================================
  async verificarStatusProducao(itemId) {
    try {
      console.log(`⏱️ Verificando status do item ${itemId} no Queue Smart`);
      
      // Corrigido para o endpoint que retorna os detalhes completos do item
      const response = await fetch(`${MIDDLEWARE_URL}/queue/items/${itemId}`); 
      
      if (!response.ok) {
        if (response.status === 404) {
          return { 
            success: true,
            itemId: itemId,
            status: 'NAO_ENCONTRADO', 
            message: 'ID do item não encontrado na fila de processamento. Pode estar concluído.'
          };
        }
        throw new Error(`Falha: ${response.status}`);
      }
      
      const data = await response.json(); // Schema QueueItem
      
      return {
        success: true,
        itemId: itemId,
        status: data.status, // PENDING, PROCESSING, COMPLETED, FAILED
        stage: data.stage, // NA_FILA, MONTAGEM, EMBALAGEM, EXPEDICAO
        progress: data.progress,
        historico: data.history || [],
        dados_producao: data
      };
      
    } catch (error) {
      console.error(`❌ Erro ao verificar status de produção ${itemId}:`, error.message);
      
      return { 
        success: false, 
        itemId: itemId,
        status: 'ERRO_DE_CONEXÃO', 
        error: error.message 
      };
    }
  }
}

export default new QueueMiddlewareService();