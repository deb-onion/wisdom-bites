/**
 * Authentication Routes
 * Handles OAuth 2.0 flow for Google API
 */

const express = require('express');
const router = express.Router();
const { createOAuth2Client, getAuthUrl } = require('../config/google');
const tokenManager = require('../utils/tokenManager');

/**
 * GET /api/auth/login
 * Redirects to Google OAuth login
 */
router.get('/login', (req, res) => {
  try {
    const oauth2Client = createOAuth2Client();
    const authUrl = getAuthUrl(oauth2Client);
    
    res.redirect(authUrl);
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ message: 'Failed to start authentication', error: error.message });
  }
});

/**
 * GET /api/auth/callback
 * Handles OAuth callback from Google
 */
router.get('/callback', async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.status(400).json({ message: 'Missing authorization code' });
    }
    
    // Exchange code for tokens
    const oauth2Client = createOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);
    
    console.log('Received tokens from Google:', Object.keys(tokens));
    
    // Save tokens
    await tokenManager.saveTokens(tokens);
    
    // Redirect to success page
    res.redirect('/auth-success.html');
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(500).json({ message: 'Failed to complete authentication', error: error.message });
  }
});

/**
 * GET /api/auth/logout
 * Logs out the user by clearing tokens
 */
router.get('/logout', async (req, res) => {
  try {
    await tokenManager.clearTokens();
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Failed to logout', error: error.message });
  }
});

/**
 * GET /api/auth/status
 * Returns authentication status
 */
router.get('/status', async (req, res) => {
  try {
    const tokens = tokenManager.getTokens();
    const isAuthenticated = !!(tokens && tokens.access_token);
    
    res.json({
      authenticated: isAuthenticated,
      expiry: tokens?.expiry_date || null
    });
  } catch (error) {
    console.error('Auth status error:', error);
    res.status(500).json({ message: 'Failed to get auth status', error: error.message });
  }
});

module.exports = router; 