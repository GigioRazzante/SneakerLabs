// controllers/pedidoController.js - VERSÃO COMPLETA E CORRIGIDA
import pool from '../config/database.js';
import { generateBoxPayload, enviarParaMiddleware } from '../services/boxPayloadService.js';
import estoqueService from '../services/estoqueService.js';
import slotExpedicaoService from '../services/slotExpedicaoService.js';

// ⚙️ CONFIGURAÇÃO - SIMPLIFICADA
const CONFIG = {
    USAR_MIDDLEWARE_REAL: false, // false = simulação, true = middleware real
    BAIXAR_ESTOQUE: true,
    ALOCAR_SLOT: true
};

// 🎯 FUNÇÃO PRINCIPAL: Criar pedido
const createOrder = async (req, res) => {
    const { clienteId, produtos } = req.body;

    console.log('\n=== 📦 INICIANDO PROCESSAMENTO DO PEDIDO ===');
    console.log(`🎯 Modo: ${CONFIG.USAR_MIDDLEWARE_REAL ? 'PRODUÇÃO REAL' : 'SIMULAÇÃO'}`);

    if (!clienteId) {
        return res.status(400).json({ 
            success: false,
            error: "Cliente ID é obrigatório." 
        });
    }

    if (!produtos || produtos.length === 0) {
        return res.status(400).json({ 
            success: false,
            message: "Nenhum produto no carrinho para processar." 
        });
    }

    try {
        // 1. Verificar cliente
        const clienteCheck = await pool.query('SELECT id FROM clientes WHERE id = $1', [clienteId]);
        if (clienteCheck.rows.length === 0) {
            return res.status(404).json({ 
                success: false,
                error: "Cliente não encontrado." 
            });
        }

        // 2. Calcular valor total
        const valorTotalPedido = produtos.reduce((total, produto) => {
            return total + (produto.valor || 0);
        }, 0);

        // 3. Salvar pedido mestre
        const pedidoMestreResult = await pool.query(
            'INSERT INTO pedidos (cliente_id, status_geral, valor_total) VALUES ($1, $2, $3) RETURNING id',
            [clienteId, 'PENDENTE', valorTotalPedido]
        );
        const pedidoId = pedidoMestreResult.rows[0].id;

        // 4. Alocar slot
        let slotAlocado = null;
        if (CONFIG.ALOCAR_SLOT) {
            try {
                slotAlocado = await slotExpedicaoService.alocarSlot(pedidoId);
                console.log(`✅ Slot ${slotAlocado?.id || 'N/A'} alocado`);
            } catch (slotError) {
                console.log(`⚠️ Sem slot disponível: ${slotError.message}`);
            }
        }
        
        const produtosProcessados = [];

        // 5. Processar cada produto
        for (const [index, produto] of produtos.entries()) {
            const orderDetails = produto.configuracoes;
            const valorUnitario = produto.valor || 0;

            try {
                // 5.1. Salvar produto no banco
                const produtoSalvoResult = await pool.query(
                    `INSERT INTO produtos_do_pedido (
                        pedido_id, passo_um, passo_dois, passo_tres, passo_quatro, passo_cinco, 
                        status_producao, valor
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
                    [
                        pedidoId, 
                        orderDetails.passoUmDeCinco, 
                        orderDetails.passoDoisDeCinco,
                        orderDetails.passoTresDeCinco,
                        orderDetails.passoQuatroDeCinco,
                        orderDetails.passoCincoDeCinco,
                        'FILA',
                        valorUnitario
                    ]
                );
                
                const produtoDbId = produtoSalvoResult.rows[0].id;

                // 5.2. Baixar estoque
                if (CONFIG.BAIXAR_ESTOQUE) {
                    try {
                        await estoqueService.baixarEstoquePedido(orderDetails);
                    } catch (estoqueError) {
                        console.error(`⚠️ Erro no estoque:`, estoqueError.message);
                    }
                }

                // 5.3. ENVIO PARA MIDDLEWARE OU SIMULAÇÃO
                let middlewareResponse = null;
                let rastreioId = null;
                let statusProduto = 'FILA';

                if (CONFIG.USAR_MIDDLEWARE_REAL) {
                    try {
                        const boxPayload = generateBoxPayload(orderDetails, pedidoId, produtoDbId);
                        middlewareResponse = await enviarParaMiddleware(boxPayload);
                        rastreioId = middlewareResponse.id || middlewareResponse._id;
                        
                        await pool.query(
                            `UPDATE produtos_do_pedido 
                             SET status_producao = $1,
                                 codigo_rastreio = $2
                             WHERE id = $3`,
                            ['ENVIADO_PRODUCAO', rastreioId, produtoDbId]
                        );
                        
                        statusProduto = 'ENVIADO_PRODUCAO';
                    } catch (middlewareError) {
                        console.error(`❌ Erro no middleware:`, middlewareError.message);
                        rastreioId = `ERR-${Date.now()}-${produtoDbId}`;
                        statusProduto = 'ERRO_ENVIO';
                    }
                } else {
                    // 💻 MODO SIMULAÇÃO
                    rastreioId = `SIM-${Date.now()}-${produtoDbId}`;
                    statusProduto = 'SIMULADO';
                    
                    await pool.query(
                        'UPDATE produtos_do_pedido SET status_producao = $1, codigo_rastreio = $2 WHERE id = $3',
                        [statusProduto, rastreioId, produtoDbId]
                    );
                }

                produtosProcessados.push({ 
                    produtoDbId, 
                    rastreioId,
                    valor: valorUnitario,
                    status: statusProduto
                });

            } catch (produtoError) {
                console.error(`❌ Erro no produto ${index + 1}:`, produtoError);
                produtosProcessados.push({ 
                    erro: produtoError.message,
                    produtoIndex: index 
                });
            }
        }

        // 6. Atualizar status do pedido mestre
        const statusFinal = CONFIG.USAR_MIDDLEWARE_REAL ? 'EM_PRODUCAO' : 'SIMULADO';
        await pool.query(
            'UPDATE pedidos SET status_geral = $1 WHERE id = $2',
            [statusFinal, pedidoId]
        );

        console.log(`🎉 PEDIDO #${pedidoId} PROCESSADO!`);

        // 7. Resposta
        res.status(200).json({
            success: true,
            message: `Pedido #${pedidoId} ${CONFIG.USAR_MIDDLEWARE_REAL ? 'enviado para produção real' : 'processado em modo simulação'}.`,
            pedidoId: pedidoId,
            valorTotal: valorTotalPedido,
            status: statusFinal,
            slotAlocado: slotAlocado ? slotAlocado.id : null,
            produtos: produtosProcessados
        });

    } catch (err) {
        console.error('❌ ERRO CRÍTICO:', err.message);
        res.status(500).json({ 
            success: false,
            error: 'Erro ao processar pedido'
        });
    }
};

// 🎯 FUNÇÃO: Buscar pedido por código de rastreio
const getOrderByTrackingCode = async (req, res) => {
    const { codigoRastreio } = req.params;
    const clienteId = req.headers['x-client-id'] || req.headers['client-id'];

    try {
        if (!clienteId) {
            return res.status(401).json({ 
                success: false,
                message: "Identificação do cliente necessária." 
            });
        }

        if (!codigoRastreio) {
            return res.status(400).json({ 
                success: false,
                message: "Código de rastreio é obrigatório." 
            });
        }

        // Buscar produto pelo código de rastreio
        const produtoResult = await pool.query(
            `SELECT 
                pp.id, pp.pedido_id, pp.status_producao, pp.codigo_rastreio, pp.valor,
                p.cliente_id, p.status_geral, p.data_criacao, p.valor_total
             FROM produtos_do_pedido pp
             JOIN pedidos p ON pp.pedido_id = p.id
             WHERE pp.codigo_rastreio = $1`,
            [codigoRastreio]
        );

        if (produtoResult.rows.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: "Código de rastreio não encontrado." 
            });
        }
        
        const produto = produtoResult.rows[0];
        
        // Verificação de autorização
        if (parseInt(produto.cliente_id) !== parseInt(clienteId)) {
            return res.status(403).json({ 
                success: false,
                message: "Acesso negado. Este pedido não pertence ao seu usuário." 
            });
        }

        // Buscar TODOS os produtos do mesmo pedido
        const todosProdutosResult = await pool.query(
            `SELECT 
                id, status_producao, codigo_rastreio,
                valor
             FROM produtos_do_pedido 
             WHERE pedido_id = $1`,
            [produto.pedido_id]
        );

        // Buscar slot do pedido
        const slotResult = await pool.query(
            'SELECT id, status, data_ocupacao FROM slots_expedicao WHERE pedido_id = $1',
            [produto.pedido_id]
        );

        const slotExpedicao = slotResult.rows.length > 0 ? {
            id: slotResult.rows[0].id,
            status: slotResult.rows[0].status,
            dataOcupacao: slotResult.rows[0].data_ocupacao
        } : null;

        // Formatar resposta
        const produtosFormatados = todosProdutosResult.rows.map(row => ({
            id: row.id,
            status: row.status_producao,
            rastreioId: row.codigo_rastreio,
            valor: row.valor
        }));

        res.status(200).json({
            success: true,
            pedidoId: parseInt(produto.pedido_id),
            statusGeral: produto.status_geral,
            dataCriacao: produto.data_criacao,
            valorTotal: produto.valor_total,
            slotExpedicao: slotExpedicao,
            produtos: produtosFormatados,
            codigoRastreio: codigoRastreio
        });

    } catch (err) {
        console.error('❌ Erro ao buscar pedido por código:', err.message);
        res.status(500).json({ 
            success: false,
            error: 'Erro ao buscar pedido.' 
        });
    }
};

// 🎯 FUNÇÃO: Listar pedidos do cliente (BÁSICA)
const getClientOrders = async (req, res) => {
    const { clienteId } = req.params;

    try {
        const queryPedidos = `
            SELECT 
                p.id AS pedido_id, 
                p.data_criacao, 
                p.status_geral,
                p.valor_total,
                COUNT(pd.id) AS total_produtos
            FROM 
                pedidos p
            LEFT JOIN 
                produtos_do_pedido pd ON p.id = pd.pedido_id
            WHERE 
                p.cliente_id = $1
            GROUP BY
                p.id, p.data_criacao, p.status_geral, p.valor_total
            ORDER BY 
                p.data_criacao DESC;
        `;
        
        const resultado = await pool.query(queryPedidos, [clienteId]);
        
        const pedidosFormatados = resultado.rows.map(pedido => ({
            ...pedido,
            valor_total: pedido.valor_total ? parseFloat(pedido.valor_total) : 0,
            total_produtos: parseInt(pedido.total_produtos, 10)
        }));

        return res.status(200).json({
            success: true,
            pedidos: pedidosFormatados
        });

    } catch (error) {
        console.error("❌ Erro ao buscar pedidos:", error);
        return res.status(500).json({ 
            success: false,
            error: "Erro interno do servidor" 
        });
    }
};

// 🎯 FUNÇÃO: Listar pedidos do cliente com MÁXIMOS detalhes
const getClientOrdersDetailed = async (req, res) => {
    const { clienteId } = req.params;

    try {
        console.log(`📦 Buscando pedidos DETALHADOS para cliente ID: ${clienteId}`);
        
        // 1. Verificar se cliente existe
        const clienteCheck = await pool.query(
            'SELECT id, nome_usuario FROM clientes WHERE id = $1',
            [clienteId]
        );

        if (clienteCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: "Cliente não encontrado."
            });
        }

        const nomeCliente = clienteCheck.rows[0].nome_usuario;

        // 2. Buscar pedidos com todos os detalhes
        const pedidosResult = await pool.query(
            `SELECT 
                p.id AS pedido_id,
                p.data_criacao,
                p.status_geral,
                p.valor_total,
                
                -- Informações do slot
                se.id AS slot_id,
                se.status AS slot_status,
                se.data_ocupacao AS slot_data_ocupacao,
                
                -- Produtos como JSON array
                COALESCE(
                    json_agg(
                        json_build_object(
                            'produto_id', pd.id,
                            'configuracao', 
                                COALESCE(pd.passo_um, '') || ' / ' || 
                                COALESCE(pd.passo_dois, '') || ' / ' || 
                                COALESCE(pd.passo_tres, '') || ' / ' || 
                                COALESCE(pd.passo_quatro, '') || ' / ' || 
                                COALESCE(pd.passo_cinco, ''),
                            'passo_um', pd.passo_um,
                            'passo_dois', pd.passo_dois,
                            'passo_tres', pd.passo_tres,
                            'passo_quatro', pd.passo_quatro,
                            'passo_cinco', pd.passo_cinco,
                            'status_producao', pd.status_producao,
                            'codigo_rastreio', pd.codigo_rastreio,
                            'valor', pd.valor,
                            'imagem_url', pd.imagem_url,
                            'slot_expedicao', pd.slot_expedicao,
                            'created_at', pd.created_at,
                            'tem_imagem', pd.imagem_url IS NOT NULL
                        )
                        ORDER BY pd.id
                    ) FILTER (WHERE pd.id IS NOT NULL),
                    '[]'::json
                ) AS produtos
        
            FROM pedidos p
            
            LEFT JOIN slots_expedicao se 
                ON p.id = se.pedido_id
            
            LEFT JOIN produtos_do_pedido pd 
                ON p.id = pd.pedido_id
            
            WHERE p.cliente_id = $1
            
            GROUP BY 
                p.id, p.data_criacao, p.status_geral, p.valor_total,
                se.id, se.status, se.data_ocupacao
            
            ORDER BY p.data_criacao DESC`,
            [clienteId]
        );

        if (pedidosResult.rows.length === 0) {
            return res.status(200).json({
                success: true,
                message: "Nenhum pedido encontrado para este cliente.",
                cliente: {
                    id: clienteId,
                    nome: nomeCliente
                },
                pedidos: []
            });
        }

        // 3. Formatando a resposta
        const pedidosFormatados = pedidosResult.rows.map(pedido => {
            const produtos = pedido.produtos || [];
            const totalProdutos = produtos.length;
            const produtosProntos = produtos.filter(p => p.status_producao === 'PRONTO').length;
            const progresso = totalProdutos > 0 ? Math.round((produtosProntos / totalProdutos) * 100) : 0;
            
            const codigosRastreio = [...new Set(produtos.map(p => p.codigo_rastreio).filter(Boolean))];
            
            return {
                pedido_id: pedido.pedido_id,
                data_criacao: pedido.data_criacao,
                status_geral: pedido.status_geral,
                valor_total: parseFloat(pedido.valor_total) || 0,
                
                // Estatísticas
                total_produtos: totalProdutos,
                produtos_prontos: produtosProntos,
                progresso: progresso,
                
                // Códigos de rastreio
                codigos_rastreio: codigosRastreio,
                
                // Slot de expedição
                slot_expedicao: pedido.slot_id ? {
                    id: pedido.slot_id,
                    status: pedido.slot_status,
                    data_ocupacao: pedido.slot_data_ocupacao
                } : null,
                
                // Produtos detalhados
                produtos: produtos.map(produto => ({
                    id: produto.produto_id,
                    configuracao: produto.configuracao,
                    detalhes: {
                        passo_um: produto.passo_um,
                        passo_dois: produto.passo_dois,
                        passo_tres: produto.passo_tres,
                        passo_quatro: produto.passo_quatro,
                        passo_cinco: produto.passo_cinco
                    },
                    status: produto.status_producao,
                    rastreioId: produto.codigo_rastreio,
                    valor: parseFloat(produto.valor) || 0,
                    imagem: {
                        url: produto.imagem_url,
                        disponivel: produto.tem_imagem
                    },
                    slot_expedicao: produto.slot_expedicao,
                    criado_em: produto.created_at
                }))
            };
        });

        console.log(`✅ Encontrados ${pedidosFormatados.length} pedidos detalhados para cliente ${clienteId}`);

        // 4. Retornar resposta
        return res.status(200).json({
            success: true,
            message: `Pedidos detalhados encontrados para ${nomeCliente}.`,
            cliente: {
                id: clienteId,
                nome: nomeCliente,
                total_pedidos: pedidosFormatados.length,
                total_produtos: pedidosFormatados.reduce((sum, pedido) => sum + pedido.total_produtos, 0)
            },
            pedidos: pedidosFormatados
        });

    } catch (error) {
        console.error("❌ Erro ao buscar pedidos detalhados:", error);
        
        return res.status(500).json({ 
            success: false,
            error: "Erro interno do servidor ao buscar pedidos detalhados."
        });
    }
};

