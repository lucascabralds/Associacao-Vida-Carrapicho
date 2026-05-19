// =====================================================
// eventRoutes.js - ROTAS DE EVENTOS (POSTGRESQL)
// =====================================================

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { listEvents, getEvent, createEvent, updateEvent, deleteEvent } = require('../controllers/eventController');
const { authMiddleware } = require('../middlewares/auth');

const router = express.Router();

// Configuração de upload - AJUSTANDO O CAMINHO CORRETO
const uploadDir = path.join(__dirname, '../../frontend/uploads');

// Cria a pasta se não existir
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'evento-' + unique + ext);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

// Rotas (nenhuma query SQL aqui, só chama os controllers)
router.get('/', listEvents);
router.get('/:id', getEvent);
router.post('/', authMiddleware, upload.array('images', 10), createEvent);
router.put('/:id', authMiddleware, upload.array('images', 10), updateEvent);
router.delete('/:id', authMiddleware, deleteEvent);

module.exports = router;