import pool from '../config/database.js';
import queueMiddlewareService from '../services/queueMiddlewareService.js';

// Função auxiliar para garantir que 'undefined' seja convertido para 'null', 
// prevenindo erros de sintaxe SQL.
const safeValue = (val) => val === undefined ? null : val;

// ============================================
// 1. VERIFICAÇÃO DE ESTOQUE REAL
// ============================================
export async function verificarEstoqueReal(produtos) {
  console.log('🔍 VERIFICAÇÃO DE ESTOQUE REAL COM QUEUE SMART');
  // ... (restante da implementação de verificarEstoqueReal)
  
  // 🎯 INÍCIO DO BLOCO DE SIMULAÇÃO DE ESTOQUE
  const SIMULATION_MODE = true; 
  const SIMULATED_QUANTITY = 100;
  // 🎯 FIM DO BLOCO DE SIMULAÇÃO DE ESTOQUE
  
  const verificacoes = [];
  const produtosComEstoque = [];
  
  for (const produto of produtos) {
    try {
      console.log(`\n📦 Verificando estoque para: ${produto.cor}`);
      
      let estoqueQueue;

      if (SIMULATION_MODE) {
        console.log(`⚠️ MODO DE SIMULAÇÃO ATIVO. Estoque forçado para: ${SIMULATED_QUANTITY}`);
        estoqueQueue = {
          disponivel: true,
          quantidade: SIMULATED_QUANTITY,
          middleware_id: `SIM_MID_${produto.cor}_${Math.random().toString(36).substring(7)}`,
          estoque_pos: 'SIM-POS-1',
          fonte: 'simulacao'
        };
      } else {
        // 1. Verificar no Queue Smart (fonte verdadeira)
        estoqueQueue = await queueMiddlewareService.verificarEstoqueQueueSmart(produto.cor);
      }
      
      console.log(`   Queue Smart:`, estoqueQueue);
      
      // 2. Validar quantidade
      const temEstoque = estoqueQueue.disponivel && estoqueQueue.quantidade >= produto.quantidade;
      
      if (!temEstoque) {
        throw new Error(
          `Estoque insuficiente para ${produto.cor}. ` +
          `Disponível: ${estoqueQueue.quantidade || 0}, ` +
          `Solicitado: ${produto.quantidade}`
        );
      }
      
      // 3. Adicionar informações do middleware
      const produtoComEstoque = {
        ...produto,
        middleware_id: estoqueQueue.middleware_id,
        estoque_pos: estoqueQueue.estoque_pos,
        quantidade_disponivel: estoqueQueue.quantidade,
        fonte_estoque: estoqueQueue.fonte || 'queue_smart'
      };
      
      produtosComEstoque.push(produtoComEstoque);
      
      verificacoes.push({
        cor: produto.cor,
        status: 'DISPONÍVEL',
        quantidade_solicitada: produto.quantidade,
        quantidade_disponivel: estoqueQueue.quantidade,
        middleware_id: estoqueQueue.middleware_id,
        estoque_pos: estoqueQueue.estoque_pos,
        fonte: estoqueQueue.fonte || 'queue_smart'
      });
      
    } catch (error) {
      console.error(`❌ Erro no produto ${produto.cor}:`, error.message);
      
      verificacoes.push({
        cor: produto.cor,
        status: 'INSUFICIENTE',
        quantidade_solicitada: produto.quantidade,
        quantidade_disponivel: 0,
        erro: error.message,
        fonte: 'queue_smart_error'
      });
      
      throw error; // Propaga o erro
    }
  }
  
  console.log('\n✅ VERIFICAÇÃO COMPLETA:', verificacoes);
  return { verificacoes, produtosComEstoque };
}

