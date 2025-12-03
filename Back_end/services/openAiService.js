// services/openaiService.js - VERSÃO FREE TIER
import fetch from 'node-fetch';

class OpenAIService {
  constructor() {
    // 🔐 Para free tier, use sua chave normalmente
    this.apiKey = process.env.OPENAI_API_KEY || '';
    this.apiUrl = 'https://api.openai.com/v1/chat/completions';
    
    console.log('🔧 OpenAIService Free Tier inicializado');
    
    if (!this.apiKey) {
      console.log('⚠️  OpenAI não configurada - usando modo local apenas');
      console.log('📝 Obtenha chave grátis em: https://platform.openai.com/api-keys');
    }
  }

  async gerarMensagemPersonalizada(configSneaker, nomeUsuario) {
    try {
      // 🎯 VERIFICAÇÃO FREE TIER
      if (!this.apiKey || this.apiKey.length < 20) {
        console.log('🔶 Usando mensagem local (sem chave OpenAI)');
        return this.mensagemPersonalizadaLocal(configSneaker, nomeUsuario);
      }
      
      console.log(`🤖 OpenAI Free: Gerando para ${nomeUsuario}`);
      
      const prompt = this.criarPromptFreeTier(configSneaker, nomeUsuario);
      
      // 🎯 CONFIGURAÇÃO PARA FREE TIER (otimizada)
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo', // 🎯 GRATUITO
          messages: [
            {
              role: 'system',
              content: 'Você é assistente da SneakLab. Crie mensagens curtas e animadas.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 150, // 🎯 REDUZIDO para free tier
          top_p: 0.9
        }),
        timeout: 10000 // Timeout de 10s
      });

      if (!response.ok) {
        const errorText = await response.text();
        
        // 🎯 TRATAMENTO DE ERROS FREE TIER
        if (response.status === 429) {
          console.log('⏳ Rate limit atingido - usando mensagem local');
        } else if (response.status === 401) {
          console.log('🔐 Chave inválida - usando mensagem local');
        } else {
          console.error(`❌ OpenAI error ${response.status}`);
        }
        
        return this.mensagemPersonalizadaLocal(configSneaker, nomeUsuario);
      }

      const data = await response.json();
      
      if (data.choices && data.choices[0] && data.choices[0].message) {
        const mensagem = data.choices[0].message.content;
        console.log('💌 Mensagem gerada via OpenAI Free');
        return this.limparMensagem(mensagem);
      }
      
      return this.mensagemPersonalizadaLocal(configSneaker, nomeUsuario);
      
    } catch (error) {
      // 🎯 TRATAMENTO DE TIMEOUT/ERROS
      if (error.name === 'TimeoutError' || error.code === 'ECONNABORTED') {
        console.log('⏰ Timeout OpenAI - usando mensagem local');
      } else {
        console.error('❌ Erro OpenAI:', error.message);
      }
      return this.mensagemPersonalizadaLocal(configSneaker, nomeUsuario);
    }
  }

  criarPromptFreeTier(configSneaker, nomeUsuario) {
    const { estilo, material, cor, solado, detalhes } = configSneaker;
    
    // 🎯 PROMPT OTIMIZADO PARA FREE TIER (mais curto)
    return `Crie mensagem para ${nomeUsuario} que criou sneaker:
Estilo: ${estilo}, Material: ${material}, Cor: ${cor}, Solado: ${solado}, Detalhes: ${detalhes}.

Mensagem deve:
1. Cumprimentar ${nomeUsuario}
2. Mencionar 2 características do sneaker
3. Confirmar processamento do pedido
4. Agradecer
5. Ser curta (máx 100 palavras)
6. Usar 1-2 emojis`;
  }

  mensagemPersonalizadaLocal(configSneaker, nomeUsuario) {
    const { estilo, material, cor, solado, detalhes } = configSneaker;
    
    // 🎯 MENSAGENS LOCAIS MELHORADAS
    const templates = {
      'Corrida': `🏃‍♂️ ${nomeUsuario}, que escolha rápida! Seu ${estilo} em ${material} ${cor} com ${detalhes} é pura velocidade. Pedido confirmado!`,
      'Casual': `👟 ${nomeUsuario}, estilo impecável! O ${material} ${cor} combina perfeitamente com ${detalhes}. Já estamos preparando seu pedido!`,
      'Skate': `🛹 ${nomeUsuario}, atitude total! O ${solado} resistente do seu ${estilo} ${cor} vai dominar qualquer pista. Pedido em produção!`,
      'default': `🎉 ${nomeUsuario}, seu ${estilo} ${cor} ficou incrível! Agradecemos pela criatividade e já iniciamos o processamento.`
    };
    
    return templates[estilo] || templates.default;
  }

  limparMensagem(mensagem) {
    return mensagem
      .replace(/^["']|["']$/g, '')
      .replace(/^Resposta:\s*/i, '')
      .trim()
      .substring(0, 300); // Limita tamanho
  }
}

export default new OpenAIService();