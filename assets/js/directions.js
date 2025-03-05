/**
 * Wisdom Bites Dental Clinic - Directions Page JavaScript
 * This file handles all map and directions functionality for the directions page
 */

document.addEventListener('DOMContentLoaded', function() {
    // Check if user has a valid booking before showing directions
    checkBookingStatus();
    
    // Initialize directions form event listeners
    initDirectionsForm();
    
    // Initialize map controls
    initMapControls();
});

/**
 * Check if the user has a valid booking before allowing access to directions
 * Uses localStorage to verify if a booking was made
 */
function checkBookingStatus() {
    const hasBooking = localStorage.getItem('wbdc_has_booking');
    const appointmentDetailsStr = localStorage.getItem('wbdc_appointment_details');
    let appointmentDetails = null;
    
    // Parse appointment details if available
    if (appointmentDetailsStr) {
        try {
            appointmentDetails = JSON.parse(appointmentDetailsStr);
        } catch (e) {
            console.error('Failed to parse appointment details:', e);
        }
    }
    
    const accessDeniedContainer = document.getElementById('access-denied-container');
    const directionsContent = document.getElementById('directions-content');
    
    if (hasBooking !== 'true') {
        // User has not made a booking, show access denied message
        if (accessDeniedContainer) accessDeniedContainer.style.display = 'block';
        if (directionsContent) directionsContent.style.display = 'none';
    } else {
        // User has made a booking, show directions content
        if (accessDeniedContainer) accessDeniedContainer.style.display = 'none';
        if (directionsContent) directionsContent.style.display = 'block';
        
        // Add appointment details to the page if available
        if (appointmentDetails) {
            const infoCards = document.querySelector('.directions-info');
            if (infoCards) {
                const appointmentCard = document.createElement('div');
                appointmentCard.className = 'info-card appointment-info';
                appointmentCard.innerHTML = `
                    <h3>Your Appointment</h3>
                    <div class="appointment-details">
                        ${appointmentDetails.name ? `<p><strong>Name:</strong> ${appointmentDetails.name}</p>` : ''}
                        ${appointmentDetails.service ? `<p><strong>Service:</strong> ${appointmentDetails.service}</p>` : ''}
                        ${appointmentDetails.datetime ? `<p><strong>Date & Time:</strong> ${appointmentDetails.datetime}</p>` : ''}
                    </div>
                `;
                
                // Insert as the first card
                infoCards.insertBefore(appointmentCard, infoCards.firstChild);
            }
        }
        
        // Initialize Google Maps
        loadGoogleMapsScript();
    }
}

/**
 * Load Google Maps API script asynchronously
 */
