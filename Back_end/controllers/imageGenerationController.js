// controllers/imageGenerationController.js
import imageGenerationService from '../services/imageGenerationService.js';
import fallbackImageService from '../services/fallbackImageService.js';
import pool from '../config/database.js';

const generateSneakerImage = async (req, res) => {
  const { pedidoId, produtoIndex, sneakerConfig } = req.body;

  try {
    console.log(`🎨 Gerando imagem para pedido ${pedidoId}, produto ${produtoIndex}`);
    
    // Validar configuração mínima
    if (!sneakerConfig || Object.keys(sneakerConfig).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Configuração do sneaker é obrigatória'
      });
    }

    // ⚡ SOLUÇÃO: Usar apenas SVG local (sem dependências externas)
    console.log('🔄 Usando SVG local (sem dependências de DNS)');
    const imageUrl = await fallbackImageService.generateSneakerImage(sneakerConfig);
    
    if (imageUrl) {
      // Tentar salvar URL da imagem no banco
      try {
        await pool.query(
          `INSERT INTO sneaker_images (pedido_id, produto_index, image_url, sneaker_config)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (pedido_id, produto_index) 
           DO UPDATE SET image_url = $3, updated_at = CURRENT_TIMESTAMP`,
          [pedidoId, produtoIndex, imageUrl, JSON.stringify(sneakerConfig)]
        );
        console.log('💾 Imagem salva no banco de dados');
      } catch (dbError) {
        console.warn('⚠️ Erro ao salvar no banco (ignorando):', dbError.message);
      }
      
      console.log(`✅ Imagem SVG local gerada com sucesso`);
      
      res.json({
        success: true,
        imageUrl: imageUrl,
        pedidoId: pedidoId,
        produtoIndex: produtoIndex,
        source: 'svg_local'
      });
      
    } else {
      console.log('❌ Falha ao gerar imagem SVG');
      res.status(500).json({
        success: false,
        error: 'Não foi possível gerar a imagem'
      });
    }
    
  } catch (error) {
    console.error('❌ Erro no controller:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno: ' + error.message
    });
  }
};

// ... getSneakerImage permanece igual
const getSneakerImage = async (req, res) => {
  const { pedidoId, produtoIndex } = req.params;

  try {
    const result = await pool.query(
      'SELECT image_url FROM sneaker_images WHERE pedido_id = $1 AND produto_index = $2',
      [pedidoId, produtoIndex]
    );

    if (result.rows.length > 0) {
      res.json({
        success: true,
        imageUrl: result.rows[0].image_url
      });
    } else {
      res.json({
        success: false,
        imageUrl: null
      });
    }
    
  } catch (error) {
    console.error('Erro ao buscar imagem:', error);
    // Não retorna erro, só imagem não encontrada
    res.json({
      success: false,
      imageUrl: null
    });
  }
};

export { generateSneakerImage, getSneakerImage };