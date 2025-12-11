import pool from '../config/database.js';
import queueMiddlewareService from '../services/queueMiddlewareService.js';

// Função auxiliar para garantir que 'undefined' seja convertido para 'null', 
// prevenindo erros de sintaxe SQL (a correção solicitada).
const safeValue = (val) => val === undefined ? null : val;

// ============================================
// 1. VERIFICAÇÃO DE ESTOQUE REAL (COM SIMULAÇÃO)
// ============================================
async function verificarEstoqueReal(produtos) {
  console.log('🔍 VERIFICAÇÃO DE ESTOQUE REAL COM QUEUE SMART');
  console.log('Produtos a verificar:', produtos);

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
// 2. CRIAR PEDIDO COM INTEGRAÇÃO COMPLETA (createOrder)
// ============================================
const createOrder = async (req, res) => {
  console.log('\n🚀 ===== NOVO PEDIDO RECEBIDO =====');
  console.log('Dados recebidos:', JSON.stringify(req.body, null, 2));
  
  const {
    cliente_id,
    produtos,
    endereco_entrega,
    metodo_pagamento = 'cartao',
    observacoes = '',
    valor_total,
    // 🎯 NOVOS CAMPOS PARA CONFIGURAÇÃO COMPLETA
    configs_queue_smart = [],
    sneaker_configs = []
  } = req.body;
  
  // Validar dados obrigatórios
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
    // O `produtos` do corpo da requisição é usado aqui (com as cores)
    const { verificacoes, produtosComEstoque } = await verificarEstoqueReal(produtos);
    
    console.log('\n📝 2. CRIANDO PEDIDO NO BANCO...');
    
    // Criar pedido
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
    
    // Inserir produtos do pedido COM CONFIGURAÇÃO COMPLETA
    for (let i = 0; i < produtosComEstoque.length; i++) {
      const produto = produtosComEstoque[i];
      // Note: O frontend envia as configs no formato {passo_um: '...', passo_dois: '...'}
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
          // 🎯 CAMPOS DE CONFIGURAÇÃO COMPLETA
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
          
          // 🎯 CORREÇÃO DE SYNTAX ERROR: Aplica safeValue
          safeValue(produto.middleware_id),
          safeValue(produto.estoque_pos),
          
          // 🎯 CONFIGURAÇÃO COMPLETA: Aplica safeValue
          safeValue(produto.passo_um || sneakerConfig.estilo), 
          safeValue(produto.passo_dois || sneakerConfig.material), 
          safeValue(produto.passo_tres || sneakerConfig.solado), 
          safeValue(produto.passo_quatro || sneakerConfig.cor), // Cor capitalizada do FE
          safeValue(produto.passo_cinco || sneakerConfig.detalhes), 
          
          sneakerConfig ? JSON.stringify(sneakerConfig) : null,
          configQueueSmart ? JSON.stringify(configQueueSmart) : null
        ]
      );
    }
    
    console.log('\n🏭 3. ENVIANDO PARA PRODUÇÃO NO QUEUE SMART...');
    
    // Criar ordem de produção no Queue Smart COM CONFIGURAÇÃO COMPLETA
    try {
      let ordemProducao;
      
      if (configs_queue_smart.length > 0) {
        console.log('🎯 Enviando configuração completa para Queue Smart');
        
        // Para cada produto, enviar configuração completa
        const ordens = [];
        for (let i = 0; i < produtosComEstoque.length; i++) {
          const config = configs_queue_smart[i];
          if (config) {
            const ordem = await queueMiddlewareService.criarOrdemProducaoCompleta(
              pedidoId,
              config,
              i // índice do produto
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
        // Fallback para método antigo (apenas cor)
        console.log('⚠️ Usando método antigo (apenas cor)');
        ordemProducao = await queueMiddlewareService.criarOrdemProducao(
          pedidoId,
          produtosComEstoque
        );
      }
      
      if (ordemProducao.success) {
        // Atualizar pedido com dados do middleware
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
        // Continua mesmo sem ordem de produção
      }
      
    } catch (producaoError) {
      console.warn('⚠️ Erro ao criar ordem de produção:', producaoError.message);
      // Não falha o pedido se a produção falhar
    }
    
    await client.query('COMMIT');
    
    console.log('\n🎉 PEDIDO CRIADO COM SUCESSO!');
    
    // Gerar mensagem personalizada (opcional)
    try {
      // Importar dinamicamente para evitar circular dependency se houver
      const { default: mensagemService } = await import('../services/mensagemService.js');
      const mensagem = await mensagemService.gerarMensagemPedido(pedidoId, cliente_id);
      
      // Salvar mensagem no pedido
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
    
    // Detectar tipo de erro
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
// 3. VERIFICAR ESTOQUE POR COR (ENDPOINT FRONTAL) - COM SIMULAÇÃO
// ============================================
const verificarEstoqueCor = async (req, res) => {
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
        // Chamar o serviço Queue Smart (sem simulação)
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
// 4. EXPORTS
// ============================================
export default {
    createOrder,
    verificarEstoqueCor,
    verificarEstoqueReal
};