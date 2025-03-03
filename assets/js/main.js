/**
 * Wisdom Bites Dental Clinic
 * Main JavaScript
 * Version: 1.0
 */

document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    // Initialize all components
    initNavigation();
    initScrollEffects();
    initAnimations();
    initTooltips();
    initModals();
    initLazyLoading();
    initSmoothScroll();
    initBackToTop();
    
    // Custom components for specific pages
    if (document.querySelector('.testimonials-slider')) {
        initTestimonialsSlider();
    }

    if (document.querySelector('.booking-form')) {
        initBookingForm();
    }

    if (document.querySelector('.contact-form')) {
        initContactForm();
    }
});

/**
 * Navigation functionality
 */
function initNavigation() {
    const header = document.querySelector('.site-header');
    const menuToggle = document.querySelector('.menu-toggle');
    const navList = document.querySelector('.nav-list');
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    
    // Scroll header effect
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
    
    // Mobile menu toggle
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            navList.classList.toggle('active');
            document.body.classList.toggle('menu-open');
            
            // Transform hamburger to X
            this.classList.toggle('active');
        });
    }
    
    // Dropdown menus for mobile
    if (window.innerWidth < 768) {
        dropdownToggles.forEach(toggle => {
            toggle.addEventListener('click', function(e) {
                e.preventDefault();
                const parent = this.parentElement;
                const dropdown = parent.querySelector('.dropdown-menu');
                
                // Close other dropdowns
                document.querySelectorAll('.dropdown-menu.active').forEach(menu => {
                    if (menu !== dropdown) {
                        menu.classList.remove('active');
                    }
                });
                
                dropdown.classList.toggle('active');
            });
        });
    }
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (navList.classList.contains('active') && !e.target.closest('.main-nav') && !e.target.closest('.menu-toggle')) {
            navList.classList.remove('active');
            menuToggle.classList.remove('active');
            document.body.classList.remove('menu-open');
        }
    });
    
    // Set active menu item based on current page
    const currentPage = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-list a');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || href === currentPage.substring(currentPage.lastIndexOf('/') + 1)) {
            link.classList.add('active');
            // If in dropdown, also set parent as active
            const parent = link.closest('.has-dropdown');
            if (parent) {
                parent.querySelector('.dropdown-toggle').classList.add('active');
            }
        }
    });
}

/**
 * Scroll effects
 */
function initScrollEffects() {
    const elements = document.querySelectorAll('.scroll-reveal');
    
    // Initial check for elements in view
    checkElementsInView();
    
    // Check on scroll
    window.addEventListener('scroll', checkElementsInView);
    
    function checkElementsInView() {
        const windowHeight = window.innerHeight;
        const windowTop = window.scrollY;
        const windowBottom = windowTop + windowHeight;
        
        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top + windowTop;
            const elementBottom = elementTop + element.offsetHeight;
            
            // If element is in viewport
            if (elementTop <= windowBottom - 100 && elementBottom >= windowTop + 100) {
                element.classList.add('revealed');
            }
        });
    }
}

/**
 * Animation effects
 */
function initAnimations() {
    // Staggered animations for lists
    const animatedLists = document.querySelectorAll('.animate-list');
    
    animatedLists.forEach(list => {
        const items = list.children;
        Array.from(items).forEach((item, index) => {
            item.style.animationDelay = `${0.1 * index}s`;
        });
    });
}

/**
 * Tooltips
 */
function initTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    
    tooltipElements.forEach(element => {
        const tooltipText = element.getAttribute('data-tooltip');
        
        // Create tooltip element
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = tooltipText;
        
        // Events to show/hide tooltip
        element.addEventListener('mouseenter', () => {
            document.body.appendChild(tooltip);
            const rect = element.getBoundingClientRect();
            
            tooltip.style.top = `${rect.top - tooltip.offsetHeight - 10 + window.scrollY}px`;
            tooltip.style.left = `${rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2)}px`;
            tooltip.classList.add('active');
        });
        
        element.addEventListener('mouseleave', () => {
            tooltip.classList.remove('active');
            setTimeout(() => {
                if (tooltip.parentNode) {
                    tooltip.parentNode.removeChild(tooltip);
                }
            }, 300);
        });
    });
}

/**
 * Modal functionality
 */
function initModals() {
    const modalTriggers = document.querySelectorAll('[data-modal-target]');
    const modalCloseButtons = document.querySelectorAll('.modal-close');
    
    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const modalId = trigger.getAttribute('data-modal-target');
            const modal = document.getElementById(modalId);
            
            if (modal) {
                modal.classList.add('active');
                document.body.classList.add('modal-open');
            }
        });
    });
    
    modalCloseButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            modal.classList.remove('active');
            document.body.classList.remove('modal-open');
        });
    });
    
    // Close modal when clicking outside content
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
            document.body.classList.remove('modal-open');
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.modal.active');
            if (activeModal) {
                activeModal.classList.remove('active');
                document.body.classList.remove('modal-open');
            }
        }
    });
}

/**
 * Lazy loading images
 */
