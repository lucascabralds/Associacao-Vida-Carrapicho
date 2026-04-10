// authRoutes.js - ROTAS DE AUTENTICAÇÃO
const express = require('express');
const { login, getProfile } = require('../controllers/authController');
const { authMiddleware } = require('../middlewares/auth');

const router = express.Router();

router.post('/login', login);
router.get('/me', authMiddleware, getProfile);

module.exports = router;