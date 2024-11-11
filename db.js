const { Pool } = require('pg');

// Configure the connection to PostgreSQL
const pool = new Pool({
    user: 'colloh',  // PostgreSQL username
    host: 'localhost',
    database: 'sky_survey_db', // Database name
    password: 'Atariz@664',   // PostgreSQL password
    port: 5432  // PostgreSQL port
});

pool.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err.stack);
    } else {
        console.log('Connected to PostgreSQL database.');
    }
});

module.exports = pool; // Export the pool to use in other files