// ============================================
// 2. CRIAR PEDIDO COM INTEGRAÇÃO COMPLETA
// ============================================
export const createOrder = async (req, res) => {
  console.log('\n🚀 ===== NOVO PEDIDO RECEBIDO =====');
  // ... (restante da implementação de createOrder)
  
  console.log('Dados recebidos:', JSON.stringify(req.body, null, 2));
  
  const {
    cliente_id,
    produtos,
    endereco_entrega,
    metodo_pagamento = 'cartao',
    observacoes = '',
    valor_total,
    configs_queue_smart = [],
    sneaker_configs = []
  } = req.body;
  
  if (!cliente_id || !produtos || !endereco_entrega) {
    return res.status(400).json({
      success: false,
      error: 'Dados incompletos. cliente_id, produtos e endereco_entrega são obrigatórios'
    });
  }
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('\n🔍 1. VERIFICANDO ESTOQUE REAL...');
    const { verificacoes, produtosComEstoque } = await verificarEstoqueReal(produtos);
    
    console.log('\n📝 2. CRIANDO PEDIDO NO BANCO...');
    
    const pedidoResult = await client.query(
      `INSERT INTO pedidos (
        cliente_id, 
        status, 
        metodo_pagamento, 
        observacoes, 
        valor_total,
        endereco_entrega,
        data_pedido,
        status_producao,
        sneaker_configs 
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7, $8) 
      RETURNING id, codigo_rastreio`,
      [
        cliente_id,
        'pendente',
        metodo_pagamento,
        observacoes,
        valor_total || 0,
        JSON.stringify(endereco_entrega),
        'aguardando_producao',
        sneaker_configs.length > 0 ? JSON.stringify(sneaker_configs) : null
      ]
    );
    
    const pedidoId = pedidoResult.rows[0].id;
    const codigoRastreio = pedidoResult.rows[0].codigo_rastreio;
    
    console.log(`✅ Pedido criado: ID ${pedidoId}, Rastreio: ${codigoRastreio}`);
    
    for (let i = 0; i < produtosComEstoque.length; i++) {
      const produto = produtosComEstoque[i];
      const sneakerConfig = sneaker_configs[i] || {}; 
      const configQueueSmart = configs_queue_smart[i] || {};
      
      console.log(`📦 Inserindo produto ${i + 1} com configuração:`, sneakerConfig);
      
      await client.query(
        `INSERT INTO produtos_do_pedido (
          pedido_id, 
          cor, 
          tamanho, 
          quantidade, 
          valor_unitario,
          middleware_id,
          estoque_pos,
          passo_um,
          passo_dois,
          passo_tres,
          passo_quatro,
          passo_cinco,
          sneaker_config,
          config_queue_smart
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [
          pedidoId,
          produto.cor,
          produto.tamanho || 42,
          produto.quantidade,
          produto.valor_unitario || 0,
          safeValue(produto.middleware_id),
          safeValue(produto.estoque_pos),
          safeValue(produto.passo_um || sneakerConfig.estilo), 
          safeValue(produto.passo_dois || sneakerConfig.material), 
          safeValue(produto.passo_tres || sneakerConfig.solado), 
          safeValue(produto.passo_quatro || sneakerConfig.cor), 
          safeValue(produto.passo_cinco || sneakerConfig.detalhes), 
          sneakerConfig ? JSON.stringify(sneakerConfig) : null,
          configQueueSmart ? JSON.stringify(configQueueSmart) : null
        ]
      );
    }
    
    console.log('\n🏭 3. ENVIANDO PARA PRODUÇÃO NO QUEUE SMART...');
    
    try {
      let ordemProducao;
      
      if (configs_queue_smart.length > 0) {
        console.log('🎯 Enviando configuração completa para Queue Smart');
        
        const ordens = [];
        for (let i = 0; i < produtosComEstoque.length; i++) {
          const config = configs_queue_smart[i];
          if (config) {
            const ordem = await queueMiddlewareService.criarOrdemProducaoCompleta(
              pedidoId,
              config,
              i 
            );
            ordens.push(ordem);
          }
        }
        
        ordemProducao = {
          success: true,
          ordens: ordens,
          message: 'Ordens criadas com configuração completa'
        };
        
      } else {
        console.log('⚠️ Usando método antigo (apenas cor)');
        ordemProducao = await queueMiddlewareService.criarOrdemProducao(
          pedidoId,
          produtosComEstoque
        );
      }
      
      if (ordemProducao.success) {
        await client.query(
          `UPDATE pedidos SET 
            middleware_id = $1,
            status_producao = 'em_producao',
            data_inicio_producao = NOW(),
            integracao_completa = $2 
          WHERE id = $3`,
          [
            ordemProducao.middleware_id || ordemProducao.ordens?.[0]?.middleware_id,
            configs_queue_smart.length > 0, 
            pedidoId
          ]
        );
        
        console.log(`✅ Ordem de produção criada:`, ordemProducao);
      } else {
        console.warn('⚠️ Não foi possível criar ordem de produção:', ordemProducao.error);
      }
      
    } catch (producaoError) {
      console.warn('⚠️ Erro ao criar ordem de produção:', producaoError.message);
    }
    
    await client.query('COMMIT');
    
    console.log('\n🎉 PEDIDO CRIADO COM SUCESSO!');
    
    // Geração de mensagem personalizada (opcional)
    try {
      const { default: mensagemService } = await import('../services/mensagemService.js');
      const mensagem = await mensagemService.gerarMensagemPedido(pedidoId, cliente_id);
      
      await client.query(
        'UPDATE pedidos SET mensagem_personalizada = $1 WHERE id = $2',
        [mensagem, pedidoId]
      );
      
    } catch (msgError) {
      console.log('ℹ️ Mensagem personalizada não gerada:', msgError.message);
    }
    
    res.status(201).json({
      success: true,
      message: 'Pedido criado com sucesso!',
      pedido: {
        id: pedidoId,
        codigo_rastreio: codigoRastreio,
        cliente_id,
        status: 'pendente',
        status_producao: 'em_producao',
        data_pedido: new Date().toISOString(),
        verificacao_estoque: verificacoes,
        integracao_completa: configs_queue_smart.length > 0
      },
      producao: {
        enviado_para_producao: true,
        integracao_queue_smart: true,
        configuracao_completa: configs_queue_smart.length > 0
      }
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    
    console.error('\n❌ ERRO AO CRIAR PEDIDO:', error.message);
    console.error('Stack:', error.stack);
    
    const isEstoqueError = error.message.includes('Estoque insuficiente');
    
    res.status(isEstoqueError ? 409 : 500).json({
      success: false,
      error: error.message,
      detalhes: isEstoqueError ? {
        tipo: 'estoque_insuficiente',
        produtos: produtos.map(p => ({
          cor: p.cor,
          quantidade_solicitada: p.quantidade
        }))
      } : undefined,
      timestamp: new Date().toISOString()
    });
    
  } finally {
    client.release();
    console.log('\n===== FIM DO PROCESSAMENTO DO PEDIDO =====\n');
  }
};

// ============================================
// 3. VERIFICAR ESTOQUE POR COR (ENDPOINT FRONTAL)
// ============================================
export const verificarEstoqueCor = async (req, res) => {
  const { cor } = req.params;

  // 🎯 INÍCIO DO BLOCO DE SIMULAÇÃO DE ESTOQUE
  const SIMULATION_MODE = true; 
  const SIMULATED_QUANTITY = 100;
  // 🎯 FIM DO BLOCO DE SIMULAÇÃO DE ESTOQUE
  
  try {
    console.log(`🔍 Verificando estoque para cor: ${cor}`);
    
    let estoqueQueue;

    if (SIMULATION_MODE) {
        console.log(`⚠️ MODO DE SIMULAÇÃO ATIVO (verificarEstoqueCor).`);
        estoqueQueue = {
            disponivel: true,
            quantidade: SIMULATED_QUANTITY,
            mensagem: `Simulação: ${SIMULATED_QUANTITY} unidades disponíveis`,
            fonte: 'simulacao'
        };
    } else {
        estoqueQueue = await queueMiddlewareService.verificarEstoqueQueueSmart(cor);
    }

    const { disponivel, quantidade, mensagem } = estoqueQueue;

    res.status(200).json({
        success: true,
        cor,
        estoque: {
            queue_smart: {
                disponivel: disponivel || false,
                quantidade: quantidade || 0,
                mensagem: mensagem || ''
            }
        },
        timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error(`❌ Erro ao verificar estoque para cor ${cor}:`, error.message);
    res.status(500).json({
        success: false,
        error: `Falha ao conectar ou verificar estoque: ${error.message}`,
        estoque: {
            queue_smart: {
                disponivel: false,
                quantidade: 0,
                mensagem: 'Erro de conexão ou servidor'
            }
        },
        timestamp: new Date().toISOString()
    });
  }
};

// ============================================
// 4. OBTER PEDIDOS DO CLIENTE (SOLUÇÃO PARA O ERRO ATUAL)
// Exportação nomeada para ser importada em pedidoRoutes.js
// ============================================
export const getClientOrders = async (req, res) => {
  const { cliente_id } = req.params; // Assume que o ID do cliente vem como parâmetro de rota

  if (!cliente_id) {
    return res.status(400).json({
      success: false,
      error: 'ID do cliente é obrigatório na rota.'
    });
  }

  try {
    console.log(`\n🔎 Buscando pedidos para o cliente ID: ${cliente_id}`);
    
    // Consulta SQL para buscar os pedidos do cliente, ordenados pelo mais recente
    const result = await pool.query(
      'SELECT id, codigo_rastreio, status, valor_total, data_pedido, status_producao, endereco_entrega, observacoes, metodo_pagamento FROM pedidos WHERE cliente_id = $1 ORDER BY data_pedido DESC',
      [cliente_id]
    );

    console.log(`✅ Encontrados ${result.rows.length} pedidos.`);

    res.status(200).json({
      success: true,
      cliente_id,
      pedidos: result.rows
    });

  } catch (error) {
    console.error(`❌ Erro ao buscar pedidos para cliente ${cliente_id}:`, error.message);
    res.status(500).json({
      success: false,
      error: 'Falha ao buscar pedidos no banco de dados.',
      detalhes: error.message
    });
  }
};

// ============================================
// 5. EXPORTS: Todas as funções agora são exportadas nominalmente
// ============================================
// Não é necessário um bloco de exportação final