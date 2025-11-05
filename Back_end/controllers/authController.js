import pool from '../config/database.js';

const register = async (req, res) => {
    const { email, senha, nome_usuario, data_nascimento, telefone } = req.body;

    if (!email || !senha || !nome_usuario || !data_nascimento || !telefone) {
        return res.status(400).json({ error: "Todos os campos de cadastro são obrigatórios." });
    }

    try {
        const result = await pool.query(
            `INSERT INTO clientes (email, senha, nome_usuario, data_nascimento, telefone)
             VALUES ($1, $2, $3, $4, $5) RETURNING id`,
            [email, senha, nome_usuario, data_nascimento, telefone]
        );

        const clienteId = result.rows[0].id;
        
        res.status(201).json({ 
            message: "Cadastro realizado com sucesso!",
            clienteId: clienteId 
        });

    } catch (err) {
        console.error('Erro ao cadastrar cliente:', err);
        
        if (err.code === '23505') {
            return res.status(409).json({ error: "Este e-mail já está cadastrado. Tente fazer login." });
        }

        res.status(500).json({ error: "Erro interno do servidor ao registrar o cliente." });
    }
};

const login = async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ error: "E-mail e senha são obrigatórios." });
    }

    try {
        const result = await pool.query(
            'SELECT id, senha FROM clientes WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: "E-mail não cadastrado." });
        }

        const cliente = result.rows[0];
        const senhaCorreta = (senha === cliente.senha);

        if (senhaCorreta) {
            res.status(200).json({
                message: "Login bem-sucedido!",
                clienteId: cliente.id
            });
        } else {
            return res.status(401).json({ error: "Senha incorreta." });
        }

    } catch (err) {
        console.error('Erro ao processar login:', err);
        res.status(500).json({ error: "Erro interno do servidor ao tentar fazer login." });
    }
};

export { register, login };