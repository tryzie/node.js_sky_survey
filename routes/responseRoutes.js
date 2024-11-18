const express = require('express');
const router = express.Router();
const db = require('../db');

// POST a new response
router.post('/', async (req, res) => {
    const {
        full_name,
        email_address,
        description,
        gender,
        programming_stack,
        textResponses,
        compositeResponses,
        singleResponses,
        multipleResponses,
    } = req.body;

    console.log("Incoming request body:", req.body);

    if (!email_address) {
        return res.status(400).json({ message: "Email is required" });
    }

    try {
        // Prevent duplicate submissions
        const existing = await db.query('SELECT * FROM responses WHERE email_address = $1', [email_address]);
        if (existing.rows.length > 0) {
            return res.status(400).json({
                message: `The email ${email_address} has already submitted the survey.`,
            });
        }

        // Format composite responses
        let formattedCompositeResponses = '';
        if (compositeResponses) {
            for (const [question, subfields] of Object.entries(compositeResponses)) {
                formattedCompositeResponses += `${question}: `;
                for (const [subfield, answer] of Object.entries(subfields)) {
                    formattedCompositeResponses += `${subfield}=${answer}, `;
                }
            }
        }

        // Format multiple responses
        let formattedMultipleResponses = '';
        if (multipleResponses) {
            for (const [question, answers] of Object.entries(multipleResponses)) {
                formattedMultipleResponses += `${question}: ${answers.join(', ')}, `;
            }
        }

        // Insert into the responses table
        const result = await db.query(
            `INSERT INTO responses (full_name, email_address, description, gender, programming_stack)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [
                full_name || null,
                email_address,
                `${description || ''}\n${formattedCompositeResponses || ''}`.trim(),
                gender || null,
                `${programming_stack || ''}, ${formattedMultipleResponses || ''}`.trim(),
            ]
        );

        res.status(201).json({
            message: "Response submitted successfully",
            data: result.rows[0],
        });
    } catch (err) {
        console.error("Error saving response:", err.message);
        res.status(500).json({ message: "Error saving response" });
    }
});

// GET responses (with optional filtering by email)
router.get('/', async (req, res) => {
    const { email } = req.query;

    try {
        let query = 'SELECT * FROM responses';
        const params = [];

        if (email) {
            query += ' WHERE email_address = $1';
            params.push(email);
        }

        const result = await db.query(query, params);

        // Add certificate URLs to the response (if applicable)
        const responsesWithCertificates = await Promise.all(
            result.rows.map(async (response) => {
                const certificates = await db.query(
                    'SELECT file_name FROM certificates WHERE response_id = $1',
                    [response.id]
                );
                return {
                    ...response,
                    certificates: certificates.rows.map((cert) => `/uploads/${cert.file_name}`), // Assuming certificates are stored in the 'uploads' folder
                };
            })
        );

        res.json(responsesWithCertificates);
    } catch (err) {
        console.error("Error fetching responses:", err.message);
        res.status(500).json({ message: "Failed to fetch responses" });
    }
});

module.exports = router;
