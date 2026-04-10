// donationController.js - DOAÇÕES PIX
const { pool } = require('../config/database');
const QRCode = require('qrcode');

function gerarPayloadPIX(amount, pixKey, txid) {
    const merchantName = process.env.PIX_MERCHANT_NAME || "ONG";
    const merchantCity = process.env.PIX_MERCHANT_CITY || "Cidade";
    const cleanKey = pixKey.replace(/\D/g, '');
    const payload = 
        '000201' +
        '26360014BR.GOV.BCB.PIX0114' + cleanKey +
        '52040000' +
        '5303986' +
        '5404' + amount.toFixed(2) +
        '5802BR' +
        '5913' + merchantName.substring(0, 25) +
        '6007' + merchantCity.substring(0, 15) +
        '62140510' + txid.substring(0, 25) +
        '6304';
    return payload;
}

const generatePixQRCode = async (req, res) => {
    try {
        const { amount, donor_name, donor_email } = req.body;
        
        if (!amount || amount < 1) {
            return res.status(400).json({ error: 'Valor mínimo R$ 1,00' });
        }
        
        const pixKey = process.env.PIX_KEY;
        const txid = Date.now().toString() + Math.random().toString(36).substring(2, 10);
        const payload = gerarPayloadPIX(amount, pixKey, txid);
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
};

const listDonations = async (req, res) => {
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
};

module.exports = { generatePixQRCode, listDonations };