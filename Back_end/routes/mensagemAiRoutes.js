// Back_end/routes/mensagemAiRoutes.js
import express from 'express';
import { 
  gerarMensagemSneaker,
  salvarMensagemNoPedido,
  obterMensagemPedido
} from '../controllers/mensagemAiController.js';

const router = express.Router();

// 🎯 ROTAS GEMINI
router.post('/gerar', gerarMensagemSneaker);
router.post('/salvar', salvarMensagemNoPedido);
router.get('/obter/:pedidoId/:produtoId', obterMensagemPedido);

// Rota de teste simples
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'API Gemini está funcionando!',
    timestamp: new Date().toISOString(),
    endpoints: {
      gerar: 'POST /api/mensagem-ai/gerar',
      salvar: 'POST /api/mensagem-ai/salvar',
      obter: 'GET /api/mensagem-ai/obter/:pedidoId/:produtoId'
    }
  });
});

export default router;