// 🎯 FUNÇÃO: Obter status do pedido (simplificada)
const getOrderStatus = async (req, res) => {
    const pedidoId = req.params.id;
    const clienteId = req.headers['x-client-id'] || req.headers['client-id'];

    try {
        if (!clienteId) {
            return res.status(401).json({ 
                success: false,
                message: "Identificação do cliente necessária." 
            });
        }

        // Obter o pedido
        const pedidoResult = await pool.query(
            'SELECT status_geral, data_criacao, cliente_id FROM pedidos WHERE id = $1',
            [pedidoId]
        );

        if (pedidoResult.rows.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: "Pedido não encontrado." 
            });
        }
        
        const pedido = pedidoResult.rows[0];
        
        // Verificação de autorização
        if (parseInt(pedido.cliente_id) !== parseInt(clienteId)) {
            return res.status(403).json({ 
                success: false,
                message: "Acesso negado." 
            });
        }

        // Obter produtos do pedido
        const produtosResult = await pool.query(
            `SELECT id, status_producao, codigo_rastreio, valor
             FROM produtos_do_pedido 
             WHERE pedido_id = $1`,
            [pedidoId]
        );

        const produtosFormatados = produtosResult.rows.map(row => ({
            id: row.id,
            status: row.status_producao,
            rastreioId: row.codigo_rastreio,
            valor: row.valor
        }));

        res.status(200).json({
            success: true,
            pedidoId: parseInt(pedidoId),
            statusGeral: pedido.status_geral,
            dataCriacao: pedido.data_criacao,
            produtos: produtosFormatados
        });

    } catch (err) {
        console.error('❌ Erro ao buscar status do pedido:', err.message);
        res.status(500).json({ 
            success: false,
            error: 'Erro ao buscar status do pedido.' 
        });
    }
};

// 🎯 EXPORTAR TODAS AS FUNÇÕES
export { 
    createOrder, 
    getOrderStatus,
    getClientOrders,
    getOrderByTrackingCode,
    getClientOrdersDetailed
};