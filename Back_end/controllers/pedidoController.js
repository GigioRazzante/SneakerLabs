import pool from '../config/database.js';
import { generateBoxPayload } from '../services/boxPayloadService.js';
import estoqueService from '../services/estoqueService.js';
import slotExpedicaoService from '../services/slotExpedicaoService.js';
import fetch from 'node-fetch';

const PROD_API_URL = 'http://52.1.197.112:3000/queue/items';

const createOrder = async (req, res) => {
    const { clienteId, produtos } = req.body;

    console.log('=== 📦 INICIANDO PROCESSAMENTO DO PEDIDO ===');
    console.log(`Cliente ID recebido do frontend: ${clienteId}`);
    console.log(`Número de produtos: ${produtos ? produtos.length : 0}`);

    if (!clienteId) {
        console.log('❌ Cliente ID não fornecido no request');
        return res.status(400).json({ error: "Cliente ID é obrigatório." });
    }

    if (!produtos || produtos.length === 0) {
        console.log('❌ Nenhum produto no carrinho');
        return res.status(400).json({ message: "Nenhum produto no carrinho para processar." });
    }

    try {
        // 1. Verificar se o cliente existe
        console.log(`🔍 Verificando se cliente ${clienteId} existe...`);
        const clienteCheck = await pool.query('SELECT id FROM clientes WHERE id = $1', [clienteId]);
        
        if (clienteCheck.rows.length === 0) {
            console.log(`❌ Cliente ${clienteId} não encontrado no banco de dados`);
            return res.status(404).json({ error: "Cliente não encontrado." });
        }
        console.log(`✅ Cliente ${clienteId} encontrado no banco`);

        // 2. Calcular valor total
        const valorTotalPedido = produtos.reduce((total, produto) => {
            return total + (produto.valor || 0);
        }, 0);
        
        console.log(`💰 Valor total do pedido: R$ ${valorTotalPedido.toFixed(2)}`);

        // 3. Salvar pedido mestre
        console.log(`💾 Salvando pedido mestre para cliente ${clienteId}...`);
        const pedidoMestreResult = await pool.query(
            'INSERT INTO pedidos (cliente_id, status_geral, valor_total) VALUES ($1, $2, $3) RETURNING id',
            [clienteId, 'PENDENTE', valorTotalPedido]
        );
        const pedidoId = pedidoMestreResult.rows[0].id;
        console.log(`✅ Pedido mestre criado: ID ${pedidoId} - Valor: R$ ${valorTotalPedido.toFixed(2)}`);

        // 🎯 ALOCAR SLOT AUTOMATICAMENTE
        let slotAlocado = null;
        try {
            console.log(`🎯 Tentando alocar slot para pedido ${pedidoId}...`);
            slotAlocado = await slotExpedicaoService.alocarSlot(pedidoId);
            console.log(`✅ Slot ${slotAlocado.id} alocado para pedido ${pedidoId}`);
        } catch (slotError) {
            console.log(`⚠️ Não foi possível alocar slot: ${slotError.message}`);
            // Continua o pedido mesmo sem slot
        }
        
        const produtosEnviados = [];

        // 4. Processar cada produto
        for (const [index, produto] of produtos.entries()) {
            const orderDetails = produto.configuracoes;
            const valorUnitario = produto.valor || 0;

            console.log(`\n📋 Processando produto ${index + 1}/${produtos.length}:`);
            console.log('Configurações recebidas:', orderDetails);
            console.log(`💰 Valor do produto: R$ ${valorUnitario.toFixed(2)}`);

            // Validar campos obrigatórios
            const camposObrigatorios = ['passoUmDeCinco', 'passoDoisDeCinco', 'passoTresDeCinco', 'passoQuatroDeCinco', 'passoCincoDeCinco'];
            const camposFaltantes = camposObrigatorios.filter(campo => !orderDetails[campo]);
            
            if (camposFaltantes.length > 0) {
                console.log(`❌ Campos faltantes: ${camposFaltantes.join(', ')}`);
                throw new Error(`Campos obrigatórios faltantes: ${camposFaltantes.join(', ')}`);
            }

            try {
                // 4.1. Salvar produto individual
                console.log(`💾 Tentando salvar produto no banco...`);
                
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
                console.log(`✅ Produto salvo com ID: ${produtoDbId} - Valor: R$ ${valorUnitario.toFixed(2)}`);

                // 🎯 BAIXAR ESTOQUE IMEDIATAMENTE
                console.log(`📦 Baixando estoque para o produto...`);
                try {
                    await estoqueService.baixarEstoquePedido(orderDetails);
                    console.log(`✅ Estoque baixado com sucesso`);
                } catch (estoqueError) {
                    console.error(`❌ Erro ao baixar estoque:`, estoqueError);
                    // Não interrompe o pedido, mas registra o erro
                }

                // 4.2. Enviar para produção (MODO SIMULAÇÃO)
                console.log(`🚀 [MODO DEV] Simulando envio para produção...`);
                
                // Simular delay de processamento
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Gerar ID de rastreio simulado
                const rastreioId = `SIM-${Date.now()}-${produtoDbId}`;
                console.log(`✅ [MODO DEV] Simulação concluída. Rastreio: ${rastreioId}`);
                
                // Atualizar produto como "PRONTO" automaticamente (para teste)
                await pool.query(
                    'UPDATE produtos_do_pedido SET status_producao = $1, codigo_rastreio = $2 WHERE id = $3',
                    ['PRONTO', rastreioId, produtoDbId]
                );
                
                console.log(`✅ [MODO DEV] Produto marcado como PRONTO no banco`);

                produtosEnviados.push({ 
                    produtoDbId, 
                    rastreioId,
                    valor: valorUnitario,
                    status: 'PRONTO'
                });

            } catch (produtoError) {
                console.error(`❌ Erro ao processar produto ${index + 1}:`, produtoError);
                throw produtoError;
            }
        }

        // 5. Atualizar pedido mestre para CONCLUÍDO (já que todos estão PRONTOS em modo dev)
        await pool.query(
            'UPDATE pedidos SET status_geral = $1 WHERE id = $2',
            ['CONCLUIDO', pedidoId]
        );
        console.log(`✅ [MODO DEV] Pedido mestre #${pedidoId} marcado como CONCLUIDO`);

        // 6. Resposta de sucesso
        console.log(`🎉 Pedido #${pedidoId} processado com sucesso! ${produtosEnviados.length} produtos processados. Valor total: R$ ${valorTotalPedido.toFixed(2)}`);
        res.status(200).json({
            message: `Pedido #${pedidoId} recebido e ${produtosEnviados.length} produtos processados em modo desenvolvimento.`,
            pedidoId: pedidoId,
            valorTotal: valorTotalPedido,
            produtosEnviados: produtosEnviados,
            slotAlocado: slotAlocado ? `Slot ${slotAlocado.id}` : 'Nenhum slot disponível',
            modo: 'DESENVOLVIMENTO'
        });

    } catch (err) {
        console.error('❌ ERRO DETALHADO ao processar o carrinho:');
        console.error('Mensagem:', err.message);
        console.error('Stack trace completo:', err.stack);
        
        res.status(500).json({ error: 'Erro ao processar o carrinho. Por favor, tente novamente.' });
    }
};

