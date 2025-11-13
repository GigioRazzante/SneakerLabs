// services/fallbackImageService.js - VERSÃO HÍBRIDA (Funcional + Realista)
const FallbackImageService = {
  async generateSneakerImage(sneakerConfig) {
    console.log('🎨 Gerando imagem SVG realista e funcional');

    const {
      estilo = 'Casual',
      material = 'Couro',
      cor = 'Branco',
      solado = 'Borracha',
      detalhes = 'Cadarços clássicos'
    } = sneakerConfig;

    // Sistema de cores e materiais (mantido da versão 2.0)
    const styleSystem = {
      colors: {
        preto: { primary: '#1a1a1a', secondary: '#2d2d2d', accent: '#e74c3c', sole: '#000000', stitching: '#fafafa', details: '#ff4d4d' },
        branco: { primary: '#ffffff', secondary: '#f5f5f5', accent: '#3498db', sole: '#2c3e50', stitching: '#7f8c8d', details: '#5faee3' },
        vermelho: { primary: '#e74c3c', secondary: '#c0392b', accent: '#f1c40f', sole: '#b03a2e', stitching: '#fefefe', details: '#ffd700' },
        azul: { primary: '#3498db', secondary: '#2980b9', accent: '#e67e22', sole: '#2c3e50', stitching: '#ecf0f1', details: '#e67e22' },
        verde: { primary: '#27ae60', secondary: '#229954', accent: '#f39c12', sole: '#145a32', stitching: '#ffffff', details: '#f39c12' },
        amarelo: { primary: '#f1c40f', secondary: '#f39c12', accent: '#2c3e50', sole: '#a67c00', stitching: '#2c3e50', details: '#2c3e50' },
        rosa: { primary: '#e84393', secondary: '#fd79a8', accent: '#0984e3', sole: '#c44569', stitching: '#ffffff', details: '#0984e3' },
        cinza: { primary: '#95a5a6', secondary: '#7f8c8d', accent: '#e74c3c', sole: '#2c3e50', stitching: '#ffffff', details: '#e74c3c' },
        laranja: { primary: '#e67e22', secondary: '#d35400', accent: '#2c3e50', sole: '#a04000', stitching: '#ffffff', details: '#2c3e50' },
        marrom: { primary: '#8b4513', secondary: '#5d4037', accent: '#f1c40f', sole: '#3e2723', stitching: '#d7ccc8', details: '#f1c40f' },
        roxo: { primary: '#9b59b6', secondary: '#8e44ad', accent: '#f1c40f', sole: '#6c3483', stitching: '#ffffff', details: '#f1c40f' }
      },
      materials: {
        couro: { pattern: 'leather', texture: 0.3, shine: 0.4 },
        camurça: { pattern: 'suede', texture: 0.6, shine: 0.15 },
        tecido: { pattern: 'fabric', texture: 0.8, shine: 0.05 },
        malha: { pattern: 'knit', texture: 0.9, shine: 0.03 }
      },
      // VOLTANDO para elipses funcionais mas com ajustes de estilo
      styles: {
        casual: { height: 55, width: 125, tongueHeight: 35, tongueWidth: 85 },
        corrida: { height: 50, width: 130, tongueHeight: 30, tongueWidth: 90 },
        skate: { height: 60, width: 120, tongueHeight: 40, tongueWidth: 80 },
        esportivo: { height: 52, width: 128, tongueHeight: 32, tongueWidth: 88 }
      }
    };

    const colors = styleSystem.colors[cor.toLowerCase()] || styleSystem.colors.branco;
    const materialInfo = styleSystem.materials[material.toLowerCase()] || styleSystem.materials.couro;
    const styleInfo = styleSystem.styles[estilo.toLowerCase()] || styleSystem.styles.casual;

    // Posições centrais (usando elipses como na versão funcional)
    const CENTER_X = 250;
    const CENTER_Y = 175;
    const SNEAKER_WIDTH = styleInfo.width;
    const SNEAKER_HEIGHT = styleInfo.height;

    const svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" width="500" height="350" viewBox="0 0 500 350">
        <defs>
          <!-- Gradiente de fundo -->
          <radialGradient id="gradFundo" cx="50%" cy="40%" r="80%">
            <stop offset="0%" stop-color="#fafafa" />
            <stop offset="100%" stop-color="#dcdde1" />
          </radialGradient>

          <!-- Gradiente do corpo do tênis -->
          <linearGradient id="gradCorpo" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${colors.primary}" />
            <stop offset="60%" stop-color="${colors.secondary}" />
            <stop offset="100%" stop-color="${this.adjustColor(colors.primary, 20)}" />
          </linearGradient>

          <!-- Brilho realista -->
          <radialGradient id="brilho" cx="40%" cy="35%" r="60%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="${materialInfo.shine}" />
            <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
          </radialGradient>

          <!-- Pattern de costura -->
          <pattern id="stitching" width="8" height="4" patternUnits="userSpaceOnUse">
            <line x1="1" y1="2" x2="5" y2="2" stroke="${colors.stitching}" stroke-width="1.5" stroke-linecap="round" />
          </pattern>

          <!-- Textura de Couro -->
          <pattern id="leather" width="12" height="12" patternUnits="userSpaceOnUse">
            <rect width="12" height="12" fill="${colors.primary}" />
            <circle cx="3" cy="3" r="0.8" fill="${this.adjustColor(colors.primary, -10)}" opacity="0.3" />
            <circle cx="9" cy="9" r="1" fill="${this.adjustColor(colors.primary, 15)}" opacity="0.2" />
          </pattern>

          <!-- Textura de Tecido -->
          <pattern id="fabric" width="6" height="6" patternUnits="userSpaceOnUse">
            <rect width="6" height="6" fill="${colors.primary}" />
            <path d="M0,0 L6,6 M6,0 L0,6" stroke="${this.adjustColor(colors.primary, 30)}" stroke-width="0.3" opacity="0.3" />
          </pattern>

          <!-- Textura de Malha -->
          <pattern id="knit" width="5" height="10" patternUnits="userSpaceOnUse">
            <path d="M0 0 L5 5 M0 5 L5 10" stroke="${this.adjustColor(colors.primary, -30)}" stroke-width="0.5" opacity="0.3"/>
          </pattern>

          <!-- Textura de Camurça (simplificada) -->
          <pattern id="suede" width="15" height="15" patternUnits="userSpaceOnUse">
            <rect width="15" height="15" fill="${colors.primary}" />
            <circle cx="4" cy="4" r="1.5" fill="${this.adjustColor(colors.primary, -5)}" opacity="0.4" />
            <circle cx="11" cy="11" r="1.2" fill="${this.adjustColor(colors.primary, 5)}" opacity="0.3" />
          </pattern>

          <!-- Sombra suave -->
          <filter id="sombraSuave">
            <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur"/>
            <feOffset in="blur" dx="3" dy="3" result="offsetBlur"/>
            <feMerge>
              <feMergeNode in="offsetBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <!-- Fundo profissional -->
        <rect width="500" height="350" fill="url(#gradFundo)" />

        <!-- Grupo do Tênis -->
        <g filter="url(#sombraSuave)" transform="translate(${CENTER_X - SNEAKER_WIDTH/2}, ${CENTER_Y - SNEAKER_HEIGHT/2})">
          
          <!-- Corpo principal do tênis (ELIPSE FUNCIONAL) -->
          <ellipse cx="${SNEAKER_WIDTH/2}" cy="${SNEAKER_HEIGHT/2}" 
                   rx="${SNEAKER_WIDTH/2}" ry="${SNEAKER_HEIGHT/2}" 
                   fill="url(#gradCorpo)" stroke="${colors.secondary}" stroke-width="1.5" />
          
          <!-- Textura do material -->
          <ellipse cx="${SNEAKER_WIDTH/2}" cy="${SNEAKER_HEIGHT/2}" 
                   rx="${SNEAKER_WIDTH/2}" ry="${SNEAKER_HEIGHT/2}" 
                   fill="url(#${materialInfo.pattern})" opacity="${materialInfo.texture}" />

          <!-- Língua do tênis (ELIPSE) -->
          <ellipse cx="${SNEAKER_WIDTH/2}" cy="${SNEAKER_HEIGHT/2 - 10}" 
                   rx="${styleInfo.tongueWidth/2}" ry="${styleInfo.tongueHeight/2}" 
                   fill="${this.adjustColor(colors.primary, 10)}" stroke="${colors.secondary}" stroke-width="0.8" />

          <!-- Laterais com profundidade -->
          <path d="M${SNEAKER_WIDTH * 0.2} ${SNEAKER_HEIGHT * 0.4} 
                   Q${SNEAKER_WIDTH/2} ${SNEAKER_HEIGHT * 0.3} ${SNEAKER_WIDTH * 0.8} ${SNEAKER_HEIGHT * 0.4}
                   L${SNEAKER_WIDTH * 0.8} ${SNEAKER_HEIGHT * 0.6}
                   Q${SNEAKER_WIDTH/2} ${SNEAKER_HEIGHT * 0.55} ${SNEAKER_WIDTH * 0.2} ${SNEAKER_HEIGHT * 0.6} Z" 
                fill="${colors.secondary}" opacity="0.7" />

          <!-- Sistema de cadarços REALISTA -->
          <g stroke="${colors.accent}" stroke-linecap="round">
            <path d="M${SNEAKER_WIDTH * 0.3} ${SNEAKER_HEIGHT * 0.45} 
                     Q${SNEAKER_WIDTH/2} ${SNEAKER_HEIGHT * 0.4} ${SNEAKER_WIDTH * 0.7} ${SNEAKER_HEIGHT * 0.45}" 
                  stroke-width="5" fill="none" opacity="0.6"/>
            <path d="M${SNEAKER_WIDTH * 0.35} ${SNEAKER_HEIGHT * 0.5} 
                     Q${SNEAKER_WIDTH/2} ${SNEAKER_HEIGHT * 0.45} ${SNEAKER_WIDTH * 0.65} ${SNEAKER_HEIGHT * 0.5}" 
                  stroke-width="4" fill="none" opacity="0.8"/>
            <path d="M${SNEAKER_WIDTH * 0.4} ${SNEAKER_HEIGHT * 0.55} 
                     Q${SNEAKER_WIDTH/2} ${SNEAKER_HEIGHT * 0.5} ${SNEAKER_WIDTH * 0.6} ${SNEAKER_HEIGHT * 0.55}" 
                  stroke-width="3.5" fill="none" opacity="1.0"/>
          </g>

          <!-- Costura decorativa -->
          <path d="M${SNEAKER_WIDTH * 0.25} ${SNEAKER_HEIGHT * 0.7} 
                   Q${SNEAKER_WIDTH/2} ${SNEAKER_HEIGHT * 0.65} ${SNEAKER_WIDTH * 0.75} ${SNEAKER_HEIGHT * 0.7}" 
                fill="none" stroke="url(#stitching)" stroke-width="2" />

          <!-- Brilho final -->
          <ellipse cx="${SNEAKER_WIDTH/2}" cy="${SNEAKER_HEIGHT/2}" 
                   rx="${SNEAKER_WIDTH/2}" ry="${SNEAKER_HEIGHT/2}" 
                   fill="url(#brilho)" />
        </g>

        <!-- Sola (posicionada corretamente) -->
        <ellipse cx="${CENTER_X}" cy="${CENTER_Y + SNEAKER_HEIGHT/2 + 10}" 
                 rx="${SNEAKER_WIDTH/2 + 5}" ry="15" 
                 fill="${colors.sole}" />
        
        <!-- Padrão de grip na sola -->
        <path d="M${CENTER_X - SNEAKER_WIDTH/2} ${CENTER_Y + SNEAKER_HEIGHT/2 + 15} 
                 L${CENTER_X + SNEAKER_WIDTH/2} ${CENTER_Y + SNEAKER_HEIGHT/2 + 15}" 
              stroke="${this.adjustColor(colors.sole, -20)}" stroke-width="1" stroke-dasharray="8 4" opacity="0.5"/>

        <!-- Identidade visual -->
        <text x="250" y="80" font-family="Poppins, Arial, sans-serif" font-size="18" fill="#2c3e50" text-anchor="middle" font-weight="bold">
          SNEAKERLABS
        </text>
        <text x="250" y="96" font-family="Poppins, Arial, sans-serif" font-size="11" fill="#7f8c8d" text-anchor="middle">
          Designer de Tênis Personalizados
        </text>

        <!-- Painel de especificações -->
        <rect x="50" y="280" width="400" height="55" fill="rgba(44,62,80,0.95)" rx="8"/>
        <text x="250" y="295" font-family="Poppins, Arial, sans-serif" font-size="12" fill="#ecf0f1" text-anchor="middle" font-weight="bold">
          ${estilo.toUpperCase()} • ${material.toUpperCase()}
        </text>
        <text x="250" y="310" font-family="Poppins, Arial, sans-serif" font-size="11" fill="#bdc3c7" text-anchor="middle">
          COR: ${cor.toUpperCase()} • SOLADO: ${solado.toUpperCase()}
        </text>
        <text x="250" y="325" font-family="Poppins, Arial, sans-serif" font-size="10" fill="#95a5a6" text-anchor="middle">
          ${detalhes}
        </text>
      </svg>
    `;

    return `data:image/svg+xml;utf8,${encodeURIComponent(svgContent)}`;
  },

  // Ajuste suave de cor
  adjustColor(color, percent) {
    const num = parseInt(color.slice(1), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = ((num >> 8) & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (
      0x1000000 +
      (R < 255 ? (R < 0 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 0 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 0 ? 0 : B) : 255)
    ).toString(16).slice(1);
  }
};

export default FallbackImageService;