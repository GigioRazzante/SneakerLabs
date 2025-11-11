// services/stableDiffusionService.js - CORRIGIDO
import fetch from 'node-fetch';

class StableDiffusionService {
  constructor() {
    this.apiUrl = 'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image';
    console.log('🔧 StableDiffusionService inicializado');
  }

  // 🎯 MUDANÇA: Obter API key apenas quando necessário
  getApiKey() {
    return process.env.STABILITY_AI_API_KEY;
  }

  async generateSneakerImage(sneakerConfig) {
    try {
      const apiKey = this.getApiKey(); // ← Agora lê depois do dotenv carregar
      console.log('🔑 Tentando usar API Key:', apiKey ? '✅ Existe' : '❌ Não existe');
      
      if (!apiKey) {
        throw new Error('API Key da Stability AI não encontrada. Verifique o arquivo .env');
      }

      const prompt = this.buildPrompt(sneakerConfig);
      console.log('📝 Prompt:', prompt);
      
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          text_prompts: [
            {
              text: prompt,
              weight: 1
            }
          ],
          cfg_scale: 7,
          height: 1024,
          width: 1024,
          steps: 30,
          samples: 1,
          style_preset: 'photographic'
        })
      });

      console.log('📡 Status da resposta:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro Stable Diffusion:', errorText);
        throw new Error(`Stable Diffusion API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Imagem gerada com sucesso pelo Stable Diffusion');
      
      // Retorna a imagem em base64
      return `data:image/png;base64,${data.artifacts[0].base64}`;
      
    } catch (error) {
      console.error('❌ Erro ao gerar imagem com Stable Diffusion:', error.message);
      return null;
    }
  }

  buildPrompt(sneakerConfig) {
    const { estilo, material, cor, solado, detalhes } = sneakerConfig;
    
    return `
      professional product photography of a ${estilo} sneaker shoe, 
      ${material} material, ${cor} color, ${solado} sole, ${detalhes},
      studio lighting, white background, hyperrealistic, detailed texture,
      clean composition, full shoe visible, right side view,
      high quality, full HD resolution, commercial product image
    `.replace(/\s+/g, ' ').trim();
  }
}

export default new StableDiffusionService();