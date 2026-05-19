// api/index.js - Entry point para Vercel
const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

// Importar o app principal
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Servir arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Rotas básicas
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend', 'home.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend', 'admin', 'index.html'));
});

app.get('/admin/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend', 'admin', 'index.html'));
});

// Importar rotas da API
const { pool } = require('../backend/config/database');

// Rota de teste
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API funcionando!' });
});

// Rotas de eventos
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
    console.error('List events error:', error);
    res.status(500).json({ error: 'Erro ao listar eventos' });
  }
});

// Rota de transparência
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

module.exports = app;
