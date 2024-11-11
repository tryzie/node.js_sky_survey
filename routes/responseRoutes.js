const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all responses
router.get('/', async (req, res, next) => {
    try {
        const result = await db.query('SELECT * FROM responses');
        res.json(result.rows);
    } catch (err) {
        next(err); //passes error to centralized error handler
    }
});

// POST a new response
router.post('/', async (req, res) => {
    const { full_name, email_address, description, gender, programming_stack } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO responses (full_name, email_address, description, gender, programming_stack) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [full_name, email_address, description, gender, programming_stack]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

module.exports = router;
