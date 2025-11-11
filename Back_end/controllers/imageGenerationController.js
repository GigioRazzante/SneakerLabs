// controllers/imageGenerationController.js - VERSÃO COMPLETA E CORRIGIDA
import stableDiffusionService from '../services/stableDiffusionService.js';
import fallbackImageService from '../services/fallbackImageService.js';
import pool from '../config/database.js';
import fs from 'fs/promises';
import path from 'path';

// 🎯 FUNÇÃO: Gerar imagem temporária para preview
const generateSneakerImage = async (req, res) => {
  const { pedidoId, produtoIndex, sneakerConfig } = req.body;

  try {
    console.log(`🎨 Gerando imagem TEMPORÁRIA para preview`);
    
    // Validar configuração mínima
    if (!sneakerConfig || Object.keys(sneakerConfig).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Configuração do sneaker é obrigatória'
      });
    }

    // 🎯 GERAR IMAGEM (apenas para preview)
    console.log('🔄 Gerando imagem para preview...');
    let imageUrl = await stableDiffusionService.generateSneakerImage(sneakerConfig);
    
    // Se falhar, usar fallback SVG
    if (!imageUrl) {
      console.log('🔄 Stable Diffusion falhou, usando fallback SVG...');
      imageUrl = await fallbackImageService.generateSneakerImage(sneakerConfig);
    }
    
    if (imageUrl) {
      console.log(`✅ Imagem de preview gerada com sucesso`);
      
      res.json({
        success: true,
        imageUrl: imageUrl,
        pedidoId: pedidoId,
        produtoIndex: produtoIndex,
        source: imageUrl.includes('data:image/svg') ? 'svg_fallback' : 'stable_diffusion'
      });
      
    } else {
      console.log('❌ Falha ao gerar imagem');
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

// 🎯 FUNÇÃO: Salvar imagem no filesystem
const saveImageToDisk = async (base64Image, pedidoId, produtoId) => {
    try {
        // Remove o prefixo data:image/... se existir
        const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        
        // Cria diretório se não existir
        const uploadDir = path.join(process.cwd(), 'uploads', 'sneakers', pedidoId.toString());
        await fs.mkdir(uploadDir, { recursive: true });
        
        // Nome do arquivo
        const fileName = `produto_${produtoId}_${Date.now()}.png`;
        const filePath = path.join(uploadDir, fileName);
        
        // Salva arquivo
        await fs.writeFile(filePath, buffer);
        
        // Retorna dados otimizados
        return {
            url: `/uploads/sneakers/${pedidoId}/${fileName}`,
            fileName: fileName,
            filePath: filePath
        };
    } catch (error) {
        console.error('❌ Erro ao salvar imagem no disco:', error);
        return null;
    }
};

// 🎯 FUNÇÃO: Salvar imagem definitiva no pedido
const saveSneakerImageToOrder = async (req, res) => {
    const { pedidoId, produtoIndex, sneakerConfig } = req.body;

    try {
        console.log(`💾 Salvando imagem OTIMIZADA para pedido ${pedidoId}, produto índice ${produtoIndex}`);
        
        // Validar configuração
        if (!sneakerConfig || Object.keys(sneakerConfig).length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Configuração do sneaker é obrigatória'
            });
        }

        // 🎯 GERAR IMAGEM
        console.log('🔄 Gerando imagem...');
        let imageBase64 = await stableDiffusionService.generateSneakerImage(sneakerConfig);
        
        if (!imageBase64) {
            console.log('🔄 Stable Diffusion falhou, usando fallback SVG...');
            imageBase64 = await fallbackImageService.generateSneakerImage(sneakerConfig);
        }
        
        if (!imageBase64) {
            console.log('❌ Falha ao gerar imagem');
            return res.status(500).json({
                success: false,
                error: 'Não foi possível gerar a imagem'
            });
        }

        // 🎯 ENCONTRAR PRODUTO
        const produtoResult = await pool.query(
            `SELECT id FROM produtos_do_pedido 
             WHERE pedido_id = $1 
             ORDER BY id 
             LIMIT 1 OFFSET $2`,
            [pedidoId, produtoIndex]
        );

        if (produtoResult.rows.length === 0) {
            throw new Error(`Produto não encontrado para pedido ${pedidoId}, índice ${produtoIndex}`);
        }

        const produtoId = produtoResult.rows[0].id;
        console.log(`✅ Produto encontrado: ID ${produtoId}`);

        // 🎯 SALVAR IMAGEM NO FILESYSTEM
        const imageData = await saveImageToDisk(imageBase64, pedidoId, produtoId);
        
        if (!imageData) {
            throw new Error('Falha ao salvar imagem no servidor');
        }

        // 🎯 SALVAR APENAS METADADOS NO BANCO (LEVE)
        await pool.query(
            `UPDATE produtos_do_pedido 
             SET imagem_url = $1, 
                 imagem_nome_arquivo = $2,
                 imagem_caminho = $3,
                 sneaker_config = $4, 
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $5`,
            [
                imageData.url,
                imageData.fileName,
                imageData.filePath,
                JSON.stringify(sneakerConfig),
                produtoId
            ]
        );
        
        console.log('💾 Metadados da imagem salvos no banco (sistema otimizado)');
        
        res.json({
            success: true,
            imageUrl: imageData.url,
            pedidoId: pedidoId,
            produtoId: produtoId,
            produtoIndex: produtoIndex
        });
        
    } catch (error) {
        console.error('❌ Erro ao salvar imagem otimizada:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno: ' + error.message
        });
    }
};

