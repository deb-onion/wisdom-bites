/**
 * Wisdom Bites Dental Clinic
 * Virtual Tour Module
 * 
 * This file handles the virtual tour functionality including:
 * - Google Street View integration
 * - Interior panorama viewing
 * - Tour completion handling
 * - Places API integration
 * - Hotspots for interactive experience
 */

"use strict";

const VirtualTour = {
    // Configuration
    config: {
        placeId: "ChIJEZw2uCNxAjoRrPHJvp1VC2g", // Wisdom Bites Dental Clinic Place ID
        panoramaOptions: {
            position: { lat: 22.4969, lng: 88.3722 }, // Position for Jadavpur, Kolkata
            pov: { heading: 0, pitch: 0 },
            zoom: 1,
            addressControl: true,
            showRoadLabels: true,
            clickToGo: true,
            panControl: true,
            linksControl: true,
            fullscreenControl: true,
            enableCloseButton: false,
            motionTracking: true,
            motionTrackingControl: true
        },
        // Note: In a real implementation, you would replace these with actual panorama images
        // For now, we'll use placeholder images that should be created
        interiorImages: [
            "assets/images/panorama/reception.jpg",
            "assets/images/panorama/waiting-area.jpg",
            "assets/images/panorama/treatment-room-1.jpg",
            "assets/images/panorama/treatment-room-2.jpg"
        ],
        // Fallback images in case the actual panoramas aren't available yet
        fallbackImages: [
            "assets/images/dental-office.webp",
            "assets/images/hero-bg.jpg"
        ],
        // Hotspots for each interior panorama
        hotspots: {
            "reception": [
                {
                    position: { x: 50, y: 30 },
                    title: "Reception Desk",
                    description: "Our friendly staff will greet you here."
                },
                {
                    position: { x: 70, y: 40 },
                    title: "Waiting Area",
                    description: "Comfortable seating while you wait.",
                    navigateTo: 1 // Index of waiting-area panorama
                }
            ],
            "waiting-area": [
                {
                    position: { x: 30, y: 50 },
                    title: "Entertainment",
                    description: "Television and magazines for your enjoyment."
                },
                {
                    position: { x: 60, y: 40 },
                    title: "Treatment Room 1",
                    description: "One of our modern treatment rooms.",
                    navigateTo: 2 // Index of treatment-room-1 panorama
                }
            ],
            "treatment-room-1": [
                {
                    position: { x: 40, y: 30 },
                    title: "Dental Chair",
                    description: "Ergonomic and comfortable dental chair."
                },
                {
                    position: { x: 60, y: 50 },
                    title: "Equipment",
                    description: "State-of-the-art dental equipment."
                }
            ],
            "treatment-room-2": [
                {
                    position: { x: 45, y: 35 },
                    title: "Specialized Equipment",
                    description: "Advanced equipment for complex procedures."
                }
            ]
        },
        // Static map options for fallback
        staticMapOptions: {
            width: 600,
            height: 400,
            zoom: 16,
            maptype: "roadmap",
            markers: [
                {
                    color: "red",
                    label: "W",
                    position: "22.4969,88.3722"
                }
            ]
        }
    },
    
    // DOM elements
    elements: {},
    
    // State management
    state: {
        currentView: 'street', // 'street' or 'interior'
        currentInteriorIndex: 0,
        panorama: null,
        isOpen: false,
        mapsLoaded: false,
        placesService: null,
        directionService: null,
        placeDetails: null,
        localClinicData: null
    },
    
    /**
     * Initialize the virtual tour
     */
    init: function() {
        // Cache DOM elements
        this.cacheElements();
        
        // Load clinic data
        this.loadClinicData();
        
        // Add event listeners
        this.bindEvents();
        
        // Check if we need to preload Google Maps API
        if (document.querySelector('meta[name="google-maps-preload"]')) {
            this.preloadMapsAPI();
        }
    },
    
    /**
     * Cache DOM elements
     */
    cacheElements: function() {
        this.elements.tourButton = document.getElementById('virtual-tour-button');
        this.elements.tourContainer = document.getElementById('virtual-tour-container');
        this.elements.panoramaView = document.getElementById('panorama-view');
        this.elements.closeButton = document.getElementById('close-tour-button');
        this.elements.switchViewButton = document.getElementById('switch-view-button');
        this.elements.nextButton = document.getElementById('next-panorama-button');
        this.elements.prevButton = document.getElementById('prev-panorama-button');
        this.elements.completeButton = document.getElementById('complete-tour-button');
        this.elements.completionDialog = document.getElementById('tour-completion-dialog');
        this.elements.bookButton = document.getElementById('post-tour-book-button');
        this.elements.closeDialogButton = document.getElementById('close-dialog-button');
        this.elements.loadingIndicator = this.elements.panoramaView ? 
            this.elements.panoramaView.querySelector('.panorama-loading') : null;
        this.elements.hotspotContainer = document.getElementById('hotspot-container');
        this.elements.placeInfoPanel = document.getElementById('place-info-panel');
        this.elements.tourIndicators = document.getElementById('tour-indicators');
        this.elements.toggleInfoButton = document.getElementById('toggle-info-button');
    },
    
    /**
     * Bind event listeners
     */
    bindEvents: function() {
        // Open tour
        if (this.elements.tourButton) {
            this.elements.tourButton.addEventListener('click', this.openTour.bind(this));
        }
        
        // Close tour
        if (this.elements.closeButton) {
            this.elements.closeButton.addEventListener('click', this.closeTour.bind(this));
        }
        
        // Switch view (street/interior)
        if (this.elements.switchViewButton) {
            this.elements.switchViewButton.addEventListener('click', this.toggleView.bind(this));
        }
        
        // Toggle place info panel
        if (this.elements.toggleInfoButton) {
            this.elements.toggleInfoButton.addEventListener('click', this.togglePlaceInfoPanel.bind(this));
        }
        
        // Navigate interior panoramas
        if (this.elements.nextButton) {
            this.elements.nextButton.addEventListener('click', this.nextInteriorPanorama.bind(this));
        }
        
        if (this.elements.prevButton) {
            this.elements.prevButton.addEventListener('click', this.prevInteriorPanorama.bind(this));
        }
        
        // Complete tour
        if (this.elements.completeButton) {
            this.elements.completeButton.addEventListener('click', this.completeTour.bind(this));
        }
        
        // Post-tour actions
        if (this.elements.bookButton) {
            this.elements.bookButton.addEventListener('click', this.bookAppointment.bind(this));
        }
        
        if (this.elements.closeDialogButton) {
            this.elements.closeDialogButton.addEventListener('click', this.closeCompletionDialog.bind(this));
        }
        
        // Handle escape key to close tour
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.state.isOpen) {
                this.closeTour();
            }
        });
        
        // Handle window resize
        window.addEventListener('resize', this.handleResize.bind(this));
    },
    
    /**
     * Handle window resize events
     */
    handleResize: function() {
        if (this.state.isOpen) {
            if (this.state.currentView === 'street' && this.state.panorama) {
                this.state.panorama.setVisible(false);
                setTimeout(() => {
                    this.state.panorama.setVisible(true);
                }, 100);
            } else if (this.state.currentView === 'interior') {
                // Refresh interior view if using a panorama library
                this.updateHotspotPositions();
            }
        }
    },
    
    /**
     * Preload Google Maps API for faster tour start
     */
    preloadMapsAPI: function() {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = 'https://maps.googleapis.com';
        document.head.appendChild(link);
        
        const dnsLink = document.createElement('link');
        dnsLink.rel = 'dns-prefetch';
        dnsLink.href = 'https://maps.googleapis.com';
        document.head.appendChild(dnsLink);
    },
    
    /**
     * Load the Google Maps API
     */
    loadMapsAPI: function() {
        if (this.state.mapsLoaded) {
            this.initStreetView();
            return;
        }
        
        if (typeof google === 'undefined' || typeof google.maps === 'undefined') {
            // Show loading indicator
            this.showLoading();
            
            const script = document.createElement('script');
            script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyDY7pn8Bkb9dxMKX6pKgldH1a2acVjmWsw&libraries=places&callback=VirtualTour.mapsCallback';
            script.async = true;
            script.defer = true;
            document.head.appendChild(script);
            
            // Fallback in case the API fails to load
            setTimeout(() => {
                if (!this.state.mapsLoaded) {
                    this.handleMapsError();
                }
            }, 10000); // 10 second timeout
        } else {
            this.mapsCallback();
        }
    },
    
    /**
     * Callback when Maps API is loaded
     */
    mapsCallback: function() {
        this.state.mapsLoaded = true;
        this.hideLoading();
        this.initServices();
        this.initStreetView();
    },
    
    /**
     * Initialize Google Maps services
     */
    initServices: function() {
        if (!google || !google.maps) return;
        
        // Initialize Places service
        try {
            const map = new google.maps.Map(document.createElement('div'));
            this.state.placesService = new google.maps.places.PlacesService(map);
            this.state.directionsService = new google.maps.DirectionsService();
            this.fetchPlaceDetails();
        } catch (error) {
            console.warn('Could not initialize Maps services:', error);
        }
    },
    
    /**
     * Fetch place details using Places API
     */
    fetchPlaceDetails: function() {
        if (!this.state.placesService) return;
        
        this.state.placesService.getDetails({
            placeId: this.config.placeId,
            fields: [
                'name', 'formatted_address', 'geometry', 'phone_number', 'photos',
                'opening_hours', 'rating', 'reviews', 'website', 'price_level'
            ]
        }, (place, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                this.state.placeDetails = place;
                this.updatePlaceInfoPanel();
                
                // Update panorama position with precise location
                if (place.geometry && place.geometry.location && this.state.panorama) {
                    this.state.panorama.setPosition(place.geometry.location);
                }
                
                // Use place photos if available
                if (place.photos && place.photos.length > 0) {
                    this.updateGalleryWithPhotos(place.photos);
                }
            }
        });
    },
    
    /**
     * Load local clinic data from JSON
     */
    loadClinicData: function() {
        const dataScript = document.getElementById('clinic-data');
        if (dataScript) {
            try {
                const clinicData = JSON.parse(dataScript.textContent);
                this.state.localClinicData = clinicData;
                
                // Use local data if available
                if (!this.state.placeDetails) {
                    this.state.placeDetails = this.convertLocalDataToPlaceDetails(clinicData);
                }
            } catch (error) {
                console.warn('Could not parse clinic data:', error);
            }
        }
    },
    
    /**
     * Convert local clinic data to Google Place Details format
     */
    convertLocalDataToPlaceDetails: function(localData) {
        if (!localData) return null;
        
        return {
            name: localData.name,
            formatted_address: localData.address,
            geometry: {
                location: {
                    lat: () => localData.position.lat,
                    lng: () => localData.position.lng
                }
            },
            phone_number: localData.phone,
            opening_hours: {
                weekday_text: localData.hours
            },
            website: 'https://wisdombites.com',
            rating: 4.9,
            reviews: [
                {
                    author_name: 'Sarah Johnson',
                    rating: 5,
                    text: 'Wisdom Bites transformed my dental experience! The staff is incredibly friendly, and the doctors made my procedure painless and comfortable.'
                },
                {
                    author_name: 'James Wilson',
                    rating: 5,
                    text: 'After years of dental anxiety, I finally found a place where I feel comfortable. The team is patient, understanding, and genuinely cares about your wellbeing.'
                }
            ]
        };
    },
    
    /**
     * Update place info panel with fetched details
     */
    updatePlaceInfoPanel: function() {
        if (!this.elements.placeInfoPanel) return;
        
        const place = this.state.placeDetails || this.convertLocalDataToPlaceDetails(this.state.localClinicData);
        if (!place) return;
        
        let hoursHtml = '';
        
        if (place.opening_hours && place.opening_hours.weekday_text) {
            hoursHtml = `
                <h4>Opening Hours</h4>
                <ul class="hours-list">
                    ${place.opening_hours.weekday_text.map(day => `<li>${day}</li>`).join('')}
                </ul>
            `;
        }
        
        let reviewsHtml = '';
        if (place.reviews && place.reviews.length > 0) {
            reviewsHtml = `
                <h4>Reviews</h4>
                <div class="place-reviews">
                    ${place.reviews.slice(0, 3).map(review => `
                        <div class="place-review">
                            <div class="review-rating">${'★'.repeat(review.rating)}</div>
                            <p>${review.text.substring(0, 100)}${review.text.length > 100 ? '...' : ''}</p>
                            <span>- ${review.author_name}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        this.elements.placeInfoPanel.innerHTML = `
            <div class="place-info-header">
                <h3>${place.name}</h3>
                ${place.rating ? `<div class="place-rating">${place.rating} ★</div>` : ''}
            </div>
            <div class="place-info-content">
                <p class="place-address">${place.formatted_address}</p>
                <p class="place-phone">${place.phone_number || ''}</p>
                ${place.website ? `<p class="place-website"><a href="${place.website}" target="_blank">Visit Website</a></p>` : ''}
                ${hoursHtml}
                ${reviewsHtml}
            </div>
            <div class="place-actions">
                <button class="place-action-btn get-directions-btn">Get Directions</button>
                <button class="place-action-btn call-btn">Call</button>
                <button class="place-action-btn book-btn">Book Appointment</button>
            </div>
        `;
        
        // Add event listeners to buttons
        const directionsBtn = this.elements.placeInfoPanel.querySelector('.get-directions-btn');
        if (directionsBtn) {
            directionsBtn.addEventListener('click', this.openDirections.bind(this));
        }
        
        const callBtn = this.elements.placeInfoPanel.querySelector('.call-btn');
        if (callBtn && place.phone_number) {
            callBtn.addEventListener('click', () => {
                window.location.href = `tel:${place.phone_number.replace(/\s/g, '')}`;
            });
        }
        
        const bookBtn = this.elements.placeInfoPanel.querySelector('.book-btn');
        if (bookBtn) {
            bookBtn.addEventListener('click', this.bookAppointment.bind(this));
        }
    },
    
    /**
     * Update gallery with place photos
     */
    updateGalleryWithPhotos: function(photos) {
        if (!photos || photos.length === 0) return;
        
        // Replace fallback images with actual Google photos
        this.config.fallbackImages = photos.slice(0, 4).map(photo => photo.getUrl({ maxWidth: 1200, maxHeight: 800 }));
        
        // If we're currently showing an interior view, update it
        if (this.state.isOpen && this.state.currentView === 'interior') {
            this.initInteriorView();
        }
    },
    
    /**
     * Open Google Maps directions
     */
    openDirections: function() {
        if (!this.state.placeDetails || !this.state.placeDetails.geometry) return;
        
        const destination = `${this.state.placeDetails.geometry.location.lat()},${this.state.placeDetails.geometry.location.lng()}`;
        const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}&destination_place_id=${this.config.placeId}`;
        window.open(url, '_blank');
    },
    
    /**
     * Handle Maps API loading error
     */
    handleMapsError: function() {
        this.hideLoading();
        
        // Try to use static map as fallback
        this.useStaticMapFallback();
        
        // Show a notification to the user
        if (this.elements.panoramaView) {
            const errorNotice = document.createElement('div');
            errorNotice.className = 'maps-error-notice';
            errorNotice.textContent = 'Street view could not be loaded. Showing static map instead.';
            this.elements.panoramaView.appendChild(errorNotice);
            
            // Auto-hide after a few seconds
            setTimeout(() => {
                errorNotice.style.opacity = '0';
                setTimeout(() => {
                    errorNotice.remove();
                }, 500);
            }, 3000);
        }
    },
    
    /**
     * Use Static Maps API as fallback
     */
    useStaticMapFallback: function() {
        if (!this.elements.panoramaView) return;
        
        const options = this.config.staticMapOptions;
        const markers = options.markers.map(marker => 
            `markers=color:${marker.color}|label:${marker.label}|${marker.position}`
        ).join('&');
        
        const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${this.config.panoramaOptions.position.lat},${this.config.panoramaOptions.position.lng}&zoom=${options.zoom}&size=${options.width}x${options.height}&maptype=${options.maptype}&${markers}&key=AIzaSyDY7pn8Bkb9dxMKX6pKgldH1a2acVjmWsw`;
        
        this.elements.panoramaView.innerHTML = `
            <div class="static-map-container">
                <img src="${staticMapUrl}" alt="Map of Wisdom Bites Dental Clinic" class="static-map-img">
                <div class="static-map-overlay">
                    <p>Interactive Street View not available</p>
                    <button class="static-map-btn switch-interior-btn">View Interior Photos</button>
                </div>
            </div>
        `;
        
        // Add event listener to switch to interior view
        const switchBtn = this.elements.panoramaView.querySelector('.switch-interior-btn');
        if (switchBtn) {
            switchBtn.addEventListener('click', this.switchToInteriorView.bind(this));
        }
        
        // Update button text
        if (this.elements.switchViewButton) {
            this.elements.switchViewButton.textContent = 'View Clinic Interior';
        }
    },
    
    /**
     * Show loading indicator
     */
    showLoading: function() {
        if (this.elements.loadingIndicator) {
            this.elements.loadingIndicator.style.display = 'flex';
        }
    },
    
    /**
     * Hide loading indicator
     */
    hideLoading: function() {
        if (this.elements.loadingIndicator) {
            this.elements.loadingIndicator.style.display = 'none';
        }
    },
    
    /**
     * Initialize Street View
     */
    initStreetView: function() {
        if (!this.elements.panoramaView || !google || !google.maps) {
            this.handleMapsError();
            return;
        }
        
        try {
            this.showLoading();
            
            this.state.panorama = new google.maps.StreetViewPanorama(
                this.elements.panoramaView,
                this.config.panoramaOptions
            );
            
            // Add event listeners
            this.state.panorama.addListener('position_changed', () => {
                // Update hotspots or other UI elements based on new position
                this.checkForLocationUpdates();
            });
            
            this.state.panorama.addListener('pov_changed', () => {
                // Update UI based on point of view changes
                this.updateHotspotVisibility();
            });
            
            // Attempt to load the place by ID
            const sv = new google.maps.StreetViewService();
            sv.getPanoramaByLocation(
                this.config.panoramaOptions.position,
                50, // Search radius in meters
                (data, status) => {
                    this.hideLoading();
                    
                    if (status === google.maps.StreetViewStatus.OK) {
                        this.state.panorama.setPano(data.location.pano);
                        
                        // Add marker for entrance
                        this.addEntranceMarker();
                    } else {
                        // Fall back to interior view if street view isn't available
                        this.switchToInteriorView();
                    }
                }
            );
            
            // Update UI
            this.updateNavigationButtons();
            this.createTourIndicators();
        } catch (error) {
            this.handleMapsError();
        }
    },
    
    /**
     * Add marker for clinic entrance
     */
    addEntranceMarker: function() {
        if (!this.state.panorama || !google || !google.maps) return;
        
        const entrancePosition = new google.maps.LatLng(
            this.config.panoramaOptions.position.lat,
            this.config.panoramaOptions.position.lng
        );
        
        // Create a custom marker
        const entranceMarker = new google.maps.Marker({
            position: entrancePosition,
            map: this.state.panorama,
            title: 'Wisdom Bites Dental Clinic - Main Entrance',
            icon: {
                url: 'assets/images/entrance-marker.png', // Create this icon
                scaledSize: new google.maps.Size(32, 32)
            }
        });
        
        // Add click event
        entranceMarker.addListener('click', () => {
            this.switchToInteriorView();
        });
        
        // Add info window
        const infoWindow = new google.maps.InfoWindow({
            content: `
                <div class="entrance-info">
                    <h3>Wisdom Bites Dental Clinic</h3>
                    <p>Click to enter and view interior</p>
                </div>
            `
        });
        
        // Show info window immediately
        infoWindow.open(this.state.panorama, entranceMarker);
        
        // Close after a few seconds
        setTimeout(() => {
            infoWindow.close();
        }, 5000);
    },
    
    /**
     * Check if we're near the clinic entrance
     */
    checkForLocationUpdates: function() {
        if (!this.state.panorama || !google || !google.maps) return;
        
        const currentPosition = this.state.panorama.getPosition();
        const clinicPosition = new google.maps.LatLng(
            this.config.panoramaOptions.position.lat,
            this.config.panoramaOptions.position.lng
        );
        
        // Calculate distance
        const distance = google.maps.geometry.spherical.computeDistanceBetween(
            currentPosition,
            clinicPosition
        );
        
        // If we're close to the entrance (within 10 meters)
        if (distance < 10) {
            if (!this.elements.entrancePrompt) {
                // Create entrance prompt
                const entrancePrompt = document.createElement('div');
                entrancePrompt.className = 'entrance-prompt';
                entrancePrompt.innerHTML = `
                    <div class="prompt-content">
                        <h3>You've reached Wisdom Bites Dental Clinic!</h3>
                        <p>Would you like to enter and see the interior?</p>
                        <button class="prompt-btn enter-btn">Enter Clinic</button>
                        <button class="prompt-btn cancel-btn">Continue Exploring</button>
                    </div>
                `;
                this.elements.panoramaView.appendChild(entrancePrompt);
                this.elements.entrancePrompt = entrancePrompt;
                
                // Add event listeners
                entrancePrompt.querySelector('.enter-btn').addEventListener('click', () => {
                    this.switchToInteriorView();
                    entrancePrompt.remove();
                    this.elements.entrancePrompt = null;
                });
                
                entrancePrompt.querySelector('.cancel-btn').addEventListener('click', () => {
                    entrancePrompt.remove();
                    this.elements.entrancePrompt = null;
                });
            }
        } else if (this.elements.entrancePrompt) {
            // Remove entrance prompt if we've moved away
            this.elements.entrancePrompt.remove();
            this.elements.entrancePrompt = null;
        }
    },
    
    /**
     * Initialize Interior Panorama View
     */
    initInteriorView: function() {
        if (!this.elements.panoramaView) return;
        
        this.showLoading();
        
        // In a real implementation, you would use a proper panorama viewer library
        // For now, we'll just display the image directly as a fallback
        
        // Check if the image exists, otherwise use fallback
        const img = new Image();
        const currentImage = this.config.interiorImages[this.state.currentInteriorIndex] || 
                            this.config.fallbackImages[this.state.currentInteriorIndex % this.config.fallbackImages.length];
        
        img.onload = () => {
            this.hideLoading();
            this.elements.panoramaView.innerHTML = `
                <div class="interior-panorama-container">
                    <img src="${currentImage}" 
                         alt="Interior panorama" 
                         class="interior-panorama-img">
                    <div id="hotspot-container" class="hotspot-container"></div>
                </div>
            `;
            
            // Create hotspots
            this.createHotspots();
            
            // Update tour indicators
            this.updateTourIndicators();
            
            // Update hotspot container reference
            this.elements.hotspotContainer = document.getElementById('hotspot-container');
        };
        
        img.onerror = () => {
            this.hideLoading();
            // Use fallback image
            const fallbackImage = this.config.fallbackImages[this.state.currentInteriorIndex % this.config.fallbackImages.length];
            this.elements.panoramaView.innerHTML = `
                <div class="interior-panorama-container">
                    <img src="${fallbackImage}" 
                         alt="Interior view" 
                         class="interior-panorama-img">
                    <div class="panorama-error-notice">
                        <p>Panorama image could not be loaded. Showing regular image instead.</p>
                    </div>
                </div>
            `;
        };
        
        img.src = currentImage;
        
        // Update navigation buttons
        this.updateNavigationButtons();
    },
    
    /**
     * Create hotspots for the current interior view
     */
    createHotspots: function() {
        const hotspotContainer = document.getElementById('hotspot-container');
        if (!hotspotContainer) return;
        
        // Clear existing hotspots
        hotspotContainer.innerHTML = '';
        
        // Get hotspots for current panorama
        const currentPanoramaName = this.config.interiorImages[this.state.currentInteriorIndex]
            .split('/')
            .pop()
            .replace('.jpg', '');
        
        const hotspots = this.config.hotspots[currentPanoramaName] || [];
        
        // Create hotspot elements
        hotspots.forEach((hotspot, index) => {
            const hotspotElement = document.createElement('div');
            hotspotElement.className = 'hotspot';
            hotspotElement.style.left = `${hotspot.position.x}%`;
            hotspotElement.style.top = `${hotspot.position.y}%`;
            
            hotspotElement.innerHTML = `
                <div class="hotspot-point"></div>
                <div class="hotspot-tooltip">
                    <h4>${hotspot.title}</h4>
                    <p>${hotspot.description}</p>
                    ${hotspot.navigateTo !== undefined ? '<button class="hotspot-nav-btn">Go Here</button>' : ''}
                </div>
            `;
            
            hotspotContainer.appendChild(hotspotElement);
            
            // Add navigation event if applicable
            if (hotspot.navigateTo !== undefined) {
                const navBtn = hotspotElement.querySelector('.hotspot-nav-btn');
                if (navBtn) {
                    navBtn.addEventListener('click', () => {
                        this.state.currentInteriorIndex = hotspot.navigateTo;
                        this.initInteriorView();
                    });
                }
            }
            
            // Toggle tooltip on hotspot click
            hotspotElement.querySelector('.hotspot-point').addEventListener('click', () => {
                const tooltip = hotspotElement.querySelector('.hotspot-tooltip');
                tooltip.classList.toggle('active');
                
                // Close other tooltips
                document.querySelectorAll('.hotspot-tooltip.active').forEach(activeTooltip => {
                    if (activeTooltip !== tooltip) {
                        activeTooltip.classList.remove('active');
                    }
                });
            });
        });
    },
    
    /**
     * Update hotspot positions when view changes
     */
    updateHotspotPositions: function() {
        // In a real implementation with a proper 3D panorama viewer,
        // this would recalculate hotspot positions based on the current view
    },
    
    /**
     * Update hotspot visibility based on current point of view
     */
    updateHotspotVisibility: function() {
        // In a real implementation with a proper 3D panorama viewer,
        // this would show/hide hotspots based on the current POV
    },
    
    /**
     * Create tour indicators
     */
    createTourIndicators: function() {
        if (!this.elements.tourIndicators) return;
        
        const totalViews = this.config.interiorImages.length + 1; // +1 for street view
        this.elements.tourIndicators.innerHTML = '';
        
        for (let i = 0; i < totalViews; i++) {
            const indicator = document.createElement('div');
            indicator.className = 'indicator';
            if ((i === 0 && this.state.currentView === 'street') || 
                (i > 0 && this.state.currentView === 'interior' && this.state.currentInteriorIndex === i - 1)) {
                indicator.classList.add('active');
            }
            
            this.elements.tourIndicators.appendChild(indicator);
            
            // Add click event to jump to that view
            indicator.addEventListener('click', () => {
                if (i === 0) {
                    this.switchToStreetView();
                } else {
                    this.state.currentInteriorIndex = i - 1;
                    this.switchToInteriorView();
                }
            });
        }
    },
    
    /**
     * Update tour indicators
     */
    updateTourIndicators: function() {
        if (!this.elements.tourIndicators) return;
        
        const indicators = this.elements.tourIndicators.querySelectorAll('.indicator');
        indicators.forEach((indicator, index) => {
            indicator.classList.remove('active');
            if ((index === 0 && this.state.currentView === 'street') || 
                (index > 0 && this.state.currentView === 'interior' && this.state.currentInteriorIndex === index - 1)) {
                indicator.classList.add('active');
            }
        });
    },
    
    /**
     * Update navigation buttons based on current state
     */
    updateNavigationButtons: function() {
        if (this.elements.prevButton) {
            this.elements.prevButton.disabled = this.state.currentView === 'street' || 
                (this.state.currentView === 'interior' && this.state.currentInteriorIndex === 0);
        }
        
        if (this.elements.nextButton) {
            this.elements.nextButton.disabled = 
                this.state.currentView === 'interior' && 
                this.state.currentInteriorIndex === this.config.interiorImages.length - 1;
        }
        
        if (this.elements.switchViewButton) {
            this.elements.switchViewButton.textContent = 
                this.state.currentView === 'street' ? 'View Clinic Interior' : 'View Street';
        }
    },
    
    /**
     * Open the virtual tour
     */
    openTour: function() {
        if (!this.state.isOpen) {
            // Show the tour container
            if (this.elements.tourContainer) {
                this.elements.tourContainer.classList.add('active');
                document.body.classList.add('tour-active');
            }
            
            // Initialize appropriate view
            if (this.state.currentView === 'street') {
                this.loadMapsAPI();
            } else {
                this.initInteriorView();
            }
            
            // Show place info panel if we have data
            if (this.elements.placeInfoPanel && (this.state.placeDetails || this.state.localClinicData)) {
                // Update panel with available data
                this.updatePlaceInfoPanel();
                
                // Show panel after a short delay to allow the tour to initialize
                setTimeout(() => {
                    this.elements.placeInfoPanel.classList.add('active');
                    
                    // Update toggle button text
                    if (this.elements.toggleInfoButton) {
                        this.elements.toggleInfoButton.textContent = 'Hide Info';
                    }
                }, 1000);
            }
            
            this.state.isOpen = true;
            
            // Create tour indicators
            this.createTourIndicators();
        }
    },
    
    /**
     * Close the virtual tour
     */
    closeTour: function() {
        if (this.state.isOpen) {
            // Hide the tour container
            if (this.elements.tourContainer) {
                this.elements.tourContainer.classList.remove('active');
                document.body.classList.remove('tour-active');
            }
            
            // Close any open dialogs
            this.closeCompletionDialog();
            
            this.state.isOpen = false;
        }
    },
    
    /**
     * Toggle between street and interior views
     */
    toggleView: function() {
        if (this.state.currentView === 'street') {
            this.switchToInteriorView();
        } else {
            this.switchToStreetView();
        }
    },
    
    /**
     * Switch to street view
     */
    switchToStreetView: function() {
        this.state.currentView = 'street';
        this.loadMapsAPI();
        this.updateNavigationButtons();
        this.updateTourIndicators();
    },
    
    /**
     * Switch to interior view
     */
    switchToInteriorView: function() {
        this.state.currentView = 'interior';
        this.initInteriorView();
        this.updateNavigationButtons();
        this.updateTourIndicators();
    },
    
    /**
     * Navigate to next interior panorama
     */
    nextInteriorPanorama: function() {
        if (this.state.currentView === 'street') {
            // If in street view, switch to first interior view
            this.switchToInteriorView();
        } else if (this.state.currentView === 'interior' && 
            this.state.currentInteriorIndex < this.config.interiorImages.length - 1) {
            this.state.currentInteriorIndex++;
            this.initInteriorView();
        }
    },
    
    /**
     * Navigate to previous interior panorama
     */
    prevInteriorPanorama: function() {
        if (this.state.currentView === 'interior' && this.state.currentInteriorIndex > 0) {
            this.state.currentInteriorIndex--;
            this.initInteriorView();
        } else if (this.state.currentView === 'interior' && this.state.currentInteriorIndex === 0) {
            // If at first interior view, go back to street view
            this.switchToStreetView();
        }
    },
    
    /**
     * Complete the tour and show dialog
     */
    completeTour: function() {
        if (this.elements.completionDialog) {
            this.elements.completionDialog.classList.add('active');
        }
    },
    
    /**
     * Handle book appointment action after tour
     */
    bookAppointment: function() {
        // Close the dialog
        this.closeCompletionDialog();
        
        // Close the tour
        this.closeTour();
        
        // Redirect to booking page
        window.location.href = 'booking.html';
    },
    
    /**
     * Close the completion dialog
     */
    closeCompletionDialog: function() {
        if (this.elements.completionDialog) {
            this.elements.completionDialog.classList.remove('active');
        }
    },
    
    /**
     * Toggle place info panel visibility
     */
    togglePlaceInfoPanel: function() {
        if (!this.elements.placeInfoPanel) return;
        
        this.elements.placeInfoPanel.classList.toggle('active');
        
        // If there's no content in the panel and we have place details, populate it
        if (this.elements.placeInfoPanel.innerHTML.trim() === '' && this.state.placeDetails) {
            this.updatePlaceInfoPanel();
        }
        
        // If we're showing the panel but don't have place details yet, fetch them
        if (this.elements.placeInfoPanel.classList.contains('active') && !this.state.placeDetails) {
            this.fetchPlaceDetails();
        }
        
        // Update button text
        if (this.elements.toggleInfoButton) {
            this.elements.toggleInfoButton.textContent = 
                this.elements.placeInfoPanel.classList.contains('active') ? 'Hide Info' : 'Clinic Info';
        }
    }
};

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on a page that needs the virtual tour
    if (document.getElementById('virtual-tour-button')) {
        VirtualTour.init();
    }
});

// Export for use with Google Maps callback
window.VirtualTour = VirtualTour;
window.VirtualTour.mapsCallback = VirtualTour.mapsCallback.bind(VirtualTour); 