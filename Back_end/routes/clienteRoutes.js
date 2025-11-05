import express from 'express';
import { getCliente, updateCliente } from '../controllers/clienteController.js';

const router = express.Router();

// GET /api/cliente/:id
router.get('/:id', getCliente);

// PUT /api/cliente/:id
router.put('/:id', updateCliente);

export default router;