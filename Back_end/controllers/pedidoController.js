// controllers/pedidoController.js - VERSÃO SIMPLIFICADA COM DADOS REAIS

import pool from '../config/database.js';
import queueMiddlewareService from '../services/queueMiddlewareService.js';

// Função auxiliar para garantir que 'undefined' seja convertido para 'null'
const safeValue = (val) => val === undefined ? null : val;

// ============================================
// 1. VERIFICAÇÃO DE ESTOQUE REAL (COM SIMULAÇÃO)
// ============================================
async function verificarEstoqueReal(produtos) {
    console.log('🔍 VERIFICAÇÃO DE ESTOQUE REAL COM QUEUE SMART');
    console.log('Produtos a verificar:', produtos);

    const SIMULATION_MODE = true; 
    const SIMULATED_QUANTITY = 100;
    
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
                estoqueQueue = await queueMiddlewareService.verificarEstoqueQueueSmart(produto.cor);
            }
            
            console.log(`  Queue Smart:`, estoqueQueue);
            
            const temEstoque = estoqueQueue.disponivel && estoqueQueue.quantidade >= produto.quantidade;
            
            if (!temEstoque) {
                throw new Error(
                    `Estoque insuficiente para ${produto.cor}. ` +
                    `Disponível: ${estoqueQueue.quantidade || 0}, ` +
                    `Solicitado: ${produto.quantidade}`
                );
            }
            
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
            
            throw error;
        }
    }
    
    console.log('\n✅ VERIFICAÇÃO COMPLETA:', verificacoes);
    return { verificacoes, produtosComEstoque };
}

