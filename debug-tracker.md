# Debug Tracker - Wisdom Bites Dental Booking System

This document tracks all issues encountered during the implementation and troubleshooting of the Wisdom Bites Dental Clinic booking system, along with their solutions. This serves as a reference for future development and maintenance.

## Table of Contents

- [Google OAuth Integration Issues](#google-oauth-integration-issues)
- [Backend Configuration Issues](#backend-configuration-issues)
- [Frontend-Backend Connection Issues](#frontend-backend-connection-issues)
- [Calendar Integration Problems](#calendar-integration-problems)
- [Port Conflict Resolution](#port-conflict-resolution)
- [Backend Environment Variables](#backend-environment-variables)
- [Calendar Day Selection Issues](#calendar-day-selection-issues)
- [API Service Integration Problems](#api-service-integration-problems)
- [CORS Configuration Issues](#cors-configuration-issues)
- [Time Slot Display Problems](#time-slot-display-problems)

## Google OAuth Integration Issues

### Issue: Google OAuth Authentication Failure

**Date:** Current date

**Description:**
The Google OAuth authentication process was failing with a "redirect_uri_mismatch" error. The system was attempting to use an OAuth redirect URI that did not match what was configured in the Google Cloud Console.

**Error Message:**
```
Error 400: redirect_uri_mismatch
Access blocked: This app's request is invalid
```

**Root Cause:**
The redirect URI in the `.env` file (`http://localhost:3000/api/auth/callback`) did not match the one registered in the Google Cloud Console. Additionally, there was confusion because we changed the backend port from 3000 to 4000 to avoid conflicts with the frontend server, but didn't update all the necessary configurations.

**Solution:**
1. Updated the `.env` file to use the correct redirect URI:
   ```
   GOOGLE_REDIRECT_URI=http://localhost:4000/api/auth/callback
   ```
2. Ensured that this exact URI (including protocol, host, port, and path) was registered in the Google Cloud Console under the OAuth 2.0 Client ID.
3. Added a test route to verify the environment variables:
   ```javascript
   // Add to backend/server.js
   app.get('/api/test-config', (req, res) => {
     res.json({
       redirectUri: process.env.GOOGLE_REDIRECT_URI,
       clientId: process.env.GOOGLE_CLIENT_ID,
       port: process.env.PORT,
       allowedOrigins: process.env.ALLOWED_ORIGINS
     });
   });
   ```

**Additional Notes:**
- The exact match between the configured redirect URI and what's registered in Google Cloud Console is critical - even a trailing slash would cause the error.
- After making changes to environment variables, the server needs to be restarted for the changes to take effect.

## Backend Configuration Issues

### Issue: Missing `dev` Script in package.json

**Date:** Current date

**Description:**
When attempting to start the backend server with `npm run dev`, the command was failing because the 'dev' script was missing in the package.json file.

**Error Message:**
```
Missing script: 'dev'
```

**Root Cause:**
The user was either in the wrong directory (project root instead of backend directory) or the package.json file in the backend directory didn't have a 'dev' script defined.

**Solution:**
1. Ensured command was run from the correct directory:
   ```bash
   cd backend
   npm run dev
   ```
2. If the script was missing, we could have added it to package.json:
   ```json
   "scripts": {
     "dev": "nodemon server.js",
     // other scripts...
   }
   ```

## Frontend-Backend Connection Issues

### Issue: Port Conflict Between Frontend and Backend

**Date:** Current date

**Description:**
Both the frontend and backend servers were configured to run on port 3000, causing conflicts when both needed to run simultaneously.

**Root Cause:**
The default configuration had both services using the same port (3000), which is not possible as only one service can bind to a specific port at a time.

**Solution:**
1. Updated the backend port to 4000 in the `.env` file:
   ```
   PORT=4000
   ```
2. Updated the API service in the frontend to use the new port:
   ```javascript
   // In assets/js/api-service.js
   apiBaseUrl: 'http://localhost:4000/api'
   ```
3. Updated CORS settings to allow both ports:
   ```
   ALLOWED_ORIGINS=http://localhost:3000,http://localhost:4000,https://wisdombites.com
   ```
4. Updated the Google redirect URI to use the new port:
   ```
   GOOGLE_REDIRECT_URI=http://localhost:4000/api/auth/callback
   ```

**Additional Notes:**
- Using different ports for frontend and backend is a common practice in development to avoid conflicts.
- This setup allows both services to run concurrently during development.

## Calendar Integration Problems

### Issue: Calendar Dates Not Clickable

**Date:** Current date

**Description:**
The calendar dates in the booking form were not clickable, preventing users from selecting appointment dates.

**Error Messages:**
```
TypeError: Cannot read properties of null (reading 'addEventListener')
Cannot find calendar container
```

**Root Cause:**
Multiple issues contributed to this problem:
1. The `handleUrlParameters` function was missing
2. There were inconsistencies in the element references for calendar navigation buttons
3. The calendar container wasn't being found correctly
4. Calendar days lacked appropriate CSS styling for visual feedback on interaction
5. The `api-service.js` file was not being loaded correctly before the booking script

**Solution:**
1. Added the missing `handleUrlParameters` function to handle URL parameters if present:
   ```javascript
   handleUrlParameters() {
     // Get URL parameters
     const urlParams = new URLSearchParams(window.location.search);
     console.log("URL parameters:", urlParams.toString());
     
     // Handle specific parameters if needed
     if (urlParams.has('step')) {
       const step = parseInt(urlParams.get('step'), 10);
       if (!isNaN(step) && step > 0 && step <= this.totalSteps) {
         console.log(`Setting step to ${step} from URL parameter`);
         this.goToStep(step);
       }
     }
   }
   ```

2. Fixed inconsistent element references by ensuring proper naming:
   ```javascript
   // Changed
   this.prevMonthBtn = document.getElementById('prevMonth');
   this.nextMonthBtn = document.getElementById('nextMonth');
   
   // To
   this.prevMonthButton = document.getElementById('prevMonth');
   this.nextMonthButton = document.getElementById('nextMonth');
   ```

3. Added fallback selectors to locate calendar elements if they were not found initially:
   ```javascript
   if (!this.calendarContainer) {
     console.warn("Calendar container not found with initial selector, trying fallback");
     this.calendarContainer = document.querySelector('.booking-calendar');
   }
   ```

4. Added CSS to improve calendar day styling for better visual feedback:
   ```css
   .calendar-day:not(.disabled):not(.empty) {
     cursor: pointer;
     transition: background-color 0.2s, transform 0.1s;
   }
   
   .calendar-day:not(.disabled):not(.empty):hover {
     background-color: rgba(74, 144, 226, 0.1);
     transform: scale(1.05);
   }
   
   .calendar-day.selected {
     background-color: #4a90e2 !important;
     color: white !important;
     font-weight: bold;
     transform: scale(1.05);
   }
   ```

5. Fixed script loading order in `booking.html`:
   ```html
   <!-- Load API Service before booking.js -->
   <script src="assets/js/api-service.js"></script>
   <script src="assets/js/booking.js"></script>
   ```

6. Added backup direct DOM event listeners for calendar days:
   ```javascript
   document.addEventListener('DOMContentLoaded', function() {
     // Add direct event listeners as a backup
     setTimeout(() => {
       const calendarDays = document.querySelectorAll('.calendar-day:not(.disabled):not(.empty)');
       console.log('Found calendar days for direct event binding:', calendarDays.length);
       
       calendarDays.forEach(day => {
         // Only add if no click handler exists
         if (!day._hasClickHandler) {
           day._hasClickHandler = true;
           day.addEventListener('click', function() {
             console.log('Direct click on calendar day:', day.dataset.date);
             
             // Update hidden input
             const dateInput = document.getElementById('selected-date');
             if (dateInput) {
               dateInput.value = day.dataset.date;
             }
             
             // Remove selected class from all days
             document.querySelectorAll('.calendar-day.selected').forEach(selected => {
               selected.classList.remove('selected');
             });
             
             // Add selected class to clicked day
             day.classList.add('selected');
             
             // Update display if available
             const displayElement = document.getElementById('selectedDateDisplay');
             if (displayElement) {
               const date = new Date(day.dataset.date);
               const formattedDate = date.toLocaleDateString('en-US', { 
                 weekday: 'long', 
                 year: 'numeric', 
                 month: 'long', 
                 day: 'numeric' 
               });
               displayElement.textContent = formattedDate;
             }
             
             // Call BookingSystem function if available
             if (window.BookingSystem && typeof window.BookingSystem.selectDate === 'function') {
               window.BookingSystem.selectDate(day, day.dataset.date);
             }
           });
         }
       });
     }, 1000); // Give main script time to initialize first
   });
   ```

**Additional Notes:**
- Added extensive console logging throughout the code to help diagnose the issues.
- Used a multi-pronged approach with backup strategies to ensure calendar functionality even if primary event binding failed.

## API Service Integration Problems

### Issue: API Service Not Being Loaded

**Date:** Current date

**Description:**
The API service (`api-service.js`) was not being loaded on the booking page, causing the booking system to fail when trying to access the API service.

**Error Messages:**
```
Uncaught ReferenceError: ApiService is not defined
```

**Root Cause:**
The `api-service.js` script was not included in the booking.html file, or was included after other scripts that depend on it.

**Solution:**
1. Added the script tag for the API service in booking.html:
   ```html
   <script src="assets/js/api-service.js"></script>
   ```

2. Ensured it was placed before any scripts that depend on it:
   ```html
   <!-- Correct loading order -->
   <script src="assets/js/api-service.js"></script>
   <script src="assets/js/booking.js"></script>
   ```

3. Removed the `defer` attribute from the booking.js script to ensure proper execution order:
   ```html
   <!-- Changed from -->
   <script src="assets/js/booking.js" defer></script>
   
   <!-- To -->
   <script src="assets/js/booking.js"></script>
   ```

## Backend Environment Variables

### Issue: Difficulty Updating `.env` File in PowerShell

**Date:** Current date

**Description:**
There were difficulties updating the `PORT` variable in the `.env` file using PowerShell commands.

**Root Cause:**
PowerShell syntax requires specific approaches to modify file content.

**Solution:**
Used a different PowerShell command pattern to update the file:
```powershell
(Get-Content -Path .env) -replace "PORT=3000", "PORT=4000" | Set-Content -Path .env
```

This approach reads the file content, performs the replacement, and writes it back to the file.

## Calendar Day Selection Issues

### Issue: Calendar Initialization Failing

**Date:** Current date

**Description:**
The calendar was not properly initializing, which prevented date selection in the booking form.

**Root Cause:**
Several issues contributed to this problem:
1. The `BookingSystem.init()` function wasn't finding all necessary elements
2. Debug logging was insufficient to pinpoint the exact failure point
3. Element selectors and event listeners were inconsistent

**Solution:**
1. Enhanced the `cacheElements` function with better error handling and fallbacks:
   ```javascript
   cacheElements() {
     console.log("Caching DOM elements...");
     
     // Form elements
     this.bookingForm = document.getElementById('booking-form');
     this.formSteps = document.querySelectorAll('.form-step');
     this.totalSteps = this.formSteps.length;
     console.log(`Found ${this.totalSteps} form steps`);
     
     // Navigation buttons
     this.nextButtons = document.querySelectorAll('.next-step');
     this.prevButtons = document.querySelectorAll('.prev-step');
     
     // Calendar elements with fallbacks
     this.calendarContainer = document.getElementById('calendar-container');
     if (!this.calendarContainer) {
       console.warn("Calendar container not found with ID, trying class selector");
       this.calendarContainer = document.querySelector('.booking-calendar');
     }
     
     // Add debug output for calendar container
     if (this.calendarContainer) {
       console.log("Found calendar container:", this.calendarContainer);
     } else {
       console.error("CRITICAL: Could not find calendar container with any selector");
     }
     
     this.calendarMonthYear = document.getElementById('calendar-month-year');
     this.calendarGrid = document.getElementById('calendar-grid');
     this.prevMonthButton = document.getElementById('prevMonth');
     this.nextMonthButton = document.getElementById('nextMonth');
     this.selectedDateDisplay = document.getElementById('selectedDateDisplay');
     
     // Debug output for all calendar elements
     console.log({
       calendarMonthYear: this.calendarMonthYear,
       calendarGrid: this.calendarGrid,
       prevMonthButton: this.prevMonthButton,
       nextMonthButton: this.nextMonthButton,
       selectedDateDisplay: this.selectedDateDisplay
     });
   }
   ```

2. Added comprehensive logging throughout the code to identify failures:
   ```javascript
   initCalendar() {
     console.log("Initializing calendar...");
     
     if (!this.calendarContainer || !this.calendarGrid) {
       console.error("Cannot initialize calendar - container or grid not found");
       return false;
     }
     
     // Set current month and year
     this.currentMonth = new Date().getMonth();
     this.currentYear = new Date().getFullYear();
     
     // Generate initial month
     this.generateCalendarMonth(this.currentMonth, this.currentYear);
     
     // Add event listeners for month navigation
     if (this.prevMonthButton) {
       console.log("Adding event listener to prevMonthButton");
       this.prevMonthButton.addEventListener('click', () => {
         this.navigateMonth(-1);
       });
     } else {
       console.error("Previous month button not found");
     }
     
     if (this.nextMonthButton) {
       console.log("Adding event listener to nextMonthButton");
       this.nextMonthButton.addEventListener('click', () => {
         this.navigateMonth(1);
       });
     } else {
       console.error("Next month button not found");
     }
     
     console.log("Calendar initialization complete");
     return true;
   }
   ```

3. Added a direct DOM-level solution as a backup to ensure functionality:
   ```javascript
   // Direct DOM fallback for calendar day clicks
   window.addEventListener('load', function() {
     setTimeout(() => {
       console.log("Checking for interactive calendar days...");
       const calendarDays = document.querySelectorAll('.calendar-day:not(.disabled):not(.empty)');
       console.log(`Found ${calendarDays.length} interactive calendar days`);
       
       calendarDays.forEach(day => {
         // Only add if no click handler exists
         if (!day._hasClickHandler) {
           day._hasClickHandler = true;
           day.style.cursor = 'pointer';
           day.addEventListener('click', function() {
             console.log('Direct click on calendar day:', day.dataset.date);
             // Call BookingSystem function if available
             if (window.BookingSystem && typeof window.BookingSystem.selectDate === 'function') {
               window.BookingSystem.selectDate(day, day.dataset.date);
             }
           });
         }
       });
     }, 1000);
   });
   ```

**Additional Notes:**
- The approach of having multiple solutions (main implementation plus fallbacks) ensures robustness in the face of unexpected DOM issues.
- Console logging proved crucial in diagnosing the exact point of failure in the calendar initialization process.

## CORS Configuration Issues

### Issue: CORS Blocking API Requests

**Date:** Current date

**Description:**
Even after fixing the backend connection and getting the server running, API requests from the frontend to the backend are being blocked by CORS policy, specifically due to missing credentials handling.

**Error Message:**
```
Access to fetch at 'http://localhost:4000/api/calendar/availability' from origin 'http://localhost:3000' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: The value of the 'Access-Control-Allow-Credentials' header in the response is '' which must be 'true' when the request's credentials mode is 'include'.
```

**Root Cause:**
The CORS configuration in the backend server doesn't include support for credentials, but the frontend is sending credentials with the request. This mismatch causes the browser to block the requests for security reasons.

**Solution:**
1. Update the CORS configuration in `server.js` to include credentials support:

```javascript
// Current CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS.split(',')
}));

// Updated CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS.split(','),
  credentials: true,
  optionsSuccessStatus: 200
}));
```

2. Ensure the API service in the frontend is correctly configured to include credentials:

```javascript
// In assets/js/api-service.js
fetch(url, {
  method: method,
  headers: headers,
  credentials: 'include',  // Add this line
  body: method !== 'GET' ? JSON.stringify(data) : undefined
})
```

**Status:**
- Backend server is running successfully on port 4000
- Authentication with Google is working (`GET /api/auth/status` returns `{"authenticated":true}`)
- API endpoint `/api/calendar/availability` is functioning (returns busy slots when called directly)
- Frontend can connect to backend (health check passes)
- CORS configuration needs to be updated to allow credentials

## Time Slot Display Problems

### Issue: Time Slots Not Displayed After Date Selection

**Date:** Current date

**Description:**
After selecting a date in the calendar, the time slots for that date are not being displayed, even though the date selection itself is working correctly.

**Error Message:**
```
booking:922 BookingSystem not available, using basic selection only
```

**Root Cause:**
Multiple issues are contributing to this problem:
1. The CORS error is preventing real availability data from being fetched
2. The fallback to mock data is not properly displaying time slots
3. The BookingSystem object may not be fully initialized when trying to show time slots

**Diagnosis Steps Performed:**
1. Verified backend server is running (confirmed via health check endpoint)
2. Confirmed authentication is working (API returns `{"authenticated":true}`)
3. Tested calendar availability endpoint directly (returns busy slots successfully)
4. Verified the calendar date selection is working (dates are clickable and selectable)
5. Checked browser console for errors (found CORS errors and BookingSystem availability issues)

**Solution:**
1. Fix the CORS configuration as described in the CORS Configuration Issues section
2. Add debugging to ensure time slot container is properly initialized and populated:

```javascript
// Add this to BookingSystem.updateTimeSlots method to help debug
console.log("Time slot container:", document.getElementById('time-slots-container'));
console.log("Available time slots:", this.timeSlots);
```

3. Verify the HTML structure in booking.html for the time slot container:
   - Check for presence of `#time-slots-container`
   - Ensure time slot elements have proper CSS for visibility

**Alternative Quick Fix for Testing:**
For testing purposes, force the system to use mock data by adding this to the browser console:

```javascript
window.useMockDataOnly = true;
```

**Status:**
- Calendar date selection is working correctly
- The BookingSystem is initializing and dates are clickable
- Mock data generation appears to be working (`Mock data generated with slots for 21 days`)
- Time slot display is still not functioning properly

## Summary of Current Status and Next Steps

### What's Working:
- Backend server runs correctly on port 4000
- Google OAuth authentication is successful
- Calendar date selection is working properly
- Communication between frontend and backend for health and status endpoints
- Mock data generation for availability

### What's Not Working:
- CORS is blocking calendar availability API requests
- Time slots are not displaying after date selection
- Several UI resources (images, CSS) are returning 404 Not Found

### Recommended Next Steps:
1. Update CORS configuration in backend to support credentials
2. Verify time slot container HTML structure and styling
3. Fix or create missing UI resources (images, CSS files)
4. Add more robust error handling and logging to the time slot selection process
5. Test with both real and mock data to ensure time slots display correctly

### Commands to Run Backend Successfully:
```powershell
# Navigate to backend directory
cd D:\work\widom-bites-dental\backend

# Start the backend server
npm run dev
```

### Commands to Run Frontend Successfully:
```powershell
# Navigate to project root directory (in a separate terminal)
cd D:\work\widom-bites-dental

# Start the frontend server
npx http-server . -p 3000
``` 