import express from 'express';
import { listarEstoque, reporItem, editarItem, removerItem } from '../controllers/estoqueController.js';

const router = express.Router();

// GET /api/estoque/listar
router.get('/listar', listarEstoque);

// POST /api/estoque/repor/:id
router.post('/repor/:id', reporItem);

// PUT /api/estoque/editar/:id  
router.put('/editar/:id', editarItem);

// DELETE /api/estoque/remover/:id
router.delete('/remover/:id', removerItem);

export default router;