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
// ROTA 1: RECEBIMENTO DO CARRINHO (FATIAMENTO E ENVIO) - REFATORADO
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
// ROTA 2: CALLBACK DA MÁQUINA DE PRODUÇÃO (RASTREABILIDADE) - NOVO
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
// ROTA 3: BUSCA DE STATUS DO PEDIDO (Para o Frontend Rastrear) - NOVO
// =======================================================================
app.get('/api/orders/:id/status', async (req, res) => {
    const pedidoId = req.params.id;

    try {
        // 1. Obter o status geral do pedido
        const pedidoResult = await pool.query(
            'SELECT status_geral FROM pedidos WHERE id = $1',
            [pedidoId]
        );

        if (pedidoResult.rows.length === 0) {
            return res.status(404).json({ message: "Pedido não encontrado." });
        }
        
        const statusGeral = pedidoResult.rows[0].status_geral;

        // 2. Obter o status e slot de cada produto fatiado
        const produtosResult = await pool.query(
            'SELECT estilo, material, status_producao, slot_expedicao FROM produtos_do_pedido WHERE pedido_id = $1',
            [pedidoId]
        );

        res.status(200).json({
            pedidoId: pedidoId,
            statusGeral: statusGeral,
            produtos: produtosResult.rows.map(row => ({
                configuracao: `${row.estilo} / ${row.material} / ...`, // Simplificado para exibição
                status: row.status_producao,
                slotExpedicao: row.slot_expedicao
            }))
        });

    } catch (err) {
        console.error('Erro ao buscar status do pedido:', err.message);
        res.status(500).json({ error: 'Erro ao buscar status do pedido.' });
    }
});


// --- Iniciar o servidor ---
app.listen(PORT, () => {
    console.log(`Backend rodando na porta ${PORT}`);
    console.log(`Callback URL para máquina: ${BACKEND_URL}/api/callback`);
});
