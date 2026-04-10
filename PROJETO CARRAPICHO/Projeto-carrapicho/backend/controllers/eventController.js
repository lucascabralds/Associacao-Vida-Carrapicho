// eventController.js - GERENCIAMENTO DE EVENTOS COM MÚLTIPLAS IMAGENS
const { pool } = require('../config/database');
const path = require('path');
const fs = require('fs');

const listEvents = async (req, res) => {
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
};

const getEvent = async (req, res) => {
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
};

const createEvent = async (req, res) => {
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
};

const updateEvent = async (req, res) => {
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
                    const imagePath = path.join(__dirname, '../frontend', images[0].image_url);
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
};

const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const [images] = await pool.query('SELECT image_url FROM event_images WHERE event_id = ?', [id]);
        for (const img of images) {
            const imagePath = path.join(__dirname, '../frontend', img.image_url);
            if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
        }
        await pool.query('DELETE FROM events WHERE id = ?', [id]);
        res.status(204).send();
    } catch (error) {
        console.error('Delete event error:', error);
        res.status(500).json({ error: 'Erro ao deletar evento' });
    }
};

module.exports = { listEvents, getEvent, createEvent, updateEvent, deleteEvent };