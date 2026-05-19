// =====================================================
// database.js - CONEXÃO COM POSTGRESQL
// =====================================================

const { Pool } = require('pg');
require('dotenv').config();

// Pool de conexões para PostgreSQL
const pool = new Pool({
    // String única de conexão (Vercel fornece isso)
    connectionString: process.env.DATABASE_URL,

    // Configuração SSL (obrigatório para Vercel)
    ssl: process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,

    // Configurações otimizadas
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Função para testar conexão
async function testConnection() {
    try {
        const client = await pool.connect();
        console.log('✅ PostgreSQL conectado!');

        // Mostra versão (debug)
        const result = await client.query('SELECT version()');
        console.log(`📦 Versão: ${result.rows[0].version.split(',')[0]}`);

        client.release();
        return true;
    } catch (error) {
        console.error('❌ Erro PostgreSQL:', error.message);
        return false;
    }
}

module.exports = { pool, testConnection };