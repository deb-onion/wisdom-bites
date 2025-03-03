/**
 * Wisdom Bites Dental Clinic
 * Animations JavaScript
 * Version: 1.0
 */

document.addEventListener('DOMContentLoaded', function() {
    'use strict';
    
    // Initialize all animations
    initPageTransitions();
    initHomeAnimations();
    initScrollAnimations();
    initHoverAnimations();
    initLoadingAnimations();
});

/**
 * Page transition animations
 */
function initPageTransitions() {
    // Page load animation
    const pageContent = document.querySelector('.page-content');
    if (pageContent) {
        pageContent.style.opacity = '0';
        pageContent.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            pageContent.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            pageContent.style.opacity = '1';
            pageContent.style.transform = 'translateY(0)';
        }, 100);
    }
    
    // Page exit animation for internal links
    const internalLinks = document.querySelectorAll('a:not([target="_blank"]):not([href^="#"]):not([href^="mailto:"]):not([href^="tel:"])');
    
    internalLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Only for internal links to the same domain
            if (href && href.indexOf('http') !== 0) {
                e.preventDefault();
                
                // Exit animation
                pageContent.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                pageContent.style.opacity = '0';
                pageContent.style.transform = 'translateY(-20px)';
                
                // Navigate after animation completes
                setTimeout(() => {
                    window.location.href = href;
                }, 400);
            }
        });
    });
}

/**
 * Home page specific animations
 */
function initHomeAnimations() {
    const hero = document.querySelector('.hero');
    
    if (hero) {
        // Hero section elements
        const heroContent = hero.querySelector('.hero-content');
        const heroTitle = hero.querySelector('.hero-title');
        const heroSubtitle = hero.querySelector('.hero-subtitle');
        const heroButtons = hero.querySelector('.hero-buttons');
        const heroImage = hero.querySelector('.hero-image');
        
        if (heroContent) {
            // Stagger animation for hero content
            animateElement(heroTitle, 'fadeInUp', 0);
            animateElement(heroSubtitle, 'fadeInUp', 0.2);
            animateElement(heroButtons, 'fadeInUp', 0.4);
        }
        
        if (heroImage) {
            // Hero image animation
            animateElement(heroImage, 'fadeIn', 0.3);
        }
        
        // Features section stagger animation
        const features = document.querySelectorAll('.feature');
        features.forEach((feature, index) => {
            animateElement(feature, 'fadeInUp', 0.1 * index);
        });
    }
}

/**
 * Scroll-triggered animations
 */
function initScrollAnimations() {
    // Elements to animate on scroll
    const animateElements = document.querySelectorAll('.animate-on-scroll');
    
    // Function to check if element is in viewport
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.8 &&
            rect.bottom >= 0
        );
    }
    
    // Set initial state for all animatable elements
    animateElements.forEach(element => {
        const animation = element.dataset.animation || 'fadeIn';
        
        // Set initial styles
        element.style.opacity = '0';
        
        if (animation.includes('fadeInUp')) {
            element.style.transform = 'translateY(30px)';
        } else if (animation.includes('fadeInDown')) {
            element.style.transform = 'translateY(-30px)';
        } else if (animation.includes('fadeInLeft')) {
            element.style.transform = 'translateX(-30px)';
        } else if (animation.includes('fadeInRight')) {
            element.style.transform = 'translateX(30px)';
        } else if (animation.includes('zoomIn')) {
            element.style.transform = 'scale(0.9)';
        }
        
        // Trigger animation if already in viewport
        if (isInViewport(element)) {
            executeAnimation(element);
        }
    });
    
    // Check on scroll
    window.addEventListener('scroll', function() {
        animateElements.forEach(element => {
            if (!element.classList.contains('animated') && isInViewport(element)) {
                executeAnimation(element);
            }
        });
    });
    
    function executeAnimation(element) {
        const animation = element.dataset.animation || 'fadeIn';
        const duration = element.dataset.duration || '0.8s';
        const delay = element.dataset.delay || '0s';
        const timing = element.dataset.timing || 'ease';
        
        element.style.transition = `opacity ${duration} ${timing} ${delay}, transform ${duration} ${timing} ${delay}`;
        element.style.opacity = '1';
        element.style.transform = 'translate(0) scale(1)';
        element.classList.add('animated');
    }
}