// ============================================
// 2. CRIAR PEDIDO COM INTEGRAÇÃO COMPLETA
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
                "cliente_id", 
                "status_geral",         
                "metodo_pagamento", 
                "observacoes", 
                "valor_total",
                "endereco_entrega",
                "data_criacao",         
                "status_producao",
                "sneaker_configs" 
            ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7, $8) 
            RETURNING "id", "codigo_rastreio"`,
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
        const codigoRastreio = pedidoResult.rows[0].codigo_rastreio || `SNK${pedidoId.toString().padStart(6, '0')}`;
        
        console.log(`✅ Pedido criado: ID ${pedidoId}, Rastreio: ${codigoRastreio}`);
        
        // INSERIR PRODUTOS DO PEDIDO
        for (let i = 0; i < produtosComEstoque.length; i++) {
            const produto = produtosComEstoque[i];
            const sneakerConfig = sneaker_configs[i] || {};
            const configQueueSmart = configs_queue_smart[i] || {};
            
            console.log(`📦 Inserindo produto ${i + 1} com configuração:`, sneakerConfig);
            
            await client.query(
                `INSERT INTO produtos_do_pedido (
                    "pedido_id", 
                    "cor", 
                    "tamanho", 
                    "quantidade", 
                    "valor_unitario",
                    "middleware_id",
                    "estoque_pos",
                    "passo_um",
                    "passo_dois",
                    "passo_tres",
                    "passo_quatro",
                    "passo_cinco",
                    "sneaker_config",
                    "config_queue_smart"
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
        
        // ENVIAR PARA PRODUÇÃO NO QUEUE SMART
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
                        "middleware_id" = $1,
                        "integracao_completa" = $2 
                    WHERE "id" = $3`,
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
        
        // GERAR MENSAGEM PERSONALIZADA (opcional)
        try {
            const mensagemService = await import('../services/mensagemService.js');
            const mensagem = await mensagemService.default.gerarMensagemPedido(pedidoId, cliente_id);
            
            await client.query(
                'UPDATE pedidos SET "mensagem_personalizada" = $1 WHERE "id" = $2',
                [mensagem, pedidoId]
            );
            
        } catch (msgError) {
            console.log('ℹ️ Mensagem personalizada não gerada:', msgError.message);
        }
        
        // RESPOSTA AO FRONTEND
        res.status(201).json({
            success: true,
            message: 'Pedido criado com sucesso!',
            pedido: {
                id: pedidoId,
                codigo_rastreio: codigoRastreio,
                cliente_id,
                status_geral: 'pendente',
                status_producao: 'aguardando_producao',
                data_criacao: new Date().toISOString(),
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
// 3. VERIFICAR ESTOQUE POR COR
// ============================================
const verificarEstoqueCor = async (req, res) => {
    const { cor } = req.params;

    const SIMULATION_MODE = true; 
    const SIMULATED_QUANTITY = 100;
    
    try {
        console.log(`🔍 Verificando estoque para cor: ${cor}`);
        
        let estoqueQueue;

        if (SIMULATION_MODE) {
            console.log(`⚠️ MODO DE SIMULAÇÃO ATIVO. Estoque forçado para: ${SIMULATED_QUANTITY}`);
            estoqueQueue = {
                disponivel: true, 
                quantidade: SIMULATED_QUANTITY,
                middleware_id: `SIM_MID_${cor}_${Math.random().toString(36).substring(7)}`,
                estoque_pos: 'SIM-POS-1',
                fonte: 'simulacao'
            };
        } else {
            estoqueQueue = await queueMiddlewareService.verificarEstoqueQueueSmart(cor);
        }
        
        const client = await pool.connect();
        const localResult = await client.query(
            'SELECT "quantidade", "em_producao", "estoque_pos" FROM estoque_maquina WHERE "cor" = $1',
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
                ? `Estoque disponível: ${estoqueQueue.quantidade} unidades (Simulado)`
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
// 4. FUNÇÃO GET CLIENT ORDERS - APENAS DADOS REAIS
// ============================================
const getClientOrders = async (req, res) => {
    const { clienteId } = req.params;
    
    console.log(`📋 BUSCANDO PEDIDOS PARA CLIENTE ${clienteId}`);
    
    const client = await pool.connect();
    
    try {
        console.log('🔍 Executando query de pedidos...');
        
        // BUSCAR TODOS OS DADOS DOS PEDIDOS
        const pedidosResult = await client.query(
            `SELECT 
                p."id",
                p."cliente_id",
                p."status_geral",
                p."status_producao",
                p."valor_total",
                p."codigo_rastreio",
                p."metodo_pagamento",
                p."endereco_entrega",
                p."observacoes",
                p."middleware_id",
                p."estoque_pos",
                p."integracao_completa",
                p."sneaker_configs",
                p."mensagem_personalizada",
                p."data_criacao",
                p."data_inicio_producao",
                p."data_conclusao_producao"
            FROM pedidos p
            WHERE p."cliente_id" = $1
            ORDER BY p."data_criacao" DESC`,
            [clienteId]
        );
        
        console.log(`✅ ${pedidosResult.rows.length} pedidos encontrados`);
        
        const pedidosCompletos = [];
        
        for (const pedido of pedidosResult.rows) {
            console.log(`🛒 Processando pedido ${pedido.id}...`);
            
            // 1. CONTAR PRODUTOS E SOMAR QUANTIDADES
            const countResult = await client.query(
                `SELECT 
                    COUNT(*) as total_produtos,
                    SUM("quantidade") as quantidade_total
                FROM produtos_do_pedido 
                WHERE "pedido_id" = $1`,
                [pedido.id]
            );
            
            const totalProdutos = parseInt(countResult.rows[0].total_produtos) || 0;
            const quantidadeTotal = parseInt(countResult.rows[0].quantidade_total) || totalProdutos;
            
            // 2. BUSCAR DETALHES DOS PRODUTOS
            const produtosResult = await client.query(
                `SELECT 
                    "cor",
                    "tamanho",
                    "quantidade",
                    "valor_unitario",
                    "passo_um",
                    "passo_dois",
                    "passo_tres",
                    "passo_quatro",
                    "passo_cinco"
                FROM produtos_do_pedido 
                WHERE "pedido_id" = $1
                ORDER BY "id"`,
                [pedido.id]
            );
            
            const produtos = produtosResult.rows.map(produto => ({
                cor: produto.cor,
                tamanho: produto.tamanho,
                quantidade: produto.quantidade,
                valor_unitario: produto.valor_unitario,
                configuracoes: {
                    estilo: produto.passo_um,
                    material: produto.passo_dois,
                    solado: produto.passo_tres,
                    cor: produto.passo_quatro,
                    detalhes: produto.passo_cinco
                }
            }));
            
            // 3. PARSEAR DADOS JSON DO PEDIDO
            let enderecoEntrega = {};
            let sneakerConfigs = [];
            
            try {
                if (pedido.endereco_entrega && typeof pedido.endereco_entrega === 'string') {
                    enderecoEntrega = JSON.parse(pedido.endereco_entrega);
                }
                
                if (pedido.sneaker_configs && typeof pedido.sneaker_configs === 'string') {
                    sneakerConfigs = JSON.parse(pedido.sneaker_configs);
                }
            } catch (error) {
                console.warn(`⚠️ Erro ao parsear JSON do pedido ${pedido.id}:`, error.message);
            }
            
            // 4. GERAR CÓDIGOS DE RASTREIO
            const codigosRastreio = [];
            if (pedido.codigo_rastreio) {
                codigosRastreio.push(pedido.codigo_rastreio);
            }
            if (pedido.middleware_id) {
                codigosRastreio.push(pedido.middleware_id);
            }
            
            // 5. CRIAR OBJETO COMPLETO DO PEDIDO
            pedidosCompletos.push({
                id: pedido.id,
                pedido_id: pedido.id,
                cliente_id: pedido.cliente_id,
                status_geral: pedido.status_geral || 'pendente',
                status_producao: pedido.status_producao || 'aguardando_producao',
                valor_total: parseFloat(pedido.valor_total) || 0,
                codigo_rastreio: pedido.codigo_rastreio || '',
                codigos_rastreio: codigosRastreio,
                metodo_pagamento: pedido.metodo_pagamento || 'cartao',
                endereco_entrega: enderecoEntrega,
                observacoes: pedido.observacoes || '',
                middleware_id: pedido.middleware_id,
                estoque_pos: pedido.estoque_pos,
                integracao_completa: pedido.integracao_completa || false,
                sneaker_configs: sneakerConfigs,
                mensagem_personalizada: pedido.mensagem_personalizada,
                data_criacao: pedido.data_criacao,
                data_inicio_producao: pedido.data_inicio_producao,
                data_conclusao_producao: pedido.data_conclusao_producao,
                total_produtos: totalProdutos,
                quantidade_total: quantidadeTotal,
                produtos: produtos
            });
        }
        
        client.release();
        
        console.log(`🎉 Retornando ${pedidosCompletos.length} pedidos`);
        
        res.json({
            success: true,
            count: pedidosCompletos.length,
            pedidos: pedidosCompletos
        });
        
    } catch (error) {
        console.error('❌ ERRO em getClientOrders:', error.message);
        console.error('Stack:', error.stack);
        
        try {
            client.release();
        } catch (e) {
            console.log('⚠️ Não foi possível liberar conexão');
        }
        
        res.status(500).json({
            success: false,
            error: `Erro ao buscar pedidos: ${error.message}`,
            timestamp: new Date().toISOString()
        });
    }
};

// ============================================
// 5. FUNÇÃO GET ORDER BY TRACKING CODE
// ============================================
const getOrderByTrackingCode = async (req, res) => {
    const { codigoRastreio } = req.params;
    
    try {
        const client = await pool.connect();
        
        const result = await client.query(
            `SELECT 
                "id",
                "cliente_id",
                "status_geral",
                "status_producao",
                "valor_total",
                "codigo_rastreio",
                "metodo_pagamento",
                "endereco_entrega",
                "observacoes",
                "data_criacao"
            FROM pedidos 
            WHERE "codigo_rastreio" = $1`,
            [codigoRastreio]
        );
        
        client.release();
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Pedido não encontrado'
            });
        }
        
        const pedido = result.rows[0];
        
        let enderecoEntrega = {};
        try {
            if (pedido.endereco_entrega && typeof pedido.endereco_entrega === 'string') {
                enderecoEntrega = JSON.parse(pedido.endereco_entrega);
            }
        } catch (error) {
            console.warn(`⚠️ Erro ao parsear endereço:`, error.message);
        }
        
        res.json({
            success: true,
            pedido: {
                ...pedido,
                endereco_entrega: enderecoEntrega
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
// 6. FUNÇÃO ATUALIZAR STATUS PEDIDO (Mantida para uso interno)
// ============================================
const atualizarStatusPedido = async (pedidoId, status, dadosProducao = {}) => {
    try {
        const client = await pool.connect();
        
        let query = 'UPDATE pedidos SET "status_producao" = $1';
        const values = [status, pedidoId];
        
        if (status === 'em_producao') {
            query += ', "data_inicio_producao" = NOW()';
        } else if (status === 'concluido') {
            query += ', "data_conclusao_producao" = NOW(), "status_geral" = $' + (values.length + 1);
            values.push('em_transporte');
        } else if (status === 'cancelado') {
            query += ', "status_geral" = $' + (values.length + 1);
            values.push('cancelado');
        }
        
        if (dadosProducao.middleware_id) {
            query += ', "middleware_id" = $' + (values.length + 1);
            values.push(dadosProducao.middleware_id);
        }
        
        query += ' WHERE "id" = $2 RETURNING *';
        
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
// EXPORTS (SEM FUNÇÕES DE DEMONSTRAÇÃO)
// ============================================
export { 
    createOrder, 
    getClientOrders, 
    getOrderByTrackingCode, 
    verificarEstoqueCor, 
    atualizarStatusPedido
};