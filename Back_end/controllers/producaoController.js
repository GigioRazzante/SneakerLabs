// controllers/producaoController.js - VERSÃO COMPLETA OTIMIZADA
import pool from '../config/database.js';

const handleCallback = async (req, res) => {
    console.log('📞 Callback Queue Smart:', req.body);

    try {
        const { _id, id, status, stage, progress, estoquePos, payload } = req.body;
        const middlewareId = _id || id;

        if (!middlewareId) {
            return res.status(400).json({ error: 'ID ausente' });
        }

        // Buscar produto
        const produtoResult = await pool.query(
            `SELECT id, pedido_id FROM produtos_do_pedido 
             WHERE middleware_id = $1 OR codigo_rastreio = $1`,
            [middlewareId]
        );

        if (produtoResult.rows.length === 0) {
            console.log(`❌ Produto não encontrado: ${middlewareId}`);
            return res.status(404).json({ error: 'Produto não encontrado' });
        }

        const produto = produtoResult.rows[0];

        // Mapear status
        const statusMap = {
            'PENDING': 'FILA',
            'PROCESSING': 'PROCESSANDO', 
            'COMPLETED': 'PRONTO',
            'FAILED': 'ERRO',
            'CANCELLED': 'CANCELADO'
        };
        
        let statusProducao = statusMap[status] || 'PROCESSANDO';
        if (stage === 'EXPEDICAO') statusProducao = 'EXPEDICAO';

        // Atualizar produto
        await pool.query(
            `UPDATE produtos_do_pedido 
             SET status_producao = $1, 
                 etapa_detalhada = $2,
                 progresso_producao = $3,
                 estoque_pos = $4,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $5`,
            [statusProducao, stage, progress, estoquePos, produto.id]
        );

        // Se estiver pronto, verificar status do pedido
        if (status === 'COMPLETED') {
            const statusCheck = await pool.query(
                `SELECT COUNT(*) as total,
                        SUM(CASE WHEN status_producao = 'PRONTO' THEN 1 ELSE 0 END) as prontos
                 FROM produtos_do_pedido 
                 WHERE pedido_id = $1`,
                [produto.pedido_id]
            );
            
            const { total, prontos } = statusCheck.rows[0];
            
            if (parseInt(prontos) === parseInt(total)) {
                await pool.query(
                    'UPDATE pedidos SET status_geral = $1 WHERE id = $2',
                    ['AGUARDANDO_ENTREGA', produto.pedido_id]
                );
            }
        }

        // Se estiver em expedição, tentar alocar slot
        if (stage === 'EXPEDICAO') {
            try {
                const slotExpedicaoService = await import('../services/slotExpedicaoService.js');
                const slotAlocado = await slotExpedicaoService.default.alocarSlot(produto.pedido_id);
                console.log(`✅ Slot alocado: ${slotAlocado?.id}`);
            } catch (slotError) {
                console.log('⚠️ Slot não alocado:', slotError.message);
            }
        }

        console.log(`✅ Callback processado: ${produto.id} -> ${statusProducao}`);

        res.status(200).json({
            success: true,
            message: 'Callback processado',
            produtoId: produto.id,
            pedidoId: produto.pedido_id,
            status: statusProducao
        });

    } catch (error) {
        console.error('❌ Erro callback:', error);
        res.status(200).json({
            success: false,
            error: 'Erro interno'
        });
    }
};

export { handleCallback };