/**
 * Wisdom Bites Dental - Backend Server
 * Direct Google API Integration
 * 
 * This server handles authentication, token management, and API calls to Google services.
 */

// Load environment variables
require('dotenv').config();

// Import dependencies
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

// Import token manager
const tokenManager = require('./utils/tokenManager');

// Import routes
const authRoutes = require('./routes/auth');
const calendarRoutes = require('./routes/calendar');
const sheetsRoutes = require('./routes/sheets');
const gmailRoutes = require('./routes/gmail');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Apply middleware
app.use(helmet()); // Security headers
app.use(morgan('dev')); // Logging
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (if needed)
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/sheets', sheetsRoutes);
app.use('/api/gmail', gmailRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', env: process.env.NODE_ENV });
});

// Test route to check environment variables
app.get('/api/test-config', (req, res) => {
  res.status(200).json({ 
    redirectUri: process.env.GOOGLE_REDIRECT_URI,
    clientId: process.env.GOOGLE_CLIENT_ID,
    port: process.env.PORT,
    allowedOrigins: process.env.ALLOWED_ORIGINS
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Initialize token manager and start server
(async () => {
  try {
    // Initialize token manager
    await tokenManager.initialize();
    console.log('Token manager initialized');
    
    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
    });
  } catch (error) {
    console.error('Error initializing token manager:', error);
    process.exit(1);
  }
})();

module.exports = app; // Export for testing 