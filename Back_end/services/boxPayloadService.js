// services/boxPayloadService.js - VERSÃO COMPATÍVEL
import fetch from 'node-fetch';

const MIDDLEWARE_URL = 'http://52.72.137.244:3000';
const CALLBACK_URL = 'https://sneakerslab-backend.onrender.com/api/callback';

// Funções mantidas para compatibilidade
const generateBoxPayload = (orderDetails, pedidoId, produtoDbId) => {
    const orderId = `SNK-${pedidoId}-${produtoDbId}`;
    const cor = (orderDetails.passoQuatroDeCinco || 'branco').toLowerCase();
    
    return {
        payload: {
            orderId: orderId,
            sku: "SNK-01",
            cor: cor
        },
        callbackUrl: CALLBACK_URL,
        estoquePos: null
    };
};

const enviarParaMiddleware = async (boxPayload) => {
    try {
        const response = await fetch(`${MIDDLEWARE_URL}/queue/items`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(boxPayload)
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Erro ${response.status}: ${error}`);
        }

        return await response.json();
    } catch (error) {
        console.error('❌ Erro:', error.message);
        throw error;
    }
};

// Função de teste
const testarConexao = async () => {
    try {
        const response = await fetch(`${MIDDLEWARE_URL}/health`);
        const data = await response.json();
        return { success: true, status: data.status };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export { 
    generateBoxPayload, 
    enviarParaMiddleware,
    testarConexao
};