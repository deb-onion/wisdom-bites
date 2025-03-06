/**
 * Google API Configuration
 * This file contains the configuration for Google API client and scopes needed.
 */

const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');

// Define the OAuth scopes we need
const SCOPES = [
  'https://www.googleapis.com/auth/calendar',            // Full access to Google Calendar
  'https://www.googleapis.com/auth/spreadsheets',        // Full access to Google Sheets
  'https://www.googleapis.com/auth/gmail.send',          // Allow sending emails via Gmail
  'https://www.googleapis.com/auth/userinfo.profile',    // Get user profile info
  'https://www.googleapis.com/auth/userinfo.email'       // Get user email
];

// Create OAuth2 client
const createOAuth2Client = () => {
  return new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
};

// Get authentication URL
const getAuthUrl = (oauth2Client) => {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES,
  });
};

// Calendar service instance
const calendar = google.calendar({
  version: 'v3',
});

// Sheets service instance
const sheets = google.sheets({
  version: 'v4',
});

// Gmail service instance
const gmail = google.gmail({
  version: 'v1',
});

module.exports = {
  createOAuth2Client,
  getAuthUrl,
  SCOPES,
  calendar,
  sheets,
  gmail
}; 