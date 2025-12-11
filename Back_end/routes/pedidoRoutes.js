// routes/pedidoRoutes.js - VERSÃO ATUALIZADA
import express from 'express';
import { 
    createOrder, 
    getOrderByTrackingCode,
    getClientOrders,
    verificarEstoqueCor
} from '../controllers/pedidoController.js';

const router = express.Router();

// 🚀 ROTAS PRINCIPAIS
router.post('/', createOrder);
router.get('/cliente/:clienteId', getClientOrders);
router.get('/rastreio/:codigoRastreio', getOrderByTrackingCode);
router.get('/estoque/cor/:cor', verificarEstoqueCor);

export default router;