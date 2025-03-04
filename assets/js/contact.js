/**
 * Contact page specific functionality
 * Includes form validation and Google Maps integration
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize contact form validation
    initContactForm();
    
    // Initialize Google Maps
    loadGoogleMaps();
    
    // Add console logging for debugging
    console.log('Contact page scripts initialized');
    
    // Initialize the "Get Directions" button
    initDirectionsButton();
});

/**
 * Initialize the contact form validation
 */
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    
    if (!contactForm) {
        console.error('Contact form element not found');
        return;
    }
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Reset previous error messages
        const errorElements = document.querySelectorAll('.error-message');
        errorElements.forEach(el => el.remove());
        
        // Validate form
        let valid = true;
        
        // Name validation
        const nameInput = document.getElementById('name');
        if (!nameInput.value.trim()) {
            showError(nameInput, 'Please enter your name');
            valid = false;
        }
        
        // Email validation
        const emailInput = document.getElementById('email');
        if (!validateEmail(emailInput.value)) {
            showError(emailInput, 'Please enter a valid email address');
            valid = false;
        }
        
        // Phone validation (optional but should be valid if provided)
        const phoneInput = document.getElementById('phone');
        if (phoneInput.value.trim() && !validatePhone(phoneInput.value)) {
            showError(phoneInput, 'Please enter a valid phone number');
            valid = false;
        }
        
        // Message validation
        const messageInput = document.getElementById('message');
        if (!messageInput.value.trim()) {
            showError(messageInput, 'Please enter your message');
            valid = false;
        }
        
        // Submit the form if valid
        if (valid) {
            // In a real application, you would submit the form here
            // For demo purposes, show a success message
            const formWrapper = contactForm.closest('.form-wrapper');
            const successMessage = document.createElement('div');
            successMessage.className = 'success-message';
            successMessage.textContent = 'Your message has been sent. We will get back to you soon!';
            
            formWrapper.innerHTML = '';
            formWrapper.appendChild(successMessage);
            
            // Log success for debugging
            console.log('Form submitted successfully');
        }
    });
    
    console.log('Contact form validation initialized');
}

// Business data for Google Maps integration
const businessData = {
    name: "Wisdom Bites Dental Clinic",
    placeId: "ChIJEZw2uCNxAjoRrPHJvp1VC2g", // From virtual-tour.js
    coordinates: { 
        lat: 22.496391851463255,  // From virtual-tour.js exact coordinates
        lng: 88.36915472944189
    },
    address: "123 Dental Avenue, Smile City, SC 12345", // From contact.html schema
    phone: "+1 (555) 123-4567", // From contact.html
    website: "https://wisdombites.com",
    hours: [
        "Monday - Friday: 9:00 AM - 6:00 PM",
        "Saturday: 10:00 AM - 3:00 PM",
        "Sunday: Closed"
    ],
    panoramaId: "fGMVDjDFNHlkGsTF-HuMoQ" // Specific panorama ID from virtual-tour.js
};

/**
 * Load Google Maps API and initialize the map
 */
