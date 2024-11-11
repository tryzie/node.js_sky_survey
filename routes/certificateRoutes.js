const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all certificates
router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM certificates');
        res.json(result.rows);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// POST a new certificate
router.post('/', async (req, res) => {
    const { response_id, file_name } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO certificates (response_id, file_name) VALUES ($1, $2) RETURNING *',
            [response_id, file_name]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

module.exports = router;
