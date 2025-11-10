
// services/imageGenerationService.js
import fetch from 'node-fetch';

class ImageGenerationService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.dalleUrl = 'https://api.openai.com/v1/images/generations';
    
    // DEBUG
    console.log('🔧 ImageGenerationService inicializado');
    console.log('🔑 API Key carregada?', !!this.apiKey);
    console.log('🔑 API Key comprimento:', this.apiKey ? this.apiKey.length : 'não carregada');
  }

  async generateSneakerImage(sneakerConfig) {
    try {
      console.log('🔑 Tentando usar API Key:', this.apiKey ? '✅ Existe' : '❌ Não existe');
      
      if (!this.apiKey) {
        throw new Error('API Key da OpenAI não encontrada. Verifique o arquivo .env');
      }

      const prompt = this.buildPrompt(sneakerConfig);
      console.log('🎨 Prompt para DALL-E:', prompt);
      
      console.log('🔄 Fazendo requisição para DALL-E...');
      const response = await fetch(this.dalleUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: prompt,
          n: 1,
          size: "1024x1024",
          quality: "standard"
        })
      });

      console.log('📡 Status da resposta:', response.status);
      console.log('📡 Status text:', response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro DALL-E - Resposta:', errorText);
        throw new Error(`DALL-E API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Resposta DALL-E recebida com sucesso');
      return data.data[0].url;
      
    } catch (error) {
      console.error('❌ Erro ao gerar imagem com DALL-E:', error.message);
      return null;
    }
  }

  buildPrompt(sneakerConfig) {
    const { estilo, material, cor, solado, detalhes } = sneakerConfig;
    
    return `
      Create a REALISTIC and HIGH-RESOLUTION image of a complete sneaker, focusing on the right side view.

Sneaker Characteristics:

Style: ${style}

Material: ${material}

Main Color: ${color}

Sole Type: ${sole}

Details: ${details}

Image Composition:

Perspective: Right side view, capturing the entire sneaker, with a slight frontal tilt to show volume.

Lighting: Professional studio lighting, soft and diffused, with subtle shadows to enhance the depth and texture of the materials. No excessive reflections.

Background: Pure white background (#FFFFFF) and clean, with no distractions.

Realism: Extreme level of detail, with visible material textures, precise stitching, and subtle reflections where applicable, as if it were a high-quality product photograph.
    `;
  }
}

export default new ImageGenerationService();