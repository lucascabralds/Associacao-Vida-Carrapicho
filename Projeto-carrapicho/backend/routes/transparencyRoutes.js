// transparencyRoutes.js - ROTAS DE TRANSPARÊNCIA
const express = require('express');
const { listTransparency, createTransparency, deleteTransparency } = require('../controllers/transparencyController');
const { authMiddleware } = require('../middlewares/auth');

const router = express.Router();

router.get('/', listTransparency);
router.post('/', authMiddleware, createTransparency);
router.delete('/:id', authMiddleware, deleteTransparency);

module.exports = router;