// 🎯 NOVA FUNÇÃO: Buscar pedido por código de rastreio (SUBSTITUI get por ID)
const getOrderByTrackingCode = async (req, res) => {
    const { codigoRastreio } = req.params;
    const clienteId = req.headers['x-client-id'] || req.headers['client-id'];

    console.log(`🔍 [RASTREIO] Buscando pedido por código: ${codigoRastreio} para cliente: ${clienteId}`);

    try {
        if (!clienteId) {
            console.log('❌ Cliente ID não fornecido nos headers');
            return res.status(401).json({ message: "Identificação do cliente necessária." });
        }

        if (!codigoRastreio) {
            return res.status(400).json({ message: "Código de rastreio é obrigatório." });
        }

        // 1. Buscar produto pelo código de rastreio
        const produtoResult = await pool.query(
            `SELECT pp.*, p.cliente_id, p.status_geral, p.data_criacao, p.valor_total
             FROM produtos_do_pedido pp
             JOIN pedidos p ON pp.pedido_id = p.id
             WHERE pp.codigo_rastreio = $1`,
            [codigoRastreio]
        );

        if (produtoResult.rows.length === 0) {
            console.log(`❌ Código de rastreio ${codigoRastreio} não encontrado`);
            return res.status(404).json({ message: "Código de rastreio não encontrado." });
        }
        
        const produto = produtoResult.rows[0];
        const pedidoId = produto.pedido_id;
        
        console.log(`📊 [RASTREIO] Pedido encontrado: ${pedidoId}, cliente: ${produto.cliente_id}, solicitante: ${clienteId}`);
        
        // Verificação de autorização
        if (parseInt(produto.cliente_id) !== parseInt(clienteId)) {
            console.log(`❌ Acesso negado: pedido pertence ao cliente ${produto.cliente_id}, solicitante é ${clienteId}`);
            return res.status(403).json({ 
                message: "Acesso negado. Este pedido não pertence ao seu usuário." 
            });
        }

        // 2. Buscar TODOS os produtos do mesmo pedido
        const todosProdutosResult = await pool.query(
            `SELECT 
                id,
                passo_um, passo_dois, passo_tres, passo_quatro, passo_cinco,
                status_producao, codigo_rastreio, slot_expedicao,
                imagem_url, imagem_nome_arquivo
             FROM produtos_do_pedido 
             WHERE pedido_id = $1`,
            [pedidoId]
        );

        // 3. Buscar slot do pedido
        const slotResult = await pool.query(
            'SELECT id, status, data_ocupacao FROM slots_expedicao WHERE pedido_id = $1',
            [pedidoId]
        );

        const slotExpedicao = slotResult.rows.length > 0 ? {
            id: slotResult.rows[0].id,
            status: slotResult.rows[0].status,
            dataOcupacao: slotResult.rows[0].data_ocupacao
        } : null;

        console.log(`✅ [RASTREIO] Pedido ${pedidoId} autorizado para cliente ${clienteId}`);

        // Formatar resposta
        const produtosFormatados = todosProdutosResult.rows.map(row => ({
            id: row.id,
            configuracao: `${row.passo_um} / ${row.passo_dois} / ${row.passo_tres} / ${row.passo_quatro} / ${row.passo_cinco}`,
            status: row.status_producao,
            rastreioId: row.codigo_rastreio,
            slotExpedicao: row.slot_expedicao,
            imagemUrl: row.imagem_url,
            temImagem: !!row.imagem_url
        }));

        res.status(200).json({
            pedidoId: parseInt(pedidoId),
            statusGeral: produto.status_geral,
            dataCriacao: produto.data_criacao,
            valorTotal: produto.valor_total,
            slotExpedicao: slotExpedicao,
            produtos: produtosFormatados,
            codigoRastreio: codigoRastreio
        });

    } catch (err) {
        console.error('❌ [RASTREIO] Erro ao buscar pedido por código:', err.message);
        console.error('Stack trace:', err.stack);
        res.status(500).json({ error: 'Erro ao buscar pedido.' });
    }
};

