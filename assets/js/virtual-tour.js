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
            position: { lat: 22.496391851463255, lng: 88.36915472944189 }, // Exact position for Wisdom Bites Dental Clinic
            pano: "fGMVDjDFNHlkGsTF-HuMoQ", // Specific panorama ID from the GMB link
            pov: { heading: 94.74961, pitch: 0 }, // Exact heading and pitch from the panorama
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
                    position: "22.496391851463255,88.36915472944189"
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
     * Handle Maps API error
     */
    handleMapsError: function() {
        this.hideLoading();
        
        console.error("Google Maps failed to load or encountered an error.");
        
        // Check console logs for API activation errors
        const isApiNotActivatedError = document.documentElement.innerHTML.includes('ApiNotActivatedMapError') || 
                                      document.documentElement.innerHTML.includes('This API project is not authorized');
        
        // Show error message in panorama view
        if (this.elements.panoramaView) {
            this.elements.panoramaView.innerHTML = `
                <div class="maps-error-notice">
                    <h3>Virtual Tour Unavailable</h3>
                    <p>We're experiencing technical difficulties with our virtual tour feature.</p>
                    ${isApiNotActivatedError ? 
                    `<p class="error-details">Error: Google Maps Places API is not activated for this API key. 
                     This feature requires the following APIs to be enabled in the Google Cloud Console:
                     <ul>
                        <li>Maps JavaScript API</li>
                        <li>Places API</li>
                        <li>Street View API</li>
                        <li>Geocoding API</li>
                     </ul>
                     </p>` : 
                    `<p class="error-details">Error: Google Maps API could not be initialized. This may be due to network issues.</p>`}
                    <div class="error-actions">
                        <button class="error-action-btn" id="try-interior-btn">View Interior Images Instead</button>
                        <button class="error-action-btn" id="try-static-map-btn">View Static Map</button>
                    </div>
                </div>
            `;
            
            // Add event listener to switch to interior view
            const tryInteriorBtn = document.getElementById('try-interior-btn');
            if (tryInteriorBtn) {
                tryInteriorBtn.addEventListener('click', this.switchToInteriorView.bind(this));
            }
            
            // Add event listener to show static map
            const tryStaticMapBtn = document.getElementById('try-static-map-btn');
            if (tryStaticMapBtn) {
                tryStaticMapBtn.addEventListener('click', this.useStaticMapFallback.bind(this));
            }
        }
        
        // Update buttons visibility
        this.updateNavigationButtons();
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
            
            // Try to fetch place details, but handle potential API activation errors
            this.fetchPlaceDetails();
        } catch (error) {
            console.warn('Could not initialize Maps services:', error);
            // Continue with the tour even if services fail
            // Use local data as a fallback
            if (this.state.localClinicData) {
                this.state.placeDetails = this.convertLocalDataToPlaceDetails(this.state.localClinicData);
                this.updatePlaceInfoPanel();
            }
        }
    },
    
    /**
     * Fetch place details using Places API
     */
    fetchPlaceDetails: function() {
        if (!this.state.placesService) {
            // If Places service isn't available, use local data
            if (this.state.localClinicData) {
                this.state.placeDetails = this.convertLocalDataToPlaceDetails(this.state.localClinicData);
                this.updatePlaceInfoPanel();
            }
            return;
        }
        
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
            } else {
                console.warn('Places API request failed with status:', status);
                console.log('Using local clinic data as fallback...');
                
                // Use local data as fallback
                if (this.state.localClinicData) {
                    this.state.placeDetails = this.convertLocalDataToPlaceDetails(this.state.localClinicData);
                    this.updatePlaceInfoPanel();
                }
                
                // If it's an API not enabled error, log helpful information
                if (status === 'REQUEST_DENIED') {
                    console.error('Places API request was denied. Please ensure Places API is enabled for your API key: https://console.cloud.google.com/apis/library/places-backend.googleapis.com');
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
     * Use Static Maps API as fallback
     */
    useStaticMapFallback: function() {
        if (!this.elements.panoramaView) return;
        
        // First try the embedded iframe from Google Maps directly
        // This is the most reliable fallback as it's directly from Google Maps with the exact location
        const embeddedMapHtml = `
            <div class="static-map-container">
                <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d230.38789888717423!2d88.36900519629518!3d22.496438625641858!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a027123b8369c11%3A0x680b559dbec9f1ac!2sWisdom%20Bites%20Dental%20Clinic%20-%20Best%20Dental%20Clinic%20in%20Jadavpur%20%7C%20Top%20Dentist%20%7C%20Best%20Dental%20Implants%20Clinic%20in%20Kolkata!5e0!3m2!1sen!2sin!4v1741070479092!5m2!1sen!2sin" 
                    width="100%" 
                    height="100%" 
                    style="border:0;" 
                    allowfullscreen="" 
                    loading="lazy" 
                    referrerpolicy="no-referrer-when-downgrade"
                    title="Map of Wisdom Bites Dental Clinic"
                    class="embedded-map">
                </iframe>
                <div class="static-map-overlay">
                    <p>Interactive Street View not available</p>
                    <button class="static-map-btn switch-interior-btn">View Interior Photos</button>
                </div>
            </div>
        `;
        
        this.elements.panoramaView.innerHTML = embeddedMapHtml;
        
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
            console.log("Initializing Street View for Wisdom Bites Dental Clinic...");
            
            // Check if Street View Service is available
            if (!google.maps.StreetViewPanorama) {
                console.error("Street View Panorama is not available. The API may not be activated.");
                this.switchToInteriorView();
                return;
            }
            
            // APPROACH 1: Most precise - Use the exact panorama ID directly
            // This guarantees we open the specific panorama view of the clinic
            if (this.config.panoramaOptions.pano) {
                console.log("Using specific panorama ID:", this.config.panoramaOptions.pano);
                
                this.state.panorama = new google.maps.StreetViewPanorama(
                    this.elements.panoramaView,
                    this.config.panoramaOptions
                );
                
                // Set up event listeners
                this.setupStreetViewEventListeners();
                this.hideLoading();
                
                // Add the entrance marker at our exact coordinates
                const exactPosition = new google.maps.LatLng(
                    this.config.panoramaOptions.position.lat,
                    this.config.panoramaOptions.position.lng
                );
                this.addEntranceMarker(exactPosition);
                
                // Show a confirmation message
                this.showEntrancePrompt("You are viewing Wisdom Bites Dental Clinic at 1/4A, North Road, Poddar Nagar, Jadavpur, Kolkata");
                return;
            }
            
            // APPROACH 2: Place ID-based lookup (used if panorama ID isn't available)
            console.log("Specific panorama ID not found, falling back to Place ID lookup");
            try {
                const sv = new google.maps.StreetViewService();
                const request = {
                    placeId: this.config.placeId,
                    radius: 50,
                    source: google.maps.StreetViewSource.DEFAULT
                };
                
                sv.getPanorama(request, (data, status) => {
                    if (status === google.maps.StreetViewStatus.OK) {
                        console.log("Successfully found Street View panorama using Place ID!");
                        
                        // Create panorama with the returned data
                        this.state.panorama = new google.maps.StreetViewPanorama(
                            this.elements.panoramaView,
                            {
                                pano: data.location.pano,
                                position: data.location.latLng,
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
                            }
                        );
                        
                        this.setupStreetViewEventListeners();
                        this.hideLoading();
                        
                        // Add the entrance marker
                        this.addEntranceMarker(data.location.latLng);
                    } else {
                        // APPROACH 3: Exact coordinates with small radius
                        console.warn("Could not find Street View panorama using Place ID. Status:", status);
                        console.log("Falling back to coordinate-based lookup...");
                        
                        this.fallbackToCoordinates();
                    }
                });
            } catch (error) {
                console.error("Error using Place ID lookup, possibly API not activated:", error);
                // Skip to coordinate lookup if Place ID lookup throws an error
                this.fallbackToCoordinates();
            }
            
        } catch (error) {
            console.error("Error initializing Street View:", error);
            this.handleMapsError();
        }
    },
    
    /**
     * Fallback to coordinates-based Street View lookup
     */
    fallbackToCoordinates: function() {
        try {
            const sv = new google.maps.StreetViewService();
            
            const exactPosition = new google.maps.LatLng(
                this.config.panoramaOptions.position.lat,
                this.config.panoramaOptions.position.lng
            );
            
            console.log("Using exact coordinates for Street View lookup");
            
            // Look up panorama by exact position with small radius
            sv.getPanoramaByLocation(exactPosition, 25, (data, status) => {
                if (status === google.maps.StreetViewStatus.OK) {
                    console.log("Successfully found Street View panorama using coordinates!");
                    
                    // Create panorama with the returned data
                    this.state.panorama = new google.maps.StreetViewPanorama(
                        this.elements.panoramaView,
                        {
                            pano: data.location.pano,
                            position: data.location.latLng,
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
                        }
                    );
                    
                    this.setupStreetViewEventListeners();
                    this.hideLoading();
                    
                    // Add entrance marker and guidance
                    this.addEntranceMarker(exactPosition);
                    this.showEntrancePrompt("Our clinic is nearby! Look for the marker.");
                } else {
                    // APPROACH 4: Embedded map as ultimate fallback
                    console.warn("Could not find any suitable Street View panorama. Showing map instead.");
                    this.useStaticMapFallback();
                }
            });
        } catch (error) {
            console.error("Error in coordinate-based Street View lookup:", error);
            this.useStaticMapFallback();
        }
    },
    
    /**
     * Set up event listeners for Street View
     */
    setupStreetViewEventListeners: function() {
        if (!this.state.panorama) return;
        
        // Add event listeners
        this.state.panorama.addListener('position_changed', () => {
            // Update hotspots or other UI elements based on new position
            this.checkForLocationUpdates();
        });
        
        this.state.panorama.addListener('pov_changed', () => {
            // Update UI based on point of view changes
            this.updateHotspotVisibility();
        });
        
        // Update UI
        this.updateNavigationButtons();
        this.createTourIndicators();
    },
    
    /**
     * Add marker for clinic entrance
     */
    addEntranceMarker: function(position) {
        if (!this.state.panorama || !google || !google.maps) return;
        
        // Use provided position or fall back to config position
        const entrancePosition = position || new google.maps.LatLng(
            this.config.panoramaOptions.position.lat,
            this.config.panoramaOptions.position.lng
        );
        
        // Create a custom marker
        const entranceMarker = new google.maps.marker.AdvancedMarkerElement({
            position: entrancePosition,
            map: this.state.panorama,
            title: 'Wisdom Bites Dental Clinic - Main Entrance',
            content: this.createEntranceMarkerElement()
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
        infoWindow.open({
            anchor: entranceMarker,
            map: this.state.panorama
        });
        
        // Close after a few seconds
        setTimeout(() => {
            infoWindow.close();
        }, 5000);
        
        return entranceMarker;
    },
    
    /**
     * Create a custom marker element for the entrance
     */
    createEntranceMarkerElement: function() {
        const markerElement = document.createElement('div');
        markerElement.style.width = '32px';
        markerElement.style.height = '32px';
        markerElement.style.backgroundImage = 'url(assets/images/entrance-marker.png)';
        markerElement.style.backgroundSize = 'contain';
        markerElement.style.backgroundRepeat = 'no-repeat';
        markerElement.style.backgroundPosition = 'center';
        return markerElement;
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
    },
    
    /**
     * Show an entrance prompt with custom message
     */
    showEntrancePrompt: function(message) {
        // Check if we already have a prompt
        let promptElement = document.getElementById('entrance-prompt');
        
        if (!promptElement) {
            // Create a new prompt element
            promptElement = document.createElement('div');
            promptElement.id = 'entrance-prompt';
            promptElement.className = 'entrance-prompt';
            this.elements.panoramaView.appendChild(promptElement);
        }
        
        // Set prompt message
        promptElement.innerHTML = `
            <div class="prompt-content">
                <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                    <path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                <p>${message}</p>
            </div>
        `;
        
        // Add active class after a short delay for animation
        setTimeout(() => {
            promptElement.classList.add('active');
        }, 100);
        
        // Hide prompt after 8 seconds
        setTimeout(() => {
            promptElement.classList.remove('active');
            
            // Remove element after animation finishes
            setTimeout(() => {
                if (promptElement.parentNode) {
                    promptElement.parentNode.removeChild(promptElement);
                }
            }, 500);
        }, 8000);
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