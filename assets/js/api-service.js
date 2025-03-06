/**
 * Wisdom Bites Dental Clinic
 * API Service for Google API Direct Integration
 * 
 * This service provides an interface to communicate with the backend API
 * that directly integrates with Google services.
 */

"use strict";

const ApiService = {
    // Configuration options
    config: {
        // API base URL - Change this to your production URL when deployed
        apiBaseUrl: 'http://localhost:4000/api',
        
        // Request timeout in milliseconds
        timeout: 20000,
        
        // Default headers
        headers: {
            'Content-Type': 'application/json'
        }
    },
    
    /**
     * Initialize the API service
     */
    init: function() {
        console.log('Initializing API Service');
        
        // Check if we're on a local environment
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            this.config.apiBaseUrl = 'http://localhost:4000/api';
        } else {
            // Use the production API URL
            this.config.apiBaseUrl = '/api';
        }
    },
    
    /**
     * Generic fetch method with proper error handling
     * @param {string} endpoint - The API endpoint
     * @param {Object} options - Fetch options
     * @returns {Promise} - Response promise
     */
    fetch: async function(endpoint, options = {}) {
        // Prepare the request URL
        const url = `${this.config.apiBaseUrl}${endpoint}`;
        
        // Merge default headers with custom headers
        const headers = { ...this.config.headers, ...options.headers };
        
        // Create fetch options
        const fetchOptions = {
            method: options.method || 'GET',
            headers,
            credentials: 'include', // Include cookies for auth
            ...options
        };
        
        // If there's a body, stringify it
        if (options.body && typeof options.body === 'object') {
            fetchOptions.body = JSON.stringify(options.body);
        }
        
        // Create timeout promise
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Request timeout')), this.config.timeout);
        });
        
        try {
            // Race between fetch and timeout
            const response = await Promise.race([
                fetch(url, fetchOptions),
                timeoutPromise
            ]);
            
            // Handle HTTP errors
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error ${response.status}`);
            }
            
            // Parse response as JSON
            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`API request error (${endpoint}):`, error);
            throw error;
        }
    },
    
    /**
     * Check authentication status
     * @returns {Promise} - Auth status
     */
    checkAuth: async function() {
        return this.fetch('/auth/status');
    },
    
    /**
     * Get login URL
     * @returns {string} - Login URL
     */
    getLoginUrl: function() {
        return `${this.config.apiBaseUrl}/auth/login`;
    },
    
    /**
     * Logout from the Google integration
     * @returns {Promise} - Logout result
     */
    logout: async function() {
        return this.fetch('/auth/logout');
    },
    
    /**
     * Get available appointment slots
     * @param {string} startDate - Start date (ISO format)
     * @param {string} endDate - End date (ISO format)
     * @returns {Promise} - Available slots
     */
    getAvailability: async function(startDate, endDate) {
        return this.fetch(`/calendar/availability?startDate=${startDate}&endDate=${endDate}`);
    },
    
    /**
     * Get business hours
     * @returns {Promise} - Business hours
     */
    getBusinessHours: async function() {
        return this.fetch('/calendar/business-hours');
    },
    
    /**
     * Create a calendar event (booking)
     * @param {Object} bookingData - Booking data
     * @returns {Promise} - Booking result
     */
    createBooking: async function(bookingData) {
        return this.fetch('/calendar/events', {
            method: 'POST',
            body: bookingData
        });
    },
    
    /**
     * Save booking to Google Sheets
     * @param {Object} bookingData - Booking data
     * @returns {Promise} - Sheets result
     */
    saveBookingToSheets: async function(bookingData) {
        return this.fetch('/sheets/bookings', {
            method: 'POST',
            body: bookingData
        });
    },
    
    /**
     * Send booking confirmation email
     * @param {Object} booking - Booking data
     * @returns {Promise} - Email result
     */
    sendBookingConfirmation: async function(booking) {
        return this.fetch('/gmail/booking-confirmation', {
            method: 'POST',
            body: { booking }
        });
    },
    
    /**
     * Submit a complete booking
     * This will create a calendar event, save to sheets, and send email
     * @param {Object} bookingData - Complete booking data
     * @returns {Promise} - Booking result with all operations
     */
    submitBooking: async function(bookingData) {
        try {
            // Step 1: Create calendar event
            const calendarResult = await this.createBooking({
                summary: `Dental Appointment: ${bookingData.firstName} ${bookingData.lastName}`,
                description: `Service: ${bookingData.specificService}\nNotes: ${bookingData.notes || 'None'}`,
                startDateTime: `${bookingData.appointmentDate}T${bookingData.selectedTime}:00`,
                endDateTime: this.calculateEndTime(bookingData.appointmentDate, bookingData.selectedTime),
                attendees: [{ email: bookingData.email }],
                location: '1/4A, North Road, Poddar Nagar, Jadavpur, Kolkata, India'
            });
            
            // Step 2: Save to Google Sheets
            const sheetsResult = await this.saveBookingToSheets(bookingData);
            
            // Step 3: Send confirmation email
            const emailResult = await this.sendBookingConfirmation(bookingData);
            
            return {
                success: true,
                calendarEvent: calendarResult,
                sheetsResult,
                emailResult,
                message: 'Booking completed successfully'
            };
        } catch (error) {
            console.error('Complete booking error:', error);
            throw error;
        }
    },
    
    /**
     * Calculate end time for appointment
     * @param {string} date - Appointment date
     * @param {string} startTime - Start time (HH:MM)
     * @param {number} durationMinutes - Duration in minutes (default 30)
     * @returns {string} - End time in ISO format
     */
    calculateEndTime: function(date, startTime, durationMinutes = 30) {
        const startDateTime = new Date(`${date}T${startTime}:00`);
        const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60000);
        return endDateTime.toISOString();
    }
};

// Initialize the API service when the script loads
ApiService.init(); 