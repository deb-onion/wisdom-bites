/**
 * about.js - JavaScript for the About Us page of Wisdom Bites Dental Clinic
 * Handles page-specific functionality including team member animations,
 * timeline interactions, and form validation
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize animations for team section
    initTeamAnimations();
    
    // Initialize timeline interactions
    initTimelineInteractions();
    
    // Initialize contact form validation on the about page
    initAboutContactForm();
    
    // Initialize FAQ accordion if present on the about page
    initAboutFAQAccordion();
});

/**
 * Initialize animations for team members section
 * Adds hover effects and reveal animations
 */
function initTeamAnimations() {
    const teamMembers = document.querySelectorAll('.team-member');
    
    if (teamMembers.length === 0) return;
    
    // Add animation classes as team members come into view
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const teamObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    teamMembers.forEach(member => {
        // Add hover effects
        member.addEventListener('mouseenter', function() {
            this.classList.add('hover');
        });
        
        member.addEventListener('mouseleave', function() {
            this.classList.remove('hover');
        });
        
        // Observe for scroll animations
        teamObserver.observe(member);
    });
}

/**
 * Initialize timeline interactions for clinic history
 * Handles hover states and animations for timeline events
 */
function initTimelineInteractions() {
    const timelineEvents = document.querySelectorAll('.timeline-event');
    
    if (timelineEvents.length === 0) return;
    
    // Set up intersection observer for timeline events
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };
    
    const timelineObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('active');
                }, entry.target.dataset.delay || 0);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Add delay for staggered animation effect
    timelineEvents.forEach((event, index) => {
        event.dataset.delay = index * 150;
        timelineObserver.observe(event);
        
        // Add click event to expand/collapse detail
        event.addEventListener('click', function() {
            const detail = this.querySelector('.timeline-detail');
            if (detail) {
                if (this.classList.contains('expanded')) {
                    this.classList.remove('expanded');
                    detail.style.maxHeight = '0';
                } else {
                    // Close any other open events
                    document.querySelectorAll('.timeline-event.expanded').forEach(item => {
                        if (item !== this) {
                            item.classList.remove('expanded');
                            item.querySelector('.timeline-detail').style.maxHeight = '0';
                        }
                    });
                    
                    // Open this event
                    this.classList.add('expanded');
                    detail.style.maxHeight = detail.scrollHeight + 'px';
                }
            }
        });
    });
}

/**
 * Initialize contact form validation on the about page
 * Handles validation and submission of the mini contact form
 */
function initAboutContactForm() {
    const contactForm = document.querySelector('.about-contact-form');
    
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form fields
        const nameInput = this.querySelector('input[name="name"]');
        const emailInput = this.querySelector('input[name="email"]');
        const messageInput = this.querySelector('textarea[name="message"]');
        
        // Validate fields
        let isValid = true;
        
        if (!nameInput.value.trim()) {
            showError(nameInput, 'Please enter your name');
            isValid = false;
        } else {
            clearError(nameInput);
        }
        
        if (!emailInput.value.trim()) {
            showError(emailInput, 'Please enter your email');
            isValid = false;
        } else if (!isValidEmail(emailInput.value.trim())) {
            showError(emailInput, 'Please enter a valid email address');
            isValid = false;
        } else {
            clearError(emailInput);
        }
        
        if (!messageInput.value.trim()) {
            showError(messageInput, 'Please enter your message');
            isValid = false;
        } else {
            clearError(messageInput);
        }
        
        // If valid, submit form (in real implementation, would send to server)
        if (isValid) {
            // Show success message
            const successMessage = document.createElement('div');
            successMessage.className = 'form-success';
            successMessage.textContent = 'Thank you for your message! We will get back to you shortly.';
            
            // Replace form with success message
            contactForm.innerHTML = '';
            contactForm.appendChild(successMessage);
            
            // In a real implementation, would send form data to server here
        }
    });
    
    // Helper functions for form validation
    function showError(input, message) {
        const formGroup = input.closest('.form-group');
        let errorElement = formGroup.querySelector('.form-error');
        
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'form-error';
            formGroup.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
        formGroup.classList.add('has-error');
    }
    
    function clearError(input) {
        const formGroup = input.closest('.form-group');
        const errorElement = formGroup.querySelector('.form-error');
        
        if (errorElement) {
            errorElement.textContent = '';
        }
        
        formGroup.classList.remove('has-error');
    }
    
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}

/**
 * Initialize FAQ accordion functionality
 * Handles expand/collapse of FAQ items
 */
function initAboutFAQAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    if (faqItems.length === 0) return;
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', function() {
            const answer = item.querySelector('.faq-answer');
            
            // Toggle active class
            if (item.classList.contains('active')) {
                item.classList.remove('active');
                answer.style.maxHeight = '0';
            } else {
                // Close other open items
                faqItems.forEach(otherItem => {
                    if (otherItem !== item && otherItem.classList.contains('active')) {
                        otherItem.classList.remove('active');
                        otherItem.querySelector('.faq-answer').style.maxHeight = '0';
                    }
                });
                
                // Open this item
                item.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + 'px';
            }
        });
    });
}