import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';

const app = express();
const PORT = 3001;

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
        "Couro": 1, // Bloco Azul
        "Camurça": 2, // Bloco Vermelho
        "Tecido": 3, // Bloco Preto
    };

    const soladoMap = {
        "Borracha": "1", // Barco
        "EVA": "2", // Casa
        "Air": "3", // Estrela
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

    const numBlocos = styleMap[estilo].numBlocos;
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

        // Adiciona as lâminas com base na escolha de "Detalhes" e "Cor"
        if (numLaminas >= 1) {
            bloco.lamina1 = corLamina;
        }
        if (numLaminas >= 2) {
            bloco.lamina2 = corLamina;
        }
        if (numLaminas >= 3) {
            bloco.lamina3 = corLamina;
        }
        
        order[`bloco${i}`] = bloco;
    }

    return {
        payload: {
            orderId: `SNEAKER-LAB-${Date.now()}`,
            sku: "KIT-01",
            order: order,
        },
        callbackUrl: "http://localhost:3333/callback"
    };
};

// --- Endpoint da API para Pedidos ---
app.post('/api/orders', async (req, res) => {
    const orderDetails = req.body;

    if (!orderDetails || Object.keys(orderDetails).length === 0) {
        return res.status(400).json({ message: "Nenhum detalhe de pedido recebido." });
    }

    console.log('Pedido recebido do frontend:', orderDetails);

    const estilo = orderDetails.passoUmDeCinco;
    const material = orderDetails.passoDoisDeCinco;
    const solado = orderDetails.passoTresDeCinco;
    const cor = orderDetails.passoQuatroDeCinco;
    const detalhes = orderDetails.passoCincoDeCinco;

    try {
        // 1. Salvar o pedido original no banco de dados
        const result = await pool.query(
            'INSERT INTO pedidos (estilo, material, solado, cor, detalhes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [estilo, material, solado, cor, detalhes]
        );
        console.log('Pedido salvo no banco de dados:', result.rows[0]);

        // 2. Traduzir o pedido para o novo formato de payload da caixa
        const boxProductionPayload = generateBoxPayload(orderDetails);
        console.log('Payload para produção (caixinha):', JSON.stringify(boxProductionPayload, null, 2));

        // 3. Enviar o payload para o servidor de produção
        const productionResponse = await fetch('http://52.1.197.112:3000/queue/items', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(boxProductionPayload),
        });

        if (!productionResponse.ok) {
            throw new Error(`Erro na API de produção: ${productionResponse.statusText}`);
        }

        const productionData = await productionResponse.json();
        console.log('Resposta da API de produção:', productionData);

        // 4. Enviar a resposta de sucesso de volta para o front-end
        res.status(200).json({
            message: "Pedido recebido, salvo e enviado para produção.",
            originalOrder: orderDetails,
            productionId: productionData.id, // ID para rastrear o pedido
        });

    } catch (err) {
        console.error('Erro ao processar o pedido:', err.message);
        res.status(500).json({ error: 'Erro ao processar o pedido. Por favor, tente novamente.' });
    }
});

// --- Iniciar o servidor ---
app.listen(PORT, () => {
    console.log(`Backend rodando na porta ${PORT}`);
});