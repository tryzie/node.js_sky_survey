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

    // Log the incoming request body
    console.log("Incoming request body:", req.body);

    // Validate required fields
    if (!email_address) {
        return res.status(400).json({ message: "Email is required" });
    }

    try {
        // Combine all responses into formatted strings (or handle them as needed)
        let formattedCompositeResponses = '';
        if (compositeResponses) {
            for (const [question, subfields] of Object.entries(compositeResponses)) {
                formattedCompositeResponses += `${question}: `;
                for (const [subfield, answer] of Object.entries(subfields)) {
                    formattedCompositeResponses += `${subfield}=${answer}, `;
                }
            }
        }

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


module.exports = router;
