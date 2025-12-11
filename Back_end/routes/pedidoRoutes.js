// routes/pedidoRoutes.js - VERSÃO ATUALIZADA
import express from 'express';
import { 
    createOrder, 
    getOrderByTrackingCode,
    getClientOrders,
    verificarEstoqueCor,
    // 🎯 NOVOS ENDPOINTS
    testarIntegracaoQueue,
    sincronizarEstoqueCompleto,
    verificarStatusProducao
} from '../controllers/pedidoController.js';

const router = express.Router();

// 🚀 ROTAS PRINCIPAIS
router.post('/', createOrder);
router.get('/cliente/:clienteId', getClientOrders);
router.get('/rastreio/:codigoRastreio', getOrderByTrackingCode);
router.get('/estoque/cor/:cor', verificarEstoqueCor);

// 🎯 NOVAS ROTAS PARA INTEGRAÇÃO COMPLETA
router.get('/testar-integracao', testarIntegracaoQueue);
router.post('/sincronizar-estoque', sincronizarEstoqueCompleto);
router.get('/status-producao/:pedidoId', verificarStatusProducao);

export default router;