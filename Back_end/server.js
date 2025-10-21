import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import fetch from 'node-fetch'; // Certifique-se de que 'node-fetch' está instalado se você não estiver usando Node.js 18+

const app = express();
const PORT = 3001;

// ATENÇÃO: Se o seu backend for exposto publicamente, use o IP externo
// Por enquanto, usaremos localhost e a porta do backend.
const BACKEND_URL = `http://localhost:${PORT}`; 
const PROD_API_URL = 'http://52.1.197.112:3000/queue/items';

app.use(cors());
app.use(express.json());

// --- Configuração do Banco de Dados PostgreSQL ---
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'SneakerLabs DB',
    password: 'senai',
    port: 5432,
});

// --- Nova Lógica de Tradução de Pedido para o Payload da Caixa ---
const generateBoxPayload = (orderDetails) => {
    // Mapeamento completo baseado na sua tabela
    const styleMap = {
        "Casual": { numBlocos: 1 },
        "Corrida": { numBlocos: 2 },
        "Skate": { numBlocos: 3 },
    };

    const materialMap = {
        "Couro": 1, 
        "Camurça": 2, 
        "Tecido": 3, 
    };

    const soladoMap = {
        "Borracha": "1", 
        "EVA": "2", 
        "Air": "3", 
    };

    const corMap = {
        "Branco": 1,
        "Preto": 2,
        "Azul": 3,
        "Vermelho": 4,
        "Verde": 5,
        "Amarelo": 6,
    };

    const detalhesMap = {
        "Cadarço normal": 3,
        "Cadarço colorido": 2,
        "Sem cadarço": 1,
    };

    // Extrai os dados do pedido do front-end
    const estilo = orderDetails.passoUmDeCinco;
    const material = orderDetails.passoDoisDeCinco;
    const solado = orderDetails.passoTresDeCinco;
    const cor = orderDetails.passoQuatroDeCinco;
    const detalhes = orderDetails.passoCincoDeCinco;

    const numBlocos = styleMap[estilo]?.numBlocos || 1; // Garante um default
    const corMaterial = materialMap[material];
    const padraoSolado = soladoMap[solado];
    const corLamina = corMap[cor];
    const numLaminas = detalhesMap[detalhes];

    // Constrói os objetos de bloco dinamicamente
    const order = {
        codigoProduto: 1,
    };

    for (let i = 1; i <= numBlocos; i++) {
        const bloco = {
            cor: corMaterial,
            padrao1: padraoSolado,
            padrao2: padraoSolado,
            padrao3: padraoSolado,
        };

        if (numLaminas >= 1) { bloco.lamina1 = corLamina; }
        if (numLaminas >= 2) { bloco.lamina2 = corLamina; }
        if (numLaminas >= 3) { bloco.lamina3 = corLamina; }
        
        order[`bloco${i}`] = bloco;
    }

    return {
        payload: {
            // Gera um ID de produção temporário. O ID real será o retornado pela máquina
            orderId: `SNEAKER-TEMP-${Date.now()}`, 
            sku: "KIT-01",
            order: order,
        },
        // O callbackUrl é ESSENCIAL para o rastreio da Sprint 02
        callbackUrl: `${BACKEND_URL}/api/callback` 
    };
};

