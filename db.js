const { Pool } = require('pg');

const pool = new Pool({
    user: 'colloh',  
    host: 'localhost',
    database: 'sky_survey_db', 
    password: 'Atariz@664',   
    port: 5432  
});

pool.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err.stack);
    } else {
        console.log('Connected to PostgreSQL database.');
    }
});

module.exports = pool; 