function initLazyLoading() {
    const lazyImages = document.querySelectorAll('.lazy-load');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const image = entry.target;
                    image.src = image.dataset.src;
                    
                    image.addEventListener('load', () => {
                        image.classList.add('loaded');
                    });
                    
                    imageObserver.unobserve(image);
                }
            });
        });
        
        lazyImages.forEach(image => {
            imageObserver.observe(image);
        });
    } else {
        // Fallback for browsers without IntersectionObserver
        lazyImages.forEach(image => {
            image.src = image.dataset.src;
            image.classList.add('loaded');
        });
    }
}

/**
 * Smooth scrolling for anchor links
 */
function initSmoothScroll() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerHeight = document.querySelector('.site-header').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Update URL but don't scroll
                history.pushState(null, null, targetId);
            }
        });
    });
}

/**
 * Back to top button
 */
function initBackToTop() {
    const backToTopButton = document.querySelector('.back-to-top');
    
    if (backToTopButton) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopButton.classList.add('active');
            } else {
                backToTopButton.classList.remove('active');
            }
        });
        
        backToTopButton.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

/**
 * Testimonials slider
 */
function initTestimonialsSlider() {
    const slider = document.querySelector('.testimonials-slider');
    const slides = slider.querySelectorAll('.testimonial-slide');
    const dotsContainer = slider.querySelector('.control-dots');
    const prevButton = slider.querySelector('.control-prev');
    const nextButton = slider.querySelector('.control-next');
    
    let currentSlide = 0;
    const slideCount = slides.length;
    
    // Create dots
    for (let i = 0; i < slideCount; i++) {
        const dot = document.createElement('span');
        dot.classList.add('dot');
        if (i === 0) dot.classList.add('active');
        dot.dataset.slide = i;
        dotsContainer.appendChild(dot);
        
        dot.addEventListener('click', () => {
            goToSlide(i);
        });
    }
    
    // Set initial slide
    updateSlides();
    
    // Event listeners for controls
    prevButton.addEventListener('click', () => {
        currentSlide = (currentSlide - 1 + slideCount) % slideCount;
        updateSlides();
    });
    
    nextButton.addEventListener('click', () => {
        currentSlide = (currentSlide + 1) % slideCount;
        updateSlides();
    });
    
    // Auto-advance slides
    let slideInterval = setInterval(() => {
        currentSlide = (currentSlide + 1) % slideCount;
        updateSlides();
    }, 5000);
    
    // Pause auto-advance on hover
    slider.addEventListener('mouseenter', () => {
        clearInterval(slideInterval);
    });
    
    slider.addEventListener('mouseleave', () => {
        clearInterval(slideInterval);
        slideInterval = setInterval(() => {
            currentSlide = (currentSlide + 1) % slideCount;
            updateSlides();
        }, 5000);
    });
    
    function goToSlide(index) {
        currentSlide = index;
        updateSlides();
    }
    
    function updateSlides() {
        // Update slides
        slides.forEach((slide, index) => {
            slide.style.transform = `translateX(${100 * (index - currentSlide)}%)`;
        });
        
        // Update dots
        const dots = dotsContainer.querySelectorAll('.dot');
        dots.forEach((dot, index) => {
            if (index === currentSlide) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }
}

/**
 * Booking form functionality
 */
function initBookingForm() {
    const bookingForm = document.querySelector('.booking-form');
    const dateInput = bookingForm.querySelector('[name="appointment-date"]');
    const timeSelect = bookingForm.querySelector('[name="appointment-time"]');
    const serviceSelect = bookingForm.querySelector('[name="service"]');
    
    // Set min date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowFormatted = tomorrow.toISOString().split('T')[0];
    dateInput.min = tomorrowFormatted;
    
    // Form validation
    bookingForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        let isValid = true;
        const formData = new FormData(bookingForm);
        
        // Validate required fields
        const requiredFields = bookingForm.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            if (!field.value) {
                isValid = false;
                showError(field, 'This field is required');
            } else {
                clearError(field);
            }
        });
        
        // Validate email format
        const emailInput = bookingForm.querySelector('[type="email"]');
        if (emailInput && emailInput.value && !isValidEmail(emailInput.value)) {
            isValid = false;
            showError(emailInput, 'Please enter a valid email address');
        }
        
        // Validate phone format
        const phoneInput = bookingForm.querySelector('[name="phone"]');
        if (phoneInput && phoneInput.value && !isValidPhone(phoneInput.value)) {
            isValid = false;
            showError(phoneInput, 'Please enter a valid phone number');
        }
        
        if (isValid) {
            // Show success message (in a real app this would be an AJAX submission)
            const successMessage = document.createElement('div');
            successMessage.className = 'success-message';
            successMessage.innerHTML = '<p>Thank you! Your appointment request has been submitted. We will contact you shortly to confirm your appointment.</p>';
            
            bookingForm.innerHTML = '';
            bookingForm.appendChild(successMessage);
            
            // In a real app, would submit the form data here
            console.log('Form submitted successfully');
            for (const [key, value] of formData.entries()) {
                console.log(`${key}: ${value}`);
            }
        }
    });
    
    // Dynamic time slots based on selected date
    dateInput.addEventListener('change', function() {
        // This would typically be populated with available time slots from a backend
        // For demo purposes, we'll just add some sample times
        timeSelect.innerHTML = '';
        
        const date = new Date(this.value);
        const dayOfWeek = date.getDay();
        
        // Check if weekend
        if (dayOfWeek === 0) { // Sunday
            timeSelect.innerHTML = '<option value="">Closed on Sundays</option>';
            timeSelect.disabled = true;
        } else if (dayOfWeek === 6) { // Saturday
            // Limited hours on Saturday
            const saturdayTimes = ['09:00', '10:00', '11:00', '12:00'];
            timeSelect.innerHTML = '<option value="">Select a time</option>';
            saturdayTimes.forEach(time => {
                const option = document.createElement('option');
                option.value = time;
                option.textContent = time;
                timeSelect.appendChild(option);
            });
            timeSelect.disabled = false;
        } else {
            // Weekday times
            const weekdayTimes = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];
            timeSelect.innerHTML = '<option value="">Select a time</option>';
            weekdayTimes.forEach(time => {
                const option = document.createElement('option');
                option.value = time;
                option.textContent = time;
                timeSelect.appendChild(option);
            });
            timeSelect.disabled = false;
        }
    });
    
    // Dynamic doctor options based on selected service
    if (serviceSelect) {
        serviceSelect.addEventListener('change', function() {
            const doctorSelect = bookingForm.querySelector('[name="doctor"]');
            if (doctorSelect) {
                // In a real app, this would come from the backend based on service
                const service = this.value;
                doctorSelect.innerHTML = '<option value="">Select a doctor</option>';
                
                if (service === 'general-dentistry') {
                    addDoctorOption(doctorSelect, 'dr-smith', 'Dr. Smith');
                    addDoctorOption(doctorSelect, 'dr-johnson', 'Dr. Johnson');
                } else if (service === 'cosmetic-dentistry') {
                    addDoctorOption(doctorSelect, 'dr-williams', 'Dr. Williams');
                    addDoctorOption(doctorSelect, 'dr-brown', 'Dr. Brown');
                } else if (service === 'emergency-care') {
                    addDoctorOption(doctorSelect, 'dr-emergency', 'Dr. Emergency');
                }
            }
        });
    }
    
    function addDoctorOption(select, value, text) {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = text;
        select.appendChild(option);
    }
    
    function showError(field, message) {
        // Clear any existing error
        clearError(field);
        
        // Add error class to field
        field.classList.add('error');
        
        // Create and append error message
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        
        const parent = field.parentElement;
        parent.appendChild(errorElement);
    }
    
    function clearError(field) {
        field.classList.remove('error');
        const parent = field.parentElement;
        const errorElement = parent.querySelector('.error-message');
        if (errorElement) {
            parent.removeChild(errorElement);
        }
    }
    
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    function isValidPhone(phone) {
        const phoneRegex = /^[\d\+\-\(\) ]{10,15}$/;
        return phoneRegex.test(phone);
    }
}