// =======================================================================
// ROTA 1: RECEBIMENTO DO CARRINHO (FATIAMENTO E ENVIO)
// =======================================================================
app.post('/api/orders', async (req, res) => {
    // Esperamos um array de produtos do carrinho
    const { clienteId = 1, produtos } = req.body; // clienteId é um placeholder se não tiver auth

    if (!produtos || produtos.length === 0) {
        return res.status(400).json({ message: "Nenhum produto no carrinho para processar." });
    }

    try {
        // 1. Salvar o Pedido Mestre (Tabela 'pedidos')
        const pedidoMestreResult = await pool.query(
            'INSERT INTO pedidos (cliente_id, status_geral) VALUES ($1, $2) RETURNING id',
            [clienteId, 'PENDENTE']
        );
        const pedidoId = pedidoMestreResult.rows[0].id;
        
        const produtosEnviados = [];

        // 2. FATIAMENTO E ENVIO (Iterar sobre cada produto do carrinho)
        for (const produto of produtos) {
            const orderDetails = produto.configuracoes;

            // 2.1. Salvar o Produto Individual (Tabela 'produtos_do_pedido')
            const produtoSalvoResult = await pool.query(
                `INSERT INTO produtos_do_pedido (
                    pedido_id, estilo, material, solado, cor, detalhes, status_producao
                ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
                [
                    pedidoId, 
                    orderDetails.passoUmDeCinco, 
                    orderDetails.passoDoisDeCinco,
                    orderDetails.passoTresDeCinco,
                    orderDetails.passoQuatroDeCinco,
                    orderDetails.passoCincoDeCinco,
                    'FILA' // Status inicial
                ]
            );
            const produtoDbId = produtoSalvoResult.rows[0].id;
            
            // 2.2. Traduzir e Enviar para Produção
            const boxProductionPayload = generateBoxPayload(orderDetails);
            
            console.log(`[Pedido ${pedidoId}] Enviando produto DB ID ${produtoDbId} para produção...`);

            const productionResponse = await fetch(PROD_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(boxProductionPayload),
            });

            if (!productionResponse.ok) {
                 // Em caso de falha de envio, atualiza o status do produto
                 await pool.query('UPDATE produtos_do_pedido SET status_producao = $1 WHERE id = $2', ['FALHA_ENVIO', produtoDbId]);
                 throw new Error(`Erro ao enviar produto ${produtoDbId}: ${productionResponse.statusText}`);
            }

            const productionData = await productionResponse.json();
            const rastreioId = productionData.id;

            // 2.3. Salvar o ID de Rastreio da Máquina (CRUCIAL PARA O SPRINT 02)
            await pool.query(
                'UPDATE produtos_do_pedido SET id_rastreio_maquina = $1 WHERE id = $2',
                [rastreioId, produtoDbId]
            );

            produtosEnviados.push({ 
                produtoDbId, 
                rastreioId,
                status: 'ENVIADO'
            });
        }

        // 3. Resposta de sucesso para o Frontend
        res.status(200).json({
            message: `Pedido #${pedidoId} recebido e ${produtosEnviados.length} produtos enviados para produção.`,
            pedidoId: pedidoId,
            produtosEnviados: produtosEnviados,
        });

    } catch (err) {
        console.error('Erro ao processar o carrinho:', err.message);
        res.status(500).json({ error: 'Erro ao processar o carrinho. Por favor, tente novamente.' });
    }
});


// =======================================================================
// ROTA 2: CALLBACK DA MÁQUINA DE PRODUÇÃO (RASTREABILIDADE)
// =======================================================================
app.post('/api/callback', async (req, res) => {
    const { id, status, slot } = req.body; // id é o id_rastreio_maquina
    
    // Verificação básica do payload
    if (!id || status !== 'FINISHED' || !slot) {
        console.warn('Callback recebido inválido ou produto não finalizado:', req.body);
        return res.status(200).send({ message: "Payload recebido, mas ignorado (não finalizado)." });
    }

    try {
        console.log(`[CALLBACK] Produto ID Rastreio ${id} pronto. Slot: ${slot}`);

        // 1. Encontre o produto no seu BD pelo ID de Rastreio e atualize o status e slot.
        const updateResult = await pool.query(
            'UPDATE produtos_do_pedido SET status_producao = $1, slot_expedicao = $2 WHERE id_rastreio_maquina = $3 RETURNING pedido_id',
            ['PRONTO', slot, id]
        );

        if (updateResult.rows.length === 0) {
            console.warn(`Produto com ID de rastreio ${id} não encontrado no banco de dados.`);
            return res.status(404).send({ error: 'Produto não rastreado encontrado.' });
        }
        
        const pedidoId = updateResult.rows[0].pedido_id;

        // 2. Verifique o Status do Pedido Mestre (Lógica de Consolidação)
        
        // Conta quantos produtos do pedido ainda não estão PRONTOS
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

            // TODO: Aqui você implementaria a Notificação para o cliente (e-mail, etc.)
        } else {
            console.log(`[AGUARDANDO] Pedido Mestre #${pedidoId} aguardando ${produtosPendentes} produto(s).`);
        }

        res.status(200).send({ message: "Callback processado com sucesso. Status do pedido atualizado." });

    } catch (err) {
        console.error('Erro ao processar callback:', err.message);
        res.status(500).send({ error: 'Erro interno ao processar callback.' });
    }
});


// =======================================================================
// ROTA 3: BUSCA DE STATUS DO PEDIDO (Para o Frontend Rastrear)
// =======================================================================
app.get('/api/orders/:id/status', async (req, res) => {
    const pedidoId = req.params.id;

    try {
        // 1. Obter o status geral do pedido e a data de criação
        const pedidoResult = await pool.query(
            'SELECT status_geral, data_criacao FROM pedidos WHERE id = $1',
            [pedidoId]
        );

        if (pedidoResult.rows.length === 0) {
            return res.status(404).json({ message: "Pedido não encontrado." });
        }
        
        const { status_geral, data_criacao } = pedidoResult.rows[0];

        // 2. Obter o status, slot e estilo/material de cada produto fatiado
        const produtosResult = await pool.query(
            'SELECT estilo, material, status_producao, slot_expedicao, id_rastreio_maquina FROM produtos_do_pedido WHERE pedido_id = $1',
            [pedidoId]
        );

        res.status(200).json({
            pedidoId: pedidoId,
            statusGeral: status_geral,
            dataCriacao: data_criacao, // Adicionado para exibição na tela de Rastreio
            produtos: produtosResult.rows.map(row => ({
                configuracao: `${row.estilo} / ${row.material} / ...`, // Simplificado para exibição
                status: row.status_producao,
                slotExpedicao: row.slot_expedicao,
                rastreioId: row.id_rastreio_maquina // Adicionado para exibição
            }))
        });

    } catch (err) {
        console.error('Erro ao buscar status do pedido:', err.message);
        res.status(500).json({ error: 'Erro ao buscar status do pedido.' });
    }
});


