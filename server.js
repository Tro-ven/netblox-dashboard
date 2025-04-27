require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createDatabase } = require('./database');
const { logAction, getLogs } = require('./controllers/logs');
const { validateLogInput } = require('./middleware/validation');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Database initialization
const db = createDatabase();

// API Routes
app.post('/api/logs', validateLogInput, (req, res) => logAction(db, req, res));
app.get('/api/logs', (req, res) => getLogs(db, req, res));

// Serve frontend
app.use(express.static('public'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