function loadGoogleMapsScript() {
    // Show fallback map until Google Maps is loaded
    const mapFallback = document.getElementById('map-fallback');
    if (mapFallback) mapFallback.style.display = 'block';
    
    // Use the same API key as in contact.js
    const apiKey = 'AIzaSyDY7pn8Bkb9dxMKX6pKgldH1a2acVjmWsw';
    
    // Create script element for Google Maps API
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initMap`;
    script.async = true;
    script.defer = true;
    
    // Add error handling
    script.onerror = function() {
        console.error('Failed to load Google Maps API. Please check your API key and ensure the necessary APIs are enabled.');
        
        // Show error in the fallback container
        const mapFallback = document.getElementById('map-fallback');
        if (mapFallback) {
            mapFallback.innerHTML = `
                <div class="api-error-message">
                    <i class="icon icon-warning"></i>
                    <h3>Unable to load Google Maps</h3>
                    <p>We're having trouble loading the interactive map. This could be due to:</p>
                    <ul>
                        <li>Missing or invalid API key</li>
                        <li>Network connectivity issues</li>
                        <li>Required Google Maps APIs not being enabled</li>
                    </ul>
                    <p>In the meantime, you can use the link below to get directions:</p>
                    <a href="https://maps.google.com/?q=Wisdom+Bites+Dental+Clinic,+123+Dental+Avenue,+Smile+City,+SC+12345" 
                       target="_blank" rel="noopener noreferrer" class="btn btn-primary">
                       Open in Google Maps
                    </a>
                </div>
            `;
        }
    };
    
    document.head.appendChild(script);
}

// Global variables for map, directions service, and renderer
let map;
let directionsService;
let directionsRenderer;
let streetViewService;
let panorama;
let clinicPosition;
let markers = [];
let waypoints = [];
let travelMode = 'DRIVING';

/**
 * Initialize Google Map after API is loaded
 * This function is called by the Google Maps API as a callback
 */
function initMap() {
    // Hide fallback map
    const mapFallback = document.getElementById('map-fallback');
    if (mapFallback) mapFallback.style.display = 'none';
    
    // Define clinic details (should match address in the form)
    const clinicAddress = "Wisdom Bites Dental Clinic, 123 Dental Avenue, Smile City, SC 12345";
    clinicPosition = { lat: 40.7128, lng: -74.0060 }; // Replace with actual coordinates
    
    // Update destination field with consistent clinic address
    const destinationInput = document.getElementById('destination');
    if (destinationInput) {
        destinationInput.value = clinicAddress;
    }
    
    // Initialize map
    map = new google.maps.Map(document.getElementById('map'), {
        center: clinicPosition,
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: true,
        mapTypeControlOptions: {
            position: google.maps.ControlPosition.TOP_LEFT
        },
        fullscreenControl: true,
        streetViewControl: false, // We'll handle street view with our custom button
        zoomControl: true,
        zoomControlOptions: {
            position: google.maps.ControlPosition.LEFT_BOTTOM
        }
    });
    
    // Apply custom styles to the map for better aesthetics
    map.setOptions({
        styles: [
            { elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
            { elementType: 'labels.text.stroke', stylers: [{ color: '#f5f5f5' }] },
            { elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
            {
                featureType: 'administrative.land_parcel',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#bdbdbd' }]
            },
            {
                featureType: 'poi',
                elementType: 'geometry',
                stylers: [{ color: '#eeeeee' }]
            },
            {
                featureType: 'poi',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#757575' }]
            },
            {
                featureType: 'poi.park',
                elementType: 'geometry',
                stylers: [{ color: '#e5e5e5' }]
            },
            {
                featureType: 'poi.park',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#9e9e9e' }]
            },
            {
                featureType: 'road',
                elementType: 'geometry',
                stylers: [{ color: '#ffffff' }]
            },
            {
                featureType: 'road.arterial',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#757575' }]
            },
            {
                featureType: 'road.highway',
                elementType: 'geometry',
                stylers: [{ color: '#dadada' }]
            },
            {
                featureType: 'road.highway',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#616161' }]
            },
            {
                featureType: 'road.local',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#9e9e9e' }]
            },
            {
                featureType: 'transit.line',
                elementType: 'geometry',
                stylers: [{ color: '#e5e5e5' }]
            },
            {
                featureType: 'transit.station',
                elementType: 'geometry',
                stylers: [{ color: '#eeeeee' }]
            },
            {
                featureType: 'water',
                elementType: 'geometry',
                stylers: [{ color: '#c9c9c9' }]
            },
            {
                featureType: 'water',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#9e9e9e' }]
            }
        ]
    });
    
    // Initialize services
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({
        map: map,
        suppressMarkers: false,
        preserveViewport: false,
        polylineOptions: {
            strokeColor: '#4a90e2',
            strokeWeight: 5,
            strokeOpacity: 0.7
        }
    });
    
    // Set directions panel
    directionsRenderer.setPanel(document.getElementById('directions-panel'));
    
    // Initialize Street View services
    streetViewService = new google.maps.StreetViewService();
    panorama = new google.maps.StreetViewPanorama(
        document.getElementById('street-view'),
        {
            position: clinicPosition,
            pov: { heading: 0, pitch: 0 },
            zoom: 1,
            addressControl: true,
            linksControl: true,
            enableCloseButton: true
        }
    );
    
    // Add a marker for the dental clinic
    const clinicMarker = createMarker(map, clinicPosition, "Wisdom Bites Dental Clinic", true);
    markers.push(clinicMarker);
    
    // Initialize autocomplete for origin input
    initAutocomplete();
    
    // Update static map with styled fallback
    updateStaticMap(clinicPosition);
}

/**
 * Initialize autocomplete for the origin input field
 */
function initAutocomplete() {
    const originInput = document.getElementById('origin');
    if (originInput) {
        const autocomplete = new google.maps.places.Autocomplete(originInput, {
            types: ['geocode']
        });
        
        // Bind autocomplete to the map
        autocomplete.bindTo('bounds', map);
        
        // Listen for place selection
        autocomplete.addListener('place_changed', function() {
            const place = autocomplete.getPlace();
            
            if (!place.geometry) {
                console.error("No details available for: " + place.name);
                return;
            }
            
            // If the place has a geometry, center the map on it
            if (place.geometry.viewport) {
                map.fitBounds(place.geometry.viewport);
            } else {
                map.setCenter(place.geometry.location);
                map.setZoom(17);
            }
        });
    }
    
    // Add autocomplete to any dynamically added waypoint inputs
    const waypointInputs = document.querySelectorAll('.waypoint-input');
    waypointInputs.forEach(input => {
        new google.maps.places.Autocomplete(input, {
            types: ['geocode']
        });
    });
}

/**
 * Create a marker on the map
 * @param {Object} map - The Google Map object
 * @param {Object} position - Lat/lng position
 * @param {string} title - Marker title
 * @param {boolean} isClinic - Whether this marker is for the clinic
 * @returns {Object} The created marker
 */
function createMarker(map, position, title, isClinic = false) {
    const marker = new google.maps.Marker({
        position: position,
        map: map,
        title: title,
        animation: google.maps.Animation.DROP,
        icon: isClinic ? {
            url: 'assets/images/marker-clinic.png',
            scaledSize: new google.maps.Size(40, 40)
        } : null
    });
    
    // Create info window content
    const infoContent = isClinic 
        ? getClinicInfoContent() 
        : `<div class="info-window"><h4>${title}</h4></div>`;
    
    // Create info window
    const infoWindow = new google.maps.InfoWindow({
        content: infoContent
    });
    
    // Open info window when marker is clicked
    marker.addListener('click', function() {
        infoWindow.open(map, marker);
    });
    
    // If it's the clinic marker, open info window by default
    if (isClinic) {
        infoWindow.open(map, marker);
    }
    
    return marker;
}

/**
 * Get info window content for the clinic marker
 * @returns {string} HTML content for info window
 */
function getClinicInfoContent() {
    return `
        <div class="info-window clinic-info">
            <h4>Wisdom Bites Dental Clinic</h4>
            <address>
                123 Dental Avenue<br>
                Smile City, SC 12345
            </address>
            <p><strong>Phone:</strong> <a href="tel:+15551234567">(555) 123-4567</a></p>
            <p><strong>Hours:</strong> Mon-Fri 9AM-6PM, Sat 10AM-3PM</p>
            <button class="btn btn-sm btn-primary street-view-btn">See Street View</button>
        </div>
    `;
}

/**
 * Initialize the directions form and attach event listeners
 */
function initDirectionsForm() {
    const directionsForm = document.getElementById('directionsForm');
    const addWaypointBtn = document.getElementById('add-waypoint');
    const optimizeRouteBtn = document.getElementById('optimize-route');
    const useMyLocationBtn = document.getElementById('use-my-location');
    const travelModeButtons = document.querySelectorAll('.travel-mode-btn');
    
    // Add event listener for form submission
    if (directionsForm) {
        directionsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            calculateAndDisplayRoute();
        });
    }
    
    // Add event listener for travel mode selection
    if (travelModeButtons) {
        travelModeButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Remove active class from all buttons
                travelModeButtons.forEach(btn => btn.classList.remove('active'));
                
                // Add active class to clicked button
                this.classList.add('active');
                
                // Update travel mode
                travelMode = this.getAttribute('data-mode');
                
                // If directions are already displayed, recalculate with new travel mode
                if (directionsRenderer.getDirections()) {
                    calculateAndDisplayRoute();
                }
            });
        });
    }
    
    // Add event listener for "Add Stop" button
    if (addWaypointBtn) {
        addWaypointBtn.addEventListener('click', addWaypoint);
    }
    
    // Add event listener for "Optimize Route" button
    if (optimizeRouteBtn) {
        optimizeRouteBtn.addEventListener('click', function() {
            calculateAndDisplayRoute(true);
        });
    }
    
    // Add event listener for "Use My Location" button
    if (useMyLocationBtn) {
        useMyLocationBtn.addEventListener('click', function() {
            if (navigator.geolocation) {
                useMyLocationBtn.innerHTML = '<i class="icon icon-loading"></i> Getting location...';
                useMyLocationBtn.disabled = true;
                
                navigator.geolocation.getCurrentPosition(
                    // Success callback
                    function(position) {
                        const originInput = document.getElementById('origin');
                        
                        // Reverse geocode to get address
                        const geocoder = new google.maps.Geocoder();
                        const latlng = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        };
                        
                        geocoder.geocode({ 'location': latlng }, function(results, status) {
                            if (status === 'OK') {
                                if (results[0]) {
                                    originInput.value = results[0].formatted_address;
                                } else {
                                    originInput.value = position.coords.latitude + ',' + position.coords.longitude;
                                }
                            } else {
                                originInput.value = position.coords.latitude + ',' + position.coords.longitude;
                            }
                            
                            useMyLocationBtn.innerHTML = '<i class="icon icon-location"></i> Use My Location';
                            useMyLocationBtn.disabled = false;
                        });
                    },
                    // Error callback
                    function(error) {
                        console.error('Error getting user location:', error);
                        alert('Unable to retrieve your location. Please enter your address manually.');
                        useMyLocationBtn.innerHTML = '<i class="icon icon-location"></i> Use My Location';
                        useMyLocationBtn.disabled = false;
                    }
                );
            } else {
                alert('Geolocation is not supported by your browser. Please enter your address manually.');
            }
        });
    }
}

/**
 * Add a new waypoint input to the form
 */
function addWaypoint() {
    const intermediateWaypoints = document.getElementById('intermediate-waypoints');
    const waypointId = 'waypoint-' + (intermediateWaypoints.children.length + 1);
    
    // Create new waypoint container
    const waypointContainer = document.createElement('div');
    waypointContainer.className = 'waypoint-container';
    waypointContainer.id = waypointId + '-container';
    
    // Create waypoint content
    waypointContainer.innerHTML = `
        <div class="form-group">
            <label for="${waypointId}">Stop ${intermediateWaypoints.children.length + 1}</label>
            <input type="text" id="${waypointId}" class="waypoint-input" name="${waypointId}" placeholder="Enter location" required>
            <div class="waypoint-controls">
                <button type="button" class="waypoint-btn remove-waypoint" data-waypoint="${waypointId}">
                    <i class="icon icon-trash"></i> Remove
                </button>
            </div>
        </div>
    `;
    
    // Add waypoint to the form
    intermediateWaypoints.appendChild(waypointContainer);
    
    // Initialize autocomplete for the new waypoint
    const waypointInput = document.getElementById(waypointId);
    new google.maps.places.Autocomplete(waypointInput, {
        types: ['geocode']
    });
    
    // Add event listener for remove button
    const removeBtn = waypointContainer.querySelector('.remove-waypoint');
    removeBtn.addEventListener('click', function() {
        intermediateWaypoints.removeChild(waypointContainer);
        
        // Renumber the remaining waypoints
        const remainingWaypoints = intermediateWaypoints.querySelectorAll('.waypoint-container');
        remainingWaypoints.forEach((container, index) => {
            const label = container.querySelector('label');
            label.textContent = 'Stop ' + (index + 1);
        });
    });
}

/**
 * Calculate and display route based on form inputs
 * @param {boolean} optimizeWaypoints - Whether to optimize waypoint order
 */
function calculateAndDisplayRoute(optimizeWaypoints = false) {
    const originInput = document.getElementById('origin');
    const destinationInput = document.getElementById('destination');
    
    if (!originInput || !destinationInput) {
        console.error('Origin or destination input not found');
        return;
    }
    
    const origin = originInput.value;
    const destination = destinationInput.value;
    
    if (!origin || !destination) {
        alert('Please enter both origin and destination.');
        return;
    }
    
    // Collect waypoints
    const waypointInputs = document.querySelectorAll('.waypoint-input');
    const waypoints = [];
    
    waypointInputs.forEach(input => {
        if (input.value) {
            waypoints.push({
                location: input.value,
                stopover: true
            });
        }
    });
    
    // Set up request object for directions service
    const request = {
        origin: origin,
        destination: destination,
        waypoints: waypoints,
        optimizeWaypoints: optimizeWaypoints,
        travelMode: google.maps.TravelMode[travelMode],
        unitSystem: google.maps.UnitSystem.IMPERIAL, // Use METRIC for kilometers
        provideRouteAlternatives: true,
        avoidTolls: false,
        avoidHighways: false,
        avoidFerries: false
    };
    
    // Call the directions service
    directionsService.route(request, function(response, status) {
        if (status === 'OK') {
            // Display the route
            directionsRenderer.setDirections(response);
            
            // If waypoints were optimized, update the UI to reflect the new order
            if (optimizeWaypoints && response.routes[0].waypoint_order.length > 0) {
                rearrangeWaypointInputs(response.routes[0].waypoint_order);
            }
            
            // Show route summary
            const route = response.routes[0];
            const directionsPanel = document.getElementById('directions-panel');
            
            if (directionsPanel) {
                // Calculate total distance and duration
                let totalDistance = 0;
                let totalDuration = 0;
                
                route.legs.forEach(leg => {
                    totalDistance += leg.distance.value;
                    totalDuration += leg.duration.value;
                });
                
                // Convert to appropriate units
                const distanceInMiles = (totalDistance / 1609.34).toFixed(1);
                const durationInMinutes = Math.round(totalDuration / 60);
                
                // Create summary element
                const summary = document.createElement('div');
                summary.className = 'route-summary';
                summary.innerHTML = `
                    <h3>Route Summary</h3>
                    <div class="summary-details">
                        <p><strong>Distance:</strong> ${distanceInMiles} miles</p>
                        <p><strong>Estimated Time:</strong> ${durationInMinutes} minutes</p>
                        <p><strong>Travel Mode:</strong> ${travelMode.charAt(0) + travelMode.slice(1).toLowerCase()}</p>
                    </div>
                `;
                
                // Add to directions panel before the step-by-step directions
                directionsPanel.prepend(summary);
            }
        } else {
            console.error('Directions request failed due to ' + status);
            alert('Unable to calculate directions. Please check your inputs and try again.');
        }
    });
}

/**
 * Rearrange waypoint inputs to match the optimized order
 * @param {Array} waypointOrder - Array of indices representing the optimized order
 */
function rearrangeWaypointInputs(waypointOrder) {
    const intermediateWaypoints = document.getElementById('intermediate-waypoints');
    const waypointContainers = Array.from(intermediateWaypoints.querySelectorAll('.waypoint-container'));
    
    if (waypointContainers.length !== waypointOrder.length) {
        console.error('Waypoint count mismatch');
        return;
    }
    
    // Remove all waypoint containers from the DOM
    waypointContainers.forEach(container => {
        intermediateWaypoints.removeChild(container);
    });
    
    // Add them back in the optimized order
    waypointOrder.forEach((index, newIndex) => {
        const container = waypointContainers[index];
        const label = container.querySelector('label');
        label.textContent = 'Stop ' + (newIndex + 1);
        intermediateWaypoints.appendChild(container);
    });
    
    // Add a notification that the route has been optimized
    const notification = document.createElement('div');
    notification.className = 'optimization-notice';
    notification.innerHTML = '<p><i class="icon icon-check"></i> Route has been optimized for efficiency.</p>';
    
    const existingNotice = intermediateWaypoints.querySelector('.optimization-notice');
    if (existingNotice) {
        intermediateWaypoints.removeChild(existingNotice);
    }
    
    intermediateWaypoints.prepend(notification);
    
    // Fade out the notification after 5 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            if (notification.parentNode) {
                intermediateWaypoints.removeChild(notification);
            }
        }, 500);
    }, 5000);
}

/**
 * Initialize map control buttons (Street View, Traffic, Reset)
 */
function initMapControls() {
    const toggleStreetViewBtn = document.getElementById('toggle-street-view');
    const toggleTrafficBtn = document.getElementById('toggle-traffic');
    const resetMapBtn = document.getElementById('reset-map');
    
    if (toggleStreetViewBtn) {
        toggleStreetViewBtn.addEventListener('click', function() {
            const streetViewContainer = document.getElementById('street-view');
            
            if (streetViewContainer.style.display === 'block') {
                // Hide street view
                streetViewContainer.style.display = 'none';
                toggleStreetViewBtn.innerHTML = '<i class="icon icon-street-view"></i> Street View';
                toggleStreetViewBtn.classList.remove('active');
            } else {
                // Show street view
                streetViewContainer.style.display = 'block';
                toggleStreetViewBtn.innerHTML = '<i class="icon icon-close"></i> Close Street View';
                toggleStreetViewBtn.classList.add('active');
                
                // Check if we need to initialize street view
                checkStreetView(clinicPosition);
            }
        });
    }
    
    if (toggleTrafficBtn) {
        let trafficLayer = null;
        
        toggleTrafficBtn.addEventListener('click', function() {
            if (trafficLayer) {
                // Hide traffic
                trafficLayer.setMap(null);
                trafficLayer = null;
                toggleTrafficBtn.classList.remove('active');
            } else {
                // Show traffic
                trafficLayer = new google.maps.TrafficLayer();
                trafficLayer.setMap(map);
                toggleTrafficBtn.classList.add('active');
            }
        });
    }
    
    if (resetMapBtn) {
        resetMapBtn.addEventListener('click', function() {
            // Reset map view
            map.setCenter(clinicPosition);
            map.setZoom(15);
            
            // Clear existing routes
            directionsRenderer.setDirections({ routes: [] });
            
            // Reset form
            const directionsForm = document.getElementById('directionsForm');
            if (directionsForm) directionsForm.reset();
            
            // Clear waypoints
            const intermediateWaypoints = document.getElementById('intermediate-waypoints');
            if (intermediateWaypoints) intermediateWaypoints.innerHTML = '';
            
            // Reset directions panel
            const directionsPanel = document.getElementById('directions-panel');
            if (directionsPanel) {
                directionsPanel.innerHTML = '<p class="directions-placeholder">Enter your starting point and click "Get Directions" to see step-by-step instructions.</p>';
            }
        });
    }
    
    // Also add listener for any info window street view buttons
    document.addEventListener('click', function(e) {
        if (e.target && e.target.classList.contains('street-view-btn')) {
            const streetViewContainer = document.getElementById('street-view');
            streetViewContainer.style.display = 'block';
            
            const toggleStreetViewBtn = document.getElementById('toggle-street-view');
            if (toggleStreetViewBtn) {
                toggleStreetViewBtn.innerHTML = '<i class="icon icon-close"></i> Close Street View';
                toggleStreetViewBtn.classList.add('active');
            }
            
            checkStreetView(clinicPosition);
        }
    });
}

/**
 * Check if Street View is available at a given position
 * @param {Object} position - Lat/lng position to check
 */
function checkStreetView(position) {
    const streetViewContainer = document.getElementById('street-view');
    
    streetViewService.getPanorama({ location: position, radius: 50 }, function(data, status) {
        if (status === 'OK') {
            // Street View is available, update panorama
            panorama.setPosition(data.location.latLng);
            panorama.setPov({
                heading: 34,
                pitch: 10
            });
        } else {
            // Street View is not available
            streetViewContainer.innerHTML = `
                <div class="street-view-error">
                    <p><i class="icon icon-warning"></i> Street View is not available at this location.</p>
                    <button class="btn btn-primary close-street-view">Close</button>
                </div>
            `;
            
            // Add event listener to close button
            const closeBtn = streetViewContainer.querySelector('.close-street-view');
            if (closeBtn) {
                closeBtn.addEventListener('click', function() {
                    streetViewContainer.style.display = 'none';
                    
                    const toggleStreetViewBtn = document.getElementById('toggle-street-view');
                    if (toggleStreetViewBtn) {
                        toggleStreetViewBtn.innerHTML = '<i class="icon icon-street-view"></i> Street View';
                        toggleStreetViewBtn.classList.remove('active');
                    }
                });
            }
        }
    });
}

/**
 * Create static map URL with custom styling
 * @param {Object} position - Lat/lng position for map center
 * @param {number} zoom - Zoom level
 * @param {string} apiKey - Google Maps API key
 * @returns {string} URL for static map image
 */
function createStaticMapUrl(position, zoom, apiKey) {
    const width = 600;
    const height = 400;
    
    // Custom style parameters (simplified version of the dynamic map style)
    const mapStyle = encodeURIComponent(
        '&style=feature:all|element:labels.text.fill|color:0x616161' +
        '&style=feature:all|element:labels.text.stroke|color:0xf5f5f5' +
        '&style=feature:administrative.land_parcel|element:labels.text.fill|color:0xbdbdbd' +
        '&style=feature:poi|element:geometry|color:0xeeeeee' +
        '&style=feature:poi|element:labels.text.fill|color:0x757575' +
        '&style=feature:road|element:geometry|color:0xffffff' +
        '&style=feature:road.arterial|element:labels.text.fill|color:0x757575' +
        '&style=feature:road.highway|element:geometry|color:0xdadada' +
        '&style=feature:water|element:geometry|color:0xc9c9c9'
    );
    
    return `https://maps.googleapis.com/maps/api/staticmap?center=${position.lat},${position.lng}&zoom=${zoom}&size=${width}x${height}&markers=color:red%7C${position.lat},${position.lng}&maptype=roadmap&${mapStyle}&key=${apiKey}`;
}

/**
 * Update the static map fallback with custom styling
 * @param {Object} position - Lat/lng position for map center
 */
function updateStaticMap(position) {
    const staticMap = document.getElementById('static-map');
    if (staticMap) {
        // Use the same API key variable defined in loadGoogleMapsScript
        const apiKey = 'AIzaSyDY7pn8Bkb9dxMKX6pKgldH1a2acVjmWsw';
        staticMap.src = createStaticMapUrl(position, 15, apiKey);
        
        // Update the direct link to Google Maps
        const googleMapsLink = document.querySelector('#map-fallback a.btn');
        if (googleMapsLink) {
            const encodedAddress = encodeURIComponent('Wisdom Bites Dental Clinic, 123 Dental Avenue, Smile City, SC 12345');
            googleMapsLink.href = `https://maps.google.com/?q=${encodedAddress}`;
        }
    }
} 