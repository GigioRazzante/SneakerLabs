import express from 'express';
import cors from 'cors';

// Importação das rotas
import authRoutes from './routes/authRoutes.js';
import clienteRoutes from './routes/clienteRoutes.js';
import pedidoRoutes from './routes/pedidoRoutes.js';
import producaoRoutes from './routes/producaoRoutes.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Configuração das rotas
app.use('/api/auth', authRoutes);
app.use('/api/cliente', clienteRoutes);
app.use('/api/orders', pedidoRoutes);
app.use('/api', producaoRoutes);

// Rota de health check
app.get('/api/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        message: 'Backend SneakerLabs funcionando!',
        timestamp: new Date().toISOString()
    });
});

<<<<<<< HEAD
=======
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
// ROTA 1: RECEBIMENTO DO CARRINHO (FATIAMENTO E ENVIO) - CORRIGIDA COM VALOR
// =======================================================================
app.post('/api/orders', async (req, res) => {
    const { clienteId, produtos } = req.body;

    console.log('=== 📦 INICIANDO PROCESSAMENTO DO PEDIDO ===');
    console.log(`Cliente ID recebido do frontend: ${clienteId}`);
    console.log(`Número de produtos: ${produtos ? produtos.length : 0}`);
    console.log('Produtos recebidos:', JSON.stringify(produtos, null, 2));

    // ✅ VALIDAR SE clienteId FOI ENVIADO
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

        // 🚨 CALCULAR VALOR TOTAL DO PEDIDO
        const valorTotalPedido = produtos.reduce((total, produto) => {
            return total + (produto.valor || 0);
        }, 0);
        
        console.log(`💰 Valor total do pedido: R$ ${valorTotalPedido.toFixed(2)}`);

        // 2. Salvar o Pedido Mestre (Tabela 'pedidos') COM VALOR TOTAL
        console.log(`💾 Salvando pedido mestre para cliente ${clienteId}...`);
        const pedidoMestreResult = await pool.query(
            'INSERT INTO pedidos (cliente_id, status_geral, valor_total) VALUES ($1, $2, $3) RETURNING id',
            [clienteId, 'PENDENTE', valorTotalPedido]
        );
        const pedidoId = pedidoMestreResult.rows[0].id;
        console.log(`✅ Pedido mestre criado: ID ${pedidoId} - Valor: R$ ${valorTotalPedido.toFixed(2)}`);
        
        const produtosEnviados = [];

        // 3. FATIAMENTO E ENVIO (Iterar sobre cada produto do carrinho)
        for (const [index, produto] of produtos.entries()) {
            const orderDetails = produto.configuracoes;
            const valorUnitario = produto.valor || 0; // 🚨 CAPTURAR VALOR DO PRODUTO

            console.log(`\n📋 Processando produto ${index + 1}/${produtos.length}:`);
            console.log('Configurações recebidas:', orderDetails);
            console.log(`💰 Valor do produto: R$ ${valorUnitario.toFixed(2)}`);

            // Validar que todos os campos obrigatórios estão presentes
            const camposObrigatorios = ['passoUmDeCinco', 'passoDoisDeCinco', 'passoTresDeCinco', 'passoQuatroDeCinco', 'passoCincoDeCinco'];
            const camposFaltantes = camposObrigatorios.filter(campo => !orderDetails[campo]);
            
            if (camposFaltantes.length > 0) {
                console.log(`❌ Campos faltantes: ${camposFaltantes.join(', ')}`);
                throw new Error(`Campos obrigatórios faltantes: ${camposFaltantes.join(', ')}`);
            }

            console.log(`✅ Todos os campos presentes:`, camposObrigatorios.map(campo => `${campo}: ${orderDetails[campo]}`));

            try {
                // 3.1. Salvar o Produto Individual (Tabela 'produtos_do_pedido') COM VALOR
                console.log(`💾 Tentando salvar produto no banco...`);
                
                const produtoSalvoResult = await pool.query(
                    `INSERT INTO produtos_do_pedido (
                        pedido_id, estilo, material, solado, cor, detalhes, status_producao, valor_unitario
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
                    [
                        pedidoId, 
                        orderDetails.passoUmDeCinco, 
                        orderDetails.passoDoisDeCinco,
                        orderDetails.passoTresDeCinco,
                        orderDetails.passoQuatroDeCinco,
                        orderDetails.passoCincoDeCinco,
                        'FILA', // Status inicial
                        valorUnitario // 🚨 SALVAR VALOR UNITÁRIO
                    ]
                );
                
                const produtoDbId = produtoSalvoResult.rows[0].id;
                console.log(`✅ Produto salvo com ID: ${produtoDbId} - Valor: R$ ${valorUnitario.toFixed(2)}`);

                // ... resto do código permanece igual para envio à produção
                // 3.2. Traduzir e Enviar para Produção
                console.log(`🔄 Traduzindo para payload da caixa...`);
                const boxProductionPayload = generateBoxPayload(orderDetails);
                
                console.log(`🚀 Enviando produto DB ID ${produtoDbId} para produção...`);

                const productionResponse = await fetch(PROD_API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(boxProductionPayload),
                });

                if (!productionResponse.ok) {
                    await pool.query('UPDATE produtos_do_pedido SET status_producao = $1 WHERE id = $2', ['FALHA_ENVIO', produtoDbId]);
                    throw new Error(`Erro ao enviar produto ${produtoDbId}: ${productionResponse.statusText}`);
                }

                const productionData = await productionResponse.json();
                const rastreioId = productionData.id;
                console.log(`✅ Produto enviado para produção. Rastreio ID: ${rastreioId}`);

                // 3.3. Salvar o ID de Rastreio da Máquina
                await pool.query(
                    'UPDATE produtos_do_pedido SET id_rastreio_maquina = $1 WHERE id = $2',
                    [rastreioId, produtoDbId]
                );

                produtosEnviados.push({ 
                    produtoDbId, 
                    rastreioId,
                    valor: valorUnitario,
                    status: 'ENVIADO'
                });

            } catch (produtoError) {
                console.error(`❌ Erro ao processar produto ${index + 1}:`, produtoError);
                throw produtoError;
            }
        }

        // 4. Resposta de sucesso para o Frontend
        console.log(`🎉 Pedido #${pedidoId} processado com sucesso! ${produtosEnviados.length} produtos enviados. Valor total: R$ ${valorTotalPedido.toFixed(2)}`);
        res.status(200).json({
            message: `Pedido #${pedidoId} recebido e ${produtosEnviados.length} produtos enviados para produção.`,
            pedidoId: pedidoId,
            valorTotal: valorTotalPedido,
            produtosEnviados: produtosEnviados,
        });

    } catch (err) {
        console.error('❌ ERRO DETALHADO ao processar o carrinho:');
        console.error('Mensagem:', err.message);
        console.error('Stack trace completo:', err.stack);
        
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
// ROTA 3: BUSCA DE STATUS DO PEDIDO (Para o Frontend Rastrear) - COM LOGS
// =======================================================================
app.get('/api/orders/:id/status', async (req, res) => {
    const pedidoId = req.params.id;
    
    // 🚨 CORREÇÃO: Verificar tanto x-client-id quanto client-id
    const clienteId = req.headers['x-client-id'] || req.headers['client-id'];

    console.log(`🔍 [RASTREIO] Buscando status do pedido ${pedidoId} para cliente: ${clienteId}`);

    try {
        // 🚨 VERIFICAÇÃO DE AUTORIZAÇÃO
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
        
        // 🚨 VERIFICAÇÃO CRÍTICA
        if (parseInt(cliente_id) !== parseInt(clienteId)) {
            console.log(`❌ Acesso negado: pedido pertence ao cliente ${cliente_id}, solicitante é ${clienteId}`);
            return res.status(403).json({ 
                message: "Acesso negado. Este pedido não pertence ao seu usuário." 
            });
        }

        // 2. Obter produtos do pedido
        const produtosResult = await pool.query(
            'SELECT estilo, material, status_producao, slot_expedicao, id_rastreio_maquina FROM produtos_do_pedido WHERE pedido_id = $1',
            [pedidoId]
        );

        // 🚨 LOG CRÍTICO - ESTE É O QUE PRECISAMOS VER
        console.log(`📊 [RASTREIO] Dados retornados para pedido ${pedidoId}:`, {
            statusGeral: status_geral,
            produtos: produtosResult.rows.map(p => ({
                estilo: p.estilo,
                material: p.material,
                status_producao: p.status_producao,
                slot_expedicao: p.slot_expedicao,
                id_rastreio_maquina: p.id_rastreio_maquina
            }))
        });

        console.log(`✅ [RASTREIO] Pedido ${pedidoId} autorizado para cliente ${clienteId}`);

        res.status(200).json({
            pedidoId: pedidoId,
            statusGeral: status_geral,
            dataCriacao: data_criacao,
            produtos: produtosResult.rows.map(row => ({
                configuracao: `${row.estilo} / ${row.material}`,
                status: row.status_producao,
                slotExpedicao: row.slot_expedicao,
                rastreioId: row.id_rastreio_maquina
            }))
        });

    } catch (err) {
        console.error('❌ [RASTREIO] Erro ao buscar status do pedido:', err.message);
        res.status(500).json({ error: 'Erro ao buscar status do pedido.' });
    }
});
// =======================================================================
// ROTA 4: LISTA TODOS OS PEDIDOS DO CLIENTE (Para o Frontend MeusPedidos) - CORRIGIDA
// =======================================================================
app.get('/api/orders/cliente/:clienteId', async (req, res) => {
    const { clienteId } = req.params;

    try {
        console.log(`📦 Buscando pedidos para cliente ID: ${clienteId}`);
        
        // 🚨 CORREÇÃO: Usar o valor_total real da tabela pedidos em vez de calcular
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
});
// =======================================================================
// ROTA 5: CADASTRO DE CLIENTE
// =======================================================================
app.post('/api/auth/register', async (req, res) => {
    const { email, senha, nome_usuario, data_nascimento, telefone } = req.body;

    // 1. Validação simples
    if (!email || !senha || !nome_usuario || !data_nascimento || !telefone) {
        return res.status(400).json({ error: "Todos os campos de cadastro são obrigatórios." });
    }

    try {
        // 2. Lógica para inserção no banco de dados
        const result = await pool.query(
            `INSERT INTO clientes (email, senha, nome_usuario, data_nascimento, telefone)
             VALUES ($1, $2, $3, $4, $5) RETURNING id`,
            [email, senha, nome_usuario, data_nascimento, telefone]
        );

        const clienteId = result.rows[0].id;
        
        // 3. Resposta de sucesso
        res.status(201).json({ 
            message: "Cadastro realizado com sucesso!",
            clienteId: clienteId 
        });

    } catch (err) {
        console.error('Erro ao cadastrar cliente:', err);
        
        // Verifica se é um erro de duplicidade
        if (err.code === '23505') {
            return res.status(409).json({ error: "Este e-mail já está cadastrado. Tente fazer login." });
        }

        res.status(500).json({ error: "Erro interno do servidor ao registrar o cliente." });
    }
});
// =======================================================================
// ROTA 6: LOGIN DE CLIENTE
// =======================================================================
app.post('/api/auth/login', async (req, res) => {
    const { email, senha } = req.body; // Recebe o email e a senha do frontend

    if (!email || !senha) {
        return res.status(400).json({ error: "E-mail e senha são obrigatórios." });
    }

    try {
        // 1. Busca o cliente pelo e-mail
        const result = await pool.query(
            'SELECT id, senha FROM clientes WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            // Cliente não encontrado
            return res.status(401).json({ error: "E-mail não cadastrado." });
        }

        const cliente = result.rows[0];
        
        // 2. Compara a senha (Atenção: AQUI ESTÁ A FALHA DE SEGURANÇA! 
        // Em um sistema real, você usaria bcrypt. Aqui, comparamos texto puro.)
        const senhaCorreta = (senha === cliente.senha); // Comparação simples

        if (senhaCorreta) {
            // 3. Login bem-sucedido
            res.status(200).json({
                message: "Login bem-sucedido!",
                clienteId: cliente.id // Retorna o ID para o frontend
            });
        } else {
            // 4. Senha incorreta
            return res.status(401).json({ error: "Senha incorreta." });
        }

    } catch (err) {
        console.error('Erro ao processar login:', err);
        res.status(500).json({ error: "Erro interno do servidor ao tentar fazer login." });
    }
});


// =======================================================================
// ROTA 7: BUSCAR DADOS DO CLIENTE
// =======================================================================
app.get('/api/cliente/:id', async (req, res) => {
    // 💡 A variável 'req.params.id' é usada para capturar o valor dinâmico ':id' na URL.
    const clienteId = req.params.id; 

    try {
        // 1. Defina a query SQL para selecionar os campos necessários
        // Nota: Nunca inclua a senha (senha) em uma rota de leitura de dados do cliente.
        const result = await pool.query(
            `SELECT nome_usuario, email, data_nascimento, telefone 
             FROM clientes 
             WHERE id = $1`,
            [clienteId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Cliente não encontrado." });
        }

        // 2. Se encontrado, retorne o primeiro (e único) resultado
        res.status(200).json(result.rows[0]);

    } catch (err) {
        console.error('Erro ao buscar dados do cliente:', err);
        res.status(500).json({ error: "Erro interno do servidor ao buscar dados." });
    }
});
// =======================================================================
// ROTA 8: ATUALIZAR DADOS DO CLIENTE
// =======================================================================
app.put('/api/cliente/:id', async (req, res) => {
    const clienteId = req.params.id;
    const { nome_usuario, data_nascimento, telefone } = req.body;

    // Validação básica
    if (!nome_usuario || !data_nascimento || !telefone) {
        return res.status(400).json({ error: "Todos os campos são obrigatórios." });
    }

    try {
        const result = await pool.query(
            `UPDATE clientes 
             SET nome_usuario = $1, data_nascimento = $2, telefone = $3 
             WHERE id = $4 
             RETURNING id, nome_usuario, email, data_nascimento, telefone`,
            [nome_usuario, data_nascimento, telefone, clienteId]
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
});

// --- Iniciar o servidor ---
>>>>>>> a039c4ab6ab36a33f99f3b4dd3b1ce3be711b153
app.listen(PORT, () => {
    console.log(`🚀 Backend rodando na porta ${PORT}`);
    console.log(`📞 Health check: http://localhost:${PORT}/api/health`);
});