import fetch from 'node-fetch';

// URL FIXA do middleware AWS
const MIDDLEWARE_URL = 'http://52.1.197.112:3000';

// Detecta URL do backend automaticamente
const getBackendUrl = () => {
    // Serviços de deploy
    if (process.env.RENDER_EXTERNAL_URL) return process.env.RENDER_EXTERNAL_URL;
    if (process.env.RAILWAY_STATIC_URL) return process.env.RAILWAY_STATIC_URL;
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    if (process.env.HEROKU_APP_NAME) return `https://${process.env.HEROKU_APP_NAME}.herokuapp.com`;
    
    // Variável customizada
    if (process.env.BACKEND_URL) return process.env.BACKEND_URL;
    
    // Fallback para localhost
    const port = process.env.PORT || 3001;
    return `http://localhost:${port}`;
};

const BACKEND_URL = getBackendUrl();

const generateBoxPayload = (orderDetails, pedidoId, produtoDbId) => {
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

    // Extrai os dados do pedido
    const estilo = orderDetails.passoUmDeCinco;
    const material = orderDetails.passoDoisDeCinco;
    const solado = orderDetails.passoTresDeCinco;
    const cor = orderDetails.passoQuatroDeCinco;
    const detalhes = orderDetails.passoCincoDeCinco;

    const numBlocos = styleMap[estilo]?.numBlocos || 1;
    const corMaterial = materialMap[material];
    const padraoSolado = soladoMap[solado];
    const corLamina = corMap[cor];
    const numLaminas = detalhesMap[detalhes];

    // Constrói os objetos de bloco
    const order = {
        codigoProduto: numBlocos, // 1, 2 ou 3 andares
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

    // ID único para rastreamento
    const orderId = `SNK-${pedidoId}-${produtoDbId}-${Date.now().toString().slice(-6)}`;

    return {
        payload: {
            orderId: orderId,
            sku: "KIT-01",
            order: order,
        },
        callbackUrl: `${BACKEND_URL}/api/callback`
    };
};

// Função para enviar para middleware
const enviarParaMiddleware = async (boxPayload) => {
    try {
        console.log(`🚀 Enviando para middleware: ${MIDDLEWARE_URL}/queue/items`);
        
        const response = await fetch(`${MIDDLEWARE_URL}/queue/items`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(boxPayload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ Middleware error ${response.status}:`, errorText);
            throw new Error(`Middleware error ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        console.log(`✅ Middleware respondeu com ID: ${data.id || data._id}`);
        return data;
        
    } catch (error) {
        console.error('❌ Erro ao enviar para middleware:', error.message);
        throw error;
    }
};

// Função para verificar status
const verificarStatusMiddleware = async (middlewareId) => {
    try {
        console.log(`🔍 Verificando status no middleware: ${middlewareId}`);
        
        const response = await fetch(`${MIDDLEWARE_URL}/queue/items/${middlewareId}`);
        
        if (!response.ok) {
            throw new Error(`Erro ao verificar status: ${response.status}`);
        }

        const data = await response.json();
        console.log(`📊 Status: ${data.status}, Progresso: ${data.progress}%`);
        return data;
        
    } catch (error) {
        console.error('❌ Erro ao verificar status:', error.message);
        throw error;
    }
};

export { 
    generateBoxPayload, 
    enviarParaMiddleware,
    verificarStatusMiddleware,
    MIDDLEWARE_URL,
    BACKEND_URL 
};