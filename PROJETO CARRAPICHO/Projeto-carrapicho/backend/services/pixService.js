// pixService.js - SERVIÇO DE PIX (simplificado)
const QRCode = require('qrcode');

class PixService {
    constructor() {
        this.pixKey = process.env.PIX_KEY;
        this.merchantName = process.env.PIX_MERCHANT_NAME || "ONG";
        this.merchantCity = process.env.PIX_MERCHANT_CITY || "Cidade";
    }

    getPixKey() {
        return { key: this.pixKey, label: 'CNPJ - Chave PIX oficial' };
    }

    generatePayload(amount, txid) {
        const cleanKey = this.pixKey.replace(/\D/g, '');
        const payload = 
            '000201' +
            '26360014BR.GOV.BCB.PIX0114' + cleanKey +
            '52040000' +
            '5303986' +
            '5404' + amount.toFixed(2) +
            '5802BR' +
            '5913' + this.merchantName.substring(0, 25) +
            '6007' + this.merchantCity.substring(0, 15) +
            '62140510' + txid.substring(0, 25) +
            '6304';
        return payload;
    }

    async generateQRCode(amount, donorName = null, donorEmail = null, description = 'Doação para ONG') {
        const txid = Date.now().toString() + Math.random().toString(36).substring(2, 10);
        const payload = this.generatePayload(amount, txid);
        const qrCode = await QRCode.toDataURL(payload, { width: 300 });
        return { txid, payload, qrCode, amount, description };
    }
}

module.exports = new PixService();