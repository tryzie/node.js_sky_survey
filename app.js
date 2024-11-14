const express = require('express');
const bodyParser = require('body-parser');

// Import routes
const certificateRoutes = require('./routes/certificateRoutes');
const responseRoutes = require('./routes/responseRoutes');
const questionRoutes = require('./routes/questionRoutes');

const app = express();
app.use(bodyParser.json());

// Set up routes
app.use('/api/certificates', certificateRoutes);
app.use('/api/responses', responseRoutes);
app.use('/api/questions', questionRoutes);

//centralized error handling
app.use((err, req,res, next) => {
    console.error(err.stack); //log the error
    res.status(err.status || 500).json({
        error: err.message || 'An unexpected error occured.',
    });
}
);

const db = require('./db');

db.connect((err) => {
    if (err) {
        console.error('Failed to connect to the database:', err);
    } else {
        console.log('Connected to the database.');
    }
});


const morgan = require('morgan');
app.use(morgan('combined')); // Logs all requests in a standard format


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
