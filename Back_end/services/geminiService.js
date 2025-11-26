import fetch from 'node-fetch';

class geminiService {
  constructor() {
    this.apiKey = 'AIzaSyCr3VrDW_K5rqaih0CKKDFcrSa1Zzr8hDU';
    this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
    console.log('🔧 GeminiService inicializado');
  }

  async generateSneakerMessage(sneakerConfig, userName) {
    try {
      console.log('💬 Gerando mensagem personalizada com Gemini');
      
      const prompt = this.buildPrompt(sneakerConfig, userName);
      console.log('📝 Prompt para Gemini:', prompt);

      const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 200,
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro Gemini:', errorText);
        return this.getFallbackMessage(sneakerConfig, userName);
      }

      const data = await response.json();
      console.log('✅ Resposta Gemini recebida');

      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const message = data.candidates[0].content.parts[0].text;
        console.log('💌 Mensagem gerada:', message);
        return message.trim();
      } else {
        console.log('❌ Resposta inesperada do Gemini:', data);
        return this.getFallbackMessage(sneakerConfig, userName);
      }
      
    } catch (error) {
      console.error('❌ Erro ao gerar mensagem com Gemini:', error);
      return this.getFallbackMessage(sneakerConfig, userName);
    }
  }

  buildPrompt(sneakerConfig, userName) {
    const { 
      estilo = 'Casual',
      material = 'Couro', 
      cor = 'Branco',
      solado = 'Borracha',
      detalhes = 'clássicos'
    } = sneakerConfig;

    return `
Como assistente da SneakLab, crie uma mensagem personalizada e entusiasmada para ${userName} que acabou de criar um sneaker personalizado.

Configuração do sneaker:
- Estilo: ${estilo}
- Material: ${material}
- Cor: ${cor}
- Solado: ${solado}
- Detalhes: ${detalhes}

A mensagem deve:
1. Cumprimentar ${userName} pelo nome
2. Destacar as escolhas específicas feitas
3. Transmitir entusiasmo sobre o resultado
4. Confirmar que o pedido está sendo processado
5. Agradecer pela preferência
6. Manter tom amigável e profissional
7. Ter no máximo 3 parágrafos curtos

Escreva apenas a mensagem final, sem marcações ou formatação.
`;
  }

  getFallbackMessage(sneakerConfig, userName) {
    const { estilo, material, cor, solado, detalhes } = sneakerConfig;
    
    return `Excelente, ${userName}! Suas escolhas foram incríveis: um sneaker ${estilo} em ${material} na cor ${cor}, com solado ${solado} e ${detalhes}. Seu design personalizado está perfeito! 🎉

Em breve seu Sneaker estará pronto e a caminho. Obrigado por criar conosco no SneakLab!`;
  }
}

export default new geminiService();