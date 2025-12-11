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
  // ============================================
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
        middleware_id: data.id || data._id,
        fonte: 'queue_smart'
      };
      
    } catch (error) {
      console.error(`❌ Erro ao verificar estoque ${cor}:`, error.message);
      
      // Fallback para banco local (se houver)
      return { disponivel: false, quantidade: 0, fonte: 'erro_queue_smart' };
      // Se quiser manter o fallback para o banco local, você precisará reintroduzir a função `verificarEstoqueLocal(cor)`
    }
  }
  
  // ============================================
  // 2. CRIAR ORDEM DE PRODUÇÃO (MÉTODO ANTIGO - APENAS COR)
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
  // ============================================
  async criarOrdemProducaoCompleta(pedidoId, configSneaker, produtoIndex = 0) {
    try {
      console.log(`🏭 Criando ordem de produção COMPLETA para Queue Smart`);
      console.log('Configuração recebida:', configSneaker);
      
      // 🎯 FORMATO QUE O QUEUE SMART 4.0 ESPERA
      const payload = {
        orderId: `SNK-${pedidoId}-${produtoIndex}-${Date.now()}`,
        sku: "SNK-01",
        // 🎯 TODAS AS CONFIGURAÇÕES DO SNEAKER (Usando as funções de tradução como fallback)
        style: configSneaker.style || this.traduzirEstilo(configSneaker.estilo),
        material: configSneaker.material || this.traduzirMaterial(configSneaker.material),
        color: configSneaker.color || this.traduzirCor(configSneaker.cor),
        sole: configSneaker.sole || this.traduzirSolado(configSneaker.solado),
        laces: configSneaker.laces || this.traduzirCadarco(configSneaker.detalhes),
        size: configSneaker.size || 42,
        // Informações adicionais para produção
        customerId: pedidoId.toString(),
        priority: 'NORMAL',
        productionLine: 'LINE_01',
        estimatedTime: '5-7 dias',
        notes: 'Pedido criado via SneakerLabs'
      };
      
      console.log('📤 Payload final para Queue Smart:', payload);
      
      // Monta o corpo da requisição que o middleware espera
      const requestBody = {
        payload: payload,
        callbackUrl: `${BACKEND_URL}/api/callback`,
        simulated: process.env.NODE_ENV !== 'production' // Modo simulado em dev
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
            ordem_id: data.itemId || data.id,
            middleware_id: data.itemId || data.id,
            estimativa_conclusao: data.estimatedTime || '5-7 dias'
        };
      } else {
        console.error(`❌ Erro do Queue Smart: ${response.status}`, data);
        throw new Error(`Queue Smart error (${response.status}): ${data.error || 'Falha desconhecida'}`);
      }
      
    } catch (error) {
      console.error('❌ Erro ao enviar ordem COMPLETA para Queue Smart:', error);
      
      // Fallback simulado (apenas para evitar falha total)
      return { 
        success: false, 
        error: error.message, 
        fallback: 'Ordem simulada' 
      };
    }
  }
}

export default new QueueMiddlewareService();