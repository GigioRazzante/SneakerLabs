import pool from '../config/database.js';

// FUNÇÃO PARA BAIXAR ESTOQUE
const atualizarEstoqueProducao = async (produto) => {
    try {
        const { estilo, material, cor } = produto;
        
        console.log(`[ESTOQUE] Baixando estoque para: ${estilo}, ${material}, ${cor}`);
        
        // Mapeamento igual ao generateBoxPayload
        const styleMap = {
            "Casual": { bloco: 'B1', quantidade: 1 },
            "Corrida": { bloco: 'B2', quantidade: 2 },
            "Skate": { bloco: 'B3', quantidade: 3 },
        };

        const materialMap = {
            "Couro": 'M1',
            "Camurça": 'M2', 
            "Tecido": 'M3',
        };

        const corMap = {
            "Branco": 'L1',
            "Preto": 'L2',
            "Azul": 'L3',
            "Vermelho": 'L4',
            "Verde": 'L5',
            "Amarelo": 'L6',
        };

        // Itens a baixar
        const itensParaBaixar = [];
        
        // Bloco do estilo
        const estiloConfig = styleMap[estilo];
        if (estiloConfig) {
            itensParaBaixar.push({
                codigo: estiloConfig.bloco,
                quantidade: estiloConfig.quantidade
            });
        }
        
        // Material
        const materialCodigo = materialMap[material];
        if (materialCodigo) {
            itensParaBaixar.push({
                codigo: materialCodigo,
                quantidade: 1
            });
        }
        
        // Lâmina da cor
        const corCodigo = corMap[cor];
        if (corCodigo) {
            itensParaBaixar.push({
                codigo: corCodigo,
                quantidade: 1
            });
        }

        // Executar baixas no estoque
        for (const item of itensParaBaixar) {
            await pool.query(
                'UPDATE estoque_maquina SET quantidade = quantidade - $1 WHERE codigo = $2',
                [item.quantidade, item.codigo]
            );
            console.log(`[ESTOQUE] Baixado: ${item.codigo} x${item.quantidade}`);
        }
        
        console.log(`[ESTOQUE] Baixa concluída para produto ${produto.id}`);
        
    } catch (error) {
        console.error('[ESTOQUE] Erro ao baixar estoque:', error);
        throw error;
    }
};

// CONTROLLER PRINCIPAL
const handleCallback = async (req, res) => {
    const { id, status, slot } = req.body;

    if (!id || status !== 'FINISHED' || !slot) {
        console.warn('Callback recebido inválido ou produto não finalizado:', req.body);
        return res.status(200).send({ message: "Payload recebido, mas ignorado (não finalizado)." });
    }

    try {
        console.log(`[CALLBACK] Produto ID Rastreio ${id} pronto. Slot: ${slot}`);

        // 1. Buscar dados do produto para saber o que foi produzido
        const produtoResult = await pool.query(
            'SELECT id, pedido_id, estilo, material, solado, cor, detalhes FROM produtos_do_pedido WHERE id_rastreio_maquina = $1',
            [id]
        );

        if (produtoResult.rows.length === 0) {
            console.warn(`Produto com ID de rastreio ${id} não encontrado no banco de dados.`);
            return res.status(404).send({ error: 'Produto não rastreado encontrado.' });
        }
        
        const produto = produtoResult.rows[0];
        const pedidoId = produto.pedido_id;

        console.log(`[ESTOQUE] Produto produzido: ${produto.estilo}, ${produto.material}, ${produto.cor}`);

        // 2. ATUALIZAR ESTOQUE - Baixar os materiais usados
        await atualizarEstoqueProducao(produto);

        // 3. Atualizar produto no banco (como já estava)
        await pool.query(
            'UPDATE produtos_do_pedido SET status_producao = $1, slot_expedicao = $2 WHERE id_rastreio_maquina = $3',
            ['PRONTO', slot, id]
        );

        // 4. Verificar status do pedido mestre
        const statusCheck = await pool.query(
            'SELECT count(*) FROM produtos_do_pedido WHERE pedido_id = $1 AND status_producao != $2',
            [pedidoId, 'PRONTO']
        );
        
        const produtosPendentes = parseInt(statusCheck.rows[0].count, 10);
        
        if (produtosPendentes === 0) {
            // Todos os produtos estão PRONTOS! O Pedido Mestre foi concluído.
            await pool.query(
                'UPDATE pedidos SET status_geral = $1 WHERE id = $2',
                ['CONCLUIDO', pedidoId]
            );
            console.log(`[CONCLUIDO] Pedido Mestre #${pedidoId} finalizado.`);
        } else {
            console.log(`[AGUARDANDO] Pedido Mestre #${pedidoId} aguardando ${produtosPendentes} produto(s).`);
        }

        res.status(200).send({ 
            message: "Callback processado com sucesso. Status do pedido atualizado e estoque baixado.",
            estoqueAtualizado: true
        });

    } catch (err) {
        console.error('Erro ao processar callback:', err.message);
        res.status(500).send({ error: 'Erro interno ao processar callback.' });
    }
};

// EXPORT
export { handleCallback };