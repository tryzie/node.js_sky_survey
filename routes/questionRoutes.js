const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all questions with error handling
router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT id, question, type, description, options, subfields, file_properties FROM questions');
        console.log('Database result:', result.rows);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching questions:', err.message);
        res.status(500).json({error: 'Failed to fetch questions. '});
    }
});

// POST a new question with validation and error handling
router.post('/', async (req, res) => {
    const { question, type, required, description, options, multiple_choices, subfields } = req.body;

    //validate input data 
    if (!question || !type) {
        return res.status(400).json({error: 'question and type are required fields.'});
        
    }
    try {
        const result = await db.query(
            'INSERT INTO questions (question, type, required, description, options, multiple_choices, subfields) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [question, type, required, description, options, multiple_choices, subfields]
        );
        res.json(result.rows[0]);
    } catch (err) {S
        console.error('Error adding question:', err.message);
        res.status(500).json({error: 'Failed to add the question.'});
    }
});

module.exports = router;
