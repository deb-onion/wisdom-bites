/**
 * Calendar Routes
 * Handles Google Calendar integration
 */

const express = require('express');
const router = express.Router();
const { calendar } = require('../config/google');
const { isAuthenticated } = require('../middlewares/auth');

/**
 * GET /api/calendar/availability
 * Get available time slots for a date range
 */
router.get('/availability', isAuthenticated, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Missing required parameters (startDate, endDate)' });
    }
    
    // Get calendar events
    const response = await calendar.events.list({
      auth: req.oauth2Client,
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      timeMin: new Date(startDate).toISOString(),
      timeMax: new Date(endDate).toISOString(),
      singleEvents: true,
      orderBy: 'startTime'
    });
    
    // Extract busy slots from events
    const busySlots = response.data.items.map(event => ({
      start: event.start.dateTime || event.start.date,
      end: event.end.dateTime || event.end.date,
      summary: event.summary || 'Busy'
    }));
    
    // Return available slots based on business hours and busy slots
    // In a real implementation, you'd need to calculate available slots based on business hours
    res.json({
      busySlots,
      message: 'Available time slots fetched successfully'
    });
  } catch (error) {
    console.error('Calendar availability error:', error);
    res.status(500).json({ message: 'Failed to get calendar availability', error: error.message });
  }
});

/**
 * POST /api/calendar/events
 * Create a new calendar event (booking)
 */
router.post('/events', isAuthenticated, async (req, res) => {
  try {
    const { 
      summary, 
      description, 
      startDateTime, 
      endDateTime,
      attendees,
      location 
    } = req.body;
    
    if (!summary || !startDateTime || !endDateTime) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }
    
    // Create event object
    const event = {
      summary,
      description,
      start: {
        dateTime: startDateTime,
        timeZone: 'UTC'
      },
      end: {
        dateTime: endDateTime,
        timeZone: 'UTC'
      },
      attendees: attendees || [],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 1 day before
          { method: 'popup', minutes: 30 } // 30 minutes before
        ]
      }
    };
    
    // Add location if provided
    if (location) {
      event.location = location;
    }
    
    // Insert event in the calendar
    const response = await calendar.events.insert({
      auth: req.oauth2Client,
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      resource: event,
      sendUpdates: 'all'
    });
    
    res.status(201).json({
      message: 'Calendar event created successfully',
      eventId: response.data.id,
      eventLink: response.data.htmlLink
    });
  } catch (error) {
    console.error('Create calendar event error:', error);
    res.status(500).json({ message: 'Failed to create calendar event', error: error.message });
  }
});

/**
 * GET /api/calendar/business-hours
 * Get business hours
 */
router.get('/business-hours', async (req, res) => {
  try {
    // You might want to store these in a database
    // For simplicity, we're hardcoding them here
    const businessHours = {
      0: [], // Sunday (closed)
      1: ['09:00', '18:00'], // Monday
      2: ['09:00', '18:00'], // Tuesday
      3: ['09:00', '18:00'], // Wednesday
      4: ['09:00', '18:00'], // Thursday
      5: ['09:00', '18:00'], // Friday
      6: ['10:00', '15:00']  // Saturday
    };
    
    res.json({
      businessHours,
      message: 'Business hours fetched successfully'
    });
  } catch (error) {
    console.error('Business hours error:', error);
    res.status(500).json({ message: 'Failed to get business hours', error: error.message });
  }
});

/**
 * DELETE /api/calendar/events/:eventId
 * Cancel/delete a calendar event
 */
router.delete('/events/:eventId', isAuthenticated, async (req, res) => {
  try {
    const { eventId } = req.params;
    
    if (!eventId) {
      return res.status(400).json({ message: 'Missing event ID' });
    }
    
    // Delete the event
    await calendar.events.delete({
      auth: req.oauth2Client,
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      eventId: eventId,
      sendUpdates: 'all'
    });
    
    res.json({ message: 'Calendar event deleted successfully' });
  } catch (error) {
    console.error('Delete calendar event error:', error);
    res.status(500).json({ message: 'Failed to delete calendar event', error: error.message });
  }
});

module.exports = router; 