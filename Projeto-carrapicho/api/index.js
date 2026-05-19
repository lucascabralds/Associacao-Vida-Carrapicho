// api/index.js - Entry point para Vercel
const express = require('express');
const path = require('path');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Conexão com o banco
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
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
    if (req.user?.role !== 'admin') {
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
        
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Email ou senha inválidos' });
        }
        
        const user = result.rows[0];
        const isValid = await bcrypt.compare(password, user.password);
        
        if (!isValid) {
            return res.status(401).json({ error: 'Email ou senha inválidos' });
        }
        
        const token = jwt.sign(
            { id: user.id, name: user.name, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'admin123',
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
        const result = await pool.query('SELECT id, name, email, role, active, created_at FROM users');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao listar usuários' });
    }
});

app.post('/api/users', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query(
            'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id',
            [name, email, hashedPassword, role || 'editor']
        );
        res.status(201).json({ id: result.rows[0].id, name, email, role: role || 'editor' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar usuário' });
    }
});

app.put('/api/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role, active, password } = req.body;
        const updates = [];
        const values = [];
        let paramCount = 1;
        if (name) { updates.push(`name = $${paramCount++}`); values.push(name); }
        if (email) { updates.push(`email = $${paramCount++}`); values.push(email); }
        if (role) { updates.push(`role = $${paramCount++}`); values.push(role); }
        if (active !== undefined) { updates.push(`active = $${paramCount++}`); values.push(active); }
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updates.push(`password = $${paramCount++}`);
            values.push(hashedPassword);
        }
        if (updates.length === 0) return res.status(400).json({ error: 'Nenhum dado para atualizar' });
        values.push(id);
        await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount}`, values);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar usuário' });
    }
});

app.delete('/api/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        if (id == 1) return res.status(400).json({ error: 'Não é possível deletar o administrador principal' });
        await pool.query('DELETE FROM users WHERE id = $1', [id]);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Erro ao deletar usuário' });
    }
});

// =====================================================
// ROTAS DE EVENTOS
// =====================================================
app.get('/api/events', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT e.*, 
                   (SELECT image_url FROM event_images WHERE event_id = e.id AND is_cover = TRUE LIMIT 1) as cover_image
            FROM events e 
            ORDER BY e.event_date ASC
        `);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao listar eventos' });
    }
});

app.get('/api/events/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const events = await pool.query('SELECT * FROM events WHERE id = $1', [id]);
        if (events.rows.length === 0) return res.status(404).json({ error: 'Evento não encontrado' });
        const images = await pool.query('SELECT * FROM event_images WHERE event_id = $1 ORDER BY is_cover DESC, id ASC', [id]);
        res.json({ ...events.rows[0], images: images.rows });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar evento' });
    }
});

// =====================================================
// ROTAS DE TRANSPARÊNCIA
// =====================================================
app.get('/api/transparency', async (req, res) => {
    try {
        const records = await pool.query('SELECT * FROM transparency ORDER BY transaction_date DESC');
        const totals = await pool.query(`SELECT type, SUM(amount) as total FROM transparency GROUP BY type`);
        res.json({
            records: records.rows,
            totals: {
                income: totals.rows.find(t => t.type === 'income')?.total || 0,
                expense: totals.rows.find(t => t.type === 'expense')?.total || 0
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao listar transparência' });
    }
});

app.get('/api/transparency/stats', async (req, res) => {
    try {
        const rows = await pool.query(
            `SELECT category, SUM(amount) as total
             FROM transparency
             WHERE type = 'expense'
             GROUP BY category
             ORDER BY total DESC`
        );
        if (rows.rows.length === 0) return res.json({ labels: [], values: [] });
        const somaTotal = rows.rows.reduce((acc, item) => acc + parseFloat(item.total), 0);
        res.json({
            labels: rows.rows.map(r => r.category),
            values: rows.rows.map(r => ((parseFloat(r.total) / somaTotal) * 100).toFixed(1))
        });
    } catch (error) {
        res.status(500).json({ error: 'Erro interno' });
    }
});

// =====================================================
// SERVE FRONTEND
// =====================================================
app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'admin', 'index.html'));
});

app.get('/admin/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'admin', 'index.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'home.html'));
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'home.html'));
});

module.exports = app;