// 🎯 FUNÇÃO: Listar pedidos do cliente com detalhes
const getClientOrdersDetailed = async (req, res) => {
    const { clienteId } = req.params;

    try {
        console.log(`📦 Buscando pedidos detalhados para cliente ID: ${clienteId}`);
        
        const queryPedidos = `
            SELECT 
                p.id AS pedido_id, 
                p.data_criacao, 
                p.status_geral,
                p.valor_total,
                COUNT(pd.id) AS total_produtos,
                ARRAY_AGG(pd.codigo_rastreio) AS codigos_rastreio,
                ARRAY_AGG(
                    json_build_object(
                        'id', pd.id,
                        'configuracao', pd.passo_um || ' / ' || pd.passo_dois || ' / ' || pd.passo_tres || ' / ' || pd.passo_quatro || ' / ' || pd.passo_cinco,
                        'status', pd.status_producao,
                        'rastreioId', pd.codigo_rastreio
                    )
                ) AS produtos_info
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
        
        console.log(`✅ Encontrados ${resultado.rows.length} pedidos para cliente ${clienteId}`);
        
        const pedidosFormatados = resultado.rows.map(pedido => ({
            pedido_id: pedido.pedido_id,
            data_criacao: pedido.data_criacao,
            status_geral: pedido.status_geral,
            valor_total: pedido.valor_total ? parseFloat(pedido.valor_total) : 0,
            total_produtos: parseInt(pedido.total_produtos, 10),
            codigos_rastreio: pedido.codigos_rastreio.filter(codigo => codigo !== null),
            produtos: pedido.produtos_info.filter(produto => produto.id !== null)
        }));

        return res.status(200).json({
            mensagem: `Pedidos encontrados para o cliente ${clienteId}.`,
            pedidos: pedidosFormatados
        });

    } catch (error) {
        console.error("❌ Erro ao buscar pedidos por cliente ID:", error);
        return res.status(500).json({ 
            error: "Erro interno do servidor ao buscar pedidos." 
        });
    }
};

// 🚨 FUNÇÃO DEPRECATED - Mantida para compatibilidade (REMOVER FUTURAMENTE)
const getOrderStatus = async (req, res) => {
    const pedidoId = req.params.id;
    const clienteId = req.headers['x-client-id'] || req.headers['client-id'];

    console.log(`🚨 [DEPRECATED] Buscando pedido por ID: ${pedidoId} para cliente: ${clienteId}`);

    try {
        if (!clienteId) {
            console.log('❌ Cliente ID não fornecido nos headers');
            return res.status(401).json({ message: "Identificação do cliente necessária." });
        }

        // 1. Obter o pedido
        const pedidoResult = await pool.query(
            'SELECT status_geral, data_criacao, cliente_id FROM pedidos WHERE id = $1',
            [pedidoId]
        );

        if (pedidoResult.rows.length === 0) {
            console.log(`❌ Pedido ${pedidoId} não encontrado`);
            return res.status(404).json({ message: "Pedido não encontrado." });
        }
        
        const { status_geral, data_criacao, cliente_id } = pedidoResult.rows[0];
        
        console.log(`📊 [RASTREIO] Pedido encontrado: cliente_id=${cliente_id}, solicitante=${clienteId}`);
        
        // Verificação de autorização
        if (parseInt(cliente_id) !== parseInt(clienteId)) {
            console.log(`❌ Acesso negado: pedido pertence ao cliente ${cliente_id}, solicitante é ${clienteId}`);
            return res.status(403).json({ 
                message: "Acesso negado. Este pedido não pertence ao seu usuário." 
            });
        }

        // 2. Obter produtos do pedido
        const produtosResult = await pool.query(
            `SELECT 
                id,
                passo_um, passo_dois, passo_tres, passo_quatro, passo_cinco,
                status_producao, codigo_rastreio, slot_expedicao,
                imagem_url, imagem_nome_arquivo
             FROM produtos_do_pedido 
             WHERE pedido_id = $1`,
            [pedidoId]
        );

        // Buscar slot do pedido
        const slotResult = await pool.query(
            'SELECT id, status, data_ocupacao FROM slots_expedicao WHERE pedido_id = $1',
            [pedidoId]
        );

        const slotExpedicao = slotResult.rows.length > 0 ? {
            id: slotResult.rows[0].id,
            status: slotResult.rows[0].status,
            dataOcupacao: slotResult.rows[0].data_ocupacao
        } : null;

        console.log(`✅ [RASTREIO] Pedido ${pedidoId} autorizado para cliente ${clienteId}`);

        // Formatar resposta
        const produtosFormatados = produtosResult.rows.map(row => ({
            id: row.id,
            configuracao: `${row.passo_um} / ${row.passo_dois} / ${row.passo_tres} / ${row.passo_quatro} / ${row.passo_cinco}`,
            status: row.status_producao,
            rastreioId: row.codigo_rastreio,
            slotExpedicao: row.slot_expedicao,
            imagemUrl: row.imagem_url,
            temImagem: !!row.imagem_url
        }));

        res.status(200).json({
            pedidoId: parseInt(pedidoId),
            statusGeral: status_geral,
            dataCriacao: data_criacao,
            slotExpedicao: slotExpedicao,
            produtos: produtosFormatados
        });

    } catch (err) {
        console.error('❌ [RASTREIO] Erro ao buscar status do pedido:', err.message);
        console.error('Stack trace:', err.stack);
        res.status(500).json({ error: 'Erro ao buscar status do pedido.' });
    }
};

// Função original mantida para compatibilidade
const getClientOrders = async (req, res) => {
    const { clienteId } = req.params;

    try {
        console.log(`📦 Buscando pedidos para cliente ID: ${clienteId}`);
        
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
        
        console.log(`✅ Encontrados ${resultado.rows.length} pedidos para cliente ${clienteId}`);
        
        const pedidosFormatados = resultado.rows.map(pedido => ({
            ...pedido,
            valor_total: pedido.valor_total ? parseFloat(pedido.valor_total) : 0,
            total_produtos: parseInt(pedido.total_produtos, 10)
        }));

        return res.status(200).json({
            mensagem: `Pedidos encontrados para o cliente ${clienteId}.`,
            pedidos: pedidosFormatados
        });

    } catch (error) {
        console.error("❌ Erro ao buscar pedidos por cliente ID:", error);
        return res.status(500).json({ 
            error: "Erro interno do servidor ao buscar pedidos." 
        });
    }
};

export { 
    createOrder, 
    getOrderStatus,        // 🚨 DEPRECATED
    getClientOrders,       // ✅ COMPATIBILIDADE
    getOrderByTrackingCode, // 🎯 NOVA - SUBSTITUI get por ID
    getClientOrdersDetailed // 🎯 NOVA - MAIS DETALHES
};