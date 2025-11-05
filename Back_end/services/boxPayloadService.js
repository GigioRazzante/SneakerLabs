const BACKEND_URL = `http://localhost:3001`;

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

    const numBlocos = styleMap[estilo]?.numBlocos || 1;
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
            orderId: `SNEAKER-TEMP-${Date.now()}`, 
            sku: "KIT-01",
            order: order,
        },
        callbackUrl: `${BACKEND_URL}/api/callback` 
    };
};

export { generateBoxPayload };