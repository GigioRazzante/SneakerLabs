// clienteController.js
import pool from '../config/database.js';

const getCliente = async (req, res) => {
    const clienteId = req.params.id;

    try {
        const result = await pool.query(
            `SELECT nome_usuario, email, data_nascimento, telefone, cor_perfil 
             FROM clientes 
             WHERE id = $1`,
            [clienteId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Cliente não encontrado." });
        }

        res.status(200).json(result.rows[0]);

    } catch (err) {
        console.error('Erro ao buscar dados do cliente:', err);
        res.status(500).json({ error: "Erro interno do servidor ao buscar dados." });
    }
};

const updateCliente = async (req, res) => {
    const clienteId = req.params.id;
    const { nome_usuario, data_nascimento, telefone, cor_perfil } = req.body;

    if (!nome_usuario || !data_nascimento || !telefone) {
        return res.status(400).json({ error: "Todos os campos obrigatórios são necessários." });
    }

    try {
        const result = await pool.query(
            `UPDATE clientes 
             SET nome_usuario = $1, data_nascimento = $2, telefone = $3, cor_perfil = $4
             WHERE id = $5 
             RETURNING id, nome_usuario, email, data_nascimento, telefone, cor_perfil`,
            [nome_usuario, data_nascimento, telefone, cor_perfil, clienteId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Cliente não encontrado." });
        }

        res.status(200).json({
            message: "Dados atualizados com sucesso!",
            cliente: result.rows[0]
        });

    } catch (err) {
        console.error('Erro ao atualizar dados do cliente:', err);
        res.status(500).json({ error: "Erro interno do servidor ao atualizar dados." });
    }
};

export { getCliente, updateCliente };