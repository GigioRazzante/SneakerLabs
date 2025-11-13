// services/imageGenerationService.js - SERVIÇO UNIFICADO COM DEBUG
import falAIService from './falAIService.js';
import fallbackImageService from './fallbackImageService.js';

class ImageGenerationService {
  constructor() {
    this.providers = [
      falAIService,           // Primeira opção - Fal.ai
      fallbackImageService    // Fallback - SVG
    ];
    console.log('🔧 ImageGenerationService inicializado com', this.providers.length, 'provedores');
  }

  async generateSneakerImage(sneakerConfig) {
    console.log('🎯 Iniciando geração de imagem...');
    console.log('🔍 Configuração recebida:', JSON.stringify(sneakerConfig, null, 2));
    
    for (const [index, provider] of this.providers.entries()) {
      try {
        const providerName = provider.constructor.name;
        console.log(`\n🔄 [${index + 1}/${this.providers.length}] Tentando ${providerName}...`);
        
        const image = await provider.generateSneakerImage(sneakerConfig);
        
        if (image) {
          console.log(`✅ Sucesso com ${providerName}`);
          console.log(`🖼️  Tipo de retorno: ${this.getImageType(image)}`);
          return image;
        } else {
          console.log(`⚠️  ${providerName} retornou null, tentando próximo provedor...`);
        }
      } catch (error) {
        console.log(`❌ ${provider.constructor.name} falhou:`, error.message);
        continue;
      }
    }
    
    console.log('💥 TODOS os provedores de imagem falharam');
    return null;
  }

  getImageType(image) {
    if (image.startsWith('http')) return 'URL Externa';
    if (image.includes('data:image/svg')) return 'SVG Fallback';
    if (image.includes('data:image/png')) return 'Base64 PNG';
    if (image.includes('data:image/jpg')) return 'Base64 JPG';
    return 'Tipo Desconhecido';
  }
}

export default new ImageGenerationService();