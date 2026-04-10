// =====================================================
// SERVER.JS - SISTEMA ONG COMPLETO
// =====================================================
console.log('🚀 Iniciando servidor...');

const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const QRCode = require('qrcode');
const multer = require('multer');
const fs = require('fs');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend')));

// =====================================================
// CONFIGURAÇÃO DE UPLOAD DE IMAGENS
// =====================================================
const uploadDir = path.join(__dirname, 'frontend', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'evento-' + uniqueSuffix + ext);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Apenas imagens são permitidas'));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: fileFilter
});

app.use('/uploads', express.static(path.join(__dirname, 'frontend', 'uploads')));

// =====================================================
// CONEXÃO COM O BANCO
// =====================================================
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10
});

// =====================================================
// MIDDLEWARE DE AUTENTICAÇÃO
// =====================================================
const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token não fornecido' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch {
        res.status(403).json({ error: 'Token inválido' });
    }
};

const adminMiddleware = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Acesso negado. Requer privilégios de administrador.' });
    }
    next();
};

// =====================================================
// ROTA DE LOGIN
// =====================================================
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email e senha são obrigatórios' });
        }
        
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        
        if (users.length === 0) {
            return res.status(401).json({ error: 'Email ou senha inválidos' });
        }
        
        const user = users[0];
        const isValid = await bcrypt.compare(password, user.password);
        
        if (!isValid) {
            return res.status(401).json({ error: 'Email ou senha inválidos' });
        }
        
        const token = jwt.sign(
            { id: user.id, name: user.name, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.json({
            success: true,
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Erro no login' });
    }
});

// =====================================================
// ROTAS DE USUÁRIOS
// =====================================================
app.get('/api/users', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const [users] = await pool.query('SELECT id, name, email, role, active, created_at FROM users');
        res.json(users);
    } catch (error) {
        console.error('List users error:', error);
        res.status(500).json({ error: 'Erro ao listar usuários' });
    }
});

app.post('/api/users', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
        }
        
        const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Email já cadastrado' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const userRole = role || 'editor';
        
        const [result] = await pool.query(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, userRole]
        );
        
        res.status(201).json({ id: result.insertId, name, email, role: userRole });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ error: 'Erro ao criar usuário' });
    }
});

app.put('/api/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role, active, password } = req.body;
        
        const updates = [];
        const values = [];
        
        if (name) { updates.push('name = ?'); values.push(name); }
        if (email) { updates.push('email = ?'); values.push(email); }
        if (role) { updates.push('role = ?'); values.push(role); }
        if (active !== undefined) { updates.push('active = ?'); values.push(active); }
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updates.push('password = ?');
            values.push(hashedPassword);
        }
        
        if (updates.length === 0) {
            return res.status(400).json({ error: 'Nenhum dado para atualizar' });
        }
        
        values.push(id);
        await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);
        
        res.json({ success: true });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Erro ao atualizar usuário' });
    }
});

app.delete('/api/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        if (id == 1) {
            return res.status(400).json({ error: 'Não é possível deletar o administrador principal' });
        }
        await pool.query('DELETE FROM users WHERE id = ?', [id]);
        res.status(204).send();
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Erro ao deletar usuário' });
    }
});

// =====================================================
// ROTAS DE EVENTOS COM MÚLTIPLAS IMAGENS
// =====================================================

// Listar eventos com imagem de capa
app.get('/api/events', async (req, res) => {
    try {
        const [events] = await pool.query(`
            SELECT e.*, 
                   (SELECT image_url FROM event_images WHERE event_id = e.id AND is_cover = TRUE LIMIT 1) as cover_image
            FROM events e 
            ORDER BY e.event_date ASC
        `);
        res.json(events);
    } catch (error) {
        console.error('List events error:', error);
        res.status(500).json({ error: 'Erro ao listar eventos' });
    }
});

// Buscar evento com todas as imagens
app.get('/api/events/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [events] = await pool.query('SELECT * FROM events WHERE id = ?', [id]);
        if (events.length === 0) {
            return res.status(404).json({ error: 'Evento não encontrado' });
        }
        const [images] = await pool.query('SELECT * FROM event_images WHERE event_id = ? ORDER BY is_cover DESC, id ASC', [id]);
        res.json({ ...events[0], images });
    } catch (error) {
        console.error('Get event error:', error);
        res.status(500).json({ error: 'Erro ao buscar evento' });
    }
});

