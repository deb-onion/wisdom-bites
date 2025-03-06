/**
 * Sheets Routes
 * Handles Google Sheets integration
 */

const express = require('express');
const router = express.Router();
const { sheets } = require('../config/google');
const { isAuthenticated } = require('../middlewares/auth');

/**
 * POST /api/sheets/bookings
 * Store booking information in Google Sheets
 */
router.post('/bookings', isAuthenticated, async (req, res) => {
  try {
    // Get booking data from request body
    const bookingData = req.body;
    
    if (!bookingData) {
      return res.status(400).json({ message: 'Missing booking data' });
    }
    
    // Convert booking object to array of values
    const bookingDate = new Date().toISOString();
    const bookingValues = [
      bookingDate, // Timestamp
      bookingData.firstName || '',
      bookingData.lastName || '',
      bookingData.email || '',
      bookingData.phone || '',
      bookingData.patientType || '',
      bookingData.serviceCategory || '',
      bookingData.specificService || '',
      bookingData.preferredDentist || '',
      bookingData.appointmentDate || '',
      bookingData.selectedTime || '',
      bookingData.notes || ''
    ];
    
    // Append data to the sheet
    const response = await sheets.spreadsheets.values.append({
      auth: req.oauth2Client,
      spreadsheetId: process.env.GOOGLE_SHEETS_BOOKING_SPREADSHEET_ID,
      range: 'Bookings!A:L', // Assumes you have headers in row 1
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values: [bookingValues]
      }
    });
    
    res.status(201).json({
      message: 'Booking saved to Google Sheets successfully',
      updatedRange: response.data.updates.updatedRange,
      updatedRows: response.data.updates.updatedRows
    });
  } catch (error) {
    console.error('Google Sheets error:', error);
    res.status(500).json({ message: 'Failed to save booking to Google Sheets', error: error.message });
  }
});

/**
 * GET /api/sheets/setup
 * Initialize the Google Sheet with headers if it doesn't exist
 */
router.get('/setup', isAuthenticated, async (req, res) => {
  try {
    // Define headers for the bookings sheet
    const headers = [
      'Timestamp',
      'First Name',
      'Last Name',
      'Email',
      'Phone',
      'Patient Type',
      'Service Category',
      'Specific Service',
      'Preferred Dentist',
      'Appointment Date',
      'Appointment Time',
      'Notes'
    ];
    
    // First, check if the spreadsheet exists and get information about it
    const spreadsheetInfo = await sheets.spreadsheets.get({
      auth: req.oauth2Client,
      spreadsheetId: process.env.GOOGLE_SHEETS_BOOKING_SPREADSHEET_ID,
    });
    
    // Check if "Bookings" sheet exists
    let bookingsSheetExists = false;
    let bookingsSheetId = 0;
    
    for (const sheet of spreadsheetInfo.data.sheets) {
      if (sheet.properties.title === 'Bookings') {
        bookingsSheetExists = true;
        bookingsSheetId = sheet.properties.sheetId;
        break;
      }
    }
    
    // If "Bookings" sheet doesn't exist, create it
    if (!bookingsSheetExists) {
      console.log('Creating Bookings sheet...');
      const addSheetResponse = await sheets.spreadsheets.batchUpdate({
        auth: req.oauth2Client,
        spreadsheetId: process.env.GOOGLE_SHEETS_BOOKING_SPREADSHEET_ID,
        resource: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: 'Bookings'
                }
              }
            }
          ]
        }
      });
      
      // Get the new sheet ID
      bookingsSheetId = addSheetResponse.data.replies[0].addSheet.properties.sheetId;
      console.log('Bookings sheet created with ID:', bookingsSheetId);
    }
    
    // Now check if the sheet already has headers
    try {
      const checkResponse = await sheets.spreadsheets.values.get({
        auth: req.oauth2Client,
        spreadsheetId: process.env.GOOGLE_SHEETS_BOOKING_SPREADSHEET_ID,
        range: 'Bookings!A1:L1'
      });
      
      // If A1 is empty, add headers
      if (!checkResponse.data.values || checkResponse.data.values.length === 0) {
        await sheets.spreadsheets.values.update({
          auth: req.oauth2Client,
          spreadsheetId: process.env.GOOGLE_SHEETS_BOOKING_SPREADSHEET_ID,
          range: 'Bookings!A1:L1',
          valueInputOption: 'USER_ENTERED',
          resource: {
            values: [headers]
          }
        });
        
        // Format headers (make bold, freeze row, etc.)
        await sheets.spreadsheets.batchUpdate({
          auth: req.oauth2Client,
          spreadsheetId: process.env.GOOGLE_SHEETS_BOOKING_SPREADSHEET_ID,
          resource: {
            requests: [
              {
                updateSheetProperties: {
                  properties: {
                    gridProperties: {
                      frozenRowCount: 1
                    },
                    sheetId: bookingsSheetId
                  },
                  fields: 'gridProperties.frozenRowCount'
                }
              },
              {
                repeatCell: {
                  range: {
                    sheetId: bookingsSheetId,
                    startRowIndex: 0,
                    endRowIndex: 1,
                    startColumnIndex: 0,
                    endColumnIndex: headers.length
                  },
                  cell: {
                    userEnteredFormat: {
                      textFormat: {
                        bold: true
                      },
                      backgroundColor: {
                        red: 0.9,
                        green: 0.9,
                        blue: 0.9
                      }
                    }
                  },
                  fields: 'userEnteredFormat(textFormat,backgroundColor)'
                }
              }
            ]
          }
        });
        
        res.json({ message: 'Google Sheet initialized with headers' });
      } else {
        res.json({ message: 'Google Sheet is already set up' });
      }
    } catch (error) {
      console.error('Error checking or adding headers:', error);
      res.status(500).json({ 
        message: 'Failed to set up Google Sheet headers', 
        error: error.message 
      });
    }
  } catch (error) {
    console.error('Google Sheets setup error:', error);
    res.status(500).json({ 
      message: 'Failed to set up Google Sheet', 
      error: error.message 
    });
  }
});

/**
 * GET /api/sheets/bookings
 * Get recent bookings (admin only)
 */
router.get('/bookings', isAuthenticated, async (req, res) => {
  try {
    // Get recent bookings (limit to 100 for performance)
    const response = await sheets.spreadsheets.values.get({
      auth: req.oauth2Client,
      spreadsheetId: process.env.GOOGLE_SHEETS_BOOKING_SPREADSHEET_ID,
      range: 'Bookings!A2:L101', // Skip header row
    });
    
    const rows = response.data.values || [];
    
    // Convert rows to objects
    const bookings = rows.map(row => ({
      timestamp: row[0] || '',
      firstName: row[1] || '',
      lastName: row[2] || '',
      email: row[3] || '',
      phone: row[4] || '',
      patientType: row[5] || '',
      serviceCategory: row[6] || '',
      specificService: row[7] || '',
      preferredDentist: row[8] || '',
      appointmentDate: row[9] || '',
      appointmentTime: row[10] || '',
      notes: row[11] || ''
    }));
    
    res.json({
      bookings,
      count: bookings.length,
      message: 'Recent bookings fetched successfully'
    });
  } catch (error) {
    console.error('Google Sheets bookings error:', error);
    res.status(500).json({ message: 'Failed to get bookings from Google Sheets', error: error.message });
  }
});

module.exports = router; 