/**
 * Wisdom Bites Dental Clinic
 * Main JavaScript File
 * Version: 3.0.0
 * 
 * This file contains core functionality for the website including:
 * - Navigation handling
 * - Scroll effects
 * - Animation triggers
 * - Interactive components
 * - Form validation
 */

"use strict";

// Main application object
const WisdomBites = {
    // Configuration options
    config: {
        scrollOffset: 100, // Pixel offset when header changes style
        scrollAnimationOffset: 150, // Offset for scroll animations
        mobileBreakpoint: 991, // Mobile menu breakpoint
        scrollDuration: 800, // Duration of smooth scrolling
        swiperAutoplayDelay: 5000, // Delay between slides in milliseconds
    },
    
    // DOM elements cache
    elements: {},
    
    // State variables
    state: {
        isMenuOpen: false,
        isPageLoaded: false,
        lastScrollPosition: 0,
        isScrollingDown: false,
        clinicData: null // Store clinic data here
    },
    
    /**
     * Initialize the application
     */
    init: function() {
        // Cache DOM elements
        this.cacheElements();
        
        // Load clinic data
        this.loadClinicData();
        
        // Initialize components
        this.initNavigation();
        this.initScrollEffects();
        this.initAnimations();
        this.initStickyElements();
        this.initSmoothScroll();
        
        // Initialize page-specific components
        this.initSliders();
        this.initAccordions();
        this.initTabs();
        this.initCounters();
        this.initLightbox();
        this.initForms();
        
        // Set initial states
        this.setInitialStates();
        
        // Bind events
        this.bindEvents();
        
        // Apply clinic data to the page
        this.applyClinicDataToPage();
        
        // Mark initialization as complete
        this.state.isPageLoaded = true;
        console.log('Wisdom Bites website initialized');
    },
    
    /**
     * Cache DOM elements for better performance
     */
    cacheElements: function() {
        // Header elements
        this.elements.header = document.querySelector('.site-header');
        this.elements.menuToggle = document.querySelector('.menu-toggle');
        this.elements.navContainer = document.querySelector('.nav-container');
        this.elements.navList = document.querySelector('.nav-list');
        this.elements.dropdownToggles = document.querySelectorAll('.dropdown-toggle');
        
        // Scroll elements
        this.elements.backToTop = document.querySelector('.back-to-top');
        this.elements.bookingSticky = document.querySelector('.booking-sticky');
        
        // Animation elements
        this.elements.animatedElements = document.querySelectorAll('[data-animation]');
        
        // Interactive components
        this.elements.accordionItems = document.querySelectorAll('.accordion-item');
        this.elements.tabButtons = document.querySelectorAll('.tab-button');
        this.elements.counterElements = document.querySelectorAll('.counter');
        
        // Forms
        this.elements.forms = document.querySelectorAll('form');
        this.elements.bookingForm = document.querySelector('#booking-form');
        this.elements.contactForm = document.querySelector('#contact-form');
    },
    
    /**
     * Set initial states
     */
    setInitialStates: function() {
        // Check initial scroll position
        this.handleScroll();
        
        // Set year in copyright notice
        const yearElement = document.getElementById('current-year');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    },
    
    /**
     * Bind global events
     */
    bindEvents: function() {
        // Window events
        window.addEventListener('scroll', this.handleScroll.bind(this));
        window.addEventListener('resize', this.handleResize.bind(this));
        window.addEventListener('load', this.handlePageLoad.bind(this));
        
        // Document events
        document.addEventListener('click', this.handleDocumentClick.bind(this));
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
    },
    
    /**
     * Handle window scroll event
     */
    handleScroll: function() {
        const scrollPosition = window.scrollY;
        
        // Update scroll direction state
        this.state.isScrollingDown = scrollPosition > this.state.lastScrollPosition;
        this.state.lastScrollPosition = scrollPosition;
        
        // Handle header state
        this.updateHeaderOnScroll(scrollPosition);
        
        // Handle back to top button visibility
        this.updateBackToTopButton(scrollPosition);
        
        // Handle booking sticky visibility
        this.updateBookingSticky(scrollPosition);
        
        // Handle scroll animations
        this.updateScrollAnimations(scrollPosition);
    },
    
    /**
     * Handle window resize event
     */
    handleResize: function() {
        // Reset mobile menu on larger screens
        if (window.innerWidth > this.config.mobileBreakpoint && this.state.isMenuOpen) {
            this.closeMenu();
        }
        
        // Recalculate slider dimensions if needed
        if (window.Swiper && this.swipers) {
            Object.values(this.swipers).forEach(swiper => {
                swiper.update();
            });
        }
    },
    
    /**
     * Handle page load event
     */
    handlePageLoad: function() {
        // Hide loading screen
        const loadingScreen = document.querySelector('.loading-screen');
        if (loadingScreen) {
            setTimeout(() => {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 500);
            }, 500);
        }
        
        // Add loaded class to body
        document.body.classList.add('loaded');
        
        // Initialize any components that need the page to be fully loaded
        this.initLazyLoading();
    },
    
    /**
     * Handle document click event
     */
    handleDocumentClick: function(event) {
        // Close mobile menu when clicking outside
        if (this.state.isMenuOpen && !event.target.closest('.nav-container') && !event.target.closest('.menu-toggle')) {
            this.closeMenu();
        }
    },
    
    /**
     * Handle document keydown event
     */
    handleKeyDown: function(event) {
        // Close mobile menu on Escape key
        if (event.key === 'Escape' && this.state.isMenuOpen) {
            this.closeMenu();
        }
    },
    
    /**
     * Initialize navigation functionality
     */
    initNavigation: function() {
        // Toggle mobile menu
        if (this.elements.menuToggle) {
            this.elements.menuToggle.addEventListener('click', () => {
                if (this.state.isMenuOpen) {
                    this.closeMenu();
                } else {
                    this.openMenu();
                }
            });
        }
        
        // Dropdown menus for mobile view
        if (this.elements.dropdownToggles) {
            this.elements.dropdownToggles.forEach(toggle => {
                toggle.addEventListener('click', (e) => {
                    // Prevent default only in mobile view
                    if (window.innerWidth <= this.config.mobileBreakpoint) {
                        e.preventDefault();
                        const parent = toggle.parentElement;
                        
                        // Toggle active class
                        if (parent.classList.contains('active')) {
                            parent.classList.remove('active');
                        } else {
                            // Close other dropdowns
                            document.querySelectorAll('.has-dropdown.active').forEach(item => {
                                if (item !== parent) {
                                    item.classList.remove('active');
                                }
                            });
                            
                            parent.classList.add('active');
                        }
                    }
                });
            });
        }
    },
    
    /**
     * Open mobile menu
     */
    openMenu: function() {
        // Set aria attributes
        this.elements.menuToggle.setAttribute('aria-expanded', 'true');
        
        // Add active classes
        this.elements.menuToggle.classList.add('active');
        this.elements.navContainer.classList.add('active');
        
        // Prevent body scrolling
        document.body.classList.add('menu-open');
        
        // Update state
        this.state.isMenuOpen = true;
    },
    
    /**
     * Close mobile menu
     */
    closeMenu: function() {
        // Set aria attributes
        this.elements.menuToggle.setAttribute('aria-expanded', 'false');
        
        // Remove active classes
        this.elements.menuToggle.classList.remove('active');
        this.elements.navContainer.classList.remove('active');
        
        // Allow body scrolling
        document.body.classList.remove('menu-open');
        
        // Close any open dropdowns
        document.querySelectorAll('.has-dropdown.active').forEach(item => {
            item.classList.remove('active');
        });
        
        // Update state
        this.state.isMenuOpen = false;
    },
    
    /**
     * Initialize scroll effects
     */
    initScrollEffects: function() {
        // Initial call to set correct state
        this.handleScroll();
    },
    
    /**
     * Update header state on scroll
     */
    updateHeaderOnScroll: function(scrollPosition) {
        if (this.elements.header) {
            if (scrollPosition > this.config.scrollOffset) {
                this.elements.header.classList.add('scrolled');
            } else {
                this.elements.header.classList.remove('scrolled');
            }
        }
    },
    
    /**
     * Update back to top button visibility
     */
    updateBackToTopButton: function(scrollPosition) {
        if (this.elements.backToTop) {
            if (scrollPosition > window.innerHeight / 2) {
                this.elements.backToTop.classList.add('visible');
            } else {
                this.elements.backToTop.classList.remove('visible');
            }
        }
    },
    
    /**
     * Update booking sticky visibility
     */
    updateBookingSticky: function(scrollPosition) {
        if (this.elements.bookingSticky) {
            // Show sticky booking bar when scrolling past hero section and on specific pages
            const shouldShow = scrollPosition > window.innerHeight && 
                             !document.body.classList.contains('booking-page');
            
            if (shouldShow) {
                this.elements.bookingSticky.classList.add('visible');
            } else {
                this.elements.bookingSticky.classList.remove('visible');
            }
        }
    },
    
    /**
     * Initialize animations
     */
    initAnimations: function() {
        // Use IntersectionObserver for scroll-triggered animations
        if ('IntersectionObserver' in window) {
            const animationObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const element = entry.target;
                        const delay = element.dataset.delay || 0;
                        
                        // Add animated class after specified delay
                        setTimeout(() => {
                            element.classList.add('animated');
                        }, delay * 1000);
                        
                        // Stop observing after animation is triggered
                        animationObserver.unobserve(element);
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -100px 0px'
            });
            
            // Observe all elements with animation data attribute
            if (this.elements.animatedElements) {
                this.elements.animatedElements.forEach(element => {
                    animationObserver.observe(element);
                });
            }
        } else {
            // Fallback for browsers that don't support IntersectionObserver
            this.elements.animatedElements.forEach(element => {
                element.classList.add('animated');
            });
        }
    },
    
    /**
     * Update scroll animations
     */
    updateScrollAnimations: function(scrollPosition) {
        // This is a fallback for browsers without IntersectionObserver
        if (!('IntersectionObserver' in window) && this.elements.animatedElements) {
            this.elements.animatedElements.forEach(element => {
                const elementPosition = element.getBoundingClientRect().top + window.scrollY;
                const windowHeight = window.innerHeight;
                
                if (scrollPosition + windowHeight - this.config.scrollAnimationOffset > elementPosition) {
                    const delay = element.dataset.delay || 0;
                    
                    setTimeout(() => {
                        element.classList.add('animated');
                    }, delay * 1000);
                }
            });
        }
    },
    
    /**
     * Initialize sticky elements
     */
    initStickyElements: function() {
        // Implementation depends on specific layout requirements
        // Currently using CSS position: sticky for elements like the header
    },
    
    /**
     * Initialize smooth scrolling for anchor links
     */
    initSmoothScroll: function() {
        const anchorLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');
        
        anchorLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                const targetId = link.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    // Close mobile menu if open
                    if (this.state.isMenuOpen) {
                        this.closeMenu();
                    }
                    
                    // Calculate scroll position
                    const headerHeight = this.elements.header ? this.elements.header.offsetHeight : 0;
                    const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - headerHeight;
                    
                    // Smooth scroll to target
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Update URL hash without scrolling
                    history.pushState(null, null, targetId);
                }
            });
        });
        
        // Also bind event to back-to-top button
        if (this.elements.backToTop) {
            this.elements.backToTop.addEventListener('click', (e) => {
                e.preventDefault();
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }
    },
    
    /**
     * Initialize sliders
     */
    initSliders: function() {
        // Initialize if Swiper is available and sliders exist
        if (window.Swiper) {
            // Store swiper instances
            this.swipers = {};
            
            // Testimonials slider
            const testimonialsSlider = document.querySelector('.testimonials-slider .swiper-container');
            if (testimonialsSlider) {
                this.swipers.testimonials = new Swiper(testimonialsSlider, {
                    slidesPerView: 1,
                    spaceBetween: 30,
                    loop: true,
                    autoplay: {
                        delay: this.config.swiperAutoplayDelay,
                        disableOnInteraction: false
                    },
                    pagination: {
                        el: '.testimonials-slider .swiper-pagination',
                        clickable: true
                    },
                    navigation: {
                        nextEl: '.testimonials-slider .slider-button.next',
                        prevEl: '.testimonials-slider .slider-button.prev'
                    },
                    breakpoints: {
                        768: {
                            slidesPerView: 2,
                            spaceBetween: 30
                        },
                        1200: {
                            slidesPerView: 3,
                            spaceBetween: 30
                        }
                    }
                });
            }
            
            // Before & After slider
            const beforeAfterSlider = document.querySelector('.before-after-slider .swiper-container');
            if (beforeAfterSlider) {
                this.swipers.beforeAfter = new Swiper(beforeAfterSlider, {
                    slidesPerView: 1,
                    spaceBetween: 0,
                    loop: true,
                    navigation: {
                        nextEl: '.before-after-slider .slider-button.next',
                        prevEl: '.before-after-slider .slider-button.prev'
                    },
                    pagination: {
                        el: '.before-after-slider .swiper-pagination',
                        clickable: true
                    }
                });
            }
            
            // Gallery slider
            const gallerySlider = document.querySelector('.gallery-slider .swiper-container');
            if (gallerySlider) {
                this.swipers.gallery = new Swiper(gallerySlider, {
                    slidesPerView: 1,
                    spaceBetween: 10,
                    loop: true,
                    navigation: {
                        nextEl: '.gallery-slider .slider-button.next',
                        prevEl: '.gallery-slider .slider-button.prev'
                    },
                    pagination: {
                        el: '.gallery-slider .swiper-pagination',
                        clickable: true
                    },
                    breakpoints: {
                        576: {
                            slidesPerView: 2,
                            spaceBetween: 20
                        },
                        992: {
                            slidesPerView: 3,
                            spaceBetween: 30
                        }
                    }
                });
            }
        } else {
            console.warn('Swiper is not available. Sliders will not be initialized.');
        }
        
        // Initialize image comparison sliders
        this.initImageComparison();
    },
    
    /**
     * Initialize before/after image comparison sliders
     */
    initImageComparison: function() {
        const comparisons = document.querySelectorAll('.image-comparison');
        
        comparisons.forEach(comparison => {
            const slider = comparison.querySelector('.comparison-slider');
            const before = comparison.querySelector('.before');
            const after = comparison.querySelector('.after');
            
            if (!slider || !before || !after) return;
            
            let isActive = false;
            
            // Set initial position
            const setInitialPosition = () => {
                const initialPosition = 50; // 50%
                before.style.width = `${initialPosition}%`;
                slider.style.left = `${initialPosition}%`;
            };
            
            setInitialPosition();
            
            // Handle slider movement
            const moveSlider = (x) => {
                const rect = comparison.getBoundingClientRect();
                let position = ((x - rect.left) / rect.width) * 100;
                
                // Constrain position within bounds
                position = Math.max(0, Math.min(100, position));
                
                before.style.width = `${position}%`;
                slider.style.left = `${position}%`;
            };
            
            // Mouse events
            slider.addEventListener('mousedown', () => {
                isActive = true;
                slider.classList.add('active');
            });
            
            window.addEventListener('mouseup', () => {
                isActive = false;
                slider.classList.remove('active');
            });
            
            window.addEventListener('mousemove', (e) => {
                if (isActive) {
                    moveSlider(e.clientX);
                }
            });
            
            // Touch events
            slider.addEventListener('touchstart', () => {
                isActive = true;
                slider.classList.add('active');
            });
            
            window.addEventListener('touchend', () => {
                isActive = false;
                slider.classList.remove('active');
            });
            
            window.addEventListener('touchcancel', () => {
                isActive = false;
                slider.classList.remove('active');
            });
            
            window.addEventListener('touchmove', (e) => {
                if (isActive && e.touches[0]) {
                    moveSlider(e.touches[0].clientX);
                    // Prevent scrolling while dragging
                    e.preventDefault();
                }
            });
            
            // Reset on window resize
            window.addEventListener('resize', setInitialPosition);
        });
    },
    
    /**
     * Initialize accordions
     */
    initAccordions: function() {
        // FAQ accordions
        const faqItems = document.querySelectorAll('.faq-item');
        
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            
            if (question) {
                question.addEventListener('click', () => {
                    // Toggle current item
                    const isActive = item.classList.contains('active');
                    
                    // Optional: Close other items (comment out for multiple open items)
                    // faqItems.forEach(otherItem => {
                    //     if (otherItem !== item) {
                    //         otherItem.classList.remove('active');
                    //     }
                    // });
                    
                    // Toggle current item
                    if (isActive) {
                        item.classList.remove('active');
                    } else {
                        item.classList.add('active');
                    }
                });
            }
        });
        
        // General accordions
        if (this.elements.accordionItems) {
            this.elements.accordionItems.forEach(item => {
                const header = item.querySelector('.accordion-header');
                
                if (header) {
                    header.addEventListener('click', () => {
                        item.classList.toggle('active');
                    });
                }
            });
        }
    },
    
    /**
     * Initialize tabs
     */
    initTabs: function() {
        if (this.elements.tabButtons) {
            this.elements.tabButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const tabId = button.getAttribute('data-tab');
                    const tabContainer = button.closest('.tabs-container');
                    
                    if (tabContainer) {
                        // Deactivate all tabs and contents
                        tabContainer.querySelectorAll('.tab-button').forEach(btn => {
                            btn.classList.remove('active');
                        });
                        
                        tabContainer.querySelectorAll('.tab-content').forEach(content => {
                            content.classList.remove('active');
                        });
                        
                        // Activate selected tab and content
                        button.classList.add('active');
                        
                        const activeContent = tabContainer.querySelector(`.tab-content[data-tab="${tabId}"]`);
                        if (activeContent) {
                            activeContent.classList.add('active');
                        }
                    }
                });
            });
        }
    },
    
    /**
     * Initialize counters
     */
    initCounters: function() {
        if (!this.elements.counterElements.length) return;
        
        // Use IntersectionObserver to trigger counters when visible
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counter = entry.target;
                    const target = parseInt(counter.getAttribute('data-target'), 10);
                    const duration = parseInt(counter.getAttribute('data-duration') || 2000, 10);
                    const decimalPlaces = parseInt(counter.getAttribute('data-decimals') || 0, 10);
                    
                    let startTimestamp = null;
                    const step = (timestamp) => {
                        if (!startTimestamp) startTimestamp = timestamp;
                        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
                        const currentValue = progress * target;
                        
                        counter.textContent = currentValue.toFixed(decimalPlaces);
                        
                        if (progress < 1) {
                            window.requestAnimationFrame(step);
                        } else {
                            // Ensure final value is exactly the target
                            counter.textContent = target.toFixed(decimalPlaces);
                        }
                    };
                    
                    window.requestAnimationFrame(step);
                    
                    // Stop observing after animation is triggered
                    counterObserver.unobserve(counter);
                }
            });
        }, {
            threshold: 0.5
        });
        
        // Observe all counter elements
        this.elements.counterElements.forEach(counter => {
            counterObserver.observe(counter);
        });
    },
    
    /**
     * Initialize lightbox functionality
     */
    initLightbox: function() {
        const lightboxTriggers = document.querySelectorAll('[data-lightbox]');
        
        if (!lightboxTriggers.length) return;
        
        // Create lightbox container if it doesn't exist
        let lightbox = document.querySelector('.lightbox');
        
        if (!lightbox) {
            lightbox = document.createElement('div');
            lightbox.className = 'lightbox';
            lightbox.innerHTML = `
                <div class="lightbox-overlay"></div>
                <div class="lightbox-container">
                    <div class="lightbox-content"></div>
                    <button class="lightbox-close" aria-label="Close lightbox">&times;</button>
                    <button class="lightbox-prev" aria-label="Previous image">&lsaquo;</button>
                    <button class="lightbox-next" aria-label="Next image">&rsaquo;</button>
                </div>
            `;
            document.body.appendChild(lightbox);
        }
        
        // Cache lightbox elements
        const lightboxOverlay = lightbox.querySelector('.lightbox-overlay');
        const lightboxContent = lightbox.querySelector('.lightbox-content');
        const lightboxClose = lightbox.querySelector('.lightbox-close');
        const lightboxPrev = lightbox.querySelector('.lightbox-prev');
        const lightboxNext = lightbox.querySelector('.lightbox-next');
        
        // Group lightbox items
        const lightboxGroups = {};
        
        lightboxTriggers.forEach(trigger => {
            const group = trigger.getAttribute('data-lightbox') || 'default';
            
            if (!lightboxGroups[group]) {
                lightboxGroups[group] = [];
            }
            
            lightboxGroups[group].push(trigger);
        });
        
        // Track current lightbox state
        let currentGroup = null;
        let currentIndex = 0;
        
        // Open lightbox
        const openLightbox = (group, index) => {
            currentGroup = group;
            currentIndex = index;
            updateLightboxContent();
            lightbox.classList.add('active');
            document.body.classList.add('lightbox-open');
        };
        
        // Close lightbox
        const closeLightbox = () => {
            lightbox.classList.remove('active');
            document.body.classList.remove('lightbox-open');
            setTimeout(() => {
                lightboxContent.innerHTML = '';
            }, 300);
        };
        
        // Navigate to previous item
        const prevItem = () => {
            if (!currentGroup) return;
            currentIndex = (currentIndex - 1 + lightboxGroups[currentGroup].length) % lightboxGroups[currentGroup].length;
            updateLightboxContent();
        };
        
        // Navigate to next item
        const nextItem = () => {
            if (!currentGroup) return;
            currentIndex = (currentIndex + 1) % lightboxGroups[currentGroup].length;
            updateLightboxContent();
        };
        
        // Update lightbox content
        const updateLightboxContent = () => {
            if (!currentGroup || !lightboxGroups[currentGroup]) return;
            
            const triggers = lightboxGroups[currentGroup];
            const currentTrigger = triggers[currentIndex];
            
            // Show/hide navigation buttons
            if (triggers.length <= 1) {
                lightboxPrev.style.display = 'none';
                lightboxNext.style.display = 'none';
            } else {
                lightboxPrev.style.display = '';
                lightboxNext.style.display = '';
            }
            
            // Clear content
            lightboxContent.innerHTML = '';
            
            // Get content based on type
            const type = currentTrigger.getAttribute('data-type') || 'image';
            
            if (type === 'image') {
                const imgSrc = currentTrigger.getAttribute('href') || currentTrigger.getAttribute('data-src');
                const img = document.createElement('img');
                img.src = imgSrc;
                img.alt = currentTrigger.getAttribute('data-caption') || '';
                
                // Add loading state
                lightboxContent.classList.add('loading');
                
                // Remove loading state when image is loaded
                img.onload = () => {
                    lightboxContent.classList.remove('loading');
                };
                
                lightboxContent.appendChild(img);
                
                // Add caption if exists
                const caption = currentTrigger.getAttribute('data-caption');
                if (caption) {
                    const captionElement = document.createElement('div');
                    captionElement.className = 'lightbox-caption';
                    captionElement.textContent = caption;
                    lightboxContent.appendChild(captionElement);
                }
            } else if (type === 'video') {
                const videoSrc = currentTrigger.getAttribute('href') || currentTrigger.getAttribute('data-src');
                const video = document.createElement('video');
                video.src = videoSrc;
                video.controls = true;
                video.autoplay = true;
                lightboxContent.appendChild(video);
            } else if (type === 'iframe') {
                const iframeSrc = currentTrigger.getAttribute('href') || currentTrigger.getAttribute('data-src');
                const iframe = document.createElement('iframe');
                iframe.src = iframeSrc;
                iframe.allowFullscreen = true;
                lightboxContent.appendChild(iframe);
            }
        };
        
        // Bind lightbox events
        lightboxClose.addEventListener('click', closeLightbox);
        lightboxOverlay.addEventListener('click', closeLightbox);
        lightboxPrev.addEventListener('click', prevItem);
        lightboxNext.addEventListener('click', nextItem);
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('active')) return;
            
            if (e.key === 'Escape') {
                closeLightbox();
            } else if (e.key === 'ArrowLeft') {
                prevItem();
            } else if (e.key === 'ArrowRight') {
                nextItem();
            }
        });
        
        // Attach click event to triggers
        lightboxTriggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                
                const group = trigger.getAttribute('data-lightbox') || 'default';
                const index = lightboxGroups[group].indexOf(trigger);
                
                openLightbox(group, index);
            });
        });
    },
    
    /**
     * Initialize forms
     */
    initForms: function() {
        // Initialize all forms with validation
        if (this.elements.forms) {
            this.elements.forms.forEach(form => {
                this.initFormValidation(form);
            });
        }
        
        // Special handling for booking form
        if (this.elements.bookingForm) {
            this.initBookingForm(this.elements.bookingForm);
        }
        
        // Special handling for contact form
        if (this.elements.contactForm) {
            this.initContactForm(this.elements.contactForm);
        }
    },
    
    /**
     * Initialize form validation
     */
    initFormValidation: function(form) {
        const inputs = form.querySelectorAll('input, select, textarea');
        
        // Add validation to each input
        inputs.forEach(input => {
            // Validate on blur
            input.addEventListener('blur', () => {
                this.validateInput(input);
            });
            
            // Validate on input, but only if previously blurred or submitted
            input.addEventListener('input', () => {
                if (input.dataset.blurred || form.dataset.submitted) {
                    this.validateInput(input);
                }
            });
            
            // Mark as blurred after first blur
            input.addEventListener('blur', () => {
                input.dataset.blurred = 'true';
            });
        });
        
        // Validate form on submit
        form.addEventListener('submit', (e) => {
            let isValid = true;
            
            // Mark form as submitted
            form.dataset.submitted = 'true';
            
            // Validate all inputs
            inputs.forEach(input => {
                if (!this.validateInput(input)) {
                    isValid = false;
                }
            });
            
            // Prevent form submission if invalid
            if (!isValid) {
                e.preventDefault();
                
                // Scroll to first invalid input
                const firstInvalid = form.querySelector('.is-invalid');
                if (firstInvalid) {
                    firstInvalid.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                    firstInvalid.focus();
                }
            }
        });
    },
    
    /**
     * Validate a single input
     */
    validateInput: function(input) {
        // Debug the input being validated
        console.log('Validating input:', input.id, {
            maxlength: input.getAttribute('maxlength'),
            value: input.value,
            validity: input.validity
        });
        
        // Skip disabled or hidden inputs
        if (input.disabled || input.type === 'hidden') {
            return true;
        }
        
        let isValid = true;
        let errorMessage = '';
        
        // Get validation container
        const formGroup = input.closest('.form-group');
        if (!formGroup) return true;
        
        // Clear previous validation
        formGroup.classList.remove('is-invalid', 'is-valid');
        
        // Get existing or create new feedback element
        let feedback = formGroup.querySelector('.invalid-feedback');
        if (!feedback) {
            feedback = document.createElement('div');
            feedback.className = 'invalid-feedback';
            formGroup.appendChild(feedback);
        }
        
        // Required validation
        if (input.required && !input.value.trim()) {
            isValid = false;
            errorMessage = 'This field is required';
        }
        // Email validation
        else if (input.type === 'email' && input.value.trim()) {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(input.value.trim())) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
        }
        // Phone validation
        else if (input.type === 'tel' && input.value.trim()) {
            const phonePattern = /^[\d\+\-\(\) ]{10,15}$/;
            if (!phonePattern.test(input.value.trim())) {
                isValid = false;
                errorMessage = 'Please enter a valid phone number';
            }
        }
        // Min length validation
        else if (input.minLength && input.value.trim().length < input.minLength) {
            isValid = false;
            errorMessage = `Please enter at least ${input.minLength} characters`;
        }
        // Max length validation
        else if (input.maxLength && input.value.trim().length > input.maxLength) {
            isValid = false;
            errorMessage = `Please enter no more than ${input.maxLength} characters`;
        }
        // Pattern validation
        else if (input.pattern && input.value.trim()) {
            const pattern = new RegExp(input.pattern);
            if (!pattern.test(input.value.trim())) {
                isValid = false;
                errorMessage = input.title || 'Please match the requested format';
            }
        }
        
        // Set validation state
        if (isValid) {
            formGroup.classList.add('is-valid');
            feedback.textContent = '';
        } else {
            formGroup.classList.add('is-invalid');
            feedback.textContent = errorMessage;
        }
        
        return isValid;
    },
    
    /**
     * Initialize booking form specific functionality
     */
    initBookingForm: function(form) {
        // Form step navigation
        const steps = form.querySelectorAll('.form-step');
        const progressSteps = form.querySelectorAll('.progress-step');
        const nextButtons = form.querySelectorAll('.next-step');
        const prevButtons = form.querySelectorAll('.prev-step');
        
        let currentStep = 0;
        
        // Update the current step display
        const updateStepDisplay = () => {
            steps.forEach((step, index) => {
                if (index === currentStep) {
                    step.classList.remove('hidden');
                } else {
                    step.classList.add('hidden');
                }
            });
            
            progressSteps.forEach((step, index) => {
                if (index <= currentStep) {
                    step.classList.add('active');
                } else {
                    step.classList.remove('active');
                }
            });
        };
        
        // Go to next step
        const goToNextStep = () => {
            // Validate current step
            const currentStepElement = steps[currentStep];
            const inputs = currentStepElement.querySelectorAll('input, select, textarea');
            
            let isStepValid = true;
            
            inputs.forEach(input => {
                if (input.required && !this.validateInput(input)) {
                    isStepValid = false;
                }
            });
            
            if (!isStepValid) {
                // Focus first invalid input
                const firstInvalid = currentStepElement.querySelector('.is-invalid');
                if (firstInvalid) {
                    firstInvalid.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                    firstInvalid.focus();
                }
                return;
            }
            
            // Move to next step
            if (currentStep < steps.length - 1) {
                currentStep++;
                updateStepDisplay();
                
                // Scroll to top of form
                form.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        };
        
        // Go to previous step
        const goToPrevStep = () => {
            if (currentStep > 0) {
                currentStep--;
                updateStepDisplay();
                
                // Scroll to top of form
                form.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        };
        
        // Bind events to step buttons
        nextButtons.forEach(button => {
            button.addEventListener('click', goToNextStep);
        });
        
        prevButtons.forEach(button => {
            button.addEventListener('click', goToPrevStep);
        });
        
        // Date and time selection
        let dateInput;  // Declare the variable at a higher scope

        // Wait for the DOM to be fully loaded before trying to access the dateInput
        document.addEventListener('DOMContentLoaded', function() {
            dateInput = document.querySelector('#appointment-date');
            const timeSlotContainer = document.querySelector('.time-slots');
            
            if (dateInput && timeSlotContainer) {
                dateInput.addEventListener('change', () => {
                    // This would typically be an AJAX request to get available time slots
                    // For demo purposes, we'll just generate some sample time slots
                    const date = new Date(dateInput.value);
                    const dayOfWeek = date.getDay();
                    
                    // Clear existing time slots
                    timeSlotContainer.innerHTML = '';
                    
                    // Check if the selected date is valid
                    if (isNaN(date.getTime())) {
                        timeSlotContainer.innerHTML = '<p class="no-slots-message">Please select a valid date.</p>';
                        return;
                    }
                    
                    // Check if date is in the past
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    
                    if (date < today) {
                        timeSlotContainer.innerHTML = '<p class="no-slots-message">Please select a date in the future.</p>';
                        return;
                    }
                    
                    // Check if it's a Sunday (closed)
                    if (dayOfWeek === 0) {
                        timeSlotContainer.innerHTML = '<p class="no-slots-message">We are closed on Sundays. Please select another day.</p>';
                        return;
                    }
                    
                    // Generate time slots based on day of week
                    const startHour = dayOfWeek === 6 ? 10 : 9; // 10 AM on Saturday, 9 AM on other days
                    const endHour = dayOfWeek === 6 ? 15 : 18; // 3 PM on Saturday, 6 PM on other days
                    
                    for (let hour = startHour; hour < endHour; hour++) {
                        // Generate slots at :00 and :30
                        [0, 30].forEach(minute => {
                            const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                            
                            const timeSlot = document.createElement('div');
                            timeSlot.className = 'time-slot';
                            timeSlot.dataset.time = timeString;
                            timeSlot.textContent = timeString;
                            
                            // Randomly mark some slots as unavailable for demo purposes
                            if (Math.random() < 0.3) {
                                timeSlot.classList.add('unavailable');
                                timeSlot.setAttribute('disabled', 'disabled');
                            } else {
                                timeSlot.addEventListener('click', () => {
                                    // Deselect all other slots
                                    document.querySelectorAll('.time-slot.selected').forEach(slot => {
                                        slot.classList.remove('selected');
                                    });
                                    
                                    // Select this slot
                                    timeSlot.classList.add('selected');
                                    
                                    // Update hidden input
                                    const timeInput = form.querySelector('#selected-time');
                                    if (timeInput) {
                                        timeInput.value = timeString;
                                    }
                                    
                                    // Enable next button
                                    const nextButton = form.querySelector('.form-step[data-step="3"] .next-step');
                                    if (nextButton) {
                                        nextButton.disabled = false;
                                    }
                                });
                            }
                            
                            timeSlotContainer.appendChild(timeSlot);
                        });
                    }
                    
                    // Update selected date display
                    const selectedDateElement = form.querySelector('.selected-date');
                    if (selectedDateElement) {
                        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                        selectedDateElement.textContent = date.toLocaleDateString('en-US', options);
                    }
                    
                    // Update hidden input
                    const dateInput = form.querySelector('#selected-date');
                    if (dateInput) {
                        dateInput.value = dateInput.value;
                    }
                });
            }
        });
        
        // Service selection
        const serviceCategory = form.querySelector('#service-category');
        const specificService = form.querySelector('#specific-service');
        
        if (serviceCategory && specificService) {
            serviceCategory.addEventListener('change', () => {
                const category = serviceCategory.value;
                
                // Clear and disable the specific service dropdown if no category selected
                if (!category) {
                    specificService.innerHTML = '<option value="">Please select a category first</option>';
                    specificService.disabled = true;
                    return;
                }
                
                // Enable the specific service dropdown
                specificService.disabled = false;
                
                // Clear the current options
                specificService.innerHTML = '<option value="">Select a service</option>';
                
                // Add options based on selected category
                let services = [];
                
                if (category === 'general') {
                    services = [
                        { value: 'checkup', label: 'Dental Check-up & Cleaning' },
                        { value: 'fillings', label: 'Dental Fillings' },
                        { value: 'root-canal', label: 'Root Canal Therapy' },
                        { value: 'extraction', label: 'Tooth Extraction' }
                    ];
                } else if (category === 'cosmetic') {
                    services = [
                        { value: 'whitening', label: 'Teeth Whitening' },
                        { value: 'veneers', label: 'Porcelain Veneers' },
                        { value: 'bonding', label: 'Dental Bonding' },
                        { value: 'smile-makeover', label: 'Complete Smile Makeover' }
                    ];
                } else if (category === 'emergency') {
                    services = [
                        { value: 'toothache', label: 'Severe Toothache' },
                        { value: 'broken-tooth', label: 'Broken or Chipped Tooth' },
                        { value: 'lost-filling', label: 'Lost Filling or Crown' },
                        { value: 'dental-abscess', label: 'Dental Abscess' }
                    ];
                }
                
                // Add the options to the dropdown
                services.forEach(service => {
                    const option = document.createElement('option');
                    option.value = service.value;
                    option.textContent = service.label;
                    specificService.appendChild(option);
                });
            });
        }
        
        // Update confirmation summary
        const updateSummary = () => {
            // Get name
            const firstName = form.querySelector('#first-name')?.value || '';
            const lastName = form.querySelector('#last-name')?.value || '';
            const fullName = `${firstName} ${lastName}`.trim();
            
            // Get service
            const serviceCategory = form.querySelector('#service-category');
            const specificService = form.querySelector('#specific-service');
            let serviceName = '';
            
            if (serviceCategory && specificService && serviceCategory.value && specificService.value) {
                const categoryText = serviceCategory.options[serviceCategory.selectedIndex].text;
                const serviceText = specificService.options[specificService.selectedIndex].text;
                serviceName = `${serviceText} (${categoryText})`;
            }
            
            // Get dentist
            const dentist = form.querySelector('#preferred-dentist');
            let dentistName = 'No preference';
            
            if (dentist && dentist.value) {
                dentistName = dentist.options[dentist.selectedIndex].text;
            }
            
            // Get date & time
            const selectedDate = form.querySelector('#selected-date')?.value || '';
            const selectedTime = form.querySelector('#selected-time')?.value || '';
            let dateTimeText = '';
            
            if (selectedDate && selectedTime) {
                const date = new Date(selectedDate);
                const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                dateTimeText = `${date.toLocaleDateString('en-US', options)} at ${selectedTime}`;
            }
            
            // Update summary elements
            const nameElement = document.getElementById('summary-name');
            const serviceElement = document.getElementById('summary-service');
            const dentistElement = document.getElementById('summary-dentist');
            const dateTimeElement = document.getElementById('summary-datetime');
            
            if (nameElement) nameElement.textContent = fullName;
            if (serviceElement) serviceElement.textContent = serviceName;
            if (dentistElement) dentistElement.textContent = dentistName;
            if (dateTimeElement) dateTimeElement.textContent = dateTimeText;
        };
        
        // Update summary when moving to the confirmation step
        const confirmationStepButton = form.querySelector('.form-step[data-step="3"] .next-step');
        if (confirmationStepButton) {
            confirmationStepButton.addEventListener('click', updateSummary);
        }
        
        // Initialize calendar if it exists
        this.initCalendar(form.querySelector('.calendar-container'));
    },
    
    /**
     * Initialize calendar functionality
     */
    initCalendar: function(calendarContainer) {
        if (!calendarContainer) return;
        
        const calendarGrid = calendarContainer.querySelector('.calendar-grid');
        const calendarMonth = calendarContainer.querySelector('.calendar-month');
        const prevMonth = calendarContainer.querySelector('.prev-month');
        const nextMonth = calendarContainer.querySelector('.next-month');
        
        // Current date
        const today = new Date();
        let currentMonth = today.getMonth();
        let currentYear = today.getFullYear();
        
        // Min date (today)
        const minDate = new Date();
        minDate.setHours(0, 0, 0, 0);
        
        // Max date (1 year from now)
        const maxDate = new Date();
        maxDate.setFullYear(maxDate.getFullYear() + 1);
        
        // Generate calendar
        const generateCalendar = () => {
            // Clear grid
            calendarGrid.innerHTML = '';
            
            // Update month header
            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            calendarMonth.textContent = `${monthNames[currentMonth]} ${currentYear}`;
            
            // Create day headers
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            
            dayNames.forEach(day => {
                const dayElement = document.createElement('div');
                dayElement.className = 'calendar-day-header';
                dayElement.textContent = day;
                calendarGrid.appendChild(dayElement);
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
                calendarGrid.appendChild(emptyCell);
            }
            
            // Add days of the month
            for (let day = 1; day <= totalDays; day++) {
                const date = new Date(currentYear, currentMonth, day);
                
                const dayElement = document.createElement('div');
                dayElement.className = 'calendar-day';
                dayElement.textContent = day;
                dayElement.dataset.date = date.toISOString().split('T')[0];
                
                // Check if date is selectable
                const isBeforeMin = date < minDate;
                const isAfterMax = date > maxDate;
                const isSunday = date.getDay() === 0;
                
                if (isBeforeMin || isAfterMax || isSunday) {
                    dayElement.classList.add('disabled');
                } else {
                    dayElement.addEventListener('click', () => {
                        // Deselect previous date
                        const selectedDate = calendarGrid.querySelector('.calendar-day.selected');
                        if (selectedDate) {
                            selectedDate.classList.remove('selected');
                        }
                        
                        // Select this date
                        dayElement.classList.add('selected');
                        
                        // Update the date input using a safer approach
                        const dateInput = document.getElementById('appointment-date');
                        
                        if (dateInput) {
                            try {
                                // Set the value and trigger change event
                                dateInput.value = dayElement.dataset.date;
                                
                                // Dispatch the event safely
                                try {
                                    const event = new Event('change', { bubbles: true });
                                    dateInput.dispatchEvent(event);
                                } catch (eventError) {
                                    console.log('Error dispatching change event:', eventError);
                                    // Alternative method to trigger change handler
                                    if (typeof jQuery !== 'undefined') {
                                        jQuery(dateInput).trigger('change');
                                    }
                                }
                            } catch (error) {
                                console.error('Error updating date input:', error);
                            }
                        } else {
                            console.error('Date input not found in the DOM');
                        }
                    });
                }
                
                // Highlight today
                if (date.toDateString() === today.toDateString()) {
                    dayElement.classList.add('today');
                }
                
                calendarGrid.appendChild(dayElement);
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
        };
        
        // Go to next month
        const goToNextMonth = () => {
            currentMonth++;
            
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            
            generateCalendar();
        };
        
        // Bind events
        prevMonth.addEventListener('click', goToPrevMonth);
        nextMonth.addEventListener('click', goToNextMonth);
        
        // Initialize calendar
        generateCalendar();
    },
    
    /**
     * Initialize contact form specific functionality
     */
    initContactForm: function(form) {
        // This would typically handle contact form specific functionality
        // such as AJAX submission, Google reCAPTCHA, etc.
    },
    
    /**
     * Initialize lazy loading
     */
    initLazyLoading: function() {
        // Use IntersectionObserver for lazy loading
        if ('IntersectionObserver' in window) {
            const lazyImages = document.querySelectorAll('img[loading="lazy"]');
            
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        
                        // Set src from data-src if it exists
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            delete img.dataset.src;
                        }
                        
                        // Set srcset from data-srcset if it exists
                        if (img.dataset.srcset) {
                            img.srcset = img.dataset.srcset;
                            delete img.dataset.srcset;
                        }
                        
                        img.classList.add('loaded');
                        imageObserver.unobserve(img);
                    }
                });
            });
            
            lazyImages.forEach(img => {
                imageObserver.observe(img);
            });
        }
    },
    
    /**
     * Load clinic data
     */
    loadClinicData: function() {
        // Try to get clinic data from ClinicDataUtil if available
        if (window.ClinicDataUtil) {
            this.state.clinicData = ClinicDataUtil.getClinicData();
            return;
        }
        
        // Fallback to direct loading if utility is not available
        const dataScript = document.getElementById('clinic-data');
        if (dataScript) {
            try {
                this.state.clinicData = JSON.parse(dataScript.textContent);
            } catch (error) {
                console.warn('Could not parse clinic data:', error);
            }
        }
    },
    
    /**
     * Apply clinic data to the page elements
     */
    applyClinicDataToPage: function() {
        // Skip if ClinicDataUtil is handling this
        if (window.ClinicDataUtil) {
            return;
        }
        
        // Skip if no clinic data is available
        if (!this.state.clinicData) {
            return;
        }
        
        const data = this.state.clinicData;
        
        // Update clinic name elements
        document.querySelectorAll('[data-clinic-name]').forEach(el => {
            el.textContent = data.name || '';
        });
        
        // Update clinic address elements
        document.querySelectorAll('[data-clinic-address]').forEach(el => {
            el.textContent = data.address || '';
        });
        
        // Update clinic phone elements
        document.querySelectorAll('[data-clinic-phone]').forEach(el => {
            el.textContent = data.phone || '';
            if (el.tagName === 'A') {
                el.href = 'tel:' + (data.phone || '').replace(/\s/g, '');
            }
        });
        
        // Update clinic hours elements
        if (data.hours && data.hours.length) {
            document.querySelectorAll('[data-clinic-hours]').forEach(el => {
                el.innerHTML = data.hours.map(hour => `<li>${hour}</li>`).join('');
            });
        }
        
        // Update clinic services list
        if (data.services && data.services.length) {
            document.querySelectorAll('[data-clinic-services]').forEach(el => {
                el.innerHTML = data.services.map(service => `<li>${service}</li>`).join('');
            });
        }
    }
};

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    WisdomBites.init();
});