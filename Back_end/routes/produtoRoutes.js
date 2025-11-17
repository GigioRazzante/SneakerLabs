import express from 'express';
import { editarProduto, removerProduto } from '../controllers/produtoController.js';

const router = express.Router();

// PUT /api/produtos/editar/:produtoId
router.put('/editar/:produtoId', editarProduto);

// DELETE /api/produtos/remover/:produtoId  
router.delete('/remover/:produtoId', removerProduto);

export default router;