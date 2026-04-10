// donationRoutes.js - ROTAS DE DOAÇÕES
const express = require('express');
const { generatePixQRCode, listDonations } = require('../controllers/donationController');
const { authMiddleware } = require('../middlewares/auth');

const router = express.Router();

router.post('/pix', generatePixQRCode);
router.get('/', authMiddleware, listDonations);

module.exports = router;