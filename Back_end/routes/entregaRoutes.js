// routes/entregaRoutes.js
import express from 'express';
import pool from '../config/database.js';
import slotExpedicaoService from '../services/slotExpedicaoService.js';
import entregaService from '../services/entregaService.js';

const router = express.Router();

// POST /api/entrega/confirmar
router.post('/confirmar', async (req, res) => {
  try {
    const { pedidoId } = req.body;
    
    if (!pedidoId) {
      return res.status(400).json({ error: 'pedidoId é obrigatório' });
    }

    const resultado = await entregaService.confirmarEntrega(pedidoId);
    res.json(resultado);
  } catch (error) {
    console.error('Erro na rota de confirmar entrega:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/entrega/slots/disponiveis
router.get('/slots/disponiveis', async (req, res) => {
  try {
    const slotsDisponiveis = await slotExpedicaoService.getSlotsDisponiveis();
    res.json({ slots_disponiveis: slotsDisponiveis });
  } catch (error) {
    console.error('Erro ao buscar slots disponíveis:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/chassis/cores-disponiveis
router.get('/cores-disponiveis', async (req, res) => {
  try {
    const coresResult = await pool.query(
      `SELECT DISTINCT cor 
       FROM produtos_do_pedido 
       WHERE status_producao = 'PRONTO' 
       AND cor IS NOT NULL 
       ORDER BY cor`
    );
    
    const coresDisponiveis = coresResult.rows.map(row => row.cor);
    
    res.json(coresDisponiveis);
  } catch (error) {
    console.error('Erro ao buscar cores disponíveis:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;