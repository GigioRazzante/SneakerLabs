import express from 'express';
import { 
    createOrder, 
    getOrderStatus, 
    getClientOrders,
    getOrderByTrackingCode,           // 🆕 NOVA IMPORT
    getClientOrdersDetailed          // 🆕 NOVA IMPORT
} from '../controllers/pedidoController.js';

const router = express.Router();

// Rotas EXISTENTES (manter para compatibilidade)
router.post('/', createOrder);
router.get('/:id/status', getOrderStatus); // 🚨 DEPRECATED - manter por enquanto
router.get('/cliente/:clienteId', getClientOrders);

// 🎯 NOVAS ROTAS (SEM get por ID)
router.get('/rastreio/:codigoRastreio', getOrderByTrackingCode); // 🆕 Nova rota principal
router.get('/cliente/:clienteId/detalhado', getClientOrdersDetailed); // 🆕 Mais detalhes

export default router;