// controllers/mensagemAiController.js
import openaiService from '../services/openaiService.js';
import pool from '../config/database.js';

// 🎯 GERAR MENSAGEM
const gerarMensagemSneaker = async (req, res) => {
  const { pedidoId, produtoIndex, sneakerConfig, nomeUsuario } = req.body;

  try {
    console.log(`💬 IA: ${nomeUsuario}`);
    
    if (!sneakerConfig || !nomeUsuario) {
      return res.status(400).json({
        sucesso: false,
        erro: 'Dados obrigatórios faltando'
      });
    }

    console.log('🔄 Processando...');
    
    const mensagem = await openaiService.gerarMensagemPersonalizada(
      sneakerConfig, 
      nomeUsuario
    );
    
    console.log(`✅ Mensagem pronta`);
    
    res.json({
      sucesso: true,
      mensagem: mensagem,
      pedidoId: pedidoId,
      produtoIndex: produtoIndex,
      nomeUsuario: nomeUsuario,
      fonte: process.env.OPENAI_API_KEY ? 'openai' : 'local'
    });
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    
    // Fallback local
    const mensagemFallback = `🎉 ${nomeUsuario || 'Cliente'}, seu sneaker personalizado ficou incrível! As escolhas de ${sneakerConfig?.estilo || 'estilo'} combinam perfeitamente. Obrigado por criar conosco no SneakLab!`;
    
    res.json({
      sucesso: true,
      mensagem: mensagemFallback,
      pedidoId: pedidoId,
      produtoIndex: produtoIndex,
      nomeUsuario: nomeUsuario,
      fonte: 'fallback'
    });
  }
};

// 🎯 SALVAR MENSAGEM
const salvarMensagemNoPedido = async (req, res) => {
  const { pedidoId, produtoIndex, sneakerConfig, nomeUsuario } = req.body;

  try {
    console.log(`💾 Salvando no pedido ${pedidoId}`);
    
    if (!sneakerConfig || !nomeUsuario) {
      return res.status(400).json({
        sucesso: false,
        erro: 'Dados obrigatórios faltando'
      });
    }

    const mensagem = await openaiService.gerarMensagemPersonalizada(
      sneakerConfig, 
      nomeUsuario
    );
    
    const produtoResult = await pool.query(
      `SELECT id FROM produtos_do_pedido 
       WHERE pedido_id = $1 
       ORDER BY id LIMIT 1 OFFSET $2`,
      [pedidoId, produtoIndex]
    );

    if (produtoResult.rows.length === 0) {
      return res.status(404).json({
        sucesso: false,
        erro: 'Produto não encontrado'
      });
    }

    const produtoId = produtoResult.rows[0].id;

    await pool.query(
      `UPDATE produtos_do_pedido 
       SET mensagem_personalizada = $1,
           sneaker_config = $2
       WHERE id = $3`,
      [mensagem, JSON.stringify(sneakerConfig), produtoId]
    );
    
    res.json({
      sucesso: true,
      mensagem: mensagem,
      pedidoId: pedidoId,
      produtoId: produtoId
    });
    
  } catch (error) {
    console.error('❌ Erro ao salvar:', error);
    res.status(500).json({
      sucesso: false,
      erro: 'Erro interno'
    });
  }
};

// 🎯 OBTER MENSAGEM
const obterMensagemPedido = async (req, res) => {
  const { pedidoId, produtoId } = req.params;
  
  try {
    const result = await pool.query(
      `SELECT mensagem_personalizada, sneaker_config 
       FROM produtos_do_pedido 
       WHERE id = $1 AND pedido_id = $2`,
      [produtoId, pedidoId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        sucesso: false,
        erro: 'Não encontrado' 
      });
    }

    res.json({
      sucesso: true,
      mensagem: result.rows[0].mensagem_personalizada,
      sneakerConfig: result.rows[0].sneaker_config
    });
    
  } catch (error) {
    res.status(500).json({ 
      sucesso: false,
      erro: 'Erro interno' 
    });
  }
};

export { 
  gerarMensagemSneaker,
  salvarMensagemNoPedido, 
  obterMensagemPedido
};