// 🎯 FUNÇÃO: Servir imagens dos sneakers
const serveSneakerImage = async (req, res) => {
    const { pedidoId, produtoId } = req.params;
    
    try {
        console.log(`🖼️  Servindo imagem para pedido ${pedidoId}, produto ${produtoId}`);
        
        // Busca informações do arquivo
        const result = await pool.query(
            `SELECT imagem_caminho, imagem_nome_arquivo, imagem_url 
             FROM produtos_do_pedido 
             WHERE id = $1 AND pedido_id = $2`,
            [produtoId, pedidoId]
        );

        if (result.rows.length === 0) {
            console.log(`❌ Produto ${produtoId} não encontrado no pedido ${pedidoId}`);
            return res.status(404).json({ error: 'Imagem não encontrada' });
        }

        const produto = result.rows[0];
        
        if (!produto.imagem_caminho) {
            console.log(`❌ Caminho da imagem não encontrado para produto ${produtoId}`);
            return res.status(404).json({ error: 'Caminho da imagem não configurado' });
        }

        const filePath = produto.imagem_caminho;
        
        // Verifica se arquivo existe
        try {
            await fs.access(filePath);
            console.log(`✅ Arquivo encontrado: ${filePath}`);
        } catch (error) {
            console.log(`❌ Arquivo não encontrado: ${filePath}`, error.message);
            
            // Tenta fallback para a URL se o caminho físico não existir
            if (produto.imagem_url && produto.imagem_url.startsWith('/uploads/')) {
                const fallbackPath = path.join(process.cwd(), produto.imagem_url);
                console.log(`🔄 Tentando fallback: ${fallbackPath}`);
                
                try {
                    await fs.access(fallbackPath);
                    console.log(`✅ Fallback encontrado: ${fallbackPath}`);
                    return res.sendFile(path.resolve(fallbackPath));
                } catch (fallbackError) {
                    console.log(`❌ Fallback também falhou: ${fallbackPath}`);
                }
            }
            
            return res.status(404).json({ error: 'Arquivo de imagem não encontrado no servidor' });
        }

        // Serve o arquivo
        console.log(`📤 Enviando arquivo: ${filePath}`);
        res.sendFile(path.resolve(filePath));
        
    } catch (error) {
        console.error('❌ Erro ao servir imagem:', error);
        res.status(500).json({ error: 'Erro interno ao carregar imagem' });
    }
};

// 🎯 EXPORTAR TODAS AS FUNÇÕES CORRETAMENTE
export { 
    generateSneakerImage, 
    saveSneakerImageToOrder, 
    serveSneakerImage 
};