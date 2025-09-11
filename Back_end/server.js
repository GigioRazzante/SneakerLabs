// backend/server.js
import express from 'express';
import cors from 'cors'; // Para permitir requisições do seu frontend (domínios diferentes)
const app = express();
const PORT = 3001; // Porta do seu backend

// Middlewares
app.use(cors()); // Habilita o CORS para permitir requisições do frontend
app.use(express.json()); // Habilita o Express a ler JSON no corpo das requisições

// --- Lógica de Tradução de Pedido para Caixinha ---
const translateOrderToBox = (orderDetails) => {
  const boxConfig = {
    blocos: [],      // Ex: [1, 2, 3] ou ["1 Bloco", "2 Blocos"]
    coresBlocos: [], // Ex: ["Bloco Azul", "Bloco Vermelho"]
    desenhoPlaca: "", // Ex: "Casa", "Estrela", "Barco"
    coresPlacas: [],   // Ex: ["Placa Branca", "Placa Preta"]
    quantidadePlacas: 0,
  };

  // Mapeamento para tradução
  const styleMap = {
    "Casual": { blocos: "1 Bloco" },
    "Corrida": { blocos: "2 Blocos" }, // Mudei "Esportivo" para "Corrida" para combinar com seu frontend
    "Skate": { blocos: "3 Blocos" },
  };

  const materialMap = {
    "Couro": { corBloco: "Bloco Azul" },
    "Camurça": { corBloco: "Bloco Vermelho" },
    "Tecido": { corBloco: "Bloco Preto" },
  };

  const soladoMap = {
    "Borracha": { desenho: "Barco" }, // "Borracha comum" virou "Borracha"
    "EVA": { desenho: "Casa" },
    "Air": { desenho: "Estrela" },
  };

  const corMap = {
    "Branco": { placa: "Placa Branca" },
    "Preto": { placa: "Placa Preta" },
    "Azul": { placa: "Placa Azul" },
    "Vermelho": { placa: "Placa Vermelha" }, // Manteve o preço, ajustado na tradução
    "Verde": { placa: "Placa Verde" },
    "Amarelo": { placa: "Placa Amarela" },
  };

  const detalhesMap = {
    "Cadarço normal": { placas: 3 },
    "Cadarço colorido": { placas: 2 },
    "Sem cadarço": { placas: 1 },
  };

  // Aplica as traduções baseadas nos detalhes do pedido
  if (orderDetails["Passo 1 de 5"]) { // Estilo
    const style = orderDetails["Passo 1 de 5"];
    const mapped = styleMap[style];
    if (mapped) {
      boxConfig.blocos.push(mapped.blocos);
    }
  }

  if (orderDetails["Passo 2 de 5"]) { // Material
    const material = orderDetails["Passo 2 de 5"];
    const mapped = materialMap[material];
    if (mapped) {
      boxConfig.coresBlocos.push(mapped.corBloco);
    }
  }

  if (orderDetails["Passo 3 de 5"]) { // Solado
    const solado = orderDetails["Passo 3 de 5"];
    const mapped = soladoMap[solado];
    if (mapped) {
      boxConfig.desenhoPlaca = mapped.desenho;
    }
  }

  if (orderDetails["Passo 4 de 5"]) { // Cor
    const cor = orderDetails["Passo 4 de 5"];
    const mapped = corMap[cor];
    if (mapped) {
      boxConfig.coresPlacas.push(mapped.placa);
    }
  }

  if (orderDetails["Passo 5 de 5"]) { // Detalhes
    const detalhes = orderDetails["Passo 5 de 5"];
    const mapped = detalhesMap[detalhes];
    if (mapped) {
      boxConfig.quantidadePlacas = mapped.placas;
    }
  }

  return boxConfig;
};// --- Endpoint da API para Pedidos ---
app.post('/api/orders', (req, res) => {
  const orderDetails = req.body; // Recebe os detalhes do pedido do frontend

  if (!orderDetails || Object.keys(orderDetails).length === 0) {
    return res.status(400).json({ message: "Nenhum detalhe de pedido recebido." });
  }

  console.log('Pedido recebido do frontend:', orderDetails);

  // 1. Traduzir o pedido para o formato da "caixinha"
  const boxProductionConfig = translateOrderToBox(orderDetails);
  console.log('Configuração para produção (caixinha):', boxProductionConfig);

  // 2. Simular o envio para produção
  // Em um ambiente real, você enviaria `boxProductionConfig` para:
  // - Um banco de dados (MongoDB, PostgreSQL, etc.)
  // - Uma fila de mensagens (RabbitMQ, Kafka) para ser processado por outro serviço
  // - Um serviço externo de gerenciamento de produção
  // Por agora, vamos apenas logar e retornar uma resposta.

  // Exemplo de como você poderia salvar em um array simples (não persistente)
  // if (!app.locals.productionQueue) {
  //   app.locals.productionQueue = [];
  // }
  // app.locals.productionQueue.push(boxProductionConfig);
  // console.log("Fila de produção atual:", app.locals.productionQueue);

  res.status(200).json({
    message: "Pedido recebido e enviado para produção.",
    originalOrder: orderDetails,
    productionConfig: boxProductionConfig,
  });
});// --- Iniciar o servidor ---
app.listen(PORT, () => {
  console.log(`Backend rodando na porta ${PORT}`);
});
