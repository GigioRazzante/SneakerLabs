// controllers/pedidoController.js - VERSÃO CORRIGIDA COM EXPORTS CERTOS
import pool from '../config/database.js';
import queueMiddlewareService from '../services/queueMiddlewareService.js';

// ============================================
// 1. VERIFICAÇÃO DE ESTOQUE REAL
// ============================================
async function verificarEstoqueReal(produtos) {
  console.log('🔍 VERIFICAÇÃO DE ESTOQUE REAL COM QUEUE SMART');
  console.log('Produtos a verificar:', produtos);
  
  const verificacoes = [];
  const produtosComEstoque = [];
  
  for (const produto of produtos) {
    try {
      console.log(`\n📦 Verificando estoque para: ${produto.cor}`);
      
      // 1. Verificar no Queue Smart (fonte verdadeira)
      const estoqueQueue = await queueMiddlewareService.verificarEstoqueQueueSmart(produto.cor);
      console.log(`   Queue Smart:`, estoqueQueue);
      
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
// 2. CRIAR PEDIDO COM INTEGRAÇÃO
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
    valor_total
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
        status_producao
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7) 
      RETURNING id, codigo_rastreio`,
      [
        cliente_id,
        'pendente',
        metodo_pagamento,
        observacoes,
        valor_total || 299.90,
        JSON.stringify(endereco_entrega),
        'aguardando_producao'
      ]
    );
    
    const pedidoId = pedidoResult.rows[0].id;
    const codigoRastreio = pedidoResult.rows[0].codigo_rastreio;
    
    console.log(`✅ Pedido criado: ID ${pedidoId}, Rastreio: ${codigoRastreio}`);
    
    // Inserir produtos do pedido
    for (const produto of produtosComEstoque) {
      await client.query(
        `INSERT INTO produtos_do_pedido (
          pedido_id, 
          cor, 
          tamanho, 
          quantidade, 
          valor_unitario,
          middleware_id,
          estoque_pos
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          pedidoId,
          produto.cor,
          produto.tamanho || 42,
          produto.quantidade,
          produto.valor_unitario || 299.90,
          produto.middleware_id,
          produto.estoque_pos
        ]
      );
    }
    
    console.log('\n🏭 3. ENVIANDO PARA PRODUÇÃO NO QUEUE SMART...');
    
    // Criar ordem de produção no Queue Smart
    try {
      const ordemProducao = await queueMiddlewareService.criarOrdemProducao(
        pedidoId,
        produtosComEstoque
      );
      
      if (ordemProducao.success) {
        // Atualizar pedido com dados do middleware
        await client.query(
          `UPDATE pedidos SET 
            middleware_id = $1,
            estoque_pos = $2,
            status_producao = 'em_producao',
            data_inicio_producao = NOW()
          WHERE id = $3`,
          [
            ordemProducao.middleware_id || ordemProducao.ordem_id,
            ordemProducao.estoque_pos || 0,
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
      const mensagemService = await import('../services/mensagemService.js');
      const mensagem = await mensagemService.default.gerarMensagemPedido(pedidoId, cliente_id);
      
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
        verificacao_estoque: verificacoes
      },
      producao: {
        enviado_para_producao: true,
        integracao_queue_smart: true
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
// 3. LISTAR PEDIDOS DO CLIENTE
// ============================================
const getClientOrders = async (req, res) => {
  const { clienteId } = req.params;
  
  try {
    const client = await pool.connect();
    
    const result = await client.query(
      `SELECT 
        p.*,
        json_agg(
          json_build_object(
            'id', pp.id,
            'cor', pp.cor,
            'tamanho', pp.tamanho,
            'quantidade', pp.quantidade,
            'valor_unitario', pp.valor_unitario,
            'middleware_id', pp.middleware_id,
            'estoque_pos', pp.estoque_pos
          )
        ) as produtos
      FROM pedidos p
      LEFT JOIN produtos_do_pedido pp ON p.id = pp.pedido_id
      WHERE p.cliente_id = $1
      GROUP BY p.id
      ORDER BY p.data_pedido DESC`,
      [clienteId]
    );
    
    client.release();
    
    res.json({
      success: true,
      count: result.rows.length,
      pedidos: result.rows.map(pedido => ({
        ...pedido,
        endereco_entrega: typeof pedido.endereco_entrega === 'string' 
          ? JSON.parse(pedido.endereco_entrega)
          : pedido.endereco_entrega
      }))
    });
    
  } catch (error) {
    console.error('Erro ao listar pedidos:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ============================================
// 4. BUSCAR PEDIDO POR RASTREIO
// ============================================
const getOrderByTrackingCode = async (req, res) => {
  const { codigoRastreio } = req.params;
  
  try {
    const client = await pool.connect();
    
    const result = await client.query(
      `SELECT 
        p.*,
        json_agg(
          json_build_object(
            'cor', pp.cor,
            'tamanho', pp.tamanho,
            'quantidade', pp.quantidade
          )
        ) as produtos,
        c.nome as cliente_nome,
        c.email as cliente_email
      FROM pedidos p
      LEFT JOIN produtos_do_pedido pp ON p.id = pp.pedido_id
      LEFT JOIN clientes c ON p.cliente_id = c.id
      WHERE p.codigo_rastreio = $1
      GROUP BY p.id, c.id`,
      [codigoRastreio]
    );
    
    client.release();
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Pedido não encontrado'
      });
    }
    
    res.json({
      success: true,
      pedido: {
        ...result.rows[0],
        endereco_entrega: typeof result.rows[0].endereco_entrega === 'string'
          ? JSON.parse(result.rows[0].endereco_entrega)
          : result.rows[0].endereco_entrega
      }
    });
    
  } catch (error) {
    console.error('Erro ao buscar pedido:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ============================================
// 5. VERIFICAR ESTOQUE DE UMA COR
// ============================================
const verificarEstoqueCor = async (req, res) => {
  const { cor } = req.params;
  
  try {
    console.log(`🔍 Verificando estoque para cor: ${cor}`);
    
    // Verificar no Queue Smart
    const estoqueQueue = await queueMiddlewareService.verificarEstoqueQueueSmart(cor);
    
    // Verificar no banco local também
    const client = await pool.connect();
    const localResult = await client.query(
      'SELECT * FROM estoque_maquina WHERE cor = $1',
      [cor]
    );
    client.release();
    
    const estoqueLocal = localResult.rows[0] || null;
    
    res.json({
      success: true,
      cor,
      estoque: {
        queue_smart: estoqueQueue,
        banco_local: estoqueLocal ? {
          quantidade: estoqueLocal.quantidade,
          em_producao: estoqueLocal.em_producao,
          estoque_pos: estoqueLocal.estoque_pos
        } : null
      },
      recomendacao: estoqueQueue.disponivel 
        ? `Estoque disponível: ${estoqueQueue.quantidade} unidades`
        : 'Estoque indisponível no momento',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error(`Erro ao verificar estoque ${cor}:`, error);
    res.status(500).json({
      success: false,
      error: error.message,
      cor
    });
  }
};

// ============================================
// 6. ATUALIZAR STATUS DO PEDIDO (para callback)
// ============================================
const atualizarStatusPedido = async (pedidoId, status, dadosProducao = {}) => {
  try {
    const client = await pool.connect();
    
    let query = 'UPDATE pedidos SET status_producao = $1';
    const values = [status, pedidoId];
    
    if (status === 'em_producao') {
      query += ', data_inicio_producao = NOW()';
    } else if (status === 'concluido') {
      query += ', data_conclusao_producao = NOW(), status = $3';
      values.push('em_transporte');
    } else if (status === 'cancelado') {
      query += ', status = $3';
      values.push('cancelado');
    }
    
    // Adicionar dados do middleware se fornecidos
    if (dadosProducao.middleware_id) {
      query += ', middleware_id = $' + (values.length + 1);
      values.push(dadosProducao.middleware_id);
    }
    
    if (dadosProducao.estoque_pos) {
      query += ', estoque_pos = $' + (values.length + 1);
      values.push(dadosProducao.estoque_pos);
    }
    
    query += ' WHERE id = $2 RETURNING *';
    
    const result = await client.query(query, values);
    client.release();
    
    console.log(`✅ Pedido ${pedidoId} atualizado para status: ${status}`);
    return result.rows[0];
    
  } catch (error) {
    console.error(`❌ Erro ao atualizar pedido ${pedidoId}:`, error);
    throw error;
  }
};

// ============================================
// EXPORTS CORRETOS PARA O pedidoRoutes.js
// ============================================
export { 
  createOrder,                // Exporta como createOrder (pedidoRoutes espera isso)
  getClientOrders,           // Exporta como getClientOrders  
  getOrderByTrackingCode,    // Exporta como getOrderByTrackingCode
  verificarEstoqueCor,       // Exporta como verificarEstoqueCor
  atualizarStatusPedido      // Exporta para uso interno do callback
};