import express from 'express';
import { createOrder, getOrderStatus, getClientOrders } from '../controllers/pedidoController.js';
// REMOVER estas importações se existirem:
// import { editarProduto, removerProduto } from '../controllers/produtoController.js';

const router = express.Router();

// Rotas EXISTENTES
router.post('/', createOrder);
router.get('/:id/status', getOrderStatus);
router.get('/cliente/:clienteId', getClientOrders);

// REMOVER estas rotas se existirem (vão para produtoRoutes):
// router.put('/produto/:produtoId', editarProduto);
// router.delete('/produto/:produtoId', removerProduto);

export default router;