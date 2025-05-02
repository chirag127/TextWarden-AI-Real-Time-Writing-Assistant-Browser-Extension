/**
 * TextWarden Backend Server
 * 
 * This is a stateless Express.js server that acts as a proxy to the Gemini API.
 * It receives text and a user-provided API key from the extension, uses the key
 * to call the Gemini API, and returns the results to the extension.
 * 
 * @author Chirag Singhal (chirag127)
 */

// Import required dependencies
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Import routes
const apiRoutes = require('./routes/api');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: '1mb' })); // Limit request size to prevent abuse
app.use(cors({
  // Allow requests from extension only
  // In production, this should be more restrictive
  origin: '*', // For development, allow all origins
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'X-User-API-Key']
}));

// Routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(500).json({ 
    error: true, 
    message: 'Internal server error. Please try again later.' 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: true, 
    message: 'Endpoint not found' 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`TextWarden backend server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

module.exports = app; // Export for testing
