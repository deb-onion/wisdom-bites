/**
 * Wisdom Bites Dental Clinic
 * Enhanced Booking Page JavaScript
 * Version: 4.0.0
 * 
 * This file contains improved functionality for the booking page including:
 * - Enhanced calendar interface with real available slots
 * - Google Sheets integration for form submission
 * - User tracking metrics
 */

"use strict";

// Enhanced Booking System
const EnhancedBookingSystem = {
    // Configuration options
    config: {
        dateFormat: 'YYYY-MM-DD',
        timeSlotDuration: 30, // in minutes
        maxBookingDays: 60,   // number of days in advance that can be booked
        maxAppointmentsPerDay: 16,
        startingHour: {
            weekday: 9,  // 9 AM on weekdays
            saturday: 10 // 10 AM on Saturdays
        },
        endingHour: {
            weekday: 18, // 6 PM on weekdays
            saturday: 15 // 3 PM on Saturdays
        },
        closedDays: [0], // Sunday (0) is closed
        googleScriptUrl: 'https://script.google.com/macros/s/AKfycbwEewRhwAIwqxYmaU0GJvhVN2pasBj1umCVhKxzZwa80XAzLcPBBetbyH2L-y_OsctQ/exec', // Will be replaced with actual script ID
        analyticsEndpoint:'https://script.google.com/macros/s/AKfycbwEewRhwAIwqxYmaU0GJvhVN2pasBj1umCVhKxzZwa80XAzLcPBBetbyH2L-y_OsctQ/exec', // Will be replaced with actual script ID for analytics
    },
    
    // DOM elements cache
    elements: {},
    
    // State variables
    state: {
        currentStep: 1,
        selectedDate: null,
        selectedTime: null,
        serviceCategory: '',
        specificService: '',
        preferredDentist: '',
        availableTimeSlots: {}, // Will be populated from Google Sheets
        sessionId: '',
        formData: {},
        submitting: false,
    },
    
    /**
     * Initialize booking system
     */
    init: function() {
        // Cache DOM elements
        this.cacheElements();
        
        // Generate session ID for tracking
        this.generateSessionId();
        
        // Track page visit
        this.trackPageVisit();
        
        // Initialize components
        this.initFormSteps();
        this.initServiceSelection();
        this.initEnhancedCalendar();
        this.initFormValidation();
        this.fetchAvailableTimeSlots();
        
        // Handle URL parameters
        this.handleUrlParameters();
        
        // Bind events
        this.bindEvents();
        
        console.log('Enhanced Booking system initialized');
    },
    
    /**
     * Generate unique session ID for tracking
     */
    generateSessionId: function() {
        this.state.sessionId = 'WB-' + Date.now() + '-' + Math.floor(Math.random() * 1000000);
        localStorage.setItem('wb_session_id', this.state.sessionId);
    },
    
    /**
     * Track page visit to Google Sheets
     */
    trackPageVisit: function() {
        const trackingData = {
            event: 'page_visit',
            sessionId: this.state.sessionId,
            page: 'booking',
            timestamp: new Date().toISOString(),
            referrer: document.referrer || 'direct',
            userAgent: navigator.userAgent,
            screenSize: `${window.innerWidth}x${window.innerHeight}`
        };
        
        // Send tracking data
        this.sendAnalyticsData(trackingData);
    },
    
    /**
     * Send analytics data to Google Sheets
     */
    sendAnalyticsData: function(data) {
        // Don't send analytics in development mode
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log('Analytics data (dev mode):', data);
            return;
        }
        
        fetch(this.config.analyticsEndpoint, {
            method: 'POST',
            mode: 'no-cors', // Required for Google Apps Script
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        }).catch(error => {
            console.error('Analytics error:', error);
        });
    },
    
    /**
     * Cache DOM elements for better performance
     */
    cacheElements: function() {
        // Form and steps
        this.elements.bookingForm = document.getElementById('booking-form');
        this.elements.formSteps = document.querySelectorAll('.form-step');
        this.elements.progressSteps = document.querySelectorAll('.progress-step');
        this.elements.nextButtons = document.querySelectorAll('.next-step');
        this.elements.prevButtons = document.querySelectorAll('.prev-step');
        
        // Service selection
        this.elements.serviceCategory = document.getElementById('service-category');
        this.elements.specificService = document.getElementById('specific-service');
        this.elements.preferredDentist = document.getElementById('preferred-dentist');
        
        // Date and time selection
        this.elements.calendarContainer = document.querySelector('.calendar-container');
        this.elements.calendarGrid = document.querySelector('.calendar-grid');
        this.elements.calendarMonth = document.querySelector('.calendar-month');
        this.elements.prevMonthButton = document.querySelector('.prev-month');
        this.elements.nextMonthButton = document.querySelector('.next-month');
        this.elements.timeSlotContainer = document.querySelector('.time-slots');
        this.elements.selectedDateDisplay = document.querySelector('.selected-date');
        
        // Input fields
        this.elements.appointmentDateInput = document.getElementById('appointment-date');
        this.elements.selectedDateInput = document.getElementById('selected-date');
        this.elements.selectedTimeInput = document.getElementById('selected-time');
        
        // Summary elements
        this.elements.summaryName = document.getElementById('summary-name');
        this.elements.summaryService = document.getElementById('summary-service');
        this.elements.summaryDentist = document.getElementById('summary-dentist');
        this.elements.summaryDatetime = document.getElementById('summary-datetime');
        
        // Loading indicator (create if doesn't exist)
        if (!document.getElementById('loading-indicator')) {
            const loadingIndicator = document.createElement('div');
            loadingIndicator.id = 'loading-indicator';
            loadingIndicator.className = 'loading-indicator';
            loadingIndicator.innerHTML = `
                <div class="loading-spinner"></div>
                <p>Processing your request...</p>
            `;
            document.body.appendChild(loadingIndicator);
            this.elements.loadingIndicator = loadingIndicator;
        } else {
            this.elements.loadingIndicator = document.getElementById('loading-indicator');
        }
    },
    
    /**
     * Bind events
     */
    bindEvents: function() {
        // Form submission
        if (this.elements.bookingForm) {
            this.elements.bookingForm.addEventListener('submit', this.handleFormSubmit.bind(this));
        }
        
        // Track form field changes
        const formFields = document.querySelectorAll('input, select, textarea');
        formFields.forEach(field => {
            field.addEventListener('change', this.trackFieldChange.bind(this));
        });
    },
    
    /**
     * Track field changes for analytics
     */
    trackFieldChange: function(event) {
        const field = event.target;
        const fieldName = field.name || field.id;
        const fieldType = field.type;
        let fieldValue = field.value;
        
        // Don't track sensitive information like email or phone
        if (fieldName.includes('email') || fieldName.includes('phone')) {
            fieldValue = '[REDACTED]';
        }
        
        // Track field change
        const trackingData = {
            event: 'field_change',
            sessionId: this.state.sessionId,
            fieldName: fieldName,
            fieldType: fieldType,
            fieldValue: fieldValue,
            timestamp: new Date().toISOString()
        };
        
        this.sendAnalyticsData(trackingData);
    },
    
    /**
     * Format date to YYYY-MM-DD string
     */
    formatDate: function(date) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    },
    
    /**
     * Parse date string to Date object
     */
    parseDate: function(dateString) {
        const [year, month, day] = dateString.split('-').map(Number);
        return new Date(year, month - 1, day);
    },
    
    /**
     * Initialize multi-step form
     */
    initFormSteps: function() {
        // Add click event to next buttons
        this.elements.nextButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Track step progression
                this.trackStepProgression('next', this.state.currentStep);
                this.goToNextStep();
            });
        });
        
        // Add click event to previous buttons
        this.elements.prevButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Track step progression
                this.trackStepProgression('back', this.state.currentStep);
                this.goToPrevStep();
            });
        });
        
        // Set initial state
        this.updateStepDisplay();
    },
    
    /**
     * Track form step progression for analytics
     */
    trackStepProgression: function(direction, fromStep) {
        const trackingData = {
            event: 'form_navigation',
            sessionId: this.state.sessionId,
            direction: direction,
            fromStep: fromStep,
            toStep: direction === 'next' ? fromStep + 1 : fromStep - 1,
            timestamp: new Date().toISOString()
        };
        
        this.sendAnalyticsData(trackingData);
    },
    
    /**
     * Go to next form step
     */
    goToNextStep: function() {
        // Validate current step
        if (!this.validateStep(this.state.currentStep)) {
            return false;
        }
        
        // Move to next step if validation passes
        if (this.state.currentStep < this.elements.formSteps.length) {
            this.state.currentStep++;
            this.updateStepDisplay();
            
            // If moving to confirmation step, update summary
            if (this.state.currentStep === 4) {
                this.updateConfirmationSummary();
            }
            
            // Scroll to top of form
            this.elements.bookingForm.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            
            return true;
        }
        
        return false;
    },
    
    /**
     * Go to previous form step
     */
    goToPrevStep: function() {
        if (this.state.currentStep > 1) {
            this.state.currentStep--;
            this.updateStepDisplay();
            
            // Scroll to top of form
            this.elements.bookingForm.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            
            return true;
        }
        
        return false;
    },
    
    /**
     * Update step display based on current step
     */
    updateStepDisplay: function() {
        // Update form steps visibility
        this.elements.formSteps.forEach((step, index) => {
            if (index + 1 === this.state.currentStep) {
                step.classList.remove('hidden');
            } else {
                step.classList.add('hidden');
            }
        });
        
        // Update progress steps
        this.elements.progressSteps.forEach((step, index) => {
            if (index + 1 <= this.state.currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
    },
    
    /**
     * Validate current step
     */
    validateStep: function(stepNumber) {
        const currentStepElement = this.elements.formSteps[stepNumber - 1];
        if (!currentStepElement) return true;
        
        let isValid = true;
        
        // Get all required inputs in current step
        const requiredInputs = currentStepElement.querySelectorAll('input[required], select[required], textarea[required]');
        
        // Validate each required input
        requiredInputs.forEach(input => {
            // Skip validation for hidden inputs
            if (input.type === 'hidden') return;
            
            const value = input.value.trim();
            const formGroup = input.closest('.form-group');
            
            if (!formGroup) return;
            
            // Clear previous validation
            formGroup.classList.remove('is-invalid', 'is-valid');
            
            // Get or create feedback element
            let feedback = formGroup.querySelector('.invalid-feedback');
            if (!feedback) {
                feedback = document.createElement('div');
                feedback.className = 'invalid-feedback';
                formGroup.appendChild(feedback);
            }
            
            // Validate based on input type and requirements
            if (!value) {
                isValid = false;
                formGroup.classList.add('is-invalid');
                feedback.textContent = 'This field is required';
            } else if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                isValid = false;
                formGroup.classList.add('is-invalid');
                feedback.textContent = 'Please enter a valid email address';
            } else if (input.type === 'tel' && !/^[\d\+\-\(\) ]{10,15}$/.test(value)) {
                isValid = false;
                formGroup.classList.add('is-invalid');
                feedback.textContent = 'Please enter a valid phone number';
            } else {
                formGroup.classList.add('is-valid');
                feedback.textContent = '';
            }
        });
        
        // Special validation for step 3 (date & time selection)
        if (stepNumber === 3) {
            if (!this.state.selectedDate || !this.state.selectedTime) {
                isValid = false;
                
                if (!this.state.selectedDate) {
                    this.showNotification('Please select a date from the calendar', 'error');
                } else if (!this.state.selectedTime) {
                    this.showNotification('Please select an available time slot', 'error');
                }
            }
        }
        
        // If validation fails, focus on first invalid input
        if (!isValid) {
            const firstInvalid = currentStepElement.querySelector('.is-invalid input, .is-invalid select, .is-invalid textarea');
            if (firstInvalid) {
                firstInvalid.focus();
            }
            
            // Track validation failure
            this.trackValidationFailure(stepNumber);
        }
        
        return isValid;
    },
    
    /**
     * Track validation failure for analytics
     */
    trackValidationFailure: function(stepNumber) {
        // Get all invalid fields
        const invalidFields = Array.from(this.elements.formSteps[stepNumber - 1].querySelectorAll('.is-invalid'))
            .map(formGroup => {
                const input = formGroup.querySelector('input, select, textarea');
                return input ? input.name || input.id : 'unknown';
            });
        
        const trackingData = {
            event: 'validation_failure',
            sessionId: this.state.sessionId,
            stepNumber: stepNumber,
            invalidFields: invalidFields,
            timestamp: new Date().toISOString()
        };
        
        this.sendAnalyticsData(trackingData);
    },
    
    /**
     * Show notification message
     */
    showNotification: function(message, type = 'info') {
        // Create notification element if it doesn't exist
        let notification = document.getElementById('booking-notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'booking-notification';
            notification.className = 'booking-notification';
            document.body.appendChild(notification);
        }
        
        // Set content and type
        notification.textContent = message;
        notification.className = `booking-notification ${type}`;
        
        // Show notification
        notification.classList.add('visible');
        
        // Hide after 3 seconds
        setTimeout(() => {
            notification.classList.remove('visible');
        }, 3000);
    },
    
    /**
     * Initialize service selection functionality
     */
    initServiceSelection: function() {
        if (!this.elements.serviceCategory || !this.elements.specificService) return;
        
        // Handle service category change
        this.elements.serviceCategory.addEventListener('change', () => {
            const category = this.elements.serviceCategory.value;
            this.state.serviceCategory = category;
            
            // Update specific service dropdown based on selected category
            this.updateServiceOptions(category);
        });
        
        // Handle specific service change
        this.elements.specificService.addEventListener('change', () => {
            this.state.specificService = this.elements.specificService.value;
        });
        
        // Handle preferred dentist change
        if (this.elements.preferredDentist) {
            this.elements.preferredDentist.addEventListener('change', () => {
                this.state.preferredDentist = this.elements.preferredDentist.value;
            });
        }
    },
    
    /**
     * Update service options based on selected category
     */
    updateServiceOptions: function(category) {
        if (!this.elements.specificService) return;
        
        // Clear current options
        this.elements.specificService.innerHTML = '<option value="">Select a service</option>';
        
        // Enable/disable dropdown based on category selection
        if (!category) {
            this.elements.specificService.disabled = true;
            return;
        }
        
        this.elements.specificService.disabled = false;
        
        // Define services by category
        const services = {
            general: [
                { value: 'checkup', label: 'Dental Check-up & Cleaning' },
                { value: 'fillings', label: 'Dental Fillings' },
                { value: 'root-canal', label: 'Root Canal Therapy' },
                { value: 'extraction', label: 'Tooth Extraction' },
                { value: 'crowns', label: 'Dental Crowns & Bridges' },
                { value: 'dentures', label: 'Dentures & Partial Dentures' }
            ],
            cosmetic: [
                { value: 'whitening', label: 'Teeth Whitening' },
                { value: 'veneers', label: 'Porcelain Veneers' },
                { value: 'bonding', label: 'Dental Bonding' },
                { value: 'smile-makeover', label: 'Complete Smile Makeover' }
            ],
            emergency: [
                { value: 'toothache', label: 'Severe Toothache' },
                { value: 'broken-tooth', label: 'Broken or Chipped Tooth' },
                { value: 'lost-filling', label: 'Lost Filling or Crown' },
                { value: 'dental-abscess', label: 'Dental Abscess' },
                { value: 'jaw-pain', label: 'Jaw Pain or Injury' }
            ]
        };
        
        // Add options for selected category
        if (services[category]) {
            services[category].forEach(service => {
                const option = document.createElement('option');
                option.value = service.value;
                option.textContent = service.label;
                this.elements.specificService.appendChild(option);
            });
        }
    },
    
    /**
     * Fetch available time slots from Google Sheets
     */
    fetchAvailableTimeSlots: function() {
        // Set loading state
        const loadingMessage = document.createElement('div');
        loadingMessage.className = 'loading-message';
        loadingMessage.textContent = 'Loading available appointments...';
        
        if (this.elements.timeSlotContainer) {
            this.elements.timeSlotContainer.innerHTML = '';
            this.elements.timeSlotContainer.appendChild(loadingMessage);
        }
        
        // In development mode, use mock data
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            setTimeout(() => {
                this.generateMockAvailableSlots();
                if (this.elements.calendarGrid.querySelector('.calendar-day')) {
                    this.elements.calendarGrid.querySelector('.calendar-day').click();
                }
            }, 1000);
            return;
        }
        
        // Fetch from Google Apps Script
        fetch(this.config.googleScriptUrl + '?action=getAvailableSlots')
            .then(response => response.json())
            .then(data => {
                this.state.availableTimeSlots = data.slots;
                
                // If calendar is already initialized, update it
                if (this.elements.calendarGrid.querySelector('.calendar-day')) {
                    this.elements.calendarGrid.querySelector('.calendar-day').click();
                }
            })
            .catch(error => {
                console.error('Error fetching available slots:', error);
                // Fall back to mock data on error
                this.generateMockAvailableSlots();
                if (this.elements.calendarGrid.querySelector('.calendar-day')) {
                    this.elements.calendarGrid.querySelector('.calendar-day').click();
                }
            });
    },
    
    /**
     * Generate mock available slots for development/fallback
     */
    generateMockAvailableSlots: function() {
        const today = new Date();
        this.state.availableTimeSlots = {};
        
        // Create available slots for the next 60 days
        for (let i = 0; i < this.config.maxBookingDays; i++) {
            const date = new Date();
            date.setDate(today.getDate() + i);
            
            // Skip Sundays (closed days)
            if (date.getDay() === 0) continue;
            
            const dateString = this.formatDate(date);
            const availableSlots = [];
            
            // Define start and end hours based on day of week
            const startHour = date.getDay() === 6 ? this.config.startingHour.saturday : this.config.startingHour.weekday;
            const endHour = date.getDay() === 6 ? this.config.endingHour.saturday : this.config.endingHour.weekday;
            
            // Generate all possible slots
            for (let hour = startHour; hour < endHour; hour++) {
                [0, 30].forEach(minute => {
                    // Randomly make some slots unavailable
                    if (Math.random() > 0.3) { // 70% available
                        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                        availableSlots.push(timeString);
                    }
                });
            }
            
            this.state.availableTimeSlots[dateString] = availableSlots;
        }
    },
    
    /**
     * Initialize enhanced calendar functionality
     */
    initEnhancedCalendar: function() {
        if (!this.elements.calendarContainer) return;
        
        // Current date variables
        const today = new Date();
        let currentMonth = today.getMonth();
        let currentYear = today.getFullYear();
        
        // Set min date (today) and max date (today + maxBookingDays)
        const minDate = new Date();
        minDate.setHours(0, 0, 0, 0);
        
        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + this.config.maxBookingDays);
        
        // Generate calendar
        const generateCalendar = () => {
            // Clear grid
            this.elements.calendarGrid.innerHTML = '';
            
            // Update month header
            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            this.elements.calendarMonth.textContent = `${monthNames[currentMonth]} ${currentYear}`;
            
            // Create day headers
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            
            dayNames.forEach(day => {
                const dayElement = document.createElement('div');
                dayElement.className = 'calendar-day-header';
                dayElement.textContent = day;
                this.elements.calendarGrid.appendChild(dayElement);
            });
            
            // Get first day of month
            const firstDay = new Date(currentYear, currentMonth, 1);
            const startingDay = firstDay.getDay();
            
            // Get last day of month
            const lastDay = new Date(currentYear, currentMonth + 1, 0);
            const totalDays = lastDay.getDate();
            
            // Add empty cells for days before first day of month
            for (let i = 0; i < startingDay; i++) {
                const emptyCell = document.createElement('div');
                emptyCell.className = 'calendar-day empty';
                this.elements.calendarGrid.appendChild(emptyCell);
            }
            
            // Add days of the month
            for (let day = 1; day <= totalDays; day++) {
                const date = new Date(currentYear, currentMonth, day);
                const dateString = this.formatDate(date);
                
                const dayElement = document.createElement('div');
                dayElement.className = 'calendar-day';
                dayElement.textContent = day;
                dayElement.dataset.date = dateString;
                
                // Check if date has available slots
                const hasAvailableSlots = this.state.availableTimeSlots[dateString] && 
                                          this.state.availableTimeSlots[dateString].length > 0;
                
                // Check if date is selectable
                const isBeforeMin = date < minDate;
                const isAfterMax = date > maxDate;
                const isClosedDay = this.config.closedDays.includes(date.getDay());
                
                if (isBeforeMin || isAfterMax || isClosedDay) {
                    dayElement.classList.add('disabled');
                } else {
                    // Add availability indicator
                    if (hasAvailableSlots) {
                        // Add availability dot with color based on number of available slots
                        const availabilityIndicator = document.createElement('span');
                        availabilityIndicator.className = 'availability-indicator';
                        
                        // Determine availability level
                        const availableCount = this.state.availableTimeSlots[dateString].length;
                        if (availableCount > 10) {
                            availabilityIndicator.classList.add('high');
                        } else if (availableCount > 5) {
                            availabilityIndicator.classList.add('medium');
                        } else {
                            availabilityIndicator.classList.add('low');
                        }
                        
                        dayElement.appendChild(availabilityIndicator);
                    } else {
                        dayElement.classList.add('unavailable');
                    }
                    
                    // Only allow selection if has available slots
                    if (hasAvailableSlots) {
                        dayElement.addEventListener('click', () => {
                            this.selectDate(dayElement, dateString);
                        });
                    } else {
                        dayElement.classList.add('disabled');
                    }
                }
                
                // Highlight today
                if (date.toDateString() === today.toDateString()) {
                    dayElement.classList.add('today');
                }
                
                // Highlight selected date
                if (dateString === this.state.selectedDate) {
                    dayElement.classList.add('selected');
                }
                
                this.elements.calendarGrid.appendChild(dayElement);
            }
        };
        
        // Handler to select a date
        this.selectDate = (dayElement, dateString) => {
            // Deselect previous date
            const selectedDate = this.elements.calendarGrid.querySelector('.calendar-day.selected');
            if (selectedDate) {
                selectedDate.classList.remove('selected');
            }
            
            // Select new date
            dayElement.classList.add('selected');
            
            // Update state and inputs
            this.state.selectedDate = dateString;
            this.elements.appointmentDateInput.value = dateString;
            this.elements.selectedDateInput.value = dateString;
            
            // Reset selected time
            this.state.selectedTime = null;
            this.elements.selectedTimeInput.value = '';
            
            // Update time slots
            this.updateTimeSlots(dateString);
            
            // Enable/disable continue button based on selection
            const continueButton = document.querySelector('.form-step[data-step="3"] .next-step');
            if (continueButton) {
                continueButton.disabled = !this.state.selectedTime;
            }
            
            // Track date selection
            this.trackDateSelection(dateString);
        };
        
        // Navigate to previous month
        const goToPrevMonth = () => {
            currentMonth--;
            
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            
            generateCalendar();
        };
        
        // Navigate to next month
        const goToNextMonth = () => {
            currentMonth++;
            
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            
            generateCalendar();
        };
        
        // Bind events
        this.elements.prevMonthButton.addEventListener('click', goToPrevMonth);
        this.elements.nextMonthButton.addEventListener('click', goToNextMonth);
        
        // Initialize calendar
        generateCalendar();
    },
    
    /**
     * Track date selection for analytics
     */
    trackDateSelection: function(dateString) {
        const trackingData = {
            event: 'date_selection',
            sessionId: this.state.sessionId,
            selectedDate: dateString,
            dayOfWeek: new Date(dateString).getDay(),
            availableSlots: this.state.availableTimeSlots[dateString]?.length || 0,
            timestamp: new Date().toISOString()
        };
        
        this.sendAnalyticsData(trackingData);
    },
    
    /**
     * Update time slots based on selected date
     */
    updateTimeSlots: function(dateString) {
        if (!this.elements.timeSlotContainer || !this.elements.selectedDateDisplay) return;
        
        // Clear time slots
        this.elements.timeSlotContainer.innerHTML = '';
        
        // Parse selected date
        const selectedDate = this.parseDate(dateString);
        
        // Format date for display
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        this.elements.selectedDateDisplay.textContent = selectedDate.toLocaleDateString('en-US', options);
        
        // Check if the selected date is valid
        if (isNaN(selectedDate.getTime())) {
            this.elements.timeSlotContainer.innerHTML = '<p class="no-slots-message">Please select a valid date.</p>';
            return;
        }
        
        // Check if date is in the past
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
            this.elements.timeSlotContainer.innerHTML = '<p class="no-slots-message">Please select a date in the future.</p>';
            return;
        }
        
        // Check if it's a closed day (e.g., Sunday)
        const dayOfWeek = selectedDate.getDay();
        if (this.config.closedDays.includes(dayOfWeek)) {
            this.elements.timeSlotContainer.innerHTML = '<p class="no-slots-message">We are closed on this day. Please select another day.</p>';
            return;
        }
        
        // Get available time slots for this date
        const availableSlots = this.state.availableTimeSlots[dateString] || [];
        
        if (availableSlots.length === 0) {
            this.elements.timeSlotContainer.innerHTML = '<p class="no-slots-message">No available appointments on this day. Please select another date.</p>';
            return;
        }
        
        // Create morning and afternoon sections
        const morningSlots = document.createElement('div');
        morningSlots.className = 'time-slot-section';
        morningSlots.innerHTML = '<h4 class="time-section-title">Morning</h4><div class="time-slots-grid morning-slots"></div>';
        
        const afternoonSlots = document.createElement('div');
        afternoonSlots.className = 'time-slot-section';
        afternoonSlots.innerHTML = '<h4 class="time-section-title">Afternoon</h4><div class="time-slots-grid afternoon-slots"></div>';
        
        this.elements.timeSlotContainer.appendChild(morningSlots);
        this.elements.timeSlotContainer.appendChild(afternoonSlots);
        
        const morningGrid = morningSlots.querySelector('.morning-slots');
        const afternoonGrid = afternoonSlots.querySelector('.afternoon-slots');
        
        // Sort available slots
        availableSlots.sort();
        
        // Add time slots to morning or afternoon section
        availableSlots.forEach(timeString => {
            const hour = parseInt(timeString.split(':')[0], 10);
            const timeSlot = document.createElement('div');
            timeSlot.className = 'time-slot';
            timeSlot.dataset.time = timeString;
            
            // Format time for display (12-hour format)
            const hourNum = hour % 12 || 12;
            const ampm = hour < 12 ? 'AM' : 'PM';
            const minute = timeString.split(':')[1];
            timeSlot.textContent = `${hourNum}:${minute} ${ampm}`;
            
            timeSlot.addEventListener('click', () => {
                this.selectTimeSlot(timeSlot, timeString);
            });
            
            // Highlight selected time slot
            if (timeString === this.state.selectedTime) {
                timeSlot.classList.add('selected');
            }
            
            // Add to appropriate section
            if (hour < 12) {
                morningGrid.appendChild(timeSlot);
            } else {
                afternoonGrid.appendChild(timeSlot);
            }
        });
        
        // Hide section if no slots
        if (morningGrid.children.length === 0) {
            morningSlots.style.display = 'none';
        }
        
        if (afternoonGrid.children.length === 0) {
            afternoonSlots.style.display = 'none';
        }
    },
    
    /**
     * Select a time slot
     */
    selectTimeSlot: function(timeSlot, timeString) {
        // Deselect all other slots
        document.querySelectorAll('.time-slot.selected').forEach(slot => {
            slot.classList.remove('selected');
        });
        
        // Select this slot
        timeSlot.classList.add('selected');
        
        // Update state and input
        this.state.selectedTime = timeString;
        this.elements.selectedTimeInput.value = timeString;
        
        // Enable next button
        const nextButton = document.querySelector('.form-step[data-step="3"] .next-step');
        if (nextButton) {
            nextButton.disabled = false;
        }
        
        // Track time selection
        this.trackTimeSelection(timeString);
    },
    
    /**
     * Track time selection for analytics
     */
    trackTimeSelection: function(timeString) {
        const trackingData = {
            event: 'time_selection',
            sessionId: this.state.sessionId,
            selectedDate: this.state.selectedDate,
            selectedTime: timeString,
            timestamp: new Date().toISOString()
        };
        
        this.sendAnalyticsData(trackingData);
    },
    
    /**
     * Update confirmation summary
     */
    updateConfirmationSummary: function() {
        if (!this.elements.summaryName || !this.elements.summaryService || 
            !this.elements.summaryDentist || !this.elements.summaryDatetime) {
            return;
        }
        
        // Get form data
        const firstName = document.getElementById('first-name')?.value || '';
        const lastName = document.getElementById('last-name')?.value || '';
        const fullName = `${firstName} ${lastName}`.trim();
        
        // Get service details
        let serviceName = 'Not selected';
        if (this.elements.serviceCategory && this.elements.specificService && 
            this.elements.serviceCategory.value && this.elements.specificService.value) {
            const categoryText = this.elements.serviceCategory.options[this.elements.serviceCategory.selectedIndex].text;
            const serviceText = this.elements.specificService.options[this.elements.specificService.selectedIndex].text;
            serviceName = `${serviceText} (${categoryText})`;
        }
        
        // Get dentist name
        let dentistName = 'No preference';
        if (this.elements.preferredDentist && this.elements.preferredDentist.value) {
            dentistName = this.elements.preferredDentist.options[this.elements.preferredDentist.selectedIndex].text;
        }
        
        // Get date and time
        let dateTimeText = 'Not selected';
        if (this.state.selectedDate && this.state.selectedTime) {
            const date = this.parseDate(this.state.selectedDate);
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            
            // Format time for display (12-hour format)
            const timeString = this.state.selectedTime;
            const hour = parseInt(timeString.split(':')[0], 10);
            const hourNum = hour % 12 || 12;
            const minute = timeString.split(':')[1];
            const ampm = hour < 12 ? 'AM' : 'PM';
            const formattedTime = `${hourNum}:${minute} ${ampm}`;
            
            dateTimeText = `${date.toLocaleDateString('en-US', options)} at ${formattedTime}`;
        }
        
        // Update summary elements
        this.elements.summaryName.textContent = fullName;
        this.elements.summaryService.textContent = serviceName;
        this.elements.summaryDentist.textContent = dentistName;
        this.elements.summaryDatetime.textContent = dateTimeText;
    },
    
    /**
     * Initialize form validation
     */
    initFormValidation: function() {
        if (!this.elements.bookingForm) return;
        
        // Get all inputs, selects, and textareas
        const formInputs = this.elements.bookingForm.querySelectorAll('input:not([type="hidden"]), select, textarea');
        
        // Add blur and input event listeners for validation
        formInputs.forEach(input => {
            // Validate on blur
            input.addEventListener('blur', () => {
                this.validateInput(input);
                input.dataset.blurred = 'true';
            });
            
            // Validate on input if already blurred
            input.addEventListener('input', () => {
                if (input.dataset.blurred === 'true') {
                    this.validateInput(input);
                }
            });
        });
    },
    
    /**
     * Validate a single input
     */
    validateInput: function(input) {
        // Skip validation for hidden inputs
        if (input.type === 'hidden' || input.disabled) return true;
        
        const value = input.value.trim();
        const formGroup = input.closest('.form-group');
        
        if (!formGroup) return true;
        
        // Clear previous validation
        formGroup.classList.remove('is-invalid', 'is-valid');
        
        // Get or create feedback element
        let feedback = formGroup.querySelector('.invalid-feedback');
        if (!feedback) {
            feedback = document.createElement('div');
            feedback.className = 'invalid-feedback';
            formGroup.appendChild(feedback);
        }
        
        // Required validation
        if (input.required && !value) {
            formGroup.classList.add('is-invalid');
            feedback.textContent = 'This field is required';
            return false;
        }
        
        // Email validation
        if (input.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            formGroup.classList.add('is-invalid');
            feedback.textContent = 'Please enter a valid email address';
            return false;
        }
        
        // Phone validation
        if (input.type === 'tel' && value && !/^[\d\+\-\(\) ]{10,15}$/.test(value)) {
            formGroup.classList.add('is-invalid');
            feedback.textContent = 'Please enter a valid phone number';
            return false;
        }
        
        // Input is valid
        formGroup.classList.add('is-valid');
        feedback.textContent = '';
        return true;
    },
    
    /**
     * Collect all form data
     */
    collectFormData: function() {
        const formData = new FormData(this.elements.bookingForm);
        const formObject = {};
        
        // Convert FormData to object
        formData.forEach((value, key) => {
            formObject[key] = value;
        });
        
        // Add additional data
        formObject.sessionId = this.state.sessionId;
        formObject.selectedDate = this.state.selectedDate;
        formObject.selectedTime = this.state.selectedTime;
        formObject.submissionTime = new Date().toISOString();
        
        // Add service names (not just IDs)
        if (this.elements.serviceCategory && this.elements.specificService) {
            const categorySelect = this.elements.serviceCategory;
            const serviceSelect = this.elements.specificService;
            
            if (categorySelect.selectedIndex > 0) {
                formObject.serviceCategoryName = categorySelect.options[categorySelect.selectedIndex].text;
            }
            
            if (serviceSelect.selectedIndex > 0) {
                formObject.specificServiceName = serviceSelect.options[serviceSelect.selectedIndex].text;
            }
        }
        
        // Add dentist name (not just ID)
        if (this.elements.preferredDentist && this.elements.preferredDentist.selectedIndex > 0) {
            formObject.preferredDentistName = this.elements.preferredDentist.options[this.elements.preferredDentist.selectedIndex].text;
        }
        
        return formObject;
    },
    
    /**
     * Handle form submission
     */
    handleFormSubmit: function(event) {
        // Prevent default form submission
        event.preventDefault();
        
        // Validate form
        if (!this.validateStep(this.state.currentStep)) {
            return false;
        }
        
        // Check if already submitting to prevent double submission
        if (this.state.submitting) {
            return false;
        }
        
        // Set submitting state
        this.state.submitting = true;
        
        // Show loading indicator
        this.elements.loadingIndicator.classList.add('visible');
        
        // Collect form data
        const formData = this.collectFormData();
        this.state.formData = formData;
        
        // Track form submission attempt
        this.trackFormSubmission('attempt');
        
        // In development mode, just simulate success
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log('Form data (dev mode):', formData);
            
            setTimeout(() => {
                this.state.submitting = false;
                this.elements.loadingIndicator.classList.remove('visible');
                this.trackFormSubmission('success');
                this.showBookingConfirmation();
            }, 1500);
            
            return false;
        }
        
        // Submit the form data to Google Apps Script
        fetch(this.config.googleScriptUrl, {
            method: 'POST',
            mode: 'no-cors', // Required for Google Apps Script
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'submitBooking',
                bookingData: formData
            })
        })
        .then(response => {
            // Handle success
            this.state.submitting = false;
            this.elements.loadingIndicator.classList.remove('visible');
            this.trackFormSubmission('success');
            this.showBookingConfirmation();
        })
        .catch(error => {
            // Handle error
            console.error('Form submission error:', error);
            this.state.submitting = false;
            this.elements.loadingIndicator.classList.remove('visible');
            this.trackFormSubmission('error', error.message);
            this.showNotification('There was an error submitting your booking. Please try again or contact us directly.', 'error');
        });
        
        return false;
    },
    
    /**
     * Track form submission for analytics
     */
    trackFormSubmission: function(status, errorMessage = null) {
        const trackingData = {
            event: 'form_submission',
            sessionId: this.state.sessionId,
            status: status,
            formData: {
                service: this.state.formData.serviceCategoryName || '',
                specificService: this.state.formData.specificServiceName || '',
                dentist: this.state.formData.preferredDentistName || 'No preference',
                date: this.state.formData.selectedDate || '',
                time: this.state.formData.selectedTime || ''
            },
            timestamp: new Date().toISOString()
        };
        
        if (errorMessage) {
            trackingData.errorMessage = errorMessage;
        }
        
        this.sendAnalyticsData(trackingData);
    },
    
    /**
     * Show booking confirmation message
     */
    showBookingConfirmation: function() {
        // Store appointment details in localStorage for potential future reference
        localStorage.setItem('wbdc_has_booking', 'true');
        localStorage.setItem('wbdc_appointment_details', JSON.stringify({
            name: this.elements.summaryName.textContent,
            service: this.elements.summaryService.textContent,
            dentist: this.elements.summaryDentist.textContent,
            datetime: this.elements.summaryDatetime.textContent
        }));
        
        // Replace form with confirmation message
        if (this.elements.bookingForm) {
            const confirmationMessage = document.createElement('div');
            confirmationMessage.className = 'booking-confirmation';
            confirmationMessage.innerHTML = `
                <div class="confirmation-icon">
                    <i class="icon icon-check-circle"></i>
                </div>
                <h2>Appointment Confirmed!</h2>
                <p>Thank you for booking your appointment with Wisdom Bites Dental Clinic.</p>
                <div class="confirmation-details">
                    <p><strong>Name:</strong> ${this.elements.summaryName.textContent}</p>
                    <p><strong>Service:</strong> ${this.elements.summaryService.textContent}</p>
                    <p><strong>Dentist:</strong> ${this.elements.summaryDentist.textContent}</p>
                    <p><strong>Date & Time:</strong> ${this.elements.summaryDatetime.textContent}</p>
                </div>
                <p>We've sent a confirmation email to your inbox with these details. If you need to make any changes to your appointment, please contact us at (555) 123-4567.</p>
                <div class="confirmation-actions">
                    <a href="directions.html" class="btn btn-primary">Get Directions</a>
                    <a href="index.html" class="btn btn-outline">Return to Home</a>
                    <a href="contact.html" class="btn btn-outline">Contact Us</a>
                </div>
            `;
            
            this.elements.bookingForm.parentNode.replaceChild(confirmationMessage, this.elements.bookingForm);
            
            // Scroll to top of confirmation
            confirmationMessage.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            
            // Track confirmation view
            this.trackConfirmationView();
        }
    },
    
    /**
     * Track confirmation view for analytics
     */
    trackConfirmationView: function() {
        const trackingData = {
            event: 'confirmation_view',
            sessionId: this.state.sessionId,
            appointmentDetails: {
                date: this.state.selectedDate,
                time: this.state.selectedTime,
                service: this.elements.summaryService.textContent,
            },
            timestamp: new Date().toISOString()
        };
        
        this.sendAnalyticsData(trackingData);
    },
    
    /**
     * Handle URL parameters to pre-select service
     */
    handleUrlParameters: function() {
        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const serviceParam = urlParams.get('service');
        
        if (serviceParam && this.elements.serviceCategory) {
            // Map service parameter to service category
            let category = '';
            
            // General services
            if (['general', 'checkup', 'fillings', 'root-canal', 'extraction', 'crowns', 'dentures'].includes(serviceParam)) {
                category = 'general';
            }
            // Cosmetic services
            else if (['cosmetic', 'whitening', 'veneers', 'bonding', 'smile-makeover'].includes(serviceParam)) {
                category = 'cosmetic';
            }
            // Emergency services
            else if (['emergency', 'toothache', 'broken-tooth', 'lost-filling', 'dental-abscess', 'jaw-pain'].includes(serviceParam)) {
                category = 'emergency';
            }
            
            // If category is found, select it
            if (category && this.elements.serviceCategory.querySelector(`option[value="${category}"]`)) {
                this.elements.serviceCategory.value = category;
                this.state.serviceCategory = category;
                
                // Trigger change event to update specific service dropdown
                const event = new Event('change', { bubbles: true });
                this.elements.serviceCategory.dispatchEvent(event);
                
                // If specific service parameter exists, select it after dropdown is populated
                setTimeout(() => {
                    if (this.elements.specificService && serviceParam !== category) {
                        // Find matching service option
                        const serviceOption = Array.from(this.elements.specificService.options)
                            .find(option => option.value === serviceParam);
                        
                        if (serviceOption) {
                            this.elements.specificService.value = serviceParam;
                            this.state.specificService = serviceParam;
                        }
                    }
                }, 100);
                
                // Track parameter usage
                this.trackUrlParameterUsage(serviceParam, category);
            }
        }
    },
    
    /**
     * Track URL parameter usage for analytics
     */
    trackUrlParameterUsage: function(serviceParam, category) {
        const trackingData = {
            event: 'url_param_usage',
            sessionId: this.state.sessionId,
            serviceParam: serviceParam,
            mappedCategory: category,
            timestamp: new Date().toISOString(),
            referrer: document.referrer || 'direct'
        };
        
        this.sendAnalyticsData(trackingData);
    }
};

// Initialize booking system when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    EnhancedBookingSystem.init();
});