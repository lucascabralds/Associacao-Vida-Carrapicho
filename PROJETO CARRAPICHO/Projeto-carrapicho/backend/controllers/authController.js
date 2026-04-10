// authController.js - LOGIN E USUÁRIOS
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

const login = async (req, res) => {
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
};

const getProfile = async (req, res) => {
    try {
        const [users] = await pool.query(
            'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
            [req.user.id]
        );
        if (users.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        res.json({ user: users[0] });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Erro ao buscar perfil' });
    }
};

module.exports = { login, getProfile };