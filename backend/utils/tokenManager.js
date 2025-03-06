/**
 * Token Manager
 * Handles token storage, encryption, and refreshing
 */

const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

// Store tokens in memory initially, but we'll save them to file
let tokens = null;
const TOKENS_FILE = path.join(__dirname, '../config/tokens.json');

// Encryption key from environment variable
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-for-development-only';

/**
 * Initialize the token manager
 */
const initialize = async () => {
  try {
    // Try to load tokens from file
    const fileData = await fs.readFile(TOKENS_FILE, 'utf8');
    tokens = JSON.parse(fileData);
    
    // Decrypt tokens
    if (tokens.access_token) {
      tokens.access_token = decrypt(tokens.access_token);
    }
    if (tokens.refresh_token) {
      tokens.refresh_token = decrypt(tokens.refresh_token);
    }
    
    console.log('Tokens loaded successfully');
    return true;
  } catch (error) {
    console.log('No tokens file found or error reading it. Starting fresh.');
    tokens = {};
    return false;
  }
};

/**
 * Get tokens
 */
const getTokens = () => {
  return tokens;
};

/**
 * Save tokens
 * @param {Object} newTokens - The tokens to save
 */
const saveTokens = async (newTokens) => {
  console.log('Saving tokens:', Object.keys(newTokens));
  tokens = { ...newTokens };
  
  // Create encrypted tokens for storage
  const encryptedTokens = {
    ...tokens,
    access_token: encrypt(tokens.access_token),
    refresh_token: encrypt(tokens.refresh_token)
  };
  
  // Ensure directory exists
  await fs.mkdir(path.dirname(TOKENS_FILE), { recursive: true });
  
  // Save tokens to file
  await fs.writeFile(TOKENS_FILE, JSON.stringify(encryptedTokens, null, 2));
  console.log('Tokens saved successfully');
  
  return true;
};

/**
 * Clear tokens
 */
const clearTokens = async () => {
  tokens = {};
  
  try {
    await fs.unlink(TOKENS_FILE);
  } catch (error) {
    // File might not exist, ignore
  }
  
  return true;
};

/**
 * Encrypt a string
 * @param {string} text - The text to encrypt
 * @returns {string} - The encrypted text
 */
const encrypt = (text) => {
  if (!text) return text;
  
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.padEnd(32).slice(0, 32)), iv);
  
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  
  return iv.toString('hex') + ':' + encrypted.toString('hex');
};

/**
 * Decrypt a string
 * @param {string} text - The text to decrypt
 * @returns {string} - The decrypted text
 */
const decrypt = (text) => {
  if (!text) return text;
  
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.padEnd(32).slice(0, 32)), iv);
  
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  
  return decrypted.toString();
};

module.exports = {
  initialize,
  getTokens,
  saveTokens,
  clearTokens
}; 