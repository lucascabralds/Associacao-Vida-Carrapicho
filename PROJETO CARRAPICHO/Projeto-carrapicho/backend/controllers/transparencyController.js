// transparencyController.js - CONTROLLER DE TRANSPARÊNCIA
// Obs.: este projeto usa mysql2/promise via pool diretamente no server.js.
// Este controller é reservado para uso futuro com router separado.
// A rota /api/transparency/stats já está registrada no server.js.

const db = require('../config/database');

// Lista todos os registros de transparência
exports.listTransparency = async (req, res) => {
    try {
        const [records] = await db.query('SELECT * FROM transparency ORDER BY transaction_date DESC');
        const [totals] = await db.query(
            `SELECT type, SUM(amount) as total FROM transparency GROUP BY type`
        );
        const incomeTotal = totals.find(t => t.type === 'income')?.total || 0;
        const expenseTotal = totals.find(t => t.type === 'expense')?.total || 0;
        res.json({
            records,
            totals: { income: incomeTotal, expense: expenseTotal, balance: incomeTotal - expenseTotal }
        });
    } catch (error) {
        console.error('listTransparency error:', error);
        res.status(500).json({ error: 'Erro ao listar transparência' });
    }
};

// Cria um novo registro de transparência
exports.createTransparency = async (req, res) => {
    try {
        const { type, category, description, amount, transaction_date, document_url } = req.body;
        if (!type || !category || !amount || !transaction_date) {
            return res.status(400).json({ error: 'Campos obrigatórios: type, category, amount, transaction_date' });
        }
        const [result] = await db.query(
            `INSERT INTO transparency (type, category, description, amount, transaction_date, document_url, created_by)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [type, category, description, amount, transaction_date, document_url || null, req.user.id]
        );
        const [newRecord] = await db.query('SELECT * FROM transparency WHERE id = ?', [result.insertId]);
        res.status(201).json(newRecord[0]);
    } catch (error) {
        console.error('createTransparency error:', error);
        res.status(500).json({ error: 'Erro ao criar registro' });
    }
};

// Remove um registro de transparência
exports.deleteTransparency = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM transparency WHERE id = ?', [id]);
        res.status(204).send();
    } catch (error) {
        console.error('deleteTransparency error:', error);
        res.status(500).json({ error: 'Erro ao deletar registro' });
    }
};

// Gera estatísticas de despesas por categoria para o gráfico do modal público
// ATENÇÃO: esta função usa mysql2/promise (pool). Se o server.js já registra
// /api/transparency/stats diretamente, este método é redundante mas fica aqui
// para uso opcional com router separado.
exports.getStats = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT category, SUM(amount) as total
             FROM transparency
             WHERE type = 'expense'
             GROUP BY category
             ORDER BY total DESC`
        );

        if (rows.length === 0) {
            return res.json({ labels: [], values: [] });
        }

        const somaTotal = rows.reduce((acc, item) => acc + parseFloat(item.total), 0);

        res.json({
            labels: rows.map(r => r.category),
            values: rows.map(r => ((parseFloat(r.total) / somaTotal) * 100).toFixed(1))
        });
    } catch (error) {
        console.error('getStats error:', error);
        res.status(500).json({ error: 'Erro interno ao buscar estatísticas' });
    }
};