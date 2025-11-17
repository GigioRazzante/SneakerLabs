import pool from '../config/database.js';

const editarProduto = async (req, res) => {
    const { produtoId } = req.params;
    const { passo_um, passo_dois, passo_tres, passo_quatro, passo_cinco, valor } = req.body;

    try {
        // Verificar se produto existe
        const produtoExistente = await pool.query(
            'SELECT id, pedido_id FROM produtos_do_pedido WHERE id = $1',
            [produtoId]
        );

        if (produtoExistente.rows.length === 0) {
            return res.status(404).json({ 
                success: false,
                error: 'Produto não encontrado' 
            });
        }

        // Atualizar produto
        const result = await pool.query(
            `UPDATE produtos_do_pedido 
             SET passo_um = $1, passo_dois = $2, passo_tres = $3, 
                 passo_quatro = $4, passo_cinco = $5, valor = $6,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $7 
             RETURNING *`,
            [passo_um, passo_dois, passo_tres, passo_quatro, passo_cinco, valor, produtoId]
        );

        // Recalcular valor total do pedido
        const pedidoId = produtoExistente.rows[0].pedido_id;
        const valorTotalResult = await pool.query(
            'SELECT SUM(valor) as total FROM produtos_do_pedido WHERE pedido_id = $1',
            [pedidoId]
        );

        await pool.query(
            'UPDATE pedidos SET valor_total = $1 WHERE id = $2',
            [valorTotalResult.rows[0].total, pedidoId]
        );

        res.status(200).json({
            success: true,
            message: 'Produto atualizado com sucesso',
            produto: result.rows[0],
            valorTotal: valorTotalResult.rows[0].total
        });
    } catch (error) {
        console.error('Erro ao editar produto:', error);
        res.status(500).json({ 
            success: false,
            error: 'Erro interno ao editar produto' 
        });
    }
};

const removerProduto = async (req, res) => {
    const { produtoId } = req.params;

    try {
        // Buscar dados do produto antes de remover
        const produtoResult = await pool.query(
            'SELECT pedido_id, valor FROM produtos_do_pedido WHERE id = $1',
            [produtoId]
        );

        if (produtoResult.rows.length === 0) {
            return res.status(404).json({ 
                success: false,
                error: 'Produto não encontrado' 
            });
        }

        const { pedido_id, valor } = produtoResult.rows[0];

        // Remover produto
        await pool.query('DELETE FROM produtos_do_pedido WHERE id = $1', [produtoId]);

        // Recalcular valor total do pedido
        const valorTotalResult = await pool.query(
            'SELECT SUM(valor) as total FROM produtos_do_pedido WHERE pedido_id = $1',
            [pedido_id]
        );

        const novoValorTotal = valorTotalResult.rows[0].total || 0;

        await pool.query(
            'UPDATE pedidos SET valor_total = $1 WHERE id = $2',
            [novoValorTotal, pedido_id]
        );

        // Verificar se pedido ficou sem produtos
        const produtosRestantes = await pool.query(
            'SELECT COUNT(*) as total FROM produtos_do_pedido WHERE pedido_id = $1',
            [pedido_id]
        );

        if (parseInt(produtosRestantes.rows[0].total) === 0) {
            await pool.query('DELETE FROM pedidos WHERE id = $1', [pedido_id]);
        }

        res.status(200).json({
            success: true,
            message: 'Produto removido com sucesso',
            valorRemovido: valor,
            novoValorTotal: novoValorTotal,
            pedidoId: pedido_id
        });
    } catch (error) {
        console.error('Erro ao remover produto:', error);
        res.status(500).json({ 
            success: false,
            error: 'Erro interno ao remover produto' 
        });
    }
};

export { editarProduto, removerProduto };