// =======================================================================
// ROTA 4: LISTA TODOS OS PEDIDOS DO CLIENTE (Para o Frontend MeusPedidos)
// =======================================================================
app.get('/api/orders/cliente/:clienteId', async (req, res) => {
    const { clienteId } = req.params;

    try {
        const queryPedidos = `
            SELECT 
                p.id AS pedido_id, 
                p.data_criacao, 
                p.status_geral,
                COUNT(pd.id) AS total_produtos,
                -- Supondo R$ 150.00 por produto para calcular o valor total
                (COUNT(pd.id) * 150.00) AS valor_total 
            FROM 
                pedidos p
            LEFT JOIN 
                produtos_do_pedido pd ON p.id = pd.pedido_id
            WHERE 
                p.cliente_id = $1
            GROUP BY
                p.id, p.data_criacao, p.status_geral
            ORDER BY 
                p.data_criacao DESC;
        `;
        
        const resultado = await pool.query(queryPedidos, [clienteId]);
        
        // 🚨 NOVO: Mapear os resultados para converter strings numéricas em floats
        const pedidosFormatados = resultado.rows.map(pedido => ({
            ...pedido,
            // Converte a string do banco de dados (PostgreSQL) para um float
            valor_total: parseFloat(pedido.valor_total),
            // Converte a contagem de produtos para um inteiro
            total_produtos: parseInt(pedido.total_produtos, 10)
        }));

        return res.status(200).json({
            mensagem: `Pedidos encontrados para o cliente ${clienteId}.`,
            pedidos: pedidosFormatados // Usa a lista formatada
        });

    } catch (error) {
        console.error("Erro ao buscar pedidos por cliente ID:", error);
        return res.status(500).json({ 
            error: "Erro interno do servidor ao buscar pedidos." 
        });
    }
});


// =======================================================================
// 🚨 ROTA 5: CADASTRO DE CLIENTE (Adicionado para resolver o 404)
// =======================================================================
app.post('/api/auth/register', async (req, res) => {
    // Campos que esperamos do frontend (os nomes devem corresponder aos do PaginaCadastro.jsx)
    const { email, senha, nome_usuario, data_nascimento, telefone } = req.body;

    // 1. Validação simples
    if (!email || !senha || !nome_usuario || !data_nascimento || !telefone) {
        return res.status(400).json({ error: "Todos os campos de cadastro são obrigatórios." });
    }

    // 2. Lógica para inserção no banco de dados
    try {
        // ATENÇÃO: Em um ambiente de produção real, é OBRIGATÓRIO usar hash de senha (ex: bcrypt)!
        
        // Insere o novo cliente no banco e usa 'RETURNING id' para pegar o ID gerado pelo BD
        const result = await pool.query(
            `INSERT INTO clientes (email, senha, nome_usuario, data_nascimento, telefone)
             VALUES ($1, $2, $3, $4, $5) RETURNING id`,
            [email, senha, nome_usuario, data_nascimento, telefone]
        );

        const clienteId = result.rows[0].id;
        
        // 3. Resposta de sucesso (Status 201 - Created)
        res.status(201).json({ 
            message: "Cadastro realizado com sucesso!",
            clienteId: clienteId 
        });

    } catch (err) {
        console.error('Erro ao cadastrar cliente:', err);
        
        // Verifica se é um erro de duplicidade (assumindo que 'email' tem UNIQUE constraint no BD)
        if (err.code === '23505') { // Código de erro do Postgres para violação de unique constraint
            return res.status(409).json({ error: "Este e-mail já está cadastrado. Tente fazer login." });
        }

        // Erro genérico do servidor
        res.status(500).json({ error: "Erro interno do servidor ao registrar o cliente." });
    }
});


// --- Iniciar o servidor ---
app.listen(PORT, () => {
    console.log(`Backend rodando na porta ${PORT}`);
    console.log(`Callback URL para máquina: ${BACKEND_URL}/api/callback`);
});