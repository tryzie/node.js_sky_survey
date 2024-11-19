const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); 
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueSuffix);
    },
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        // Validate file format
        if (path.extname(file.originalname).toLowerCase() !== '.pdf') {
            return cb(new Error('Only .pdf files are allowed!'));
        }
        cb(null, true);
    },
    limits: { fileSize: 1 * 1024 * 1024 }, 
});

// GET all certificates
router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM certificates');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching certificates:', err.message);
        res.status(500).json({ message: 'Failed to fetch certificates' });
    }
});

// POST a new certificate (with file upload)
router.post('/', upload.array('certificates', 5), async (req, res) => {
    const { response_id } = req.body;

    if (!response_id) {
        return res.status(400).json({ message: 'Response ID is required' });
    }

    try {
        const files = req.files.map(file => ({
            file_name: file.filename,
            file_path: file.path,
        }));

        // Save file information in the certificates table
        for (const file of files) {
            await db.query(
                'INSERT INTO certificates (response_id, file_name) VALUES ($1, $2)',
                [response_id, file.file_name]
            );
        }

        res.status(201).json({
            message: 'Certificates uploaded successfully',
            files,
        });
    } catch (err) {
        console.error('Error saving certificates:', err.message);
        res.status(500).json({ message: 'Failed to upload certificates' });
    }
});

module.exports = router;
