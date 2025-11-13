// services/falAIService.js - CORRIGIDO
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

class FalAIService {
  constructor() {
    this.apiUrl = 'https://queue.fal.run/fal-ai/fast-sdxl';
    this.apiKey = process.env.FAL_AI_KEY;
    console.log('🔧 FalAIService inicializado');
  }

  async generateSneakerImage(sneakerConfig) {
    try {
      console.log('🎨 Tentando Fal.ai com configuração:', sneakerConfig);
      
      if (!this.apiKey) {
        console.log('❌ FAL_AI_KEY não encontrada no .env');
        return null;
      }

      const prompt = this.buildPrompt(sneakerConfig);
      console.log('📝 Prompt enviado para Fal.ai:', prompt);

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Key ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          image_size: "square_hd",
          num_images: 1
        })
      });

      console.log('📡 Status da resposta Fal.ai:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro Fal.ai:', errorText);
        return null;
      }

      const data = await response.json();
      console.log('✅ Resposta Fal.ai recebida');
      
      // 🔧 CORREÇÃO: Verificar se a resposta tem imagens
      if (data.images && data.images.length > 0 && data.images[0].url) {
        console.log('🖼️  URL da imagem gerada:', data.images[0].url);
        return data.images[0].url;
      } else {
        console.log('❌ Nenhuma imagem válida na resposta:', data);
        return null;
      }
      
    } catch (error) {
      console.error('❌ Erro ao gerar imagem com Fal.ai:', error);
      return null;
    }
  }

  buildPrompt(sneakerConfig) {
    // 🎯 CORREÇÃO: Use os nomes CORRETOS que estão chegando do frontend
    const { 
      estilo,      // ← CORREÇÃO: estava passoUmDeCinco
      material,    // ← CORREÇÃO: estava passoDoisDeCinco
      solado,      // ← CORREÇÃO: estava passoTresDeCinco
      cor,         // ← CORREÇÃO: estava passoQuatroDeCinco
      detalhes     // ← CORREÇÃO: estava passoCincoDeCinco
    } = sneakerConfig;
    
    console.log('🔍 Mapeamento de propriedades:', {
      estilo, material, solado, cor, detalhes
    });
    
    // 🎯 CORREÇÃO: Valores padrão para evitar "undefined"
    const estiloFinal = estilo || 'sneaker';
    const materialFinal = material || 'material';
    const soladoFinal = solado || 'sole';
    const corFinal = cor || 'white';
    const detalhesFinal = detalhes || 'details';
    
    return `
      professional product photography of ${estiloFinal} sneakers, 
      made of ${materialFinal} material, with ${soladoFinal} sole, 
      ${corFinal} color, ${detalhesFinal},
      studio lighting, clean white background, hyperrealistic, 
      detailed texture, commercial product image, full shoe visible,
      high quality, 4K resolution, sharp focus, product design
    `.replace(/\s+/g, ' ').trim();
  }
}

export default new FalAIService();