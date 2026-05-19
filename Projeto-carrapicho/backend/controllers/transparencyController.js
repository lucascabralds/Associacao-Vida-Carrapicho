// =====================================================
// transparencyController.js - TRANSPARÊNCIA (POSTGRESQL)
// =====================================================

const { pool } = require('../config/database');

// Lista todos os registros de transparência
const listTransparency = async (req, res) => {
    try {
        // PostgreSQL: sem destructuring, usa .rows
        const records = await pool.query('SELECT * FROM transparency ORDER BY transaction_date DESC');
        const totals = await pool.query(
            `SELECT type, SUM(amount) as total FROM transparency GROUP BY type`
        );

        const incomeTotal = totals.rows.find(t => t.type === 'income')?.total || 0;
        const expenseTotal = totals.rows.find(t => t.type === 'expense')?.total || 0;

        res.json({
            records: records.rows,
            totals: { income: incomeTotal, expense: expenseTotal, balance: incomeTotal - expenseTotal }
        });
    } catch (error) {
        console.error('listTransparency error:', error);
        res.status(500).json({ error: 'Erro ao listar transparência' });
    }
};

// Cria um novo registro de transparência
const createTransparency = async (req, res) => {
    try {
        const { type, category, description, amount, transaction_date, document_url } = req.body;

        if (!type || !category || !amount || !transaction_date) {
            return res.status(400).json({ error: 'Campos obrigatórios: type, category, amount, transaction_date' });
        }

        // PostgreSQL: RETURNING id em vez de insertId
        const result = await pool.query(
            `INSERT INTO transparency (type, category, description, amount, transaction_date, document_url, created_by)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
            [type, category, description, amount, transaction_date, document_url || null, req.user.id]
        );

        const newRecord = await pool.query('SELECT * FROM transparency WHERE id = $1', [result.rows[0].id]);
        res.status(201).json(newRecord.rows[0]);
    } catch (error) {
        console.error('createTransparency error:', error);
        res.status(500).json({ error: 'Erro ao criar registro' });
    }
};

// Remove um registro de transparência
const deleteTransparency = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM transparency WHERE id = $1', [id]);
        res.status(204).send();
    } catch (error) {
        console.error('deleteTransparency error:', error);
        res.status(500).json({ error: 'Erro ao deletar registro' });
    }
};

// Gera estatísticas de despesas por categoria para o gráfico do modal público
const getStats = async (req, res) => {
    try {
        const rows = await pool.query(
            `SELECT category, SUM(amount) as total
             FROM transparency
             WHERE type = 'expense'
             GROUP BY category
             ORDER BY total DESC`
        );

        if (rows.rows.length === 0) {
            return res.json({ labels: [], values: [] });
        }

        const somaTotal = rows.rows.reduce((acc, item) => acc + parseFloat(item.total), 0);

        res.json({
            labels: rows.rows.map(r => r.category),
            values: rows.rows.map(r => ((parseFloat(r.total) / somaTotal) * 100).toFixed(1))
        });
    } catch (error) {
        console.error('getStats error:', error);
        res.status(500).json({ error: 'Erro interno ao buscar estatísticas' });
    }
};

module.exports = { listTransparency, createTransparency, deleteTransparency, getStats };