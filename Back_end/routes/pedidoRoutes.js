import express from 'express';
import { createOrder, getOrderStatus, getClientOrders } from '../controllers/pedidoController.js';

const router = express.Router();

// POST /api/orders
router.post('/', createOrder);

// GET /api/orders/:id/status
router.get('/:id/status', getOrderStatus);

// GET /api/orders/cliente/:clienteId
router.get('/cliente/:clienteId', getClientOrders);

export default router;