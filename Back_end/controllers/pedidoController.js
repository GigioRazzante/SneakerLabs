import pool from '../config/database.js';
import { generateBoxPayload } from '../services/boxPayloadService.js';
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
                // 4.1. Salvar produto individual - CORRIGIDO para nova estrutura
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

                // 4.2. Enviar para produção
                console.log(`🔄 Traduzindo para payload da caixa...`);
                const boxProductionPayload = generateBoxPayload(orderDetails);
                
                console.log(`🚀 Enviando produto DB ID ${produtoDbId} para produção...`);

                // =============================================
                // BLOCO SIMULAÇÃO (ATIVO - MODO DESENVOLVIMENTO)
                // =============================================
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
            modo: 'DESENVOLVIMENTO'
        });

    } catch (err) {
        console.error('❌ ERRO DETALHADO ao processar o carrinho:');
        console.error('Mensagem:', err.message);
        console.error('Stack trace completo:', err.stack);
        
        res.status(500).json({ error: 'Erro ao processar o carrinho. Por favor, tente novamente.' });
    }
};

const getOrderStatus = async (req, res) => {
    const pedidoId = req.params.id;
    const clienteId = req.headers['x-client-id'] || req.headers['client-id'];

    console.log(`🔍 [RASTREIO] Buscando status do pedido ${pedidoId} para cliente: ${clienteId}`);

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

        // 2. Obter produtos do pedido - CORRIGIDO para nova estrutura
        const produtosResult = await pool.query(
            `SELECT 
                passo_um, passo_dois, passo_tres, passo_quatro, passo_cinco,
                status_producao, codigo_rastreio, imagem_gerada
             FROM produtos_do_pedido 
             WHERE pedido_id = $1`,
            [pedidoId]
        );

        console.log(`✅ [RASTREIO] Pedido ${pedidoId} autorizado para cliente ${clienteId}`);

        res.status(200).json({
            pedidoId: pedidoId,
            statusGeral: status_geral,
            dataCriacao: data_criacao,
            produtos: produtosResult.rows.map(row => ({
                configuracao: `${row.passo_um} / ${row.passo_dois} / ${row.passo_tres} / ${row.passo_quatro} / ${row.passo_cinco}`,
                status: row.status_producao,
                rastreioId: row.codigo_rastreio,
                imagemGerada: row.imagem_gerada
            }))
        });

    } catch (err) {
        console.error('❌ [RASTREIO] Erro ao buscar status do pedido:', err.message);
        res.status(500).json({ error: 'Erro ao buscar status do pedido.' });
    }
};

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

export { createOrder, getOrderStatus, getClientOrders };