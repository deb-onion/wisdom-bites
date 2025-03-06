/**
 * Authentication Middleware
 * Verifies and refreshes tokens for Google API requests
 */

const { createOAuth2Client } = require('../config/google');
const tokenManager = require('../utils/tokenManager');

/**
 * Middleware to check if we're authenticated with Google
 */
const isAuthenticated = async (req, res, next) => {
  try {
    // Get tokens from token manager
    const tokens = tokenManager.getTokens();
    
    // If no tokens, we're not authenticated
    if (!tokens || !tokens.access_token) {
      return res.status(401).json({ 
        message: 'Not authenticated with Google',
        authenticated: false,
        url: '/api/auth/login'
      });
    }
    
    // Create OAuth client and set credentials
    const oauth2Client = createOAuth2Client();
    oauth2Client.setCredentials(tokens);
    
    // Check if token is expired or will expire soon (5 minutes)
    const tokenExpiryDate = tokens.expiry_date;
    const now = Date.now();
    const isExpired = tokenExpiryDate < now - (5 * 60 * 1000); // 5 minutes buffer
    
    // If token expired, try to refresh it
    if (isExpired) {
      try {
        const { credentials } = await oauth2Client.refreshAccessToken();
        await tokenManager.saveTokens(credentials);
        
        // Update the client with new credentials
        oauth2Client.setCredentials(credentials);
      } catch (error) {
        console.error('Failed to refresh token', error);
        return res.status(401).json({ 
          message: 'Authentication expired and refresh failed',
          authenticated: false,
          url: '/api/auth/login'
        });
      }
    }
    
    // Add oauth client to the request for further use
    req.oauth2Client = oauth2Client;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ 
      message: 'Authentication error',
      error: error.message 
    });
  }
};

module.exports = {
  isAuthenticated
}; 