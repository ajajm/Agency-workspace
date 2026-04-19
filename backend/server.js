const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/users', require('./src/routes/users'));
app.use('/api/worklogs', require('./src/routes/workLogs'));
app.use('/api/punchlogs', require('./src/routes/punchLogs'));
app.use('/api/todos', require('./src/routes/todos'));
app.use('/api/reports', require('./src/routes/reports'));
app.use('/api/meetings', require('./src/routes/meetings'));

app.use('/api/notifications', require('./src/routes/notifications'));

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date() });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Backend server running on port ${PORT}`);
});
