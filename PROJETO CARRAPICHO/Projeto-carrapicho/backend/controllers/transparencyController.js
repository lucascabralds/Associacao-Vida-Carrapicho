// transparencyRoutes.js - ROTAS DE TRANSPARÊNCIA
const express = require('express');
const { listTransparency, createTransparency, deleteTransparency } = require('../controllers/transparencyController');
const { authMiddleware } = require('../middlewares/auth');

const router = express.Router();

router.get('/', listTransparency);
router.post('/', authMiddleware, createTransparency);
router.delete('/:id', authMiddleware, deleteTransparency);

module.exports = router;

const db = require('../config/database');

exports.getStats = (req, res) => {
    // Procura todas as despesas para gerar a transparência
    const sql = `SELECT category, SUM(amount) as total FROM transactions WHERE type = 'expense' GROUP BY category`;

    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        const somaTotal = rows.reduce((acc, item) => acc + item.total, 0);

        // Prepara o objeto exatamente como o frontend espera
        const response = {
            labels: rows.map(r => r.category),
            values: rows.map(r => ((r.total / somaTotal) * 100).toFixed(1))
        };

        res.json(response);
    });
};