// Criar evento com múltiplas imagens
app.post('/api/events', authMiddleware, upload.array('images', 10), async (req, res) => {
    try {
        const { title, description, event_date, location, status } = req.body;
        
        if (!title || !event_date) {
            return res.status(400).json({ error: 'Título e data são obrigatórios' });
        }
        
        const [result] = await pool.query(
            `INSERT INTO events (title, description, event_date, location, status, created_by)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [title, description, event_date, location, status || 'upcoming', req.user.id]
        );
        
        const eventId = result.insertId;
        
        const images = req.files || [];
        for (let i = 0; i < images.length; i++) {
            const imageUrl = `/uploads/${images[i].filename}`;
            const isCover = (i === 0);
            await pool.query(
                `INSERT INTO event_images (event_id, image_url, is_cover) VALUES (?, ?, ?)`,
                [eventId, imageUrl, isCover]
            );
        }
        
        const [newEvent] = await pool.query('SELECT * FROM events WHERE id = ?', [eventId]);
        const [eventImages] = await pool.query('SELECT * FROM event_images WHERE event_id = ? ORDER BY is_cover DESC, id ASC', [eventId]);
        
        res.status(201).json({ ...newEvent[0], images: eventImages });
    } catch (error) {
        console.error('Create event error:', error);
        res.status(500).json({ error: 'Erro ao criar evento' });
    }
});

// Atualizar evento com imagens
app.put('/api/events/:id', authMiddleware, upload.array('images', 10), async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, event_date, location, status, remove_images } = req.body;
        
        const updates = [];
        const values = [];
        if (title) { updates.push('title = ?'); values.push(title); }
        if (description !== undefined) { updates.push('description = ?'); values.push(description); }
        if (event_date) { updates.push('event_date = ?'); values.push(event_date); }
        if (location) { updates.push('location = ?'); values.push(location); }
        if (status) { updates.push('status = ?'); values.push(status); }
        
        if (updates.length > 0) {
            updates.push('updated_at = NOW()');
            values.push(id);
            await pool.query(`UPDATE events SET ${updates.join(', ')} WHERE id = ?`, values);
        }
        
        if (remove_images) {
            const removeIds = remove_images.split(',').map(Number);
            for (const imgId of removeIds) {
                const [images] = await pool.query('SELECT image_url FROM event_images WHERE id = ? AND event_id = ?', [imgId, id]);
                if (images.length > 0 && images[0].image_url) {
                    const imagePath = path.join(__dirname, 'frontend', images[0].image_url);
                    if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
                }
                await pool.query('DELETE FROM event_images WHERE id = ? AND event_id = ?', [imgId, id]);
            }
        }
        
        const newImages = req.files || [];
        const [existingCover] = await pool.query('SELECT id FROM event_images WHERE event_id = ? AND is_cover = TRUE', [id]);
        for (let i = 0; i < newImages.length; i++) {
            const imageUrl = `/uploads/${newImages[i].filename}`;
            const isCover = (existingCover.length === 0 && i === 0);
            await pool.query(
                `INSERT INTO event_images (event_id, image_url, is_cover) VALUES (?, ?, ?)`,
                [id, imageUrl, isCover]
            );
        }
        
        const [updatedEvent] = await pool.query('SELECT * FROM events WHERE id = ?', [id]);
        const [eventImages] = await pool.query('SELECT * FROM event_images WHERE event_id = ? ORDER BY is_cover DESC, id ASC', [id]);
        res.json({ ...updatedEvent[0], images: eventImages });
    } catch (error) {
        console.error('Update event error:', error);
        res.status(500).json({ error: 'Erro ao atualizar evento' });
    }
});

// Deletar evento e suas imagens
app.delete('/api/events/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const [images] = await pool.query('SELECT image_url FROM event_images WHERE event_id = ?', [id]);
        for (const img of images) {
            const imagePath = path.join(__dirname, 'frontend', img.image_url);
            if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
        }
        await pool.query('DELETE FROM events WHERE id = ?', [id]);
        res.status(204).send();
    } catch (error) {
        console.error('Delete event error:', error);
        res.status(500).json({ error: 'Erro ao deletar evento' });
    }
});

// =====================================================
// ROTAS DE TRANSPARÊNCIA
// =====================================================
app.get('/api/transparency', async (req, res) => {
    try {
        const [records] = await pool.query('SELECT * FROM transparency ORDER BY transaction_date DESC');
        const [totals] = await pool.query(`SELECT type, SUM(amount) as total FROM transparency GROUP BY type`);
        const incomeTotal = totals.find(t => t.type === 'income')?.total || 0;
        const expenseTotal = totals.find(t => t.type === 'expense')?.total || 0;
        res.json({
            records,
            totals: { income: incomeTotal, expense: expenseTotal, balance: incomeTotal - expenseTotal }
        });
    } catch (error) {
        console.error('List transparency error:', error);
        res.status(500).json({ error: 'Erro ao listar transparência' });
    }
});

app.post('/api/transparency', authMiddleware, async (req, res) => {
    try {
        const { type, category, description, amount, transaction_date, document_url } = req.body;
        if (!type || !category || !amount || !transaction_date) {
            return res.status(400).json({ error: 'Campos obrigatórios' });
        }
        const [result] = await pool.query(
            `INSERT INTO transparency (type, category, description, amount, transaction_date, document_url, created_by)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [type, category, description, amount, transaction_date, document_url || null, req.user.id]
        );
        const [newRecord] = await pool.query('SELECT * FROM transparency WHERE id = ?', [result.insertId]);
        res.status(201).json(newRecord[0]);
    } catch (error) {
        console.error('Create transparency error:', error);
        res.status(500).json({ error: 'Erro ao criar registro' });
    }
});

