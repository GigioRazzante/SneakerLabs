// controllers/pedidoController.js - VERSÃO COMPLETA COM ESTOQUE REAL
import pool from '../config/database.js';
import queueMiddlewareService from '../services/queueMiddlewareService.js';
import estoqueService from '../services/estoqueService.js';
import slotExpedicaoService from '../services/slotExpedicaoService.js';

// Configuração
const CONFIG = {
    USAR_MIDDLEWARE_REAL: true,
    VERIFICAR_ESTOQUE_REAL: true, // NOVO: Verificar estoque real no Queue Smart
    BAIXAR_ESTOQUE_VIRTUAL: false, // MODIFICADO: Não baixar estoque virtual
    ALOCAR_SLOT: true
};

// 🎯 FUNÇÃO PRINCIPAL - Criar pedido com verificação de estoque REAL
const createOrder = async (req, res) => {
    const { clienteId, produtos } = req.body;

    console.log('\n=== 📦 INICIANDO PROCESSAMENTO DO PEDIDO ===');
    console.log(`🎯 Modo: ${CONFIG.USAR_MIDDLEWARE_REAL ? 'QUEUE SMART 4.0' : 'SIMULAÇÃO'}`);

    // Validações
    if (!clienteId || !produtos?.length) {
        return res.status(400).json({ 
            success: false,
            error: "Dados incompletos" 
        });
    }

    try {
        // 1. Verificar cliente
        const cliente = await pool.query('SELECT id, nome_usuario FROM clientes WHERE id = $1', [clienteId]);
        if (cliente.rows.length === 0) {
            return res.status(404).json({ 
                success: false,
                error: "Cliente não encontrado" 
            });
        }

        const nomeCliente = cliente.rows[0].nome_usuario;
        console.log(`👤 Cliente: ${nomeCliente} (ID: ${clienteId})`);
        console.log(`📦 Produtos: ${produtos.length} item(s)`);

        // 2. VERIFICAÇÃO DE ESTOQUE ANTES DE CRIAR PEDIDO
        if (CONFIG.VERIFICAR_ESTOQUE_REAL && CONFIG.USAR_MIDDLEWARE_REAL) {
            console.log('🔍 Verificando estoque real no Queue Smart...');
            
            for (const produto of produtos) {
                const config = produto.configuracoes;
                
                // Verificar se tem cor (essencial para Queue Smart)
                if (!config.passoQuatroDeCinco) {
                    return res.status(400).json({
                        success: false,
                        error: "Cor do sneaker não especificada",
                        produto: config
                    });
                }
                
                // Verificar estoque REAL no Queue Smart
                const podeProduzir = await estoqueService.podeEnviarParaQueueSmart(config);
                
                if (!podeProduzir.podeEnviar) {
                    console.log(`❌ Estoque insuficiente: ${podeProduzir.motivo}`);
                    return res.status(409).json({
                        success: false,
                        error: `Estoque insuficiente para produção`,
                        detalhes: {
                            motivo: podeProduzir.motivo,
                            cor: config.passoQuatroDeCinco,
                            estoqueInfo: podeProduzir.estoqueInfo
                        },
                        produto: config
                    });
                }
            }
            
            console.log('✅ Estoque verificado - todos os produtos podem ser produzidos');
        }

        // 3. Criar pedido
        console.log('📝 Criando pedido no banco...');
        const pedidoResult = await pool.query(
            'INSERT INTO pedidos (cliente_id, status_geral) VALUES ($1, $2) RETURNING id',
            [clienteId, 'PENDENTE']
        );
        const pedidoId = pedidoResult.rows[0].id;
        console.log(`✅ Pedido criado: #${pedidoId}`);

        // 4. Alocar slot se configurado
        let slotAlocado = null;
        if (CONFIG.ALOCAR_SLOT) {
            try {
                slotAlocado = await slotExpedicaoService.alocarSlot(pedidoId);
                console.log(`✅ Slot alocado: ${slotAlocado?.id}`);
            } catch (slotError) {
                console.log(`⚠️ Sem slot disponível: ${slotError.message}`);
            }
        }

        const produtosProcessados = [];
        let valorTotal = 0;
        let produtosComErro = 0;

        // 5. Processar cada produto
        console.log('\n🔄 Processando produtos...');
        for (const [index, produto] of produtos.entries()) {
            const config = produto.configuracoes;
            const valor = produto.valor || 0;
            valorTotal += valor;

            console.log(`\n📦 Produto ${index + 1}/${produtos.length}:`);
            console.log(`   Estilo: ${config.passoUmDeCinco}`);
            console.log(`   Cor: ${config.passoQuatroDeCinco}`);
            console.log(`   Valor: R$ ${valor.toFixed(2)}`);

            try {
                // Salvar produto no banco
                const produtoResult = await pool.query(
                    `INSERT INTO produtos_do_pedido (
                        pedido_id, passo_um, passo_dois, passo_tres, passo_quatro, passo_cinco, 
                        status_producao, valor
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
                    [pedidoId, config.passoUmDeCinco, config.passoDoisDeCinco, 
                     config.passoTresDeCinco, config.passoQuatroDeCinco, config.passoCincoDeCinco,
                     'FILA', valor]
                );
                
                const produtoDbId = produtoResult.rows[0].id;
                console.log(`   ✅ Salvo no banco: ID ${produtoDbId}`);

                // Registrar baixa no estoque VIRTUAL (apenas log)
                if (CONFIG.BAIXAR_ESTOQUE_VIRTUAL) {
                    try {
                        await estoqueService.baixarEstoquePedido(config);
                    } catch (estoqueError) {
                        console.log(`   ⚠️ Erro estoque virtual: ${estoqueError.message}`);
                    }
                }

                // Enviar para Queue Smart
                let rastreioId = null;
                let statusProduto = 'FILA';
                let middlewareId = null;

                if (CONFIG.USAR_MIDDLEWARE_REAL) {
                    console.log(`   🚀 Enviando para Queue Smart...`);
                    
                    try {
                        const payload = queueMiddlewareService.generateQueuePayload(
                            config, pedidoId, produtoDbId
                        );
                        
                        console.log(`   📦 Payload:`, {
                            orderId: payload.payload.orderId,
                            cor: payload.payload.cor,
                            sku: payload.payload.sku
                        });
                        
                        const resposta = await queueMiddlewareService.enviarParaQueueSmart(payload);
                        
                        if (resposta.success) {
                            middlewareId = resposta.id;
                            rastreioId = middlewareId;
                            statusProduto = 'ENVIADO_PRODUCAO';
                            
                            await pool.query(
                                `UPDATE produtos_do_pedido 
                                 SET status_producao = $1, 
                                     codigo_rastreio = $2, 
                                     middleware_id = $3,
                                     updated_at = CURRENT_TIMESTAMP
                                 WHERE id = $4`,
                                [statusProduto, rastreioId, middlewareId, produtoDbId]
                            );
                            
                            console.log(`   ✅ Enviado para Queue Smart: ${middlewareId}`);
                        } else {
                            throw new Error(resposta.error || 'Erro desconhecido no Queue Smart');
                        }
                    } catch (error) {
                        console.error(`   ❌ Erro Queue Smart: ${error.message}`);
                        rastreioId = `ERR-${Date.now()}-${produtoDbId}`;
                        statusProduto = 'ERRO_ENVIO';
                        produtosComErro++;
                        
                        await pool.query(
                            `UPDATE produtos_do_pedido 
                             SET status_producao = $1, 
                                 codigo_rastreio = $2,
                                 updated_at = CURRENT_TIMESTAMP
                             WHERE id = $3`,
                            [statusProduto, rastreioId, produtoDbId]
                        );
                    }
                } else {
                    // Modo simulação
                    rastreioId = `SIM-${Date.now()}-${produtoDbId}`;
                    statusProduto = 'SIMULADO';
                    
                    await pool.query(
                        'UPDATE produtos_do_pedido SET status_producao = $1, codigo_rastreio = $2 WHERE id = $3',
                        [statusProduto, rastreioId, produtoDbId]
                    );
                    
                    console.log(`   ✅ Simulado: ${rastreioId}`);
                }

                produtosProcessados.push({ 
                    produtoDbId, 
                    rastreioId,
                    middlewareId,
                    valor,
                    status: statusProduto
                });

            } catch (produtoError) {
                console.error(`   ❌ Erro no produto: ${produtoError.message}`);
                produtosProcessados.push({ 
                    erro: produtoError.message,
                    produtoIndex: index 
                });
                produtosComErro++;
            }
        }

        // 6. Atualizar status final do pedido
        let statusFinal = CONFIG.USAR_MIDDLEWARE_REAL ? 'EM_PRODUCAO' : 'SIMULADO';
        
        if (produtosComErro === produtos.length) {
            statusFinal = 'ERRO_PRODUCAO';
        } else if (produtosComErro > 0) {
            statusFinal = 'PARCIALMENTE_ENVIADO';
        }
        
        await pool.query(
            'UPDATE pedidos SET valor_total = $1, status_geral = $2 WHERE id = $3',
            [valorTotal, statusFinal, pedidoId]
        );

        console.log('\n🎉 PEDIDO PROCESSADO!');
        console.log(`📊 Resumo:`);
        console.log(`   Pedido ID: ${pedidoId}`);
        console.log(`   Status: ${statusFinal}`);
        console.log(`   Valor Total: R$ ${valorTotal.toFixed(2)}`);
        console.log(`   Produtos: ${produtosProcessados.length}`);
        console.log(`   Com erro: ${produtosComErro}`);
        console.log(`   Slot: ${slotAlocado?.id || 'Nenhum'}`);
        console.log('============================================');

        // 7. Resposta
        res.status(200).json({
            success: true,
            message: `Pedido #${pedidoId} ${statusFinal === 'ERRO_PRODUCAO' ? 'com erro' : 'criado com sucesso'}`,
            pedidoId: pedidoId,
            valorTotal: valorTotal,
            status: statusFinal,
            slotAlocado: slotAlocado?.id,
            produtos: produtosProcessados,
            produtosComErro: produtosComErro,
            middlewareAtivo: CONFIG.USAR_MIDDLEWARE_REAL,
            timestamp: new Date().toISOString()
        });

    } catch (err) {
        console.error('\n❌ ERRO CRÍTICO:', err.message);
        console.error('Stack:', err.stack);
        
        res.status(500).json({ 
            success: false,
            error: 'Erro ao processar pedido',
            detalhes: err.message,
            timestamp: new Date().toISOString()
        });
    }
};

// 🎯 FUNÇÃO: Buscar por código de rastreio
const getOrderByTrackingCode = async (req, res) => {
    const { codigoRastreio } = req.params;
    const clienteId = req.headers['x-client-id'] || req.headers['client-id'];

    if (!clienteId) return res.status(401).json({ 
        success: false,
        error: "Cliente não identificado" 
    });

    try {
        console.log(`🔍 Buscando pedido por código: ${codigoRastreio}`);
        
        const produtoResult = await pool.query(
            `SELECT pp.id, pp.pedido_id, pp.status_producao, pp.codigo_rastreio, 
                    pp.middleware_id, pp.etapa_detalhada, pp.progresso_producao, pp.estoque_pos,
                    p.cliente_id, p.status_geral, p.data_criacao, p.valor_total
             FROM produtos_do_pedido pp
             JOIN pedidos p ON pp.pedido_id = p.id
             WHERE pp.codigo_rastreio = $1 OR pp.middleware_id = $1`,
            [codigoRastreio]
        );

        if (produtoResult.rows.length === 0) {
            console.log(`❌ Código não encontrado: ${codigoRastreio}`);
            return res.status(404).json({ 
                success: false,
                error: "Código não encontrado" 
            });
        }
        
        const produto = produtoResult.rows[0];
        
        if (parseInt(produto.cliente_id) !== parseInt(clienteId)) {
            console.log(`🚫 Acesso negado: cliente ${clienteId} tentou acessar pedido do cliente ${produto.cliente_id}`);
            return res.status(403).json({ 
                success: false,
                error: "Acesso negado" 
            });
        }

        // Buscar slot
        const slotResult = await pool.query(
            'SELECT id, status, data_ocupacao FROM slots_expedicao WHERE pedido_id = $1',
            [produto.pedido_id]
        );

        console.log(`✅ Pedido encontrado: ${produto.pedido_id}, Status: ${produto.status_producao}`);

        res.status(200).json({
            success: true,
            pedidoId: produto.pedido_id,
            statusGeral: produto.status_geral,
            statusProduto: produto.status_producao,
            codigoRastreio: codigoRastreio,
            middlewareId: produto.middleware_id,
            etapa: produto.etapa_detalhada,
            progresso: produto.progresso_producao,
            estoquePos: produto.estoque_pos,
            dataCriacao: produto.data_criacao,
            valorTotal: produto.valor_total,
            slotExpedicao: slotResult.rows[0] || null,
            timestamp: new Date().toISOString()
        });

    } catch (err) {
        console.error('❌ Erro ao buscar pedido:', err.message);
        res.status(500).json({ 
            success: false,
            error: 'Erro ao buscar pedido' 
        });
    }
};

// 🎯 FUNÇÃO: Listar pedidos do cliente
const getClientOrders = async (req, res) => {
    const { clienteId } = req.params;

    try {
        console.log(`📋 Listando pedidos para cliente: ${clienteId}`);
        
        const resultado = await pool.query(
            `SELECT p.id, p.data_criacao, p.status_geral, p.valor_total,
                    COUNT(pd.id) as total_produtos,
                    STRING_AGG(DISTINCT pd.status_producao, ', ') as status_produtos
             FROM pedidos p
             LEFT JOIN produtos_do_pedido pd ON p.id = pd.pedido_id
             WHERE p.cliente_id = $1
             GROUP BY p.id, p.data_criacao, p.status_geral, p.valor_total
             ORDER BY p.data_criacao DESC`,
            [clienteId]
        );

        console.log(`✅ Encontrados ${resultado.rows.length} pedidos`);

        res.status(200).json({
            success: true,
            clienteId: clienteId,
            totalPedidos: resultado.rows.length,
            pedidos: resultado.rows,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error("❌ Erro ao listar pedidos:", error);
        res.status(500).json({ 
            success: false,
            error: "Erro interno" 
        });
    }
};

// 🎯 FUNÇÃO: Verificar estoque para uma cor específica
const verificarEstoqueCor = async (req, res) => {
    const { cor } = req.params;

    try {
        console.log(`📦 Verificando estoque para cor: ${cor}`);
        
        const estoqueInfo = await estoqueService.verificarEstoqueQueueSmart({
            passoQuatroDeCinco: cor
        });

        res.status(200).json({
            success: true,
            cor: cor,
            disponivel: estoqueInfo.disponivel,
            quantidade: estoqueInfo.quantidade,
            posicoes: estoqueInfo.posicoes,
            detalhes: estoqueInfo.detalhes,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Erro ao verificar estoque:', error.message);
        res.status(500).json({
            success: false,
            error: 'Erro ao verificar estoque'
        });
    }
};

export { 
    createOrder, 
    getOrderByTrackingCode,
    getClientOrders,
    verificarEstoqueCor
};