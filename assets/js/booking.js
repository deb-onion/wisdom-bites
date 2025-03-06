/**
 * Wisdom Bites Dental Clinic
 * Enhanced Booking System with Google Calendar & Sheets Integration
 * 
 * This implementation connects the booking form to Google Calendar for availability
 * and Google Sheets for data storage, creating a complete booking solution.
 */

"use strict";

const GoogleBookingSystem = {
    // Configuration options
    config: {
        // Calendar settings
        calendarId: 'clinic@wisdombites.com', // Your clinic's Google Calendar ID
        timeSlotDuration: 30, // in minutes
        maxBookingDays: 60, // How far in advance patients can book
        
        // API endpoints
        calendarApiEndpoint: 'https://script.google.com/macros/s/AKfycby284ZOZj-SIIovs4D7vb7LML__k1nTsH16xtZhHrI8EwTpn0DjpR-nSykC8YsZYIsS/exec',
        bookingApiEndpoint: 'https://script.google.com/macros/s/AKfycby284ZOZj-SIIovs4D7vb7LML__k1nTsH16xtZhHrI8EwTpn0DjpR-nSykC8YsZYIsS/exec',
        
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
        loadingAvailability: false
    },
    
    /**
     * Initialize the booking system
     */
    init: function() {
        console.log('Initializing Google Booking System');
        
        // Cache DOM elements
        this.cacheElements();
        
        // Generate session ID for tracking
        this.state.sessionId = 'WB-' + Date.now() + '-' + Math.floor(Math.random() * 1000000);
        
        // Initialize components
        this.initFormSteps();
        this.initServiceSelection();
        this.initCalendar();
        this.initFormValidation();
        
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
        if (!this.elements.calendarGrid || !this.elements.calendarMonth) return;
        
        const today = new Date();
        let currentMonth = today.getMonth();
        let currentYear = today.getFullYear();
        
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
            
            // Set min date (today) and max date (today + maxBookingDays)
            const minDate = new Date();
            minDate.setHours(0, 0, 0, 0);
            
            const maxDate = new Date();
            maxDate.setDate(maxDate.getDate() + this.config.maxBookingDays);
            
            // Add days of the month
            for (let day = 1; day <= totalDays; day++) {
                const date = new Date(currentYear, currentMonth, day);
                const dateString = this.formatDate(date);
                
                const dayElement = document.createElement('div');
                dayElement.className = 'calendar-day';
                dayElement.textContent = day;
                dayElement.dataset.date = dateString;
                
                // Check if date is selectable
                const isBeforeMin = date < minDate;
                const isAfterMax = date > maxDate;
                
                // Check if it's a closed day
                const dayOfWeek = date.getDay();
                const isClosedDay = !this.config.businessHours[dayOfWeek] || this.config.businessHours[dayOfWeek].length === 0;
                
                if (isBeforeMin || isAfterMax || isClosedDay) {
                    dayElement.classList.add('disabled');
                } else {
                    // Add clickable behavior for available dates
                    dayElement.addEventListener('click', () => {
                        this.selectDate(dayElement, dateString);
                    });
                    
                    // Check if date has available slots
                    const hasAvailability = this.state.availableTimeSlots[dateString] && 
                                          this.state.availableTimeSlots[dateString].length > 0;
                    
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
                        
                        dayElement.appendChild(indicator);
                    } else {
                        // If we don't have availability data for this date yet, mark it as loading
                        if (!this.state.loadingAvailability) {
                            // Fetch availability data for this month
                            this.fetchMonthAvailability(currentYear, currentMonth);
                        }
                    }
                }
                
                // Highlight today
                if (date.toDateString() === new Date().toDateString()) {
                    dayElement.classList.add('today');
                }
                
                // Highlight selected date
                if (dateString === this.state.selectedDate) {
                    dayElement.classList.add('selected');
                }
                
                this.elements.calendarGrid.appendChild(dayElement);
            }
            
            // Add empty cells for days after the last day to complete the grid
            const totalCells = this.elements.calendarGrid.children.length;
            const cellsInLastRow = totalCells % 7;
            
            if (cellsInLastRow > 0) {
                const emptyCellsNeeded = 7 - cellsInLastRow;
                for (let i = 0; i < emptyCellsNeeded; i++) {
                    const emptyCell = document.createElement('div');
                    emptyCell.className = 'calendar-day empty';
                    this.elements.calendarGrid.appendChild(emptyCell);
                }
            }
        };
        
        // Go to previous month
        const goToPrevMonth = () => {
            currentMonth--;
            
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            
            generateCalendar();
            this.fetchMonthAvailability(currentYear, currentMonth);
        };
        
        // Go to next month
        const goToNextMonth = () => {
            currentMonth++;
            
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            
            generateCalendar();
            this.fetchMonthAvailability(currentYear, currentMonth);
        };
        
        // Bind events
        this.elements.prevMonthButton.addEventListener('click', goToPrevMonth);
        this.elements.nextMonthButton.addEventListener('click', goToNextMonth);
        
        // Initialize calendar
        generateCalendar();
        
        // Fetch initial availability
        this.fetchMonthAvailability(currentYear, currentMonth);
    },
    
    /**
     * Fetch availability for a specific month from Google Calendar
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
        
        // Show loading message for timeslots
        if (this.elements.timeSlotContainer) {
            this.elements.timeSlotContainer.innerHTML = '<div class="loading-message">Loading available appointments...</div>';
        }
        
        // For development or testing, use mock data
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log('Using mock availability data for development');
            setTimeout(() => {
                this.generateMockAvailableSlots(startDate, endDate);
                this.state.loadingAvailability = false;
                this.updateCalendarAvailability();
            }, 800);
            return;
        }
        
        // Make API call to Google Apps Script endpoint
        fetch(`${this.config.calendarApiEndpoint}?action=getAvailability&start=${startDateStr}&end=${endDateStr}&service=${this.elements.specificService?.value || ''}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch availability data');
                }
                return response.json();
            })
            .then(data => {
                if (data && data.slots) {
                    // Merge new availability data with existing data
                    this.state.availableTimeSlots = {...this.state.availableTimeSlots, ...data.slots};
                    
                    // Update calendar display
                    this.updateCalendarAvailability();
                } else {
                    console.warn('Invalid availability data format received');
                    this.generateMockAvailableSlots(startDate, endDate);
                }
                
                this.state.loadingAvailability = false;
            })
            .catch(error => {
                console.error('Error fetching availability:', error);
                
                // Fallback to mock data
                this.generateMockAvailableSlots(startDate, endDate);
                this.state.loadingAvailability = false;
                this.updateCalendarAvailability();
            });
    },
    
    /**
     * Update calendar to show availability indicators
     */
    updateCalendarAvailability: function() {
        const dayElements = this.elements.calendarGrid.querySelectorAll('.calendar-day:not(.empty):not(.disabled)');
        
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
                
                dayElement.appendChild(indicator);
            } else {
                // If no availability, add disabled class
                dayElement.classList.add('unavailable');
                
                // Remove click event by cloning and replacing
                const newDayElement = dayElement.cloneNode(true);
                dayElement.parentNode.replaceChild(newDayElement, dayElement);
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
        const daysInRange = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
        
        for (let i = 0; i < daysInRange; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            
            // Skip closed days
            const dayOfWeek = date.getDay();
            if (!this.config.businessHours[dayOfWeek] || this.config.businessHours[dayOfWeek].length === 0) {
                continue;
            }
            
            const dateString = this.formatDate(date);
            const timeSlots = [];
            
            // Generate between 0-15 slots for each day
            const slotsCount = Math.floor(Math.random() * 16);
            
            // Get business hours for this day
            const [startHour, endHour] = this.config.businessHours[dayOfWeek];
            const startHourNum = parseInt(startHour.split(':')[0]);
            const endHourNum = parseInt(endHour.split(':')[0]);
            
            // Generate random available times within business hours
            const availableTimes = new Set();
            for (let j = 0; j < slotsCount; j++) {
                const hour = startHourNum + Math.floor(Math.random() * (endHourNum - startHourNum));
                const minute = Math.random() < 0.5 ? 0 : 30; // Either on the hour or half hour
                
                const timeString = `${hour.toString().padStart(2, '0')}:${minute === 0 ? '00' : '30'}`;
                availableTimes.add(timeString);
            }
            
            // Convert to array and sort
            const sortedTimes = Array.from(availableTimes).sort();
            
            // Format times for display
            sortedTimes.forEach(time => {
                const [hourStr, minuteStr] = time.split(':');
                const hour = parseInt(hourStr);
                const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
                const period = hour >= 12 ? 'PM' : 'AM';
                
                timeSlots.push({
                    time: `${displayHour}:${minuteStr} ${period}`,
                    available: true
                });
            });
            
            this.state.availableTimeSlots[dateString] = timeSlots;
        }
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
        
        // Populate time slots
        availableSlots.forEach(slot => {
            // Create time slot element
            const timeSlot = document.createElement('div');
            timeSlot.className = 'time-slot';
            timeSlot.dataset.time = slot.time;
            timeSlot.textContent = slot.time;
            
            // Add click event
            timeSlot.addEventListener('click', () => {
                this.selectTimeSlot(timeSlot, slot.time);
            });
            
            // Add to appropriate section based on AM/PM
            if (slot.time.includes('AM')) {
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
        if (typeof gtag === 'function') {
            gtag('event', 'time_selection', {
                selected_date: this.state.selectedDate,
                selected_time: timeString
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
     * Handle form submission
     */
    handleFormSubmit: function(event) {
        // Prevent default form submission
        event.preventDefault();
        
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
        
        // For development/testing, simulate submission
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log('Form data (dev mode):', formData);
            
            setTimeout(() => {
                this.state.submitting = false;
                this.elements.loadingIndicator.classList.remove('visible');
                
                // Show booking confirmation
                this.showBookingConfirmation(formData);
                
                // Track form submission
                if (typeof gtag === 'function') {
                    gtag('event', 'form_submission', {
                        status: 'success',
                        service: formData.specificServiceName || ''
                    });
                }
            }, 1500);
            
            return false;
        }
        
        // Submit to Google Sheets via Apps Script
        fetch(this.config.bookingApiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'submitBooking',
                bookingData: formData
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            this.state.submitting = false;
            this.elements.loadingIndicator.classList.remove('visible');
            
            if (data.success) {
                // Show booking confirmation
                this.showBookingConfirmation(formData, data.calendarEventId);
                
                // Track form submission
                if (typeof gtag === 'function') {
                    gtag('event', 'form_submission', {
                        status: 'success',
                        service: formData.specificServiceName || ''
                    });
                }
            } else {
                // Show error message
                this.showNotification(data.message || 'There was an error processing your booking. Please try again.', 'error');
                
                // Track form submission error
                if (typeof gtag === 'function') {
                    gtag('event', 'form_submission', {
                        status: 'error',
                        error_message: data.message || 'Unknown error'
                    });
                }
            }
        })
        .catch(error => {
            console.error('Form submission error:', error);
            
            this.state.submitting = false;
            this.elements.loadingIndicator.classList.remove('visible');
            
            // Show error message
            this.showNotification('There was an error submitting your booking. Please try again or contact us directly.', 'error');
            
            // Track form submission error
            if (typeof gtag === 'function') {
                gtag('event', 'form_submission', {
                    status: 'error',
                    error_message: error.message
                });
            }
        });
        
        return false;
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
     * Show booking confirmation
     */
    showBookingConfirmation: function(formData, calendarEventId) {
        // Store appointment details in localStorage for future reference
        localStorage.setItem('wbdc_has_booking', 'true');
        localStorage.setItem('wbdc_appointment_details', JSON.stringify({
            name: this.elements.summaryName.textContent,
            service: this.elements.summaryService.textContent,
            dentist: this.elements.summaryDentist.textContent,
            datetime: this.elements.summaryDatetime.textContent,
            calendarEventId: calendarEventId || ''
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
                <p>We've sent a confirmation email to your inbox with these details. Your appointment has been added to our calendar. If you need to make any changes, please contact us.</p>
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
        }
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
                        }
                    }
                }, 100);
            }
        }
    }}