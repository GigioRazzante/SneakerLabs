import mensagemAiService from '../services/mensagemAiService.js';
import pool from '../config/database.js';

// 🎯 GERAR MENSAGEM PERSONALIZADA
const gerarMensagemSneaker = async (req, res) => {
  const { pedidoId, produtoIndex, sneakerConfig, nomeUsuario } = req.body;

  try {
    console.log(`💬 Solicitando mensagem para ${nomeUsuario}`);
    
    // Validações
    if (!sneakerConfig || Object.keys(sneakerConfig).length === 0) {
      return res.status(400).json({
        sucesso: false,
        erro: 'Configuração do sneaker é obrigatória'
      });
    }

    if (!nomeUsuario) {
      return res.status(400).json({
        sucesso: false,
        erro: 'Nome do usuário é obrigatório'
      });
    }

    console.log('🔄 Gerando mensagem com IA...');
    const mensagemPersonalizada = await mensagemAiService.gerarMensagemPersonalizada(sneakerConfig, nomeUsuario);
    
    console.log(`✅ Mensagem gerada com sucesso para ${nomeUsuario}`);
    
    res.json({
      sucesso: true,
      mensagem: mensagemPersonalizada,
      pedidoId: pedidoId,
      produtoIndex: produtoIndex,
      nomeUsuario: nomeUsuario,
      fonte: 'gemini_ai'
    });
    
  } catch (error) {
    console.error('❌ Erro ao gerar mensagem:', error);
    res.status(500).json({
      sucesso: false,
      erro: 'Erro interno: ' + error.message
    });
  }
};

// 🎯 SALVAR MENSAGEM NO PEDIDO
const salvarMensagemNoPedido = async (req, res) => {
  const { pedidoId, produtoIndex, sneakerConfig, nomeUsuario } = req.body;

  try {
    console.log(`💾 Salvando mensagem no pedido ${pedidoId}`);
    
    if (!sneakerConfig || !nomeUsuario) {
      return res.status(400).json({
        sucesso: false,
        erro: 'Configuração e nome do usuário são obrigatórios'
      });
    }

    // Gerar mensagem
    const mensagemPersonalizada = await mensagemAiService.gerarMensagemPersonalizada(sneakerConfig, nomeUsuario);
    
    // Encontrar produto
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

    // Salvar no banco
    await pool.query(
      `UPDATE produtos_do_pedido 
       SET mensagem_personalizada = $1,
           sneaker_config = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [mensagemPersonalizada, JSON.stringify(sneakerConfig), produtoId]
    );
    
    console.log('💾 Mensagem salva no banco de dados');
    
    res.json({
      sucesso: true,
      mensagem: mensagemPersonalizada,
      pedidoId: pedidoId,
      produtoId: produtoId,
      produtoIndex: produtoIndex
    });
    
  } catch (error) {
    console.error('❌ Erro ao salvar mensagem:', error);
    res.status(500).json({
      sucesso: false,
      erro: 'Erro interno: ' + error.message
    });
  }
};

// 🎯 OBTER MENSAGEM DO PEDIDO
const obterMensagemPedido = async (req, res) => {
  const { pedidoId, produtoId } = req.params;
  
  try {
    console.log(`📨 Buscando mensagem do pedido ${pedidoId}, produto ${produtoId}`);
    
    const result = await pool.query(
      `SELECT mensagem_personalizada, sneaker_config 
       FROM produtos_do_pedido 
       WHERE id = $1 AND pedido_id = $2`,
      [produtoId, pedidoId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        sucesso: false,
        erro: 'Mensagem não encontrada' 
      });
    }

    const produto = result.rows[0];
    
    res.json({
      sucesso: true,
      mensagem: produto.mensagem_personalizada,
      sneakerConfig: produto.sneaker_config
    });
    
  } catch (error) {
    console.error('❌ Erro ao buscar mensagem:', error);
    res.status(500).json({ 
      sucesso: false,
      erro: 'Erro interno ao carregar mensagem' 
    });
  }
};

export { 
  gerarMensagemSneaker,
  salvarMensagemNoPedido, 
  obterMensagemPedido
};