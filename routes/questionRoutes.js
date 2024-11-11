const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all questions with error handling
router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM questions');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({error: 'Failed to fetch questions. '});
    }
});

// POST a new question with validation and error handling
router.post('/', async (req, res) => {
    const { name, type, required, description, options, multiple_choices } = req.body;

    //validate input data 
    if (!name || !type) {
        return res.status(400).json({error: 'Name and type are required fields.'});
        
    }
    try {
        const result = await db.query(
            'INSERT INTO questions (name, type, required, description, options, multiple_choices) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [name, type, required, description, options, multiple_choices]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({error: 'Failed to add the question.'});
    }
});

module.exports = router;
