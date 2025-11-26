import express from 'express';
import { 
  gerarMensagemSneaker,
  salvarMensagemNoPedido, 
  obterMensagemPedido
} from '../controllers/mensagemAiController.js';

const router = express.Router();

// 🎯 ROTAS DE MENSAGEM IA
router.post('/gerar-mensagem', gerarMensagemSneaker);
router.post('/salvar-no-pedido', salvarMensagemNoPedido);
router.get('/:pedidoId/:produtoId', obterMensagemPedido);

export default router;