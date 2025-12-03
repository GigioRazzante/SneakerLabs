import express from 'express';
import { 
    createOrder, 
    getOrderStatus, 
    getClientOrders,
    getOrderByTrackingCode,
    getClientOrdersDetailed
} from '../controllers/pedidoController.js';

const router = express.Router();

router.post('/', createOrder);
router.get('/:id/status', getOrderStatus);
router.get('/cliente/:clienteId', getClientOrders);
router.get('/rastreio/:codigoRastreio', getOrderByTrackingCode);
router.get('/cliente/:clienteId/detalhado', getClientOrdersDetailed);

export default router;