/**
 * Contact form functionality
 */
function initContactForm() {
    const contactForm = document.querySelector('.contact-form');
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        let isValid = true;
        const formData = new FormData(contactForm);
        
        // Validate required fields
        const requiredFields = contactForm.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            if (!field.value) {
                isValid = false;
                showError(field, 'This field is required');
            } else {
                clearError(field);
            }
        });
        
        // Validate email format
        const emailInput = contactForm.querySelector('[type="email"]');
        if (emailInput && emailInput.value && !isValidEmail(emailInput.value)) {
            isValid = false;
            showError(emailInput, 'Please enter a valid email address');
        }
        
        // Validate privacy checkbox
        const privacyCheckbox = contactForm.querySelector('[name="privacy-policy"]');
        if (privacyCheckbox && !privacyCheckbox.checked) {
            isValid = false;
            showError(privacyCheckbox, 'You must agree to the privacy policy');
        }
        
        if (isValid) {
            // Show success message (in a real app this would be an AJAX submission)
            const successMessage = document.createElement('div');
            successMessage.className = 'success-message';
            successMessage.innerHTML = '<p>Thank you for reaching out! Your message has been sent successfully. We will respond to your inquiry as soon as possible.</p>';
            
            contactForm.innerHTML = '';
            contactForm.appendChild(successMessage);
            
            // In a real app, would submit the form data here
            console.log('Form submitted successfully');
            for (const [key, value] of formData.entries()) {
                console.log(`${key}: ${value}`);
            }
        }
    });
    
    function showError(field, message) {
        // Clear any existing error
        clearError(field);
        
        // Add error class to field
        field.classList.add('error');
        
        // Create and append error message
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        
        const parent = field.parentElement;
        parent.appendChild(errorElement);
    }
    
    function clearError(field) {
        field.classList.remove('error');
        const parent = field.parentElement;
        const errorElement = parent.querySelector('.error-message');
        if (errorElement) {
            parent.removeChild(errorElement);
        }
    }
    
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
} 