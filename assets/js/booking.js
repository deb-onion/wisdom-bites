/**
 * Wisdom Bites Dental Clinic
 * Enhanced Booking System with Direct Google API Integration
 * 
 * This implementation connects the booking form directly to Google APIs via our backend
 * instead of using Google Apps Script as an intermediary.
 */

"use strict";

const BookingSystem = {
    // Configuration options
    config: {
        // Calendar settings
        timeSlotDuration: 30, // in minutes
        maxBookingDays: 60, // How far in advance patients can book
        
        // Business hours
        businessHours: {
            0: [], // Sunday (closed)
            1: ['09:00', '18:00'], // Monday
            2: ['09:00', '18:00'], // Tuesday
            3: ['09:00', '18:00'], // Wednesday
            4: ['09:00', '18:00'], // Thursday
            5: ['09:00', '18:00'], // Friday
            6: ['10:00', '15:00']  // Saturday
        }
    },
    
    // DOM elements cache
    elements: {},
    
    // State variables
    state: {
        currentStep: 1,
        selectedDate: null,
        selectedTime: null,
        availableTimeSlots: {},
        sessionId: '',
        formData: {},
        submitting: false,
        loadingAvailability: false,
        currentYear: null,
        currentMonth: null,
        minBookingDate: null,
        maxBookingDate: null
    },
    
    /**
     * Initialize the booking system
     */
    init: function() {
        console.log('Initializing Direct API Booking System');
        
        // Cache DOM elements
        this.cacheElements();
        
        // Generate session ID for tracking
        this.state.sessionId = 'WB-' + Date.now() + '-' + Math.floor(Math.random() * 1000000);
        
        // Apply a global fix for the negative maxlength issue
        this.applyGlobalMaxlengthFix();
        
        // Fix any negative maxlength values on all inputs
        this.fixNegativeMaxlengths();
        
        // Initialize components
        this.initFormSteps();
        this.initServiceSelection();
        this.initCalendar();
        
        // Handle URL parameters
        this.handleUrlParameters();
        
        // Bind form submission event
        if (this.elements.bookingForm) {
            this.elements.bookingForm.addEventListener('submit', this.handleFormSubmit.bind(this));
        }
        
        // Add analytics tracking
        this.trackPageVisit();
    },
    
    /**
     * Apply a global fix for the negative maxlength issue by overriding the property
     */
    applyGlobalMaxlengthFix: function() {
        // Create a MutationObserver to watch for new input elements
        if (window.MutationObserver) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                        for (let i = 0; i < mutation.addedNodes.length; i++) {
                            const node = mutation.addedNodes[i];
                            if (node.nodeType === 1 && (node.tagName === 'INPUT' || node.tagName === 'TEXTAREA')) {
                                this.fixInputMaxlength(node);
                            }
                            if (node.nodeType === 1 && node.querySelectorAll) {
                                const inputs = node.querySelectorAll('input, textarea');
                                inputs.forEach(input => this.fixInputMaxlength(input));
                            }
                        }
                    }
                });
            });
            
            // Start observing the document
            observer.observe(document.body, { childList: true, subtree: true });
        }
        
        // Immediately fix all existing inputs
        const allInputs = document.querySelectorAll('input, textarea');
        allInputs.forEach(input => this.fixInputMaxlength(input));
        
        // Force fix for specific problematic fields we know about
        setTimeout(() => {
            const firstNameInput = document.getElementById('first-name');
            const lastNameInput = document.getElementById('last-name');
            
            if (firstNameInput) {
                firstNameInput.maxLength = 255;
                firstNameInput.removeAttribute('maxlength');
                console.log('Direct fix on first-name input');
            }
            
            if (lastNameInput) {
                lastNameInput.maxLength = 255;
                lastNameInput.removeAttribute('maxlength');
                console.log('Direct fix on last-name input');
            }
        }, 500);
    },
    
    /**
     * Fix maxlength property on a single input
     */
    fixInputMaxlength: function(input) {
        // Only proceed if it's an HTMLInputElement or HTMLTextAreaElement
        if (!(input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement)) {
            return;
        }
        
        // Remove negative maxlength attribute
        const maxLengthAttr = input.getAttribute('maxlength');
        if (maxLengthAttr !== null && parseInt(maxLengthAttr) < 0) {
            console.log(`Removing negative maxlength attribute from ${input.id || input.name}`);
            input.removeAttribute('maxlength');
        }
        
        // Reset negative maxLength property
        if (input.maxLength < 0) {
            console.log(`Fixing negative maxLength property on ${input.id || input.name}`);
            input.maxLength = 255;
        }
        
        // Add an input event listener to constantly check for negative maxlength
        input.addEventListener('input', function() {
            if (this.maxLength < 0) {
                console.log(`Runtime fix for negative maxLength on ${this.id || this.name}`);
                this.maxLength = 255;
            }
        });
    },
    
    /**
     * Fix negative maxlength values on all inputs
     */
    fixNegativeMaxlengths: function() {
        const inputs = document.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            this.fixInputMaxlength(input);
        });
    },
    
    /**
     * Cache DOM elements for better performance
     */
    cacheElements: function() {
        // Main form elements
        this.elements.bookingForm = document.getElementById('booking-form');
        this.elements.formSteps = document.querySelectorAll('.form-step');
        this.elements.progressSteps = document.querySelectorAll('.progress-step');
        this.elements.nextButtons = document.querySelectorAll('.next-step');
        this.elements.prevButtons = document.querySelectorAll('.prev-step');
        
        // Personal info elements
        this.elements.firstNameInput = document.getElementById('first-name');
        this.elements.lastNameInput = document.getElementById('last-name');
        this.elements.emailInput = document.getElementById('email');
        this.elements.phoneInput = document.getElementById('phone');
        this.elements.patientTypeSelect = document.getElementById('patient-type');
        
        // Service selection elements
        this.elements.serviceCategory = document.getElementById('service-category');
        this.elements.specificService = document.getElementById('specific-service');
        this.elements.preferredDentist = document.getElementById('preferred-dentist');
        this.elements.notesTextarea = document.getElementById('notes');
        
        // Calendar elements
        this.elements.calendarContainer = document.querySelector('.calendar-container');
        this.elements.calendarMonth = document.querySelector('.calendar-month');
        this.elements.calendarGrid = document.querySelector('.calendar-grid');
        this.elements.prevMonthButton = document.querySelector('.prev-month');
        this.elements.nextMonthButton = document.querySelector('.next-month');
        this.elements.timeSlots = document.querySelector('.time-slots');
        this.elements.selectedDateLabel = document.querySelector('.selected-date');
        this.elements.timeSlotContainer = document.querySelector('.time-slot-container');
        this.elements.selectedDateDisplay = document.querySelector('.selected-date-display');
        
        // Hidden inputs for date and time
        this.elements.appointmentDateInput = document.getElementById('appointment-date');
        this.elements.selectedDateInput = document.getElementById('selected-date');
        this.elements.selectedTimeInput = document.getElementById('selected-time');
        
        // Summary elements
        this.elements.summaryName = document.getElementById('summary-name');
        this.elements.summaryService = document.getElementById('summary-service');
        this.elements.summaryDentist = document.getElementById('summary-dentist');
        this.elements.summaryDatetime = document.getElementById('summary-datetime');
        
        // Create loading indicator if it doesn't exist
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
     * Track page visit for analytics
     */
    trackPageVisit: function() {
        // Implement analytics tracking
        if (typeof gtag === 'function') {
            gtag('event', 'page_view', {
                page_title: 'Booking Page',
                page_location: window.location.href,
                page_path: window.location.pathname,
                send_to: 'G-XXXXXXXXXX' // Replace with your Google Analytics ID
            });
        }
    },
    
    /**
     * Initialize form steps
     */
    initFormSteps: function() {
        // Add click event to next buttons
        this.elements.nextButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.goToNextStep();
            });
        });
        
        // Add click event to previous buttons
        this.elements.prevButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.goToPrevStep();
            });
        });
        
        // Set initial state
        this.updateStepDisplay();
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
            
            // Track step progression
            this.trackStepProgression('next', this.state.currentStep - 1);
            
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
            
            // Track step progression
            this.trackStepProgression('back', this.state.currentStep + 1);
            
            return true;
        }
        
        return false;
    },
    
    /**
     * Update display based on current step
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
     * Track step progression for analytics
     */
    trackStepProgression: function(direction, fromStep) {
        if (typeof gtag === 'function') {
            gtag('event', 'form_navigation', {
                direction: direction,
                from_step: fromStep,
                to_step: direction === 'next' ? fromStep + 1 : fromStep - 1
            });
        }
    },
    
    /**
     * Initialize service selection functionality
     */
    initServiceSelection: function() {
        if (!this.elements.serviceCategory || !this.elements.specificService) return;
        
        // Handle service category change
        this.elements.serviceCategory.addEventListener('change', () => {
            const category = this.elements.serviceCategory.value;
            
            // Update specific service dropdown based on selected category
            this.updateServiceOptions(category);
        });
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
     * Initialize calendar for date selection
     */
    initCalendar: function() {
        console.log('🗓️ Initializing calendar');
        
        // Check if calendar elements exist
        if (!this.elements.calendarContainer || !this.elements.calendarGrid) {
            console.log('Calendar elements not found, trying to find them directly');
            
            // Try to find elements directly
            this.elements.calendarContainer = document.querySelector('.calendar-container');
            this.elements.calendarGrid = document.querySelector('.calendar-grid');
            this.elements.calendarMonth = document.querySelector('.calendar-month');
            this.elements.prevMonthButton = document.querySelector('.prev-month');
            this.elements.nextMonthButton = document.querySelector('.next-month');
            
            if (!this.elements.calendarContainer || !this.elements.calendarGrid) {
                console.log('Calendar elements still not found, skipping calendar initialization');
            return;
            }
        }
        
        console.log('Calendar elements found, proceeding with initialization');
        
        // Set min and max dates for booking
        const today = new Date();
        this.state.currentYear = today.getFullYear();
        this.state.currentMonth = today.getMonth();
        
        // Calculate min date (today)
        this.state.minBookingDate = new Date(today);
        this.state.minBookingDate.setHours(0, 0, 0, 0);
        
        // Calculate max date (today + max booking days)
        this.state.maxBookingDate = new Date(today);
        this.state.maxBookingDate.setDate(today.getDate() + this.config.maxBookingDays);
        this.state.maxBookingDate.setHours(23, 59, 59, 999);
        
        // Init calendar month view
        this.generateCalendarMonth(this.state.currentYear, this.state.currentMonth);
        
        // Add event listeners to prev/next month buttons
        if (this.elements.prevMonthButton) {
            this.elements.prevMonthButton.addEventListener('click', () => {
                this.changeMonth(-1);
            });
        } else {
            console.log('⚠️ Previous month button not found');
        }
        
        if (this.elements.nextMonthButton) {
            this.elements.nextMonthButton.addEventListener('click', () => {
                this.changeMonth(1);
            });
        } else {
            console.log('⚠️ Next month button not found');
        }
        
        // Enhance calendar days with touchend events for mobile
        const addTouchEvents = () => {
            const calendarDays = document.querySelectorAll('.calendar-day:not(.disabled):not(.empty)');
            calendarDays.forEach(day => {
                if (!day.dataset.touchEventAdded) {
                    day.dataset.touchEventAdded = 'true';
                    day.addEventListener('touchend', (e) => {
                        e.preventDefault();
                        const dateString = day.dataset.date;
                        console.log('Calendar day touched:', dateString);
                        if (dateString) {
                            this.selectDate(day, dateString);
                        }
                    });
                }
            });
        };
        
        // Call the function initially and after calendar updates
        addTouchEvents();
        
        // Observe calendar grid for changes and add touch events to new days
        const observer = new MutationObserver(() => {
            addTouchEvents();
        });
        
        observer.observe(this.elements.calendarGrid, { childList: true, subtree: true });
        
        console.log('Calendar initialization complete');
    },
    
    /**
     * Change the displayed month
     */
    changeMonth: function(direction) {
        // Update current month and year
        let newMonth = this.state.currentMonth + direction;
        let newYear = this.state.currentYear;
        
        // Handle year change
        if (newMonth < 0) {
            newMonth = 11;
            newYear--;
        } else if (newMonth > 11) {
            newMonth = 0;
            newYear++;
        }
        
        // Update state
        this.state.currentMonth = newMonth;
        this.state.currentYear = newYear;
        
        // Generate new calendar month
        this.generateCalendarMonth(newYear, newMonth);
        
        // Fetch availability for new month
        this.fetchMonthAvailability(newYear, newMonth);
    },
    
    /**
     * Generate calendar month view with extra click handling safety
     */
    generateCalendarMonth: function(year, month) {
        console.log('📅 Generating calendar for', year, month);
        if (!this.elements.calendarGrid || !this.elements.calendarMonth) {
            console.log('⚠️ Calendar elements not found in generateCalendarMonth, looking directly');
            this.elements.calendarGrid = document.querySelector('.calendar-grid');
            this.elements.calendarMonth = document.querySelector('.calendar-month');
            
            if (!this.elements.calendarGrid || !this.elements.calendarMonth) {
                console.error('❌ Calendar elements still not found, cannot generate calendar');
                return;
            }
        }
        
        // Set month title
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        this.elements.calendarMonth.textContent = `${monthNames[month]} ${year}`;
        
        // Clear calendar grid
        this.elements.calendarGrid.innerHTML = '';
        
        // Add day headers (Sunday-Saturday)
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayNames.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'calendar-day-header';
            dayHeader.textContent = day;
            this.elements.calendarGrid.appendChild(dayHeader);
        });
        
        // Get first day of month and number of days in month
        const firstDate = new Date(year, month, 1);
        const lastDate = new Date(year, month + 1, 0);
        const firstDay = firstDate.getDay(); // 0 = Sunday, 6 = Saturday
        const daysInMonth = lastDate.getDate();
        
        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'calendar-day empty';
            this.elements.calendarGrid.appendChild(emptyCell);
        }
        
        // Add cells for each day of the month
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let clickableCount = 0;
        
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            date.setHours(0, 0, 0, 0);
            
            const dateFormatted = this.formatDate(date);
            const dayCell = document.createElement('div');
            dayCell.className = 'calendar-day';
            dayCell.dataset.date = dateFormatted;
            dayCell.textContent = day;
            
            // Check if date is today
            if (date.getTime() === today.getTime()) {
                dayCell.classList.add('today');
            }
            
            // Check if date is selectable
            if (date < this.state.minBookingDate) {
                dayCell.classList.add('disabled');
            } else if (date > this.state.maxBookingDate) {
                dayCell.classList.add('disabled');
            } else {
                clickableCount++;
                // IMPORTANT: Use a named function for the click event
                // This helps prevent event listener issues
                const handleDateClick = (e) => {
                    e.stopPropagation(); // Prevent event bubbling
                    console.log('🖱️ Calendar day clicked (direct):', dateFormatted);
                    this.selectDate(dayCell, dateFormatted);
                };
                
                // Add date selection event with multiple methods to ensure it works
                dayCell.addEventListener('click', handleDateClick);
                
                // Also add as a direct property for maximum compatibility
                dayCell.onclick = handleDateClick;
                
                // Make the day visually appear clickable
                dayCell.style.cursor = 'pointer';
            }
            
            // Check if date is currently selected
            if (dateFormatted === this.state.selectedDate) {
                dayCell.classList.add('selected');
            }
            
            this.elements.calendarGrid.appendChild(dayCell);
        }
        
        console.log(`📊 Calendar generated with ${clickableCount} clickable days`);
        
        // Add empty cells for days after the last day of the month (to complete the grid)
        const totalCells = firstDay + daysInMonth;
        const emptyCellsNeeded = Math.ceil(totalCells / 7) * 7 - totalCells;
        
        for (let i = 0; i < emptyCellsNeeded; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'calendar-day empty';
            this.elements.calendarGrid.appendChild(emptyCell);
        }
        
        // Fetch availability for this month
        this.fetchMonthAvailability(year, month);
    },
    
    /**
     * Fetch availability for a specific month from the API
     */
    fetchMonthAvailability: function(year, month) {
        // Set loading state
        this.state.loadingAvailability = true;
        
        // Create dates for start and end of month
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0);
        
        // Format dates for API
        const startDateStr = this.formatDate(startDate);
        const endDateStr = this.formatDate(endDate);
        
        console.log('🔍 Fetching availability for:', startDateStr, 'to', endDateStr);
        
        // Show loading message for timeslots
        if (this.elements.timeSlotContainer) {
            this.elements.timeSlotContainer.innerHTML = '<div class="loading-message">Loading available appointments...</div>';
        }
        
        // Check if ApiService is available, otherwise use mock data
        if (typeof ApiService !== 'undefined') {
            // Get availability from the backend API
            console.log('🔌 Using API Service for availability');
            ApiService.getAvailability(startDateStr, endDateStr)
                .then(response => {
                    console.log('✅ Received availability data:', response);
                    // Process and store available time slots
                    this.processAvailabilityResponse(response, startDate, endDate);
                    this.state.loadingAvailability = false;
                    this.updateCalendarAvailability();
                })
                .catch(error => {
                    console.error('❌ Error fetching availability:', error);
                    // Fallback to mock data on error
                    this.generateMockAvailableSlots(startDate, endDate);
                    this.state.loadingAvailability = false;
                    this.updateCalendarAvailability();
                });
        } else {
            // Use mock data if API service is not available
            console.log('⚠️ Using mock availability data (API service not available)');
        setTimeout(() => {
            this.generateMockAvailableSlots(startDate, endDate);
            this.state.loadingAvailability = false;
            this.updateCalendarAvailability();
        }, 800);
        }
    },
    
    /**
     * Process availability response from API
     */
    processAvailabilityResponse: function(response, startDate, endDate) {
        // Extract busy slots from response
        const busySlots = response.busySlots || [];
        
        // Get business hours
        ApiService.getBusinessHours()
            .then(businessHoursResponse => {
                const businessHours = businessHoursResponse.businessHours || this.config.businessHours;
                
                // Calculate available slots based on business hours and busy slots
                this.calculateAvailableSlots(startDate, endDate, businessHours, busySlots);
            })
            .catch(error => {
                console.error('Error fetching business hours:', error);
                // Use default business hours
                this.calculateAvailableSlots(startDate, endDate, this.config.businessHours, busySlots);
            });
    },
    
    /**
     * Calculate available slots based on business hours and busy slots
     */
    calculateAvailableSlots: function(startDate, endDate, businessHours, busySlots) {
        console.log('🧮 Calculating available slots with:', {
            startDate: startDate,
            endDate: endDate,
            businessHoursKeys: Object.keys(businessHours),
            busySlots: busySlots
        });
        
        // Loop through each day in the date range
        for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
            const currentDate = new Date(date);
            const dateString = this.formatDate(currentDate);
            const dayOfWeek = currentDate.getDay(); // 0 for Sunday, 1 for Monday, etc.
            
            // Check if we have business hours for this day
            if (!businessHours[dayOfWeek] || businessHours[dayOfWeek].length < 2) {
                // No business hours defined for this day
                this.state.availableTimeSlots[dateString] = [];
                continue;
            }
            
            // Get business hours for this day
            const [openTime, closeTime] = businessHours[dayOfWeek];
            
            // Create time slots for this day within business hours
            const timeSlots = this.generateTimeSlotsForDay(currentDate, openTime, closeTime);
            
            // Filter out busy slots
            const availableSlots = this.filterBusySlots(timeSlots, busySlots);
            
            // Store available slots for this day
            this.state.availableTimeSlots[dateString] = availableSlots;
            
            console.log(`📅 Available slots for ${dateString}:`, availableSlots.length);
        }
        
        // If no available slots were found in any day, generate mock slots to allow UI testing
        let hasAnySlots = false;
        for (const date in this.state.availableTimeSlots) {
            if (this.state.availableTimeSlots[date].length > 0) {
                hasAnySlots = true;
                break;
            }
        }
        
        if (!hasAnySlots) {
            console.log('⚠️ No available slots found, generating mock slots for testing');
            this.generateMockAvailableSlots(startDate, endDate);
        }
        
        // Update calendar UI to show availability
        this.updateCalendarAvailability();
    },
    
    /**
     * Generate time slots for a specific day
     */
    generateTimeSlotsForDay: function(date, openTime, closeTime) {
        const slots = [];
        const dateStr = this.formatDate(date);
        
        // Parse open and close times
        const [openHour, openMinute] = openTime.split(':').map(Number);
        const [closeHour, closeMinute] = closeTime.split(':').map(Number);
        
        // Create slots at regular intervals
        const slotInterval = this.config.timeSlotDuration;
        const openDate = new Date(date);
        openDate.setHours(openHour, openMinute, 0, 0);
        
        const closeDate = new Date(date);
        closeDate.setHours(closeHour, closeMinute, 0, 0);
        
        // Create slots
        for (let time = openDate; time < closeDate; time.setMinutes(time.getMinutes() + slotInterval)) {
            const startTime = new Date(time);
            const endTime = new Date(time);
            endTime.setMinutes(endTime.getMinutes() + slotInterval);
            
            if (endTime <= closeDate) {
                slots.push({
                    date: dateStr,
                    startTime: this.formatTime(startTime),
                    endTime: this.formatTime(endTime),
                    timestamp: startTime.getTime()
                });
            }
        }
        
        return slots;
    },
    
    /**
     * Filter out busy slots
     */
    filterBusySlots: function(timeSlots, busySlots) {
        if (!busySlots || busySlots.length === 0) {
            return timeSlots;
        }
        
        // Convert busy slots to timestamp ranges for easier comparison
        const busyRanges = busySlots.map(slot => {
            const startTime = new Date(slot.start).getTime();
            const endTime = new Date(slot.end).getTime();
            return { start: startTime, end: endTime };
        });
        
        // Filter out slots that overlap with busy times
        return timeSlots.filter(slot => {
            const slotDate = new Date(`${slot.date}T${slot.startTime}`);
            const slotEndDate = new Date(`${slot.date}T${slot.endTime}`);
            const slotStart = slotDate.getTime();
            const slotEnd = slotEndDate.getTime();
            
            // Check if this slot overlaps with any busy slot
            return !busyRanges.some(busyRange => {
                return (slotStart < busyRange.end && slotEnd > busyRange.start);
            });
        });
    },
    
    /**
     * Update calendar to show availability indicators
     * WITH FIXED CALENDAR CLICK FUNCTIONALITY 
     */
    updateCalendarAvailability: function() {
        const dayElements = this.elements.calendarGrid.querySelectorAll('.calendar-day:not(.empty):not(.disabled)');
        console.log('Updating calendar availability for', dayElements.length, 'day elements');
        
        dayElements.forEach(dayElement => {
            const dateString = dayElement.dataset.date;
            
            if (!dateString) return;
            
            // Check if we have availability data for this date
            const hasAvailability = this.state.availableTimeSlots[dateString] && 
                                this.state.availableTimeSlots[dateString].length > 0;
            
            // Remove any existing indicator
            const existingIndicator = dayElement.querySelector('.availability-indicator');
            if (existingIndicator) {
                dayElement.removeChild(existingIndicator);
            }
            
            // CRITICAL FIX: Ensure click events are always added
            // Remove existing click handlers to prevent duplicates
            dayElement.replaceWith(dayElement.cloneNode(true));
            
            // Get the replaced element
            const updatedDayElement = this.elements.calendarGrid.querySelector(`.calendar-day[data-date="${dateString}"]`);
            
            if (updatedDayElement) {
                // Add desktop click event
                updatedDayElement.addEventListener('click', () => {
                    console.log('Calendar day clicked:', dateString);
                    this.selectDate(updatedDayElement, dateString);
                });
                
                // Improve touch experience for mobile devices
                updatedDayElement.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    console.log('Calendar day touched:', dateString);
                    this.selectDate(updatedDayElement, dateString);
                });
                
                // Check if date is currently selected
                if (dateString === this.state.selectedDate) {
                    updatedDayElement.classList.add('selected');
                }
                
                // Add availability indicator
                if (hasAvailability) {
                    const indicator = document.createElement('span');
                    indicator.className = 'availability-indicator';
                    
                    const slots = this.state.availableTimeSlots[dateString].length;
                    if (slots > 10) {
                        indicator.classList.add('high');
                    } else if (slots > 5) {
                        indicator.classList.add('medium');
                    } else {
                        indicator.classList.add('low');
                    }
                    
                    updatedDayElement.appendChild(indicator);
                }
            }
        });
        
        // If we already had a date selected, update the time slots
        if (this.state.selectedDate) {
            this.updateTimeSlots(this.state.selectedDate);
        }
    },
    
    /**
     * Generate mock available slots for development/testing
     */
    generateMockAvailableSlots: function(startDate, endDate) {
        console.log('🔄 Generating mock available slots from', startDate, 'to', endDate);
        const daysInRange = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
        
        // Reset available slots for this date range
        for (let i = 0; i < daysInRange; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            const dateStr = this.formatDate(date);
            this.state.availableTimeSlots[dateStr] = [];
        }
        
        // Add mock slots for each day
        for (let i = 0; i < daysInRange; i++) {
            // Create date object for each day in range
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            
            // Skip weekends and past dates
            const dayOfWeek = date.getDay();
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (dayOfWeek === 0 || date < today) {
                continue; // Skip Sundays and past dates
            }
            
            const dateStr = this.formatDate(date);
            
            // Morning slots (9am to 12pm)
            for (let hour = 9; hour < 12; hour++) {
                const randomSkip = Math.random() < 0.3; // Randomly skip some slots
                if (randomSkip) continue;
                
                const slotDate = new Date(date);
                slotDate.setHours(hour, 0, 0, 0);
                
                const endDate = new Date(slotDate);
                endDate.setMinutes(endDate.getMinutes() + this.config.timeSlotDuration);
                
                const slot = {
                    date: dateStr,
                    startTime: this.formatTime(slotDate),
                    endTime: this.formatTime(endDate),
                    timestamp: slotDate.getTime()
                };
                
                this.state.availableTimeSlots[dateStr].push(slot);
            }
            
            // Afternoon slots (2pm to 5pm)
            for (let hour = 14; hour < 17; hour++) {
                const randomSkip = Math.random() < 0.4; // Randomly skip some slots
                if (randomSkip) continue;
                
                const slotDate = new Date(date);
                slotDate.setHours(hour, 0, 0, 0);
                
                const endDate = new Date(slotDate);
                endDate.setMinutes(endDate.getMinutes() + this.config.timeSlotDuration);
                
                const slot = {
                    date: dateStr,
                    startTime: this.formatTime(slotDate),
                    endTime: this.formatTime(endDate),
                    timestamp: slotDate.getTime()
                };
                
                this.state.availableTimeSlots[dateStr].push(slot);
            }
        }
        
        console.log('📊 Mock data generated with slots for', 
            Object.keys(this.state.availableTimeSlots).filter(date => 
                this.state.availableTimeSlots[date].length > 0).length, 'days');
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
     * Select a date on the calendar
     */
    selectDate: function(dayElement, dateString) {
        console.log('🗓️ Date selection triggered for:', dateString, dayElement);
        
        // Clear previous selection
        const prevSelected = this.elements.calendarGrid.querySelectorAll('.calendar-day.selected');
        prevSelected.forEach(day => {
            day.classList.remove('selected');
        });
        
        // Select this day
        dayElement.classList.add('selected');
        
        // Update state and inputs
        this.state.selectedDate = dateString;
        this.elements.selectedDateInput.value = dateString;
        
        if (this.elements.appointmentDateInput) {
            this.elements.appointmentDateInput.value = dateString;
        }
        
        // Update time slots
        this.updateTimeSlots(dateString);
        
        // Clear selected time
        this.state.selectedTime = '';
        this.elements.selectedTimeInput.value = '';
        
        // Track date selection
        if (typeof gtag === 'function') {
            gtag('event', 'date_selection', {
                selected_date: dateString,
                available_slots: this.state.availableTimeSlots[dateString]?.length || 0
            });
        }
    },
    
    /**
     * Update time slots when a date is selected
     */
    updateTimeSlots: function(dateString) {
        console.log('🕒 Updating time slots for date:', dateString);
        if (!this.elements.timeSlotContainer || !this.elements.selectedDateDisplay) return;
        
        // Clear time slots
        this.elements.timeSlotContainer.innerHTML = '';
        
        // Parse selected date
        const selectedDate = this.parseDate(dateString);
        
        // Format date for display
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        this.elements.selectedDateDisplay.textContent = selectedDate.toLocaleDateString('en-US', options);
        
        // Get available time slots for this date
        const availableSlots = this.state.availableTimeSlots[dateString] || [];
        
        if (availableSlots.length === 0) {
            this.elements.timeSlotContainer.innerHTML = '<p class="no-slots-message">No available appointments on this day. Please select another date.</p>';
            return;
        }
        
        console.log(`📅 Found ${availableSlots.length} slots for ${dateString}`);
        
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
        
        // Populate time slots
        availableSlots.forEach(slot => {
            // Determine if morning or afternoon
            const hour = parseInt(slot.startTime.split(':')[0]);
            const isMorning = hour < 12;
            
            // Format for display (convert to 12h format)
            const startHour = hour % 12 || 12;
            const startMinute = slot.startTime.split(':')[1];
            const amPm = hour < 12 ? 'AM' : 'PM';
            const displayTime = `${startHour}:${startMinute} ${amPm}`;
            
            // Create time slot element
            const timeSlot = document.createElement('div');
            timeSlot.className = 'time-slot';
            timeSlot.dataset.startTime = slot.startTime;
            timeSlot.dataset.endTime = slot.endTime;
            timeSlot.textContent = displayTime;
            
            // Add click event
            timeSlot.addEventListener('click', () => {
                this.selectTimeSlot(timeSlot, slot);
            });
            
            // Add to appropriate section
            if (isMorning) {
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
        
        // Enable continue button if user already selected a time
        const nextStepButton = document.querySelector('.form-step[data-step="3"] .next-step');
        if (nextStepButton) {
            nextStepButton.disabled = !this.state.selectedTime;
        }
    },
    
    /**
     * Select a time slot
     */
    selectTimeSlot: function(timeSlot, slot) {
        console.log('⏰ Time slot selected:', slot);
        
        // Deselect all other slots
        document.querySelectorAll('.time-slot.selected').forEach(el => {
            el.classList.remove('selected');
        });
        
        // Select this slot
        timeSlot.classList.add('selected');
        
        // Update state and input
        this.state.selectedTime = slot.startTime;
        this.state.selectedEndTime = slot.endTime;
        this.elements.selectedTimeInput.value = slot.startTime;
        
        if (this.elements.appointmentTimeInput) {
            this.elements.appointmentTimeInput.value = slot.startTime;
        }
        
        // Enable next button
        const nextButton = document.querySelector('.form-step[data-step="3"] .next-step');
        if (nextButton) {
            nextButton.disabled = false;
        }
        
        // Track time selection
        if (typeof gtag === 'function') {
            gtag('event', 'time_selection', {
                selected_date: this.state.selectedDate,
                selected_time: slot.startTime
            });
        }
    },
    
    /**
     * Validate current step
     */
    validateStep: function(stepNumber) {
        const currentStepElement = this.elements.formSteps[stepNumber - 1];
        if (!currentStepElement) return true;
        
        // Debug which step is being validated
        console.log(`Validating step ${stepNumber}`);
        
        let isValid = true;
        
        // Get all required inputs in current step
        const requiredInputs = currentStepElement.querySelectorAll('input[required], select[required], textarea[required]');
        
        // Debug required inputs
        console.log(`Found ${requiredInputs.length} required inputs`);
        
        // Add check for any maxlength attributes
        requiredInputs.forEach(input => {
            const maxLength = input.getAttribute('maxlength');
            if (maxLength !== null) {
                console.log(`Input ${input.id || input.name} has maxlength=${maxLength}`);
                if (parseInt(maxLength) < 0) {
                    console.error(`Found negative maxlength on ${input.id || input.name} - removing it`);
                    input.removeAttribute('maxlength');
                }
            }
            
            // Check for pattern validation
            const pattern = input.getAttribute('pattern');
            if (pattern) {
                console.log(`Input ${input.id || input.name} has pattern=${pattern}`);
            }
        });
        
        // Validate each required input
        requiredInputs.forEach(input => {
            // Skip validation for hidden inputs
            if (input.type === 'hidden') return;
            
            // Use the validateInput function for each input
            if (!this.validateInput(input)) {
                isValid = false;
            }
        });
        
        // Special validation for step 3 (date & time selection)
        if (stepNumber === 3) {
            if (!this.state.selectedDate || !this.state.selectedTime) {
                isValid = false;
                
                // Show notification
                if (!this.state.selectedDate) {
                    this.showNotification('Please select a date from the calendar', 'error');
                } else if (!this.state.selectedTime) {
                    this.showNotification('Please select an available time slot', 'error');
                }
            }
        }
        
        return isValid;
    },
    
    /**
     * Validate a single input
     */
    validateInput: function(input) {
        // Debug message to trace validation
        console.log(`Validating ${input.id || input.name}`, { 
            type: input.type, 
            value: input.value,
            maxlength: input.getAttribute('maxlength'),
            validity: input.validity
        });
        
        // Check and fix any negative maxlength attributes or properties
        const maxLength = input.getAttribute('maxlength');
        if (maxLength !== null && parseInt(maxLength) < 0) {
            console.error(`Found negative maxlength on ${input.id || input.name} during validation - removing it`);
            input.removeAttribute('maxlength');
        }
        
        // Also check the maxLength property (DOM property vs attribute)
        if (input.maxLength && input.maxLength < 0) {
            console.error(`Found negative maxLength property=${input.maxLength} on ${input.id || input.name} - setting to a reasonable default`);
            input.maxLength = 255;
        }
        
        // Skip validation for hidden inputs
        if (input.type === 'hidden') return true;
        
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
        
        // Validate based on input type and requirements
        if (!value && input.required) {
            formGroup.classList.add('is-invalid');
            feedback.textContent = 'This field is required';
            return false;
        } else if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            formGroup.classList.add('is-invalid');
            feedback.textContent = 'Please enter a valid email address';
            return false;
        } else if (input.type === 'tel' && !/^[\d\+\-\(\) ]{10,15}$/.test(value)) {
            formGroup.classList.add('is-invalid');
            feedback.textContent = 'Please enter a valid phone number';
            return false;
        } else {
            formGroup.classList.add('is-valid');
            feedback.textContent = '';
            return true;
        }
    },
    
    /**
     * Show notification message
     */
    showNotification: function(message, type = 'info') {
        // Create notification element if it doesn't exist
        let notification = document.querySelector('.booking-notification');
        if (!notification) {
            notification = document.createElement('div');
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
        if (this.elements.specificService && this.elements.specificService.selectedIndex > 0) {
            serviceName = this.elements.specificService.options[this.elements.specificService.selectedIndex].text;
        }
        
        // Get dentist name
        let dentistName = 'No preference';
        if (this.elements.preferredDentist && this.elements.preferredDentist.selectedIndex > 0) {
            dentistName = this.elements.preferredDentist.options[this.elements.preferredDentist.selectedIndex].text;
        }
        
        // Get date and time
        let dateTimeText = 'Not selected';
        if (this.state.selectedDate && this.state.selectedTime) {
            const date = this.parseDate(this.state.selectedDate);
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            dateTimeText = `${date.toLocaleDateString('en-US', options)} at ${this.state.selectedTime}`;
        }
        
        // Update summary elements
        this.elements.summaryName.textContent = fullName;
        this.elements.summaryService.textContent = serviceName;
        this.elements.summaryDentist.textContent = dentistName;
        this.elements.summaryDatetime.textContent = dateTimeText;
    },
    
    /**
     * Handle form submission with direct API integration
     */
    handleFormSubmit: function(event) {
        event.preventDefault();
        
        // Always fix maxlength issues right before submission
        this.fixInputsBeforeSubmission();
        
        // Validate final step
        if (!this.validateStep(this.state.currentStep)) {
            return false;
        }
        
        // Check if already submitting to prevent double submission
        if (this.state.submitting) {
            return false;
        }
        
        // Set submitting state
        this.state.submitting = true;
        this.elements.loadingIndicator.classList.add('visible');
        
        // Collect form data
        const formData = this.collectFormData();
        
        // Store the form data in localStorage as a backup
        localStorage.setItem('wbdc_last_booking_data', JSON.stringify(formData));
        
        // Check if ApiService is available
        if (typeof ApiService !== 'undefined') {
            // Submit booking through the API service
            ApiService.submitBooking(formData)
                .then(response => {
                    console.log('Booking response:', response);
                    this.handleBookingSuccess(formData, response);
                })
                .catch(error => {
                    console.error('Booking error:', error);
                    this.handleBookingError(error);
                })
                .finally(() => {
                    this.state.submitting = false;
                    this.elements.loadingIndicator.classList.remove('visible');
                });
        } else {
            // Fallback to mock submission if API is not available
            console.warn('API service not available, using mock submission');
            
            // Simulate API delay
            setTimeout(() => {
                this.handleBookingSuccess(formData, {
                    success: true,
                    message: 'Booking completed (mock mode)'
                });
                
                this.state.submitting = false;
                this.elements.loadingIndicator.classList.remove('visible');
            }, 2000);
        }
        
        return false;
    },
    
    /**
     * Handle successful booking
     */
    handleBookingSuccess: function(formData, response) {
        // Track form submission
        if (typeof gtag === 'function') {
            gtag('event', 'form_submission', {
                status: 'success',
                service: formData.specificServiceName || ''
            });
        }
        
        // Redirect to success page
            const redirectUrl = 'booking-success.html';
            
            // Create URL params for the success page
            const successParams = new URLSearchParams();
            Object.entries(formData).forEach(([key, value]) => {
                if (typeof value === 'string' || typeof value === 'number') {
                    successParams.append(key, value);
                }
            });
            
            // Add status info
        successParams.append('submission_status', 'success');
            if (response?.message) {
                successParams.append('submission_message', response.message);
            }
            
        // Add calendar event link if available
        if (response?.calendarEvent?.eventLink) {
            successParams.append('calendar_link', response.calendarEvent.eventLink);
            }
            
            // Redirect to success page
            window.location.href = redirectUrl + '?' + successParams.toString();
    },
    
    /**
     * Handle booking error
     */
    handleBookingError: function(error) {
        // Track form submission error
        if (typeof gtag === 'function') {
            gtag('event', 'form_submission', {
                status: 'error',
                error_message: error.message || 'Unknown error'
            });
        }
        
        // Show error message
        alert('There was an error processing your booking: ' + (error.message || 'Unknown error') + 
              '\n\nPlease try again or contact us directly.');
    },
    
    /**
     * Fix all inputs immediately before form submission
     */
    fixInputsBeforeSubmission: function() {
        console.log('Fixing all inputs before form submission');
        
        // Remove maxlength attribute from all inputs
        const allInputs = document.querySelectorAll('input, textarea');
        allInputs.forEach(input => {
            // Check for negative maxlength attribute
            const maxLengthAttr = input.getAttribute('maxlength');
            if (maxLengthAttr !== null && parseInt(maxLengthAttr) < 0) {
                console.log(`Removing negative maxlength attribute from ${input.id || input.name} before submission`);
                input.removeAttribute('maxlength');
            }
            
            // Fix negative maxLength property
            if (input.maxLength < 0) {
                console.log(`Fixing negative maxLength property on ${input.id || input.name} before submission`);
                // Set to a more generous value to allow submission
                input.maxLength = 1000;
            }
        });
        
        // Specifically target the fields we know are problematic
        const firstNameInput = document.getElementById('first-name');
        const lastNameInput = document.getElementById('last-name');
        
        if (firstNameInput) {
            firstNameInput.removeAttribute('maxlength');
            if (firstNameInput.maxLength < 0) {
                firstNameInput.maxLength = 1000;
            }
            console.log('First name field fixed before submission');
        }
        
        if (lastNameInput) {
            lastNameInput.removeAttribute('maxlength');
            if (lastNameInput.maxLength < 0) {
                lastNameInput.maxLength = 1000;
            }
            console.log('Last name field fixed before submission');
        }
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
     * Format time object to string (HH:MM)
     */
    formatTime: function(date) {
        return date.toTimeString().slice(0, 5);
    },
    
    /**
     * Handle URL parameters (if any)
     */
    handleUrlParameters: function() {
        // Get URL parameters
        const params = new URLSearchParams(window.location.search);
        
        // Check for service parameter
        if (params.has('service')) {
            const serviceId = params.get('service');
            if (this.elements.serviceCategory) {
                // Set service category
                const category = this.findServiceCategory(serviceId);
                if (category) {
                    this.elements.serviceCategory.value = category;
                    // Trigger change event to update specific services
                    const event = new Event('change');
                    this.elements.serviceCategory.dispatchEvent(event);
                    
                    // Set specific service
                    if (this.elements.specificService) {
                        setTimeout(() => {
                            this.elements.specificService.value = serviceId;
                        }, 100);
                    }
                }
            }
        }
        
        // Check for dentist parameter
        if (params.has('dentist') && this.elements.preferredDentist) {
            const dentistId = params.get('dentist');
            this.elements.preferredDentist.value = dentistId;
        }
        
        // Check for date parameter
        if (params.has('date')) {
            const dateParam = params.get('date');
            // Store for later use when calendar is initialized
            this.state.preselectedDate = dateParam;
        }
    },
    
    /**
     * Find service category for a specific service
     */
    findServiceCategory: function(serviceId) {
        // Define service categories and their services
        const serviceCategories = {
            'general': ['cleaning', 'checkup', 'fillings', 'extractions'],
            'cosmetic': ['whitening', 'veneers', 'bonding'],
            'restorative': ['crowns', 'bridges', 'implants'],
            'specialty': ['orthodontics', 'periodontics', 'endodontics']
        };
        
        // Find category containing the service
        for (const category in serviceCategories) {
            if (serviceCategories[category].includes(serviceId)) {
                return category;
            }
        }
        
        return null;
    }
};

// Initialize the booking system when the DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    BookingSystem.init();
});