// controllers/imageGenerationController.js - CORRIGIDO
import imageGenerationService from '../services/imageGenerationService.js';  // ← 'i' minúsculo
import pool from '../config/database.js';
import fs from 'fs/promises';
import path from 'path';

// ... resto do código permanece igual

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

    // 🎯 USA SERVIÇO UNIFICADO (Fal.ai → SVG Fallback)
    console.log('🔄 Iniciando geração de imagem...');
    const imageUrl = await imageGenerationService.generateSneakerImage(sneakerConfig);
    
    if (imageUrl) {
      console.log(`✅ Imagem de preview gerada com sucesso`);
      
      // Determinar a fonte
      let source = 'unknown';
      if (imageUrl.includes('fal-ai')) source = 'fal_ai';
      else if (imageUrl.includes('data:image/svg')) source = 'svg_fallback';
      else if (imageUrl.includes('data:image/png')) source = 'stable_diffusion';
      
      res.json({
        success: true,
        imageUrl: imageUrl,
        pedidoId: pedidoId,
        produtoIndex: produtoIndex,
        source: source,
        message: `Imagem gerada via ${source}`
      });
      
    } else {
      console.log('❌ Falha ao gerar imagem com todos os provedores');
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

// 🎯 FUNÇÃO: Salvar imagem no filesystem (ATUALIZADA para URLs externas)
const saveImageToDisk = async (imageData, pedidoId, produtoId) => {
    try {
      let buffer;
      let fileName;
      
      // Se for URL externa (do Fal.ai), baixa a imagem
      if (imageData.startsWith('http')) {
        console.log('📥 Baixando imagem do Fal.ai...');
        const response = await fetch(imageData);
        if (!response.ok) {
          throw new Error(`Erro ao baixar imagem: ${response.status}`);
        }
        buffer = await response.buffer();
        fileName = `produto_${produtoId}_${Date.now()}.jpg`;
      } 
      // Se for base64 (SVG ou Stable Diffusion)
      else if (imageData.startsWith('data:image')) {
        const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
        buffer = Buffer.from(base64Data, 'base64');
        const extension = imageData.includes('svg') ? 'svg' : 'png';
        fileName = `produto_${produtoId}_${Date.now()}.${extension}`;
      } 
      else {
        throw new Error('Formato de imagem não suportado');
      }
      
      // Cria diretório se não existir
      const uploadDir = path.join(process.cwd(), 'uploads', 'sneakers', pedidoId.toString());
      await fs.mkdir(uploadDir, { recursive: true });
      
      const filePath = path.join(uploadDir, fileName);
      
      // Salva arquivo
      await fs.writeFile(filePath, buffer);
      
      console.log(`💾 Imagem salva em: ${filePath}`);
      
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

// 🎯 FUNÇÃO: Salvar imagem definitiva no pedido (ATUALIZADA)
const saveSneakerImageToOrder = async (req, res) => {
    const { pedidoId, produtoIndex, sneakerConfig } = req.body;

    try {
        console.log(`💾 Salvando imagem DEFINITIVA para pedido ${pedidoId}, produto índice ${produtoIndex}`);
        
        // Validar configuração
        if (!sneakerConfig || Object.keys(sneakerConfig).length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Configuração do sneaker é obrigatória'
            });
        }

        // 🎯 USA SERVIÇO UNIFICADO
        console.log('🔄 Gerando imagem definitiva...');
        const imageData = await imageGenerationService.generateSneakerImage(sneakerConfig);
        
        if (!imageData) {
            console.log('❌ Falha ao gerar imagem com todos os provedores');
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
        const savedImageData = await saveImageToDisk(imageData, pedidoId, produtoId);
        
        if (!savedImageData) {
            throw new Error('Falha ao salvar imagem no servidor');
        }

        // 🎯 SALVAR METADADOS NO BANCO
        await pool.query(
            `UPDATE produtos_do_pedido 
             SET imagem_url = $1, 
                 imagem_nome_arquivo = $2,
                 imagem_caminho = $3,
                 sneaker_config = $4, 
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $5`,
            [
                savedImageData.url,
                savedImageData.fileName,
                savedImageData.filePath,
                JSON.stringify(sneakerConfig),
                produtoId
            ]
        );
        
        console.log('💾 Imagem salva no banco de dados');
        
        res.json({
            success: true,
            imageUrl: savedImageData.url,
            pedidoId: pedidoId,
            produtoId: produtoId,
            produtoIndex: produtoIndex
        });
        
    } catch (error) {
        console.error('❌ Erro ao salvar imagem:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno: ' + error.message
        });
    }
};

// 🎯 FUNÇÃO: Servir imagens dos sneakers (PERMANECE A MESMA)
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

export { 
    generateSneakerImage, 
    saveSneakerImageToOrder, 
    serveSneakerImage 
};