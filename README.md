# Wisdom Bites Dental Clinic Website

A modern, responsive, and feature-rich website for Wisdom Bites Dental Clinic that showcases services, enables appointment booking through Google Calendar integration, and provides essential information to patients.

## 📋 Table of Contents

- [Overview](#overview)
- [What's in This Project](#whats-in-this-project)
- [Features](#features)
  - [Virtual Tour Feature](#virtual-tour-feature)
  - [Google Maps Integration](#google-maps-integration)
  - [Enhanced Directions Feature](#enhanced-directions-feature)
  - [Booking System](#booking-system)
  - [Backend API Integration](#backend-api-integration)
  - [Google APIs Integration](#google-apis-integration)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Frontend Setup](#frontend-setup)
  - [Backend Setup](#backend-setup)
  - [Environment Variables](#environment-variables)
  - [Google API Setup](#google-api-setup)
- [Development Workflow](#development-workflow)
  - [Running the Frontend](#running-the-frontend)
  - [Running the Backend](#running-the-backend)
  - [Testing OAuth Flow](#testing-oauth-flow)
  - [Debugging Tips](#debugging-tips)
- [Folder Structure](#folder-structure)
- [How to Update the Website](#how-to-update-the-website)
- [Version Management System](#version-management-system)
- [Cloudflare Deployment](#cloudflare-deployment)
- [Common Issues & Solutions](#common-issues--solutions)
- [Technical Details](#technical-details)
  - [CSS Architecture](#css-architecture)
  - [JavaScript Components](#javascript-components)
  - [API Integrations](#api-integrations)
  - [Backend Architecture](#backend-architecture)
  - [Database Structure](#database-structure)
  - [Authentication Flow](#authentication-flow)
- [Browser Compatibility](#browser-compatibility)
- [Accessibility Compliance](#accessibility-compliance)
- [Performance Optimizations](#performance-optimizations)
- [Future Enhancements](#future-enhancements)

## 📝 Overview

This is a custom-built dental clinic website featuring:

- **Speed**: Fast-loading pages optimized for all devices
- **SEO**: Search-engine friendly structure and content
- **Accessibility**: WCAG 2.1 AA compliant for users with disabilities
- **Offline Access**: Works even when internet connection is spotty through Service Workers
- **Easy Management**: Simple update system that tracks changes
- **Interactive Features**: Virtual tour, appointment booking, location directions, and more
- **Direct Google Integration**: Connects directly to Google Calendar, Sheets, and Gmail APIs for appointment management
- **Current Version**: 3.5.0 (see [CHANGELOG.md](CHANGELOG.md) for update history)

The site is hosted on Cloudflare for security, speed, and reliability, with a separate backend API server handling Google service integrations.

## 🧰 What's in This Project

### Main Pages

- **Home** (`index.html`): Introduction to the clinic, services, and virtual tour
- **About** (`about.html`): Information about the clinic and team
- **Services**: 
  - General Dentistry (`services/general-dentistry.html`)
  - Cosmetic Dentistry (`services/cosmetic-dentistry.html`)
  - Emergency Care (`services/emergency-care.html`)
- **Booking** (`booking.html`): Appointment scheduling system with Google Calendar integration
- **Contact** (`contact.html`): Contact form and clinic information
- **Directions** (`directions.html`): Enhanced route planning (accessible post-booking)
- **FAQ** (`faq.html`): Frequently asked questions with search functionality

### Backend Components

- **Node.js API Server**: Powers the booking system and Google integrations
- **Express.js Framework**: Handles routing and middleware
- **Google API Integration**: Connects to Google Calendar, Sheets, and Gmail
- **OAuth 2.0 Authentication**: Secures access to Google services
- **Token Management**: Handles authentication token storage and refresh
- **Environment Configuration**: Manages different environments (development, production)

### Behind-the-Scenes Features

- **Version Control**: System to track all website changes
- **Media Tracking**: Automatically logs when images or videos are added/changed
- **Automatic Deployment**: Updates go live instantly when approved
- **API Integrations**: Google Maps for virtual tour, Google Calendar for appointment booking, Google Sheets for record-keeping
- **Structured Data**: Schema.org markup for enhanced SEO
- **Performance Monitoring**: Built-in analytics for page speed and user interaction
- **Access Control**: Enhanced features available post-booking

## 🌟 Features

### Virtual Tour Feature

The website includes a comprehensive virtual tour feature (as of version 3.0.0) that allows potential patients to explore the clinic before visiting. This feature includes:

#### Components and Files

- **HTML Structure**: Main container in `index.html` with tour controls and panels
- **CSS Styling**: Dedicated styles in `assets/css/virtual-tour.css`
- **JavaScript Logic**: Core functionality in `assets/js/virtual-tour.js`
- **API Integration**: Google Maps Street View and Places API

#### Key Features

- **Street View Integration**: Explore the clinic's surroundings
- **Interior Panorama View**: View 360° panoramas of the clinic interior
- **Interactive Hotspots**: Clickable points of interest with information
- **Place Info Panel**: Details about the clinic, hours, and reviews
- **Tour Progress Indicators**: Track progress through the virtual tour
- **Responsive Design**: Works on all devices from mobile to desktop
- **Fallback Mechanisms**: Still works if APIs fail to load
- **Completion Dialog**: Prompts for appointment booking after tour

#### Technical Implementation

- **Google Maps API Integration**: 
  - Street View API for exterior views
  - Places API for clinic information
  - Static Maps API as a fallback
- **Local Data Fallback**: Preloaded clinic data in JSON format
- **Responsive Components**: Adapts to various screen sizes
- **Accessible Controls**: Keyboard navigation and screen reader support
- **Performance Optimizations**: Lazy loading of panorama images

#### Usage Instructions

1. Click the "Take a Virtual Tour" button on the homepage
2. Use navigation controls to move around the exterior or interior views
3. Click on hotspots to see information about specific areas
4. Use the "Clinic Info" button to toggle the information panel
5. Complete the tour to see booking options

### Google Maps Integration

The website features comprehensive Google Maps integration on the contact page that provides:

#### Components and Files

- **HTML Structure**: Map container in `contact.html` with interactive elements
- **JavaScript Logic**: Core functionality in `assets/js/contact.js`
- **API Integration**: Google Maps JavaScript API and Places API

#### Key Features

- **Interactive Map**: Shows the clinic's location with custom styling
- **Dynamic Directions**: "Get Directions" button that uses the user's location
- **Location Details**: Information window with clinic information
- **Business Data**: Consistent business information shared between pages
- **Fallback Mechanisms**: Works even if some API features fail to load
- **Mobile Friendly**: Fully responsive map that works on all devices

#### Technical Implementation

- **Google Maps API Integration**: 
  - Maps JavaScript API for the interactive map
  - Places API for official business data
  - Advanced markers for modern UI (with fallback)
- **Geolocation**: Uses browser geolocation for directions
- **Responsive Design**: Adapts to various screen sizes
- **Error Handling**: Graceful fallbacks if user denies location or API fails

### Enhanced Directions Feature

The website includes a dedicated directions page with comprehensive route planning capabilities, accessible after booking an appointment.

#### Components and Files

- **HTML Structure**: Main functionality in `directions.html` with route planning interface
- **JavaScript Logic**: Core functionality in `assets/js/directions.js`
- **API Integration**: Multiple Google Maps APIs for comprehensive directions

#### Key Features

- **Access Control**: Only accessible after booking an appointment (premium feature)
- **Multiple Travel Modes**: Options for driving, transit, walking, and cycling
- **Route Optimization**: Optimizing multi-stop journeys for efficiency
- **Multiple Waypoints**: Add intermediate stops to your route
- **Street View Integration**: Visualize destinations and key route points
- **Real-time Traffic**: Traffic layer toggle for current conditions
- **Static Map Fallback**: Graceful degradation if JavaScript is disabled
- **Enhanced Styling**: Custom map styling for better readability
- **Appointment Context**: Displays appointment details for easier planning

#### Technical Implementation

- **API Integration**: 
  - Maps JavaScript API for the interactive map
  - Directions API for route calculation
  - Places API for location autocomplete
  - Geocoding API for address resolution
  - Street View API for immersive visualization
  - Static Maps API for fallback options
- **LocalStorage**: Stores booking status and appointment details
  - `wbdc_has_booking` flag for access control
  - `wbdc_appointment_details` for appointment context
- **Responsive Design**: Fully responsive across all devices
- **Error Handling**: Comprehensive error messages with fallback options
- **User Location**: Geolocation integration for accurate starting points

#### Usage Flow

1. Book an appointment through the booking page
2. After successful booking, access the directions page
3. Enter your starting point or use current location
4. Add any intermediate stops if needed
5. Select preferred travel mode
6. View detailed turn-by-turn directions and route visualization
7. Toggle additional features like Street View and traffic conditions

### Booking System

The website includes a comprehensive appointment booking system that allows patients to easily schedule dental appointments with direct integration to Google Calendar. This feature includes:

#### Components and Files

- **Frontend**:
  - **HTML Structure**: Multi-step form in `booking.html` with patient information, service selection, date/time picker, and confirmation
  - **CSS Styling**: Dedicated styles in `assets/css/booking-enhanced.css`
  - **JavaScript Logic**: Core functionality in `assets/js/booking.js`
  - **API Service**: Communication with backend in `assets/js/api-service.js`

- **Backend**:
  - **Server**: Node.js/Express server in `backend/server.js`
  - **Routes**: API endpoints in `backend/routes/` directory
  - **Google Integration**: OAuth setup in `backend/config/google.js`
  - **Token Management**: Authentication handling in `backend/utils/tokenManager.js`
  - **Configuration**: Environment variables in `backend/.env`

#### Key Features

- **Multi-Step Form**: User-friendly 4-step booking process
- **Personal Information Collection**: Securely collects patient details
- **Service Selection**: Allows patients to choose specific dental services
- **Date and Time Picker**: Interactive calendar with real-time availability from Google Calendar
- **Appointment Summary**: Clear review of booking details before confirmation
- **Google Calendar Integration**: Checks real-time availability and creates events
- **Google Sheets Integration**: Records booking details in a spreadsheet
- **Email Notifications**: Sends confirmation emails via Gmail API
- **Emergency Information**: Special section for dental emergencies with direct clinic contact
- **Clinic Data Integration**: Phone numbers and address pulled from centralized clinic data
- **Mobile Friendly**: Fully responsive design for all devices

#### Booking System Architecture

The booking system implements a client-server architecture:

1. **Frontend (Client)**:
   - Collects user information through a multi-step form
   - Communicates with the backend API for calendar availability and booking creation
   - Handles UI interactions and form validation
   - Displays available time slots and confirms bookings

2. **Backend (Server)**:
   - Authenticates with Google services using OAuth 2.0
   - Retrieves calendar availability from Google Calendar
   - Creates calendar events when bookings are confirmed
   - Records booking information in Google Sheets
   - Sends confirmation emails through Gmail
   - Manages authentication tokens securely

#### Authentication Flow

The booking system uses OAuth 2.0 to authenticate with Google services:

1. Administrator initiates authentication by visiting `/api/auth/login`
2. Google OAuth consent screen is presented
3. After consent, Google redirects to `/api/auth/callback` with an authorization code
4. The backend exchanges the code for access and refresh tokens
5. Tokens are securely stored for future API requests
6. Token refresh is handled automatically when needed

### Backend API Integration

The website integrates with a custom-built Node.js backend API server that handles all Google service integrations.

#### API Endpoints

| Endpoint | Method | Description | Authentication |
|----------|--------|-------------|----------------|
| `/api/auth/login` | GET | Initiates Google OAuth flow | None |
| `/api/auth/callback` | GET | Handles OAuth callback | None |
| `/api/auth/status` | GET | Checks authentication status | None |
| `/api/calendar/availability` | GET | Gets available slots | Required |
| `/api/calendar/events` | POST | Creates calendar event | Required |
| `/api/sheets/bookings` | POST | Saves booking to Google Sheets | Required |
| `/api/gmail/send` | POST | Sends confirmation email | Required |
| `/api/health` | GET | API health check | None |

#### API Security

The backend API implements several security measures:

- **CORS**: Restricts access to allowed origins
- **Helmet.js**: Adds security headers to protect against common web vulnerabilities
- **Token Encryption**: Encrypts OAuth tokens before storage
- **Middleware Authentication**: Validates requests before accessing protected endpoints
- **Request Validation**: Validates input data to prevent injection attacks
- **Error Handling**: Comprehensive error handling to prevent information disclosure

### Google APIs Integration

The website integrates with multiple Google APIs to provide a seamless booking experience:

#### Google Calendar API

- **Purpose**: Check appointment availability and create new appointments
- **Features**:
  - Retrieves busy slots from the clinic's calendar
  - Creates new calendar events when bookings are confirmed
  - Sets appropriate event details (patient name, service, etc.)
  - Configures reminders for upcoming appointments

#### Google Sheets API

- **Purpose**: Store booking information in a spreadsheet for admin reference
- **Features**:
  - Records patient details, service selection, and appointment time
  - Creates spreadsheet if it doesn't exist
  - Adds new rows for each booking
  - Formats data for easy reading and filtering

#### Gmail API

- **Purpose**: Send confirmation emails to patients
- **Features**:
  - Sends HTML formatted emails
  - Includes appointment details and clinic information
  - Supports email templates for consistent messaging
  - Handles attachments if needed

## 🚀 Getting Started

### Prerequisites

Before setting up the project, ensure you have the following:

- **Node.js**: Version 14.x or higher
- **npm**: Version 6.x or higher
- **Google Cloud Platform Account**: For API access
- **Web Browser**: Chrome, Firefox, Edge, or Safari (latest version)
- **Text Editor/IDE**: Visual Studio Code recommended

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/deb-onion/wisdom-bites.git
cd wisdom-bites-dental
```

#### 2. Install Frontend Dependencies

The frontend is a static website without build dependencies, but it includes some npm packages for local development:

```bash
npm install
```

#### 3. Install Backend Dependencies

```bash
cd backend
npm install
cd ..
```

### Configuration

#### 1. Set Up Environment Variables

Create a `.env` file in the backend directory:

```bash
cd backend
cp .env.example .env
```

Edit the `.env` file with your configuration:

```
# Server Configuration
PORT=4000
NODE_ENV=development

# Google API Credentials
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:4000/api/auth/callback

# Google Services
GOOGLE_CALENDAR_ID=your_calendar_id_here
GOOGLE_SHEETS_BOOKING_SPREADSHEET_ID=your_spreadsheet_id_here

# Security
TOKEN_SECRET=your_random_secure_token_here
ENCRYPTION_KEY=your_32_character_encryption_key_here

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:4000,https://wisdombites.com
```

#### 2. Google Cloud Platform Setup

1. Create a new project in Google Cloud Platform
2. Enable the following APIs:
   - Google Calendar API
   - Google Sheets API
   - Gmail API
   - Google Maps JavaScript API
   - Places API
   - Geocoding API
3. Create OAuth 2.0 credentials:
   - Web application type
   - Add redirect URI: `http://localhost:4000/api/auth/callback`
   - Save Client ID and Secret to your `.env` file

#### 3. Get Google Calendar ID

1. Log in to your Google Calendar
2. Go to your calendar settings
3. Find the Calendar ID under "Integrate calendar"
4. Add this ID to your `.env` file

### Frontend Setup

The frontend is a static website that communicates with the backend API:

1. Configure the API service:
   - Open `assets/js/api-service.js`
   - Verify that `apiBaseUrl` is set to `http://localhost:4000/api` for development
   - The production URL should be configured appropriately when deployed

2. Enable CORS for development:
   - Ensure your backend's `ALLOWED_ORIGINS` includes `http://localhost:3000`

### Backend Setup

1. Initialize the backend:
   ```bash
   cd backend
   npm run dev
   ```

2. Authenticate with Google:
   - Visit `http://localhost:4000/api/auth/login`
   - Complete the Google OAuth flow
   - You should be redirected to the success page

3. Verify authentication:
   - Visit `http://localhost:4000/api/auth/status`
   - Confirm you see `"authenticated": true`

### Running the Application

#### 1. Start the Backend Server

```bash
cd backend
npm run dev
```

This will start the backend server on port 4000 (or your configured PORT).

**Important Note**: The backend and frontend must run on different ports. The default configuration uses port 4000 for the backend and port 3000 for the frontend. If you change these ports, ensure you update all relevant configuration files as described in the "Common Issues & Solutions" section.

#### 2. Start the Frontend Server

In a separate terminal:

```bash
cd wisdom-bites-dental
npx http-server . -p 3000
```

This will serve the frontend on port 3000.

#### 3. Access the Website

Open your browser and navigate to:
```
http://localhost:3000
```

## 📁 Folder Structure

```
wisdom-bites-dental/
│
├── index.html                 # Homepage with virtual tour
├── about.html                 # About Us page
├── booking.html               # Appointment booking page
├── contact.html               # Contact information page
├── directions.html            # Enhanced directions page (post-booking access)
├── faq.html                   # Frequently asked questions
├── _headers                   # Cloudflare MIME type and security configuration
│
├── services/                  # Service pages
│   ├── general-dentistry.html
│   ├── cosmetic-dentistry.html
│   └── emergency-care.html
│
├── assets/                    # Website resources
│   ├── css/                   # Styling files
│   │   ├── styles.css         # Main styles
│   │   ├── responsive.css     # Mobile-friendly adjustments
│   │   ├── animations.css     # Animation effects
│   │   ├── booking-enhanced.css # Booking system styles
│   │   └── virtual-tour.css   # Virtual tour specific styles
│   │
│   ├── js/                    # Interactive features
│   │   ├── main.js            # Core functionality
│   │   ├── animations.js      # Visual effects
│   │   ├── api-service.js     # Communication with backend API
│   │   ├── booking.js         # Appointment scheduling system
│   │   ├── virtual-tour.js    # Virtual tour functionality
│   │   ├── contact.js         # Contact page functionality with Google Maps
│   │   ├── directions.js      # Enhanced directions functionality
│   │   ├── faq.js             # FAQ search and filtering
│   │   ├── utils/             # Utilities
│   │   │   └── clinic-data.js # Centralized clinic data management 
│   │   └── vendors/           # Third-party libraries
│   │       └── swiper-bundle.min.js # Swiper library for sliders
│   │
│   ├── fonts/                 # Font files
│   │   ├── icons.woff2        # Icon font
│   │   └── icons.woff         # Icon font fallback
│   │
│   └── images/                # Pictures used on the website
│       ├── logo.svg           # Main logo
│       ├── logo-white.svg     # White version for dark backgrounds
│       └── various images     # Various website imagery
│
├── backend/                   # Backend API server
│   ├── server.js              # Main server entry point
│   ├── package.json           # Node.js dependencies
│   ├── .env                   # Environment variables (not in Git)
│   ├── .env.example           # Example environment variables
│   │
│   ├── config/                # Configuration files
│   │   ├── google.js          # Google API configuration
│   │   └── tokens.json        # Encrypted OAuth tokens (not in Git)
│   │
│   ├── routes/                # API routes
│   │   ├── auth.js            # Authentication routes
│   │   ├── calendar.js        # Calendar API routes
│   │   ├── sheets.js          # Google Sheets routes
│   │   └── gmail.js           # Gmail API routes
│   │
│   ├── middlewares/           # Express middlewares
│   │   └── auth.js            # Authentication middleware
│   │
│   └── utils/                 # Utility functions
│       └── tokenManager.js    # Token storage and management
│
├── .github/                   # Deployment settings
│   └── workflows/
│       └── deploy.yml         # Automatic deployment rules
│
├── .gitignore                 # Specifies files excluded from Git tracking
├── update-site.ps1            # Website update script (PowerShell)
├── update-clinic-data.js      # Script to update clinic data across all HTML files
├── watch-media.js             # Media tracking script
├── version.json               # Current version information
├── CHANGELOG.md               # Detailed history of changes
├── version_history.txt        # Simple list of updates
├── media-updates.log          # Media asset tracking log
└── debug-tracker.md           # Documentation of issues and fixes
```

## 🔄 Development Workflow

### Running the Frontend

To run the frontend locally during development:

```bash
npx http-server . -p 3000
```

This will start a local web server on port 3000 serving the static HTML files.

### Running the Backend

To run the backend API server during development:

```bash
cd backend
npm run dev
```

This will start the backend server on port 4000 (or your configured PORT) with nodemon for automatic restarting when files change.

### Testing OAuth Flow

The Google OAuth flow requires proper setup:

1. Visit `http://localhost:4000/api/auth/login` to initiate authentication
2. Complete the Google consent screen
3. You'll be redirected to the success page if authentication is successful
4. The backend will now have access to Google services

### Testing the Booking System

To fully test the booking system:

1. Ensure both frontend and backend servers are running
2. Complete the Google OAuth flow if not already authenticated
3. Navigate to `http://localhost:3000/booking.html`
4. Fill out the form, including personal information and service selection
5. Select a date from the calendar (which shows real availability from Google Calendar)
6. Choose an available time slot
7. Complete the booking
8. Verify that the appointment appears in your Google Calendar
9. Check that booking details were recorded in Google Sheets
10. Confirm that a confirmation email was sent

### Debugging Tips

#### Frontend Debugging

- Check browser console (F12) for JavaScript errors
- Use the browser's Network tab to inspect API calls
- Add `console.log()` statements in key functions like:
  - `BookingSystem.init()`
  - `ApiService.getAvailability()`
  - `BookingSystem.generateCalendarMonth()`
- Ensure script loading order is correct (particularly that `api-service.js` is loaded before `booking.js`)
- Check the `debug-tracker.md` file for common issues and their solutions
- Verify CSS styles for interactive elements like calendar days

#### Backend Debugging

- Check server logs for error messages
- Use Postman or similar tools to test API endpoints directly
- Verify environment variables are set correctly
- Check token validity in the Google Cloud Console
- Use the `/api/health` endpoint to verify server status
- Use the `/api/test-config` endpoint to verify environment variables are loaded correctly
- After changing environment variables, always restart the server

## 🔄 How to Update the Website

### Simple Update Process

1. **Make sure tracking is running**:
   ```
   npm run watch
   ```
   (Keep this running in a separate window)

2. **Make your changes** to any files (HTML, images, etc.)

3. **Test your changes locally**:
   ```
   npx http-server . -p 3000
   ```
   View at: http://localhost:3000

4. **Update and deploy** when everything looks good:
   ```
   .\update-site.ps1 -Description "What you changed" -VersionType "auto"
   ```

### Update Examples

```powershell
# For small fixes:
.\update-site.ps1 -Description "Fixed typo on homepage"

# For new features:
.\update-site.ps1 -Description "Added new booking calendar feature" -VersionType "minor"

# For major redesigns:
.\update-site.ps1 -Description "Complete website redesign" -VersionType "major"
```

### Updating Backend Components

For backend changes:

1. Make changes to the backend code
2. Test locally before deploying
3. Use Git to manage changes:
   ```bash
   cd backend
   git add .
   git commit -m "Description of changes"
   git push
   ```

4. Deploy according to your hosting provider's process

### Updating Business Information

The business information is centralized in a single location for easy updates. To update clinic information (address, phone, hours, etc.):

1. **Locate the clinic data** in `index.html` (in the clinic-data script tag), which contains:
   - Clinic name
   - Address
   - Phone number
   - Google Maps Place ID
   - GPS coordinates
   - Operating hours
   - Services offered

2. **Make your changes** to the JSON data in the clinic-data script tag

3. **Run the update script** to propagate changes to all pages:
   ```
   node update-clinic-data.js
   ```

## 📊 Version Management System

This website uses a smart version numbering system (X.Y.Z):

- **X** (Major): Complete redesigns or big changes
- **Y** (Minor): New features added
- **Z** (Patch): Small fixes and updates

### Current Version

**Version 3.5.0** - Enhanced booking system with direct Google API integration. See [CHANGELOG.md](CHANGELOG.md) for complete history.

### How Changes are Tracked

The system uses three files:

1. **CHANGELOG.md**: Detailed information about all changes
2. **version_history.txt**: Simple list of version numbers and descriptions
3. **media-updates.log**: Automatically tracks when images/videos are added or changed

You don't need to edit these files manually - the update script handles everything!

## ☁️ Cloudflare Deployment

The website is hosted on Cloudflare Pages for:
- Fast loading worldwide
- Protection against attacks
- Automatic HTTPS encryption

### Live Website URL

The live website is accessible at:
- **Main URL**: https://wisdom-bites-dental.pages.dev
- **Custom Domain**: (If a custom domain has been configured, it would be listed here)

## ❓ Common Issues & Solutions

### Frontend Issues

#### "Calendar days not clickable"

**Solution**: 
1. Check if the calendar container exists in the DOM
2. Verify that `calendar-grid` element is properly identified
3. Ensure event handlers are correctly bound to calendar days
4. Check browser console for JavaScript errors
5. Verify the `calendar-day` elements have proper CSS styling for clickability
6. Ensure the `handleUrlParameters` function is properly implemented
7. Check for correct naming consistency in element references (e.g., `prevMonthButton` vs `prevMonthBtn`)

Code fix example:
```javascript
// Fix calendar clicks by directly adding event listeners
document.querySelectorAll('.calendar-day:not(.disabled):not(.empty)').forEach(day => {
  day.style.cursor = 'pointer';
  day.addEventListener('click', function() {
    const dateString = day.dataset.date;
    BookingSystem.selectDate(day, dateString);
  });
});
```

#### "API service not defined"

**Solution**:
1. Ensure `api-service.js` is included before `booking.js`
2. Check that `ApiService.init()` is called
3. Verify the API base URL is correctly configured
4. Check for network errors in browser console

### Backend Issues

#### "Google OAuth redirect_uri_mismatch"

**Solution**:
1. Verify the `GOOGLE_REDIRECT_URI` in the `.env` file matches exactly what's configured in the Google Cloud Console
2. Ensure the URI includes the correct protocol, host, port, and path
3. Check for trailing slashes which might cause mismatches
4. Reload the server after making changes to environment variables

#### "Cannot connect to backend server"

**Solution**:
1. Verify the backend server is running (`npm run dev` in backend directory)
2. Check that the correct port is being used (default: 4000)
3. Ensure CORS is configured to allow the frontend origin
4. Check for firewall or network issues blocking connections

#### "Not authenticated with Google" error

**Solution**:
1. Verify you have completed the Google OAuth flow by visiting `/api/auth/login`
2. Check if tokens are properly stored in `backend/config/tokens.json`
3. Ensure the required Google APIs are enabled in Google Cloud Console
4. Verify the correct scopes are requested during authentication

## 🔧 Technical Details

### CSS Architecture

The website uses a thoughtfully organized CSS architecture:

1. **CSS Custom Properties (Variables)**:
   - Defined in `:root` in `styles.css`
   - Categories include colors, typography, spacing, borders, shadows, transitions, and z-index
   - Example: `--primary: #4a90e2;` for consistent color usage

2. **Modular Structure**:
   - Base styles for HTML elements
   - Component-specific styles
   - Utility classes for common patterns

3. **Responsive Design**:
   - Mobile-first approach
   - Breakpoints at 480px, 768px, 992px, and 1200px
   - Flexbox and CSS Grid for layouts

4. **Performance Considerations**:
   - Critical CSS inlined in `<head>`
   - Non-critical CSS loaded asynchronously
   - Minimized use of CSS animations for better performance

### JavaScript Components

The website's JavaScript is organized into modular components:

1. **Core Functionality** (`main.js`):
   - Navigation menu controls
   - Smooth scrolling
   - Form validation
   - Lazy loading of images

2. **API Service** (`api-service.js`):
   - Communication with the backend API
   - Handle authentication errors
   - Manage request timeouts
   - Format API requests and responses

3. **Booking System** (`booking.js`):
   - Multi-step form navigation
   - Calendar generation and interaction
   - Date and time selection
   - Form validation
   - Appointment confirmation
   - Error handling

4. **Virtual Tour** (`virtual-tour.js`):
   - Google Maps API integration
   - Street View panorama controls
   - Interior panorama navigation

### Backend Architecture

The backend uses a Node.js/Express architecture:

1. **Server Configuration** (`server.js`):
   - Express application setup
   - Middleware configuration (CORS, body parsing, security)
   - Route registration
   - Error handling

2. **Route Handlers** (`routes/` directory):
   - Authentication routes (`auth.js`)
   - Calendar integration routes (`calendar.js`)
   - Google Sheets integration routes (`sheets.js`)
   - Gmail integration routes (`gmail.js`)

3. **Middleware** (`middlewares/` directory):
   - Authentication middleware (`auth.js`)
   - Request validation
   - Error handling

4. **Utilities** (`utils/` directory):
   - Token management (`tokenManager.js`)
   - Encryption/decryption helpers
   - Date formatting and manipulation

### Authentication Flow

The authentication flow for Google API integration works as follows:

1. **Initial Authentication**:
   - User navigates to `/api/auth/login`
   - Server generates OAuth URL using configured client ID, secret, and redirect URI
   - User is redirected to Google consent screen
   - After consent, Google redirects to `/api/auth/callback` with authorization code
   - Server exchanges code for access and refresh tokens
   - Tokens are encrypted and stored in `config/tokens.json`

2. **Subsequent API Requests**:
   - Authentication middleware checks for tokens
   - If tokens exist, they're decrypted and used
   - If tokens are expired, refresh token is used to get new access token
   - If refresh fails, user is prompted to re-authenticate
   - If authentication is valid, the request proceeds to the API endpoint

3. **Token Storage**:
   - Tokens are encrypted using AES-256-CBC before storage
   - Encryption key is stored in environment variables
   - Token file is excluded from Git repository
   - Both access token and refresh token are stored

## 🌐 Browser Compatibility

The website is tested and compatible with:

- **Chrome**: Version 88+
- **Firefox**: Version 85+
- **Safari**: Version 14+
- **Edge**: Version 88+
- **iOS Safari**: Version 14+
- **Android Chrome**: Version 88+

Browser compatibility is maintained by:
- Using appropriate vendor prefixes
- Ensuring all CSS properties have fallbacks
- Testing against browser compatibility databases
- Using feature detection rather than browser detection

## ♿ Accessibility Compliance

The website follows WCAG 2.1 AA standards, including:

- **Semantic HTML**: Proper heading structure and landmark regions
- **ARIA Attributes**: Used where appropriate to enhance accessibility
- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **Color Contrast**: Meets minimum contrast requirements
- **Alternative Text**: All images have appropriate alt text
- **Focus Indicators**: Visible focus styles on interactive elements
- **Screen Reader Compatibility**: Tested with popular screen readers

## ⚡ Performance Optimizations

The website employs several performance optimizations:

1. **Image Optimization**:
   - WebP format for modern browsers
   - Appropriate image dimensions
   - Lazy loading for below-the-fold images

2. **Code Optimization**:
   - Minified CSS and JavaScript
   - Critical CSS inlined
   - Deferred loading of non-critical scripts

3. **API Optimizations**:
   - Caching of API responses where appropriate
   - Efficient batch requests to minimize API calls
   - Error boundary to prevent cascading failures

## 🚀 Future Enhancements

Planned enhancements for future versions:

1. **Enhanced Admin Panel**:
   - Web interface for managing bookings
   - Analytics dashboard
   - Staff schedule management

2. **Patient Portal**:
   - Secure login area
   - Treatment history
   - Appointment management
   - Document uploads

3. **Advanced Integrations**:
   - Electronic health record integration
   - Insurance verification
   - Payment processing
   - Teledentistry capabilities

4. **AI-powered chatbot**:
   - Automated appointment scheduling
   - Common question answering
   - Symptom assessment

5. **Enhanced Google Workspace Integration**:
   - Two-way calendar synchronization
   - Document storage and management
   - Staff calendar coordination

---

© 2025 Wisdom Bites Dental Clinic. All rights reserved.

## 📄 Additional Documentation

The project includes additional documentation files to help with development and troubleshooting:

1. **debug-tracker.md**: A comprehensive log of issues encountered during development and their solutions
2. **CHANGELOG.md**: Detailed history of changes to the website
3. **version_history.txt**: Simple list of version numbers and descriptions

The debug tracker is particularly useful when troubleshooting issues, as it documents common problems and their solutions in detail.
