// controllers/producaoController.js - VERSÃO CORRIGIDA
import pool from '../config/database.js';

const handleCallback = async (req, res) => {
    console.log('\n=== 📞 CALLBACK RECEBIDO DO MIDDLEWARE ===');
    console.log('📦 Dados recebidos:', req.body);

    try {
        const callbackData = req.body;
        
        if (!callbackData || !callbackData.id) {
            console.log('⚠️ Callback inválido - sem ID');
            return res.status(400).json({ 
                success: false,
                error: 'ID do callback é obrigatório' 
            });
        }

        const middlewareId = callbackData.id;
        const status = callbackData.status || 'UNKNOWN';
        const progress = callbackData.progress || 0;
        const payload = callbackData.payload || {};

        console.log(`🔍 Processando callback: ID ${middlewareId}, Status: ${status}`);

        // CORREÇÃO: Buscar produto pelo orderId do payload (não mais por id_rastreio_maquina)
        let produtoId = null;
        let pedidoId = null;

        // Extrair IDs do orderId (formato: SNK-{pedidoId}-{produtoDbId}-{timestamp})
        if (payload.orderId) {
            const parts = payload.orderId.split('-');
            if (parts.length >= 3) {
                pedidoId = parts[1];
                produtoId = parts[2];
                
                console.log(`📊 IDs extraídos: Pedido ${pedidoId}, Produto ${produtoId}`);
                
                // Verificar se produto existe
                const produtoCheck = await pool.query(
                    'SELECT id, pedido_id FROM produtos_do_pedido WHERE id = $1 AND pedido_id = $2',
                    [produtoId, pedidoId]
                );
                
                if (produtoCheck.rows.length > 0) {
                    console.log(`✅ Produto encontrado: ${produtoId}`);
                    return await processarProduto(produtoId, pedidoId, status, progress, callbackData, res);
                }
            }
        }
        
        // Fallback: tentar buscar pelo código de rastreio
        console.log(`🔍 Tentando fallback por código de rastreio...`);
        const fallbackResult = await pool.query(
            'SELECT id, pedido_id FROM produtos_do_pedido WHERE codigo_rastreio = $1',
            [middlewareId]
        );

        if (fallbackResult.rows.length > 0) {
            produtoId = fallbackResult.rows[0].id;
            pedidoId = fallbackResult.rows[0].pedido_id;
            console.log(`✅ Produto encontrado via fallback: ${produtoId}`);
            return await processarProduto(produtoId, pedidoId, status, progress, callbackData, res);
        }

        console.log(`❌ Produto não encontrado para middlewareId: ${middlewareId}`);
        return res.status(404).json({ 
            success: false,
            error: 'Produto não encontrado',
            middlewareId: middlewareId
        });

    } catch (error) {
        console.error('❌ Erro ao processar callback:', error);
        res.status(200).json({
            success: false,
            error: 'Erro interno ao processar callback'
        });
    }
};

// Função auxiliar para processar produto
async function processarProduto(produtoId, pedidoId, status, progress, callbackData, res) {
    try {
        // Mapear status do middleware para seu sistema
        let statusProducao = 'FILA';
        let slotExpedicao = null;

        switch(status) {
            case 'PENDING':
                statusProducao = 'FILA';
                break;
            case 'PROCESSING':
                statusProducao = 'PROCESSANDO';
                break;
            case 'COMPLETED':
                statusProducao = 'PRONTO';
                slotExpedicao = callbackData.slot || null;
                break;
            case 'FAILED':
                statusProducao = 'ERRO';
                break;
            default:
                statusProducao = 'PROCESSANDO';
        }

        console.log(`🔄 Atualizando produto ${produtoId}: ${status} -> ${statusProducao}`);

        // Atualizar produto no banco
        await pool.query(
            `UPDATE produtos_do_pedido 
             SET status_producao = $1, 
                 progresso_producao = $2,
                 slot_expedicao = $3,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $4`,
            [statusProducao, progress, slotExpedicao, produtoId]
        );

        // Se o produto está completo, verificar status do pedido
        if (status === 'COMPLETED') {
            console.log(`🔍 Verificando status do pedido ${pedidoId}...`);
            
            const statusCheck = await pool.query(
                `SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN status_producao = 'PRONTO' THEN 1 ELSE 0 END) as prontos
                 FROM produtos_do_pedido 
                 WHERE pedido_id = $1`,
                [pedidoId]
            );
            
            const { total, prontos } = statusCheck.rows[0];
            console.log(`📊 Pedido ${pedidoId}: ${prontos}/${total} produtos prontos`);

            if (parseInt(prontos) === parseInt(total)) {
                await pool.query(
                    'UPDATE pedidos SET status_geral = $1 WHERE id = $2',
                    ['AGUARDANDO_ENTREGA', pedidoId]
                );
                console.log(`✅ Pedido ${pedidoId} pronto para entrega!`);
            }
        } else if (status === 'PROCESSING') {
            await pool.query(
                `UPDATE pedidos 
                 SET status_geral = 'EM_PRODUCAO'
                 WHERE id = $1 AND status_geral NOT IN ('AGUARDANDO_ENTREGA', 'ENTREGUE')`,
                [pedidoId]
            );
        }

        console.log(`✅ Callback processado com sucesso!`);
        
        res.status(200).json({
            success: true,
            message: 'Callback recebido e processado',
            produtoId: produtoId,
            pedidoId: pedidoId,
            status: statusProducao,
            progresso: progress,
            slot: slotExpedicao
        });

    } catch (error) {
        console.error('❌ Erro ao processar produto:', error);
        throw error;
    }
}

export { handleCallback };