// services/geminiService.js - VERSÃO GEMINI API
import fetch from 'node-fetch';
import { geminiConfig, GEMINI_API_URL } from '../config/geminiConfig.js';

class GeminiService {
    constructor() {
        this.apiKey = process.env.GEMINI_API_KEY || '';
        this.model = geminiConfig.model;
        
        console.log('🔧 GeminiService inicializado');
        console.log(`📱 Modelo: ${this.model}`);
        
        if (!this.apiKey) {
            console.log('⚠️ Gemini não configurado - usando modo local');
            console.log('📝 Obtenha chave grátis em: https://makersuite.google.com/app/apikey');
        }
    }

    async gerarMensagemPersonalizada(configSneaker, nomeUsuario) {
        try {
            // 🎯 VERIFICAÇÃO DA API KEY
            if (!this.apiKey || this.apiKey.length < 20) {
                console.log('🔶 Usando mensagem local (sem chave Gemini)');
                return this.mensagemPersonalizadaLocal(configSneaker, nomeUsuario);
            }
            
            console.log(`🤖 Gemini: Gerando mensagem para ${nomeUsuario}`);
            
            const prompt = this.criarPrompt(configSneaker, nomeUsuario);
            
            const response = await fetch(
                `${GEMINI_API_URL}/${this.model}:generateContent?key=${this.apiKey}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: prompt
                            }]
                        }],
                        generationConfig: {
                            temperature: geminiConfig.temperature,
                            maxOutputTokens: geminiConfig.maxTokens,
                            topP: 0.8,
                            topK: 40
                        },
                        safetySettings: [
                            {
                                category: "HARM_CATEGORY_HARASSMENT",
                                threshold: "BLOCK_NONE"
                            },
                            {
                                category: "HARM_CATEGORY_HATE_SPEECH", 
                                threshold: "BLOCK_NONE"
                            }
                        ]
                    }),
                    timeout: 15000 // Timeout de 15s
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                console.error(`❌ Gemini error ${response.status}:`, errorData);
                
                if (response.status === 429) {
                    console.log('⏳ Rate limit atingido - usando mensagem local');
                } else if (response.status === 403 || response.status === 401) {
                    console.log('🔐 Chave inválida ou sem permissão - usando mensagem local');
                }
                
                return this.mensagemPersonalizadaLocal(configSneaker, nomeUsuario);
            }

            const data = await response.json();
            
            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                const mensagem = data.candidates[0].content.parts[0].text;
                console.log('💌 Mensagem gerada via Gemini');
                return this.limparMensagem(mensagem);
            }
            
            return this.mensagemPersonalizadaLocal(configSneaker, nomeUsuario);
            
        } catch (error) {
            // 🎯 TRATAMENTO DE ERROS
            if (error.name === 'TimeoutError' || error.code === 'ECONNABORTED') {
                console.log('⏰ Timeout Gemini - usando mensagem local');
            } else {
                console.error('❌ Erro Gemini:', error.message);
            }
            return this.mensagemPersonalizadaLocal(configSneaker, nomeUsuario);
        }
    }

    criarPrompt(configSneaker, nomeUsuario) {
        const { estilo, material, cor, solado, detalhes } = configSneaker;
        
        return `Você é um assistente da SneakLab, uma empresa de tênis personalizados.
        
Crie uma mensagem personalizada para ${nomeUsuario} que acabou de criar um sneaker personalizado com as seguintes características:

- Estilo: ${estilo}
- Material: ${material}
- Cor: ${cor}
- Solado: ${solado}
- Detalhes: ${detalhes}

A mensagem deve:
1. Cumprimentar ${nomeUsuario} pelo nome
2. Mencionar 2 características específicas do sneaker criado
3. Expressar entusiasmo sobre as escolhas
4. Confirmar que o pedido está sendo processado
5. Agradecer pela preferência
6. Ser curta (80-120 palavras)
7. Usar 1-2 emojis relevantes
8. Ter um tom amigável e profissional

Evite frases genéricas. Seja específico sobre as escolhas do cliente.`;
    }

    mensagemPersonalizadaLocal(configSneaker, nomeUsuario) {
        const { estilo, material, cor, solado, detalhes } = configSneaker;
        
        // 🎯 MENSAGENS LOCAIS MELHORADAS
        const mensagens = {
            'Corrida': `🏃‍♂️ ${nomeUsuario}, que escolha rápida! Seu ${estilo} em ${material} ${cor} com ${detalhes} é pura velocidade. Estamos preparando seu pedido com todo cuidado! Obrigado por escolher a SneakLab.`,
            'Casual': `👟 ${nomeUsuario}, estilo impecável! O ${material} ${cor} combina perfeitamente com ${detalhes}. Já estamos processando seu pedido para entregar um sneaker único. Agradecemos sua criatividade!`,
            'Skate': `🛹 ${nomeUsuario}, atitude total! O ${solado} resistente do seu ${estilo} ${cor} vai dominar qualquer pista. Pedido em produção! Obrigado por confiar na SneakLab.`,
            'default': `🎉 ${nomeUsuario}, seu ${estilo} ${cor} ficou incrível! A combinação de ${material} com ${detalhes} mostra muito estilo. Agradecemos pela criatividade e já iniciamos o processamento do seu pedido na SneakLab!`
        };
        
        return mensagens[estilo] || mensagens.default;
    }

    limparMensagem(mensagem) {
        return mensagem
            .replace(/^["']|["']$/g, '')
            .replace(/^Resposta:\s*/i, '')
            .replace(/^Mensagem:\s*/i, '')
            .trim()
            .substring(0, 300);
    }
}

export default new GeminiService();