/**
 * Hover animations for interactive elements
 */
function initHoverAnimations() {
    // Service cards hover animation
    const serviceCards = document.querySelectorAll('.service-card');
    
    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            const icon = this.querySelector('.service-icon');
            
            if (icon) {
                // Bounce effect on icon
                icon.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                icon.style.transform = 'translateY(-5px) scale(1.05)';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            const icon = this.querySelector('.service-icon');
            
            if (icon) {
                icon.style.transition = 'transform 0.3s ease';
                icon.style.transform = 'translateY(0) scale(1)';
            }
        });
    });
    
    // Button hover animations
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease';
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
        });
    });
}

/**
 * Loading animations for dynamic content
 */
function initLoadingAnimations() {
    // Loading spinner for AJAX requests
    const loadingSpinner = document.createElement('div');
    loadingSpinner.className = 'loading-spinner';
    loadingSpinner.innerHTML = `
        <div class="spinner-container">
            <div class="spinner"></div>
        </div>
    `;
    
    // Listen for AJAX requests if using fetch or XMLHttpRequest
    const originalFetch = window.fetch;
    window.fetch = function() {
        document.body.appendChild(loadingSpinner);
        
        return originalFetch.apply(this, arguments)
            .then(response => {
                if (loadingSpinner.parentNode) {
                    loadingSpinner.parentNode.removeChild(loadingSpinner);
                }
                return response;
            })
            .catch(error => {
                if (loadingSpinner.parentNode) {
                    loadingSpinner.parentNode.removeChild(loadingSpinner);
                }
                throw error;
            });
    };
    
    // Image loading animations
    const images = document.querySelectorAll('img:not(.lazy-load)');
    
    images.forEach(image => {
        if (!image.complete) {
            image.style.opacity = '0';
            image.style.transition = 'opacity 0.5s ease';
            
            image.addEventListener('load', function() {
                this.style.opacity = '1';
            });
        }
    });
}

/**
 * Helper function to animate an element with a specific animation
 */
function animateElement(element, animation, delay = 0) {
    if (!element) return;
    
    // Initial state
    element.style.opacity = '0';
    
    switch (animation) {
        case 'fadeIn':
            // Just fade in, no transform
            break;
        case 'fadeInUp':
            element.style.transform = 'translateY(30px)';
            break;
        case 'fadeInDown':
            element.style.transform = 'translateY(-30px)';
            break;
        case 'fadeInLeft':
            element.style.transform = 'translateX(-30px)';
            break;
        case 'fadeInRight':
            element.style.transform = 'translateX(30px)';
            break;
        case 'zoomIn':
            element.style.transform = 'scale(0.9)';
            break;
    }
    
    // Set delay and animate
    setTimeout(() => {
        element.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        element.style.opacity = '1';
        element.style.transform = 'translate(0) scale(1)';
    }, delay * 1000);
}

/**
 * Text splitting animation for headlines
 */
function initTextSplitting() {
    const headings = document.querySelectorAll('.split-text');
    
    headings.forEach(heading => {
        const text = heading.textContent;
        const words = text.split(' ');
        
        // Clear the heading
        heading.textContent = '';
        
        // Create spans for each word
        words.forEach((word, index) => {
            const wordSpan = document.createElement('span');
            wordSpan.className = 'word';
            wordSpan.style.display = 'inline-block';
            wordSpan.style.opacity = '0';
            wordSpan.style.transform = 'translateY(20px)';
            wordSpan.style.transition = `opacity 0.5s ease ${0.05 * index}s, transform 0.5s ease ${0.05 * index}s`;
            
            if (index < words.length - 1) {
                wordSpan.textContent = word + ' ';
            } else {
                wordSpan.textContent = word;
            }
            
            heading.appendChild(wordSpan);
        });
        
        // Trigger animation after a short delay
        setTimeout(() => {
            const wordSpans = heading.querySelectorAll('.word');
            wordSpans.forEach(span => {
                span.style.opacity = '1';
                span.style.transform = 'translateY(0)';
            });
        }, 300);
    });
} 