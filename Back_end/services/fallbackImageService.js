// services/fallbackImageService.js
const FallbackImageService = {
    async generateSneakerImage(sneakerConfig) {
      console.log('🎨 Usando fallback SVG local');
      
      const { cor = 'cinza', estilo = 'sneaker', material = 'couro', solado = 'padrão', detalhes = '' } = sneakerConfig;
      
      // Cores para o fundo do SVG
      const colorMap = {
        'preto': '2c3e50', 'branco': 'ecf0f1', 'vermelho': 'e74c3c',
        'azul': '3498db', 'verde': '2ecc71', 'amarelo': 'f1c40f',
        'rosa': 'e84393', 'cinza': '7f8c8d', 'laranja': 'e67e22',
        'marrom': '8b4513', 'roxo': '9b59b6', 'bege': 'f5f5dc',
        'prata': 'bdc3c7', 'dourado': 'f39c12'
      };
      
      const bgColor = colorMap[cor.toLowerCase()] || '7f8c8d';
      const textColor = ['preto', 'marrom', 'roxo'].includes(cor.toLowerCase()) ? 'ecf0f1' : '2c3e50';
      
      // Criar SVG local personalizado
      const svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
          <!-- Fundo -->
          <rect width="600" height="400" fill="#${bgColor}"/>
          
          <!-- Silhueta do sneaker -->
          <path d="M100 200 Q150 150 250 160 Q350 170 450 180 Q500 200 480 250 Q450 300 350 280 Q250 260 150 250 Q120 230 100 200" 
                fill="#34495e" opacity="0.8"/>
          
          <!-- Detalhes do solado -->
          <path d="M120 250 Q200 240 350 250 Q400 260 450 255 L460 270 Q400 280 300 275 Q200 270 130 265 Z" 
                fill="#2c3e50" opacity="0.9"/>
          
          <!-- Texto informativo -->
          <text x="300" y="320" font-family="Arial, sans-serif" font-size="14" fill="#${textColor}" text-anchor="middle" font-weight="bold">
            ${estilo}
          </text>
          <text x="300" y="340" font-family="Arial, sans-serif" font-size="12" fill="#${textColor}" text-anchor="middle">
            ${material} • ${cor}
          </text>
          <text x="300" y="360" font-family="Arial, sans-serif" font-size="10" fill="#${textColor}" text-anchor="middle" opacity="0.8">
            ${solado} • ${detalhes || 'personalizado'}
          </text>
          
          <!-- Logo SneakerLabs -->
          <text x="300" y="380" font-family="Arial, sans-serif" font-size="10" fill="#${textColor}" text-anchor="middle" opacity="0.6">
            SneakerLabs ✓
          </text>
        </svg>
      `;
      
      // Retornar como data URL (não depende de servidor externo)
      return `data:image/svg+xml;utf8,${encodeURIComponent(svgContent)}`;
    }
  };
  
  export default FallbackImageService;