app.delete('/api/transparency/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM transparency WHERE id = ?', [id]);
        res.status(204).send();
    } catch (error) {
        console.error('Delete transparency error:', error);
        res.status(500).json({ error: 'Erro ao deletar registro' });
    }
});

// =====================================================
// ROTAS DE DOAÇÕES
// =====================================================
app.post('/api/donations/pix', async (req, res) => {
    try {
        const { amount, donor_name, donor_email } = req.body;
        if (!amount || amount < 1) {
            return res.status(400).json({ error: 'Valor mínimo R$ 1,00' });
        }
        
        const pixKey = process.env.PIX_KEY;
        const txid = Date.now().toString() + Math.random().toString(36).substring(2, 10);
        const payload = `00020126360014BR.GOV.BCB.PIX0114${pixKey}5204000053039865404${amount.toFixed(2)}5802BR5913ONG6007Cidade62140510${txid}6304`;
        const qrCode = await QRCode.toDataURL(payload, { width: 300 });
        
        const [result] = await pool.query(
            `INSERT INTO donations (donor_name, donor_email, amount, pix_key, pix_txid, pix_payload, qr_code, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
            [donor_name || null, donor_email || null, amount, pixKey, txid, payload, qrCode]
        );
        
        res.json({ success: true, donation_id: result.insertId, txid, amount, qrCode, payload });
    } catch (error) {
        console.error('Generate QR Code error:', error);
        res.status(500).json({ error: 'Erro ao gerar QR Code' });
    }
});

app.get('/api/donations', authMiddleware, async (req, res) => {
    try {
        const [donations] = await pool.query('SELECT * FROM donations ORDER BY created_at DESC LIMIT 100');
        const [totals] = await pool.query(
            `SELECT SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as total_paid,
                    COUNT(CASE WHEN status = 'paid' THEN 1 END) as total_paid_count
             FROM donations`
        );
        res.json({
            totals: { arrecadado: totals[0].total_paid || 0, doacoes_confirmadas: totals[0].total_paid_count || 0 },
            donations
        });
    } catch (error) {
        console.error('List donations error:', error);
        res.status(500).json({ error: 'Erro ao listar doações' });
    }
});

// =====================================================
// INICIAR SERVIDOR
// =====================================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    console.log(`📁 Frontend: http://localhost:${PORT}/admin/`);
    try {
        const conn = await pool.getConnection();
        console.log('✅ Banco de dados conectado!');
        conn.release();
    } catch (error) {
        console.error('❌ Erro no banco:', error.message);
    }
});