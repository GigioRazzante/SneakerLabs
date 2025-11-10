// routes/imageRoutes.js (ATUALIZADO)
import express from 'express';
import { generateSneakerImage, getSneakerImage } from '../controllers/imageGenerationController.js';

const router = express.Router();

router.post('/generate', generateSneakerImage);
router.get('/:pedidoId/:produtoIndex', getSneakerImage);

export default router;