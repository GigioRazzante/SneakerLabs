// services/fallbackImageService.js
const FallbackImageService = {
    async generateSneakerImage(sneakerConfig) {
      console.log('🎨 Usando fallback SVG local');
      
      const { cor = 'cinza', estilo = 'sneaker', material = 'couro', solado = 'padrão' } = sneakerConfig;
      
      const colors = {
        'preto': '2c3e50', 'branco': 'ecf0f1', 'vermelho': 'e74c3c',
        'azul': '3498db', 'verde': '2ecc71', 'amarelo': 'f1c40f',
        'rosa': 'e84393', 'cinza': '7f8c8d', 'laranja': 'e67e22',
        'marrom': '8b4513', 'roxo': '9b59b6', 'bege': 'f5f5dc'
      };
      
      const bgColor = colors[cor.toLowerCase()] || '7f8c8d';
      const textColor = ['preto', 'marrom', 'roxo'].includes(cor.toLowerCase()) ? 'ecf0f1' : '2c3e50';
      
      const svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
          <rect width="400" height="300" fill="#${bgColor}"/>
          <text x="200" y="150" font-family="Arial" font-size="16" fill="#${textColor}" text-anchor="middle">
            ${estilo} • ${material}
          </text>
          <text x="200" y="170" font-family="Arial" font-size="14" fill="#${textColor}" text-anchor="middle">
            ${cor} • ${solado}
          </text>
          <text x="200" y="190" font-family="Arial" font-size="12" fill="#${textColor}" text-anchor="middle">
            SneakerLabs - Gerando imagem...
          </text>
        </svg>
      `;
      
      return `data:image/svg+xml;utf8,${encodeURIComponent(svgContent)}`;
    }
  };
  
  export default FallbackImageService;