// auth.js - VERIFICAÇÃO DE AUTENTICAÇÃO
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Token não fornecido' });
    }
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

module.exports = { authMiddleware, adminMiddleware };