/**
 * Wisdom Bites Dental Clinic
 * Animations JavaScript
 * Version: 3.0.0
 * 
 * This file contains JavaScript code for animations including:
 * - Scroll-triggered animations
 * - Intersection Observer animations
 * - Advanced animations for specific elements
 * - Animation utility functions
 */

"use strict";

// Animations module
const Animations = {
    // Configuration options
    config: {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px',
        disableAnimationsReducedMotion: true,
        defaultDelay: 0,
        defaultDuration: 800,
        scrollAnimationOffset: 150,
    },
    
    // DOM elements cache
    elements: {},
    
    // State variables
    state: {
        prefersReducedMotion: false,
        observerSupported: 'IntersectionObserver' in window,
        animationsInitialized: false,
    },
    
    /**
     * Initialize animations
     */
    init: function() {
        // Check for reduced motion preference
        this.checkReducedMotionPreference();
        
        // Cache DOM elements
        this.cacheElements();
        
        // Initialize different types of animations
        this.initScrollAnimations();
        this.initSpecialAnimations();
        this.initHoverAnimations();
        this.initCustomAnimations();
        
        // Set state
        this.state.animationsInitialized = true;
        
        // Bind events
        this.bindEvents();
        
        console.log('Animations initialized');
    },
    
    /**
     * Check if user prefers reduced motion
     */
    checkReducedMotionPreference: function() {
        // Check for prefers-reduced-motion media query
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        this.state.prefersReducedMotion = mediaQuery.matches;
        
        // Listen for changes to the media query
        mediaQuery.addEventListener('change', () => {
            this.state.prefersReducedMotion = mediaQuery.matches;
            // Refresh animations based on new preference
            this.refreshAnimations();
        });
    },
    
    /**
     * Cache DOM elements for better performance
     */
    cacheElements: function() {
        // Get all elements with data-animation attribute
        this.elements.animatedElements = document.querySelectorAll('[data-animation]');
        
        // Special animation elements
        this.elements.countingElements = document.querySelectorAll('[data-counting]');
        this.elements.typewriterElements = document.querySelectorAll('[data-typewriter]');
        this.elements.parallaxElements = document.querySelectorAll('[data-parallax]');
        this.elements.drawSvgElements = document.querySelectorAll('[data-draw-svg]');
        
        // Hover animation elements
        this.elements.hoverElements = document.querySelectorAll('[data-hover]');
    },
    
    /**
     * Bind events
     */
    bindEvents: function() {
        // Add scroll event handler for fallback animation
        if (!this.state.observerSupported) {
            window.addEventListener('scroll', this.handleScroll.bind(this));
        }
        
        // Add resize event handler
        window.addEventListener('resize', this.handleResize.bind(this));
        
        // Add scroll event for parallax elements
        if (this.elements.parallaxElements.length > 0) {
            window.addEventListener('scroll', this.updateParallaxElements.bind(this));
        }
    },
    
    /**
     * Handle scroll event for fallback animation
     */
    handleScroll: function() {
        // Skip if reduced motion is preferred and we should disable animations
        if (this.state.prefersReducedMotion && this.config.disableAnimationsReducedMotion) {
            return;
        }
        
        requestAnimationFrame(() => {
            const scrollPosition = window.scrollY + window.innerHeight;
            
            // Update animations for elements that enter the viewport
            if (this.elements.animatedElements) {
                this.elements.animatedElements.forEach(element => {
                    if (!element.classList.contains('animated')) {
                        const elementPosition = element.getBoundingClientRect().top + window.scrollY;
                        const offset = element.dataset.offset || this.config.scrollAnimationOffset;
                        
                        if (scrollPosition > elementPosition + parseInt(offset)) {
                            const delay = element.dataset.delay || this.config.defaultDelay;
                            
                            setTimeout(() => {
                                element.classList.add('animated');
                            }, delay * 1000);
                        }
                    }
                });
            }
            
            // Update counting elements if using fallback
            if (!this.state.observerSupported && this.elements.countingElements) {
                this.updateCountingElements();
            }
        });
    },
    
    /**
     * Handle resize event
     */
    handleResize: function() {
        // Update parallax positions
        if (this.elements.parallaxElements.length > 0) {
            this.updateParallaxElements();
        }
    },
    
    /**
     * Initialize scroll-triggered animations
     */
    initScrollAnimations: function() {
        // Skip if no elements to animate
        if (!this.elements.animatedElements.length) return;
        
        // Skip if reduced motion is preferred and we should disable animations
        if (this.state.prefersReducedMotion && this.config.disableAnimationsReducedMotion) {
            // Make all elements visible without animation
            this.elements.animatedElements.forEach(element => {
                element.classList.add('animated');
                element.style.opacity = '1';
                element.style.transform = 'none';
            });
            return;
        }
        
        // Use IntersectionObserver for scroll-triggered animations if supported
        if (this.state.observerSupported) {
            const animationObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const element = entry.target;
                        const delay = element.dataset.delay || this.config.defaultDelay;
                        
                        // Add animated class after specified delay
                        setTimeout(() => {
                            element.classList.add('animated');
                        }, delay * 1000);
                        
                        // Stop observing after animation is triggered
                        animationObserver.unobserve(element);
                    }
                });
            }, {
                threshold: this.config.threshold,
                rootMargin: this.config.rootMargin
            });
            
            // Observe all elements with animation data attribute
            this.elements.animatedElements.forEach(element => {
                animationObserver.observe(element);
            });
        } else {
            // Fallback for browsers that don't support IntersectionObserver
            // The animation will be handled by the scroll event
            // Initial check for elements already in view
            this.handleScroll();
        }
    },
    
    /**
     * Initialize special animations
     */
    initSpecialAnimations: function() {
        // Skip if reduced motion is preferred and we should disable animations
        if (this.state.prefersReducedMotion && this.config.disableAnimationsReducedMotion) {
            return;
        }
        
        // Initialize counting animations
        this.initCountingAnimations();
        
        // Initialize typewriter animations
        this.initTypewriterAnimations();
        
        // Initialize parallax effects
        this.initParallaxEffects();
        
        // Initialize SVG drawing animations
        this.initSvgDrawing();
    },
    
    /**
     * Initialize counting animations
     */
    initCountingAnimations: function() {
        if (!this.elements.countingElements.length) return;
        
        if (this.state.observerSupported) {
            const countingObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.startCounting(entry.target);
                        countingObserver.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.5
            });
            
            this.elements.countingElements.forEach(element => {
                countingObserver.observe(element);
            });
        } else {
            // Fallback handled by scroll event
        }
    },
    
    /**
     * Start counting animation for an element
     */
    startCounting: function(element) {
        const start = parseInt(element.dataset.start || 0);
        const end = parseInt(element.dataset.end || 100);
        const duration = parseInt(element.dataset.duration || 2000);
        const decimals = parseInt(element.dataset.decimals || 0);
        const prefix = element.dataset.prefix || '';
        const suffix = element.dataset.suffix || '';
        
        let startTimestamp = null;
        
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const currentValue = start + (progress * (end - start));
            
            element.textContent = `${prefix}${currentValue.toFixed(decimals)}${suffix}`;
            
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                // Ensure final value is exactly the end value
                element.textContent = `${prefix}${end.toFixed(decimals)}${suffix}`;
                element.classList.add('counting-complete');
            }
        };
        
        window.requestAnimationFrame(step);
    },
    
    /**
     * Update counting elements on scroll (fallback)
     */
    updateCountingElements: function() {
        this.elements.countingElements.forEach(element => {
            if (!element.classList.contains('counting-complete')) {
                const rect = element.getBoundingClientRect();
                const isVisible = (
                    rect.top <= window.innerHeight * 0.8 &&
                    rect.bottom >= 0
                );
                
                if (isVisible) {
                    this.startCounting(element);
                }
            }
        });
    },
    
    /**
     * Initialize typewriter animations
     */
    initTypewriterAnimations: function() {
        if (!this.elements.typewriterElements.length) return;
        
        if (this.state.observerSupported) {
            const typewriterObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.startTypewriter(entry.target);
                        typewriterObserver.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.5
            });
            
            this.elements.typewriterElements.forEach(element => {
                // Store original text in data attribute
                element.dataset.originalText = element.textContent;
                // Clear text content for initial state
                element.textContent = '';
                
                typewriterObserver.observe(element);
            });
        } else {
            // Fallback
            this.elements.typewriterElements.forEach(element => {
                element.dataset.originalText = element.textContent;
                element.textContent = '';
                
                const rect = element.getBoundingClientRect();
                const isVisible = (
                    rect.top <= window.innerHeight &&
                    rect.bottom >= 0
                );
                
                if (isVisible) {
                    this.startTypewriter(element);
                }
            });
        }
    },
    
    /**
     * Start typewriter animation for an element
     */
    startTypewriter: function(element) {
        const text = element.dataset.originalText;
        const speed = parseInt(element.dataset.speed || 50);
        let i = 0;
        
        function type() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            } else {
                element.classList.add('typing-complete');
            }
        }
        
        type();
    },
    
    /**
     * Initialize parallax effects
     */
    initParallaxEffects: function() {
        if (!this.elements.parallaxElements.length) return;
        
        // Initial update
        this.updateParallaxElements();
    },
    
    /**
     * Update parallax elements on scroll
     */
    updateParallaxElements: function() {
        this.elements.parallaxElements.forEach(element => {
            const scrollPosition = window.scrollY;
            const speed = parseFloat(element.dataset.parallax || 0.5);
            
            // Calculate the new background position
            const yPos = -(scrollPosition * speed);
            
            // Apply the transform
            element.style.transform = `translateY(${yPos}px)`;
        });
    },
    
    /**
     * Initialize SVG drawing animations
     */
    initSvgDrawing: function() {
        if (!this.elements.drawSvgElements.length) return;
        
        this.elements.drawSvgElements.forEach(element => {
            // Get all path elements within the SVG
            const paths = element.querySelectorAll('path, line, circle, rect, ellipse, polygon, polyline');
            
            // Set initial styles for all paths
            paths.forEach(path => {
                // Get the length of the path
                const length = path.getTotalLength ? path.getTotalLength() : 1000;
                
                // Set initial styles
                path.style.strokeDasharray = length;
                path.style.strokeDashoffset = length;
                path.style.transition = 'none';
                
                // Force a reflow
                path.getBoundingClientRect();
                
                // Set the transition
                path.style.transition = `stroke-dashoffset ${element.dataset.duration || '1.5s'} ${element.dataset.easing || 'ease-in-out'}`;
            });
            
            if (this.state.observerSupported) {
                const svgObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            this.animateSvgDrawing(entry.target);
                            svgObserver.unobserve(entry.target);
                        }
                    });
                }, {
                    threshold: 0.1
                });
                
                svgObserver.observe(element);
            } else {
                // Fallback
                const rect = element.getBoundingClientRect();
                const isVisible = (
                    rect.top <= window.innerHeight &&
                    rect.bottom >= 0
                );
                
                if (isVisible) {
                    this.animateSvgDrawing(element);
                }
            }
        });
    },
    
    /**
     * Animate SVG drawing
     */
    animateSvgDrawing: function(svgElement) {
        const paths = svgElement.querySelectorAll('path, line, circle, rect, ellipse, polygon, polyline');
        const delay = parseFloat(svgElement.dataset.delay || 0);
        
        // Animate each path with sequential delay if specified
        paths.forEach((path, index) => {
            const pathDelay = delay + (svgElement.dataset.sequential ? index * 0.1 : 0);
            
            setTimeout(() => {
                path.style.strokeDashoffset = 0;
            }, pathDelay * 1000);
        });
    },
    
    /**
     * Initialize hover animations
     */
    initHoverAnimations: function() {
        if (!this.elements.hoverElements.length) return;
        
        // Skip if reduced motion is preferred
        if (this.state.prefersReducedMotion && this.config.disableAnimationsReducedMotion) {
            return;
        }
        
        this.elements.hoverElements.forEach(element => {
            const hoverEffect = element.dataset.hover;
            
            // Add event listeners based on hover effect
            switch (hoverEffect) {
                case 'scale':
                    element.classList.add('hover-scale');
                    break;
                    
                case 'lift':
                    element.classList.add('hover-lift');
                    break;
                    
                case 'rotate':
                    element.classList.add('hover-rotate');
                    break;
                    
                case 'color-shift':
                    element.classList.add('hover-color-shift');
                    break;
                    
                case 'underline':
                    element.classList.add('hover-underline');
                    break;
                    
                case 'glow':
                    element.classList.add('hover-glow');
                    break;
                    
                case 'bounce':
                    element.addEventListener('mouseenter', () => {
                        element.classList.add('bounce');
                        element.addEventListener('animationend', function removeAnimation() {
                            element.classList.remove('bounce');
                            element.removeEventListener('animationend', removeAnimation);
                        });
                    });
                    break;
                    
                case 'pulse':
                    element.addEventListener('mouseenter', () => {
                        element.classList.add('pulse');
                        element.addEventListener('animationend', function removeAnimation() {
                            element.classList.remove('pulse');
                            element.removeEventListener('animationend', removeAnimation);
                        });
                    });
                    break;
                    
                case 'shake':
                    element.addEventListener('mouseenter', () => {
                        element.classList.add('shake');
                        element.addEventListener('animationend', function removeAnimation() {
                            element.classList.remove('shake');
                            element.removeEventListener('animationend', removeAnimation);
                        });
                    });
                    break;
                    
                case 'custom':
                    // Custom hover animations can be added here
                    break;
            }
        });
    },
    
    /**
     * Initialize custom animations specific to certain elements or pages
     */
    initCustomAnimations: function() {
        // Hero section parallax effect (if exists)
        const heroSection = document.querySelector('.hero');
        if (heroSection) {
            window.addEventListener('scroll', () => {
                const scrollPosition = window.scrollY;
                const heroBackground = heroSection.querySelector('.hero-background');
                const heroContent = heroSection.querySelector('.hero-content');
                
                if (heroBackground) {
                    heroBackground.style.transform = `translateY(${scrollPosition * 0.4}px)`;
                }
                
                if (heroContent) {
                    heroContent.style.transform = `translateY(${scrollPosition * 0.2}px)`;
                }
            });
        }
        
        // Service cards hover effect
        const serviceCards = document.querySelectorAll('.service-card');
        serviceCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.classList.add('hovered');
            });
            
            card.addEventListener('mouseleave', () => {
                card.classList.remove('hovered');
            });
        });
        
        // Team member cards hover effect
        const teamCards = document.querySelectorAll('.dentist-card');
        teamCards.forEach(card => {
            const image = card.querySelector('.dentist-image img');
            
            if (image) {
                card.addEventListener('mouseenter', () => {
                    image.style.transform = 'scale(1.05)';
                });
                
                card.addEventListener('mouseleave', () => {
                    image.style.transform = '';
                });
            }
        });
        
        // Floating elements animation
        const floatingElements = document.querySelectorAll('.floating-element');
        floatingElements.forEach(element => {
            element.classList.add('float');
        });
        
        // Wave animation on hero section
        const heroWaves = document.querySelector('.hero-waves svg path');
        if (heroWaves) {
            heroWaves.classList.add('wave-animation');
        }
    },
    
    /**
     * Refresh animations (e.g., after DOM changes or media query changes)
     */
    refreshAnimations: function() {
        // Clear existing animations
        this.elements.animatedElements.forEach(element => {
            element.classList.remove('animated');
        });
        
        // Re-initialize animations
        this.initScrollAnimations();
        this.initSpecialAnimations();
    }
};

// Initialize animations when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    Animations.init();
});

// Initialize animations when page is fully loaded (for images and other assets)
window.addEventListener('load', function() {
    // Add a slight delay to ensure all elements are properly rendered
    setTimeout(() => {
        // Force a refresh of animations
        Animations.refreshAnimations();
    }, 100);
});