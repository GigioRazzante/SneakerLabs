import express from 'express';
import { handleCallback } from '../controllers/producaoController.js';

const router = express.Router();

// POST /api/callback
router.post('/callback', handleCallback);

export default router;