// eventRoutes.js - ROTAS DE EVENTOS
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { listEvents, getEvent, createEvent, updateEvent, deleteEvent } = require('../controllers/eventController');
const { authMiddleware } = require('../middlewares/auth');

const router = express.Router();

// Configuração de upload
const uploadDir = path.join(__dirname, '../../frontend/uploads');
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

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Rotas
router.get('/', listEvents);
router.get('/:id', getEvent);
router.post('/', authMiddleware, upload.array('images', 10), createEvent);
router.put('/:id', authMiddleware, upload.array('images', 10), updateEvent);
router.delete('/:id', authMiddleware, deleteEvent);

module.exports = router;