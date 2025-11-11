// routes/imageRoutes.js - VERSÃO COMPLETA
import express from 'express';
import { 
    generateSneakerImage, 
    saveSneakerImageToOrder,
    serveSneakerImage 
} from '../controllers/imageGenerationController.js';

const router = express.Router();

// 🎯 ROTA: Gerar imagem temporária (preview)
router.post('/generate', generateSneakerImage);

// 🎯 ROTA: Salvar imagem definitiva no pedido
router.post('/save-to-order', saveSneakerImageToOrder);

// 🎯 ROTA: Servir imagem do sneaker
router.get('/sneaker/:pedidoId/:produtoId', serveSneakerImage);

export default router;