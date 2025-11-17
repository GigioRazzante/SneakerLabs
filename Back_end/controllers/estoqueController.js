// controllers/estoqueController.js
import pool from '../config/database.js';

const listarEstoque = async (req, res) => {
    try {
        console.log('📦 Buscando dados do estoque...');
        
        const result = await pool.query(`
            SELECT 
                id,
                nome_produto,
                quantidade,
                quantidade_minima,
                localizacao,
                categoria,
                created_at,
                updated_at
            FROM estoque_maquina 
            ORDER BY nome_produto
        `);

        console.log(`✅ Encontrados ${result.rows.length} itens no estoque`);
        
        res.status(200).json({
            success: true,
            data: result.rows
        });

    } catch (error) {
        console.error('❌ Erro ao buscar estoque:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno ao buscar estoque'
        });
    }
};

const reporItem = async (req, res) => {
    const { id } = req.params;
    const { quantidade } = req.body;

    try {
        console.log(`🔄 Repondo item ${id} com quantidade ${quantidade}`);

        const result = await pool.query(
            'UPDATE estoque_maquina SET quantidade = quantidade + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
            [quantidade, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Item de estoque não encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {
        console.error('❌ Erro ao repor item:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno ao repor item'
        });
    }
};

const editarItem = async (req, res) => {
    const { id } = req.params;
    const { nome_produto, quantidade, quantidade_minima, localizacao, categoria } = req.body;

    try {
        console.log(`✏️ Editando item ${id}`);

        const result = await pool.query(
            `UPDATE estoque_maquina 
             SET nome_produto = $1, quantidade = $2, quantidade_minima = $3, 
                 localizacao = $4, categoria = $5, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $6 
             RETURNING *`,
            [nome_produto, quantidade, quantidade_minima, localizacao, categoria, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Item de estoque não encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {
        console.error('❌ Erro ao editar item:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno ao editar item'
        });
    }
};

const removerItem = async (req, res) => {
    const { id } = req.params;

    try {
        console.log(`🗑️ Removendo item ${id}`);

        const result = await pool.query(
            'DELETE FROM estoque_maquina WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Item de estoque não encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Item removido com sucesso',
            data: result.rows[0]
        });

    } catch (error) {
        console.error('❌ Erro ao remover item:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno ao remover item'
        });
    }
};

export { listarEstoque, reporItem, editarItem, removerItem };