function loadGoogleMaps() {
    // Check if map container exists
    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
        console.error('Map container element not found');
        return;
    }
    
    // Check if Google Maps API is already loaded
    if (typeof google === 'undefined' || typeof google.maps === 'undefined') {
        // Load the Google Maps API
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDY7pn8Bkb9dxMKX6pKgldH1a2acVjmWsw&libraries=places&callback=initMap`;
        script.async = true;
        script.defer = true;
        script.onerror = function() {
            console.error('Failed to load Google Maps API');
            mapContainer.innerHTML = '<div class="map-error">Unable to load the map. Please try again later.</div>';
        };
        
        // Add the script to the document
        document.head.appendChild(script);
        
        console.log('Google Maps API script added to page');
    } else {
        // If already loaded, just initialize the map
        initMap();
    }
}

/**
 * Initialize the Google Map
 * This function must be in the global scope as it's used as a callback
 */
window.initMap = function() {
    console.log('Initializing Google Map');
    
    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
        console.error('Map container not found');
        return;
    }
    
    try {
        // Use the business data coordinates
        const dentalPracticeLocation = businessData.coordinates;
        
        // Create the map
        const map = new google.maps.Map(mapContainer, {
            center: dentalPracticeLocation,
            zoom: 15,
            mapId: 'DEMO_MAP_ID', // Replace with your actual Map ID if using Cloud-based maps
            mapTypeControl: false,
            fullscreenControl: true,
            streetViewControl: true,
            zoomControl: true,
            styles: [
                {
                    "featureType": "administrative",
                    "elementType": "all",
                    "stylers": [{"saturation": "-100"}]
                },
                {
                    "featureType": "administrative.province",
                    "elementType": "all",
                    "stylers": [{"visibility": "off"}]
                },
                {
                    "featureType": "landscape",
                    "elementType": "all",
                    "stylers": [{"saturation": -100}, {"lightness": 65}, {"visibility": "on"}]
                },
                {
                    "featureType": "poi",
                    "elementType": "all",
                    "stylers": [{"saturation": -100}, {"lightness": "50"}, {"visibility": "simplified"}]
                },
                {
                    "featureType": "road",
                    "elementType": "all",
                    "stylers": [{"saturation": "-100"}]
                },
                {
                    "featureType": "road.highway",
                    "elementType": "all",
                    "stylers": [{"visibility": "simplified"}]
                },
                {
                    "featureType": "road.arterial",
                    "elementType": "all",
                    "stylers": [{"lightness": "30"}]
                },
                {
                    "featureType": "road.local",
                    "elementType": "all",
                    "stylers": [{"lightness": "40"}]
                },
                {
                    "featureType": "transit",
                    "elementType": "all",
                    "stylers": [{"saturation": -100}, {"visibility": "simplified"}]
                },
                {
                    "featureType": "water",
                    "elementType": "geometry",
                    "stylers": [{"hue": "#ffff00"}, {"lightness": -25}, {"saturation": -97}]
                },
                {
                    "featureType": "water",
                    "elementType": "labels",
                    "stylers": [{"lightness": -25}, {"saturation": -100}]
                }
            ]
        });
        
        // Try to use Place ID first
        if (businessData.placeId) {
            console.log(`Using Place ID: ${businessData.placeId}`);
            const placesService = new google.maps.places.PlacesService(map);
            placesService.getDetails({
                placeId: businessData.placeId,
                fields: ['name', 'formatted_address', 'geometry', 'formatted_phone_number', 'opening_hours', 'website']
            }, function(place, status) {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    console.log('Successfully retrieved place details');
                    
                    // Update map center with actual place location
                    if (place.geometry && place.geometry.location) {
                        map.setCenter(place.geometry.location);
                    }
                    
                    // Create info window with place details
                    const infoContent = `
                        <div class="info-window">
                            <h3>${place.name || businessData.name}</h3>
                            <p>${place.formatted_address || businessData.address}</p>
                            <p><a href="tel:${place.formatted_phone_number || businessData.phone}">${place.formatted_phone_number || businessData.phone}</a></p>
                            <p><a href="${place.website || businessData.website}" target="_blank">Visit Website</a></p>
                        </div>
                    `;
                    
                    // Create the marker
                    createMarker(map, place.geometry ? place.geometry.location : dentalPracticeLocation, infoContent);
                } else {
                    console.warn(`Place details request failed: ${status}`);
                    // Fallback to using coordinates and business data
                    createMarker(map, dentalPracticeLocation, getDefaultInfoContent());
                }
            });
        } else {
            // Fallback to using coordinates directly
            console.log('Using coordinates directly');
            createMarker(map, dentalPracticeLocation, getDefaultInfoContent());
        }
        
        console.log('Google Map initialized successfully');
        
    } catch (error) {
        console.error('Error initializing Google Map:', error);
        mapContainer.innerHTML = '<div class="map-error">There was an error loading the map. Please try again later.</div>';
    }
};

/**
 * Create marker with info window
 */
function createMarker(map, position, infoContent) {
    // Check if Advanced Markers are available
    if (google.maps.marker && google.maps.marker.AdvancedMarkerElement) {
        console.log('Using AdvancedMarkerElement');
        
        // Create an advanced marker
        const advancedMarkerElement = new google.maps.marker.AdvancedMarkerElement({
            map: map,
            position: position,
            title: businessData.name,
            content: new google.maps.marker.PinElement({
                glyph: "D",
                glyphColor: "#FFFFFF",
                background: "#4a90e2",
                borderColor: "#3a7abd"
            }).element
        });
        
        // Create info window
        const infoWindow = new google.maps.InfoWindow({
            content: infoContent
        });
        
        // Add click event for info window
        advancedMarkerElement.addListener('click', function() {
            infoWindow.open(map, advancedMarkerElement);
        });
        
        // Open info window by default
        infoWindow.open(map, advancedMarkerElement);
    } else {
        console.log('AdvancedMarkerElement not available, using standard Marker');
        
        // Create a standard marker as fallback
        const marker = new google.maps.Marker({
            position: position,
            map: map,
            title: businessData.name,
            animation: google.maps.Animation.DROP
        });
        
        // Add info window to the marker
        const infoWindow = new google.maps.InfoWindow({
            content: infoContent
        });
        
        marker.addListener('click', function() {
            infoWindow.open(map, marker);
        });
        
        // Open info window by default
        infoWindow.open(map, marker);
    }
}

/**
 * Get default info window content using business data
 */
function getDefaultInfoContent() {
    return `
        <div class="info-window">
            <h3>${businessData.name}</h3>
            <p>${businessData.address}</p>
            <p><a href="tel:${businessData.phone.replace(/\s/g, '')}">${businessData.phone}</a></p>
            <p><a href="${businessData.website}" target="_blank">Visit Website</a></p>
            <div class="hours">
                <p><strong>Hours:</strong></p>
                <ul>
                    ${businessData.hours.map(hour => `<li>${hour}</li>`).join('')}
                </ul>
            </div>
        </div>
    `;
}

/**
 * Helper function to show error messages
 */
function showError(inputElement, message) {
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.textContent = message;
    
    inputElement.parentNode.appendChild(errorMessage);
    inputElement.classList.add('error');
    
    // Log error for debugging
    console.error(`Validation error: ${message}`);
}

/**
 * Helper function to validate email
 */
function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

/**
 * Helper function to validate phone
 */
function validatePhone(phone) {
    const re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    return re.test(String(phone));
}

/**
 * Initialize the Get Directions button functionality
 */
function initDirectionsButton() {
    const directionsButton = document.querySelector('.get-directions-btn');
    
    if (!directionsButton) {
        console.error('Get Directions button not found');
        return;
    }
    
    // Remove the hardcoded URL and add a click event listener
    directionsButton.setAttribute('href', '#');
    directionsButton.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Check if Google Maps is loaded
        if (typeof google === 'undefined' || typeof google.maps === 'undefined') {
            console.error('Google Maps not loaded');
            alert('Unable to get directions. Please try again later.');
            return;
        }
        
        // Try to get user's current location
        if (navigator.geolocation) {
            console.log('Getting user location for directions');
            directionsButton.textContent = 'Getting your location...';
            directionsButton.disabled = true;
            
            navigator.geolocation.getCurrentPosition(
                function(position) {
                    // Success - user allowed location access
                    const userLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    
                    console.log('User location obtained:', userLocation);
                    openDirections(userLocation);
                    
                    // Reset button
                    directionsButton.textContent = 'Get Directions';
                    directionsButton.disabled = false;
                },
                function(error) {
                    // Error or user denied location access
                    console.error('Geolocation error:', error);
                    
                    // Open directions without start location
                    openDirections(null);
                    
                    // Reset button
                    directionsButton.textContent = 'Get Directions';
                    directionsButton.disabled = false;
                }
            );
        } else {
            // Geolocation not supported
            console.warn('Geolocation not supported by this browser');
            openDirections(null);
        }
    });
    
    console.log('Get Directions button initialized');
}

/**
 * Open Google Maps directions
 * @param {Object|null} startLocation - User's location or null if unavailable
 */
function openDirections(startLocation) {
    try {
        // First try to use place ID if available
        let directionsUrl;
        
        if (businessData.placeId) {
            directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(businessData.name)}&destination_place_id=${businessData.placeId}`;
        } else {
            // Fallback to coordinates
            const destination = `${businessData.coordinates.lat},${businessData.coordinates.lng}`;
            directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
        }
        
        // Add origin if we have the user's location
        if (startLocation) {
            directionsUrl += `&origin=${startLocation.lat},${startLocation.lng}`;
        }
        
        // Add travel mode
        directionsUrl += `&travelmode=driving`;
        
        console.log('Opening directions URL:', directionsUrl);
        
        // Open directions in a new tab
        const newWindow = window.open(directionsUrl, '_blank');
        
        // Check if popup was blocked
        if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
            console.warn('Popup blocked or failed to open');
            // Provide a message and fallback option
            const mapOverlay = document.querySelector('.map-overlay');
            if (mapOverlay) {
                const fallbackMsg = document.createElement('div');
                fallbackMsg.className = 'directions-fallback';
                fallbackMsg.innerHTML = `
                    <p>Your browser blocked the popup. Please click the link below:</p>
                    <a href="${directionsUrl}" target="_blank" class="btn btn-sm btn-primary">Open Directions</a>
                `;
                mapOverlay.appendChild(fallbackMsg);
                
                // Remove the message after 10 seconds
                setTimeout(() => {
                    if (fallbackMsg.parentNode) {
                        fallbackMsg.parentNode.removeChild(fallbackMsg);
                    }
                }, 10000);
            }
        }
    } catch (error) {
        console.error('Error opening directions:', error);
        alert('Unable to open directions. Please try again later.');
    }
} 