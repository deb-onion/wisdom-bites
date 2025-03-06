# Wisdom Bites Dental - Backend API

This backend server provides direct Google API integration for the Wisdom Bites Dental Clinic website, replacing the previous Google Apps Script approach.

## Features

- OAuth 2.0 authentication flow with Google
- Google Calendar integration for appointment scheduling
- Google Sheets integration for data storage
- Gmail integration for sending confirmation emails
- Secure token storage and management
- RESTful API endpoints

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Google Cloud Platform account with API access

### Installation

1. Clone the repository
2. Navigate to the backend directory:
   ```
   cd backend
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Create a `.env` file based on the `.env.example` template:
   ```
   cp .env.example .env
   ```
5. Configure your Google API credentials in the `.env` file

### Google API Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable the following APIs:
   - Google Calendar API
   - Google Sheets API
   - Gmail API
4. Create OAuth 2.0 credentials:
   - Go to "Credentials" > "Create Credentials" > "OAuth client ID"
   - Select "Web application" as the application type
   - Add authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback` (for development)
     - `https://yourdomain.com/api/auth/callback` (for production)
   - Copy the Client ID and Client Secret to your `.env` file

### Running the Server

For development:
```
npm run dev
```

For production:
```
npm start
```

## API Endpoints

### Authentication

- `GET /api/auth/login` - Redirects to Google OAuth login
- `GET /api/auth/callback` - Handles OAuth callback from Google
- `GET /api/auth/logout` - Logs out the user by clearing tokens
- `GET /api/auth/status` - Returns authentication status

### Calendar

- `GET /api/calendar/availability` - Get available time slots for a date range
- `POST /api/calendar/events` - Create a new calendar event (booking)
- `GET /api/calendar/business-hours` - Get business hours
- `DELETE /api/calendar/events/:eventId` - Cancel/delete a calendar event

### Sheets

- `POST /api/sheets/bookings` - Store booking information in Google Sheets
- `GET /api/sheets/setup` - Initialize the Google Sheet with headers
- `GET /api/sheets/bookings` - Get recent bookings (admin only)

### Gmail

- `POST /api/gmail/send` - Send email via Gmail
- `POST /api/gmail/booking-confirmation` - Send booking confirmation email

## Security Considerations

- All tokens are encrypted before storage
- HTTPS is required for production use
- OAuth tokens are automatically refreshed when needed
- Environment variables are used for sensitive information
- CORS is configured to restrict access to allowed origins

## Troubleshooting

If you encounter issues with authentication:

1. Verify your Google API credentials are correct
2. Ensure the required APIs are enabled in your Google Cloud project
3. Check that your redirect URIs are properly configured
4. Verify the scopes in the `config/google.js` file match your needs

For other issues, check the server logs for detailed error messages. 