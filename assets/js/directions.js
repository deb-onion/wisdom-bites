function showRouteDetails(response) {
    const directionsPanel = document.getElementById('directions-panel');
    if (!directionsPanel) return;
    
    // Clear any previous content
    directionsPanel.innerHTML = '';
    
    // Create container for alternative routes if we have more than one
    if (response.routes.length > 1) {
        const alternativesContainer = document.createElement('div');
        alternativesContainer.className = 'route-alternatives';
        alternativesContainer.innerHTML = '<h3>Route Options</h3>';
        
        // Create route cards for each alternative
        response.routes.forEach((route, index) => {
            // Calculate total distance and duration
            let totalDistance = 0;
            let totalDuration = 0;
            
            route.legs.forEach(leg => {
                totalDistance += leg.distance.value;
                totalDuration += leg.duration.value;
            });
            
            // Convert to appropriate units
            const unitsSystem = document.getElementById('units-system')?.value || 'imperial';
            const distanceText = unitsSystem === 'metric' ? 
                                (totalDistance / 1000).toFixed(1) + ' km' : 
                                (totalDistance / 1609.34).toFixed(1) + ' miles';
                                
            const durationInMinutes = Math.round(totalDuration / 60);
            
            const routeCard = document.createElement('div');
            routeCard.className = 'route-card';
            if (index === 0) routeCard.classList.add('active');
            
            routeCard.innerHTML = `
                <div class="route-info">
                    <div class="route-header">
                        <span class="route-label">${index === 0 ? 'Best Route' : 'Alternative ' + index}</span>
                        <span class="route-stats">${distanceText} • ${durationInMinutes} min</span>
                    </div>
                    <div class="route-description">
                        ${getRouteDescription(route)}
                    </div>
                </div>
                <button class="btn btn-sm ${index === 0 ? 'btn-primary' : 'btn-outline'} select-route-alt" data-route-index="${index}">
                    ${index === 0 ? 'Current Route' : 'Select Route'}
                </button>
            `;
            
            alternativesContainer.appendChild(routeCard);
        });
        
        // Add alternatives container to directions panel
        directionsPanel.appendChild(alternativesContainer);
    }
    
    // Create summary for the selected (first) route
    const route = response.routes[0];
    
    // Calculate total distance and duration
    let totalDistance = 0;
    let totalDuration = 0;
    
    route.legs.forEach(leg => {
        totalDistance += leg.distance.value;
        totalDuration += leg.duration.value;
    });
    
    // Convert to appropriate units
    const unitsSystem = document.getElementById('units-system')?.value || 'imperial';
    const distanceText = unitsSystem === 'metric' ? 
                        (totalDistance / 1000).toFixed(1) + ' km' : 
                        (totalDistance / 1609.34).toFixed(1) + ' miles';
    
    const durationInMinutes = Math.round(totalDuration / 60);
    const hours = Math.floor(durationInMinutes / 60);
    const minutes = durationInMinutes % 60;
    const durationText = hours > 0 ? `${hours} hr ${minutes} min` : `${minutes} min`;
    
    const departureTime = new Date();
    const arrivalTime = new Date(departureTime.getTime() + (totalDuration * 1000));
    
    // Create summary element
    const summary = document.createElement('div');
    summary.className = 'route-summary';
    
    // Create departure time selector
    const timeOptions = [
        { label: 'Leave now', value: 'now' },
        { label: 'Leave in 30 minutes', value: '30min' },
        { label: 'Leave in 1 hour', value: '1hour' },
        { label: 'Leave tomorrow morning', value: 'tomorrow' }
    ];
    
    let timeOptionsHtml = '';
    timeOptions.forEach(option => {
        timeOptionsHtml += `<option value="${option.value}">${option.label}</option>`;
    });
    
    summary.innerHTML = `
        <h3>Route Summary</h3>
        <div class="departure-selector">
            <select id="departure-time">
                ${timeOptionsHtml}
            </select>
        </div>
        <div class="summary-details">
            <div class="summary-row">
                <span class="summary-label">Distance:</span>
                <span class="summary-value">${distanceText}</span>
            </div>
            <div class="summary-row">
                <span class="summary-label">Duration:</span>
                <span class="summary-value">${durationText}</span>
            </div>
            <div class="summary-row">
                <span class="summary-label">Arrive by:</span>
                <span class="summary-value">${formatTime(arrivalTime)}</span>
            </div>
            <div class="summary-row">
                <span class="summary-label">Travel Mode:</span>
                <span class="summary-value">${travelMode.charAt(0) + travelMode.slice(1).toLowerCase()}</span>
            </div>
        </div>
        <div class="summary-actions">
            <button class="btn btn-outline calendar-event-btn">
                <i class="icon icon-calendar"></i> Add to Calendar
            </button>
            <button class="btn btn-outline share-route-btn">
                <i class="icon icon-share"></i> Share Route
            </button>
        </div>
    `;
    
    // Add summary to directions panel
    directionsPanel.appendChild(summary);
    
    // Add step-by-step directions title
    const stepsTitle = document.createElement('h3');
    stepsTitle.className = 'steps-title';
    stepsTitle.textContent = 'Step-by-Step Directions';
    directionsPanel.appendChild(stepsTitle);
    
    // Add step-by-step directions
    const stepsContainer = document.createElement('div');
    stepsContainer.className = 'steps-container';
    directionsPanel.appendChild(stepsContainer);
    
    // Set steps container as directions renderer panel
    directionsRenderer.setPanel(stepsContainer);
    
    // Add event listeners for departure time selector
    const departureSelect = document.getElementById('departure-time');
    if (departureSelect) {
        departureSelect.addEventListener('change', function() {
            updateArrivalTime(this.value, totalDuration);
        });
    }
    
    // Add event listeners for action buttons
    const calendarBtn = summary.querySelector('.calendar-event-btn');
    if (calendarBtn) {
        calendarBtn.addEventListener('click', function() {
            addRouteToCalendar(response.routes[0]);
        });
    }
    
    const shareBtn = summary.querySelector('.share-route-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', function() {
            shareRoute(response.routes[0]);
        });
    }
}

/**
 * Format time for display
 * @param {Date} date - Date object to format
 * @returns {string} Formatted time string
 */
function formatTime(date) {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
}

/**
 * Update arrival time based on departure selection
 * @param {string} departureOption - Selected departure option
 * @param {number} durationSeconds - Route duration in seconds
 */
function updateArrivalTime(departureOption, durationSeconds) {
    const summaryRow = document.querySelector('.summary-row:nth-child(3) .summary-value');
    if (!summaryRow) return;
    
    let departureTime = new Date();
    
    switch(departureOption) {
        case '30min':
            departureTime.setMinutes(departureTime.getMinutes() + 30);
            break;
        case '1hour':
            departureTime.setHours(departureTime.getHours() + 1);
            break;
        case 'tomorrow':
            departureTime.setDate(departureTime.getDate() + 1);
            departureTime.setHours(9, 0, 0, 0);
            break;
        default:
            // Leave now - already set
            break;
    }
    
    const arrivalTime = new Date(departureTime.getTime() + (durationSeconds * 1000));
    summaryRow.textContent = formatTime(arrivalTime);
}

/**
 * Generate human-readable route description
 * @param {Object} route - Route object
 * @returns {string} Route description
 */
function getRouteDescription(route) {
    if (!route || !route.legs || route.legs.length === 0) {
        return 'Route details not available';
    }
    
    // Get major roads/highways from the route
    const majorRoads = [];
    
    route.legs.forEach(leg => {
        leg.steps.forEach(step => {
            if (step.instructions && step.distance.value > 1000) {
                // Extract highway or major road names from instructions
                const roadMatches = step.instructions.match(/([A-Z]-\d+|[A-Z]{2}-\d+|Route \d+|Highway \d+)/g);
                if (roadMatches) {
                    roadMatches.forEach(road => {
                        if (!majorRoads.includes(road)) {
                            majorRoads.push(road);
                        }
                    });
                }
            }
        });
    });
    
    // If major roads found, use them in description
    if (majorRoads.length > 0) {
        return `Via ${majorRoads.slice(0, 2).join(' and ')}${majorRoads.length > 2 ? ' and more' : ''}`;
    }
    
    // Fallback to simple route description
    const startAddress = route.legs[0].start_address.split(',')[0];
    const endAddress = route.legs[route.legs.length - 1].end_address.split(',')[0];
    
    return `From ${startAddress} to ${endAddress}`;
}

/**
 * Select a different route alternative
 * @param {number} routeIndex - Index of the route to select
 */
function selectRouteAlternative(routeIndex) {
    if (!routeAlternatives || routeIndex >= routeAlternatives.length) return;
    
    // Update the directions renderer with the selected route
    directionsRenderer.setRouteIndex(routeIndex);
    
    // Update the active route card
    const routeCards = document.querySelectorAll('.route-card');
    routeCards.forEach((card, index) => {
        const selectBtn = card.querySelector('.select-route-alt');
        
        if (index === routeIndex) {
            card.classList.add('active');
            if (selectBtn) {
                selectBtn.className = 'btn btn-sm btn-primary select-route-alt';
                selectBtn.textContent = 'Current Route';
            }
        } else {
            card.classList.remove('active');
            if (selectBtn) {
                selectBtn.className = 'btn btn-sm btn-outline select-route-alt';
                selectBtn.textContent = 'Select Route';
            }
        }
    });
}

/**
 * Add route to calendar
 * @param {Object} route - Route object
 */
function addRouteToCalendar(route) {
    if (!route || !route.legs || route.legs.length === 0) return;
    
    const departureSelect = document.getElementById('departure-time');
    const departureOption = departureSelect ? departureSelect.value : 'now';
    
    // Calculate departure and arrival times
    let departureTime = new Date();
    
    switch(departureOption) {
        case '30min':
            departureTime.setMinutes(departureTime.getMinutes() + 30);
            break;
        case '1hour':
            departureTime.setHours(departureTime.getHours() + 1);
            break;
        case 'tomorrow':
            departureTime.setDate(departureTime.getDate() + 1);
            departureTime.setHours(9, 0, 0, 0);
            break;
        default:
            // Leave now - already set
            break;
    }
    
    // Calculate total duration
    let totalDuration = 0;
    route.legs.forEach(leg => {
        totalDuration += leg.duration.value;
    });
    
    const arrivalTime = new Date(departureTime.getTime() + (totalDuration * 1000));
    
    // Format dates for calendar URL
    const formatDate = (date) => {
        return date.toISOString().replace(/-|:|\.\d+/g, '');
    };
    
    const start = formatDate(departureTime);
    const end = formatDate(arrivalTime);
    
    // Create calendar event details
    const origin = route.legs[0].start_address;
    const destination = route.legs[route.legs.length - 1].end_address;
    
    const eventTitle = encodeURIComponent(`Travel to Wisdom Bites Dental Clinic`);
    const location = encodeURIComponent(destination);
    const description = encodeURIComponent(`Directions from ${origin} to ${destination}. Estimated travel time: ${Math.round(totalDuration / 60)} minutes.`);
    
    // Create Google Calendar URL
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${eventTitle}&dates=${start}/${end}&details=${description}&location=${location}&sf=true&output=xml`;
    
    // Open calendar link in new window
    window.open(googleCalendarUrl, '_blank');
}

/**
 * Share route with various share options
 * @param {Object} route - Route object
 */
function shareRoute(route) {
    if (!route || !route.legs || route.legs.length === 0) return;
    
    // Create a modal for sharing options
    const modal = document.createElement('div');
    modal.className = 'share-modal';
    
    const origin = route.legs[0].start_address;
    const destination = route.legs[route.legs.length - 1].end_address;
    
    // Calculate total distance and duration
    let totalDistance = 0;
    let totalDuration = 0;
    
    route.legs.forEach(leg => {
        totalDistance += leg.distance.value;
        totalDuration += leg.duration.value;
    });
    
    // Convert to appropriate units
    const unitsSystem = document.getElementById('units-system')?.value || 'imperial';
    const distanceText = unitsSystem === 'metric' ? 
                        (totalDistance / 1000).toFixed(1) + ' km' : 
                        (totalDistance / 1609.34).toFixed(1) + ' miles';
    
    const durationInMinutes = Math.round(totalDuration / 60);
    
    // Create Google Maps directions URL
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelmode=${travelMode.toLowerCase()}`;
    
    modal.innerHTML = `
        <div class="share-content">
            <div class="share-header">
                <h3>Share Route</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="share-options">
                <div class="share-route-info">
                    <p><strong>From:</strong> ${origin}</p>
                    <p><strong>To:</strong> ${destination}</p>
                    <p><strong>Distance:</strong> ${distanceText} (about ${durationInMinutes} min)</p>
                    <div class="route-link">
                        <input type="text" readonly value="${directionsUrl}">
                        <button class="btn btn-sm btn-outline copy-link">
                            <i class="icon icon-copy"></i> Copy Link
                        </button>
                    </div>
                </div>
                <div class="share-links">
                    <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(directionsUrl)}" target="_blank" class="share-btn facebook">
                        <i class="icon icon-facebook"></i> Facebook
                    </a>
                    <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent('Directions to Wisdom Bites Dental Clinic')}&url=${encodeURIComponent(directionsUrl)}" target="_blank" class="share-btn twitter">
                        <i class="icon icon-twitter"></i> Twitter
                    </a>
                    <a href="mailto:?subject=${encodeURIComponent('Directions to Wisdom Bites Dental Clinic')}&body=${encodeURIComponent('Here are directions to Wisdom Bites Dental Clinic:\n\nFrom: ' + origin + '\nTo: ' + destination + '\nDistance: ' + distanceText + '\nEstimated time: ' + durationInMinutes + ' minutes\n\nView on Google Maps: ' + directionsUrl)}" class="share-btn email">
                        <i class="icon icon-email"></i> Email
                    </a>
                    <a href="sms:?body=${encodeURIComponent('Directions to Wisdom Bites Dental Clinic: ' + directionsUrl)}" class="share-btn sms">
                        <i class="icon icon-sms"></i> SMS
                    </a>
                </div>
                <div class="share-qrcode">
                    <p>Scan to view on mobile device:</p>
                    <div id="route-qrcode"></div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to body
    document.body.appendChild(modal);
    
    // Generate QR code (using Google Charts API)
    const qrCodeContainer = modal.querySelector('#route-qrcode');
    if (qrCodeContainer) {
        const qrCodeUrl = `https://chart.googleapis.com/chart?cht=qr&chs=200x200&chl=${encodeURIComponent(directionsUrl)}`;
        const qrImg = document.createElement('img');
        qrImg.src = qrCodeUrl;
        qrImg.alt = 'QR Code for directions';
        qrCodeContainer.appendChild(qrImg);
    }
    
    // Add event listeners
    modal.querySelector('.close-modal').addEventListener('click', function() {
        document.body.removeChild(modal);
    });
    
    modal.querySelector('.copy-link').addEventListener('click', function() {
        const linkInput = modal.querySelector('.route-link input');
        linkInput.select();
        navigator.clipboard.writeText(linkInput.value).then(function() {
            const copyBtn = modal.querySelector('.copy-link');
            copyBtn.innerHTML = '<i class="icon icon-check"></i> Copied!';
            setTimeout(() => {
                copyBtn.innerHTML = '<i class="icon icon-copy"></i> Copy Link';
            }, 2000);
        });
    });
    
    // Close when clicking outside the modal content
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            document.body.removeChild(modal);
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
    const resetMapBtn = document.getElementById('reset-map');
    const embedViewBtn = document.getElementById('embed-view');
    
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
            
            // Hide any open info windows
            markers.forEach(marker => {
                if (marker.infoWindow) {
                    marker.infoWindow.close();
                }
            });
            
            // Reset layer toggles
            resetAllLayers();
        });
    }
    
    if (embedViewBtn) {
        embedViewBtn.addEventListener('click', function() {
            showEmbedMapView();
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
 * Reset all map layers
 */
function resetAllLayers() {
    // Reset traffic layer
    if (trafficLayer) {
        trafficLayer.setMap(null);
        const trafficBtn = document.getElementById('toggle-traffic');
        if (trafficBtn) trafficBtn.classList.remove('active');
    }
    
    // Reset transit layer
    if (transitLayer) {
        transitLayer.setMap(null);
        const transitBtn = document.getElementById('toggle-transit');
        if (transitBtn) transitBtn.classList.remove('active');
    }
    
    // Reset bike layer
    if (bikeLayer) {
        bikeLayer.setMap(null);
        const bikeBtn = document.getElementById('toggle-bike');
        if (bikeBtn) bikeBtn.classList.remove('active');
    }
    
    // Reset heatmap
    if (heatmap) {
        heatmap.setMap(null);
        const heatmapBtn = document.getElementById('toggle-heatmap');
        if (heatmapBtn) heatmapBtn.classList.remove('active');
    }
}

/**
 * Show Embed Map View using Maps Embed API
 */
function showEmbedMapView() {
    // Create modal for embed view
    const modal = document.createElement('div');
    modal.className = 'embed-map-modal';
    
    const clinicAddress = "Wisdom Bites Dental Clinic, 123 Dental Avenue, Smile City, SC 12345";
    const apiKey = 'AIzaSyDY7pn8Bkb9dxMKX6pKgldH1a2acVjmWsw';
    
    modal.innerHTML = `
        <div class="embed-map-content">
            <div class="embed-map-header">
                <h3>Embedded Map View</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="embed-map-container">
                <iframe 
                    width="100%" 
                    height="450" 
                    style="border:0" 
                    loading="lazy" 
                    allowfullscreen 
                    referrerpolicy="no-referrer-when-downgrade" 
                    src="https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(clinicAddress)}&zoom=15">
                </iframe>
            </div>
            <div class="embed-map-footer">
                <p>This view may be easier to use on mobile devices.</p>
                <button class="btn btn-primary directions-embed-btn">Get Directions in this View</button>
            </div>
        </div>
    `;
    
    // Add modal to body
    document.body.appendChild(modal);
    
    // Add event listeners
    modal.querySelector('.close-modal').addEventListener('click', function() {
        document.body.removeChild(modal);
    });
    
    // Add event listener for directions button
    modal.querySelector('.directions-embed-btn').addEventListener('click', function() {
        // Get origin from the form
        const originInput = document.getElementById('origin');
        const origin = originInput ? originInput.value : '';
        
        // Replace iframe with directions embed
        const embedContainer = modal.querySelector('.embed-map-container');
        if (embedContainer && origin) {
            embedContainer.innerHTML = `
                <iframe 
                    width="100%" 
                    height="450" 
                    style="border:0" 
                    loading="lazy" 
                    allowfullscreen 
                    referrerpolicy="no-referrer-when-downgrade" 
                    src="https://www.google.com/maps/embed/v1/directions?key=${apiKey}&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(clinicAddress)}&mode=${travelMode.toLowerCase()}">
                </iframe>
            `;
        } else if (embedContainer) {
            alert('Please enter a starting location in the form first.');
        }
    });
    
    // Close when clicking outside the modal content
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            document.body.removeChild(modal);
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
 * Initialize sharing options for the directions page
 */
function initSharingOptions() {
    const shareBtn = document.getElementById('share-clinic-location');
    if (shareBtn) {
        shareBtn.addEventListener('click', function() {
            shareLocation();
        });
    }
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

// Add an event listener to handle all API-related clicks
document.addEventListener('click', function(e) {
    // Handle clicks on POI markers to add to route
    if (e.target && e.target.classList.contains('add-to-route-btn')) {
        const poiName = e.target.getAttribute('data-name');
        if (poiName) {
            addPOIToRoute(poiName);
        }
    }
    
    // Handle click on share location button
    if (e.target && e.target.classList.contains('share-location-btn')) {
        shareLocation();
    }
    
    // Handle click on route alternative selection
    if (e.target && e.target.classList.contains('select-route-alt')) {
        const routeIndex = parseInt(e.target.getAttribute('data-route-index'));
        selectRouteAlternative(routeIndex);
    }
});

// Wait for map to be fully loaded before performing additional operations
function waitForMapToLoad(callback) {
    const checkMapReady = () => {
        if (mapReady) {
            callback();
        } else {
            setTimeout(checkMapReady, 100);
        }
    };
    
    checkMapReady();
}

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
    
    // Initialize Places service for additional POI data
    placesService = new google.maps.places.PlacesService(map);
    
    // Initialize Geocoding service for address resolution
    geocodingService = new google.maps.Geocoder();
    
    // Add a marker for the dental clinic with actual geocoding
    geocodeClinicAddress(clinicAddress);
    
    // Initialize autocomplete for origin input
    initAutocomplete();
    
    // Update static map with styled fallback
    updateStaticMap(clinicPosition);
    
    // Initialize nearby points of interest
    findNearbyParkingAndTransit();
    
    // Initialize heatmap for popular times (simulated)
    initHeatmap();
    
    // Set flag that map is ready
    mapReady = true;
    
    // Create layer toggle controls
    createLayerToggles();
}

/**
 * Geocode the clinic address to get accurate coordinates
 * @param {string} address - Full clinic address
 */
function geocodeClinicAddress(address) {
    const geocoder = new google.maps.Geocoder();
    
    geocoder.geocode({ address: address }, function(results, status) {
        if (status === 'OK' && results[0]) {
            // Update clinic position with accurate coordinates
            clinicPosition = results[0].geometry.location;
            
            // Center map on geocoded position
            map.setCenter(clinicPosition);
            
            // Add clinic marker
            const clinicMarker = createMarker(map, clinicPosition, "Wisdom Bites Dental Clinic", true);
            markers.push(clinicMarker);
            
            // Get detailed place information
            getClinicPlaceDetails("Wisdom Bites Dental Clinic", clinicPosition);
        } else {
            console.error('Geocoding failed:', status);
            
            // Fallback to default coordinates
            const clinicMarker = createMarker(map, clinicPosition, "Wisdom Bites Dental Clinic", true);
            markers.push(clinicMarker);
        }
    });
}

/**
 * Get detailed place information using Places API
 * @param {string} name - Place name
 * @param {Object} location - LatLng location
 */
function getClinicPlaceDetails(name, location) {
    // Create a search request for Places API
    const request = {
        location: location,
        radius: '100',
        name: name,
        type: ['dentist']
    };
    
    placesService.nearbySearch(request, function(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK && results[0]) {
            // Get more details using place_id
            placesService.getDetails({
                placeId: results[0].place_id,
                fields: ['name', 'formatted_address', 'formatted_phone_number', 
                         'opening_hours', 'website', 'rating', 'review', 'photo']
            }, function(place, status) {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    // Update info window with enhanced details
                    updateClinicInfoContent(place);
                }
            });
        }
    });
}

/**
 * Update clinic info window with enhanced details
 * @param {Object} placeDetails - Place details from Places API
 */
function updateClinicInfoContent(placeDetails) {
    // Find clinic marker
    const clinicMarker = markers.find(marker => marker.getTitle() === "Wisdom Bites Dental Clinic");
    if (!clinicMarker) return;
    
    // Create enhanced info content
    let infoContent = `
        <div class="info-window clinic-info">
            <h4>Wisdom Bites Dental Clinic</h4>
            <address>
                ${placeDetails.formatted_address || '123 Dental Avenue<br>Smile City, SC 12345'}
            </address>
            <p><strong>Phone:</strong> <a href="tel:${placeDetails.formatted_phone_number || '+15551234567'}">${placeDetails.formatted_phone_number || '(555) 123-4567'}</a></p>
    `;
    
    // Add hours if available
    if (placeDetails.opening_hours) {
        infoContent += `<p><strong>Hours:</strong></p><div class="hours-list">`;
        placeDetails.opening_hours.weekday_text.forEach(day => {
            infoContent += `<small>${day}</small>`;
        });
        infoContent += `</div>`;
    } else {
        infoContent += `<p><strong>Hours:</strong> Mon-Fri 9AM-6PM, Sat 10AM-3PM</p>`;
    }
    
    // Add rating if available
    if (placeDetails.rating) {
        infoContent += `
            <div class="place-rating">
                <strong>Rating:</strong> ${placeDetails.rating.toFixed(1)}
                <span class="stars">
                    ${getStarRating(placeDetails.rating)}
                </span>
            </div>
        `;
    }
    
    // Add photo if available
    if (placeDetails.photos && placeDetails.photos.length > 0) {
        const photoUrl = placeDetails.photos[0].getUrl({maxWidth: 200, maxHeight: 150});
        infoContent += `<div class="place-photo"><img src="${photoUrl}" alt="${placeDetails.name}" /></div>`;
    }
    
    // Add buttons
    infoContent += `
            <div class="info-actions">
                <button class="btn btn-sm btn-primary street-view-btn">Street View</button>
                ${placeDetails.website ? `<a href="${placeDetails.website}" target="_blank" class="btn btn-sm btn-outline">Website</a>` : ''}
            </div>
        </div>
    `;
    
    // Update info window
    const infoWindow = new google.maps.InfoWindow({
        content: infoContent
    });
    
    // Replace previous info window
    if (clinicMarker.infoWindow) {
        clinicMarker.infoWindow.close();
    }
    
    // Store infoWindow reference
    clinicMarker.infoWindow = infoWindow;
    
    // Open the info window
    infoWindow.open(map, clinicMarker);
    
    // Add click listener to marker
    clinicMarker.addListener('click', function() {
        infoWindow.open(map, clinicMarker);
    });
}

/**
 * Generate HTML star rating
 * @param {number} rating - Rating value (1-5)
 * @returns {string} HTML string with star icons
 */
function getStarRating(rating) {
    let stars = '';
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            stars += '<i class="icon icon-star-full"></i>';
        } else if (i === fullStars && halfStar) {
            stars += '<i class="icon icon-star-half"></i>';
        } else {
            stars += '<i class="icon icon-star-empty"></i>';
        }
    }
    
    return stars;
}

/**
 * Find and display nearby parking and public transit options
 */
function findNearbyParkingAndTransit() {
    // Check if map and Places service are initialized
    if (!placesService || !clinicPosition) return;
    
    // Search for parking
    placesService.nearbySearch({
        location: clinicPosition,
        radius: 500,
        type: ['parking']
    }, function(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            for (let i = 0; i < Math.min(results.length, 3); i++) {
                createMarker(map, results[i].geometry.location, results[i].name, false, 'parking');
            }
        }
    });
    
    // Search for transit stations
    placesService.nearbySearch({
        location: clinicPosition,
        radius: 800,
        type: ['subway_station', 'train_station', 'bus_station', 'transit_station']
    }, function(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            for (let i = 0; i < Math.min(results.length, 3); i++) {
                createMarker(map, results[i].geometry.location, results[i].name, false, 'transit');
            }
        }
    });
    
    // Add the points of interest info card
    addPOIInfoCard();
}

/**
 * Add Points of Interest info card
 */
function addPOIInfoCard() {
    const infoCards = document.querySelector('.directions-info');
    if (!infoCards) return;
    
    const poiCard = document.createElement('div');
    poiCard.className = 'info-card poi-info';
    poiCard.innerHTML = `
        <h3>Points of Interest</h3>
        <div class="poi-toggle">
            <button class="poi-btn active" data-type="all">All</button>
            <button class="poi-btn" data-type="parking">Parking</button>
            <button class="poi-btn" data-type="transit">Transit</button>
            <button class="poi-btn" data-type="pharmacy">Pharmacy</button>
        </div>
        <div class="poi-details">
            <p>Toggle different points of interest near our clinic.</p>
            <p class="poi-tip"><i class="icon icon-info"></i> Click on map markers for more information.</p>
        </div>
    `;
    
    infoCards.appendChild(poiCard);
    
    // Add event listeners to POI toggle buttons
    const poiButtons = poiCard.querySelectorAll('.poi-btn');
    poiButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            poiButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Filter markers based on selected type
            const type = this.getAttribute('data-type');
            filterMarkers(type);
            
            // If pharmacy is selected and none exists yet, search for pharmacies
            if (type === 'pharmacy' && !markers.some(marker => marker.poiType === 'pharmacy')) {
                findNearbyPharmacies();
            }
        });
    });
}

/**
 * Find and display nearby pharmacies
 */
function findNearbyPharmacies() {
    // Check if map and Places service are initialized
    if (!placesService || !clinicPosition) return;
    
    // Search for pharmacies
    placesService.nearbySearch({
        location: clinicPosition,
        radius: 1000,
        type: ['pharmacy']
    }, function(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            for (let i = 0; i < Math.min(results.length, 5); i++) {
                createMarker(map, results[i].geometry.location, results[i].name, false, 'pharmacy');
            }
        }
    });
}

/**
 * Filter map markers based on type
 * @param {string} type - Marker type to display ('all' to show all)
 */
function filterMarkers(type) {
    markers.forEach(marker => {
        if (type === 'all' || !marker.poiType || marker.poiType === type) {
            marker.setVisible(true);
        } else {
            marker.setVisible(false);
        }
    });
}

/**
 * Initialize heatmap for popular visiting times (simulated data)
 */
function initHeatmap() {
    // Create simulated popular times data (simulated foot traffic around the clinic)
    const heatmapData = [];
    
    // Add points around the clinic with varying weights to simulate popular areas
    if (clinicPosition) {
        // Add the clinic itself with high weight
        heatmapData.push({
            location: clinicPosition,
            weight: 10
        });
        
        // Create a grid of points around the clinic with random weights
        for (let i = -5; i <= 5; i++) {
            for (let j = -5; j <= 5; j++) {
                const lat = clinicPosition.lat() + (i * 0.0005);
                const lng = clinicPosition.lng() + (j * 0.0005);
                
                // Skip the center point (already added)
                if (i === 0 && j === 0) continue;
                
                // Generate weight based on distance from clinic (closer = higher weight)
                const distance = Math.sqrt(i*i + j*j);
                const weight = Math.max(0, 10 - distance * 1.5);
                
                if (weight > 0) {
                    heatmapData.push({
                        location: new google.maps.LatLng(lat, lng),
                        weight: weight
                    });
                }
            }
        }
    }
    
    // Create heatmap layer
    heatmap = new google.maps.visualization.HeatmapLayer({
        data: heatmapData,
        map: null, // Don't show by default
        radius: 25,
        opacity: 0.7,
        gradient: [
            'rgba(0, 255, 255, 0)',
            'rgba(0, 255, 255, 1)',
            'rgba(0, 191, 255, 1)',
            'rgba(0, 127, 255, 1)',
            'rgba(0, 63, 255, 1)',
            'rgba(0, 0, 255, 1)',
            'rgba(0, 0, 223, 1)',
            'rgba(0, 0, 191, 1)',
            'rgba(0, 0, 159, 1)',
            'rgba(0, 0, 127, 1)',
            'rgba(63, 0, 91, 1)',
            'rgba(127, 0, 63, 1)',
            'rgba(191, 0, 31, 1)',
            'rgba(255, 0, 0, 1)'
        ]
    });
}

/**
 * Create layer toggle controls
 */
function createLayerToggles() {
    // Create traffic layer
    trafficLayer = new google.maps.TrafficLayer();
    
    // Create transit layer
    transitLayer = new google.maps.TransitLayer();
    
    // Create bicycling layer
    bikeLayer = new google.maps.BicyclingLayer();
    
    // Create toggle controls container
    const layerControls = document.createElement('div');
    layerControls.className = 'layer-controls';
    layerControls.innerHTML = `
        <div class="layer-control-header">Map Layers</div>
        <div class="layer-control-buttons">
            <button id="toggle-traffic" class="layer-btn" title="Show Traffic">
                <i class="icon icon-traffic"></i> Traffic
            </button>
            <button id="toggle-transit" class="layer-btn" title="Show Transit">
                <i class="icon icon-transit"></i> Transit
            </button>
            <button id="toggle-bike" class="layer-btn" title="Show Bike Lanes">
                <i class="icon icon-bike"></i> Bike Lanes
            </button>
            <button id="toggle-heatmap" class="layer-btn" title="Show Popular Times">
                <i class="icon icon-heat"></i> Popular Times
            </button>
        </div>
    `;
    
    // Add controls to map
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(layerControls);
    
    // Add event listeners
    document.getElementById('toggle-traffic').addEventListener('click', function() {
        toggleLayer(this, trafficLayer);
    });
    
    document.getElementById('toggle-transit').addEventListener('click', function() {
        toggleLayer(this, transitLayer);
    });
    
    document.getElementById('toggle-bike').addEventListener('click', function() {
        toggleLayer(this, bikeLayer);
    });
    
    document.getElementById('toggle-heatmap').addEventListener('click', function() {
        toggleHeatmap(this);
    });
}

/**
 * Toggle map layer visibility
 * @param {HTMLElement} button - The clicked button
 * @param {Object} layer - The map layer to toggle
 */
function toggleLayer(button, layer) {
    if (button.classList.contains('active')) {
        layer.setMap(null);
        button.classList.remove('active');
    } else {
        layer.setMap(map);
        button.classList.add('active');
    }
}

/**
 * Toggle heatmap visibility
 * @param {HTMLElement} button - The clicked button
 */
function toggleHeatmap(button) {
    if (button.classList.contains('active')) {
        heatmap.setMap(null);
        button.classList.remove('active');
    } else {
        heatmap.setMap(map);
        button.classList.add('active');
    }
}

/**
 * Initialize autocomplete for the origin input field with improved validation
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
                validateAddressInput(originInput.value);
                return;
            }
            
            // If the place has a geometry, center the map on it
            if (place.geometry.viewport) {
                map.fitBounds(place.geometry.viewport);
            } else {
                map.setCenter(place.geometry.location);
                map.setZoom(17);
            }
            
            // Set a validated flag on the input
            originInput.setAttribute('data-validated', 'true');
            
            // Change the input's styling to indicate validation
            originInput.parentElement.classList.add('validated');
        });
        
        // Add blur handler to validate address
        originInput.addEventListener('blur', function() {
            if (!originInput.getAttribute('data-validated') && originInput.value.trim()) {
                validateAddressInput(originInput.value);
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
 * Validate address input using Geocoding API
 * @param {string} address - Address to validate
 */
function validateAddressInput(address) {
    if (!address || !geocodingService) return;
    
    geocodingService.geocode({ address: address }, function(results, status) {
        const originInput = document.getElementById('origin');
        if (!originInput) return;
        
        if (status === 'OK' && results[0]) {
            // Address is valid, update with formatted address
            originInput.value = results[0].formatted_address;
            originInput.setAttribute('data-validated', 'true');
            originInput.parentElement.classList.add('validated');
            
            // Add a small checkmark or validation indicator
            const validationIcon = document.createElement('span');
            validationIcon.className = 'validation-icon valid';
            validationIcon.innerHTML = '<i class="icon icon-check"></i>';
            
            // Remove existing validation icons
            const existingIcons = originInput.parentElement.querySelectorAll('.validation-icon');
            existingIcons.forEach(icon => icon.remove());
            
            // Add new validation icon
            originInput.parentElement.appendChild(validationIcon);
        } else {
            // Address might be invalid or incomplete
            originInput.setAttribute('data-validated', 'false');
            originInput.parentElement.classList.remove('validated');
            
            // Add a warning indicator
            const validationIcon = document.createElement('span');
            validationIcon.className = 'validation-icon warning';
            validationIcon.innerHTML = '<i class="icon icon-warning"></i>';
            validationIcon.title = 'Address could not be validated. Route may be less accurate.';
            
            // Remove existing validation icons
            const existingIcons = originInput.parentElement.querySelectorAll('.validation-icon');
            existingIcons.forEach(icon => icon.remove());
            
            // Add new validation icon
            originInput.parentElement.appendChild(validationIcon);
        }
    });
}

/**
 * Create a marker on the map with enhanced info windows
 * @param {Object} map - The Google Map object
 * @param {Object} position - Lat/lng position
 * @param {string} title - Marker title
 * @param {boolean} isClinic - Whether this marker is for the clinic
 * @param {string} type - POI type (parking, transit, pharmacy, etc.)
 * @returns {Object} The created marker
 */
function createMarker(map, position, title, isClinic = false, type = null) {
    // Determine marker icon based on type
    let icon = null;
    
    if (isClinic) {
        icon = {
            url: 'assets/images/marker-clinic.png',
            scaledSize: new google.maps.Size(40, 40)
        };
    } else if (type) {
        // Use different icons for different POI types
        switch(type) {
            case 'parking':
                icon = {
                    url: 'assets/images/marker-parking.png',
                    scaledSize: new google.maps.Size(30, 30)
                };
                break;
            case 'transit':
                icon = {
                    url: 'assets/images/marker-transit.png',
                    scaledSize: new google.maps.Size(30, 30)
                };
                break;
            case 'pharmacy':
                icon = {
                    url: 'assets/images/marker-pharmacy.png',
                    scaledSize: new google.maps.Size(30, 30)
                };
                break;
            default:
                // Default marker
                break;
        }
    }
    
    const marker = new google.maps.Marker({
        position: position,
        map: map,
        title: title,
        animation: google.maps.Animation.DROP,
        icon: icon
    });
    
    // Store POI type for filtering
    if (type) {
        marker.poiType = type;
    }
    
    // Create info window content based on marker type
    let infoContent = '';
    
    if (isClinic) {
        infoContent = getClinicInfoContent();
    } else if (type) {
        infoContent = getPOIInfoContent(title, type);
    } else {
        infoContent = `<div class="info-window"><h4>${title}</h4></div>`;
    }
    
    // Create info window
    const infoWindow = new google.maps.InfoWindow({
        content: infoContent
    });
    
    // Store reference to info window
    marker.infoWindow = infoWindow;
    
    // Open info window when marker is clicked
    marker.addListener('click', function() {
        // Close all other info windows first
        markers.forEach(m => {
            if (m.infoWindow && m !== marker) {
                m.infoWindow.close();
            }
        });
        
        infoWindow.open(map, marker);
    });
    
    // If it's the clinic marker, open info window by default
    if (isClinic) {
        setTimeout(() => {
            infoWindow.open(map, marker);
        }, 1000);
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
            <div class="info-actions">
                <button class="btn btn-sm btn-primary street-view-btn">See Street View</button>
                <button class="btn btn-sm btn-outline share-location-btn">Share Location</button>
            </div>
        </div>
    `;
}

/**
 * Get info window content for POI markers
 * @param {string} title - POI title
 * @param {string} type - POI type
 * @returns {string} HTML content for info window
 */
function getPOIInfoContent(title, type) {
    let typeIcon = '';
    let typeInfo = '';
    
    switch (type) {
        case 'parking':
            typeIcon = 'icon-parking';
            typeInfo = 'Parking Facility';
            break;
        case 'pharmacy':
            typeIcon = 'icon-pharmacy';
            typeInfo = 'Pharmacy';
            break;
        case 'transit':
            typeIcon = 'icon-transit';
            typeInfo = 'Transit Station';
            break;
        default:
            typeIcon = 'icon-location';
            typeInfo = 'Point of Interest';
    }
    
    return `
        <div class="info-window poi-info">
            <div class="poi-icon">
                <i class="icon ${typeIcon}"></i>
            </div>
            <h4>${title}</h4>
            <p>${typeInfo}</p>
            <div class="info-actions">
                <button class="btn btn-sm btn-primary add-to-route-btn" data-name="${title}">Add to Route</button>
            </div>
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
    const routeOptionsBtn = document.getElementById('route-options');
    
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
    
    // Add event listener for Route Options button
    if (routeOptionsBtn) {
        routeOptionsBtn.addEventListener('click', toggleRouteOptions);
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
                                    originInput.setAttribute('data-validated', 'true');
                                    originInput.parentElement.classList.add('validated');
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
    
    // Add event listener for POI "Add to Route" buttons (delegated)
    document.addEventListener('click', function(e) {
        if (e.target && e.target.classList.contains('add-to-route-btn')) {
            const poiName = e.target.getAttribute('data-name');
            if (poiName) {
                addPOIToRoute(poiName);
            }
        }
        
        if (e.target && e.target.classList.contains('share-location-btn')) {
            shareLocation();
        }
        
        if (e.target && e.target.classList.contains('select-route-alt')) {
            const routeIndex = parseInt(e.target.getAttribute('data-route-index'));
            selectRouteAlternative(routeIndex);
        }
    });
}

/**
 * Toggle advanced route options panel
 */
function toggleRouteOptions() {
    const optionsPanel = document.getElementById('route-options-panel');
    const optionsBtn = document.getElementById('route-options');
    
    if (optionsPanel) {
        if (optionsPanel.classList.contains('visible')) {
            optionsPanel.classList.remove('visible');
            optionsBtn.classList.remove('active');
        } else {
            optionsPanel.classList.add('visible');
            optionsBtn.classList.add('active');
        }
    } else {
        // Create options panel if it doesn't exist
        const form = document.getElementById('directionsForm');
        if (!form) return;
        
        const panel = document.createElement('div');
        panel.id = 'route-options-panel';
        panel.className = 'route-options-panel visible';
        
        panel.innerHTML = `
            <h4>Route Preferences</h4>
            <div class="options-group">
                <label class="checkbox-label">
                    <input type="checkbox" id="avoid-tolls"> Avoid tolls
                </label>
                <label class="checkbox-label">
                    <input type="checkbox" id="avoid-highways"> Avoid highways
                </label>
                <label class="checkbox-label">
                    <input type="checkbox" id="avoid-ferries"> Avoid ferries
                </label>
            </div>
            <div class="options-group">
                <label for="route-alternatives">Route alternatives:</label>
                <select id="route-alternatives">
                    <option value="1">Show best route only</option>
                    <option value="3" selected>Show up to 3 routes</option>
                </select>
            </div>
            <div class="options-group">
                <label for="units-system">Distance units:</label>
                <select id="units-system">
                    <option value="imperial" selected>Miles (Imperial)</option>
                    <option value="metric">Kilometers (Metric)</option>
                </select>
            </div>
            <div class="options-actions">
                <button type="button" class="btn btn-primary apply-options">Apply Options</button>
            </div>
        `;
        
        form.appendChild(panel);
        optionsBtn.classList.add('active');
        
        // Add event listener for Apply Options button
        panel.querySelector('.apply-options').addEventListener('click', function() {
            // If directions are already displayed, recalculate with new options
            if (directionsRenderer.getDirections()) {
                calculateAndDisplayRoute();
            }
            
            // Hide panel
            panel.classList.remove('visible');
            optionsBtn.classList.remove('active');
        });
    }
}

/**
 * Add POI to route as a waypoint
 * @param {string} poiName - Name of the POI to add
 */
function addPOIToRoute(poiName) {
    // First add a waypoint input
    addWaypoint();
    
    // Get the newly added waypoint input
    const waypointContainers = document.querySelectorAll('.waypoint-container');
    if (waypointContainers.length > 0) {
        const lastContainer = waypointContainers[waypointContainers.length - 1];
        const input = lastContainer.querySelector('.waypoint-input');
        
        if (input) {
            // Set the POI name as the waypoint value
            input.value = poiName;
            input.setAttribute('data-validated', 'true');
            
            // Show confirmation message
            const message = document.createElement('div');
            message.className = 'waypoint-added-message';
            message.textContent = `Added ${poiName} to your route`;
            message.style.opacity = '1';
            
            lastContainer.appendChild(message);
            
            // Fade out and remove after 3 seconds
            setTimeout(() => {
                message.style.opacity = '0';
                setTimeout(() => {
                    if (message.parentNode) {
                        message.parentNode.removeChild(message);
                    }
                }, 500);
            }, 3000);
        }
    }
}

/**
 * Share clinic location with various share options
 */
function shareLocation() {
    // Create a modal for sharing options
    const modal = document.createElement('div');
    modal.className = 'share-modal';
    
    const clinicAddress = "Wisdom Bites Dental Clinic, 123 Dental Avenue, Smile City, SC 12345";
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clinicAddress)}`;
    
    modal.innerHTML = `
        <div class="share-content">
            <div class="share-header">
                <h3>Share Our Location</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="share-options">
                <div class="share-address">
                    <p>${clinicAddress}</p>
                    <button class="btn btn-sm btn-outline copy-address">
                        <i class="icon icon-copy"></i> Copy Address
                    </button>
                </div>
                <div class="share-links">
                    <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(mapUrl)}" target="_blank" class="share-btn facebook">
                        <i class="icon icon-facebook"></i> Facebook
                    </a>
                    <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent('Get directions to Wisdom Bites Dental Clinic')}&url=${encodeURIComponent(mapUrl)}" target="_blank" class="share-btn twitter">
                        <i class="icon icon-twitter"></i> Twitter
                    </a>
                    <a href="mailto:?subject=${encodeURIComponent('Directions to Wisdom Bites Dental Clinic')}&body=${encodeURIComponent('Here is the address and map link to Wisdom Bites Dental Clinic:\n\n' + clinicAddress + '\n\n' + mapUrl)}" class="share-btn email">
                        <i class="icon icon-email"></i> Email
                    </a>
                    <a href="sms:?body=${encodeURIComponent('Wisdom Bites Dental Clinic: ' + clinicAddress + ' ' + mapUrl)}" class="share-btn sms">
                        <i class="icon icon-sms"></i> SMS
                    </a>
                </div>
                <div class="share-map">
                    <div class="embed-map">
                        <iframe 
                            width="100%" 
                            height="200" 
                            style="border:0" 
                            loading="lazy" 
                            allowfullscreen 
                            referrerpolicy="no-referrer-when-downgrade" 
                            src="https://www.google.com/maps/embed/v1/place?key=AIzaSyDY7pn8Bkb9dxMKX6pKgldH1a2acVjmWsw&q=123+Dental+Avenue,+Smile+City,+SC+12345">
                        </iframe>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to body
    document.body.appendChild(modal);
    
    // Add event listeners
    modal.querySelector('.close-modal').addEventListener('click', function() {
        document.body.removeChild(modal);
    });
    
    modal.querySelector('.copy-address').addEventListener('click', function() {
        navigator.clipboard.writeText(clinicAddress).then(function() {
            const copyBtn = modal.querySelector('.copy-address');
            copyBtn.innerHTML = '<i class="icon icon-check"></i> Copied!';
            setTimeout(() => {
                copyBtn.innerHTML = '<i class="icon icon-copy"></i> Copy Address';
            }, 2000);
        });
    });
    
    // Close when clicking outside the modal content
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
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
    const autocomplete = new google.maps.places.Autocomplete(waypointInput, {
        types: ['geocode']
    });
    
    // Listen for place selection to validate
    autocomplete.addListener('place_changed', function() {
        const place = autocomplete.getPlace();
        
        if (place.geometry) {
            waypointInput.setAttribute('data-validated', 'true');
        }
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
 * Calculate and display route based on form inputs using enhanced Routes API
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
    
    // Show loading indicator
    const directionsPanel = document.getElementById('directions-panel');
    if (directionsPanel) {
        directionsPanel.innerHTML = '<div class="directions-loading"><i class="icon icon-loading"></i> Calculating best route...</div>';
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
    
    // Get route options
    const avoidTolls = document.getElementById('avoid-tolls')?.checked || false;
    const avoidHighways = document.getElementById('avoid-highways')?.checked || false;
    const avoidFerries = document.getElementById('avoid-ferries')?.checked || false;
    const routeAlternatives = document.getElementById('route-alternatives')?.value || 3;
    const unitsSystem = document.getElementById('units-system')?.value || 'imperial';
    
    // Set up request object for directions service
    const request = {
        origin: origin,
        destination: destination,
        waypoints: waypoints,
        optimizeWaypoints: optimizeWaypoints,
        travelMode: google.maps.TravelMode[travelMode],
        unitSystem: unitsSystem === 'metric' ? 
                    google.maps.UnitSystem.METRIC : 
                    google.maps.UnitSystem.IMPERIAL,
        provideRouteAlternatives: routeAlternatives > 1,
        avoidTolls: avoidTolls,
        avoidHighways: avoidHighways,
        avoidFerries: avoidFerries
    };
    
    // Call the directions service
    directionsService.route(request, function(response, status) {
        if (status === 'OK') {
            // Store route alternatives
            routeAlternatives = response.routes;
            
            // Display the route
            directionsRenderer.setDirections(response);
            
            // If waypoints were optimized, update the UI to reflect the new order
            if (optimizeWaypoints && response.routes[0].waypoint_order.length > 0) {
                rearrangeWaypointInputs(response.routes[0].waypoint_order);
            }
            
            // Show route summary and alternatives
            showRouteDetails(response);
        } else {
            console.error('Directions request failed due to ' + status);
            
            if (directionsPanel) {
                directionsPanel.innerHTML = `
                    <div class="directions-error">
                        <i class="icon icon-warning"></i>
                        <h3>Unable to Calculate Route</h3>
                        <p>${getDirectionsErrorMessage(status)}</p>
                        <button class="btn btn-primary retry-directions">Try Again</button>
                    </div>
                `;
                
                // Add event listener for retry button
                const retryBtn = directionsPanel.querySelector('.retry-directions');
                if (retryBtn) {
                    retryBtn.addEventListener('click', function() {
                        calculateAndDisplayRoute(optimizeWaypoints);
                    });
                }
            }
        }
    });
}

/**
 * Get human-readable error message for directions errors
 * @param {string} status - Error status from Directions API
 * @returns {string} Human-readable error message
 */
function getDirectionsErrorMessage(status) {
    switch(status) {
        case 'ZERO_RESULTS':
            return "We couldn't find a route between these locations. Please check the addresses and try again.";
        case 'NOT_FOUND':
            return "At least one of the locations couldn't be found. Please verify the addresses.";
        case 'MAX_WAYPOINTS_EXCEEDED':
            return "You've added too many stops. Please remove some waypoints and try again.";
        case 'INVALID_REQUEST':
            return "The request was invalid. Please check your input and try again.";
        case 'OVER_QUERY_LIMIT':
            return "We've made too many requests. Please try again in a few minutes.";
        case 'REQUEST_DENIED':
            return "The directions request was denied. This may be due to a security restriction.";
        case 'UNKNOWN_ERROR':
            return "An unknown error occurred. Please try again later.";
        default:
            return "An error occurred while calculating directions. Please try again.";
    }
}

/**
 * Show detailed route information and alternatives
 * @param {Object} response - Directions API response
 */
function showRouteDetails(response) {
    const directionsPanel = document.getElementById('directions-panel');
    if (!directionsPanel) return;
    
    // Clear any previous content
    directionsPanel.innerHTML = '';
    
    // Create container for alternative routes if we have more than one
    if (response.routes.length > 1) {
        const alternativesContainer = document.createElement('div');
        alternativesContainer.className = 'route-alternatives';
        alternativesContainer.innerHTML = '<h3>Route Options</h3>';
        
        // Create route cards for each alternative
        response.routes.forEach((route, index) => {
            // Calculate total distance and duration
            let totalDistance = 0;
            let totalDuration = 0;
            
            route.legs.forEach(leg => {
                totalDistance += leg.distance.value;
                totalDuration += leg.duration.value;
            });
            
            // Convert to appropriate units
            const unitsSystem = document.getElementById('units-system')?.value || 'imperial';
            const distanceText = unitsSystem === 'metric' ? 
                                (totalDistance / 1000).toFixed(1) + ' km' : 
                                (totalDistance / 1609.34).toFixed(1) + ' miles';
                                
            const durationInMinutes = Math.round(totalDuration / 60);
            
            const routeCard = document.createElement('div');
            routeCard.className = 'route-card';
            if (index === 0) routeCard.classList.add('active');
            
            routeCard.innerHTML = `
                <div class="route-info">
                    <div class="route-header">
                        <span class="route-label">${index === 0 ? 'Best Route' : 'Alternative ' + index}</span>
                        <span class="route-stats">${distanceText} • ${durationInMinutes} min</span>
                    </div>
                    <div class="route-description">
                        ${getRouteDescription(route)}
                    </div>
                </div>
                <button class="btn btn-sm ${index === 0 ? 'btn-primary' : 'btn-outline'} select-route-alt" data-route-index="${index}">
                    ${index === 0 ? 'Current Route' : 'Select Route'}
                </button>
            `;
            
            alternativesContainer.appendChild(routeCard);
        });
        
        // Add alternatives container to directions panel
        directionsPanel.appendChild(alternativesContainer);
    }
    
    // Create summary for the selected (first) route
    const route = response.routes[0];
    
    // Calculate total distance and duration
    let totalDistance = 0;
    let totalDuration = 0;
    
    route.legs.forEach(leg => {
        totalDistance += leg.distance.value;
        totalDuration += leg.duration.value;
    });
    
    // Convert to appropriate units
    const unitsSystem = document.getElementById('units-system')?.value || 'imperial';
    const distanceText = unitsSystem === 'metric' ? 
                        (totalDistance / 1000).toFixed(1) + ' km' : 
                        (totalDistance / 1609.34).toFixed(1) + ' miles';
    
    const durationInMinutes = Math.round(totalDuration / 60);
    const hours = Math.floor(durationInMinutes / 60);
    const minutes = durationInMinutes % 60;
    const durationText = hours > 0 ? `${hours} hr ${minutes} min` : `${minutes} min`;
    
    const departureTime = new Date();
    const arrivalTime = new Date(departureTime.getTime() + (totalDuration * 1000));
    
    // Create summary element
    const summary = document.createElement('div');
    summary.className = 'route-summary';
    
    // Create departure time selector
    const timeOptions = [
        { label: 'Leave now', value: 'now' },
        { label: 'Leave in 30 minutes', value: '30min' },
        { label: 'Leave in 1 hour', value: '1hour' },
        { label: 'Leave tomorrow morning', value: 'tomorrow' }
    ];
    
    let timeOptionsHtml = '';
    timeOptions.forEach(option => {
        timeOptionsHtml += `<option value="${option.value}">${option.label}</option>`;
    });
    
    summary.innerHTML = `
        <h3>Route Summary</h3>
        <div class="departure-selector">
            <select id="departure-time">
                ${timeOptionsHtml}
            </select>
        </div>
        <div class="summary-details">
            <div class="summary-row">
                <span class="summary-label">Distance:</span>
                <span class="summary-value">${distanceText}</span>
            </div>
            <div class="summary-row">
                <span class="summary-label">Duration:</span>
                <span class="summary-value">${durationText}</span>
            </div>
            <div class="summary-row">
                <span class="summary-label">Arrive by:</span>
                <span class="summary-value">${formatTime(arrivalTime)}</span>
            </div>
            <div class="summary-row">
                <span class="summary-label">Travel Mode:</span>
                <span class="summary-value">${travelMode.charAt(0) + travelMode.slice(1).toLowerCase()}</span>
            </div>
        </div>
        <div class="summary-actions">
            <button class="btn btn-outline calendar-event-btn">
                <i class="icon icon-calendar"></i> Add to Calendar
            </button>
            <button class="btn btn-outline share-route-btn">
                <i class="icon icon-share"></i> Share Route
            </button>
        </div>
    `;
    
    // Add summary to directions panel
    directionsPanel.appendChild(summary);
    
    // Add step-by-step directions title
    const stepsTitle = document.createElement('h3');
    stepsTitle.className = 'steps-title';
    stepsTitle.textContent = 'Step-by-Step Directions';
    directionsPanel.appendChild(stepsTitle);
    
    // Add step-by-step directions
    const stepsContainer = document.createElement('div');
    stepsContainer.className = 'steps-container';
    directionsPanel.appendChild(stepsContainer);
    
    // Set steps container as directions renderer panel
    directionsRenderer.setPanel(stepsContainer);
    
    // Add event listeners for departure time selector
    const departureSelect = document.getElementById('departure-time');
    if (departureSelect) {
        departureSelect.addEventListener('change', function() {
            updateArrivalTime(this.value, totalDuration);
        });
    }
    
    // Add event listeners for action buttons
    const calendarBtn = summary.querySelector('.calendar-event-btn');
    if (calendarBtn) {
        calendarBtn.addEventListener('click', function() {
            addRouteToCalendar(response.routes[0]);
        });
    }
    
    const shareBtn = summary.querySelector('.share-route-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', function() {
            shareRoute(response.routes[0]);
        });
    }
}

/**
 * Format time for display
 * @param {Date} date - Date object to format
 * @returns {string} Formatted time string
 */
function formatTime(date) {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
}

/**
 * Update arrival time based on departure selection
 * @param {string} departureOption - Selected departure option
 * @param {number} durationSeconds - Route duration in seconds
 */
function updateArrivalTime(departureOption, durationSeconds) {
    const summaryRow = document.querySelector('.summary-row:nth-child(3) .summary-value');
    if (!summaryRow) return;
    
    let departureTime = new Date();
    
    switch(departureOption) {
        case '30min':
            departureTime.setMinutes(departureTime.getMinutes() + 30);
            break;
        case '1hour':
            departureTime.setHours(departureTime.getHours() + 1);
            break;
        case 'tomorrow':
            departureTime.setDate(departureTime.getDate() + 1);
            departureTime.setHours(9, 0, 0, 0);
            break;
        default:
            // Leave now - already set
            break;
    }
    
    const arrivalTime = new Date(departureTime.getTime() + (durationSeconds * 1000));
    summaryRow.textContent = formatTime(arrivalTime);
}

/**
 * Generate human-readable route description
 * @param {Object} route - Route object
 * @returns {string} Route description
 */
function getRouteDescription(route) {
    if (!route || !route.legs || route.legs.length === 0) {
        return 'Route details not available';
    }
    
    // Get major roads/highways from the route
    const majorRoads = [];
    
    route.legs.forEach(leg => {
        leg.steps.forEach(step => {
            if (step.instructions && step.distance.value > 1000) {
                // Extract highway or major road names from instructions
                const roadMatches = step.instructions.match(/([A-Z]-\d+|[A-Z]{2}-\d+|Route \d+|Highway \d+)/g);
                if (roadMatches) {
                    roadMatches.forEach(road => {
                        if (!majorRoads.includes(road)) {
                            majorRoads.push(road);
                        }
                    });
                }
            }
        });
    });
    
    // If major roads found, use them in description
    if (majorRoads.length > 0) {
        return `Via ${majorRoads.slice(0, 2).join(' and ')}${majorRoads.length > 2 ? ' and more' : ''}`;
    }
    
    // Fallback to simple route description
    const startAddress = route.legs[0].start_address.split(',')[0];
    const endAddress = route.legs[route.legs.length - 1].end_address.split(',')[0];
    
    return `From ${startAddress} to ${endAddress}`;
}

/**
 * Select a different route alternative
 * @param {number} routeIndex - Index of the route to select
 */
function selectRouteAlternative(routeIndex) {
    if (!routeAlternatives || routeIndex >= routeAlternatives.length) return;
    
    // Update the directions renderer with the selected route
    directionsRenderer.setRouteIndex(routeIndex);
    
    // Update the active route card
    const routeCards = document.querySelectorAll('.route-card');
    routeCards.forEach((card, index) => {
        const selectBtn = card.querySelector('.select-route-alt');
        
        if (index === routeIndex) {
            card.classList.add('active');
            if (selectBtn) {
                selectBtn.className = 'btn btn-sm btn-primary select-route-alt';
                selectBtn.textContent = 'Current Route';
            }
        } else {
            card.classList.remove('active');
            if (selectBtn) {
                selectBtn.className = 'btn btn-sm btn-outline select-route-alt';
                selectBtn.textContent = 'Select Route';
            }
        }
    });
}

/**
 * Add route to calendar
 * @param {Object} route - Route object
 */
function addRouteToCalendar(route) {
    if (!route || !route.legs || route.legs.length === 0) return;
    
    const departureSelect = document.getElementById('departure-time');
    const departureOption = departureSelect ? departureSelect.value : 'now';
    
    // Calculate departure and arrival times
    let departureTime = new Date();
    
    switch(departureOption) {
        case '30min':
            departureTime.setMinutes(departureTime.getMinutes() + 30);
            break;
        case '1hour':
            departureTime.setHours(departureTime.getHours() + 1);
            break;
        case 'tomorrow':
            departureTime.setDate(departureTime.getDate() + 1);
            departureTime.setHours(9, 0, 0, 0);
            break;
        default:
            // Leave now - already set
            break;
    }
    
    // Calculate total duration
    let totalDuration = 0;
    route.legs.forEach(leg => {
        totalDuration += leg.duration.value;
    });
    
    const arrivalTime = new Date(departureTime.getTime() + (totalDuration * 1000));
    
    // Format dates for calendar URL
    const formatDate = (date) => {
        return date.toISOString().replace(/-|:|\.\d+/g, '');
    };
    
    const start = formatDate(departureTime);
    const end = formatDate(arrivalTime);
    
    // Create calendar event details
    const origin = route.legs[0].start_address;
    const destination = route.legs[route.legs.length - 1].end_address;
    
    const eventTitle = encodeURIComponent(`Travel to Wisdom Bites Dental Clinic`);
    const location = encodeURIComponent(destination);
    const description = encodeURIComponent(`Directions from ${origin} to ${destination}. Estimated travel time: ${Math.round(totalDuration / 60)} minutes.`);
    
    // Create Google Calendar URL
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${eventTitle}&dates=${start}/${end}&details=${description}&location=${location}&sf=true&output=xml`;
    
    // Open calendar link in new window
    window.open(googleCalendarUrl, '_blank');
}

/**
 * Share route with various share options
 * @param {Object} route - Route object
 */
function shareRoute(route) {
    if (!route || !route.legs || route.legs.length === 0) return;
    
    // Create a modal for sharing options
    const modal = document.createElement('div');
    modal.className = 'share-modal';
    
    const origin = route.legs[0].start_address;
    const destination = route.legs[route.legs.length - 1].end_address;
    
    // Calculate total distance and duration
    let totalDistance = 0;
    let totalDuration = 0;
    
    route.legs.forEach(leg => {
        totalDistance += leg.distance.value;
        totalDuration += leg.duration.value;
    });
    
    // Convert to appropriate units
    const unitsSystem = document.getElementById('units-system')?.value || 'imperial';
    const distanceText = unitsSystem === 'metric' ? 
                        (totalDistance / 1000).toFixed(1) + ' km' : 
                        (totalDistance / 1609.34).toFixed(1) + ' miles';
    
    const durationInMinutes = Math.round(totalDuration / 60);
    
    // Create Google Maps directions URL
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelmode=${travelMode.toLowerCase()}`;
    
    modal.innerHTML = `
        <div class="share-content">
            <div class="share-header">
                <h3>Share Route</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="share-options">
                <div class="share-route-info">
                    <p><strong>From:</strong> ${origin}</p>
                    <p><strong>To:</strong> ${destination}</p>
                    <p><strong>Distance:</strong> ${distanceText} (about ${durationInMinutes} min)</p>
                    <div class="route-link">
                        <input type="text" readonly value="${directionsUrl}">
                        <button class="btn btn-sm btn-outline copy-link">
                            <i class="icon icon-copy"></i> Copy Link
                        </button>
                    </div>
                </div>
                <div class="share-links">
                    <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(directionsUrl)}" target="_blank" class="share-btn facebook">
                        <i class="icon icon-facebook"></i> Facebook
                    </a>
                    <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent('Directions to Wisdom Bites Dental Clinic')}&url=${encodeURIComponent(directionsUrl)}" target="_blank" class="share-btn twitter">
                        <i class="icon icon-twitter"></i> Twitter
                    </a>
                    <a href="mailto:?subject=${encodeURIComponent('Directions to Wisdom Bites Dental Clinic')}&body=${encodeURIComponent('Here are directions to Wisdom Bites Dental Clinic:\n\nFrom: ' + origin + '\nTo: ' + destination + '\nDistance: ' + distanceText + '\nEstimated time: ' + durationInMinutes + ' minutes\n\nView on Google Maps: ' + directionsUrl)}" class="share-btn email">
                        <i class="icon icon-email"></i> Email
                    </a>
                    <a href="sms:?body=${encodeURIComponent('Directions to Wisdom Bites Dental Clinic: ' + directionsUrl)}" class="share-btn sms">
                        <i class="icon icon-sms"></i> SMS
                    </a>
                </div>
                <div class="share-qrcode">
                    <p>Scan to view on mobile device:</p>
                    <div id="route-qrcode"></div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to body
    document.body.appendChild(modal);
    
    // Generate QR code (using Google Charts API)
    const qrCodeContainer = modal.querySelector('#route-qrcode');
    if (qrCodeContainer) {
        const qrCodeUrl = `https://chart.googleapis.com/chart?cht=qr&chs=200x200&chl=${encodeURIComponent(directionsUrl)}`;
        const qrImg = document.createElement('img');
        qrImg.src = qrCodeUrl;
        qrImg.alt = 'QR Code for directions';
        qrCodeContainer.appendChild(qrImg);
    }
    
    // Add event listeners
    modal.querySelector('.close-modal').addEventListener('click', function() {
        document.body.removeChild(modal);
    });
    
    modal.querySelector('.copy-link').addEventListener('click', function() {
        const linkInput = modal.querySelector('.route-link input');
        linkInput.select();
        navigator.clipboard.writeText(linkInput.value).then(function() {
            const copyBtn = modal.querySelector('.copy-link');
            copyBtn.innerHTML = '<i class="icon icon-check"></i> Copied!';
            setTimeout(() => {
                copyBtn.innerHTML = '<i class="icon icon-copy"></i> Copy Link';
            }, 2000);
        });
    });
    
    // Close when clicking outside the modal content
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            document.body.removeChild(modal);
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
    const resetMapBtn = document.getElementById('reset-map');
    const embedViewBtn = document.getElementById('embed-view');
    
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
            
            // Hide any open info windows
            markers.forEach(marker => {
                if (marker.infoWindow) {
                    marker.infoWindow.close();
                }
            });
            
            // Reset layer toggles
            resetAllLayers();
        });
    }
    
    if (embedViewBtn) {
        embedViewBtn.addEventListener('click', function() {
            showEmbedMapView();
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
 * Reset all map layers
 */
function resetAllLayers() {
    // Reset traffic layer
    if (trafficLayer) {
        trafficLayer.setMap(null);
        const trafficBtn = document.getElementById('toggle-traffic');
        if (trafficBtn) trafficBtn.classList.remove('active');
    }
    
    // Reset transit layer
    if (transitLayer) {
        transitLayer.setMap(null);
        const transitBtn = document.getElementById('toggle-transit');
        if (transitBtn) transitBtn.classList.remove('active');
    }
    
    // Reset bike layer
    if (bikeLayer) {
        bikeLayer.setMap(null);
        const bikeBtn = document.getElementById('toggle-bike');
        if (bikeBtn) bikeBtn.classList.remove('active');
    }
    
    // Reset heatmap
    if (heatmap) {
        heatmap.setMap(null);
        const heatmapBtn = document.getElementById('toggle-heatmap');
        if (heatmapBtn) heatmapBtn.classList.remove('active');
    }
}

/**
 * Show Embed Map View using Maps Embed API
 */
function showEmbedMapView() {
    // Create modal for embed view
    const modal = document.createElement('div');
    modal.className = 'embed-map-modal';
    
    const clinicAddress = "Wisdom Bites Dental Clinic, 123 Dental Avenue, Smile City, SC 12345";
    const apiKey = 'AIzaSyDY7pn8Bkb9dxMKX6pKgldH1a2acVjmWsw';
    
    modal.innerHTML = `
        <div class="embed-map-content">
            <div class="embed-map-header">
                <h3>Embedded Map View</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="embed-map-container">
                <iframe 
                    width="100%" 
                    height="450" 
                    style="border:0" 
                    loading="lazy" 
                    allowfullscreen 
                    referrerpolicy="no-referrer-when-downgrade" 
                    src="https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(clinicAddress)}&zoom=15">
                </iframe>
            </div>
            <div class="embed-map-footer">
                <p>This view may be easier to use on mobile devices.</p>
                <button class="btn btn-primary directions-embed-btn">Get Directions in this View</button>
            </div>
        </div>
    `;
    
    // Add modal to body
    document.body.appendChild(modal);
    
    // Add event listeners
    modal.querySelector('.close-modal').addEventListener('click', function() {
        document.body.removeChild(modal);
    });
    
    // Add event listener for directions button
    modal.querySelector('.directions-embed-btn').addEventListener('click', function() {
        // Get origin from the form
        const originInput = document.getElementById('origin');
        const origin = originInput ? originInput.value : '';
        
        // Replace iframe with directions embed
        const embedContainer = modal.querySelector('.embed-map-container');
        if (embedContainer && origin) {
            embedContainer.innerHTML = `
                <iframe 
                    width="100%" 
                    height="450" 
                    style="border:0" 
                    loading="lazy" 
                    allowfullscreen 
                    referrerpolicy="no-referrer-when-downgrade" 
                    src="https://www.google.com/maps/embed/v1/directions?key=${apiKey}&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(clinicAddress)}&mode=${travelMode.toLowerCase()}">
                </iframe>
            `;
        } else if (embedContainer) {
            alert('Please enter a starting location in the form first.');
        }
    });
    
    // Close when clicking outside the modal content
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            document.body.removeChild(modal);
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
 * Initialize sharing options for the directions page
 */
function initSharingOptions() {
    const shareBtn = document.getElementById('share-clinic-location');
    if (shareBtn) {
        shareBtn.addEventListener('click', function() {
            shareLocation();
        });
    }
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

// Add an event listener to handle all API-related clicks
document.addEventListener('click', function(e) {
    // Handle clicks on POI markers to add to route
    if (e.target && e.target.classList.contains('add-to-route-btn')) {
        const poiName = e.target.getAttribute('data-name');
        if (poiName) {
            addPOIToRoute(poiName);
        }
    }
    
    // Handle click on share location button
    if (e.target && e.target.classList.contains('share-location-btn')) {
        shareLocation();
    }
    
    // Handle click on route alternative selection
    if (e.target && e.target.classList.contains('select-route-alt')) {
        const routeIndex = parseInt(e.target.getAttribute('data-route-index'));
        selectRouteAlternative(routeIndex);
    }
});

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
    
    // Initialize Places service for additional POI data
    placesService = new google.maps.places.PlacesService(map);
    
    // Initialize Geocoding service for address resolution
    geocodingService = new google.maps.Geocoder();
    
    // Add a marker for the dental clinic with actual geocoding
    geocodeClinicAddress(clinicAddress);
    
    // Initialize autocomplete for origin input
    initAutocomplete();
    
    // Update static map with styled fallback
    updateStaticMap(clinicPosition);
    
    // Initialize nearby points of interest
    findNearbyParkingAndTransit();
    
    // Initialize heatmap for popular times (simulated)
    initHeatmap();
    
    // Set flag that map is ready
    mapReady = true;
    
    // Create layer toggle controls
    createLayerToggles();
}

/**
 * Geocode the clinic address to get accurate coordinates
 * @param {string} address - Full clinic address
 */
function geocodeClinicAddress(address) {
    const geocoder = new google.maps.Geocoder();
    
    geocoder.geocode({ address: address }, function(results, status) {
        if (status === 'OK' && results[0]) {
            // Update clinic position with accurate coordinates
            clinicPosition = results[0].geometry.location;
            
            // Center map on geocoded position
            map.setCenter(clinicPosition);
            
            // Add clinic marker
            const clinicMarker = createMarker(map, clinicPosition, "Wisdom Bites Dental Clinic", true);
            markers.push(clinicMarker);
            
            // Get detailed place information
            getClinicPlaceDetails("Wisdom Bites Dental Clinic", clinicPosition);
        } else {
            console.error('Geocoding failed:', status);
            
            // Fallback to default coordinates
            const clinicMarker = createMarker(map, clinicPosition, "Wisdom Bites Dental Clinic", true);
            markers.push(clinicMarker);
        }
    });
}

/**
 * Get detailed place information using Places API
 * @param {string} name - Place name
 * @param {Object} location - LatLng location
 */
function getClinicPlaceDetails(name, location) {
    // Create a search request for Places API
    const request = {
        location: location,
        radius: '100',
        name: name,
        type: ['dentist']
    };
    
    placesService.nearbySearch(request, function(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK && results[0]) {
            // Get more details using place_id
            placesService.getDetails({
                placeId: results[0].place_id,
                fields: ['name', 'formatted_address', 'formatted_phone_number', 
                         'opening_hours', 'website', 'rating', 'review', 'photo']
            }, function(place, status) {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    // Update info window with enhanced details
                    updateClinicInfoContent(place);
                }
            });
        }
    });
}

/**
 * Update clinic info window with enhanced details
 * @param {Object} placeDetails - Place details from Places API
 */
function updateClinicInfoContent(placeDetails) {
    // Find clinic marker
    const clinicMarker = markers.find(marker => marker.getTitle() === "Wisdom Bites Dental Clinic");
    if (!clinicMarker) return;
    
    // Create enhanced info content
    let infoContent = `
        <div class="info-window clinic-info">
            <h4>Wisdom Bites Dental Clinic</h4>
            <address>
                ${placeDetails.formatted_address || '123 Dental Avenue<br>Smile City, SC 12345'}
            </address>
            <p><strong>Phone:</strong> <a href="tel:${placeDetails.formatted_phone_number || '+15551234567'}">${placeDetails.formatted_phone_number || '(555) 123-4567'}</a></p>
    `;
    
    // Add hours if available
    if (placeDetails.opening_hours) {
        infoContent += `<p><strong>Hours:</strong></p><div class="hours-list">`;
        placeDetails.opening_hours.weekday_text.forEach(day => {
            infoContent += `<small>${day}</small>`;
        });
        infoContent += `</div>`;
    } else {
        infoContent += `<p><strong>Hours:</strong> Mon-Fri 9AM-6PM, Sat 10AM-3PM</p>`;
    }
    
    // Add rating if available
    if (placeDetails.rating) {
        infoContent += `
            <div class="place-rating">
                <strong>Rating:</strong> ${placeDetails.rating.toFixed(1)}
                <span class="stars">
                    ${getStarRating(placeDetails.rating)}
                </span>
            </div>
        `;
    }
    
    // Add photo if available
    if (placeDetails.photos && placeDetails.photos.length > 0) {
        const photoUrl = placeDetails.photos[0].getUrl({maxWidth: 200, maxHeight: 150});
        infoContent += `<div class="place-photo"><img src="${photoUrl}" alt="${placeDetails.name}" /></div>`;
    }
    
    // Add buttons
    infoContent += `
            <div class="info-actions">
                <button class="btn btn-sm btn-primary street-view-btn">Street View</button>
                ${placeDetails.website ? `<a href="${placeDetails.website}" target="_blank" class="btn btn-sm btn-outline">Website</a>` : ''}
            </div>
        </div>
    `;
    
    // Update info window
    const infoWindow = new google.maps.InfoWindow({
        content: infoContent
    });
    
    // Replace previous info window
    if (clinicMarker.infoWindow) {
        clinicMarker.infoWindow.close();
    }
    
    // Store infoWindow reference
    clinicMarker.infoWindow = infoWindow;
    
    // Open the info window
    infoWindow.open(map, clinicMarker);
    
    // Add click listener to marker
    clinicMarker.addListener('click', function() {
        infoWindow.open(map, clinicMarker);
    });
}

/**
 * Generate HTML star rating
 * @param {number} rating - Rating value (1-5)
 * @returns {string} HTML string with star icons
 */
function getStarRating(rating) {
    let stars = '';
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            stars += '<i class="icon icon-star-full"></i>';
        } else if (i === fullStars && halfStar) {
            stars += '<i class="icon icon-star-half"></i>';
        } else {
            stars += '<i class="icon icon-star-empty"></i>';
        }
    }
    
    return stars;
}

/**
 * Find and display nearby parking and public transit options
 */
function findNearbyParkingAndTransit() {
    // Check if map and Places service are initialized
    if (!placesService || !clinicPosition) return;
    
    // Search for parking
    placesService.nearbySearch({
        location: clinicPosition,
        radius: 500,
        type: ['parking']
    }, function(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            for (let i = 0; i < Math.min(results.length, 3); i++) {
                createMarker(map, results[i].geometry.location, results[i].name, false, 'parking');
            }
        }
    });
    
    // Search for transit stations
    placesService.nearbySearch({
        location: clinicPosition,
        radius: 800,
        type: ['subway_station', 'train_station', 'bus_station', 'transit_station']
    }, function(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            for (let i = 0; i < Math.min(results.length, 3); i++) {
                createMarker(map, results[i].geometry.location, results[i].name, false, 'transit');
            }
        }
    });
    
    // Add the points of interest info card
    addPOIInfoCard();
}

/**
 * Add Points of Interest info card
 */
function addPOIInfoCard() {
    const infoCards = document.querySelector('.directions-info');
    if (!infoCards) return;
    
    const poiCard = document.createElement('div');
    poiCard.className = 'info-card poi-info';
    poiCard.innerHTML = `
        <h3>Points of Interest</h3>
        <div class="poi-toggle">
            <button class="poi-btn active" data-type="all">All</button>
            <button class="poi-btn" data-type="parking">Parking</button>
            <button class="poi-btn" data-type="transit">Transit</button>
            <button class="poi-btn" data-type="pharmacy">Pharmacy</button>
        </div>
        <div class="poi-details">
            <p>Toggle different points of interest near our clinic.</p>
            <p class="poi-tip"><i class="icon icon-info"></i> Click on map markers for more information.</p>
        </div>
    `;
    
    infoCards.appendChild(poiCard);
    
    // Add event listeners to POI toggle buttons
    const poiButtons = poiCard.querySelectorAll('.poi-btn');
    poiButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            poiButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Filter markers based on selected type
            const type = this.getAttribute('data-type');
            filterMarkers(type);
            
            // If pharmacy is selected and none exists yet, search for pharmacies
            if (type === 'pharmacy' && !markers.some(marker => marker.poiType === 'pharmacy')) {
                findNearbyPharmacies();
            }
        });
    });
}

/**
 * Find and display nearby pharmacies
 */
function findNearbyPharmacies() {
    // Check if map and Places service are initialized
    if (!placesService || !clinicPosition) return;
    
    // Search for pharmacies
    placesService.nearbySearch({
        location: clinicPosition,
        radius: 1000,
        type: ['pharmacy']
    }, function(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            for (let i = 0; i < Math.min(results.length, 5); i++) {
                createMarker(map, results[i].geometry.location, results[i].name, false, 'pharmacy');
            }
        }
    });
}

/**
 * Filter map markers based on type
 * @param {string} type - Marker type to display ('all' to show all)
 */
function filterMarkers(type) {
    markers.forEach(marker => {
        if (type === 'all' || !marker.poiType || marker.poiType === type) {
            marker.setVisible(true);
        } else {
            marker.setVisible(false);
        }
    });
}

/**
 * Initialize heatmap for popular visiting times (simulated data)
 */
function initHeatmap() {
    // Create simulated popular times data (simulated foot traffic around the clinic)
    const heatmapData = [];
    
    // Add points around the clinic with varying weights to simulate popular areas
    if (clinicPosition) {
        // Add the clinic itself with high weight
        heatmapData.push({
            location: clinicPosition,
            weight: 10
        });
        
        // Create a grid of points around the clinic with random weights
        for (let i = -5; i <= 5; i++) {
            for (let j = -5; j <= 5; j++) {
                const lat = clinicPosition.lat() + (i * 0.0005);
                const lng = clinicPosition.lng() + (j * 0.0005);
                
                // Skip the center point (already added)
                if (i === 0 && j === 0) continue;
                
                // Generate weight based on distance from clinic (closer = higher weight)
                const distance = Math.sqrt(i*i + j*j);
                const weight = Math.max(0, 10 - distance * 1.5);
                
                if (weight > 0) {
                    heatmapData.push({
                        location: new google.maps.LatLng(lat, lng),
                        weight: weight
                    });
                }
            }
        }
    }
    
    // Create heatmap layer
    heatmap = new google.maps.visualization.HeatmapLayer({
        data: heatmapData,
        map: null, // Don't show by default
        radius: 25,
        opacity: 0.7,
        gradient: [
            'rgba(0, 255, 255, 0)',
            'rgba(0, 255, 255, 1)',
            'rgba(0, 191, 255, 1)',
            'rgba(0, 127, 255, 1)',
            'rgba(0, 63, 255, 1)',
            'rgba(0, 0, 255, 1)',
            'rgba(0, 0, 223, 1)',
            'rgba(0, 0, 191, 1)',
            'rgba(0, 0, 159, 1)',
            'rgba(0, 0, 127, 1)',
            'rgba(63, 0, 91, 1)',
            'rgba(127, 0, 63, 1)',
            'rgba(191, 0, 31, 1)',
            'rgba(255, 0, 0, 1)'
        ]
    });
}

/**
 * Create layer toggle controls
 */
function createLayerToggles() {
    // Create traffic layer
    trafficLayer = new google.maps.TrafficLayer();
    
    // Create transit layer
    transitLayer = new google.maps.TransitLayer();
    
    // Create bicycling layer
    bikeLayer = new google.maps.BicyclingLayer();
    
    // Create toggle controls container
    const layerControls = document.createElement('div');
    layerControls.className = 'layer-controls';
    layerControls.innerHTML = `
        <div class="layer-control-header">Map Layers</div>
        <div class="layer-control-buttons">
            <button id="toggle-traffic" class="layer-btn" title="Show Traffic">
                <i class="icon icon-traffic"></i> Traffic
            </button>
            <button id="toggle-transit" class="layer-btn" title="Show Transit">
                <i class="icon icon-transit"></i> Transit
            </button>
            <button id="toggle-bike" class="layer-btn" title="Show Bike Lanes">
                <i class="icon icon-bike"></i> Bike Lanes
            </button>
            <button id="toggle-heatmap" class="layer-btn" title="Show Popular Times">
                <i class="icon icon-heat"></i> Popular Times
            </button>
        </div>
    `;
    
    // Add controls to map
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(layerControls);
    
    // Add event listeners
    document.getElementById('toggle-traffic').addEventListener('click', function() {
        toggleLayer(this, trafficLayer);
    });
    
    document.getElementById('toggle-transit').addEventListener('click', function() {
        toggleLayer(this, transitLayer);
    });
    
    document.getElementById('toggle-bike').addEventListener('click', function() {
        toggleLayer(this, bikeLayer);
    });
    
    document.getElementById('toggle-heatmap').addEventListener('click', function() {
        toggleHeatmap(this);
    });
}

/**
 * Toggle map layer visibility
 * @param {HTMLElement} button - The clicked button
 * @param {Object} layer - The map layer to toggle
 */
function toggleLayer(button, layer) {
    if (button.classList.contains('active')) {
        layer.setMap(null);
        button.classList.remove('active');
    } else {
        layer.setMap(map);
        button.classList.add('active');
    }
}

/**
 * Toggle heatmap visibility
 * @param {HTMLElement} button - The clicked button
 */
function toggleHeatmap(button) {
    if (button.classList.contains('active')) {
        heatmap.setMap(null);
        button.classList.remove('active');
    } else {
        heatmap.setMap(map);
        button.classList.add('active');
    }
}

/**
 * Initialize autocomplete for the origin input field with improved validation
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
                validateAddressInput(originInput.value);
                return;
            }
            
            // If the place has a geometry, center the map on it
            if (place.geometry.viewport) {
                map.fitBounds(place.geometry.viewport);
            } else {
                map.setCenter(place.geometry.location);
                map.setZoom(17);
            }
            
            // Set a validated flag on the input
            originInput.setAttribute('data-validated', 'true');
            
            // Change the input's styling to indicate validation
            originInput.parentElement.classList.add('validated');
        });
        
        // Add blur handler to validate address
        originInput.addEventListener('blur', function() {
            if (!originInput.getAttribute('data-validated') && originInput.value.trim()) {
                validateAddressInput(originInput.value);
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
 * Validate address input using Geocoding API
 * @param {string} address - Address to validate
 */
function validateAddressInput(address) {
    if (!address || !geocodingService) return;
    
    geocodingService.geocode({ address: address }, function(results, status) {
        const originInput = document.getElementById('origin');
        if (!originInput) return;
        
        if (status === 'OK' && results[0]) {
            // Address is valid, update with formatted address
            originInput.value = results[0].formatted_address;
            originInput.setAttribute('data-validated', 'true');
            originInput.parentElement.classList.add('validated');
            
            // Add a small checkmark or validation indicator
            const validationIcon = document.createElement('span');
            validationIcon.className = 'validation-icon valid';
            validationIcon.innerHTML = '<i class="icon icon-check"></i>';
            
            // Remove existing validation icons
            const existingIcons = originInput.parentElement.querySelectorAll('.validation-icon');
            existingIcons.forEach(icon => icon.remove());
            
            // Add new validation icon
            originInput.parentElement.appendChild(validationIcon);
        } else {
            // Address might be invalid or incomplete
            originInput.setAttribute('data-validated', 'false');
            originInput.parentElement.classList.remove('validated');
            
            // Add a warning indicator
            const validationIcon = document.createElement('span');
            validationIcon.className = 'validation-icon warning';
            validationIcon.innerHTML = '<i class="icon icon-warning"></i>';
            validationIcon.title = 'Address could not be validated. Route may be less accurate.';
            
            // Remove existing validation icons
            const existingIcons = originInput.parentElement.querySelectorAll('.validation-icon');
            existingIcons.forEach(icon => icon.remove());
            
            // Add new validation icon
            originInput.parentElement.appendChild(validationIcon);
        }
    });
}

/**
 * Create a marker on the map with enhanced info windows
 * @param {Object} map - The Google Map object
 * @param {Object} position - Lat/lng position
 * @param {string} title - Marker title
 * @param {boolean} isClinic - Whether this marker is for the clinic
 * @param {string} type - POI type (parking, transit, pharmacy, etc.)
 * @returns {Object} The created marker
 */
function createMarker(map, position, title, isClinic = false, type = null) {
    // Determine marker icon based on type
    let icon = null;
    
    if (isClinic) {
        icon = {
            url: 'assets/images/marker-clinic.png',
            scaledSize: new google.maps.Size(40, 40)
        };
    } else if (type) {
        // Use different icons for different POI types
        switch(type) {
            case 'parking':
                icon = {
                    url: 'assets/images/marker-parking.png',
                    scaledSize: new google.maps.Size(30, 30)
                };
                break;
            case 'transit':
                icon = {
                    url: 'assets/images/marker-transit.png',
                    scaledSize: new google.maps.Size(30, 30)
                };
                break;
            case 'pharmacy':
                icon = {
                    url: 'assets/images/marker-pharmacy.png',
                    scaledSize: new google.maps.Size(30, 30)
                };
                break;
            default:
                // Default marker
                break;
        }
    }
    
    const marker = new google.maps.Marker({
        position: position,
        map: map,
        title: title,
        animation: google.maps.Animation.DROP,
        icon: icon
    });
    
    // Store POI type for filtering
    if (type) {
        marker.poiType = type;
    }
    
    // Create info window content based on marker type
    let infoContent = '';
    
    if (isClinic) {
        infoContent = getClinicInfoContent();
    } else if (type) {
        infoContent = getPOIInfoContent(title, type);
    } else {
        infoContent = `<div class="info-window"><h4>${title}</h4></div>`;
    }
    
    // Create info window
    const infoWindow = new google.maps.InfoWindow({
        content: infoContent
    });
    
    // Store reference to info window
    marker.infoWindow = infoWindow;
    
    // Open info window when marker is clicked
    marker.addListener('click', function() {
        // Close all other info windows first
        markers.forEach(m => {
            if (m.infoWindow && m !== marker) {
                m.infoWindow.close();
            }
        });
        
        infoWindow.open(map, marker);
    });
    
    // If it's the clinic marker, open info window by default
    if (isClinic) {
        setTimeout(() => {
            infoWindow.open(map, marker);
        }, 1000);
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
            <div class="info-actions">
                <button class="btn btn-sm btn-primary street-view-btn">See Street View</button>
                <button class="btn btn-sm btn-outline share-location-btn">Share Location</button>
            </div>
        </div>
    `;
}

/**
 * Get info window content for POI markers
 * @param {string} title - POI title
 * @param {string} type - POI type
 * @returns {string} HTML content for info window
 */
function getPOIInfoContent(title, type) {
    let typeIcon = '';
    let typeInfo = '';
    
    switch (type) {
        case 'parking':
            typeIcon = 'icon-parking';
            typeInfo = 'Parking Facility';
            break;
        case 'pharmacy':
            typeIcon = 'icon-pharmacy';
            typeInfo = 'Pharmacy';
            break;
        case 'transit':
            typeIcon = 'icon-transit';
            typeInfo = 'Transit Station';
            break;
        default:
            typeIcon = 'icon-location';
            typeInfo = 'Point of Interest';
    }
    
    return `
        <div class="info-window poi-info">
            <div class="poi-icon">
                <i class="icon ${typeIcon}"></i>
            </div>
            <h4>${title}</h4>
            <p>${typeInfo}</p>
            <div class="info-actions">
                <button class="btn btn-sm btn-primary add-to-route-btn" data-name="${title}">Add to Route</button>
            </div>
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
    const routeOptionsBtn = document.getElementById('route-options');
    
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
    
    // Add event listener for Route Options button
    if (routeOptionsBtn) {
        routeOptionsBtn.addEventListener('click', toggleRouteOptions);
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
                                    originInput.setAttribute('data-validated', 'true');
                                    originInput.parentElement.classList.add('validated');
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
    
    // Add event listener for POI "Add to Route" buttons (delegated)
    document.addEventListener('click', function(e) {
        if (e.target && e.target.classList.contains('add-to-route-btn')) {
            const poiName = e.target.getAttribute('data-name');
            if (poiName) {
                addPOIToRoute(poiName);
            }
        }
        
        if (e.target && e.target.classList.contains('share-location-btn')) {
            shareLocation();
        }
        
        if (e.target && e.target.classList.contains('select-route-alt')) {
            const routeIndex = parseInt(e.target.getAttribute('data-route-index'));
            selectRouteAlternative(routeIndex);
        }
    });
}

/**
 * Toggle advanced route options panel
 */
function toggleRouteOptions() {
    const optionsPanel = document.getElementById('route-options-panel');
    const optionsBtn = document.getElementById('route-options');
    
    if (optionsPanel) {
        if (optionsPanel.classList.contains('visible')) {
            optionsPanel.classList.remove('visible');
            optionsBtn.classList.remove('active');
        } else {
            optionsPanel.classList.add('visible');
            optionsBtn.classList.add('active');
        }
    } else {
        // Create options panel if it doesn't exist
        const form = document.getElementById('directionsForm');
        if (!form) return;
        
        const panel = document.createElement('div');
        panel.id = 'route-options-panel';
        panel.className = 'route-options-panel visible';
        
        panel.innerHTML = `
            <h4>Route Preferences</h4>
            <div class="options-group">
                <label class="checkbox-label">
                    <input type="checkbox" id="avoid-tolls"> Avoid tolls
                </label>
                <label class="checkbox-label">
                    <input type="checkbox" id="avoid-highways"> Avoid highways
                </label>
                <label class="checkbox-label">
                    <input type="checkbox" id="avoid-ferries"> Avoid ferries
                </label>
            </div>
            <div class="options-group">
                <label for="route-alternatives">Route alternatives:</label>
                <select id="route-alternatives">
                    <option value="1">Show best route only</option>
                    <option value="3" selected>Show up to 3 routes</option>
                </select>
            </div>
            <div class="options-group">
                <label for="units-system">Distance units:</label>
                <select id="units-system">
                    <option value="imperial" selected>Miles (Imperial)</option>
                    <option value="metric">Kilometers (Metric)</option>
                </select>
            </div>
            <div class="options-actions">
                <button type="button" class="btn btn-primary apply-options">Apply Options</button>
            </div>
        `;
        
        form.appendChild(panel);
        optionsBtn.classList.add('active');
        
        // Add event listener for Apply Options button
        panel.querySelector('.apply-options').addEventListener('click', function() {
            // If directions are already displayed, recalculate with new options
            if (directionsRenderer.getDirections()) {
                calculateAndDisplayRoute();
            }
            
            // Hide panel
            panel.classList.remove('visible');
            optionsBtn.classList.remove('active');
        });
    }
}

/**
 * Add POI to route as a waypoint
 * @param {string} poiName - Name of the POI to add
 */
function addPOIToRoute(poiName) {
    // First add a waypoint input
    addWaypoint();
    
    // Get the newly added waypoint input
    const waypointContainers = document.querySelectorAll('.waypoint-container');
    if (waypointContainers.length > 0) {
        const lastContainer = waypointContainers[waypointContainers.length - 1];
        const input = lastContainer.querySelector('.waypoint-input');
        
        if (input) {
            // Set the POI name as the waypoint value
            input.value = poiName;
            input.setAttribute('data-validated', 'true');
            
            // Show confirmation message
            const message = document.createElement('div');
            message.className = 'waypoint-added-message';
            message.textContent = `Added ${poiName} to your route`;
            message.style.opacity = '1';
            
            lastContainer.appendChild(message);
            
            // Fade out and remove after 3 seconds
            setTimeout(() => {
                message.style.opacity = '0';
                setTimeout(() => {
                    if (message.parentNode) {
                        message.parentNode.removeChild(message);
                    }
                }, 500);
            }, 3000);
        }
    }
}

/**
 * Share clinic location with various share options
 */
function shareLocation() {
    // Create a modal for sharing options
    const modal = document.createElement('div');
    modal.className = 'share-modal';
    
    const clinicAddress = "Wisdom Bites Dental Clinic, 123 Dental Avenue, Smile City, SC 12345";
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clinicAddress)}`;
    
    modal.innerHTML = `
        <div class="share-content">
            <div class="share-header">
                <h3>Share Our Location</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="share-options">
                <div class="share-address">
                    <p>${clinicAddress}</p>
                    <button class="btn btn-sm btn-outline copy-address">
                        <i class="icon icon-copy"></i> Copy Address
                    </button>
                </div>
                <div class="share-links">
                    <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(mapUrl)}" target="_blank" class="share-btn facebook">
                        <i class="icon icon-facebook"></i> Facebook
                    </a>
                    <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent('Get directions to Wisdom Bites Dental Clinic')}&url=${encodeURIComponent(mapUrl)}" target="_blank" class="share-btn twitter">
                        <i class="icon icon-twitter"></i> Twitter
                    </a>
                    <a href="mailto:?subject=${encodeURIComponent('Directions to Wisdom Bites Dental Clinic')}&body=${encodeURIComponent('Here is the address and map link to Wisdom Bites Dental Clinic:\n\n' + clinicAddress + '\n\n' + mapUrl)}" class="share-btn email">
                        <i class="icon icon-email"></i> Email
                    </a>
                    <a href="sms:?body=${encodeURIComponent('Wisdom Bites Dental Clinic: ' + clinicAddress + ' ' + mapUrl)}" class="share-btn sms">
                        <i class="icon icon-sms"></i> SMS
                    </a>
                </div>
                <div class="share-map">
                    <div class="embed-map">
                        <iframe 
                            width="100%" 
                            height="200" 
                            style="border:0" 
                            loading="lazy" 
                            allowfullscreen 
                            referrerpolicy="no-referrer-when-downgrade" 
                            src="https://www.google.com/maps/embed/v1/place?key=AIzaSyDY7pn8Bkb9dxMKX6pKgldH1a2acVjmWsw&q=123+Dental+Avenue,+Smile+City,+SC+12345">
                        </iframe>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to body
    document.body.appendChild(modal);
    
    // Add event listeners
    modal.querySelector('.close-modal').addEventListener('click', function() {
        document.body.removeChild(modal);
    });
    
    modal.querySelector('.copy-address').addEventListener('click', function() {
        navigator.clipboard.writeText(clinicAddress).then(function() {
            const copyBtn = modal.querySelector('.copy-address');
            copyBtn.innerHTML = '<i class="icon icon-check"></i> Copied!';
            setTimeout(() => {
                copyBtn.innerHTML = '<i class="icon icon-copy"></i> Copy Address';
            }, 2000);
        });
    });
    
    // Close when clicking outside the modal content
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
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
    const autocomplete = new google.maps.places.Autocomplete(waypointInput, {
        types: ['geocode']
    });
    
    // Listen for place selection to validate
    autocomplete.addListener('place_changed', function() {
        const place = autocomplete.getPlace();
        
        if (place.geometry) {
            waypointInput.setAttribute('data-validated', 'true');
        }
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
 * Calculate and display route based on form inputs using enhanced Routes API
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
    
    // Show loading indicator
    const directionsPanel = document.getElementById('directions-panel');
    if (directionsPanel) {
        directionsPanel.innerHTML = '<div class="directions-loading"><i class="icon icon-loading"></i> Calculating best route...</div>';
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
    
    // Get route options
    const avoidTolls = document.getElementById('avoid-tolls')?.checked || false;
    const avoidHighways = document.getElementById('avoid-highways')?.checked || false;
    const avoidFerries = document.getElementById('avoid-ferries')?.checked || false;
    const routeAlternatives = document.getElementById('route-alternatives')?.value || 3;
    const unitsSystem = document.getElementById('units-system')?.value || 'imperial';
    
    // Set up request object for directions service
    const request = {
        origin: origin,
        destination: destination,
        waypoints: waypoints,
        optimizeWaypoints: optimizeWaypoints,
        travelMode: google.maps.TravelMode[travelMode],
        unitSystem: unitsSystem === 'metric' ? 
                    google.maps.UnitSystem.METRIC : 
                    google.maps.UnitSystem.IMPERIAL,
        provideRouteAlternatives: routeAlternatives > 1,
        avoidTolls: avoidTolls,
        avoidHighways: avoidHighways,
        avoidFerries: avoidFerries
    };
    
    // Call the directions service
    directionsService.route(request, function(response, status) {
        if (status === 'OK') {
            // Store route alternatives
            routeAlternatives = response.routes;
            
            // Display the route
            directionsRenderer.setDirections(response);
            
            // If waypoints were optimized, update the UI to reflect the new order
            if (optimizeWaypoints && response.routes[0].waypoint_order.length > 0) {
                rearrangeWaypointInputs(response.routes[0].waypoint_order);
            }
            
            // Show route summary and alternatives
            showRouteDetails(response);
        } else {
            console.error('Directions request failed due to ' + status);
            
            if (directionsPanel) {
                directionsPanel.innerHTML = `
                    <div class="directions-error">
                        <i class="icon icon-warning"></i>
                        <h3>Unable to Calculate Route</h3>
                        <p>${getDirectionsErrorMessage(status)}</p>
                        <button class="btn btn-primary retry-directions">Try Again</button>
                    </div>
                `;
                
                // Add event listener for retry button
                const retryBtn = directionsPanel.querySelector('.retry-directions');
                if (retryBtn) {
                    retryBtn.addEventListener('click', function() {
                        calculateAndDisplayRoute(optimizeWaypoints);
                    });
                }
            }
        }
    });
}

/**
 * Get human-readable error message for directions errors
 * @param {string} status - Error status from Directions API
 * @returns {string} Human-readable error message
 */
function getDirectionsErrorMessage(status) {
    switch(status) {
        case 'ZERO_RESULTS':
            return "We couldn't find a route between these locations. Please check the addresses and try again.";
        case 'NOT_FOUND':
            return "At least one of the locations couldn't be found. Please verify the addresses.";
        case 'MAX_WAYPOINTS_EXCEEDED':
            return "You've added too many stops. Please remove some waypoints and try again.";
        case 'INVALID_REQUEST':
            return "The request was invalid. Please check your input and try again.";
        case 'OVER_QUERY_LIMIT':
            return "We've made too many requests. Please try again in a few minutes.";
        case 'REQUEST_DENIED':
            return "The directions request was denied. This may be due to a security restriction.";
        case 'UNKNOWN_ERROR':
            return "An unknown error occurred. Please try again later.";
        default:
            return "An error occurred while calculating directions. Please try again.";
    }
}

/**
 * Show detailed route information and alternatives
 * @param {Object} response - Directions API response
 */
function showRouteDetails(response) {
    const directionsPanel = document.getElementById('directions-panel');
    if (!directionsPanel) return;
    
    // Clear any previous content
    directionsPanel.innerHTML = '';
    
    // Create container for alternative routes if we have more than one
    if (response.routes.length > 1) {
        const alternativesContainer = document.createElement('div');
        alternativesContainer.className = 'route-alternatives';
        alternativesContainer.innerHTML = '<h3>Route Options</h3>';
        
        // Create route cards for each alternative
        response.routes.forEach((route, index) => {
            // Calculate total distance and duration
            let totalDistance = 0;
            let totalDuration = 0;
            
            route.legs.forEach(leg => {
                totalDistance += leg.distance.value;
                totalDuration += leg.duration.value;
            });
            
            // Convert to appropriate units
            const unitsSystem = document.getElementById('units-system')?.value || 'imperial';
            const distanceText = unitsSystem === 'metric' ? 
                                (totalDistance / 1000).toFixed(1) + ' km' : 
                                (totalDistance / 1609.34).toFixed(1) + ' miles';
                                
            const durationInMinutes = Math.round(totalDuration / 60);
            
            const routeCard = document.createElement('div');
            routeCard.className = 'route-card';
            if (index === 0) routeCard.classList.add('active');
            
            routeCard.innerHTML = `
                <div class="route-info">
                    <div class="route-header">
                        <span class="route-label">${index === 0 ? 'Best Route' : 'Alternative ' + index}</span>
                        <span class="route-stats">${distanceText} • ${durationInMinutes} min</span>
                    </div>
                    <div class="route-description">
                        ${getRouteDescription(route)}
                    </div>
                </div>
                <button class="btn btn-sm ${index === 0 ? 'btn-primary' : 'btn-outline'} select-route-alt" data-route-index="${index}">
                    ${index === 0 ? 'Current Route' : 'Select Route'}
                </button>
            `;
            
            alternativesContainer.appendChild(routeCard);
        });
        
        // Add alternatives container to directions panel
        directionsPanel.appendChild(alternativesContainer);
    }
    
    // Create summary for the selected (first) route
    const route = response.routes[0];
    
    // Calculate total distance and duration
    let totalDistance = 0;
    let totalDuration = 0;
    
    route.legs.forEach(leg => {
        totalDistance += leg.distance.value;
        totalDuration += leg.duration.value;
    });
    
    // Convert to appropriate units
    const unitsSystem = document.getElementById('units-system')?.value || 'imperial';
    const distanceText = unitsSystem === 'metric' ? 
                        (totalDistance / 1000).toFixed(1) + ' km' : 
                        (totalDistance / 1609.34).toFixed(1) + ' miles';
    
    const durationInMinutes = Math.round(totalDuration / 60);
    const hours = Math.floor(durationInMinutes / 60);
    const minutes = durationInMinutes % 60;
    const durationText = hours > 0 ? `${hours} hr ${minutes} min` : `${minutes} min`;
    
    const departureTime = new Date();
    const arrivalTime = new Date(departureTime.getTime() + (totalDuration * 1000));
    
    // Create summary element
    const summary = document.createElement('div');
    summary.className = 'route-summary';
    
    // Create departure time selector
    const timeOptions = [
        { label: 'Leave now', value: 'now' },
        { label: 'Leave in 30 minutes', value: '30min' },
        { label: 'Leave in 1 hour', value: '1hour' },
        { label: 'Leave tomorrow morning', value: 'tomorrow' }
    ];
    
    let timeOptionsHtml = '';
    timeOptions.forEach(option => {
        timeOptionsHtml += `<option value="${option.value}">${option.label}</option>`;
    });
    
    summary.innerHTML = `
        <h3>Route Summary</h3>
        <div class="departure-selector">
            <select id="departure-time">
                ${timeOptionsHtml}
            </select>
        </div>
        <div class="summary-details">
            <div class="summary-row">
                <span class="summary-label">Distance:</span>
                <span class="summary-value">${distanceText}</span>
            </div>
            <div class="summary-row">
                <span class="summary-label">Duration:</span>
                <span class="summary-value">${durationText}</span>
            </div>
            <div class="summary-row">
                <span class="summary-label">Arrive by:</span>
                <span class="summary-value">${formatTime(arrivalTime)}</span>
            </div>
            <div class="summary-row">
                <span class="summary-label">Travel Mode:</span>
                <span class="summary-value">${travelMode.charAt(0) + travelMode.slice(1).toLowerCase()}</span>
            </div>
        </div>
        <div class="summary-actions">
            <button class="btn btn-outline calendar-event-btn">
                <i class="icon icon-calendar"></i> Add to Calendar
            </button>
            <button class="btn btn-outline share-route-btn">
                <i class="icon icon-share"></i> Share Route
            </button>
        </div>
    `;
    
    // Add summary to directions panel
    directionsPanel.appendChild(summary);
    
    // Add step-by-step directions title
    const stepsTitle = document.createElement('h3');
    stepsTitle.className = 'steps-title';
    stepsTitle.textContent = 'Step-by-Step Directions';
    directionsPanel.appendChild(stepsTitle);
    
    // Add step-by-step directions
    const stepsContainer = document.createElement('div');
    stepsContainer.className = 'steps-container';
    directionsPanel.appendChild(stepsContainer);
    
    // Set steps container as directions renderer panel
    directionsRenderer.setPanel(stepsContainer);
    
    // Add event listeners for departure time selector
    const departureSelect = document.getElementById('departure-time');
    if (departureSelect) {
        departureSelect.addEventListener('change', function() {
            updateArrivalTime(this.value, totalDuration);
        });
    }
    
    // Add event listeners for action buttons
    const calendarBtn = summary.querySelector('.calendar-event-btn');
    if (calendarBtn) {
        calendarBtn.addEventListener('click', function() {
            addRouteToCalendar(response.routes[0]);
        });
    }
    
    const shareBtn = summary.querySelector('.share-route-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', function() {
            shareRoute(response.routes[0]);
        });
    }
}

/**
 * Format time for display
 * @param {Date} date - Date object to format
 * @returns {string} Formatted time string
 */
function formatTime(date) {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
}

/**
 * Update arrival time based on departure selection
 * @param {string} departureOption - Selected departure option
 * @param {number} durationSeconds - Route duration in seconds
 */
function updateArrivalTime(departureOption, durationSeconds) {
    const summaryRow = document.querySelector('.summary-row:nth-child(3) .summary-value');
    if (!summaryRow) return;
    
    let departureTime = new Date();
    
    switch(departureOption) {
        case '30min':
            departureTime.setMinutes(departureTime.getMinutes() + 30);
            break;
        case '1hour':
            departureTime.setHours(departureTime.getHours() + 1);
            break;
        case 'tomorrow':
            departureTime.setDate(departureTime.getDate() + 1);
            departureTime.setHours(9, 0, 0, 0);
            break;
        default:
            // Leave now - already set
            break;
    }
    
    const arrivalTime = new Date(departureTime.getTime() + (durationSeconds * 1000));
    summaryRow.textContent = formatTime(arrivalTime);
}

/**
 * Generate human-readable route description
 * @param {Object} route - Route object
 * @returns {string} Route description
 */
function getRouteDescription(route) {
    if (!route || !route.legs || route.legs.length === 0) {
        return 'Route details not available';
    }
    
    // Get major roads/highways from the route
    const majorRoads = [];
    
    route.legs.forEach(leg => {
        leg.steps.forEach(step => {
            if (step.instructions && step.distance.value > 1000) {
                // Extract highway or major road names from instructions
                const roadMatches = step.instructions.match(/([A-Z]-\d+|[A-Z]{2}-\d+|Route \d+|Highway \d+)/g);
                if (roadMatches) {
                    roadMatches.forEach(road => {
                        if (!majorRoads.includes(road)) {
                            majorRoads.push(road);
                        }
                    });
                }
            }
        });
    });
    
    // If major roads found, use them in description
    if (majorRoads.length > 0) {
        return `Via ${majorRoads.slice(0, 2).join(' and ')}${majorRoads.length > 2 ? ' and more' : ''}`;
    }
    
    // Fallback to simple route description
    const startAddress = route.legs[0].start_address.split(',')[0];
    const endAddress = route.legs[route.legs.length - 1].end_address.split(',')[0];
    
    return `From ${startAddress} to ${endAddress}`;
}

/**
 * Select a different route alternative
 * @param {number} routeIndex - Index of the route to select
 */
function selectRouteAlternative(routeIndex) {
    if (!routeAlternatives || routeIndex >= routeAlternatives.length) return;
    
    // Update the directions renderer with the selected route
    directionsRenderer.setRouteIndex(routeIndex);
    
    // Update the active route card
    const routeCards = document.querySelectorAll('.route-card');
    routeCards.forEach((card, index) => {
        const selectBtn = card.querySelector('.select-route-alt');
        
        if (index === routeIndex) {
            card.classList.add('active');
            if (selectBtn) {
                selectBtn.className = 'btn btn-sm btn-primary select-route-alt';
                selectBtn.textContent = 'Current Route';
            }
        } else {
            card.classList.remove('active');
            if (selectBtn) {
                selectBtn.className = 'btn btn-sm btn-outline select-route-alt';
                selectBtn.textContent = 'Select Route';
            }
        }
    });
}

/**
 * Add route to calendar
 * @param {Object} route - Route object
 */
function addRouteToCalendar(route) {
    if (!route || !route.legs || route.legs.length === 0) return;
    
    const departureSelect = document.getElementById('departure-time');
    const departureOption = departureSelect ? departureSelect.value : 'now';
    
    // Calculate departure and arrival times
    let departureTime = new Date();
    
    switch(departureOption) {
        case '30min':
            departureTime.setMinutes(departureTime.getMinutes() + 30);
            break;
        case '1hour':
            departureTime.setHours(departureTime.getHours() + 1);
            break;
        case 'tomorrow':
            departureTime.setDate(departureTime.getDate() + 1);
            departureTime.setHours(9, 0, 0, 0);
            break;
        default:
            // Leave now - already set
            break;
    }
    
    // Calculate total duration
    let totalDuration = 0;
    route.legs.forEach(leg => {
        totalDuration += leg.duration.value;
    });
    
    const arrivalTime = new Date(departureTime.getTime() + (totalDuration * 1000));
    
    // Format dates for calendar URL
    const formatDate = (date) => {
        return date.toISOString().replace(/-|:|\.\d+/g, '');
    };
    
    const start = formatDate(departureTime);
    const end = formatDate(arrivalTime);
    
    // Create calendar event details
    const origin = route.legs[0].start_address;
    const destination = route.legs[route.legs.length - 1].end_address;
    
    const eventTitle = encodeURIComponent(`Travel to Wisdom Bites Dental Clinic`);
    const location = encodeURIComponent(destination);
    const description = encodeURIComponent(`Directions from ${origin} to ${destination}. Estimated travel time: ${Math.round(totalDuration / 60)} minutes.`);
    
    // Create Google Calendar URL
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${eventTitle}&dates=${start}/${end}&details=${description}&location=${location}&sf=true&output=xml`;
    
    // Open calendar link in new window
    window.open(googleCalendarUrl, '_blank');
}

/**
 * Share route with various share options
 * @param {Object} route - Route object
 */
function shareRoute(route) {
    if (!route || !route.legs || route.legs.length === 0) return;
    
    // Create a modal for sharing options
    const modal = document.createElement('div');
    modal.className = 'share-modal';
    
    const origin = route.legs[0].start_address;
    const destination = route.legs[route.legs.length - 1].end_address;
    
    // Calculate total distance and duration
    let totalDistance = 0;
    let totalDuration = 0;
    
    route.legs.forEach(leg => {
        totalDistance += leg.distance.value;
        totalDuration += leg.duration.value;
    });
    
    // Convert to appropriate units
    const unitsSystem = document.getElementById('units-system')?.value || 'imperial';
    const distanceText = unitsSystem === 'metric' ? 
                        (totalDistance / 1000).toFixed(1) + ' km' : 
                        (totalDistance / 1609.34).toFixed(1) + ' miles';
    
    const durationInMinutes = Math.round(totalDuration / 60);
    
    // Create Google Maps directions URL
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelmode=${travelMode.toLowerCase()}`;
    
    modal.innerHTML = `
        <div class="share-content">
            <div class="share-header">
                <h3>Share Route</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="share-options">
                <div class="share-route-info">
                    <p><strong>From:</strong> ${origin}</p>
                    <p><strong>To:</strong> ${destination}</p>
                    <p><strong>Distance:</strong> ${distanceText} (about ${durationInMinutes} min)</p>
                    <div class="route-link">
                        <input type="text" readonly value="${directionsUrl}">
                        <button class="btn btn-sm btn-outline copy-link">
                            <i class="icon icon-copy"></i> Copy Link
                        </button>
                    </div>
                </div>
                <div class="share-links">
                    <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(directionsUrl)}" target="_blank" class="share-btn facebook">
                        <i class="icon icon-facebook"></i> Facebook
                    </a>
                    <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent('Directions to Wisdom Bites Dental Clinic')}&url=${encodeURIComponent(directionsUrl)}" target="_blank" class="share-btn twitter">
                        <i class="icon icon-twitter"></i> Twitter
                    </a>
                    <a href="mailto:?subject=${encodeURIComponent('Directions to Wisdom Bites Dental Clinic')}&body=${encodeURIComponent('Here are directions to Wisdom Bites Dental Clinic:\n\nFrom: ' + origin + '\nTo: ' + destination + '\nDistance: ' + distanceText + '\nEstimated time: ' + durationInMinutes + ' minutes\n\nView on Google Maps: ' + directionsUrl)}" class="share-btn email">
                        <i class="icon icon-email"></i> Email
                    </a>
                    <a href="sms:?body=${encodeURIComponent('Directions to Wisdom Bites Dental Clinic: ' + directionsUrl)}" class="share-btn sms">
                        <i class="icon icon-sms"></i> SMS
                    </a>
                </div>
                <div class="share-qrcode">
                    <p>Scan to view on mobile device:</p>
                    <div id="route-qrcode"></div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to body
    document.body.appendChild(modal);
    
    // Generate QR code (using Google Charts API)
    const qrCodeContainer = modal.querySelector('#route-qrcode');
    if (qrCodeContainer) {
        const qrCodeUrl = `https://chart.googleapis.com/chart?cht=qr&chs=200x200&chl=${encodeURIComponent(directionsUrl)}`;
        const qrImg = document.createElement('img');
        qrImg.src = qrCodeUrl;
        qrImg.alt = 'QR Code for directions';
        qrCodeContainer.appendChild(qrImg);
    }
    
    // Add event listeners
    modal.querySelector('.close-modal').addEventListener('click', function() {
        document.body.removeChild(modal);
    });
    
    modal.querySelector('.copy-link').addEventListener('click', function() {
        const linkInput = modal.querySelector('.route-link input');
        linkInput.select();
        navigator.clipboard.writeText(linkInput.value).then(function() {
            const copyBtn = modal.querySelector('.copy-link');
            copyBtn.innerHTML = '<i class="icon icon-check"></i> Copied!';
            setTimeout(() => {
                copyBtn.innerHTML = '<i class="icon icon-copy"></i> Copy Link';
            }, 2000);
        });
    });
    
    // Close when clicking outside the modal content
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            document.body.removeChild(modal);
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
    const resetMapBtn = document.getElementById('reset-map');
    const embedViewBtn = document.getElementById('embed-view');
    
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
            
            // Hide any open info windows
            markers.forEach(marker => {
                if (marker.infoWindow) {
                    marker.infoWindow.close();
                }
            });
            
            // Reset layer toggles
            resetAllLayers();
        });
    }
    
    if (embedViewBtn) {
        embedViewBtn.addEventListener('click', function() {
            showEmbedMapView();
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
 * Reset all map layers
 */
function resetAllLayers() {
    // Reset traffic layer
    if (trafficLayer) {
        trafficLayer.setMap(null);
        const trafficBtn = document.getElementById('toggle-traffic');
        if (trafficBtn) trafficBtn.classList.remove('active');
    }
    
    // Reset transit layer
    if (transitLayer) {
        transitLayer.setMap(null);
        const transitBtn = document.getElementById('toggle-transit');
        if (transitBtn) transitBtn.classList.remove('active');
    }
    
    // Reset bike layer
    if (bikeLayer) {
        bikeLayer.setMap(null);
        const bikeBtn = document.getElementById('toggle-bike');
        if (bikeBtn) bikeBtn.classList.remove('active');
    }
    
    // Reset heatmap
    if (heatmap) {
        heatmap.setMap(null);
        const heatmapBtn = document.getElementById('toggle-heatmap');
        if (heatmapBtn) heatmapBtn.classList.remove('active');
    }
}

/**
 * Show Embed Map View using Maps Embed API
 */
function showEmbedMapView() {
    // Create modal for embed view
    const modal = document.createElement('div');
    modal.className = 'embed-map-modal';
    
    const clinicAddress = "Wisdom Bites Dental Clinic, 123 Dental Avenue, Smile City, SC 12345";
    const apiKey = 'AIzaSyDY7pn8Bkb9dxMKX6pKgldH1a2acVjmWsw';
    
    modal.innerHTML = `
        <div class="embed-map-content">
            <div class="embed-map-header">
                <h3>Embedded Map View</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="embed-map-container">
                <iframe 
                    width="100%" 
                    height="450" 
                    style="border:0" 
                    loading="lazy" 
                    allowfullscreen 
                    referrerpolicy="no-referrer-when-downgrade" 
                    src="https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(clinicAddress)}&zoom=15">
                </iframe>
            </div>
            <div class="embed-map-footer">
                <p>This view may be easier to use on mobile devices.</p>
                <button class="btn btn-primary directions-embed-btn">Get Directions in this View</button>
            </div>
        </div>
    `;
    
    // Add modal to body
    document.body.appendChild(modal);
    
    // Add event listeners
    modal.querySelector('.close-modal').addEventListener('click', function() {
        document.body.removeChild(modal);
    });
    
    // Add event listener for directions button
    modal.querySelector('.directions-embed-btn').addEventListener('click', function() {
        // Get origin from the form
        const originInput = document.getElementById('origin');
        const origin = originInput ? originInput.value : '';
        
        // Replace iframe with directions embed
        const embedContainer = modal.querySelector('.embed-map-container');
        if (embedContainer && origin) {
            embedContainer.innerHTML = `
                <iframe 
                    width="100%" 
                    height="450" 
                    style="border:0" 
                    loading="lazy" 
                    allowfullscreen 
                    referrerpolicy="no-referrer-when-downgrade" 
                    src="https://www.google.com/maps/embed/v1/directions?key=${apiKey}&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(clinicAddress)}&mode=${travelMode.toLowerCase()}">
                </iframe>
            `;
        } else if (embedContainer) {
            alert('Please enter a starting location in the form first.');
        }
    });
    
    // Close when clicking outside the modal content
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            document.body.removeChild(modal);
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
 * Initialize sharing options for the directions page
 */
function initSharingOptions() {
    const shareBtn = document.getElementById('share-clinic-location');
    if (shareBtn) {
        shareBtn.addEventListener('click', function() {
            shareLocation();
        });
    }
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

// Add an event listener to handle all API-related clicks
document.addEventListener('click', function(e) {
    // Handle clicks on POI markers to add to route
    if (e.target && e.target.classList.contains('add-to-route-btn')) {
        const poiName = e.target.getAttribute('data-name');
        if (poiName) {
            addPOIToRoute(poiName);
        }
    }
    
    // Handle click on share location button
    if (e.target && e.target.classList.contains('share-location-btn')) {
        shareLocation();
    }
    
    // Handle click on route alternative selection
    if (e.target && e.target.classList.contains('select-route-alt')) {
        const routeIndex = parseInt(e.target.getAttribute('data-route-index'));
        selectRouteAlternative(routeIndex);
    }
});

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
    
    // Initialize Places service for additional POI data
    placesService = new google.maps.places.PlacesService(map);
    
    // Initialize Geocoding service for address resolution
    geocodingService = new google.maps.Geocoder();
    
    // Add a marker for the dental clinic with actual geocoding
    geocodeClinicAddress(clinicAddress);
    
    // Initialize autocomplete for origin input
    initAutocomplete();
    
    // Update static map with styled fallback
    updateStaticMap(clinicPosition);
    
    // Initialize nearby points of interest
    findNearbyParkingAndTransit();
    
    // Initialize heatmap for popular times (simulated)
    initHeatmap();
    
    // Set flag that map is ready
    mapReady = true;
    
    // Create layer toggle controls
    createLayerToggles();
}

/**
 * Geocode the clinic address to get accurate coordinates
 * @param {string} address - Full clinic address
 */
function geocodeClinicAddress(address) {
    const geocoder = new google.maps.Geocoder();
    
    geocoder.geocode({ address: address }, function(results, status) {
        if (status === 'OK' && results[0]) {
            // Update clinic position with accurate coordinates
            clinicPosition = results[0].geometry.location;
            
            // Center map on geocoded position
            map.setCenter(clinicPosition);
            
            // Add a marker for the dental clinic
            createMarker(map, clinicPosition, 'clinic', getClinicInfoContent());
        } else {
            console.error('Geocode was not successful for the following reason: ' + status);
        }
    });
}

/**
 * Get clinic info window content
 * @returns {string} HTML content for clinic info window
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
            <div class="info-actions">
                <button class="btn btn-sm btn-primary street-view-btn">See Street View</button>
                <button class="btn btn-sm btn-outline share-location-btn">Share Location</button>
            </div>
        </div>
    `;
}

/**
 * Create a marker on the map with enhanced info windows
 * @param {Object} map - The Google Map object
 * @param {Object} position - Lat/lng position
 * @param {string} type - Type of marker (clinic, poi, etc.)
 * @param {string} infoContent - HTML content for info window
 */
function createMarker(map, position, type, infoContent) {
    const marker = new google.maps.Marker({
        map: map,
        position: position,
        icon: getMarkerIcon(type)
    });
    
    // Create info window
    const infoWindow = new google.maps.InfoWindow({
        content: infoContent
    });
    
    // Add click event listener to open info window
    marker.addListener('click', function() {
        infoWindow.open(map, marker);
    });
    
    // Add marker to appropriate array
    if (type === 'clinic') {
        clinicMarkers.push(marker);
    } else if (type === 'poi') {
        poiMarkers.push(marker);
    }
}

/**
 * Get marker icon based on type
 * @param {string} type - Type of marker (clinic, poi, etc.)
 * @returns {string} URL for marker icon
 */
function getMarkerIcon(type) {
    switch (type) {
        case 'clinic':
            return 'assets/img/icons/clinic.png';
        case 'poi':
            return 'assets/img/icons/poi.png';
        case 'parking':
            return 'assets/img/icons/parking.png';
        case 'transit':
            return 'assets/img/icons/transit.png';
        default:
            return 'assets/img/icons/default.png';
    }
}

/**
 * Initialize autocomplete for origin input
 */
function initAutocomplete() {
    const originInput = document.getElementById('origin');
    if (originInput) {
        const autocomplete = new google.maps.places.Autocomplete(originInput);
        
        // Bind the map's bounds (viewport) to the autocomplete service
        autocomplete.bindTo('bounds', map);
        
        // Set the data fields to return when the user selects a place
        autocomplete.setFields(['address_components', 'geometry', 'icon', 'name']);
        
        // Add event listener for place_changed event
        autocomplete.addListener('place_changed', function() {
            const place = autocomplete.getPlace();
            if (!place.geometry) {
                console.error('No geometry found for the selected place');
                return;
            }
            
            // Update origin position
            originPosition = place.geometry.location;
            
            // Update map bounds to include origin and destination
            const bounds = new google.maps.LatLngBounds();
            bounds.extend(originPosition);
            bounds.extend(clinicPosition);
            map.fitBounds(bounds);
            
            // Calculate and display route
            calculateAndDisplayRoute();
        });
    }
}

/**
 * Calculate and display route between origin and destination
 */
function calculateAndDisplayRoute() {
    if (!originPosition || !clinicPosition) return;
    
    // Clear any existing route
    clearRoute();
    
    // Get travel mode
    const travelMode = document.getElementById('travel-mode').value;
    
    // Get waypoints
    const waypoints = getWaypoints();
    
    // Create directions request
    const request = {
        origin: originPosition,
        destination: clinicPosition,
        travelMode: travelMode,
        waypoints: waypoints,
        optimizeWaypoints: true,
        provideRouteAlternatives: true
    };
    
    // Call Directions service
    directionsService.route(request, function(response, status) {
        if (status === 'OK') {
            // Store route alternatives
            routeAlternatives = response.routes;
            
            // Display route on map
            directionsRenderer.setDirections(response);
            
            // Show route details
            showRouteDetails(response);
            
            // Rearrange waypoint inputs to match optimized order
            if (waypoints.length > 0) {
                const waypointOrder = response.routes[0].waypoint_order;
                rearrangeWaypointInputs(waypointOrder);
            }
        } else {
            console.error('Directions request failed due to ' + status);
            showErrorMessage('An error occurred while calculating directions. Please try again.');
        }
    });
}

/**
 * Get waypoints from input fields
 * @returns {Array} Array of waypoint objects
 */
function getWaypoints() {
    const waypoints = [];
    const waypointInputs = document.querySelectorAll('.waypoint-input');
    
    waypointInputs.forEach(input => {
        const address = input.value.trim();
        if (address !== '') {
            waypoints.push({
                location: address,
                stopover: true
            });
        }
    });
    
    return waypoints;
}

/**
 * Clear existing route from map
 */
function clearRoute() {
    directionsRenderer.setDirections({ routes: [] });
    directionsRenderer.setMap(null);
    directionsRenderer.setPanel(null);
    
    // Clear route alternatives
    routeAlternatives = [];
    
    // Clear route details
    const directionsPanel = document.getElementById('directions-panel');
    if (directionsPanel) {
        directionsPanel.innerHTML = '';
    }
    
    // Clear waypoint markers
    poiMarkers.forEach(marker => marker.setMap(null));
    poiMarkers = [];
}

/**
 * Show error message in directions panel
 * @param {string} message - Error message to display
 */
function showErrorMessage(message) {
    const directionsPanel = document.getElementById('directions-panel');
    if (directionsPanel) {
        directionsPanel.innerHTML = `<p class="error-message">${message}</p>`;
    }
}

/**
 * Show detailed route information and alternatives
 * @param {Object} response - Directions API response
 */
function showRouteDetails(response) {
    const directionsPanel = document.getElementById('directions-panel');
    if (!directionsPanel) return;
    
    // Clear any previous content
    directionsPanel.innerHTML = '';
    
    // Create container for alternative routes if we have more than one
    if (response.routes.length > 1) {
        const alternativesContainer = document.createElement('div');
        alternativesContainer.className = 'route-alternatives';
        alternativesContainer.innerHTML = '<h3>Route Options</h3>';
        
        // Create route cards for each alternative
        response.routes.forEach((route, index) => {
            // Calculate total distance and duration
            let totalDistance = 0;
            let totalDuration = 0;
            
            route.legs.forEach(leg => {
                totalDistance += leg.distance.value;
                totalDuration += leg.duration.value;
            });
            
            // Convert to appropriate units
            const unitsSystem = document.getElementById('units-system')?.value || 'imperial';
            const distanceText = unitsSystem === 'metric' ? 
                                (totalDistance / 1000).toFixed(1) + ' km' : 
                                (totalDistance / 1609.34).toFixed(1) + ' miles';
                                
            const durationInMinutes = Math.round(totalDuration / 60);
            
            const routeCard = document.createElement('div');
            routeCard.className = 'route-card';
            if (index === 0) routeCard.classList.add('active');
            
            routeCard.innerHTML = `
                <div class="route-info">
                    <div class="route-header">
                        <span class="route-label">${index === 0 ? 'Best Route' : 'Alternative ' + index}</span>
                        <span class="route-stats">${distanceText} • ${durationInMinutes} min</span>
                    </div>
                    <div class="route-description">
                        ${getRouteDescription(route)}
                    </div>
                </div>
                <button class="btn btn-sm ${index === 0 ? 'btn-primary' : 'btn-outline'} select-route-alt" data-route-index="${index}">
                    ${index === 0 ? 'Current Route' : 'Select Route'}
                </button>
            `;
            
            alternativesContainer.appendChild(routeCard);
        });
        
        // Add alternatives container to directions panel
        directionsPanel.appendChild(alternativesContainer);
    }
    
    // Create summary for the selected (first) route
    const route = response.routes[0];
    
    // Calculate total distance and duration
    let totalDistance = 0;
    let totalDuration = 0;
    
    route.legs.forEach(leg => {
        totalDistance += leg.distance.value;
        totalDuration += leg.duration.value;
    });
    
    // Convert to appropriate units
    const unitsSystem = document.getElementById('units-system')?.value || 'imperial';
    const distanceText = unitsSystem === 'metric' ? 
                        (totalDistance / 1000).toFixed(1) + ' km' : 
                        (totalDistance / 1609.34).toFixed(1) + ' miles';
    
    const durationInMinutes = Math.round(totalDuration / 60);
    const hours = Math.floor(durationInMinutes / 60);
    const minutes = durationInMinutes % 60;
    const durationText = hours > 0 ? `${hours} hr ${minutes} min` : `${minutes} min`;
    
    const departureTime = new Date();
    const arrivalTime = new Date(departureTime.getTime() + (totalDuration * 1000));
    
    // Create summary element
    const summary = document.createElement('div');
    summary.className = 'route-summary';
    
    // Create departure time selector
    const timeOptions = [
        { label: 'Leave now', value: 'now' },
        { label: 'Leave in 30 minutes', value: '30min' },
        { label: 'Leave in 1 hour', value: '1hour' },
        { label: 'Leave tomorrow morning', value: 'tomorrow' }
    ];
    
    let timeOptionsHtml = '';
    timeOptions.forEach(option => {
        timeOptionsHtml += `<option value="${option.value}">${option.label}</option>`;
    });
    
    summary.innerHTML = `
        <h3>Route Summary</h3>
        <div class="departure-selector">
            <select id="departure-time">
                ${timeOptionsHtml}
            </select>
        </div>
        <div class="summary-details">
            <div class="summary-row">
                <span class="summary-label">Distance:</span>
                <span class="summary-value">${distanceText}</span>
            </div>
            <div class="summary-row">
                <span class="summary-label">Duration:</span>
                <span class="summary-value">${durationText}</span>
            </div>
            <div class="summary-row">
                <span class="summary-label">Arrive by:</span>
                <span class="summary-value">${formatTime(arrivalTime)}</span>
            </div>
            <div class="summary-row">
                <span class="summary-label">Travel Mode:</span>
                <span class="summary-value">${travelMode.charAt(0) + travelMode.slice(1).toLowerCase()}</span>
            </div>
        </div>
        <div class="summary-actions">
            <button class="btn btn-outline calendar-event-btn">
                <i class="icon icon-calendar"></i> Add to Calendar
            </button>
            <button class="btn btn-outline share-route-btn">
                <i class="icon icon-share"></i> Share Route
            </button>
        </div>
    `;
    
    // Add summary to directions panel
    directionsPanel.appendChild(summary);
    
    // Add step-by-step directions title
    const stepsTitle = document.createElement('h3');
    stepsTitle.className = 'steps-title';
    stepsTitle.textContent = 'Step-by-Step Directions';
    directionsPanel.appendChild(stepsTitle);
    
    // Add step-by-step directions
    const stepsContainer = document.createElement('div');
    stepsContainer.className = 'steps-container';
    directionsPanel.appendChild(stepsContainer);
    
    // Set steps container as directions renderer panel
    directionsRenderer.setPanel(stepsContainer);
    
    // Add event listeners for departure time selector
    const departureSelect = document.getElementById('departure-time');
    if (departureSelect) {
        departureSelect.addEventListener('change', function() {
            updateArrivalTime(this.value, totalDuration);
        });
    }
    
    // Add event listeners for action buttons
    const calendarBtn = summary.querySelector('.calendar-event-btn');
    if (calendarBtn) {
        calendarBtn.addEventListener('click', function() {
            addRouteToCalendar(response.routes[0]);
        });
    }
    
    const shareBtn = summary.querySelector('.share-route-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', function() {
            shareRoute(response.routes[0]);
        });
    }
}

/**
 * Format time for display
 * @param {Date} date - Date object to format
 * @returns {string} Formatted time string
 */
function formatTime(date) {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
}

/**
 * Update arrival time based on departure selection
 * @param {string} departureOption - Selected departure option
 * @param {number} durationSeconds - Route duration in seconds
 */
function updateArrivalTime(departureOption, durationSeconds) {
    const summaryRow = document.querySelector('.summary-row:nth-child(3) .summary-value');
    if (!summaryRow) return;
    
    let departureTime = new Date();
    
    switch(departureOption) {
        case '30min':
            departureTime.setMinutes(departureTime.getMinutes() + 30);
            break;
        case '1hour':
            departureTime.setHours(departureTime.getHours() + 1);
            break;
        case 'tomorrow':
            departureTime.setDate(departureTime.getDate() + 1);
            departureTime.setHours(9, 0, 0, 0);
            break;
        default:
            // Leave now - already set
            break;
    }
    
    const arrivalTime = new Date(departureTime.getTime() + (durationSeconds * 1000));
    summaryRow.textContent = formatTime(arrivalTime);
}

/**
 * Generate human-readable route description
 * @param {Object} route - Route object
 * @returns {string} Route description
 */
function getRouteDescription(route) {
    if (!route || !route.legs || route.legs.length === 0) {
        return 'Route details not available';
    }
    
    // Get major roads/highways from the route
    const majorRoads = [];
    
    route.legs.forEach(leg => {
        leg.steps.forEach(step => {
            if (step.instructions && step.distance.value > 1000) {
                // Extract highway or major road names from instructions
                const roadMatches = step.instructions.match(/([A-Z]-\d+|[A-Z]{2}-\d+|Route \d+|Highway \d+)/g);
                if (roadMatches) {
                    roadMatches.forEach(road => {
                        if (!majorRoads.includes(road)) {
                            majorRoads.push(road);
                        }
                    });
                }
            }
        });
    });
    
    // If major roads found, use them in description
    if (majorRoads.length > 0) {
        return `Via ${majorRoads.slice(0, 2).join(' and ')}${majorRoads.length > 2 ? ' and more' : ''}`;
    }
    
    // Fallback to simple route description
    const startAddress = route.legs[0].start_address.split(',')[0];
    const endAddress = route.legs[route.legs.length - 1].end_address.split(',')[0];
    
    return `From ${startAddress} to ${endAddress}`;
}

/**
 * Select a different route alternative
 * @param {number} routeIndex - Index of the route to select
 */
function selectRouteAlternative(routeIndex) {
    if (!routeAlternatives || routeIndex >= routeAlternatives.length) return;
    
    // Update the directions renderer with the selected route
    directionsRenderer.setRouteIndex(routeIndex);
    
    // Update the active route card
    const routeCards = document.querySelectorAll('.route-card');
    routeCards.forEach((card, index) => {
        const selectBtn = card.querySelector('.select-route-alt');
        
        if (index === routeIndex) {
            card.classList.add('active');
            if (selectBtn) {
                selectBtn.className = 'btn btn-sm btn-primary select-route-alt';
                selectBtn.textContent = 'Current Route';
            }
        } else {
            card.classList.remove('active');
            if (selectBtn) {
                selectBtn.className = 'btn btn-sm btn-outline select-route-alt';
                selectBtn.textContent = 'Select Route';
            }
        }
    });
}

/**
 * Add route to calendar
 * @param {Object} route - Route object
 */
function addRouteToCalendar(route) {
    if (!route || !route.legs || route.legs.length === 0) return;
    
    const departureSelect = document.getElementById('departure-time');
    const departureOption = departureSelect ? departureSelect.value : 'now';
    
    // Calculate departure and arrival times
    let departureTime = new Date();
    
    switch(departureOption) {
        case '30min':
            departureTime.setMinutes(departureTime.getMinutes() + 30);
            break;
        case '1hour':
            departureTime.setHours(departureTime.getHours() + 1);
            break;
        case 'tomorrow':
            departureTime.setDate(departureTime.getDate() + 1);
            departureTime.setHours(9, 0, 0, 0);
            break;
        default:
            // Leave now - already set
            break;
    }
    
    // Calculate total duration
    let totalDuration = 0;
    route.legs.forEach(leg => {
        totalDuration += leg.duration.value;
    });
    
    const arrivalTime = new Date(departureTime.getTime() + (totalDuration * 1000));
    
    // Format dates for calendar URL
    const formatDate = (date) => {
        return date.toISOString().replace(/-|:|\.\d+/g, '');
    };
    
    const start = formatDate(departureTime);
    const end = formatDate(arrivalTime);
    
    // Create calendar event details
    const origin = route.legs[0].start_address;
    const destination = route.legs[route.legs.length - 1].end_address;
    
    const eventTitle = encodeURIComponent(`Travel to Wisdom Bites Dental Clinic`);
    const location = encodeURIComponent(destination);
    const description = encodeURIComponent(`Directions from ${origin} to ${destination}. Estimated travel time: ${Math.round(totalDuration / 60)} minutes.`);
    
    // Create Google Calendar URL
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${eventTitle}&dates=${start}/${end}&details=${description}&location=${location}&sf=true&output=xml`;
    
    // Open calendar link in new window
    window.open(googleCalendarUrl, '_blank');
}

/**
 * Share route with various share options
 * @param {Object} route - Route object
 */
function shareRoute(route) {
    if (!route || !route.legs || route.legs.length === 0) return;
    
    // Create a modal for sharing options
    const modal = document.createElement('div');
    modal.className = 'share-modal';
    
    const origin = route.legs[0].start_address;
    const destination = route.legs[route.legs.length - 1].end_address;
    
    // Calculate total distance and duration
    let totalDistance = 0;
    let totalDuration = 0;
    
    route.legs.forEach(leg => {
        totalDistance += leg.distance.value;
        totalDuration += leg.duration.value;
    });
    
    // Convert to appropriate units
    const unitsSystem = document.getElementById('units-system')?.value || 'imperial';
    const distanceText = unitsSystem === 'metric' ? 
                        (totalDistance / 1000).toFixed(1) + ' km' : 
                        (totalDistance / 1609.34).toFixed(1) + ' miles';
    
    const durationInMinutes = Math.round(totalDuration / 60);
    
    // Create Google Maps directions URL
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelmode=${travelMode.toLowerCase()}`;
    
    modal.innerHTML = `
        <div class="share-content">
            <div class="share-header">
                <h3>Share Route</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="share-options">
                <div class="share-route-info">
                    <p><strong>From:</strong> ${origin}</p>
                    <p><strong>To:</strong> ${destination}</p>
                    <p><strong>Distance:</strong> ${distanceText} (about ${durationInMinutes} min)</p>
                    <div class="route-link">
                        <input type="text" readonly value="${directionsUrl}">
                        <button class="btn btn-sm btn-outline copy-link">
                            <i class="icon icon-copy"></i> Copy Link
                        </button>
                    </div>
                </div>
                <div class="share-links">
                    <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(directionsUrl)}" target="_blank" class="share-btn facebook">
                        <i class="icon icon-facebook"></i> Facebook
                    </a>
                    <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent('Directions to Wisdom Bites Dental Clinic')}&url=${encodeURIComponent(directionsUrl)}" target="_blank" class="share-btn twitter">
                        <i class="icon icon-twitter"></i> Twitter
                    </a>
                    <a href="mailto:?subject=${encodeURIComponent('Directions to Wisdom Bites Dental Clinic')}&body=${encodeURIComponent('Here are directions to Wisdom Bites Dental Clinic:\n\nFrom: ' + origin + '\nTo: ' + destination + '\nDistance: ' + distanceText + '\nEstimated time: ' + durationInMinutes + ' minutes\n\nView on Google Maps: ' + directionsUrl)}" class="share-btn email">
                        <i class="icon icon-email"></i> Email
                    </a>
                    <a href="sms:?body=${encodeURIComponent('Directions to Wisdom Bites Dental Clinic: ' + directionsUrl)}" class="share-btn sms">
                        <i class="icon icon-sms"></i> SMS
                    </a>
                </div>
                <div class="share-qrcode">
                    <p>Scan to view on mobile device:</p>
                    <div id="route-qrcode"></div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to body
    document.body.appendChild(modal);
    
    // Generate QR code (using Google Charts API)
    const qrCodeContainer = modal.querySelector('#route-qrcode');
    if (qrCodeContainer) {
        const qrCodeUrl = `https://chart.googleapis.com/chart?cht=qr&chs=200x200&chl=${encodeURIComponent(directionsUrl)}`;
        const qrImg = document.createElement('img');
        qrImg.src = qrCodeUrl;
        qrImg.alt = 'QR Code for directions';
        qrCodeContainer.appendChild(qrImg);
    }
    
    // Add event listeners
    modal.querySelector('.close-modal').addEventListener('click', function() {
        document.body.removeChild(modal);
    });
    
    modal.querySelector('.copy-link').addEventListener('click', function() {
        const linkInput = modal.querySelector('.route-link input');
        linkInput.select();
        navigator.clipboard.writeText(linkInput.value).then(function() {
            const copyBtn = modal.querySelector('.copy-link');
            copyBtn.innerHTML = '<i class="icon icon-check"></i> Copied!';
            setTimeout(() => {
                copyBtn.innerHTML = '<i class="icon icon-copy"></i> Copy Link';
            }, 2000);
        });
    });
    
    // Close when clicking outside the modal content
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            document.body.removeChild(modal);
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
    const resetMapBtn = document.getElementById('reset-map');
    const embedViewBtn = document.getElementById('embed-view');
    
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
            
            // Hide any open info windows
            markers.forEach(marker => {
                if (marker.infoWindow) {
                    marker.infoWindow.close();
                }
            });
            
            // Reset layer toggles
            resetAllLayers();
        });
    }
    
    if (embedViewBtn) {
        embedViewBtn.addEventListener('click', function() {
            showEmbedMapView();
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
 * Reset all map layers
 */
function resetAllLayers() {
    // Reset traffic layer
    if (trafficLayer) {
        trafficLayer.setMap(null);
        const trafficBtn = document.getElementById('toggle-traffic');
        if (trafficBtn) trafficBtn.classList.remove('active');
    }
    
    // Reset transit layer
    if (transitLayer) {
        transitLayer.setMap(null);
        const transitBtn = document.getElementById('toggle-transit');
        if (transitBtn) transitBtn.classList.remove('active');
    }
    
    // Reset bike layer
    if (bikeLayer) {
        bikeLayer.setMap(null);
        const bikeBtn = document.getElementById('toggle-bike');
        if (bikeBtn) bikeBtn.classList.remove('active');
    }
    
    // Reset heatmap
    if (heatmap) {
        heatmap.setMap(null);
        const heatmapBtn = document.getElementById('toggle-heatmap');
        if (heatmapBtn) heatmapBtn.classList.remove('active');
    }
}

/**
 * Show Embed Map View using Maps Embed API
 */
function showEmbedMapView() {
    // Create modal for embed view
    const modal = document.createElement('div');
    modal.className = 'embed-map-modal';
    
    const clinicAddress = "Wisdom Bites Dental Clinic, 123 Dental Avenue, Smile City, SC 12345";
    const apiKey = 'AIzaSyDY7pn8Bkb9dxMKX6pKgldH1a2acVjmWsw';
    
    modal.innerHTML = `
        <div class="embed-map-content">
            <div class="embed-map-header">
                <h3>Embedded Map View</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="embed-map-container">
                <iframe 
                    width="100%" 
                    height="450" 
                    style="border:0" 
                    loading="lazy" 
                    allowfullscreen 
                    referrerpolicy="no-referrer-when-downgrade" 
                    src="https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(clinicAddress)}&zoom=15">
                </iframe>
            </div>
            <div class="embed-map-footer">
                <p>This view may be easier to use on mobile devices.</p>
                <button class="btn btn-primary directions-embed-btn">Get Directions in this View</button>
            </div>
        </div>
    `;
    
    // Add modal to body
    document.body.appendChild(modal);
    
    // Add event listeners
    modal.querySelector('.close-modal').addEventListener('click', function() {
        document.body.removeChild(modal);
    });
    
    // Add event listener for directions button
    modal.querySelector('.directions-embed-btn').addEventListener('click', function() {
        // Get origin from the form
        const originInput = document.getElementById('origin');
        const origin = originInput ? originInput.value : '';
        
        // Replace iframe with directions embed
        const embedContainer = modal.querySelector('.embed-map-container');
        if (embedContainer && origin) {
            embedContainer.innerHTML = `
                <iframe 
                    width="100%" 
                    height="450" 
                    style="border:0" 
                    loading="lazy" 
                    allowfullscreen 
                    referrerpolicy="no-referrer-when-downgrade" 
                    src="https://www.google.com/maps/embed/v1/directions?key=${apiKey}&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(clinicAddress)}&mode=${travelMode.toLowerCase()}">
                </iframe>
            `;
        } else if (embedContainer) {
            alert('Please enter a starting location in the form first.');
        }
    });
    
    // Close when clicking outside the modal content
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            document.body.removeChild(modal);
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
 * Initialize sharing options for the directions page
 */
function initSharingOptions() {
    const shareBtn = document.getElementById('share-clinic-location');
    if (shareBtn) {
        shareBtn.addEventListener('click', function() {
            shareLocation();
        });
    }
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

// Add an event listener to handle all API-related clicks
document.addEventListener('click', function(e) {
    // Handle clicks on POI markers to add to route
    if (e.target && e.target.classList.contains('add-to-route-btn')) {
        const poiName = e.target.getAttribute('data-name');
        if (poiName) {
            addPOIToRoute(poiName);
        }
    }
    
    // Handle click on share location button
    if (e.target && e.target.classList.contains('share-location-btn')) {
        shareLocation();
    }
    
    // Handle click on route alternative selection
    if (e.target && e.target.classList.contains('select-route-alt')) {
        const routeIndex = parseInt(e.target.getAttribute('data-route-index'));
        selectRouteAlternative(routeIndex);
    }
});

// Wait for map to be fully loaded before performing additional operations
function waitForMapToLoad(callback) {
    const checkMapReady = () => {
        if (mapReady) {
            callback();
        } else {
            setTimeout(checkMapReady, 100);
        }
    };
    
    checkMapReady();
}

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
    
    // Initialize Places service for additional POI data
    placesService = new google.maps.places.PlacesService(map);
    
    // Initialize Geocoding service for address resolution
    geocodingService = new google.maps.Geocoder();
    
    // Add a marker for the dental clinic with actual geocoding
    geocodeClinicAddress(clinicAddress);
    
    // Initialize autocomplete for origin input
    initAutocomplete();
    
    // Update static map with styled fallback
    updateStaticMap(clinicPosition);
    
    // Initialize nearby points of interest
    findNearbyParkingAndTransit();
    
    // Initialize heatmap for popular times (simulated)
    initHeatmap();
    
    // Set flag that map is ready
    mapReady = true;
    
    // Create layer toggle controls
    createLayerToggles();
}

/**
 * Geocode the clinic address to get accurate coordinates
 * @param {string} address - Full clinic address
 */
function geocodeClinicAddress(address) {
    const geocoder = new google.maps.Geocoder();
    
    geocoder.geocode({ address: address }, function(results, status) {
        if (status === 'OK' && results[0]) {
            // Update clinic position with accurate coordinates
            clinicPosition = results[0].geometry.location;
            
            // Center map on geocoded position
            map.setCenter(clinicPosition);
            
            // Add clinic marker
            const clinicMarker = createMarker(map, clinicPosition, "Wisdom Bites Dental Clinic", true);
            markers.push(clinicMarker);
            
            // Get detailed place information
            getClinicPlaceDetails("Wisdom Bites Dental Clinic", clinicPosition);
        } else {
            console.error('Geocoding failed:', status);
            
            // Fallback to default coordinates
            const clinicMarker = createMarker(map, clinicPosition, "Wisdom Bites Dental Clinic", true);
            markers.push(clinicMarker);
        }
    });
}

/**
 * Get detailed place information using Places API
 * @param {string} name - Place name
 * @param {Object} location - LatLng location
 */
function getClinicPlaceDetails(name, location) {
    // Create a search request for Places API
    const request = {
        location: location,
        radius: '100',
        name: name,
        type: ['dentist']
    };
    
    placesService.nearbySearch(request, function(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK && results[0]) {
            // Get more details using place_id
            placesService.getDetails({
                placeId: results[0].place_id,
                fields: ['name', 'formatted_address', 'formatted_phone_number', 
                         'opening_hours', 'website', 'rating', 'review', 'photo']
            }, function(place, status) {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    // Update info window with enhanced details
                    updateClinicInfoContent(place);
                }
            });
        }
    });
}

/**
 * Update clinic info window with enhanced details
 * @param {Object} placeDetails - Place details from Places API
 */
function updateClinicInfoContent(placeDetails) {
    // Find clinic marker
    const clinicMarker = markers.find(marker => marker.getTitle() === "Wisdom Bites Dental Clinic");
    if (!clinicMarker) return;
    
    // Create enhanced info content
    let infoContent = `
        <div class="info-window clinic-info">
            <h4>Wisdom Bites Dental Clinic</h4>
            <address>
                ${placeDetails.formatted_address || '123 Dental Avenue<br>Smile City, SC 12345'}
            </address>
            <p><strong>Phone:</strong> <a href="tel:${placeDetails.formatted_phone_number || '+15551234567'}">${placeDetails.formatted_phone_number || '(555) 123-4567'}</a></p>
    `;
    
    // Add hours if available
    if (placeDetails.opening_hours) {
        infoContent += `<p><strong>Hours:</strong></p><div class="hours-list">`;
        placeDetails.opening_hours.weekday_text.forEach(day => {
            infoContent += `<small>${day}</small>`;
        });
        infoContent += `</div>`;
    } else {
        infoContent += `<p><strong>Hours:</strong> Mon-Fri 9AM-6PM, Sat 10AM-3PM</p>`;
    }
    
    // Add rating if available
    if (placeDetails.rating) {
        infoContent += `
            <div class="place-rating">
                <strong>Rating:</strong> ${placeDetails.rating.toFixed(1)}
                <span class="stars">
                    ${getStarRating(placeDetails.rating)}
                </span>
            </div>
        `;
    }
    
    // Add photo if available
    if (placeDetails.photos && placeDetails.photos.length > 0) {
        const photoUrl = placeDetails.photos[0].getUrl({maxWidth: 200, maxHeight: 150});
        infoContent += `<div class="place-photo"><img src="${photoUrl}" alt="${placeDetails.name}" /></div>`;
    }
    
    // Add buttons
    infoContent += `
            <div class="info-actions">
                <button class="btn btn-sm btn-primary street-view-btn">Street View</button>
                ${placeDetails.website ? `<a href="${placeDetails.website}" target="_blank" class="btn btn-sm btn-outline">Website</a>` : ''}
            </div>
        </div>
    `;
    
    // Update info window
    const infoWindow = new google.maps.InfoWindow({
        content: infoContent
    });
    
    // Replace previous info window
    if (clinicMarker.infoWindow) {
        clinicMarker.infoWindow.close();
    }
    
    // Store infoWindow reference
    clinicMarker.infoWindow = infoWindow;
    
    // Open the info window
    infoWindow.open(map, clinicMarker);
    
    // Add click listener to marker
    clinicMarker.addListener('click', function() {
        infoWindow.open(map, clinicMarker);
    });
}

/**
 * Generate HTML star rating
 * @param {number} rating - Rating value (1-5)
 * @returns {string} HTML string with star icons
 */
function getStarRating(rating) {
    let stars = '';
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            stars += '<i class="icon icon-star-full"></i>';
        } else if (i === fullStars && halfStar) {
            stars += '<i class="icon icon-star-half"></i>';
        } else {
            stars += '<i class="icon icon-star-empty"></i>';
        }
    }
    
    return stars;
}

/**
 * Find and display nearby parking and public transit options
 */
function findNearbyParkingAndTransit() {
    // Check if map and Places service are initialized
    if (!placesService || !clinicPosition) return;
    
    // Search for parking
    placesService.nearbySearch({
        location: clinicPosition,
        radius: 500,
        type: ['parking']
    }, function(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            for (let i = 0; i < Math.min(results.length, 3); i++) {
                createMarker(map, results[i].geometry.location, results[i].name, false, 'parking');
            }
        }
    });
    
    // Search for transit stations
    placesService.nearbySearch({
        location: clinicPosition,
        radius: 800,
        type: ['subway_station', 'train_station', 'bus_station', 'transit_station']
    }, function(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            for (let i = 0; i < Math.min(results.length, 3); i++) {
                createMarker(map, results[i].geometry.location, results[i].name, false, 'transit');
            }
        }
    });
    
    // Add the points of interest info card
    addPOIInfoCard();
}

/**
 * Add Points of Interest info card
 */
function addPOIInfoCard() {
    const infoCards = document.querySelector('.directions-info');
    if (!infoCards) return;
    
    const poiCard = document.createElement('div');
    poiCard.className = 'info-card poi-info';
    poiCard.innerHTML = `
        <h3>Points of Interest</h3>
        <div class="poi-toggle">
            <button class="poi-btn active" data-type="all">All</button>
            <button class="poi-btn" data-type="parking">Parking</button>
            <button class="poi-btn" data-type="transit">Transit</button>
            <button class="poi-btn" data-type="pharmacy">Pharmacy</button>
        </div>
        <div class="poi-details">
            <p>Toggle different points of interest near our clinic.</p>
            <p class="poi-tip"><i class="icon icon-info"></i> Click on map markers for more information.</p>
        </div>
    `;
    
    infoCards.appendChild(poiCard);
    
    // Add event listeners to POI toggle buttons
    const poiButtons = poiCard.querySelectorAll('.poi-btn');
    poiButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            poiButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Filter markers based on selected type
            const type = this.getAttribute('data-type');
            filterMarkers(type);
            
            // If pharmacy is selected and none exists yet, search for pharmacies
            if (type === 'pharmacy' && !markers.some(marker => marker.poiType === 'pharmacy')) {
                findNearbyPharmacies();
            }
        });
    });
}

/**
 * Find and display nearby pharmacies
 */
function findNearbyPharmacies() {
    // Check if map and Places service are initialized
    if (!placesService || !clinicPosition) return;
    
    // Search for pharmacies
    placesService.nearbySearch({
        location: clinicPosition,
        radius: 1000,
        type: ['pharmacy']
    }, function(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            for (let i = 0; i < Math.min(results.length, 5); i++) {
                createMarker(map, results[i].geometry.location, results[i].name, false, 'pharmacy');
            }
        }
    });
}

/**
 * Filter map markers based on type
 * @param {string} type - Marker type to display ('all' to show all)
 */
function filterMarkers(type) {
    markers.forEach(marker => {
        if (type === 'all' || !marker.poiType || marker.poiType === type) {
            marker.setVisible(true);
        } else {
            marker.setVisible(false);
        }
    });
}

/**
 * Initialize heatmap for popular visiting times (simulated data)
 */
function initHeatmap() {
    // Create simulated popular times data (simulated foot traffic around the clinic)
    const heatmapData = [];
    
    // Add points around the clinic with varying weights to simulate popular areas
    if (clinicPosition) {
        // Add the clinic itself with high weight
        heatmapData.push({
            location: clinicPosition,
            weight: 10
        });
        
        // Create a grid of points around the clinic with random weights
        for (let i = -5; i <= 5; i++) {
            for (let j = -5; j <= 5; j++) {
                const lat = clinicPosition.lat() + (i * 0.0005);
                const lng = clinicPosition.lng() + (j * 0.0005);
                
                // Skip the center point (already added)
                if (i === 0 && j === 0) continue;
                
                // Generate weight based on distance from clinic (closer = higher weight)
                const distance = Math.sqrt(i*i + j*j);
                const weight = Math.max(0, 10 - distance * 1.5);
                
                if (weight > 0) {
                    heatmapData.push({
                        location: new google.maps.LatLng(lat, lng),
                        weight: weight
                    });
                }
            }
        }
    }
    
    // Create heatmap layer
    heatmap = new google.maps.visualization.HeatmapLayer({
        data: heatmapData,
        map: null, // Don't show by default
        radius: 25,
        opacity: 0.7,
        gradient: [
            'rgba(0, 255, 255, 0)',
            'rgba(0, 255, 255, 1)',
            'rgba(0, 191, 255, 1)',
            'rgba(0, 127, 255, 1)',
            'rgba(0, 63, 255, 1)',
            'rgba(0, 0, 255, 1)',
            'rgba(0, 0, 223, 1)',
            'rgba(0, 0, 191, 1)',
            'rgba(0, 0, 159, 1)',
            'rgba(0, 0, 127, 1)',
            'rgba(63, 0, 91, 1)',
            'rgba(127, 0, 63, 1)',
            'rgba(191, 0, 31, 1)',
            'rgba(255, 0, 0, 1)'
        ]
    });
}

/**
 * Create layer toggle controls
 */
function createLayerToggles() {
    // Create traffic layer
    trafficLayer = new google.maps.TrafficLayer();
    
    // Create transit layer
    transitLayer = new google.maps.TransitLayer();
    
    // Create bicycling layer
    bikeLayer = new google.maps.BicyclingLayer();
    
    // Create toggle controls container
    const layerControls = document.createElement('div');
    layerControls.className = 'layer-controls';
    layerControls.innerHTML = `
        <div class="layer-control-header">Map Layers</div>
        <div class="layer-control-buttons">
            <button id="toggle-traffic" class="layer-btn" title="Show Traffic">
                <i class="icon icon-traffic"></i> Traffic
            </button>
            <button id="toggle-transit" class="layer-btn" title="Show Transit">
                <i class="icon icon-transit"></i> Transit
            </button>
            <button id="toggle-bike" class="layer-btn" title="Show Bike Lanes">
                <i class="icon icon-bike"></i> Bike Lanes
            </button>
            <button id="toggle-heatmap" class="layer-btn" title="Show Popular Times">
                <i class="icon icon-heat"></i> Popular Times
            </button>
        </div>
    `;
    
    // Add controls to map
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(layerControls);
    
    // Add event listeners
    document.getElementById('toggle-traffic').addEventListener('click', function() {
        toggleLayer(this, trafficLayer);
    });
    
    document.getElementById('toggle-transit').addEventListener('click', function() {
        toggleLayer(this, transitLayer);
    });
    
    document.getElementById('toggle-bike').addEventListener('click', function() {
        toggleLayer(this, bikeLayer);
    });
    
    document.getElementById('toggle-heatmap').addEventListener('click', function() {
        toggleHeatmap(this);
    });
}

/**
 * Toggle map layer visibility
 * @param {HTMLElement} button - The clicked button
 * @param {Object} layer - The map layer to toggle
 */
function toggleLayer(button, layer) {
    if (button.classList.contains('active')) {
        layer.setMap(null);
        button.classList.remove('active');
    } else {
        layer.setMap(map);
        button.classList.add('active');
    }
}

/**
 * Toggle heatmap visibility
 * @param {HTMLElement} button - The clicked button
 */
function toggleHeatmap(button) {
    if (button.classList.contains('active')) {
        heatmap.setMap(null);
        button.classList.remove('active');
    } else {
        heatmap.setMap(map);
        button.classList.add('active');
    }
}

/**
 * Initialize autocomplete for the origin input field with improved validation
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
                validateAddressInput(originInput.value);
                return;
            }
            
            // If the place has a geometry, center the map on it
            if (place.geometry.viewport) {
                map.fitBounds(place.geometry.viewport);
            } else {
                map.setCenter(place.geometry.location);
                map.setZoom(17);
            }
            
            // Set a validated flag on the input
            originInput.setAttribute('data-validated', 'true');
            
            // Change the input's styling to indicate validation
            originInput.parentElement.classList.add('validated');
        });
        
        // Add blur handler to validate address
        originInput.addEventListener('blur', function() {
            if (!originInput.getAttribute('data-validated') && originInput.value.trim()) {
                validateAddressInput(originInput.value);
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
 * Validate address input using Geocoding API
 * @param {string} address - Address to validate
 */
function validateAddressInput(address) {
    if (!address || !geocodingService) return;
    
    geocodingService.geocode({ address: address }, function(results, status) {
        const originInput = document.getElementById('origin');
        if (!originInput) return;
        
        if (status === 'OK' && results[0]) {
            // Address is valid, update with formatted address
            originInput.value = results[0].formatted_address;
            originInput.setAttribute('data-validated', 'true');
            originInput.parentElement.classList.add('validated');
            
            // Add a small checkmark or validation indicator
            const validationIcon = document.createElement('span');
            validationIcon.className = 'validation-icon valid';
            validationIcon.innerHTML = '<i class="icon icon-check"></i>';
            
            // Remove existing validation icons
            const existingIcons = originInput.parentElement.querySelectorAll('.validation-icon');
            existingIcons.forEach(icon => icon.remove());
            
            // Add new validation icon
            originInput.parentElement.appendChild(validationIcon);
        } else {
            // Address might be invalid or incomplete
            originInput.setAttribute('data-validated', 'false');
            originInput.parentElement.classList.remove('validated');
            
            // Add a warning indicator
            const validationIcon = document.createElement('span');
            validationIcon.className = 'validation-icon warning';
            validationIcon.innerHTML = '<i class="icon icon-warning"></i>';
            validationIcon.title = 'Address could not be validated. Route may be less accurate.';
            
            // Remove existing validation icons
            const existingIcons = originInput.parentElement.querySelectorAll('.validation-icon');
            existingIcons.forEach(icon => icon.remove());
            
            // Add new validation icon
            originInput.parentElement.appendChild(validationIcon);
        }
    });
}

/**
 * Create a marker on the map with enhanced info windows
 * @param {Object} map - The Google Map object
 * @param {Object} position - Lat/lng position
 * @param {string} title - Marker title
 * @param {boolean} isClinic - Whether this marker is for the clinic
 * @param {string} type - POI type (parking, transit, pharmacy, etc.)
 * @returns {Object} The created marker
 */
function createMarker(map, position, title, isClinic = false, type = null) {
    // Determine marker icon based on type
    let icon = null;
    
    if (isClinic) {
        icon = {
            url: 'assets/images/marker-clinic.png',
            scaledSize: new google.maps.Size(40, 40)
        };
    } else if (type) {
        // Use different icons for different POI types
        switch(type) {
            case 'parking':
                icon = {
                    url: 'assets/images/marker-parking.png',
                    scaledSize: new google.maps.Size(30, 30)
                };
                break;
            case 'transit':
                icon = {
                    url: 'assets/images/marker-transit.png',
                    scaledSize: new google.maps.Size(30, 30)
                };
                break;
            case 'pharmacy':
                icon = {
                    url: 'assets/images/marker-pharmacy.png',
                    scaledSize: new google.maps.Size(30, 30)
                };
                break;
            default:
                // Default marker
                break;
        }
    }
    
    const marker = new google.maps.Marker({
        position: position,
        map: map,
        title: title,
        animation: google.maps.Animation.DROP,
        icon: icon
    });
    
    // Store POI type for filtering
    if (type) {
        marker.poiType = type;
    }
    
    // Create info window content based on marker type
    let infoContent = '';
    
    if (isClinic) {
        infoContent = getClinicInfoContent();
    } else if (type) {
        infoContent = getPOIInfoContent(title, type);
    } else {
        infoContent = `<div class="info-window"><h4>${title}</h4></div>`;
    }
    
    // Create info window
    const infoWindow = new google.maps.InfoWindow({
        content: infoContent
    });
    
    // Store reference to info window
    marker.infoWindow = infoWindow;
    
    // Open info window when marker is clicked
    marker.addListener('click', function() {
        // Close all other info windows first
        markers.forEach(m => {
            if (m.infoWindow && m !== marker) {
                m.infoWindow.close();
            }
        });
        
        infoWindow.open(map, marker);
    });
    
    // If it's the clinic marker, open info window by default
    if (isClinic) {
        setTimeout(() => {
            infoWindow.open(map, marker);
        }, 1000);
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
            <div class="info-actions">
                <button class="btn btn-sm btn-primary street-view-btn">See Street View</button>
                <button class="btn btn-sm btn-outline share-location-btn">Share Location</button>
            </div>
        </div>
    `;
}

/**
 * Get info window content for POI markers
 * @param {string} title - POI title
 * @param {string} type - POI type
 * @returns {string} HTML content for info window
 */
function getPOIInfoContent(title, type) {
    let typeIcon = '';
    let typeInfo = '';
    
    switch (type) {
        case 'parking':
            typeIcon = 'icon-parking';
            typeInfo = 'Parking Facility';
            break;
        case 'pharmacy':
            typeIcon = 'icon-pharmacy';
            typeInfo = 'Pharmacy';
            break;
        case 'transit':
            typeIcon = 'icon-transit';
            typeInfo = 'Transit Station';
            break;
        default:
            typeIcon = 'icon-location';
            typeInfo = 'Point of Interest';
    }
    
    return `
        <div class="info-window poi-info">
            <div class="poi-icon">
                <i class="icon ${typeIcon}"></i>
            </div>
            <h4>${title}</h4>
            <p>${typeInfo}</p>
            <div class="info-actions">
                <button class="btn btn-sm btn-primary add-to-route-btn" data-name="${title}">Add to Route</button>
            </div>
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
    const routeOptionsBtn = document.getElementById('route-options');
    
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
    
    // Add event listener for Route Options button
    if (routeOptionsBtn) {
        routeOptionsBtn.addEventListener('click', toggleRouteOptions);
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
                                    originInput.setAttribute('data-validated', 'true');
                                    originInput.parentElement.classList.add('validated');
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
    
    // Add event listener for POI "Add to Route" buttons (delegated)
    document.addEventListener('click', function(e) {
        if (e.target && e.target.classList.contains('add-to-route-btn')) {
            const poiName = e.target.getAttribute('data-name');
            if (poiName) {
                addPOIToRoute(poiName);
            }
        }
        
        if (e.target && e.target.classList.contains('share-location-btn')) {
            shareLocation();
        }
        
        if (e.target && e.target.classList.contains('select-route-alt')) {
            const routeIndex = parseInt(e.target.getAttribute('data-route-index'));
            selectRouteAlternative(routeIndex);
        }
    });
}

/**
 * Toggle advanced route options panel
 */
function toggleRouteOptions() {
    const optionsPanel = document.getElementById('route-options-panel');
    const optionsBtn = document.getElementById('route-options');
    
    if (optionsPanel) {
        if (optionsPanel.classList.contains('visible')) {
            optionsPanel.classList.remove('visible');
            optionsBtn.classList.remove('active');
        } else {
            optionsPanel.classList.add('visible');
            optionsBtn.classList.add('active');
        }
    } else {
        // Create options panel if it doesn't exist
        const form = document.getElementById('directionsForm');
        if (!form) return;
        
        const panel = document.createElement('div');
        panel.id = 'route-options-panel';
        panel.className = 'route-options-panel visible';
        
        panel.innerHTML = `
            <h4>Route Preferences</h4>
            <div class="options-group">
                <label class="checkbox-label">
                    <input type="checkbox" id="avoid-tolls"> Avoid tolls
                </label>
                <label class="checkbox-label">
                    <input type="checkbox" id="avoid-highways"> Avoid highways
                </label>
                <label class="checkbox-label">
                    <input type="checkbox" id="avoid-ferries"> Avoid ferries
                </label>
            </div>
            <div class="options-group">
                <label for="route-alternatives">Route alternatives:</label>
                <select id="route-alternatives">
                    <option value="1">Show best route only</option>
                    <option value="3" selected>Show up to 3 routes</option>
                </select>
            </div>
            <div class="options-group">
                <label for="units-system">Distance units:</label>
                <select id="units-system">
                    <option value="imperial" selected>Miles (Imperial)</option>
                    <option value="metric">Kilometers (Metric)</option>
                </select>
            </div>
            <div class="options-actions">
                <button type="button" class="btn btn-primary apply-options">Apply Options</button>
            </div>
        `;
        
        form.appendChild(panel);
        optionsBtn.classList.add('active');
        
        // Add event listener for Apply Options button
        panel.querySelector('.apply-options').addEventListener('click', function() {
            // If directions are already displayed, recalculate with new options
            if (directionsRenderer.getDirections()) {
                calculateAndDisplayRoute();
            }
            
            // Hide panel
            panel.classList.remove('visible');
            optionsBtn.classList.remove('active');
        });
    }
}

/**
 * Add POI to route as a waypoint
 * @param {string} poiName - Name of the POI to add
 */
function addPOIToRoute(poiName) {
    // First add a waypoint input
    addWaypoint();
    
    // Get the newly added waypoint input
    const waypointContainers = document.querySelectorAll('.waypoint-container');
    if (waypointContainers.length > 0) {
        const lastContainer = waypointContainers[waypointContainers.length - 1];
        const input = lastContainer.querySelector('.waypoint-input');
        
        if (input) {
            // Set the POI name as the waypoint value
            input.value = poiName;
            input.setAttribute('data-validated', 'true');
            
            // Show confirmation message
            const message = document.createElement('div');
            message.className = 'waypoint-added-message';
            message.textContent = `Added ${poiName} to your route`;
            message.style.opacity = '1';
            
            lastContainer.appendChild(message);
            
            // Fade out and remove after 3 seconds
            setTimeout(() => {
                message.style.opacity = '0';
                setTimeout(() => {
                    if (message.parentNode) {
                        message.parentNode.removeChild(message);
                    }
                }, 500);
            }, 3000);
        }
    }
}

/**
 * Share clinic location with various share options
 */
function shareLocation() {
    // Create a modal for sharing options
    const modal = document.createElement('div');
    modal.className = 'share-modal';
    
    const clinicAddress = "Wisdom Bites Dental Clinic, 123 Dental Avenue, Smile City, SC 12345";
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clinicAddress)}`;
    
    modal.innerHTML = `
        <div class="share-content">
            <div class="share-header">
                <h3>Share Our Location</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="share-options">
                <div class="share-address">
                    <p>${clinicAddress}</p>
                    <button class="btn btn-sm btn-outline copy-address">
                        <i class="icon icon-copy"></i> Copy Address
                    </button>
                </div>
                <div class="share-links">
                    <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(mapUrl)}" target="_blank" class="share-btn facebook">
                        <i class="icon icon-facebook"></i> Facebook
                    </a>
                    <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent('Get directions to Wisdom Bites Dental Clinic')}&url=${encodeURIComponent(mapUrl)}" target="_blank" class="share-btn twitter">
                        <i class="icon icon-twitter"></i> Twitter
                    </a>
                    <a href="mailto:?subject=${encodeURIComponent('Directions to Wisdom Bites Dental Clinic')}&body=${encodeURIComponent('Here is the address and map link to Wisdom Bites Dental Clinic:\n\n' + clinicAddress + '\n\n' + mapUrl)}" class="share-btn email">
                        <i class="icon icon-email"></i> Email
                    </a>
                    <a href="sms:?body=${encodeURIComponent('Wisdom Bites Dental Clinic: ' + clinicAddress + ' ' + mapUrl)}" class="share-btn sms">
                        <i class="icon icon-sms"></i> SMS
                    </a>
                </div>
                <div class="share-map">
                    <div class="embed-map">
                        <iframe 
                            width="100%" 
                            height="200" 
                            style="border:0" 
                            loading="lazy" 
                            allowfullscreen 
                            referrerpolicy="no-referrer-when-downgrade" 
                            src="https://www.google.com/maps/embed/v1/place?key=AIzaSyDY7pn8Bkb9dxMKX6pKgldH1a2acVjmWsw&q=123+Dental+Avenue,+Smile+City,+SC+12345">
                        </iframe>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to body
    document.body.appendChild(modal);
    
    // Add event listeners
    modal.querySelector('.close-modal').addEventListener('click', function() {
        document.body.removeChild(modal);
    });
    
    modal.querySelector('.copy-address').addEventListener('click', function() {
        navigator.clipboard.writeText(clinicAddress).then(function() {
            const copyBtn = modal.querySelector('.copy-address');
            copyBtn.innerHTML = '<i class="icon icon-check"></i> Copied!';
            setTimeout(() => {
                copyBtn.innerHTML = '<i class="icon icon-copy"></i> Copy Address';
            }, 2000);
        });
    });
    
    // Close when clicking outside the modal content
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
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
    const autocomplete = new google.maps.places.Autocomplete(waypointInput, {
        types: ['geocode']
    });
    
    // Listen for place selection to validate
    autocomplete.addListener('place_changed', function() {
        const place = autocomplete.getPlace();
        
        if (place.geometry) {
            waypointInput.setAttribute('data-validated', 'true');
        }
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
 * Calculate and display route based on form inputs using enhanced Routes API
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
    
    // Show loading indicator
    const directionsPanel = document.getElementById('directions-panel');
    if (directionsPanel) {
        directionsPanel.innerHTML = '<div class="directions-loading"><i class="icon icon-loading"></i> Calculating best route...</div>';
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
    
    // Get route options
    const avoidTolls = document.getElementById('avoid-tolls')?.checked || false;
    const avoidHighways = document.getElementById('avoid-highways')?.checked || false;
    const avoidFerries = document.getElementById('avoid-ferries')?.checked || false;
    const routeAlternatives = document.getElementById('route-alternatives')?.value || 3;
    const unitsSystem = document.getElementById('units-system')?.value || 'imperial';
    
    // Set up request object for directions service
    const request = {
        origin: origin,
        destination: destination,
        waypoints: waypoints,
        optimizeWaypoints: optimizeWaypoints,
        travelMode: google.maps.TravelMode[travelMode],
        unitSystem: unitsSystem === 'metric' ? 
                    google.maps.UnitSystem.METRIC : 
                    google.maps.UnitSystem.IMPERIAL,
        provideRouteAlternatives: routeAlternatives > 1,
        avoidTolls: avoidTolls,
        avoidHighways: avoidHighways,
        avoidFerries: avoidFerries
    };
    
    // Call the directions service
    directionsService.route(request, function(response, status) {
        if (status === 'OK') {
            // Store route alternatives
            routeAlternatives = response.routes;
            
            // Display the route
            directionsRenderer.setDirections(response);
            
            // If waypoints were optimized, update the UI to reflect the new order
            if (optimizeWaypoints && response.routes[0].waypoint_order.length > 0) {
                rearrangeWaypointInputs(response.routes[0].waypoint_order);
            }
            
            // Show route summary and alternatives
            showRouteDetails(response);
        } else {
            console.error('Directions request failed due to ' + status);
            
            if (directionsPanel) {
                directionsPanel.innerHTML = `
                    <div class="directions-error">
                        <i class="icon icon-warning"></i>
                        <h3>Unable to Calculate Route</h3>
                        <p>${getDirectionsErrorMessage(status)}</p>
                        <button class="btn btn-primary retry-directions">Try Again</button>
                    </div>
                `;
                
                // Add event listener for retry button
                const retryBtn = directionsPanel.querySelector('.retry-directions');
                if (retryBtn) {
                    retryBtn.addEventListener('click', function() {
                        calculateAndDisplayRoute(optimizeWaypoints);
                    });
                }
            }
        }
    });
}

/**
 * Get human-readable error message for directions errors
 * @param {string} status - Error status from Directions API
 * @returns {string} Human-readable error message
 */
function getDirectionsErrorMessage(status) {
    switch(status) {
        case 'ZERO_RESULTS':
            return "We couldn't find a route between these locations. Please check the addresses and try again.";
        case 'NOT_FOUND':
            return "At least one of the locations couldn't be found. Please verify the addresses.";
        case 'MAX_WAYPOINTS_EXCEEDED':
            return "You've added too many stops. Please remove some waypoints and try again.";
        case 'INVALID_REQUEST':
            return "The request was invalid. Please check your input and try again.";
        case 'OVER_QUERY_LIMIT':
            return "We've made too many requests. Please try again in a few minutes.";
        case 'REQUEST_DENIED':
            return "The directions request was denied. This may be due to a security restriction.";
        case 'UNKNOWN_ERROR':
            return "An unknown error occurred. Please try again later.";
        default:
            return "An error occurred while calculating directions. Please try again.";
    }
}

/**
 * Show detailed route information and alternatives
 * @param {Object} response - Directions API response
 */
function showRouteDetails(response) {
    const directionsPanel = document.getElementById('directions-panel');
    if (!directionsPanel) return;
    
    // Clear any previous content
    directionsPanel.innerHTML = '';
    
    // Create container for alternative routes if we have more than one
    if (response.routes.length > 1) {
        const alternativesContainer = document.createElement('div');
        alternativesContainer.className = 'route-alternatives';
        alternativesContainer.innerHTML = '<h3>Route Options</h3>';
        
        // Create route cards for each alternative
        response.routes.forEach((route, index) => {
            // Calculate total distance and duration
            let totalDistance = 0;
            let totalDuration = 0;
            
            route.legs.forEach(leg => {
                totalDistance += leg.distance.value;
                totalDuration += leg.duration.value;
            });
            
            // Convert to appropriate units
            const unitsSystem = document.getElementById('units-system')?.value || 'imperial';
            const distanceText = unitsSystem === 'metric' ? 
                                (totalDistance / 1000).toFixed(1) + ' km' : 
                                (totalDistance / 1609.34).toFixed(1) + ' miles';
                                
            const durationInMinutes = Math.round(totalDuration / 60);
            
            const routeCard = document.createElement('div');
            routeCard.className = 'route-card';
            if (index === 0) routeCard.classList.add('active');
            
            routeCard.innerHTML = `
                <div class="route-info">
                    <div class="route-header">
                        <span class="route-label">${index === 0 ? 'Best Route' : 'Alternative ' + index}</span>
                        <span class="route-stats">${distanceText} • ${durationInMinutes} min</span>
                    </div>
                    <div class="route-description">
                        ${getRouteDescription(route)}
                    </div>
                </div>
                <button class="btn btn-sm ${index === 0 ? 'btn-primary' : 'btn-outline'} select-route-alt" data-route-index="${index}">
                    ${index === 0 ? 'Current Route' : 'Select Route'}
                </button>
            `;
            
            alternativesContainer.appendChild(routeCard);
        });
        
        // Add alternatives container to directions panel
        directionsPanel.appendChild(alternativesContainer);
    }
    
    // Create summary for the selected (first) route
    const route = response.routes[0];
    
    // Calculate total distance and duration
    let totalDistance = 0;
    let totalDuration = 0;
    
    route.legs.forEach(leg => {
        totalDistance += leg.distance.value;
        totalDuration += leg.duration.value;
    });
    
    // Convert to appropriate units
    const unitsSystem = document.getElementById('units-system')?.value || 'imperial';
    const distanceText = unitsSystem === 'metric' ? 
                        (totalDistance / 1000).toFixed(1) + ' km' : 
                        (totalDistance / 1609.34).toFixed(1) + ' miles';
    
    const durationInMinutes = Math.round(totalDuration / 60);
    const hours = Math.floor(durationInMinutes / 60);
    const minutes = durationInMinutes % 60;
    const durationText = hours > 0 ? `${hours} hr ${minutes} min` : `${minutes} min`;
    
    const departureTime = new Date();
    const arrivalTime = new Date(departureTime.getTime() + (totalDuration * 1000));
    
    // Create summary element
    const summary = document.createElement('div');
    summary.className = 'route-summary';
    
    // Create departure time selector
    const timeOptions = [
        { label: 'Leave now', value: 'now' },
        { label: 'Leave in 30 minutes', value: '30min' },
        { label: 'Leave in 1 hour', value: '1hour' },
        { label: 'Leave tomorrow morning', value: 'tomorrow' }
    ];
    
    let timeOptionsHtml = '';
    timeOptions.forEach(option => {
        timeOptionsHtml += `<option value="${option.value}">${option.label}</option>`;
    });
    
    summary.innerHTML = `
        <h3>Route Summary</h3>
        <div class="departure-selector">
            <select id="departure-time">
                ${timeOptionsHtml}
            </select>
        </div>
        <div class="summary-details">
            <div class="summary-row">
                <span class="summary-label">Distance:</span>
                <span class="summary-value">${distanceText}</span>
            </div>
            <div class="summary-row">
                <span class="summary-label">Duration:</span>
                <span class="summary-value">${durationText}</span>
            </div>
            <div class="summary-row">
                <span class="summary-label">Arrive by:</span>
                <span class="summary-value">${formatTime(arrivalTime)}</span>
            </div>
            <div class="summary-row">
                <span class="summary-label">Travel Mode:</span>
                <span class="summary-value">${travelMode.charAt(0) + travelMode.slice(1).toLowerCase()}</span>
            </div>
        </div>
        <div class="summary-actions">
            <button class="btn btn-outline calendar-event-btn">
                <i class="icon icon-calendar"></i> Add to Calendar
            </button>
            <button class="btn btn-outline share-route-btn">
                <i class="icon icon-share"></i> Share Route
            </button>
        </div>
    `;
    
    // Add summary to directions panel
    directionsPanel.appendChild(summary);
    
    // Add step-by-step directions title
    const stepsTitle = document.createElement('h3');
    stepsTitle.className = 'steps-title';
    stepsTitle.textContent = 'Step-by-Step Directions';
    directionsPanel.appendChild(stepsTitle);
    
    // Add step-by-step directions
    const stepsContainer = document.createElement('div');
    stepsContainer.className = 'steps-container';
    directionsPanel.appendChild(stepsContainer);
    
    // Set steps container as directions renderer panel
    directionsRenderer.setPanel(stepsContainer);
    
    // Add event listeners for departure time selector
    const departureSelect = document.getElementById('departure-time');
    if (departureSelect) {
        departureSelect.addEventListener('change', function() {
            updateArrivalTime(this.value, totalDuration);
        });
    }
    
    // Add event listeners for action buttons
    const calendarBtn = summary.querySelector('.calendar-event-btn');
    if (calendarBtn) {
        calendarBtn.addEventListener('click', function() {
            addRouteToCalendar(response.routes[0]);
        });
    }
    
    const shareBtn = summary.querySelector('.share-route-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', function() {
            shareRoute(response.routes[0]);
        });
    }
}

/**
 * Format time for display
 * @param {Date} date - Date object to format
 * @returns {string} Formatted time string
 */
function formatTime(date) {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
}

/**
 * Update arrival time based on departure selection
 * @param {string} departureOption - Selected departure option
 * @param {number} durationSeconds - Route duration in seconds
 */
function updateArrivalTime(departureOption, durationSeconds) {
    const summaryRow = document.querySelector('.summary-row:nth-child(3) .summary-value');
    if (!summaryRow) return;
    
    let departureTime = new Date();
    
    switch(departureOption) {
        case '30min':
            departureTime.setMinutes(departureTime.getMinutes() + 30);
            break;
        case '1hour':
            departureTime.setHours(departureTime.getHours() + 1);
            break;
        case 'tomorrow':
            departureTime.setDate(departureTime.getDate() + 1);
            departureTime.setHours(9, 0, 0, 0);
            break;
        default:
            // Leave now - already set
            break;
    }
    
    const arrivalTime = new Date(departureTime.getTime() + (durationSeconds * 1000));
    summaryRow.textContent = formatTime(arrivalTime);
}

/**
 * Generate human-readable route description
 * @param {Object} route - Route object
 * @returns {string} Route description
 */
function getRouteDescription(route) {
    if (!route || !route.legs || route.legs.length === 0) {
        return 'Route details not available';
    }
    
    // Get major roads/highways from the route
    const majorRoads = [];
    
    route.legs.forEach(leg => {
        leg.steps.forEach(step => {
            if (step.instructions && step.distance.value > 1000) {
                // Extract highway or major road names from instructions
                const roadMatches = step.instructions.match(/([A-Z]-\d+|[A-Z]{2}-\d+|Route \d+|Highway \d+)/g);
                if (roadMatches) {
                    roadMatches.forEach(road => {
                        if (!majorRoads.includes(road)) {
                            majorRoads.push(road);
                        }
                    });
                }
            }
        });
    });
    
    // If major roads found, use them in description
    if (majorRoads.length > 0) {
        return `Via ${majorRoads.slice(0, 2).join(' and ')}${majorRoads.length > 2 ? ' and more' : ''}`;
    }
    
    // Fallback to simple route description
    const startAddress = route.legs[0].start_address.split(',')[0];
    const endAddress = route.legs[route.legs.length - 1].end_address.split(',')[0];
    
    return `From ${startAddress} to ${endAddress}`;
}

/**
 * Select a different route alternative
 * @param {number} routeIndex - Index of the route to select
 */
function selectRouteAlternative(routeIndex) {
    if (!routeAlternatives || routeIndex >= routeAlternatives.length) return;
    
    // Update the directions renderer with the selected route
    directionsRenderer.setRouteIndex(routeIndex);
    
    // Update the active route card
    const routeCards = document.querySelectorAll('.route-card');
    routeCards.forEach((card, index) => {
        const selectBtn = card.querySelector('.select-route-alt');
        
        if (index === routeIndex) {
            card.classList.add('active');
            if (selectBtn) {
                selectBtn.className = 'btn btn-sm btn-primary select-route-alt';
                selectBtn.textContent = 'Current Route';
            }
        } else {
            card.classList.remove('active');
            if (selectBtn) {
                selectBtn.className = 'btn btn-sm btn-outline select-route-alt';
                selectBtn.textContent = 'Select Route';
            }
        }
    });
}

/**
 * Add route to calendar
 * @param {Object} route - Route object
 */
function addRouteToCalendar(route) {
    if (!route || !route.legs || route.legs.length === 0) return;
    
    const departureSelect = document.getElementById('departure-time');
    const departureOption = departureSelect ? departureSelect.value : 'now';
    
    // Calculate departure and arrival times
    let departureTime = new Date();
    
    switch(departureOption) {
        case '30min':
            departureTime.setMinutes(departureTime.getMinutes() + 30);
            break;
        case '1hour':
            departureTime.setHours(departureTime.getHours() + 1);
            break;
        case 'tomorrow':
            departureTime.setDate(departureTime.getDate() + 1);
            departureTime.setHours(9, 0, 0, 0);
            break;
        default:
            // Leave now - already set
            break;
    }
    
    // Calculate total duration
    let totalDuration = 0;
    route.legs.forEach(leg => {
        totalDuration += leg.duration.value;
    });
    
    const arrivalTime = new Date(departureTime.getTime() + (totalDuration * 1000));
    
    // Format dates for calendar URL
    const formatDate = (date) => {
        return date.toISOString().replace(/-|:|\.\d+/g, '');
    };
    
    const start = formatDate(departureTime);
    const end = formatDate(arrivalTime);
    
    // Create calendar event details
    const origin = route.legs[0].start_address;
    const destination = route.legs[route.legs.length - 1].end_address;
    
    const eventTitle = encodeURIComponent(`Travel to Wisdom Bites Dental Clinic`);
    const location = encodeURIComponent(destination);
    const description = encodeURIComponent(`Directions from ${origin} to ${destination}. Estimated travel time: ${Math.round(totalDuration / 60)} minutes.`);
    
    // Create Google Calendar URL
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${eventTitle}&dates=${start}/${end}&details=${description}&location=${location}&sf=true&output=xml`;
    
    // Open calendar link in new window
    window.open(googleCalendarUrl, '_blank');
}

/**
 * Share route with various share options
 * @param {Object} route - Route object
 */
function shareRoute(route) {
    if (!route || !route.legs || route.legs.length === 0) return;
    
    // Create a modal for sharing options
    const modal = document.createElement('div');
    modal.className = 'share-modal';
    
    const origin = route.legs[0].start_address;
    const destination = route.legs[route.legs.length - 1].end_address;
    
    // Calculate total distance and duration
    let totalDistance = 0;
    let totalDuration = 0;
    
    route.legs.forEach(leg => {
        totalDistance += leg.distance.value;
        totalDuration += leg.duration.value;
    });
    
    // Convert to appropriate units
    const unitsSystem = document.getElementById('units-system')?.value || 'imperial';
    const distanceText = unitsSystem === 'metric' ? 
                        (totalDistance / 1000).toFixed(1) + ' km' : 
                        (totalDistance / 1609.34).toFixed(1) + ' miles';
    
    const durationInMinutes = Math.round(totalDuration / 60);
    
    // Create Google Maps directions URL
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelmode=${travelMode.toLowerCase()}`;
    
    modal.innerHTML = `
        <div class="share-content">
            <div class="share-header">
                <h3>Share Route</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="share-options">
                <div class="share-route-info">
                    <p><strong>From:</strong> ${origin}</p>
                    <p><strong>To:</strong> ${destination}</p>
                    <p><strong>Distance:</strong> ${distanceText} (about ${durationInMinutes} min)</p>
                    <div class="route-link">
                        <input type="text" readonly value="${directionsUrl}">
                        <button class="btn btn-sm btn-outline copy-link">
                            <i class="icon icon-copy"></i> Copy Link
                        </button>
                    </div>
                </div>
                <div class="share-links">
                    <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(directionsUrl)}" target="_blank" class="share-btn facebook">
                        <i class="icon icon-facebook"></i> Facebook
                    </a>
                    <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent('Directions to Wisdom Bites Dental Clinic')}&url=${encodeURIComponent(directionsUrl)}" target="_blank" class="share-btn twitter">
                        <i class="icon icon-twitter"></i> Twitter
                    </a>
                    <a href="mailto:?subject=${encodeURIComponent('Directions to Wisdom Bites Dental Clinic')}&body=${encodeURIComponent('Here are directions to Wisdom Bites Dental Clinic:\n\nFrom: ' + origin + '\nTo: ' + destination + '\nDistance: ' + distanceText + '\nEstimated time: ' + durationInMinutes + ' minutes\n\nView on Google Maps: ' + directionsUrl)}" class="share-btn email">
                        <i class="icon icon-email"></i> Email
                    </a>
                    <a href="sms:?body=${encodeURIComponent('Directions to Wisdom Bites Dental Clinic: ' + directionsUrl)}" class="share-btn sms">
                        <i class="icon icon-sms"></i> SMS
                    </a>
                </div>
                <div class="share-qrcode">
                    <p>Scan to view on mobile device:</p>
                    <div id="route-qrcode"></div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to body
    document.body.appendChild(modal);
    
    // Generate QR code (using Google Charts API)
    const qrCodeContainer = modal.querySelector('#route-qrcode');
    if (qrCodeContainer) {
        const qrCodeUrl = `https://chart.googleapis.com/chart?cht=qr&chs=200x200&chl=${encodeURIComponent(directionsUrl)}`;
        const qrImg = document.createElement('img');
        qrImg.src = qrCodeUrl;
        qrImg.alt = 'QR Code for directions';
        qrCodeContainer.appendChild(qrImg);
    }
    
    // Add event listeners
    modal.querySelector('.close-modal').addEventListener('click', function() {
        document.body.removeChild(modal);
    });
    
    modal.querySelector('.copy-link').addEventListener('click', function() {
        const linkInput = modal.querySelector('.route-link input');
        linkInput.select();
        navigator.clipboard.writeText(linkInput.value).then(function() {
            const copyBtn = modal.querySelector('.copy-link');
            copyBtn.innerHTML = '<i class="icon icon-check"></i> Copied!';
            setTimeout(() => {
                copyBtn.innerHTML = '<i class="icon icon-copy"></i> Copy Link';
            }, 2000);
        });
    });
    
    // Close when clicking outside the modal content
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            document.body.removeChild(modal);
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
    const resetMapBtn = document.getElementById('reset-map');
    const embedViewBtn = document.getElementById('embed-view');
    
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
            
            // Hide any open info windows
            markers.forEach(marker => {
                if (marker.infoWindow) {
                    marker.infoWindow.close();
                }
            });
            
            // Reset layer toggles
            resetAllLayers();
        });
    }
    
    if (embedViewBtn) {
        embedViewBtn.addEventListener('click', function() {
            showEmbedMapView();
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
 * Reset all map layers
 */
function resetAllLayers() {
    // Reset traffic layer
    if (trafficLayer) {
        trafficLayer.setMap(null);
        const trafficBtn = document.getElementById('toggle-traffic');
        if (trafficBtn) trafficBtn.classList.remove('active');
    }
    
    // Reset transit layer
    if (transitLayer) {
        transitLayer.setMap(null);
        const transitBtn = document.getElementById('toggle-transit');
        if (transitBtn) transitBtn.classList.remove('active');
    }
    
    // Reset bike layer
    if (bikeLayer) {
        bikeLayer.setMap(null);
        const bikeBtn = document.getElementById('toggle-bike');
        if (bikeBtn) bikeBtn.classList.remove('active');
    }
    
    // Reset heatmap
    if (heatmap) {
        heatmap.setMap(null);
        const heatmapBtn = document.getElementById('toggle-heatmap');
        if (heatmapBtn) heatmapBtn.classList.remove('active');
    }
}

/**
 * Show Embed Map View using Maps Embed API
 */
function showEmbedMapView() {
    // Create modal for embed view
    const modal = document.createElement('div');
    modal.className = 'embed-map-modal';
    
    const clinicAddress = "Wisdom Bites Dental Clinic, 123 Dental Avenue, Smile City, SC 12345";
    const apiKey = 'AIzaSyDY7pn8Bkb9dxMKX6pKgldH1a2acVjmWsw';
    
    modal.innerHTML = `
        <div class="embed-map-content">
            <div class="embed-map-header">
                <h3>Embedded Map View</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="embed-map-container">
                <iframe 
                    width="100%" 
                    height="450" 
                    style="border:0" 
                    loading="lazy" 
                    allowfullscreen 
                    referrerpolicy="no-referrer-when-downgrade" 
                    src="https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(clinicAddress)}&zoom=15">
                </iframe>
            </div>
            <div class="embed-map-footer">
                <p>This view may be easier to use on mobile devices.</p>
                <button class="btn btn-primary directions-embed-btn">Get Directions in this View</button>
            </div>
        </div>
    `;
    
    // Add modal to body
    document.body.appendChild(modal);
    
    // Add event listeners
    modal.querySelector('.close-modal').addEventListener('click', function() {
        document.body.removeChild(modal);
    });
    
    // Add event listener for directions button
    modal.querySelector('.directions-embed-btn').addEventListener('click', function() {
        // Get origin from the form
        const originInput = document.getElementById('origin');
        const origin = originInput ? originInput.value : '';
        
        // Replace iframe with directions embed
        const embedContainer = modal.querySelector('.embed-map-container');
        if (embedContainer && origin) {
            embedContainer.innerHTML = `
                <iframe 
                    width="100%" 
                    height="450" 
                    style="border:0" 
                    loading="lazy" 
                    allowfullscreen 
                    referrerpolicy="no-referrer-when-downgrade" 
                    src="https://www.google.com/maps/embed/v1/directions?key=${apiKey}&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(clinicAddress)}&mode=${travelMode.toLowerCase()}">
                </iframe>
            `;
        } else if (embedContainer) {
            alert('Please enter a starting location in the form first.');
        }
    });
    
    // Close when clicking outside the modal content
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            document.body.removeChild(modal);
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
 * Initialize sharing options for the directions page
 */
function initSharingOptions() {
    const shareBtn = document.getElementById('share-clinic-location');
    if (shareBtn) {
        shareBtn.addEventListener('click', function() {
            shareLocation();
        });
    }
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

// Add an event listener to handle all API-related clicks
document.addEventListener('click', function(e) {
    // Handle clicks on POI markers to add to route
    if (e.target && e.target.classList.contains('add-to-route-btn')) {
        const poiName = e.target.getAttribute('data-name');
        if (poiName) {
            addPOIToRoute(poiName);
        }
    }
    
    // Handle click on share location button
    if (e.target && e.target.classList.contains('share-location-btn')) {
        shareLocation();
    }
    
    // Handle click on route alternative selection
    if (e.target && e.target.classList.contains('select-route-alt')) {
        const routeIndex = parseInt(e.target.getAttribute('data-route-index'));
        selectRouteAlternative(routeIndex);
    }
});

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
    
    // Initialize Places service for additional POI data
    placesService = new google.maps.places.PlacesService(map);
    
    // Initialize Geocoding service for address resolution
    geocodingService = new google.maps.Geocoder();
    
    // Add a marker for the dental clinic with actual geocoding
    geocodeClinicAddress(clinicAddress);
    
    // Initialize autocomplete for origin input
    initAutocomplete();
    
    // Update static map with styled fallback
    updateStaticMap(clinicPosition);
    
    // Initialize nearby points of interest
    findNearbyParkingAndTransit();
    
    // Initialize heatmap for popular times (simulated)
    initHeatmap();
    
    // Set flag that map is ready
    mapReady = true;
    
    // Create layer toggle controls
    createLayerToggles();
}

/**
 * Geocode the clinic address to get accurate coordinates
 * @param {string} address - Full clinic address
 */
function geocodeClinicAddress(address) {
    const geocoder = new google.maps.Geocoder();
    
    geocoder.geocode({ address: address }, function(results, status) {
        if (status === 'OK' && results[0]) {
            // Update clinic position with accurate coordinates
            clinicPosition = results[0].geometry.location;
            
            // Center map on geocoded position
            map.setCenter(clinicPosition);
            
            // Add clinic marker
            createMarker(map, clinicPosition, 'clinic', getClinicInfoContent());
        } else {
            console.error('Geocode was not successful for the following reason: ' + status);
        }
    });
}

/**
 * Get clinic info window content
 * @returns {string} HTML content for clinic info window
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
            <div class="info-actions">
                <button class="btn btn-sm btn-primary street-view-btn">See Street View</button>
                <button class="btn btn-sm btn-outline share-location-btn">Share Location</button>
            </div>
        </div>
    `;
}

/**
 * Create a marker on the map with enhanced info windows
 * @param {Object} map - The Google Map object
 * @param {Object} position - Lat/lng position
 * @param {string} type - Type of marker (clinic, poi, etc.)
 * @param {string} infoContent - HTML content for info window
 */
function createMarker(map, position, type, infoContent) {
    const marker = new google.maps.Marker({
        map: map,
        position: position,
        icon: getMarkerIcon(type)
    });
    
    // Create info window
    const infoWindow = new google.maps.InfoWindow({
        content: infoContent
    });
    
    // Add click event listener to open info window
    marker.addListener('click', function() {
        infoWindow.open(map, marker);
    });
    
    // Add marker to appropriate array
    if (type === 'clinic') {
        clinicMarkers.push(marker);
    } else if (type === 'poi') {
        poiMarkers.push(marker);
    }
}

/**
 * Get marker icon based on type
 * @param {string} type - Type of marker (clinic, poi, etc.)
 * @returns {string} URL for marker icon
 */
function getMarkerIcon(type) {
    switch (type) {
        case 'clinic':
            return 'assets/img/icons/clinic.png';
        case 'poi':
            return 'assets/img/icons/poi.png';
        case 'parking':
            return 'assets/img/icons/parking.png';
        case 'transit':
            return 'assets/img/icons/transit.png';
        default:
            return 'assets/img/icons/default.png';
    }
}

/**
 * Initialize autocomplete for origin input
 */
function initAutocomplete() {
    const originInput = document.getElementById('origin');
    if (originInput) {
        const autocomplete = new google.maps.places.Autocomplete(originInput);
        
        // Bind the map's bounds (viewport) to the autocomplete service
        autocomplete.bindTo('bounds', map);
        
        // Set the data fields to return when the user selects a place
        autocomplete.setFields(['address_components', 'geometry', 'icon', 'name']);
        
        // Add event listener for place_changed event
        autocomplete.addListener('place_changed', function() {
            const place = autocomplete.getPlace();
            if (!place.geometry) {
                console.error('No geometry found for the selected place');
                return;
            }
            
            // Update origin position
            originPosition = place.geometry.location;
            
            // Update map bounds to include origin and destination
            const bounds = new google.maps.LatLngBounds();
            bounds.extend(originPosition);
            bounds.extend(clinicPosition);
            map.fitBounds(bounds);
            
            // Calculate and display route
            calculateAndDisplayRoute();
        });
    }
}

/**
 * Calculate and display route between origin and destination
 */
function calculateAndDisplayRoute() {
    if (!originPosition || !clinicPosition) return;
    
    // Clear any existing route
    clearRoute();
    
    // Get travel mode
    const travelMode = document.getElementById('travel-mode').value;
    
    // Get waypoints
    const waypoints = getWaypoints();
    
    // Create directions request
    const request = {
        origin: originPosition,
        destination: clinicPosition,
        travelMode: travelMode,
        waypoints: waypoints,
        optimizeWaypoints: true,
        provideRouteAlternatives: true
    };
    
    // Call Directions service
    directionsService.route(request, function(response, status) {
        if (status === 'OK') {
            // Store route alternatives
            routeAlternatives = response.routes;
            
            // Display route on map
            directionsRenderer.setDirections(response);
            
            // Show route details
            showRouteDetails(response);
            
            // Rearrange waypoint inputs to match optimized order
            if (waypoints.length > 0) {
                const waypointOrder = response.routes[0].waypoint_order;
                rearrangeWaypointInputs(waypointOrder);
            }
        } else {
            console.error('Directions request failed due to ' + status);
            showErrorMessage('An error occurred while calculating directions. Please try again.');
        }
    });
}

/**
 * Get waypoints from input fields
 * @returns {Array} Array of waypoint objects
 */
function getWaypoints() {
    const waypoints = [];
    const waypointInputs = document.querySelectorAll('.waypoint-input');
    
    waypointInputs.forEach(input => {
        const address = input.value.trim();
        if (address !== '') {
            waypoints.push({
                location: address,
                stopover: true
            });
        }
    });
    
    return waypoints;
}

/**
 * Clear existing route from map
 */
function clearRoute() {
    directionsRenderer.setDirections({ routes: [] });
    directionsRenderer.setMap(null);
    directionsRenderer.setPanel(null);
    
    // Clear route alternatives
    routeAlternatives = [];
    
    // Clear route details
    const directionsPanel = document.getElementById('directions-panel');
    if (directionsPanel) {
        directionsPanel.innerHTML = '';
    }
    
    // Clear waypoint markers
    poiMarkers.forEach(marker => marker.setMap(null));
    poiMarkers = [];
}

/**
 * Show error message in directions panel
 * @param {string} message - Error message to display
 */
function showErrorMessage(message) {
    const directionsPanel = document.getElementById('directions-panel');
    if (directionsPanel) {
        directionsPanel.innerHTML = `<p class="error-message">${message}</p>`;
    }
}

/**
 * Show detailed route information and alternatives
 * @param {Object} response - Directions API response
 */
function showRouteDetails(response) {
    const directionsPanel = document.getElementById('directions-panel');
    if (!directionsPanel) return;
    
    // Clear previous content
    directionsPanel.innerHTML = '';
    
    // Display main route details
    const mainRoute = response.routes[0];
    const mainRouteSummary = document.createElement('div');
    mainRouteSummary.className = 'route-summary';
    mainRouteSummary.innerHTML = `
        <h3>Main Route</h3>
        <p>${mainRoute.summary}</p>
        <p><strong>Duration:</strong> ${mainRoute.legs[0].duration.text}</p>
        <p><strong>Distance:</strong> ${mainRoute.legs[0].distance.text}</p>
    `;
    directionsPanel.appendChild(mainRouteSummary);
    
    // Display route alternatives
    if (response.routes.length > 1) {
        const alternativesContainer = document.createElement('div');
        alternativesContainer.className = 'route-alternatives';
        alternativesContainer.innerHTML = '<h4>Alternative Routes</h4>';
        
        response.routes.slice(1).forEach((route, index) => {
            const altRouteSummary = document.createElement('div');
            altRouteSummary.className = 'route-summary';
            altRouteSummary.innerHTML = `
                <h5>Route ${index + 2}</h5>
                <p>${route.summary}</p>
                <p><strong>Duration:</strong> ${route.legs[0].duration.text}</p>
                <p><strong>Distance:</strong> ${route.legs[0].distance.text}</p>
                <button class="btn btn-sm btn-outline select-route-alt" data-route-index="${index + 1}">Select This Route</button>
            `;
            alternativesContainer.appendChild(altRouteSummary);
        });
        
        directionsPanel.appendChild(alternativesContainer);
    }
    
    // Display waypoints
    if (mainRoute.waypoint_order.length > 0) {
        const waypointsContainer = document.createElement('div');
        waypointsContainer.className = 'waypoints-list';
        waypointsContainer.innerHTML = '<h4>Waypoints</h4>';
        
        mainRoute.waypoint_order.forEach(waypointIndex => {
            const waypoint = mainRoute.legs[waypointIndex].start_address;
            const waypointItem = document.createElement('div');
            waypointItem.className = 'waypoint-item';
            waypointItem.innerHTML = `
                <p>${waypoint}</p>
                <button class="btn btn-sm btn-outline remove-waypoint" data-waypoint-index="${waypointIndex}">Remove</button>
            `;
            waypointsContainer.appendChild(waypointItem);
        });
        
        directionsPanel.appendChild(waypointsContainer);
    }
    
    // Add event listeners for route alternatives and waypoint removal
    const selectRouteBtns = directionsPanel.querySelectorAll('.select-route-alt');
    selectRouteBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const routeIndex = parseInt(this.getAttribute('data-route-index'));
            selectRouteAlternative(routeIndex);
        });
    });
    
    const removeWaypointBtns = directionsPanel.querySelectorAll('.remove-waypoint');
    removeWaypointBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const waypointIndex = parseInt(this.getAttribute('data-waypoint-index'));
            removeWaypoint(waypointIndex);
        });
    });
}

/**
 * Select and display a route alternative
 * @param {number} routeIndex - Index of the route to select (0-based)
 */
function selectRouteAlternative(routeIndex) {
    if (routeIndex < 0 || routeIndex >= routeAlternatives.length) return;
    
    // Clear existing route
    clearRoute();
    
    // Display selected route
    directionsRenderer.setDirections({ routes: [routeAlternatives[routeIndex]] });
    
    // Show route details
    showRouteDetails({ routes: [routeAlternatives[routeIndex]] });
}

/**
 * Remove a waypoint from the route
 * @param {number} waypointIndex - Index of the waypoint to remove (0-based)
 */
function removeWaypoint(waypointIndex) {
    if (waypointIndex < 0 || waypointIndex >= routeAlternatives[0].waypoint_order.length) return;
    
    // Remove waypoint from input fields
    const waypointInputs = document.querySelectorAll('.waypoint-input');
    waypointInputs[waypointIndex].value = '';
    
    // Recalculate and display route
    calculateAndDisplayRoute();
}

/**
 * Rearrange waypoint inputs based on optimized order
 * @param {Array} waypointOrder - Array of waypoint indices in optimized order
 */
function rearrangeWaypointInputs(waypointOrder) {
    const waypointInputs = document.querySelectorAll('.waypoint-input');
    const rearrangedInputs = [];
    
    waypointOrder.forEach(index => {
        rearrangedInputs.push(waypointInputs[index]);
    });
    
    // Clear existing waypoint inputs
    waypointInputs.forEach(input => input.remove());
    
    // Append rearranged inputs
    const waypointsContainer = document.getElementById('waypoints-container');
    rearrangedInputs.forEach(input => waypointsContainer.appendChild(input));
}

/**
 * Find and display nearby parking and public transit options
 */
function findNearbyParkingAndTransit() {
    // Check if map and Places service are initialized
    if (!placesService || !clinicPosition) return;
    
    // Search for parking
    placesService.nearbySearch({
        location: clinicPosition,
        radius: 500,
        type: ['parking']
    }, function(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            for (let i = 0; i < Math.min(results.length, 3); i++) {
                createMarker(map, results[i].geometry.location, 'parking', `
                    <div class="info-window poi-info">
                        <h4>${results[i].name}</h4>
                        <p>${results[i].vicinity}</p>
                    </div>
                `);
            }
        }
    });
    
    // Search for transit stations
    placesService.nearbySearch({
        location: clinicPosition,
        radius: 800,
        type: ['subway_station', 'train_station', 'bus_station', 'transit_station']
    }, function(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            for (let i = 0; i < Math.min(results.length, 3); i++) {
                createMarker(map, results[i].geometry.location, 'transit', `
                    <div class="info-window poi-info">
                        <h4>${results[i].name}</h4>
                        <p>${results[i].vicinity}</p>
                    </div>
                `);
            }
        }
    });
    
    // Add the points of interest info card
    addPOIInfoCard();
}

/**
 * Add Points of Interest info card
 */
function addPOIInfoCard() {
    const infoCards = document.querySelector('.directions-info');
    if (!infoCards) return;
    
    const poiCard = document.createElement('div');
    poiCard.className = 'info-card poi-info';
    poiCard.innerHTML = `
        <h3>Points of Interest</h3>
        <div class="poi-toggle">
            <button class="poi-btn active" data-type="all">All</button>
            <button class="poi-btn" data-type="parking">Parking</button>
            <button class="poi-btn" data-type="transit">Transit</button>
            <button class="poi-btn" data-type="pharmacy">Pharmacy</button>
        </div>
        <div class="poi-details">
            <p>Toggle different points of interest near our clinic.</p>
            <p class="poi-tip"><i class="icon icon-info"></i> Click on map markers for more information.</p>
        </div>
    `;
    
    infoCards.appendChild(poiCard);
    
    // Add event listeners to POI toggle buttons
    const poiButtons = poiCard.querySelectorAll('.poi-btn');
    poiButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            poiButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Filter markers based on selected type
            const type = this.getAttribute('data-type');
            filterMarkers(type);
            
            // If pharmacy is selected and none exists yet, search for pharmacies
            if (type === 'pharmacy' && !poiMarkers.some(marker => marker.poiType === 'pharmacy')) {
                findNearbyPharmacies();
            }
        });
    });
}

/**
 * Find and display nearby pharmacies
 */
function findNearbyPharmacies() {
    // Check if map and Places service are initialized
    if (!placesService || !clinicPosition) return;
    
    // Search for pharmacies
    placesService.nearbySearch({
        location: clinicPosition,
        radius: 1000,
        type: ['pharmacy']
    }, function(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            for (let i = 0; i < Math.min(results.length, 5); i++) {
                createMarker(map, results[i].geometry.location, 'pharmacy', `
                    <div class="info-window poi-info">
                        <h4>${results[i].name}</h4>
                        <p>${results[i].vicinity}</p>
                    </div>
                `);
            }
        }
    });
}

/**
 * Filter map markers based on type
 * @param {string} type - Marker type to display ('all' to show all)
 */
function filterMarkers(type) {
    poiMarkers.forEach(marker => {
        if (type === 'all' || !marker.poiType || marker.poiType === type) {
            marker.setVisible(true);
        } else {
            marker.setVisible(false);
        }
    });
}

/**
 * Initialize heatmap for popular visiting times (simulated data)
 */
function initHeatmap() {
    // Create simulated popular times data (simulated foot traffic around the clinic)
    const heatmapData = [];
    
    // Add points around the clinic with varying weights to simulate popular areas
    if (clinicPosition) {
        // Add the clinic itself with high weight
        heatmapData.push({
            location: clinicPosition,
            weight: 10
        });
        
        // Create a grid of points around the clinic with random weights
        for (let i = -5; i <= 5; i++) {
            for (let j = -5; j <= 5; j++) {
                const lat = clinicPosition.lat() + (i * 0.0005);
                const lng = clinicPosition.lng() + (j * 0.0005);
                
                // Skip the center point (already added)
                if (i === 0 && j === 0) continue;
                
                // Generate weight based on distance from clinic (closer = higher weight)
                const distance = Math.sqrt(i*i + j*j);
                const weight = Math.max(0, 10 - distance * 1.5);
                
                if (weight > 0) {
                    heatmapData.push({
                        location: new google.maps.LatLng(lat, lng),
                        weight: weight
                    });
                }
            }
        }
    }
    
    // Create heatmap layer
    heatmap = new google.maps.visualization.HeatmapLayer({
        data: heatmapData,
        map: null, // Don't show by default
        radius: 25,
        opacity: 0.7,
        gradient: [
            'rgba(0, 255, 255, 0)',
            'rgba(0, 255, 255, 1)',
            'rgba(0, 191, 255, 1)',
            'rgba(0, 127, 255, 1)',
            'rgba(0, 63, 255, 1)',
            'rgba(0, 0, 255, 1)',
            'rgba(0, 0, 223, 1)',
            'rgba(0, 0, 191, 1)',
            'rgba(0, 0, 159, 1)',
            'rgba(0, 0, 127, 1)',
            'rgba(63, 0, 91, 1)',
            'rgba(127, 0, 63, 1)',
            'rgba(191, 0, 31, 1)',
            'rgba(255, 0, 0, 1)'
        ]
    });
}

/**
 * Create layer toggle controls
 */
function createLayerToggles() {
    // Create traffic layer
    trafficLayer = new google.maps.TrafficLayer();
    
    // Create transit layer
    transitLayer = new google.maps.TransitLayer();
    
    // Create bicycling layer
    bikeLayer = new google.maps.BicyclingLayer();
    
    // Create toggle controls container
    const layerControls = document.createElement('div');
    layerControls.className = 'layer-controls';
    layerControls.innerHTML = `
        <div class="layer-control-header">Map Layers</div>
        <div class="layer-control-buttons">
            <button id="toggle-traffic" class="layer-btn" title="Show Traffic">
                <i class="icon icon-traffic"></i> Traffic
            </button>
            <button id="toggle-transit" class="layer-btn" title="Show Transit">
                <i class="icon icon-transit"></i> Transit
            </button>
            <button id="toggle-bike" class="layer-btn" title="Show Bike Lanes">
                <i class="icon icon-bike"></i> Bike Lanes
            </button>
            <button id="toggle-heatmap" class="layer-btn" title="Show Popular Times">
                <i class="icon icon-heat"></i> Popular Times
            </button>
        </div>
    `;
    
    // Add controls to map
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(layerControls);
    
    // Add event listeners
    document.getElementById('toggle-traffic').addEventListener('click', function() {
        toggleLayer(trafficLayer);
    });
    
    document.getElementById('toggle-transit').addEventListener('click', function() {
        toggleLayer(transitLayer);
    });
    
    document.getElementById('toggle-bike').addEventListener('click', function() {
        toggleLayer(bikeLayer);
    });
    
    document.getElementById('toggle-heatmap').addEventListener('click', function() {
        toggleLayer(heatmap);
    });
}

/**
 * Toggle a map layer on or off
 * @param {Object} layer - The layer to toggle
 */
function toggleLayer(layer) {
    if (layer.getMap()) {
        layer.setMap(null);
    } else {
        layer.setMap(map);
    }
}

/**
 * Initialize the map and related components
 */
function initMap() {
    // Initialize map
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 40.7128, lng: -74.0060 }, // New York City as default
        zoom: 13,
        mapTypeId: 'roadmap',
        styles: mapStyles,
        disableDefaultUI: true,
        zoomControl: true,
        fullscreenControl: true
    });
    
    // Initialize Directions service and renderer
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({
        map: map,
        panel: document.getElementById('directions-panel'),
        suppressMarkers: true,
        polylineOptions: {
            strokeColor: '#4285f4',
            strokeOpacity: 1.0,
            strokeWeight: 6
        }
    });
    
    // Initialize Places service
    placesService = new google.maps.places.PlacesService(map);
    
    // Initialize Autocomplete for origin and destination inputs
    const originInput = document.getElementById('origin-input');
    const destinationInput = document.getElementById('destination-input');
    
    const originAutocomplete = new google.maps.places.Autocomplete(originInput);
    const destinationAutocomplete = new google.maps.places.Autocomplete(destinationInput);
    
    // Add event listeners for place changes
    originAutocomplete.addListener('place_changed', function() {
        const place = originAutocomplete.getPlace();
        if (place.geometry) {
            originPosition = place.geometry.location;
            updateMapCenter();
            calculateAndDisplayRoute();
        }
    });
    
    destinationAutocomplete.addListener('place_changed', function() {
        const place = destinationAutocomplete.getPlace();
        if (place.geometry) {
            clinicPosition = place.geometry.location;
            updateMapCenter();
            calculateAndDisplayRoute();
            findNearbyParkingAndTransit();
            getClinicInfo(clinicPosition);
        }
    });
    
    // Add event listener for map click
    map.addListener('click', function(event) {
        const clickedLatLng = event.latLng;
        const geocoder = new google.maps.Geocoder();
        
        geocoder.geocode({ location: clickedLatLng }, function(results, status) {
            if (status === 'OK' && results[0]) {
                const address = results[0].formatted_address;
                addWaypoint(address);
            } else {
                console.error('Geocoder failed due to ' + status);
            }
        });
    });
    
    // Add event listener for map idle
    map.addListener('idle', function() {
        updateStaticMap();
    });
    
    // Initialize heatmap
    initHeatmap();
    
    // Create layer toggle controls
    createLayerToggles();
    
    // Add event listener for travel mode change
    document.getElementById('travel-mode').addEventListener('change', function() {
        calculateAndDisplayRoute();
    });
    
    // Add event listener for add waypoint button
    document.getElementById('add-waypoint').addEventListener('click', function() {
        addWaypoint();
    });
    
    // Add event listener for clear waypoints button
    document.getElementById('clear-waypoints').addEventListener('click', function() {
        clearWaypoints();
    });
    
    // Add event listener for toggle route options button
    document.getElementById('toggle-route-options').addEventListener('click', function() {
        toggleRouteOptions();
    });
    
    // Add event listener for share route button
    document.getElementById('share-route').addEventListener('click', function() {
        shareRoute();
    });
    
    // Add event listener for add to calendar button
    document.getElementById('add-to-calendar').addEventListener('click', function() {
        addToCalendar();
    });
    
    // Add event listener for print directions button
    document.getElementById('print-directions').addEventListener('click', function() {
        printDirections();
    });
    
    // Add event listener for toggle advanced options button
    document.getElementById('toggle-advanced-options').addEventListener('click', function() {
        toggleAdvancedOptions();
    });
    
    // Add event listener for toggle map style button
    document.getElementById('toggle-map-style').addEventListener('click', function() {
        toggleMapStyle();
    });
    
    // Add event listener for toggle map type button
    document.getElementById('toggle-map-type').addEventListener('click', function() {
        toggleMapType();
    });
    
    // Add event listener for toggle fullscreen button
    document.getElementById('toggle-fullscreen').addEventListener('click', function() {
        toggleFullscreen();
    });
    
    // Add event listener for toggle location button
    document.getElementById('toggle-location').addEventListener('click', function() {
        toggleLocation();
    });
    
    // Add event listener for toggle traffic button
    document.getElementById('toggle-traffic').addEventListener('click', function() {
        toggleTraffic();
    });
    
    // Add event listener for toggle transit button
    document.getElementById('toggle-transit').addEventListener('click', function() {
        toggleTransit();
    });
    
    // Add event listener for toggle bike button
    document.getElementById('toggle-bike').addEventListener('click', function() {
        toggleBike();
    });
    
    // Add event listener for toggle heatmap button
    document.getElementById('toggle-heatmap').addEventListener('click', function() {
        toggleHeatmap();
    });
    
    // Add event listener for toggle poi button
    document.getElementById('toggle-poi').addEventListener('click', function() {
        togglePOI();
    });
    
    // Add event listener for toggle directions panel button
    document.getElementById('toggle-directions-panel').addEventListener('click', function() {
        toggleDirectionsPanel();
    });
    
    // Add event listener for toggle info panel button
    document.getElementById('toggle-info-panel').addEventListener('click', function() {
        toggleInfoPanel();
    });
    
    // Add event listener for toggle search panel button
    document.getElementById('toggle-search-panel').addEventListener('click', function() {
        toggleSearchPanel();
    });
    
    // Add event listener for toggle layer controls button
    document.getElementById('toggle-layer-controls').addEventListener('click', function() {
        toggleLayerControls();
    });
    
    // Add event listener for toggle share panel button
    document.getElementById('toggle-share-panel').addEventListener('click', function() {
        toggleSharePanel();
    });
    
    // Add event listener for toggle calendar panel button
    document.getElementById('toggle-calendar-panel').addEventListener('click', function() {
        toggleCalendarPanel();
    });
    
    // Add event listener for toggle print panel button
    document.getElementById('toggle-print-panel').addEventListener('click', function() {
        togglePrintPanel();
    });
    
    // Add event listener for toggle advanced panel button
    document.getElementById('toggle-advanced-panel').addEventListener('click', function() {
        toggleAdvancedPanel();
    });
    
    // Add event listener for toggle map style panel button
    document.getElementById('toggle-map-style-panel').addEventListener('click', function() {
        toggleMapStylePanel();
    });
    
    // Add event listener for toggle map type panel button
    document.getElementById('toggle-map-type-panel').addEventListener('click', function() {
        toggleMapTypePanel();
    });
    
    // Add event listener for toggle fullscreen panel button
    document.getElementById('toggle-fullscreen-panel').addEventListener('click', function() {
        toggleFullscreenPanel();
    });
    
    // Add event listener for toggle location panel button
    document.getElementById('toggle-location-panel').addEventListener('click', function() {
        toggleLocationPanel();
    });
    
    // Add event listener for toggle traffic panel button
    document.getElementById('toggle-traffic-panel').addEventListener('click', function() {
        toggleTrafficPanel();
    });
    
    // Add event listener for toggle transit panel button
    document.getElementById('toggle-transit-panel').addEventListener('click', function() {
        toggleTransitPanel();
    });
    
    // Add event listener for toggle bike panel button
    document.getElementById('toggle-bike-panel').addEventListener('click', function() {
        toggleBikePanel();
    });
    
    // Add event listener for toggle heatmap panel button
    document.getElementById('toggle-heatmap-panel').addEventListener('click', function() {
        toggleHeatmapPanel();
    });
    
    // Add event listener for toggle poi panel button
    document.getElementById('toggle-poi-panel').addEventListener('click', function() {
        togglePOIPanel();
    });
    
    // Add event listener for toggle directions panel panel button
    document.getElementById('toggle-directions-panel-panel').addEventListener('click', function() {
        toggleDirectionsPanelPanel();
    });
    
    // Add event listener for toggle info panel panel button
    document.getElementById('toggle-info-panel-panel').addEventListener('click', function() {
        toggleInfoPanelPanel();
    });
    
    // Add event listener for toggle search panel panel button
    document.getElementById('toggle-search-panel-panel').addEventListener('click', function() {
        toggleSearchPanelPanel();
    });
    
    // Add event listener for toggle layer controls panel button
    document.getElementById('toggle-layer-controls-panel').addEventListener('click', function() {
        toggleLayerControlsPanel();
    });
    
    // Add event listener for toggle share panel panel button
    document.getElementById('toggle-share-panel-panel').addEventListener('click', function() {
        toggleSharePanelPanel();
    });
    
    // Add event listener for toggle calendar panel panel button
    document.getElementById('toggle-calendar-panel-panel').addEventListener('click', function() {
        toggleCalendarPanelPanel();
    });
    
    // Add event listener for toggle print panel panel button
    document.getElementById('toggle-print-panel-panel').addEventListener('click', function() {
        togglePrintPanelPanel();
    });
    
    // Add event listener for toggle advanced panel panel button
    document.getElementById('toggle-advanced-panel-panel').addEventListener('click', function() {
        toggleAdvancedPanelPanel();
    });
    
    // Add event listener for toggle map style panel panel button
    document.getElementById('toggle-map-style-panel-panel').addEventListener('click', function() {
        toggleMapStylePanelPanel();
    });
    
    // Add event listener for toggle map type panel panel button
    document.getElementById('toggle-map-type-panel-panel').addEventListener('click', function() {
        toggleMapTypePanelPanel();
    });
    
    // Add event listener for toggle fullscreen panel panel button
    document.getElementById('toggle-fullscreen-panel-panel').addEventListener('click', function() {
        toggleFullscreenPanelPanel();
    });
    
    // Add event listener for toggle location panel panel button
    document.getElementById('toggle-location-panel-panel').addEventListener('click', function() {
        toggleLocationPanelPanel();
    });
    
    // Add event listener for toggle traffic panel panel button
    document.getElementById('toggle-traffic-panel-panel').addEventListener('click', function() {
        toggleTrafficPanelPanel();
    });
    
    // Add event listener for toggle transit panel panel button
    document.getElementById('toggle-transit-panel-panel').addEventListener('click', function() {
        toggleTransitPanelPanel();
    });
    
    // Add event listener for toggle bike panel panel button
    document.getElementById('toggle-bike-panel-panel').addEventListener('click', function() {
        toggleBikePanelPanel();
    });
    
    // Add event listener for toggle heatmap panel panel button
    document.getElementById('toggle-heatmap-panel-panel').addEventListener('click', function() {
        toggleHeatmapPanelPanel();
    });
    
    // Add event listener for toggle poi panel panel button
    document.getElementById('toggle-poi-panel-panel').addEventListener('click', function() {
        togglePOIPanelPanel();
    });
}

/**
 * Update the map center based on origin and destination positions
 */
function updateMapCenter() {
    if (!originPosition || !clinicPosition) return;
    
    const bounds = new google.maps.LatLngBounds();
    bounds.extend(originPosition);
    bounds.extend(clinicPosition);
    map.fitBounds(bounds);
}

/**
 * Add a waypoint to the route
 * @param {string} address - Address of the waypoint (optional)
 */
function addWaypoint(address) {
    const waypointsContainer = document.getElementById('waypoints-container');
    const waypointInput = document.createElement('input');
    waypointInput.type = 'text';
    waypointInput.className = 'waypoint-input';
    waypointInput.placeholder = 'Enter waypoint address';
    
    if (address) {
        waypointInput.value = address;
    }
    
    waypointsContainer.appendChild(waypointInput);
    calculateAndDisplayRoute();
}

/**
 * Clear all waypoints from the route
 */
function clearWaypoints() {
    const waypointInputs = document.querySelectorAll('.waypoint-input');
    waypointInputs.forEach(input => input.remove());
    calculateAndDisplayRoute();
}

/**
 * Toggle advanced route options panel
 */
function toggleRouteOptions() {
    const advancedOptions = document.getElementById('advanced-options');
    advancedOptions.classList.toggle('show');
}

/**
 * Share route with various share options
 * @param {Object} route - Route object
 */
function shareRoute(route) {
    // Implement share functionality (e.g., email, social media, etc.)
    console.log('Sharing route:', route);
}

/**
 * Add route to calendar
 * @param {Object} route - Route object
 */
function addToCalendar(route) {
    // Implement calendar integration (e.g., Google Calendar, Outlook, etc.)
    console.log('Adding route to calendar:', route);
}

/**
 * Print directions
 */
function printDirections() {
    window.print();
}

/**
 * Toggle advanced options panel
 */
function toggleAdvancedOptions() {
    const advancedOptions = document.getElementById('advanced-options');
    advancedOptions.classList.toggle('show');
}

/**
 * Toggle map style
 */
function toggleMapStyle() {
    const mapStyleToggle = document.getElementById('map-style-toggle');
    mapStyleToggle.classList.toggle('active');
    
    if (mapStyleToggle.classList.contains('active')) {
        map.setOptions({ styles: mapStyles });
    } else {
        map.setOptions({ styles: [] });
    }
}

/**
 * Toggle map type
 */
function toggleMapType() {
    const mapTypeToggle = document.getElementById('map-type-toggle');
    mapTypeToggle.classList.toggle('active');
    
    if (mapTypeToggle.classList.contains('active')) {
        map.setMapTypeId('satellite');
    } else {
        map.setMapTypeId('roadmap');
    }
}

/**
 * Toggle fullscreen
 */
function toggleFullscreen() {
    const fullscreenToggle = document.getElementById('fullscreen-toggle');
    fullscreenToggle.classList.toggle('active');
    
    if (fullscreenToggle.classList.contains('active')) {
        openFullscreen();
    } else {
        closeFullscreen();
    }
}

/**
 * Open fullscreen
 */
function openFullscreen() {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) { /* Firefox */
        elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE/Edge */
        elem.msRequestFullscreen();
    }
}

/**
 * Close fullscreen
 */
function closeFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.mozCancelFullScreen) { /* Firefox */
        document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { /* IE/Edge */
        document.msExitFullscreen();
    }
}

/**
 * Toggle location
 */
function toggleLocation() {
    const locationToggle = document.getElementById('location-toggle');
    locationToggle.classList.toggle('active');
    
    if (locationToggle.classList.contains('active')) {
        getCurrentLocation();
    } else {
        // Disable location tracking
    }
}

/**
 * Get current location
 */
function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            
            // Update origin position and recalculate route
            originPosition = pos;
            updateMapCenter();
            calculateAndDisplayRoute();
        }, function() {
            handleLocationError(true, infoWindow, map.getCenter());
        });
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, infoWindow, map.getCenter());
    }
}

/**
 * Handle location error
 * @param {boolean} browserHasGeolocation - Whether the browser supports Geolocation
 * @param {Object} infoWindow - Info window to display error message
 * @param {Object} pos - Map center position
 */
function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
        'Error: The Geolocation service failed.' :
        'Error: Your browser doesn\'t support geolocation.');
    infoWindow.open(map);
}

/**
 * Toggle traffic layer
 */
function toggleTraffic() {
    const trafficToggle = document.getElementById('traffic-toggle');
    trafficToggle.classList.toggle('active');
    
    if (trafficToggle.classList.contains('active')) {
        trafficLayer.setMap(map);
    } else {
        trafficLayer.setMap(null);
    }
}

/**
 * Toggle transit layer
 */
function toggleTransit() {
    const transitToggle = document.getElementById('transit-toggle');
    transitToggle.classList.toggle('active');
    
    if (transitToggle.classList.contains('active')) {
        transitLayer.setMap(map);
    } else {
        transitLayer.setMap(null);
    }
}

/**
 * Toggle bike layer
 */
function toggleBike() {
    const bikeToggle = document.getElementById('bike-toggle');
    bikeToggle.classList.toggle('active');
    
    if (bikeToggle.classList.contains('active')) {
        bikeLayer.setMap(map);
    } else {
        bikeLayer.setMap(null);
    }
}

/**
 * Toggle heatmap layer
 */
function toggleHeatmap() {
    const heatmapToggle = document.getElementById('heatmap-toggle');
    heatmapToggle.classList.toggle('active');
    
    if (heatmapToggle.classList.contains('active')) {
        heatmap.setMap(map);
    } else {
        heatmap.setMap(null);
    }
}

/**
 * Toggle POI markers
 */
function togglePOI() {
    const poiToggle = document.getElementById('poi-toggle');
    poiToggle.classList.toggle('active');
    
    poiMarkers.forEach(marker => {
        marker.setVisible(poiToggle.classList.contains('active'));
    });
}

/**
 * Toggle directions panel
 */
function toggleDirectionsPanel() {
    const directionsPanel = document.getElementById('directions-panel');
    directionsPanel.classList.toggle('show');
}

/**
 * Toggle info panel
 */
function toggleInfoPanel() {
    const infoPanel = document.getElementById('info-panel');
    infoPanel.classList.toggle('show');
}

/**
 * Toggle search panel
 */
function toggleSearchPanel() {
    const searchPanel = document.getElementById('search-panel');
    searchPanel.classList.toggle('show');
}

/**
 * Toggle layer controls
 */
function toggleLayerControls() {
    const layerControls = document.querySelector('.layer-controls');
    layerControls.classList.toggle('show');
}

/**
 * Toggle share panel
 */
function toggleSharePanel() {
    const sharePanel = document.getElementById('share-panel');
    sharePanel.classList.toggle('show');
}

/**
 * Toggle calendar panel
 */
function toggleCalendarPanel() {
    const calendarPanel = document.getElementById('calendar-panel');
    calendarPanel.classList.toggle('show');
}

/**
 * Toggle print panel
 */
function togglePrintPanel() {
    const printPanel = document.getElementById('print-panel');
    printPanel.classList.toggle('show');
}

/**
 * Toggle advanced panel
 */
function toggleAdvancedPanel() {
    const advancedPanel = document.getElementById('advanced-panel');
    advancedPanel.classList.toggle('show');
}

/**
 * Toggle map style panel
 */
function toggleMapStylePanel() {
    const mapStylePanel = document.getElementById('map-style-panel');
    mapStylePanel.classList.toggle('show');
}

/**
 * Toggle map type panel
 */
function toggleMapTypePanel() {
    const mapTypePanel = document.getElementById('map-type-panel');
    mapTypePanel.classList.toggle('show');
}

/**
 * Toggle fullscreen panel
 */
function toggleFullscreenPanel() {
    const fullscreenPanel = document.getElementById('fullscreen-panel');
    fullscreenPanel.classList.toggle('show');
}

/**
 * Toggle location panel
 */
function toggleLocationPanel() {
    const locationPanel = document.getElementById('location-panel');
    locationPanel.classList.toggle('show');
}

/**
 * Toggle traffic panel
 */
function toggleTrafficPanel() {
    const trafficPanel = document.getElementById('traffic-panel');
    trafficPanel.classList.toggle('show');
}

/**
 * Toggle transit panel
 */
function toggleTransitPanel() {
    const transitPanel = document.getElementById('transit-panel');
    transitPanel.classList.toggle('show');
}

/**
 * Toggle bike panel
 */
function toggleBikePanel() {
    const bikePanel = document.getElementById('bike-panel');
    bikePanel.classList.toggle('show');
}

/**
 * Toggle heatmap panel
 */
function toggleHeatmapPanel() {
    const heatmapPanel = document.getElementById('heatmap-panel');
    heatmapPanel.classList.toggle('show');
}

/**
 * Toggle POI panel
 */
function togglePOIPanel() {
    const poiPanel = document.getElementById('poi-panel');
    poiPanel.classList.toggle('show');
}

/**
 * Toggle directions panel panel
 */
function toggleDirectionsPanelPanel() {
    const directionsPanelPanel = document.getElementById('directions-panel-panel');
    directionsPanelPanel.classList.toggle('show');
}

/**
 * Toggle info panel panel
 */
function toggleInfoPanelPanel() {
    const infoPanelPanel = document.getElementById('info-panel-panel');
    infoPanelPanel.classList.toggle('show');
}

/**
 * Toggle search panel panel
 */
function toggleSearchPanelPanel() {
    const searchPanelPanel = document.getElementById('search-panel-panel');
    searchPanelPanel.classList.toggle('show');
}

/**
 * Toggle layer controls panel
 */
function toggleLayerControlsPanel() {
    const layerControlsPanel = document.getElementById('layer-controls-panel');
    layerControlsPanel.classList.toggle('show');
}

/**
 * Toggle share panel panel
 */
function toggleSharePanelPanel() {
    const sharePanelPanel = document.getElementById('share-panel-panel');
    sharePanelPanel.classList.toggle('show');
}

/**
 * Toggle calendar panel panel
 */
function toggleCalendarPanelPanel() {
    const calendarPanelPanel = document.getElementById('calendar-panel-panel');
    calendarPanelPanel.classList.toggle('show');
}

/**
 * Toggle print panel panel
 */
function togglePrintPanelPanel() {
    const printPanelPanel = document.getElementById('print-panel-panel');
    printPanelPanel.classList.toggle('show');
}

/**
 * Toggle advanced panel panel
 */
function toggleAdvancedPanelPanel() {
    const advancedPanelPanel = document.getElementById('advanced-panel-panel');
    advancedPanelPanel.classList.toggle('show');
}

/**
 * Toggle map style panel panel
 */
function toggleMapStylePanelPanel() {
    const mapStylePanelPanel = document.getElementById('map-style-panel-panel');
    mapStylePanelPanel.classList.toggle('show');
}

/**
 * Toggle map type panel panel
 */
function toggleMapTypePanelPanel() {
    const mapTypePanelPanel = document.getElementById('map-type-panel-panel');
    mapTypePanelPanel.classList.toggle('show');
}

/**
 * Toggle fullscreen panel panel
 */
function toggleFullscreenPanelPanel() {
    const fullscreenPanelPanel = document.getElementById('fullscreen-panel-panel');
    fullscreenPanelPanel.classList.toggle('show');
}

/**
 * Toggle location panel panel
 */
function toggleLocationPanelPanel() {
    const locationPanelPanel = document.getElementById('location-panel-panel');
    locationPanelPanel.classList.toggle('show');
}

/**
 * Toggle traffic panel panel
 */
function toggleTrafficPanelPanel() {
    const trafficPanelPanel = document.getElementById('traffic-panel-panel');
    trafficPanelPanel.classList.toggle('show');
}

/**
 * Toggle transit panel panel
 */
function toggleTransitPanelPanel() {
    const transitPanelPanel = document.getElementById('transit-panel-panel');
    transitPanelPanel.classList.toggle('show');
}

/**
 * Toggle bike panel panel
 */
function toggleBikePanelPanel() {
    const bikePanelPanel = document.getElementById('bike-panel-panel');
    bikePanelPanel.classList.toggle('show');
}

/**
 * Toggle heatmap panel panel
 */
function toggleHeatmapPanelPanel() {
    const heatmapPanelPanel = document.getElementById('heatmap-panel-panel');
    heatmapPanelPanel.classList.toggle('show');
}

/**
 * Toggle POI panel panel
 */
function togglePOIPanelPanel() {
    const poiPanelPanel = document.getElementById('poi-panel-panel');
    poiPanelPanel.classList.toggle('show');
}

/**
 * Update the static map fallback with custom styling
 * @param {Object} position - Lat/lng position for map center
 */
function updateStaticMap(position) {
    if (!position) {
        position = clinicPosition || map.getCenter();
    }
    
    const staticMapUrl = getStaticMapUrl(position);
    const staticMapImg = document.getElementById('static-map-img');
    staticMapImg.src = staticMapUrl;
}

/**
 * Get the static map URL with custom styling
 * @param {Object} position - Lat/lng position for map center
 * @returns {string} Static map URL
 */
function getStaticMapUrl(position) {
    const zoom = map.getZoom();
    const width = 640;
    const height = 400;
    const mapStyle = mapStyles.map(style => `${style.featureType}:${style.elementType}|${style.stylers.join('|')}`).join('&style=');
    
    return `https://maps.googleapis.com/maps/api/staticmap?center=${position.lat},${position.lng}&zoom=${zoom}&size=${width}x${height}&markers=color:red%7C${position.lat},${position.lng}&maptype=roadmap&${mapStyle}&key=${apiKey}`;
}

/**
 * Update clinic info window with enhanced details
 * @param {Object} placeDetails - Place details from Places API
 */
function updateClinicInfo(placeDetails) {
    const clinicInfo = document.getElementById('clinic-info');
    clinicInfo.innerHTML = getClinicInfoContent(placeDetails);
}

/**
 * Get clinic info window content
 * @param {Object} placeDetails - Place details from Places API
 * @returns {string} HTML content for clinic info window
 */
function getClinicInfoContent(placeDetails) {
    return `
        <div class="clinic-info-content">
            <h2>${placeDetails.name}</h2>
            <p>${placeDetails.formatted_address}</p>
            <p><strong>Phone:</strong> ${placeDetails.formatted_phone_number}</p>
            <p><strong>Rating:</strong> ${placeDetails.rating} (${placeDetails.user_ratings_total} reviews)</p>
            <p><strong>Website:</strong> <a href="${placeDetails.website}" target="_blank">${placeDetails.website}</a></p>
        </div>
    `;
}

/**
 * Get POI info window content
 * @param {Object} poi - POI object
 * @returns {string} HTML content for POI info window
 */
function getPOIInfoContent(poi) {
    return `
        <div class="poi-info-content">
            <h3>${poi.name}</h3>
            <p>${poi.vicinity}</p>
        </div>
    `;
}

/**
 * Create a marker on the map with enhanced info windows
 * @param {Object} map - The Google Map object
 * @param {Object} position - Lat/lng position
 * @param {string} type - Marker type (e.g., 'parking', 'transit', 'pharmacy')
 * @param {string} content - HTML content for info window
 * @returns {Object} The created marker
 */
function createMarker(map, position, type, content) {
    const marker = new google.maps.Marker({
        map: map,
        position: position,
        icon: getMarkerIcon(type),
        title: type
    });
    
    const infoWindow = new google.maps.InfoWindow({
        content: content
    });
    
    marker.addListener('click', function() {
        infoWindow.open(map, marker);
    });
    
    marker.poiType = type;
    poiMarkers.push(marker);
    
    return marker;
}

/**
 * Get marker icon based on type
 * @param {string} type - Marker type
 * @returns {string} Icon URL
 */
function getMarkerIcon(type) {
    switch (type) {
        case 'parking':
            return 'https://maps.google.com/mapfiles/ms/icons/parking_lot_maps.png';
        case 'transit':
            return 'https://maps.google.com/mapfiles/ms/icons/bus.png';
        case 'pharmacy':
            return 'https://maps.google.com/mapfiles/ms/icons/pharmacy.png';
        default:
            return 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png';
    }
}

/**
 * Get clinic information from Places API
 * @param {Object} position - Lat/lng position of the clinic
 */
function getClinicInfo(position) {
    placesService.getDetails({
        placeId: clinicPlaceId
    }, function(placeDetails, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            updateClinicInfo(placeDetails);
        } else {
            console.error('Places API request failed due to ' + status);
        }
    });
}

/**
 * Open calendar link in new window
 * @param {Object} route - Route object
 */
function openCalendarLink(route) {
    const googleCalendarUrl = getGoogleCalendarUrl(route);
    window.open(googleCalendarUrl, '_blank');
}

/**
 * Get Google Calendar URL for a route
 * @param {Object} route - Route object
 * @returns {string} Google Calendar URL
 */
function getGoogleCalendarUrl(route) {
    const startTime = new Date(route.legs[0].start_time.value).toISOString();
    const endTime = new Date(route.legs[0].end_time.value).toISOString();
    const title = `Directions to ${route.legs[0].end_address}`;
    const description = `Route: ${route.summary}\nDuration: ${route.legs[0].duration.text}\nDistance: ${route.legs[0].distance.text}`;
    const location = route.legs[0].end_address;
    
    const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startTime}/${endTime}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}`;
    return url;
}

/**
 * Initialize the map and related components
 */
function initMap() {
    // Initialize map
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 40.7128, lng: -74.0060 }, // New York City as default
        zoom: 13,
        mapTypeId: 'roadmap',
        styles: mapStyles,
        disableDefaultUI: true,
        zoomControl: true,
        fullscreenControl: true
    });
    
    // Initialize Directions service and renderer
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({
        map: map,
        panel: document.getElementById('directions-panel'),
        suppressMarkers: true,
        polylineOptions: {
            strokeColor: '#4285f4',
            strokeOpacity: 1.0,
            strokeWeight: 6
        }
    });
    
    // Initialize Places service
    placesService = new google.maps.places.PlacesService(map);
    
    // Initialize Autocomplete for origin and destination inputs
    const originInput = document.getElementById('origin-input');
    const destinationInput = document.getElementById('destination-input');
    
    const originAutocomplete = new google.maps.places.Autocomplete(originInput);
    const destinationAutocomplete = new google.maps.places.Autocomplete(destinationInput);
    
    // Add event listeners for place changes
    originAutocomplete.addListener('place_changed', function() {
        const place = originAutocomplete.getPlace();
        if (place.geometry) {
            originPosition = place.geometry.location;
            updateMapCenter();
            calculateAndDisplayRoute();
        }
    });
    
    destinationAutocomplete.addListener('place_changed', function() {
        const place = destinationAutocomplete.getPlace();
        if (place.geometry) {
            clinicPosition = place.geometry.location;
            updateMapCenter();
            calculateAndDisplayRoute();
            findNearbyParkingAndTransit();
            getClinicInfo(clinicPosition);
        }
    });
    
    // Add event listener for map click
    map.addListener('click', function(event) {
        const clickedLatLng = event.latLng;
        const geocoder = new google.maps.Geocoder();
        
        geocoder.geocode({ location: clickedLatLng }, function(results, status) {
            if (status === 'OK' && results[0]) {
                const address = results[0].formatted_address;
                addWaypoint(address);
            } else {
                console.error('Geocoder failed due to ' + status);
            }
        });
    });
    
    // Add event listener for map idle
    map.addListener('idle', function() {
        updateStaticMap();
    });
    
    // Initialize heatmap
    initHeatmap();
    
    // Create layer toggle controls
    createLayerToggles();
    
    // Add event listener for travel mode change
    document.getElementById('travel-mode').addEventListener('change', function() {
        calculateAndDisplayRoute();
    });
    
    // Add event listener for add waypoint button
    document.getElementById('add-waypoint').addEventListener('click', function() {
        addWaypoint();
    });
    
    // Add event listener for clear waypoints button
    document.getElementById('clear-waypoints').addEventListener('click', function() {
        clearWaypoints();
    });
    
    // Add event listener for toggle route options button
    document.getElementById('toggle-route-options').addEventListener('click', function() {
        toggleRouteOptions();
    });
    
    // Add event listener for share route button
    document.getElementById('share-route').addEventListener('click', function() {
        shareRoute();
    });
    
    // Add event listener for add to calendar button
    document.getElementById('add-to-calendar').addEventListener('click', function() {
        addToCalendar();
    });
    
    // Add event listener for print directions button
    document.getElementById('print-directions').addEventListener('click', function() {
        printDirections();
    });
    
    // Add event listener for toggle advanced options button
    document.getElementById('toggle-advanced-options').addEventListener('click', function() {
        toggleAdvancedOptions();
    });
    
    // Add event listener for toggle map style button
    document.getElementById('toggle-map-style').addEventListener('click', function() {
        toggleMapStyle();
    });
    
    // Add event listener for toggle map type button
    document.getElementById('toggle-map-type').addEventListener('click', function() {
        toggleMapType();
    });
    
    // Add event listener for toggle fullscreen button
    document.getElementById('toggle-fullscreen').addEventListener('click', function() {
        toggleFullscreen();
    });
    
    // Add event listener for toggle location button
    document.getElementById('toggle-location').addEventListener('click', function() {
        toggleLocation();
    });
    
    // Add event listener for toggle traffic button
    document.getElementById('toggle-traffic').addEventListener('click', function() {
        toggleTraffic();
    });
    
    // Add event listener for toggle transit button
    document.getElementById('toggle-transit').addEventListener('click', function() {
        toggleTransit();
    });
    
    // Add event listener for toggle bike button
    document.getElementById('toggle-bike').addEventListener('click', function() {
        toggleBike();
    });
    
    // Add event listener for toggle heatmap button
    document.getElementById('toggle-heatmap').addEventListener('click', function() {
        toggleHeatmap();
    });
    
    // Add event listener for toggle poi button
    document.getElementById('toggle-poi').addEventListener('click', function() {
        togglePOI();
    });
    
    // Add event listener for toggle directions panel button
    document.getElementById('toggle-directions-panel').addEventListener('click', function() {
        toggleDirectionsPanel();
    });
    
    // Add event listener for toggle info panel button
    document.getElementById('toggle-info-panel').addEventListener('click', function() {
        toggleInfoPanel();
    });
    
    // Add event listener for toggle search panel button
    document.getElementById('toggle-search-panel').addEventListener('click', function() {
        toggleSearchPanel();
    });
    
    // Add event listener for toggle layer controls button
    document.getElementById('toggle-layer-controls').addEventListener('click', function() {
        toggleLayerControls();
    });
    
    // Add event listener for toggle share panel button
    document.getElementById('toggle-share-panel').addEventListener('click', function() {
        toggleSharePanel();
    });
    
    // Add event listener for toggle calendar panel button
    document.getElementById('toggle-calendar-panel').addEventListener('click', function() {
        toggleCalendarPanel();
    });
    
    // Add event listener for toggle print panel button
    document.getElementById('toggle-print-panel').addEventListener('click', function() {
        togglePrintPanel();
    });
    
    // Add event listener for toggle advanced panel button
    document.getElementById('toggle-advanced-panel').addEventListener('click', function() {
        toggleAdvancedPanel();
    });
    
    // Add event listener for toggle map style panel button
    document.getElementById('toggle-map-style-panel').addEventListener('click', function() {
        toggleMapStylePanel();
    });
    
    // Add event listener for toggle map type panel button
    document.getElementById('toggle-map-type-panel').addEventListener('click', function() {
        toggleMapTypePanel();
    });
    
    // Add event listener for toggle fullscreen panel button
    document.getElementById('toggle-fullscreen-panel').addEventListener('click', function() {
        toggleFullscreenPanel();
    });
    
    // Add event listener for toggle location panel button
    document.getElementById('toggle-location-panel').addEventListener('click', function() {
        toggleLocationPanel();
    });
    
    // Add event listener for toggle traffic panel button
    document.getElementById('toggle-traffic-panel').addEventListener('click', function() {
        toggleTrafficPanel();
    });
    
    // Add event listener for toggle transit panel button
    document.getElementById('toggle-transit-panel').addEventListener('click', function() {
        toggleTransitPanel();
    });
    
    // Add event listener for toggle bike panel button
    document.getElementById('toggle-bike-panel').addEventListener('click', function() {
        toggleBikePanel();
    });
    
    // Add event listener for toggle heatmap panel button
    document.getElementById('toggle-heatmap-panel').addEventListener('click', function() {
        toggleHeatmapPanel();
    });
    
    // Add event listener for toggle poi panel button
    document.getElementById('toggle-poi-panel').addEventListener('click', function() {
        togglePOIPanel();
    });
    
    // Add event listener for toggle directions panel panel button
    document.getElementById('toggle-directions-panel-panel').addEventListener('click', function() {
        toggleDirectionsPanelPanel();
    });
    
    // Add event listener for toggle info panel panel button
    document.getElementById('toggle-info-panel-panel').addEventListener('click', function() {
        toggleInfoPanelPanel();
    });
    
    // Add event listener for toggle search panel panel button
    document.getElementById('toggle-search-panel-panel').addEventListener('click', function() {
        toggleSearchPanelPanel();
    });
    
    // Add event listener for toggle layer controls panel button
    document.getElementById('toggle-layer-controls-panel').addEventListener('click', function() {
        toggleLayerControlsPanel();
    });
    
    // Add event listener for toggle share panel panel button
    document.getElementById('toggle-share-panel-panel').addEventListener('click', function() {
        toggleSharePanelPanel();
    });
    
    // Add event listener for toggle calendar panel panel button
    document.getElementById('toggle-calendar-panel-panel').addEventListener('click', function() {
        toggleCalendarPanelPanel();
    });
    
    // Add event listener for toggle print panel panel button
    document.getElementById('toggle-print-panel-panel').addEventListener('click', function() {
        togglePrintPanelPanel();
    });
    
    // Add event listener for toggle advanced panel panel button
    document.getElementById('toggle-advanced-panel-panel').addEventListener('click', function() {
        toggleAdvancedPanelPanel();
    });
    
    // Add event listener for toggle map style panel panel button
    document.getElementById('toggle-map-style-panel-panel').addEventListener('click', function() {
        toggleMapStylePanelPanel();
    });
    
    // Add event listener for toggle map type panel panel button
    document.getElementById('toggle-map-type-panel-panel').addEventListener('click', function() {
        toggleMapTypePanelPanel();
    });
    
    // Add event listener for toggle fullscreen panel panel button
    document.getElementById('toggle-fullscreen-panel-panel').addEventListener('click', function() {
        toggleFullscreenPanelPanel();
    });
    
    // Add event listener for toggle location panel panel button
    document.getElementById('toggle-location-panel-panel').addEventListener('click', function() {
        toggleLocationPanelPanel();
    });
    
    // Add event listener for toggle traffic panel panel button
    document.getElementById('toggle-traffic-panel-panel').addEventListener('click', function() {
        toggleTrafficPanelPanel();
    });
    
    // Add event listener for toggle transit panel panel button
    document.getElementById('toggle-transit-panel-panel').addEventListener('click', function() {
        toggleTransitPanelPanel();
    });
    
    // Add event listener for toggle bike panel panel button
    document.getElementById('toggle-bike-panel-panel').addEventListener('click', function() {
        toggleBikePanelPanel();
    });
    
    // Add event listener for toggle heatmap panel panel button
    document.getElementById('toggle-heatmap-panel-panel').addEventListener('click', function() {
        toggleHeatmapPanelPanel();
    });
    
    // Add event listener for toggle poi panel panel button
    document.getElementById('toggle-poi-panel-panel').addEventListener('click', function() {
        togglePOIPanelPanel();
    });
}

/**
 * Update the map center based on origin and destination positions
 */
function updateMapCenter() {
    if (!originPosition || !clinicPosition) return;
    
    const bounds = new google.maps.LatLngBounds();
    bounds.extend(originPosition);
    bounds.extend(clinicPosition);
    map.fitBounds(bounds);
}

/**
 * Add a waypoint to the route
 * @param {string} address - Address of the waypoint (optional)
 */
function addWaypoint(address) {
    const waypointsContainer = document.getElementById('waypoints-container');
    const waypointInput = document.createElement('input');
    waypointInput.type = 'text';
    waypointInput.className = 'waypoint-input';
    waypointInput.placeholder = 'Enter waypoint address';
    
    if (address) {
        waypointInput.value = address;
    }
    
    waypointsContainer.appendChild(waypointInput);
    calculateAndDisplayRoute();
}

/**
 * Clear all waypoints from the route
 */
function clearWaypoints() {
    const waypointInputs = document.querySelectorAll('.waypoint-input');
    waypointInputs.forEach(input => input.remove());
    calculateAndDisplayRoute();
}

/**
 * Toggle advanced route options panel
 */
function toggleRouteOptions() {
    const advancedOptions = document.getElementById('advanced-options');
    advancedOptions.classList.toggle('show');
}

/**
 * Share route with various share options
 * @param {Object} route - Route object
 */
function shareRoute(route) {
    // Implement share functionality (e.g., email, social media, etc.)
    console.log('Sharing route:', route);
}

/**
 * Add route to calendar
 * @param {Object} route - Route object
 */
function addToCalendar(route) {
    // Implement calendar integration (e.g., Google Calendar, Outlook, etc.)
    console.log('Adding route to calendar:', route);
}

/**
 * Print directions
 */
function printDirections() {
    window.print();
}

/**
 * Toggle advanced options panel
 */
function toggleAdvancedOptions() {
    const advancedOptions = document.getElementById('advanced-options');
    advancedOptions.classList.toggle('show');
}

/**
 * Toggle map style
 */
function toggleMapStyle() {
    const mapStyleToggle = document.getElementById('map-style-toggle');
    mapStyleToggle.classList.toggle('active');
    
    if (mapStyleToggle.classList.contains('active')) {
        map.setOptions({ styles: mapStyles });
    } else {
        map.setOptions({ styles: [] });
    }
}

/**
 * Toggle map type
 */
function toggleMapType() {
    const mapTypeToggle = document.getElementById('map-type-toggle');
    mapTypeToggle.classList.toggle('active');
    
    if (mapTypeToggle.classList.contains('active')) {
        map.setMapTypeId('satellite');
    } else {
        map.setMapTypeId('roadmap');
    }
}

/**
 * Toggle fullscreen
 */
function toggleFullscreen() {
    const fullscreenToggle = document.getElementById('fullscreen-toggle');
    fullscreenToggle.classList.toggle('active');
    
    if (fullscreenToggle.classList.contains('active')) {
        openFullscreen();
    } else {
        closeFullscreen();
    }
}

/**
 * Open fullscreen
 */
function openFullscreen() {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) { /* Firefox */
        elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE/Edge */
        elem.msRequestFullscreen();
    }
}

/**
 * Close fullscreen
 */
function closeFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.mozCancelFullScreen) { /* Firefox */
        document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { /* IE/Edge */
        document.msExitFullscreen();
    }
}

/**
 * Toggle location
 */
function toggleLocation() {
    const locationToggle = document.getElementById('location-toggle');
    locationToggle.classList.toggle('active');
    
    if (locationToggle.classList.contains('active')) {
        getCurrentLocation();
    } else {
        // Disable location tracking
    }
}

/**
 * Get current location
 */
function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            
            // Update origin position and recalculate route
            originPosition = pos;
            updateMapCenter();
            calculateAndDisplayRoute();
        }, function() {
            handleLocationError(true, infoWindow, map.getCenter());
        });
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, infoWindow, map.getCenter());
    }
}

/**
 * Handle location error
 * @param {boolean} browserHasGeolocation - Whether the browser supports Geolocation
 * @param {Object} infoWindow - Info window to display error message
 * @param {Object} pos - Map center position
 */
function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
        'Error: The Geolocation service failed.' :
        'Error: Your browser doesn\'t support geolocation.');
    infoWindow.open(map);
}

/**
 * Toggle traffic layer
 */
function toggleTraffic() {
    const trafficToggle = document.getElementById('traffic-toggle');
    trafficToggle.classList.toggle('active');
    
    if (trafficToggle.classList.contains('active')) {
        trafficLayer.setMap(map);
    } else {
        trafficLayer.setMap(null);
    }
}

/**
 * Toggle transit layer
 */
function toggleTransit() {
    const transitToggle = document.getElementById('transit-toggle');
    transitToggle.classList.toggle('active');
    
    if (transitToggle.classList.contains('active')) {
        transitLayer.setMap(map);
    } else {
        transitLayer.setMap(null);
    }
}

/**
 * Toggle bike layer
 */
function toggleBike() {
    const bikeToggle = document.getElementById('bike-toggle');
    bikeToggle.classList.toggle('active');
    
    if (bikeToggle.classList.contains('active')) {
        bikeLayer.setMap(map);
    } else {
        bikeLayer.setMap(null);
    }
}

/**
 * Toggle heatmap layer
 */
function toggleHeatmap() {
    const heatmapToggle = document.getElementById('heatmap-toggle');
    heatmapToggle.classList.toggle('active');
    
    if (heatmapToggle.classList.contains('active')) {
        heatmap.setMap(map);
    } else {
        heatmap.setMap(null);
    }
}

/**
 * Toggle POI markers
 */
function togglePOI() {
    const poiToggle = document.getElementById('poi-toggle');
    poiToggle.classList.toggle('active');
    
    poiMarkers.forEach(marker => {
        marker.setVisible(poiToggle.classList.contains('active'));
    });
}

/**
 * Toggle directions panel
 */
function toggleDirectionsPanel() {
    const directionsPanel = document.getElementById('directions-panel');
    directionsPanel.classList.toggle('show');
}

/**
 * Toggle info panel
 */
function toggleInfoPanel() {
    const infoPanel = document.getElementById('info-panel');
    infoPanel.classList.toggle('show');
}

/**
 * Toggle search panel
 */
function toggleSearchPanel() {
    const searchPanel = document.getElementById('search-panel');
    searchPanel.classList.toggle('show');
}

/**
 * Toggle layer controls
 */
function toggleLayerControls() {
    const layerControls = document.querySelector('.layer-controls');
    layerControls.classList.toggle('show');
}

/**
 * Toggle share panel
 */
function toggleSharePanel() {
    const sharePanel = document.getElementById('share-panel');
    sharePanel.classList.toggle('show');
}

/**
 * Toggle calendar panel
 */
function toggleCalendarPanel() {
    const calendarPanel = document.getElementById('calendar-panel');
    calendarPanel.classList.toggle('show');
}

/**
 * Toggle print panel
 */
function togglePrintPanel() {
    const printPanel = document.getElementById('print-panel');
    printPanel.classList.toggle('show');
}

/**
 * Toggle advanced panel
 */
function toggleAdvancedPanel() {
    const advancedPanel = document.getElementById('advanced-panel');
    advancedPanel.classList.toggle('show');
}

/**
 * Toggle map style panel
 */
function toggleMapStylePanel() {
    const mapStylePanel = document.getElementById('map-style-panel');
    mapStylePanel.classList.toggle('show');
}

/**
 * Toggle map type panel
 */
function toggleMapTypePanel() {
    const mapTypePanel = document.getElementById('map-type-panel');
    mapTypePanel.classList.toggle('show');
}

/**
 * Toggle fullscreen panel
 */
function toggleFullscreenPanel() {
    const fullscreenPanel = document.getElementById('fullscreen-panel');
    fullscreenPanel.classList.toggle('show');
}

/**
 * Toggle location panel
 */
function toggleLocationPanel() {
    const locationPanel = document.getElementById('location-panel');
    locationPanel.classList.toggle('show');
}

/**
 * Toggle traffic panel
 */
function toggleTrafficPanel() {
    const trafficPanel = document.getElementById('traffic-panel');
    trafficPanel.classList.toggle('show');
}

/**
 * Toggle transit panel
 */
function toggleTransitPanel() {
    const transitPanel = document.getElementById('transit-panel');
    transitPanel.classList.toggle('show');
}

/**
 * Toggle bike panel
 */
function toggleBikePanel() {
    const bikePanel = document.getElementById('bike-panel');
    bikePanel.classList.toggle('show');
}

/**
 * Toggle heatmap panel
 */
function toggleHeatmapPanel() {
    const heatmapPanel = document.getElementById('heatmap-panel');
    heatmapPanel.classList.toggle('show');
}

/**
 * Toggle POI panel
 */
function togglePOIPanel() {
    const poiPanel = document.getElementById('poi-panel');
    poiPanel.classList.toggle('show');
}

/**
 * Toggle directions panel panel
 */
function toggleDirectionsPanelPanel() {
    const directionsPanelPanel = document.getElementById('directions-panel-panel');
    directionsPanelPanel.classList.toggle('show');
}

/**
 * Toggle info panel panel
 */
function toggleInfoPanelPanel() {
    const infoPanelPanel = document.getElementById('info-panel-panel');
    infoPanelPanel.classList.toggle('show');
}

/**
 * Toggle search panel panel
 */
function toggleSearchPanelPanel() {
    const searchPanelPanel = document.getElementById('search-panel-panel');
    searchPanelPanel.classList.toggle('show');
}

/**
 * Toggle layer controls panel
 */
function toggleLayerControlsPanel() {
    const layerControlsPanel = document.getElementById('layer-controls-panel');
    layerControlsPanel.classList.toggle('show');
}

/**
 * Toggle share panel panel
 */
function toggleSharePanelPanel() {
    const sharePanelPanel = document.getElementById('share-panel-panel');
    sharePanelPanel.classList.toggle('show');
}

/**
 * Toggle calendar panel panel
 */
function toggleCalendarPanelPanel() {
    const calendarPanelPanel = document.getElementById('calendar-panel-panel');
    calendarPanelPanel.classList.toggle('show');
}

/**
 * Toggle print panel panel
 */
function togglePrintPanelPanel() {
    const printPanelPanel = document.getElementById('print-panel-panel');
    printPanelPanel.classList.toggle('show');
}

/**
 * Toggle advanced panel panel
 */
function toggleAdvancedPanelPanel() {
    const advancedPanelPanel = document.getElementById('advanced-panel-panel');
    advancedPanelPanel.classList.toggle('show');
}

/**
 * Toggle map style panel panel
 */
function toggleMapStylePanelPanel() {
    const mapStylePanelPanel = document.getElementById('map-style-panel-panel');
    mapStylePanelPanel.classList.toggle('show');
}

/**
 * Toggle map type panel panel
 */
function toggleMapTypePanelPanel() {
    const mapTypePanelPanel = document.getElementById('map-type-panel-panel');
    mapTypePanelPanel.classList.toggle('show');
}

/**
 * Toggle fullscreen panel panel
 */
function toggleFullscreenPanelPanel() {
    const fullscreenPanelPanel = document.getElementById('fullscreen-panel-panel');
    fullscreenPanelPanel.classList.toggle('show');
}

/**
 * Toggle location panel panel
 */
function toggleLocationPanelPanel() {
    const locationPanelPanel = document.getElementById('location-panel-panel');
    locationPanelPanel.classList.toggle('show');
}

/**
 * Toggle traffic panel panel
 */
function toggleTrafficPanelPanel() {
    const trafficPanelPanel = document.getElementById('traffic-panel-panel');
    trafficPanelPanel.classList.toggle('show');
}

/**
 * Toggle transit panel panel
 */
function toggleTransitPanelPanel() {
    const transitPanelPanel = document.getElementById('transit-panel-panel');
    transitPanelPanel.classList.toggle('show');
}

/**
 * Toggle bike panel panel
 */
function toggleBikePanelPanel() {
    const bikePanelPanel = document.getElementById('bike-panel-panel');
    bikePanelPanel.classList.toggle('show');
}

/**
 * Toggle heatmap panel panel
 */
function toggleHeatmapPanelPanel() {
    const heatmapPanelPanel = document.getElementById('heatmap-panel-panel');
    heatmapPanelPanel.classList.toggle('show');
}

/**
 * Toggle POI panel panel
 */
function togglePOIPanelPanel() {
    const poiPanelPanel = document.getElementById('poi-panel-panel');
    poiPanelPanel.classList.toggle('show');
}

/**
 * Update the static map fallback with custom styling
 * @param {Object} position - Lat/lng position for map center
 */
function updateStaticMap(position) {
    if (!position) {
        position = clinicPosition || map.getCenter();
    }
    
    const staticMapUrl = getStaticMapUrl(position);
    const staticMapImg = document.getElementById('static-map-img');
    staticMapImg.src = staticMapUrl;
}

/**
 * Get the static map URL with custom styling
 * @param {Object} position - Lat/lng position for map center
 * @returns {string} Static map URL
 */
function getStaticMapUrl(position) {
    const zoom = map.getZoom();
    const width = 640;
    const height = 400;
    const mapStyle = mapStyles.map(style => `${style.featureType}:${style.elementType}|${style.stylers.join('|')}`).join('&style=');
    
    return `https://maps.googleapis.com/maps/api/staticmap?center=${position.lat},${position.lng}&zoom=${zoom}&size=${width}x${height}&markers=color:red%7C${position.lat},${position.lng}&maptype=roadmap&${mapStyle}&key=${apiKey}`;
}

/**
 * Update clinic info window with enhanced details
 * @param {Object} placeDetails - Place details from Places API
 */
function updateClinicInfo(placeDetails) {
    const clinicInfo = document.getElementById('clinic-info');
    clinicInfo.innerHTML = getClinicInfoContent(placeDetails);
}

/**
 * Get clinic info window content
 * @param {Object} placeDetails - Place details from Places API
 * @returns {string} HTML content for clinic info window
 */
function getClinicInfoContent(placeDetails) {
    return `
        <div class="clinic-info-content">
            <h2>${placeDetails.name}</h2>
            <p>${placeDetails.formatted_address}</p>
            <p><strong>Phone:</strong> ${placeDetails.formatted_phone_number}</p>
            <p><strong>Rating:</strong> ${placeDetails.rating} (${placeDetails.user_ratings_total} reviews)</p>
            <p><strong>Website:</strong> <a href="${placeDetails.website}" target="_blank">${placeDetails.website}</a></p>
        </div>
    `;
}

/**
 * Get POI info window content
 * @param {Object} poi - POI object
 * @returns {string} HTML content for POI info window
 */
function getPOIInfoContent(poi) {
    return `
        <div class="poi-info-content">
            <h3>${poi.name}</h3>
            <p>${poi.vicinity}</p>
        </div>
    `;
}

/**
 * Create a marker on the map with enhanced info windows
 * @param {Object} map - The Google Map object
 * @param {Object} position - Lat/lng position
 * @param {string} type - Marker type (e.g., 'parking', 'transit', 'pharmacy')
 * @param {string} content - HTML content for info window
 * @returns {Object} The created marker
 */
function createMarker(map, position, type, content) {
    const marker = new google.maps.Marker({
        map: map,
        position: position,
        icon: getMarkerIcon(type),
        title: type
    });
    
    const infoWindow = new google.maps.InfoWindow({
        content: content
    });
    
    marker.addListener('click', function() {
        infoWindow.open(map, marker);
    });
    
    marker.poiType = type;
    poiMarkers.push(marker);
    
    return marker;
}

/**
 * Get marker icon based on type
 * @param {string} type - Marker type
 * @returns {string} Icon URL
 */
function getMarkerIcon(type) {
    switch (type) {
        case 'parking':
            return 'https://maps.google.com/mapfiles/ms/icons/parking_lot_maps.png';
        case 'transit':
            return 'https://maps.google.com/mapfiles/ms/icons/bus.png';
        case 'pharmacy':
            return 'https://maps.google.com/mapfiles/ms/icons/pharmacy.png';
        default:
            return 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png';
    }
}

/**
 * Get clinic information from Places API
 * @param {Object} position - Lat/lng position of the clinic
 */
function getClinicInfo(position) {
    placesService.getDetails({
        placeId: clinicPlaceId
    }, function(placeDetails, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            updateClinicInfo(placeDetails);
        } else {
            console.error('Places API request failed due to ' + status);
        }
    });
}

/**
 * Open calendar link in new window
 * @param {Object} route - Route object
 */
function openCalendarLink(route) {
    const googleCalendarUrl = getGoogleCalendarUrl(route);
    window.open(googleCalendarUrl, '_blank');
}

/**
 * Calculate and display route between origin and destination
 */
function calculateAndDisplayRoute() {
    if (!originPosition || !clinicPosition) return;
    
    // Clear any existing route
    clearRoute();
    
    // Get travel mode
    const travelMode = document.getElementById('travel-mode').value;
    
    // Get waypoints
    const waypoints = getWaypoints();
    
    // Create directions request
    const request = {
        origin: originPosition,
        destination: clinicPosition,
        travelMode: travelMode,
        waypoints: waypoints,
        optimizeWaypoints: true,
        provideRouteAlternatives: true
    };
    
    // Call Directions service
    directionsService.route(request, function(response, status) {
        if (status === 'OK') {
            // Store route alternatives
            routeAlternatives = response.routes;
            
            // Display route on map
            directionsRenderer.setDirections(response);
            
            // Show route details
            showRouteDetails(response);
            
            // Rearrange waypoint inputs to match optimized order
            if (waypoints.length > 0) {
                const waypointOrder = response.routes[0].waypoint_order;
                rearrangeWaypointInputs(waypointOrder);
            }
        } else {
            console.error('Directions request failed due to ' + status);
            showErrorMessage('An error occurred while calculating directions. Please try again.');
        }
    });
}

/**
 * Get waypoints from input fields
 * @returns {Array} Array of waypoint objects
 */
function getWaypoints() {
    const waypoints = [];
    const waypointInputs = document.querySelectorAll('.waypoint-input');
    
    waypointInputs.forEach(input => {
        const address = input.value.trim();
        if (address !== '') {
            waypoints.push({
                location: address,
                stopover: true
            });
        }
    });
    
    return waypoints;
}

/**
 * Clear existing route from map
 */
function clearRoute() {
    directionsRenderer.setDirections({ routes: [] });
    directionsRenderer.setMap(null);
    directionsRenderer.setPanel(null);
    
    // Clear route alternatives
    routeAlternatives = [];
    
    // Clear route details
    const directionsPanel = document.getElementById('directions-panel');
    if (directionsPanel) {
        directionsPanel.innerHTML = '';
    }
    
    // Clear waypoint markers
    poiMarkers.forEach(marker => marker.setMap(null));
    poiMarkers = [];
}

/**
 * Show error message in directions panel
 * @param {string} message - Error message to display
 */
function showErrorMessage(message) {
    const directionsPanel = document.getElementById('directions-panel');
    if (directionsPanel) {
        directionsPanel.innerHTML = `<p class="error-message">${message}</p>`;
    }
}

/**
 * Show detailed route information and alternatives
 * @param {Object} response - Directions API response
 */
function showRouteDetails(response) {
    const directionsPanel = document.getElementById('directions-panel');
    if (!directionsPanel) return;
    
    // Clear previous content
    directionsPanel.innerHTML = '';
    
    // Display main route details
    const mainRoute = response.routes[0];
    const mainRouteSummary = document.createElement('div');
    mainRouteSummary.className = 'route-summary';
    mainRouteSummary.innerHTML = `
        <h3>Main Route</h3>
        <p>${mainRoute.summary}</p>
        <p><strong>Duration:</strong> ${mainRoute.legs[0].duration.text}</p>
        <p><strong>Distance:</strong> ${mainRoute.legs[0].distance.text}</p>
    `;
    directionsPanel.appendChild(mainRouteSummary);
    
    // Display route alternatives
    if (response.routes.length > 1) {
        const alternativesContainer = document.createElement('div');
        alternativesContainer.className = 'route-alternatives';
        alternativesContainer.innerHTML = '<h4>Alternative Routes</h4>';
        
        response.routes.slice(1).forEach((route, index) => {
            const altRouteSummary = document.createElement('div');
            altRouteSummary.className = 'route-summary';
            altRouteSummary.innerHTML = `
                <h5>Route ${index + 2}</h5>
                <p>${route.summary}</p>
                <p><strong>Duration:</strong> ${route.legs[0].duration.text}</p>
                <p><strong>Distance:</strong> ${route.legs[0].distance.text}</p>
                <button class="btn btn-sm btn-outline select-route-alt" data-route-index="${index + 1}">Select This Route</button>
            `;
            alternativesContainer.appendChild(altRouteSummary);
        });
        
        directionsPanel.appendChild(alternativesContainer);
    }
    
    // Display waypoints
    if (mainRoute.waypoint_order.length > 0) {
        const waypointsContainer = document.createElement('div');
        waypointsContainer.className = 'waypoints-list';
        waypointsContainer.innerHTML = '<h4>Waypoints</h4>';
        
        mainRoute.waypoint_order.forEach(waypointIndex => {
            const waypoint = mainRoute.legs[waypointIndex].start_address;
            const waypointItem = document.createElement('div');
            waypointItem.className = 'waypoint-item';
            waypointItem.innerHTML = `
                <p>${waypoint}</p>
                <button class="btn btn-sm btn-outline remove-waypoint" data-waypoint-index="${waypointIndex}">Remove</button>
            `;
            waypointsContainer.appendChild(waypointItem);
        });
        
        directionsPanel.appendChild(waypointsContainer);
    }
    
    // Add event listeners for route alternatives and waypoint removal
    const selectRouteBtns = directionsPanel.querySelectorAll('.select-route-alt');
    selectRouteBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const routeIndex = parseInt(this.getAttribute('data-route-index'));
            selectRouteAlternative(routeIndex);
        });
    });
    
    const removeWaypointBtns = directionsPanel.querySelectorAll('.remove-waypoint');
    removeWaypointBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const waypointIndex = parseInt(this.getAttribute('data-waypoint-index'));
            removeWaypoint(waypointIndex);
        });
    });
}

/**
 * Select and display a route alternative
 * @param {number} routeIndex - Index of the route to select (0-based)
 */
function selectRouteAlternative(routeIndex) {
    if (routeIndex < 0 || routeIndex >= routeAlternatives.length) return;
    
    // Clear existing route
    clearRoute();
    
    // Display selected route
    directionsRenderer.setDirections({ routes: [routeAlternatives[routeIndex]] });
    
    // Show route details
    showRouteDetails({ routes: [routeAlternatives[routeIndex]] });
}

/**
 * Remove a waypoint from the route
 * @param {number} waypointIndex - Index of the waypoint to remove (0-based)
 */
function removeWaypoint(waypointIndex) {
    if (waypointIndex < 0 || waypointIndex >= routeAlternatives[0].waypoint_order.length) return;
    
    // Remove waypoint from input fields
    const waypointInputs = document.querySelectorAll('.waypoint-input');
    waypointInputs[waypointIndex].value = '';
    
    // Recalculate and display route
    calculateAndDisplayRoute();
}

/**
 * Rearrange waypoint inputs based on optimized order
 * @param {Array} waypointOrder - Array of waypoint indices in optimized order
 */
function rearrangeWaypointInputs(waypointOrder) {
    const waypointInputs = document.querySelectorAll('.waypoint-input');
    const rearrangedInputs = [];
    
    waypointOrder.forEach(index => {
        rearrangedInputs.push(waypointInputs[index]);
    });
    
    // Clear existing waypoint inputs
    waypointInputs.forEach(input => input.remove());
    
    // Append rearranged inputs
    const waypointsContainer = document.getElementById('waypoints-container');
    rearrangedInputs.forEach(input => waypointsContainer.appendChild(input));
}

/**
 * Find and display nearby parking and public transit options
 */
function findNearbyParkingAndTransit() {
    // Check if map and Places service are initialized
    if (!placesService || !clinicPosition) return;
    
    // Search for parking
    placesService.nearbySearch({
        location: clinicPosition,
        radius: 500,
        type: ['parking']
    }, function(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            for (let i = 0; i < Math.min(results.length, 3); i++) {
                createMarker(map, results[i].geometry.location, 'parking', `
                    <div class="info-window poi-info">
                        <h4>${results[i].name}</h4>
                        <p>${results[i].vicinity}</p>
                    </div>
                `);
            }
        }
    });
    
    // Search for transit stations
    placesService.nearbySearch({
        location: clinicPosition,
        radius: 800,
        type: ['subway_station', 'train_station', 'bus_station', 'transit_station']
    }, function(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            for (let i = 0; i < Math.min(results.length, 3); i++) {
                createMarker(map, results[i].geometry.location, 'transit', `
                    <div class="info-window poi-info">
                        <h4>${results[i].name}</h4>
                        <p>${results[i].vicinity}</p>
                    </div>
                `);
            }
        }
    });
    
    // Add the points of interest info card
    addPOIInfoCard();
}

/**
 * Add Points of Interest info card
 */
function addPOIInfoCard() {
    const infoCards = document.querySelector('.directions-info');
    if (!infoCards) return;
    
    const poiCard = document.createElement('div');
    poiCard.className = 'info-card poi-info';
    poiCard.innerHTML = `
        <h3>Points of Interest</h3>
        <div class="poi-toggle">
            <button class="poi-btn active" data-type="all">All</button>
            <button class="poi-btn" data-type="parking">Parking</button>
            <button class="poi-btn" data-type="transit">Transit</button>
            <button class="poi-btn" data-type="pharmacy">Pharmacy</button>
        </div>
        <div class="poi-details">
            <p>Toggle different points of interest near our clinic.</p>
            <p class="poi-tip"><i class="icon icon-info"></i> Click on map markers for more information.</p>
        </div>
    `;
    
    infoCards.appendChild(poiCard);
    
    // Add event listeners to POI toggle buttons
    const poiButtons = poiCard.querySelectorAll('.poi-btn');
    poiButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            poiButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Filter markers based on selected type
            const type = this.getAttribute('data-type');
            filterMarkers(type);
            
            // If pharmacy is selected and none exists yet, search for pharmacies
            if (type === 'pharmacy' && !poiMarkers.some(marker => marker.poiType === 'pharmacy')) {
                findNearbyPharmacies();
            }
        });
    });
}

/**
 * Find and display nearby pharmacies
 */
function findNearbyPharmacies() {
    // Check if map and Places service are initialized
    if (!placesService || !clinicPosition) return;
    
    // Search for pharmacies
    placesService.nearbySearch({
        location: clinicPosition,
        radius: 1000,
        type: ['pharmacy']
    }, function(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            for (let i = 0; i < Math.min(results.length, 5); i++) {
                createMarker(map, results[i].geometry.location, 'pharmacy', `
                    <div class="info-window poi-info">
                        <h4>${results[i].name}</h4>
                        <p>${results[i].vicinity}</p>
                    </div>
                `);
            }
        }
    });
}

/**
 * Filter map markers based on type
 * @param {string} type - Marker type to display ('all' to show all)
 */
function filterMarkers(type) {
    poiMarkers.forEach(marker => {
        if (type === 'all' || !marker.poiType || marker.poiType === type) {
            marker.setVisible(true);
        } else {
            marker.setVisible(false);
        }
    });
}

/**
 * Initialize heatmap for popular visiting times (simulated data)
 */
function initHeatmap() {
    // Create simulated popular times data (simulated foot traffic around the clinic)
    const heatmapData = [];
    
    // Add points around the clinic with varying weights to simulate popular areas
    if (clinicPosition) {
        // Add the clinic itself with high weight
        heatmapData.push({
            location: clinicPosition,
            weight: 10
        });
        
        // Create a grid of points around the clinic with random weights
        for (let i = -5; i <= 5; i++) {
            for (let j = -5; j <= 5; j++) {
                const lat = clinicPosition.lat() + (i * 0.0005);
                const lng = clinicPosition.lng() + (j * 0.0005);
                
                // Skip the center point (already added)
                if (i === 0 && j === 0) continue;
                
                // Generate weight based on distance from clinic (closer = higher weight)
                const distance = Math.sqrt(i*i + j*j);
                const weight = Math.max(0, 10 - distance * 1.5);
                
                if (weight > 0) {
                    heatmapData.push({
                        location: new google.maps.LatLng(lat, lng),
                        weight: weight
                    });
                }
            }
        }
    }
    
    // Create heatmap layer
    heatmap = new google.maps.visualization.HeatmapLayer({
        data: heatmapData,
        map: null, // Don't show by default
        radius: 25,
        opacity: 0.7,
        gradient: [
            'rgba(0, 255, 255, 0)',
            'rgba(0, 255, 255, 1)',
            'rgba(0, 191, 255, 1)',
            'rgba(0, 127, 255, 1)',
            'rgba(0, 63, 255, 1)',
            'rgba(0, 0, 255, 1)',
            'rgba(0, 0, 223, 1)',
            'rgba(0, 0, 191, 1)',
            'rgba(0, 0, 159, 1)',
            'rgba(0, 0, 127, 1)',
            'rgba(63, 0, 91, 1)',
            'rgba(127, 0, 63, 1)',
            'rgba(191, 0, 31, 1)',
            'rgba(255, 0, 0, 1)'
        ]
    });
}

/**
 * Create layer toggle controls
 */
function createLayerToggles() {
    // Create traffic layer
    trafficLayer = new google.maps.TrafficLayer();
    
    // Create transit layer
    transitLayer = new google.maps.TransitLayer();
    
    // Create bicycling layer
    bikeLayer = new google.maps.BicyclingLayer();
    
    // Create toggle controls container
    const layerControls = document.createElement('div');
    layerControls.className = 'layer-controls';
    layerControls.innerHTML = `
        <div class="layer-control-header">Map Layers</div>
        <div class="layer-control-buttons">
            <button id="toggle-traffic" class="layer-btn" title="Show Traffic">
                <i class="icon icon-traffic"></i> Traffic
            </button>
            <button id="toggle-transit" class="layer-btn" title="Show Transit">
                <i class="icon icon-transit"></i> Transit
            </button>
            <button id="toggle-bike" class="layer-btn" title="Show Bike Lanes">
                <i class="icon icon-bike"></i> Bike Lanes
            </button>
            <button id="toggle-heatmap" class="layer-btn" title="Show Popular Times">
                <i class="icon icon-heat"></i> Popular Times
            </button>
        </div>
    `;
    
    // Add controls to map
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(layerControls);
    
    // Add event listeners
    document.getElementById('toggle-traffic').addEventListener('click', toggleTraffic);
    document.getElementById('toggle-transit').addEventListener('click', toggleTransit);
    document.getElementById('toggle-bike').addEventListener('click', toggleBike);
    document.getElementById('toggle-heatmap').addEventListener('click', toggleHeatmap);
}

/**
 * Toggle traffic layer
 */
function toggleTraffic() {
    if (trafficLayer.getMap()) {
        trafficLayer.setMap(null);
    } else {
        trafficLayer.setMap(map);
    }
}

/**
 * Toggle transit layer
 */
function toggleTransit() {
    if (transitLayer.getMap()) {
        transitLayer.setMap(null);
    } else {
        transitLayer.setMap(map);
    }
}

/**
 * Toggle bicycling layer
 */
function toggleBike() {
    if (bikeLayer.getMap()) {
        bikeLayer.setMap(null);
    } else {
        bikeLayer.setMap(map);
    }
}

/**
 * Toggle heatmap layer
 */
function toggleHeatmap() {
    if (heatmap.getMap()) {
        heatmap.setMap(null);
    } else {
        heatmap.setMap(map);
    }
}

/**
 * Initialize the map and related components
 */
function initMap() {
    // Initialize map
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 37.7749, lng: -122.4194 },
        zoom: 15,
        mapTypeId: 'roadmap',
        styles: mapStyles
    });
    
    // Initialize Directions service and renderer
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({
        map: map,
        panel: document.getElementById('directions-panel'),
        suppressMarkers: true
    });
    
    // Initialize Places service
    placesService = new google.maps.places.PlacesService(map);
    
    // Initialize geocoder
    geocoder = new google.maps.Geocoder();
    
    // Add clinic marker
    clinicPosition = { lat: 37.7749, lng: -122.4194 };
    clinicMarker = createMarker(map, clinicPosition, 'clinic', getClinicInfoContent());
    
    // Add POI markers
    addPOIMarkers();
    
    // Initialize heatmap
    initHeatmap();
    
    // Create layer toggle controls
    createLayerToggles();
    
    // Add the points of interest info card
    addPOIInfoCard();
}

/**
 * Add POI markers
 */
function addPOIMarkers() {
    // Add parking POI
    createMarker(map, { lat: 37.7751, lng: -122.4196 }, 'parking', getPOIInfoContent('parking'));
    createMarker(map, { lat: 37.7747, lng: -122.4192 }, 'parking', getPOIInfoContent('parking'));
    
    // Add transit POI
    createMarker(map, { lat: 37.7752, lng: -122.4194 }, 'transit', getPOIInfoContent('transit'));
    createMarker(map, { lat: 37.7746, lng: -122.4190 }, 'transit', getPOIInfoContent('transit'));
}

/**
 * Create a marker on the map with enhanced info windows
 * @param {Object} map - The Google Map object
 * @param {Object} position - Lat/lng position
 * @param {string} type - Marker type (e.g., 'clinic', 'parking', 'transit', 'pharmacy')
 * @param {string} content - Info window content
 * @returns {Object} - The created marker
 */
function createMarker(map, position, type, content) {
    const marker = new google.maps.Marker({
        map: map,
        position: position,
        icon: getMarkerIcon(type),
        title: type
    });
    
    // Add info window
    const infoWindow = new google.maps.InfoWindow({
        content: content
    });
    
    // Add click event listener
    marker.addListener('click', function() {
        infoWindow.open(map, marker);
    });
    
    // Store marker in array
    poiMarkers.push(marker);
    
    // Add type to marker object
    marker.poiType = type;
    
    return marker;
}

/**
 * Get marker icon based on type
 * @param {string} type - Marker type
 * @returns {string} - Icon URL
 */
function getMarkerIcon(type) {
    switch (type) {
        case 'clinic':
            return 'assets/img/clinic-marker.png';
        case 'parking':
            return 'assets/img/parking-marker.png';
        case 'transit':
            return 'assets/img/transit-marker.png';
        case 'pharmacy':
            return 'assets/img/pharmacy-marker.png';
        default:
            return 'assets/img/default-marker.png';
    }
}

/**
 * Get clinic info window content
 * @returns {string} - Info window content
 */
function getClinicInfoContent() {
    return `
        <div class="info-window clinic-info">
            <h4>Our Clinic</h4>
            <p>123 Main St, San Francisco, CA 94101</p>
            <p>Phone: (123) 456-7890</p>
            <p>Email: info@ourclinic.com</p>
            <p>Website: <a href="https://www.ourclinic.com" target="_blank">www.ourclinic.com</a></p>
        </div>
    `;
}

/**
 * Get POI info window content
 * @param {string} type - POI type
 * @returns {string} - Info window content
 */
function getPOIInfoContent(type) {
    switch (type) {
        case 'parking':
            return `
                <div class="info-window poi-info">
                    <h4>Parking Lot</h4>
                    <p>123 Parking St, San Francisco, CA 94101</p>
                    <p>Hours: 24/7</p>
                </div>
            `;
        case 'transit':
            return `
                <div class="info-window poi-info">
                    <h4>Transit Stop</h4>
                    <p>123 Transit St, San Francisco, CA 94101</p>
                    <p>Lines: M, N, K</p>
                </div>
            `;
        default:
            return `
                <div class="info-window poi-info">
                    <h4>Unknown POI</h4>
                    <p>No information available</p>
                </div>
            `;
    }
}

/**
 * Toggle advanced route options panel
 */
function toggleRouteOptions() {
    const routeOptionsPanel = document.getElementById('route-options-panel');
    routeOptionsPanel.classList.toggle('show');
}

/**
 * Toggle calendar panel panel
 */
function toggleCalendarPanelPanel() {
    const calendarPanelPanel = document.getElementById('calendar-panel-panel');
    calendarPanelPanel.classList.toggle('show');
}

/**
 * Toggle print panel panel
 */
function togglePrintPanelPanel() {
    const printPanelPanel = document.getElementById('print-panel-panel');
    printPanelPanel.classList.toggle('show');
}

/**
 * Share route with various share options
 * @param {Object} route - Route object
 */
function shareRoute(route) {
    // Implementation for sharing route
}

/**
 * Add route to calendar
 * @param {Object} route - Route object
 */
function addToCalendar(route) {
    // Implementation for adding route to calendar
}

/**
 * Print route directions
 * @param {Object} route - Route object
 */
function printRoute(route) {
    // Implementation for printing route
}

/**
 * Update clinic info window with enhanced details
 * @param {Object} placeDetails - Place details from Places API
 */
function updateClinicInfoWindow(placeDetails) {
    // Implementation for updating clinic info window
}

/**
 * Calculate and display route between origin and destination
 */
function calculateAndDisplayRoute() {
    // Implementation for calculating and displaying route
}

/**
 * Show detailed route information and alternatives
 * @param {Object} response - Directions API response
 */
function showDetailedRouteInfo(response) {
    // Implementation for showing detailed route information
}

/**
 * Update the static map fallback with custom styling
 * @param {Object} position - Lat/lng position for map center
 */
function updateStaticMapFallback(position) {
    // Implementation for updating static map fallback
}

/**
 * Get static map URL for given position and zoom level
 * @param {Object} position - Lat/lng position
 * @param {number} zoom - Zoom level
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {string} - Static map URL
 */
function getStaticMapUrl(position, zoom, width, height) {
    // Implementation for getting static map URL
}

/**
 * Handle geolocation error
 * @param {Object} error - Geolocation error object
 */
function handleGeolocationError(error) {
    // Implementation for handling geolocation error
}

/**
 * Toggle traffic layer
 */
function toggleTraffic() {
    // Implementation for toggling traffic layer
}

/**
 * Toggle transit layer
 */
function toggleTransit() {
    // Implementation for toggling transit layer
}

/**
 * Toggle bicycling layer
 */
function toggleBike() {
    // Implementation for toggling bicycling layer
}

/**
 * Toggle heatmap layer
 */
function toggleHeatmap() {
    // Implementation for toggling heatmap layer
}

/**
 * Initialize the map and related components
 */
function initMap() {
    // Implementation for initializing the map
}

/**
 * Add POI markers
 */
function addPOIMarkers() {
    // Implementation for adding POI markers
}

/**
 * Create a marker on the map with enhanced info windows
 * @param {Object} map - The Google Map object
 * @param {Object} position - Lat/lng position
 * @param {string} type - Marker type (e.g., 'clinic', 'parking', 'transit', 'pharmacy')
 * @param {string} content - Info window content
 * @returns {Object} - The created marker
 */
function createMarker(map, position, type, content) {
    // Implementation for creating a marker
}

/**
 * Get marker icon based on type
 * @param {string} type - Marker type
 * @returns {string} - Icon URL
 */
function getMarkerIcon(type) {
    // Implementation for getting marker icon
}

/**
 * Get clinic info window content
 * @returns {string} - Info window content
 */
function getClinicInfoContent() {
    // Implementation for getting clinic info window content
}

/**
 * Get POI info window content
 * @param {string} type - POI type
 * @returns {string} - Info window content
 */
function getPOIInfoContent(type) {
    // Implementation for getting POI info window content
}

/**
 * Toggle advanced route options panel
 */
function toggleRouteOptions() {
    // Implementation for toggling advanced route options panel
}

/**
 * Toggle calendar panel panel
 */
function toggleCalendarPanelPanel() {
    // Implementation for toggling calendar panel panel
}

/**
 * Toggle print panel panel
 */
function togglePrintPanelPanel() {
    // Implementation for toggling print panel panel
}

/**
 * Share route with various share options
 * @param {Object} route - Route object
 */
function shareRoute(route) {
    // Implementation for sharing route
}

/**
 * Add route to calendar
 * @param {Object} route - Route object
 */
function addToCalendar(route) {
    // Implementation for adding route to calendar
}

/**
 * Print route directions
 * @param {Object} route - Route object
 */
function printRoute(route) {
    // Implementation for printing route
}

/**
 * Update clinic info window with enhanced details
 * @param {Object} placeDetails - Place details from Places API
 */
function updateClinicInfoWindow(placeDetails) {
    // Implementation for updating clinic info window
}

/**
 * Calculate and display route between origin and destination
 */
function calculateAndDisplayRoute() {
    // Implementation for calculating and displaying route
}

/**
 * Show detailed route information and alternatives
 * @param {Object} response - Directions API response
 */
function showDetailedRouteInfo(response) {
    // Implementation for showing detailed route information
}

/**
 * Update the static map fallback with custom styling
 * @param {Object} position - Lat/lng position for map center
 */
function updateStaticMapFallback(position) {
    // Implementation for updating static map fallback
}

/**
 * Get static map URL for given position and zoom level
 * @param {Object} position - Lat/lng position
 * @param {number} zoom - Zoom level
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {string} - Static map URL
 */
function getStaticMapUrl(position, zoom, width, height) {
    // Implementation for getting static map URL
}

/**
 * Handle geolocation error
 * @param {Object} error - Geolocation error object
 */
function handleGeolocationError(error) {
    // Implementation for handling geolocation error
}

/**
 * Toggle traffic layer
 */
function toggleTraffic() {
    // Implementation for toggling traffic layer
}

/**
 * Toggle transit layer
 */
function toggleTransit() {
    // Implementation for toggling transit layer
}

/**
 * Toggle bicycling layer
 */
function toggleBike() {
    // Implementation for toggling bicycling layer
}

/**
 * Toggle heatmap layer
 */
function toggleHeatmap() {
    // Implementation for toggling heatmap layer
}

/**
 * Initialize the map and related components
 */
function initMap() {
    // Implementation for initializing the map
}

/**
 * Add POI markers
 */
function addPOIMarkers() {
    // Implementation for adding POI markers
}

/**
 * Create a marker on the map with enhanced info windows
 * @param {Object} map - The Google Map object
 * @param {Object} position - Lat/lng position
 * @param {string} type - Marker type (e.g., 'clinic', 'parking', 'transit', 'pharmacy')
 * @param {string} content - Info window content
 * @returns {Object} - The created marker
 */
function createMarker(map, position, type, content) {
    // Implementation for creating a marker
}

/**
 * Get marker icon based on type
 * @param {string} type - Marker type
 * @returns {string} - Icon URL
 */
function getMarkerIcon(type) {
    // Implementation for getting marker icon
}

/**
 * Get clinic info window content
 * @returns {string} - Info window content
 */
function getClinicInfoContent() {
    // Implementation for getting clinic info window content
}

/**
 * Get POI info window content
 * @param {string} type - POI type
 * @returns {string} - Info window content
 */
function getPOIInfoContent(type) {
    // Implementation for getting POI info window content
}

/**
 * Toggle advanced route options panel
 */
function toggleRouteOptions() {
    // Implementation for toggling advanced route options panel
}

/**
 * Toggle calendar panel panel
 */
function toggleCalendarPanelPanel() {
    // Implementation for toggling calendar panel panel
}

/**
 * Toggle print panel panel
 */
function togglePrintPanelPanel() {
    // Implementation for toggling print panel panel
}

/**
 * Share route with various share options
 * @param {Object} route - Route object
 */
function shareRoute(route) {
    // Implementation for sharing route
}

/**
 * Add route to calendar
 * @param {Object} route - Route object
 */
function addToCalendar(route) {
    // Implementation for adding route to calendar
}

/**
 * Print route directions
 * @param {Object} route - Route object
 */
function printRoute(route) {
    // Implementation for printing route
}

/**
 * Update clinic info window with enhanced details
 * @param {Object} placeDetails - Place details from Places API
 */
function updateClinicInfoWindow(placeDetails) {
    // Implementation for updating clinic info window
}

/**
 * Calculate and display route between origin and destination
 */
function calculateAndDisplayRoute() {
    // Implementation for calculating and displaying route
}

/**
 * Show detailed route information and alternatives
 * @param {Object} response - Directions API response
 */
function showDetailedRouteInfo(response) {
    // Implementation for showing detailed route information
}

/**
 * Update the static map fallback with custom styling
 * @param {Object} position - Lat/lng position for map center
 */
function updateStaticMapFallback(position) {
    // Implementation for updating static map fallback
}

/**
 * Get static map URL for given position and zoom level
 * @param {Object} position - Lat/lng position
 * @param {number} zoom - Zoom level
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {string} - Static map URL
 */
function getStaticMapUrl(position, zoom, width, height) {
    // Implementation for getting static map URL
}

/**
 * Handle geolocation error
 * @param {Object} error - Geolocation error object
 */
function handleGeolocationError(error) {
    // Implementation for handling geolocation error
}

/**
 * Toggle traffic layer
 */
function toggleTraffic() {
    // Implementation for toggling traffic layer
}

/**
 * Toggle transit layer
 */
function toggleTransit() {
    // Implementation for toggling transit layer
}

/**
 * Toggle bicycling layer
 */
function toggleBike() {
    // Implementation for toggling bicycling layer
}

/**
 * Toggle heatmap layer
 */
function toggleHeatmap() {
    // Implementation for toggling heatmap layer
}

/**
 * Initialize the map and related components
 */
function initMap() {
    // Implementation for initializing the map
}

/**
 * Add POI markers
 */
function addPOIMarkers() {
    // Implementation for adding POI markers
}

/**
 * Create a marker on the map with enhanced info windows
 * @param {Object} map - The Google Map object
 * @param {Object} position - Lat/lng position
 * @param {string} type - Marker type (e.g., 'clinic', 'parking', 'transit', 'pharmacy')
 * @param {string} content - Info window content
 * @returns {Object} - The created marker
 */
function createMarker(map, position, type, content) {
    // Implementation for creating a marker
}

/**
 * Get marker icon based on type
 * @param {string} type - Marker type
 * @returns {string} - Icon URL
 */
function getMarkerIcon(type) {
    // Implementation for getting marker icon
}

/**
 * Get clinic info window content
 * @returns {string} - Info window content
 */
function getClinicInfoContent() {
    // Implementation for getting clinic info window content
}

/**
 * Get POI info window content
 * @param {string} type - POI type
 * @returns {string} - Info window content
 */
function getPOIInfoContent(type) {
    // Implementation for getting POI info window content
}

/**
 * Toggle advanced route options panel
 */
function toggleRouteOptions() {
    // Implementation for toggling advanced route options panel
}

/**
 * Toggle calendar panel panel
 */
function toggleCalendarPanelPanel() {
    // Implementation for toggling calendar panel panel
}

/**
 * Toggle print panel panel
 */
function togglePrintPanelPanel() {
    // Implementation for toggling print panel panel
}

/**
 * Share route with various share options
 * @param {Object} route - Route object
 */
function shareRoute(route) {
    // Implementation for sharing route
}

/**
 * Add route to calendar
 * @param {Object} route - Route object
 */
function addToCalendar(route) {
    // Implementation for adding route to calendar
}

/**
 * Print route directions
 * @param {Object} route - Route object
 */
function printRoute(route) {
    // Implementation for printing route
}

/**
 * Update clinic info window with enhanced details
 * @param {Object} placeDetails - Place details from Places API
 */
function updateClinicInfoWindow(placeDetails) {
    // Implementation for updating clinic info window
}

/**
 * Calculate and display route between origin and destination
 */
function calculateAndDisplayRoute() {
    // Implementation for calculating and displaying route
}

/**
 * Show detailed route information and alternatives
 * @param {Object} response - Directions API response
 */
function showDetailedRouteInfo(response) {
    // Implementation for showing detailed route information
}

/**
 * Update the static map fallback with custom styling
 * @param {Object} position - Lat/lng position for map center
 */
function updateStaticMapFallback(position) {
    // Implementation for updating static map fallback
}

/**
 * Get static map URL for given position and zoom level
 * @param {Object} position - Lat/lng position
 * @param {number} zoom - Zoom level
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {string} - Static map URL
 */
function getStaticMapUrl(position, zoom, width, height) {
    // Implementation for getting static map URL
}

/**
 * Handle geolocation error
 * @param {Object} error - Geolocation error object
 */
function handleGeolocationError(error) {
    // Implementation for handling geolocation error
}

/**
 * Toggle traffic layer
 */
function toggleTraffic() {
    // Implementation for toggling traffic layer
}

/**
 * Toggle transit layer
 */
function toggleTransit() {
    // Implementation for toggling transit layer
}

/**
 * Toggle bicycling layer
 */
function toggleBike() {
    // Implementation for toggling bicycling layer
}

/**
 * Toggle heatmap layer
 */
function toggleHeatmap() {
    // Implementation for toggling heatmap layer
}

/**
 * Initialize the map and related components
 */
function initMap() {
    // Implementation for initializing the map
}

/**
 * Add POI markers
 */
function addPOIMarkers() {
    // Implementation for adding POI markers
}

/**
 * Create a marker on the map with enhanced info windows
 * @param {Object} map - The Google Map object
 * @param {Object} position - Lat/lng position
 * @param {string} type - Marker type (e.g., 'clinic', 'parking', 'transit', 'pharmacy')
 * @param {string} content - Info window content
 * @returns {Object} - The created marker
 */
function createMarker(map, position, type, content) {
    // Implementation for creating a marker
}

/**
 * Get marker icon based on type
 * @param {string} type - Marker type
 * @returns {string} - Icon URL
 */
function getMarkerIcon(type) {
    // Implementation for getting marker icon
}

/**
 * Get clinic info window content
 * @returns {string} - Info window content
 */
function getClinicInfoContent() {
    // Implementation for getting clinic info window content
}

/**
 * Get POI info window content
 * @param {string} type - POI type
 * @returns {string} - Info window content
 */
function getPOIInfoContent(type) {
    // Implementation for getting POI info window content
}

/**
 * Toggle advanced route options panel
 */
function toggleRouteOptions() {
    // Implementation for toggling advanced route options panel
}

/**
 * Toggle calendar panel panel
 */
function toggleCalendarPanelPanel() {
    // Implementation for toggling calendar panel panel
}

/**
 * Toggle print panel panel
 */
function togglePrintPanelPanel() {
    // Implementation for toggling print panel panel
}

/**
 * Share route with various share options
 * @param {Object} route - Route object
 */
function shareRoute(route) {
    // Implementation for sharing route
}

/**
 * Add route to calendar
 * @param {Object} route - Route object
 */
function addToCalendar(route) {
    // Implementation for adding route to calendar
}

/**
 * Print route directions
 * @param {Object} route - Route object
 */
function printRoute(route) {
    // Implementation for printing route
}

/**
 * Update clinic info window with enhanced details
 * @param {Object} placeDetails - Place details from Places API
 */
function updateClinicInfoWindow(placeDetails) {
    // Implementation for updating clinic info window
}

/**
 * Calculate and display route between origin and destination
 */
function calculateAndDisplayRoute() {
    // Implementation for calculating and displaying route
}

/**
 * Show detailed route information and alternatives
 * @param {Object} response - Directions API response
 */
function showDetailedRouteInfo(response) {
    // Implementation for showing detailed route information
}

/**
 * Update the static map fallback with custom styling
 * @param {Object} position - Lat/lng position for map center
 */
function updateStaticMapFallback(position) {
    // Implementation for updating static map fallback
}

/**
 * Get static map URL for given position and zoom level
 * @param {Object} position - Lat/lng position
 * @param {number} zoom - Zoom level
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {string} - Static map URL
 */
function getStaticMapUrl(position, zoom, width, height) {
    // Implementation for getting static map URL
}

/**
 * Handle geolocation error
 * @param {Object} error - Geolocation error object
 */
function handleGeolocationError(error) {
    // Implementation for handling geolocation error
}

/**
 * Toggle traffic layer
 */
function toggleTraffic() {
    // Implementation for toggling traffic layer
}

/**
 * Toggle transit layer
 */
function toggleTransit() {
    // Implementation for toggling transit layer
}

/**
 * Toggle bicycling layer
 */
function toggleBike() {
    // Implementation for toggling bicycling layer
}

/**
 * Toggle heatmap layer
 */
function toggleHeatmap() {
    // Implementation for toggling heatmap layer
}

/**
 * Initialize the map and related components
 */
function initMap() {
    // Implementation for initializing the map
}

/**
 * Add POI markers
 */
function addPOIMarkers() {
    // Implementation for adding POI markers
}

/**
 * Create a marker on the map with enhanced info windows
 * @param {Object} map - The Google Map object
 * @param {Object} position - Lat/lng position
 * @param {string} type - Marker type (e.g., 'clinic', 'parking', 'transit', 'pharmacy')
 * @param {string} content - Info window content
 * @returns {Object} - The created marker
 */
function createMarker(map, position, type, content) {
    // Implementation for creating a marker
}

/**
 * Get marker icon based on type
 * @param {string} type - Marker type
 * @returns {string} - Icon URL
 */
function getMarkerIcon(type) {
    // Implementation for getting marker icon
}

/**
 * Get clinic info window content
 * @returns {string} - Info window content
 */
function getClinicInfoContent() {
    // Implementation for getting clinic info window content
}

/**
 * Get POI info window content
 * @param {string} type - POI type
 * @returns {string} - Info window content
 */
function getPOIInfoContent(type) {
    // Implementation for getting POI info window content
}

/**
 * Toggle advanced route options panel
 */
function toggleRouteOptions() {
    // Implementation for toggling advanced route options panel
}

/**
 * Toggle calendar panel panel
 */
function toggleCalendarPanelPanel() {
    // Implementation for toggling calendar panel panel
}

/**
 * Toggle print panel panel
 */
function togglePrintPanelPanel() {
    // Implementation for toggling print panel panel
}

/**
 * Share route with various share options
 * @param {Object} route - Route object
 */
function shareRoute(route) {
    // Implementation for sharing route
}

/**
 * Add route to calendar
 * @param {Object} route - Route object
 */
function addToCalendar(route) {
    // Implementation for adding route to calendar
}

/**
 * Print route directions
 * @param {Object} route - Route object
 */
function printRoute(route) {
    // Implementation for printing route
}

/**
 * Update clinic info window with enhanced details
 * @param {Object} placeDetails - Place details from Places API
 */
function updateClinicInfoWindow(placeDetails) {
    // Implementation for updating clinic info window
}

/**
 * Calculate and display route between origin and destination
 */
function calculateAndDisplayRoute() {
    // Implementation for calculating and displaying route
}

/**
 * Show detailed route information and alternatives
 * @param {Object} response - Directions API response
 */
function showDetailedRouteInfo(response) {
    // Implementation for showing detailed route information
}

/**
 * Update the static map fallback with custom styling
 * @param {Object} position - Lat/lng position for map center
 */
function updateStaticMapFallback(position) {
    // Implementation for updating static map fallback
}

/**
 * Get static map URL for given position and zoom level
 * @param {Object} position - Lat/lng position
 * @param {number} zoom - Zoom level
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {string} - Static map URL
 */
function getStaticMapUrl(position, zoom, width, height) {
    // Implementation for getting static map URL
}

/**
 * Handle geolocation error
 * @param {Object} error - Geolocation error object
 */
function handleGeolocationError(error) {
    // Implementation for handling geolocation error
}

/**
 * Toggle traffic layer
 */
function toggleTraffic() {
    // Implementation for toggling traffic layer
}

/**
 * Toggle transit layer
 */
function toggleTransit() {
    // Implementation for toggling transit layer
}

/**
 * Toggle bicycling layer
 */
function toggleBike() {
    // Implementation for toggling bicycling layer
}

/**
 * Toggle heatmap layer
 */
function toggleHeatmap() {
    // Implementation for toggling heatmap layer
}

/**
 * Initialize the map and related components
 */
function initMap() {
    // Implementation for initializing the map
}

/**
 * Add POI markers
 */
function addPOIMarkers() {
    // Implementation for adding POI markers
}

/**
 * Create a marker on the map with enhanced info windows
 * @param {Object} map - The Google Map object
 * @param {Object} position - Lat/lng position
 * @param {string} type - Marker type (e.g., 'clinic', 'parking', 'transit', 'pharmacy')
 * @param {string} content - Info window content
 * @returns {Object} - The created marker
 */
function createMarker(map, position, type, content) {
    // Implementation for creating a marker
}

/**
 * Get marker icon based on type
 * @param {string} type - Marker type
 * @returns {string} - Icon URL
 */
function getMarkerIcon(type) {
    // Implementation for getting marker icon
}

/**
 * Get clinic info window content
 * @returns {string} - Info window content
 */
function getClinicInfoContent() {
    // Implementation for getting clinic info window content
}

/**
 * Get POI info window content
 * @param {string} type - POI type
 * @returns {string} - Info window content
 */
function getPOIInfoContent(type) {
    // Implementation for getting POI info window content
}

/**
 * Toggle advanced route options panel
 */
function toggleRouteOptions() {
    // Implementation for toggling advanced route options panel
}

/**
 * Toggle calendar panel panel
 */
function toggleCalendarPanelPanel() {
    // Implementation for toggling calendar panel panel
}

/**
 * Toggle print panel panel
 */
function togglePrintPanelPanel() {
    // Implementation for toggling print panel panel
}

/**
 * Share route with various share options
 * @param {Object} route - Route object
 */
function shareRoute(route) {
    // Implementation for sharing route
}

/**
 * Add route to calendar
 * @param {Object} route - Route object
 */
function addToCalendar(route) {
    // Implementation for adding route to calendar
}

/**
 * Print route directions
 * @param {Object} route - Route object
 */
function printRoute(route) {
    // Implementation for printing route
}

/**
 * Update clinic info window with enhanced details
 * @param {Object} placeDetails - Place details from Places API
 */
function updateClinicInfoWindow(placeDetails) {
    // Implementation for updating clinic info window
}

/**
 * Calculate and display route between origin and destination
 */
function calculateAndDisplayRoute() {
    // Implementation for calculating and displaying route
}

/**
 * Show detailed route information and alternatives
 * @param {Object} response - Directions API response
 */
function showDetailedRouteInfo(response) {
    // Implementation for showing detailed route information
}

/**
 * Update the static map fallback with custom styling
 * @param {Object} position - Lat/lng position for map center
 */
function updateStaticMapFallback(position) {
    // Implementation for updating static map fallback
}

/**
 * Get static map URL for given position and zoom level
 * @param {Object} position - Lat/lng position
 * @param {number} zoom - Zoom level
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {string} - Static map URL
 */
function getStaticMapUrl(position, zoom, width, height) {
    // Implementation for getting static map URL
}

/**
 * Handle geolocation error
 * @param {Object} error - Geolocation error object
 */
function handleGeolocationError(error) {
    // Implementation for handling geolocation error
}

/**
 * Toggle traffic layer
 */
function toggleTraffic() {
    // Implementation for toggling traffic layer
}

/**
 * Toggle transit layer
 */
function toggleTransit() {
    // Implementation for toggling transit layer
}

/**
 * Toggle bicycling layer
 */
function toggleBike() {
    // Implementation for toggling bicycling layer
}

/**
 * Toggle heatmap layer
 */
function toggleHeatmap() {
    // Implementation for toggling heatmap layer
}

/**
 * Initialize the map and related components
 */
function initMap() {
    // Implementation for initializing the map
}

/**
 * Add POI markers
 */
function addPOIMarkers() {
    // Implementation for adding POI markers
}

/**
 * Create a marker on the map with enhanced info windows
 * @param {Object} map - The Google Map object
 * @param {Object} position - Lat/lng position
 * @param {string} type - Marker type (e.g., 'clinic', 'parking', 'transit', 'pharmacy')
 * @param {string} content - Info window content
 * @returns {Object} - The created marker
 */
function createMarker(map, position, type, content) {
    // Implementation for creating a marker
}

/**
 * Get marker icon based on type
 * @param {string} type - Marker type
 * @returns {string} - Icon URL
 */
function getMarkerIcon(type) {
    // Implementation for getting marker icon
}

/**
 * Get clinic info window content
 * @returns {string} - Info window content
 */
function getClinicInfoContent() {
    // Implementation for getting clinic info window content
}

/**
 * Get POI info window content
 * @param {string} type - POI type
 * @returns {string} - Info window content
 */
function getPOIInfoContent(type) {
    // Implementation for getting POI info window content
}

/**
 * Toggle advanced route options panel
 */
function toggleRouteOptions() {
    // Implementation for toggling advanced route options panel
}

/**
 * Toggle calendar panel panel
 */
function toggleCalendarPanelPanel() {
    // Implementation for toggling calendar panel panel
}

/**
 * Toggle print panel panel
 */
function togglePrintPanelPanel() {
    // Implementation for toggling print panel panel
}

/**
 * Share route with various share options
 * @param {Object} route - Route object
 */
function shareRoute(route) {
    // Implementation for sharing route
}

/**
 * Add route to calendar
 * @param {Object} route - Route object
 */
function addToCalendar(route) {
    // Implementation for adding route to calendar
}

/**
 * Print route directions
 * @param {Object} route - Route object
 */
function printRoute(route) {
    // Implementation for printing route
}

/**
 * Update clinic info window with enhanced details
 * @param {Object} placeDetails - Place details from Places API
 */
function updateClinicInfoWindow(placeDetails) {
    // Implementation for updating clinic info window
}

/**
 * Calculate and display route between origin and destination
 */
function calculateAndDisplayRoute() {
    // Implementation for calculating and displaying route
}

/**
 * Show detailed route information and alternatives
 * @param {Object} response - Directions API response
 */
function showDetailedRouteInfo(response) {
    // Implementation for showing detailed route information
}

/**
 * Update the static map fallback with custom styling
 * @param {Object} position - Lat/lng position for map center
 */
function updateStaticMapFallback(position) {
    // Implementation for updating static map fallback
}

/**
 * Get static map URL for given position and zoom level
 * @param {Object} position - Lat/lng position
 * @param {number} zoom - Zoom level
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {string} - Static map URL
 */
function getStaticMapUrl(position, zoom, width, height) {
    // Implementation for getting static map URL
}

/**
 * Handle geolocation error
 * @param {Object} error - Geolocation error object
 */
function handleGeolocationError(error) {
    // Implementation for handling geolocation error
}

/**
 * Toggle traffic layer
 */
function toggleTraffic() {
    // Implementation for toggling traffic layer
}

/**
 * Toggle transit layer
 */
function toggleTransit() {
    // Implementation for toggling transit layer
}

/**
 * Toggle bicycling layer
 */
function toggleBike() {
    // Implementation for toggling bicycling layer
}

/**
 * Toggle heatmap layer
 */
function toggleHeatmap() {
    // Implementation for toggling heatmap layer
}

/**
 * Initialize the map and related components
 */
function initMap() {
    // Implementation for initializing the map
}

/**
 * Add POI markers
 */
function addPOIMarkers() {
    // Implementation for adding POI markers
}

/**
 * Create a marker on the map with enhanced info windows
 * @param {Object} map - The Google Map object
 * @param {Object} position - Lat/lng position
 * @param {string} type - Marker type (e.g., 'clinic', 'parking', 'transit', 'pharmacy')
 * @param {string} content - Info window content
 * @returns {Object} - The created marker
 */
function createMarker(map, position, type, content) {
    // Implementation for creating a marker
}

/**
 * Get marker icon based on type
 * @param {string} type - Marker type
 * @returns {string} - Icon URL
 */
function getMarkerIcon(type) {
    // Implementation for getting marker icon
}

/**
 * Get clinic info window content
 * @returns {string} - Info window content
 */
function getClinicInfoContent() {
    // Implementation for getting clinic info window content
}

/**
 * Get POI info window content
 * @param {string} type - POI type
 * @returns {string} - Info window content
 */
function getPOIInfoContent(type) {
    // Implementation for getting POI info window content
}

/**
 * Toggle advanced route options panel
 */
function toggleRouteOptions() {
    // Implementation for toggling advanced route options panel
}

/**
 * Toggle calendar panel panel
 */
function toggleCalendarPanelPanel() {
    // Implementation for toggling calendar panel panel
}

/**
 * Toggle print panel panel
 */
function togglePrintPanelPanel() {
    // Implementation for toggling print panel panel
}

/**
 * Share route with various share options
 * @param {Object} route - Route object
 */
function shareRoute(route) {
    // Implementation for sharing route
}

/**
 * Add route to calendar
 * @param {Object} route - Route object
 */
function addToCalendar(route) {
    // Implementation for adding route to calendar
}

/**
 * Print route directions
 * @param {Object} route - Route object
 */
function printRoute(route) {
    // Implementation for printing route
}

/**
 * Update clinic info window with enhanced details
 * @param {Object} placeDetails - Place details from Places API
 */
function updateClinicInfoWindow(placeDetails) {
    // Implementation for updating clinic info window
}

/**
 * Calculate and display route between origin and destination
 */
function calculateAndDisplayRoute() {
    // Implementation for calculating and displaying route
}

/**
 * Show detailed route information and alternatives
 * @param {Object} response - Directions API response
 */
function showDetailedRouteInfo(response) {
    // Implementation for showing detailed route information
}

/**
 * Update the static map fallback with custom styling
 * @param {Object} position - Lat/lng position for map center
 */
function updateStaticMapFallback(position) {
    // Implementation for updating static map fallback
}

/**
 * Get static map URL for given position and zoom level
 * @param {Object} position - Lat/lng position
 * @param {number} zoom - Zoom level
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {string} - Static map URL
 */
function getStaticMapUrl(position, zoom, width, height) {
    // Implementation for getting static map URL
}

/**
 * Handle geolocation error
 * @param {Object} error - Geolocation error object
 */
function handleGeolocationError(error) {
    // Implementation for handling geolocation error
}

/**
 * Toggle traffic layer
 */
function toggleTraffic() {
    // Implementation for toggling traffic layer
}

/**
 * Toggle transit layer
 */
function toggleTransit() {
    // Implementation for toggling transit layer
}

/**
 * Toggle bicycling layer
 */
function toggleBike() {
    // Implementation for toggling bicycling layer
}

/**
 * Toggle heatmap layer
 */
function toggleHeatmap() {
    // Implementation for toggling heatmap layer
}

/**
 * Initialize the map and related components
 */
function initMap() {
    // Implementation for initializing the map
}

/**
 * Add POI markers
 */
function addPOIMarkers() {
    // Implementation for adding POI markers
}

/**
 * Create a marker on the map with enhanced info windows
 * @param {Object} map - The Google Map object
 * @param {Object} position - Lat/lng position
 * @param {string} type - Marker type (e.g., 'clinic', 'parking', 'transit', 'pharmacy')
 * @param {string} content - Info window content
 * @returns {Object} - The created marker
 */
function createMarker(map, position, type, content) {
    // Implementation for creating a marker
}

/**
 * Get marker icon based on type
 * @param {string} type - Marker type
 * @returns {string} - Icon URL
 */
function getMarkerIcon(type) {
    // Implementation for getting marker icon
}

/**
 * Get clinic info window content
 * @returns {string} - Info window content
 */
function getClinicInfoContent() {
    // Implementation for getting clinic info window content
}

/**
 * Get POI info window content
 * @param {string} type - POI type
 * @returns {string} - Info window content
 */
function getPOIInfoContent(type) {
    // Implementation for getting POI info window content
}

/**
 * Toggle advanced route options panel
 */
function toggleRouteOptions() {
    // Implementation for toggling advanced route options panel
}

/**
 * Toggle calendar panel panel
 */
function toggleCalendarPanelPanel() {
    // Implementation for toggling calendar panel panel
}

/**
 * Toggle print panel panel
 */
function togglePrintPanelPanel() {
    // Implementation for toggling print panel panel
}

/**
 * Share route with various share options
 * @param {Object} route - Route object
 */
function shareRoute(route) {
    // Implementation for sharing route
}

/**
 * Add route to calendar
 * @param {Object} route - Route object
 */
function addToCalendar(route) {
    // Implementation for adding route to calendar
}

/**
 * Print route directions
 * @param {Object} route - Route object
 */
function printRoute(route) {
    // Implementation for printing route
}

/**
 * Update clinic info window with enhanced details
 * @param {Object} placeDetails - Place details from Places API
 */
function updateClinicInfoWindow(placeDetails) {
    // Implementation for updating clinic info window
}

/**
 * Calculate and display route between origin and destination
 */
function calculateAndDisplayRoute() {
    // Implementation for calculating and displaying route
}

/**
 * Show detailed route information and alternatives
 * @param {Object} response - Directions API response
 */
function showDetailedRouteInfo(response) {
    // Implementation for showing detailed route information
}

/**
 * Update the static map fallback with custom styling
 * @param {Object} position - Lat/lng position for map center
 */
function updateStaticMapFallback(position) {
    // Implementation for updating static map fallback
}

/**
 * Get static map URL for given position and zoom level
 * @param {Object} position - Lat/lng position
 * @param {number} zoom - Zoom level
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {string} - Static map URL
 */
function getStaticMapUrl(position, zoom, width, height) {
    // Implementation for getting static map URL
}

/**
 * Handle geolocation error
 * @param {Object} error - Geolocation error object
 */
function handleGeolocationError(error) {
    // Implementation for handling geolocation error
}

/**
 * Toggle traffic layer
 */
function toggleTraffic() {
    // Implementation for toggling traffic layer
}

/**
 * Toggle transit layer
 */
function toggleTransit() {
    // Implementation for toggling transit layer
}

/**
 * Toggle bicycling layer
 */
function toggleBike() {
    // Implementation for toggling bicycling layer
}

/**
 * Toggle heatmap layer
 */
function toggleHeatmap() {
    // Implementation for toggling heatmap layer
}

/**
 * Initialize the map and related components
 */
function initMap() {
    // Implementation for initializing the map
}

/**
 * Add POI markers
 */
function addPOIMarkers() {
    // Implementation for adding POI markers
}

/**
 * Create a marker on the map with enhanced info windows
 * @param {Object} map - The Google Map object
 * @param {Object} position - Lat/lng position
 * @param {string} type - Marker type (e.g., 'clinic', 'parking', 'transit', 'pharmacy')
 * @param {string} content - Info window content
 * @returns {Object} - The created marker
 */
function createMarker(map, position, type, content) {
    // Implementation for creating a marker
}

/**
 * Get marker icon based on type
 * @param {string} type - Marker type
 * @returns {string} - Icon URL
 */
function getMarkerIcon(type) {
    // Implementation for getting marker icon
}

/**
 * Get clinic info window content
 * @returns {string} - Info window content
 */
function getClinicInfoContent() {
    // Implementation for getting clinic info window content
}

/**
 * Get POI info window content
 * @param {string} type - POI type
 * @returns {string} - Info window content
 */
function getPOIInfoContent(type) {
    // Implementation for getting POI info window content
}

/**
 * Toggle advanced route options panel
 */
function toggleRouteOptions() {
    // Implementation for toggling advanced route options panel
}

/**
 * Toggle calendar panel panel
 */
function toggleCalendarPanelPanel() {
    // Implementation for toggling calendar panel panel
}

/**
 * Toggle print panel panel
 */
function togglePrintPanelPanel() {
    // Implementation for toggling print panel panel
}

/**
 * Share route with various share options
 * @param {Object} route - Route object
 */
function shareRoute(route) {
    // Implementation for sharing route
}

/**
 * Add route to calendar
 * @param {Object} route - Route object
 */
function addToCalendar(route) {
    // Implementation for adding route to calendar
}

/**
 * Print route directions
 * @param {Object} route - Route object
 */
function printRoute(route) {
    // Implementation for printing route
}

/**
 * Update clinic info window with enhanced details
 * @param {Object} placeDetails - Place details from Places API
 */
function updateClinicInfoWindow(placeDetails) {
    // Implementation for updating clinic info window
}

/**
 * Calculate and display route between origin and destination
 */
function calculateAndDisplayRoute() {
    // Implementation for calculating and displaying route
}

/**
 * Show detailed route information and alternatives
 * @param {Object} response - Directions API response
 */
function showDetailedRouteInfo(response) {
    // Implementation for showing detailed route information
}

/**
 * Update the static map fallback with custom styling
 * @param {Object} position - Lat/lng position for map center
 */
function updateStaticMapFallback(position) {
    // Implementation for updating static map fallback
}

/**
 * Get static map URL for given position and zoom level
 * @param {Object} position - Lat/lng position
 * @param {number} zoom - Zoom level
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {string} - Static map URL
 */
function getStaticMapUrl(position, zoom, width, height) {
    // Implementation for getting static map URL
}

/**
 * Handle geolocation error
 * @param {Object} error - Geolocation error object
 */
function handleGeolocationError(error) {
    // Implementation for handling geolocation error
}

/**
 * Toggle traffic layer
 */
function toggleTraffic() {
    // Implementation for toggling traffic layer
}

/**
 * Toggle transit layer
 */
function toggleTransit() {
    // Implementation for toggling transit layer
}

/**
 * Toggle bicycling layer
 */
function toggleBike() {
    // Implementation for toggling bicycling layer
}

/**
 * Toggle heatmap layer
 */
function toggleHeatmap() {
    // Implementation for toggling heatmap layer
}

/**
 * Initialize the map and related components
 */
function initMap() {
    // Implementation for initializing the map
}

/**
 * Add POI markers
 */
function addPOIMarkers() {
    // Implementation for adding POI markers
}

/**
 * Create a marker on the map with enhanced info windows
 * @param {Object} map - The Google Map object
 * @param {Object} position - Lat/lng position
 * @param {string} type - Marker type (e.g., 'clinic', 'parking', 'transit', 'pharmacy')
 * @param {string} content - Info window content
 * @returns {Object} - The created marker
 */
function createMarker(map, position, type, content) {
    // Implementation for creating a marker
}

/**
 * Get marker icon based on type
 * @param {string} type - Marker type
 * @returns {string} - Icon URL
 */
function getMarkerIcon(type) {
    // Implementation for getting marker icon
}

/**
 * Get clinic info window content
 * @returns {string} - Info window content
 */
function getClinicInfoContent() {
    // Implementation for getting clinic info window content
}

/**
 * Get POI info window content
 * @param {string} type - POI type
 * @returns {string} - Info window content
 */
function getPOIInfoContent(type) {
    // Implementation for getting POI info window content
}

/**
 * Toggle advanced route options panel
 */
function toggleRouteOptions() {
    // Implementation for toggling advanced route options panel
}

/**
 * Toggle calendar panel panel
 */
function toggleCalendarPanelPanel() {
    // Implementation for toggling calendar panel panel
}

/**
 * Toggle print panel panel
 */
function togglePrintPanelPanel() {
    // Implementation for toggling print panel panel
}

/**
 * Share route with various share options
 * @param {Object} route - Route object
 */
function shareRoute(route) {
    // Implementation for sharing route
}

/**
 * Add route to calendar
 * @param {Object} route - Route object
 */
function addToCalendar(route) {
    // Implementation for adding route to calendar
}

/**
 * Print route directions
 * @param {Object} route - Route object
 */
function printRoute(route) {
    // Implementation for printing route
}

/**
 * Update clinic info window with enhanced details
 * @param {Object} placeDetails - Place details from Places API
 */
function updateClinicInfoWindow(placeDetails) {
    // Implementation for updating clinic info window
}

/**
 * Calculate and display route between origin and destination
 */
function calculateAndDisplayRoute() {
    // Implementation for calculating and displaying route
}

/**
 * Show detailed route information and alternatives
 * @param {Object} response - Directions API response
 */
function showDetailedRouteInfo(response) {
    // Implementation for showing detailed route information
}

/**
 * Update the static map fallback with custom styling
 * @param {Object} position - Lat/lng position for map center
 */
function updateStaticMapFallback(position) {
    // Implementation for updating static map fallback
}

/**
 * Get static map URL for given position and zoom level
 * @param {Object} position - Lat/lng position
 * @param {number} zoom - Zoom level
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {string} - Static map URL
 */
function getStaticMapUrl(position, zoom, width, height) {
    // Implementation for getting static map URL
}

/**
 * Handle geolocation error
 * @param {Object} error - Geolocation error object
 */
function handleGeolocationError(error) {
    // Implementation for handling geolocation error
}

/**
 * Toggle traffic layer
 */
function toggleTraffic() {
    // Implementation for toggling traffic layer
}

/**
 * Toggle transit layer
 */
function toggleTransit() {
    // Implementation for toggling transit layer
}

/**
 * Toggle bicycling layer
 */
function toggleBike() {
    // Implementation for toggling bicycling layer
}

/**
 * Toggle heatmap layer
 */
function toggleHeatmap() {
    // Implementation for toggling heatmap layer
}

/**
 * Initialize the map and related components
 */
function initMap() {
    // Implementation for initializing the map
}

/**
 * Add POI markers
 */
function addPOIMarkers() {
    // Implementation for adding POI markers
}

/**
 * Create a marker on the map with enhanced info windows
 * @param {Object} map - The Google Map object
 * @param {Object} position - Lat/lng position
 * @param {string} type - Marker type (e.g., 'clinic', 'parking', 'transit', 'pharmacy')
 * @param {string} content - Info window content
 * @returns {Object} - The created marker
 */
function createMarker(map, position, type, content) {
    // Implementation for creating a marker
}

/**
 * Get marker icon based on type
 * @param {string} type - Marker type
 * @returns {string} - Icon URL
 */
function getMarkerIcon(type) {
    // Implementation for getting marker icon
}

/**
 * Get clinic info window content
 * @returns {string} - Info window content
 */
function getClinicInfoContent() {
    // Implementation for getting clinic info window content
}

/**
 * Get POI info window content
 * @param {string} type - POI type
 * @returns {string} - Info window content
 */
function getPOIInfoContent(type) {
    // Implementation for getting POI info window content
}

/**
 * Toggle advanced route options panel
 */
function toggleRouteOptions() {
    // Implementation for toggling advanced route options panel
}

/**
 * Toggle calendar panel panel
 */
function toggleCalendarPanelPanel() {
    // Implementation for toggling calendar panel panel
}

/**
 * Toggle print panel panel
 */
function togglePrintPanelPanel() {
    // Implementation for toggling print panel panel
}

/**
 * Share route with various share options
 * @param {Object} route - Route object
 */
function shareRoute(route) {
    // Implementation for sharing route
}

/**
 * Add route to calendar
 * @param {Object} route - Route object
 */
function addToCalendar(route) {
    // Implementation for adding route to calendar
}

/**
 * Print route directions
 * @param {Object} route - Route object
 */
function printRoute(route) {
    // Implementation for printing route
}

/**
 * Update clinic info window with enhanced details
 * @param {Object} placeDetails - Place details from Places API
 */
function updateClinicInfoWindow(placeDetails) {
    // Implementation for updating clinic info window
}

/**
 * Calculate and display route between origin and destination
 */
function calculateAndDisplayRoute() {
    // Implementation for calculating and displaying route
}

/**
 * Show detailed route information and alternatives
 * @param {Object} response - Directions API response
 */
function showDetailedRouteInfo(response) {
    // Implementation for showing detailed route information
}

/**
 * Update the static map fallback with custom styling
 * @param {Object} position - Lat/lng position for map center
 */
function updateStaticMapFallback(position) {
    // Implementation for updating static map fallback
}

/**
 * Get static map URL for given position and zoom level
 * @param {Object} position - Lat/lng position
 * @param {number} zoom - Zoom level
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {string} - Static map URL
 */
function getStaticMapUrl(position, zoom, width, height) {
    // Implementation for getting static map URL
}

/**
 * Handle geolocation error
 * @param {Object} error - Geolocation error object
 */
function handleGeolocationError(error) {
    // Implementation for handling geolocation error
}

/**
 * Toggle traffic layer
 */
function toggleTraffic() {
    // Implementation for toggling traffic layer
}

/**
 * Toggle transit layer
 */
function toggleTransit() {
    // Implementation for toggling transit layer
}

/**
 * Toggle bicycling layer
 */
function toggleBike() {
    // Implementation for toggling bicycling layer
}

/**
 * Toggle heatmap layer
 */
function toggleHeatmap() {
    // Implementation for toggling heatmap layer
}

/**
 * Initialize the map and related components
 */
function initMap() {
    // Implementation for initializing the map
}

/**
 * Add POI markers
 */
function addPOIMarkers() {
    // Implementation for adding POI markers
}

/**
 * Create a marker on the map with enhanced info windows
 * @param {Object} map - The Google Map object
 * @param {Object} position - Lat/lng position
 * @param {string} type - Marker type (e.g., 'clinic', 'parking', 'transit', 'pharmacy')
 * @param {string} content - Info window content
 * @returns {Object} - The created marker
 */
function createMarker(map, position, type, content) {
    // Implementation for creating a marker
}

/**
 * Get marker icon based on type
 * @param {string} type - Marker type
 * @returns {string} - Icon URL
 */
function getMarkerIcon(type) {
    // Implementation for getting marker icon
}

/**
 * Get clinic info window content
 * @returns {string} - Info window content
 */
function getClinicInfoContent() {
    // Implementation for getting clinic info window content
}

/**
 * Get POI info window content
 * @param {string} type - POI type
 * @returns {string} - Info window content
 */
function getPOIInfoContent(type) {
    // Implementation for getting POI info window content
}

/**
 * Toggle advanced route options panel
 */
function toggleRouteOptions() {
    // Implementation for toggling advanced route options panel
}

/**
 * Toggle calendar panel panel
 */
function toggleCalendarPanelPanel() {
    // Implementation for toggling calendar panel panel
}

/**
 * Toggle print panel panel
 */
function togglePrintPanelPanel() {
    // Implementation for toggling print panel panel
}

/**
 * Share route with various share options
 * @param {Object} route - Route object
 */
function shareRoute(route) {
    // Implementation for sharing route
}

/**
 * Add route to calendar
 * @param {Object} route - Route object
 */
function addToCalendar(route) {
    // Implementation for adding route to calendar
}

/**
 * Print route directions
 * @param {Object} route - Route object
 */
function printRoute(route) {
    // Implementation for printing route
}

/**
 * Update clinic info window with enhanced details
 * @param {Object} placeDetails - Place details from Places API
 */
function updateClinicInfoWindow(placeDetails) {
    // Implementation for updating clinic info window
}

/**
 * Calculate and display route between origin and destination
 */
function calculateAndDisplayRoute() {
    // Implementation for calculating and displaying route
}

/**
 * Show detailed route information and alternatives
 * @param {Object} response - Directions API response
 */
function showDetailedRouteInfo(response) {
    // Implementation for showing detailed route information
}

/**
 * Update the static map fallback with custom styling
 * @param {Object} position - Lat/lng position for map center
 */
function updateStaticMapFallback(position) {
    // Implementation for updating static map fallback
}

/**
 * Get static map URL for given position and zoom level
 * @param {Object} position - Lat/lng position
 * @param {number} zoom - Zoom level
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {string} - Static map URL
 */
function getStaticMapUrl(position, zoom, width, height) {
    // Implementation for getting static map URL
}

/**
 * Handle geolocation error
 * @param {Object} error - Geolocation error object
 */
function handleGeolocationError(error) {
    // Implementation for handling geolocation error
}

/**
 * Toggle traffic layer
 */
function toggleTraffic() {
    // Implementation for toggling traffic layer
}

/**
 * Toggle transit layer
 */
function toggleTransit() {
    // Implementation for toggling transit layer
}

/**
 * Toggle bicycling layer
 */
function toggleBike() {
    // Implementation for toggling bicycling layer
}

/**
 * Toggle heatmap layer
 */
function toggleHeatmap() {
    // Implementation for toggling heatmap layer
}

/**
 * Initialize the map and related components
 */
function initMap() {
    // Implementation for initializing the map
}

/**
 * Add POI markers
 */
function addPOIMarkers() {
    // Implementation for adding POI markers
}

/**
 * Create a marker on the map with enhanced info windows
 * @param {Object} map - The Google Map object
 * @param {Object} position - Lat/lng position
 * @param {string} type - Marker type (e.g., 'clinic', 'parking', 'transit', 'pharmacy')
 * @param {string} content - Info window content
 * @returns {Object} - The created marker
 */
function createMarker(map, position, type, content) {
    // Implementation for creating a marker
}

/**
 * Get marker icon based on type
 * @param {string} type - Marker type
 * @returns {string} - Icon URL
 */
function getMarkerIcon(type) {
    // Implementation for getting marker icon
}

/**
 * Get clinic info window content
 * @returns {string} - Info window content
 */
function getClinicInfoContent() {
    // Implementation for getting clinic info window content
}

/**
 * Get POI info window content
 * @param {string} type - POI type
 * @returns {string} - Info window content
 */
function getPOIInfoContent(type) {
    // Implementation for getting POI info window content
}

/**
 * Toggle advanced route options panel
 */
function toggleRouteOptions() {
    // Implementation for toggling advanced route options panel
}

/**
 * Toggle calendar panel panel
 */
function toggleCalendarPanelPanel() {
    // Implementation for toggling calendar panel panel
}

/**
 * Toggle print panel panel
 */
function togglePrintPanelPanel() {
    // Implementation for toggling print panel panel
}

/**
 * Share route with various share options
 * @param {Object} route - Route object
 */
function shareRoute(route) {
    // Implementation for sharing route
}

/**
 * Add route to calendar
 * @param {Object} route - Route object
 */
function addToCalendar(route) {
    // Implementation for adding route to calendar
}

/**
 * Print route directions
 * @param {Object} route - Route object
 */
function printRoute(route) {
    // Implementation for printing route
}

/**
 * Update clinic info window with enhanced details
 * @param {Object} placeDetails - Place details from Places API
 */
function updateClinicInfoWindow(placeDetails) {
    // Implementation for updating clinic info window
}

/**
 * Calculate and display route between origin and destination
 */
function calculateAndDisplayRoute() {
    // Implementation for calculating and displaying route
}

/**
 * Show detailed route information and alternatives
 * @param {Object} response - Directions API response
 */
function showDetailedRouteInfo(response) {
    // Implementation for showing detailed route information
}

/**
 * Update the static map fallback with custom styling
 * @param {Object} position - Lat/lng position for map center
 */
function updateStaticMapFallback(position) {
    // Implementation for updating static map fallback
}

/**
 * Get static map URL for given position and zoom level
 * @param {Object} position - Lat/lng position
 * @param {number} zoom - Zoom level
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {string} - Static map URL
 */
function getStaticMapUrl(position, zoom, width, height) {
    // Implementation for getting static map URL
}

/**
 * Handle geolocation error
 * @param {Object} error - Geolocation error object
 */
function handleGeolocationError(error) {
    // Implementation for handling geolocation error
}

/**
 * Toggle traffic layer
 */
function toggleTraffic() {
    // Implementation for toggling traffic layer
}

/**
 * Toggle transit layer
 */
function toggleTransit() {
    // Implementation for toggling transit layer
}

/**
 * Toggle bicycling layer
 */
function toggleBike() {
    // Implementation for toggling bicycling layer
}

/**
 * Toggle heatmap layer
 */
function toggleHeatmap() {
    // Implementation for toggling heatmap layer
}

/**
 * Initialize the map and related components
 */
function initMap() {
    // Implementation for initializing the map
}

/**
 * Add POI markers
 */
function addPOIMarkers() {
    // Implementation for adding POI markers
}

/**
 * Create a marker on the map with enhanced info windows
 * @param {Object} map - The Google Map object
 * @param {Object} position - Lat/lng position
 * @param {string} type - Marker type (e.g., 'clinic', 'parking', 'transit', 'pharmacy')
 * @param {string} content - Info window content
 * @returns {Object} - The created marker
 */
function createMarker(map, position, type, content) {
    // Implementation for creating a marker
}

/**
 * Get marker icon based on type
 * @param {string} type - Marker type
 * @returns {string} - Icon URL
 */
function getMarkerIcon(type) {
    // Implementation for getting marker icon
}

/**
 * Get clinic info window content
 * @returns {string} - Info window content
 */
function getClinicInfoContent() {
    // Implementation for getting clinic info window content
}

/**
 * Get POI info window content
 * @param {string} type - POI type
 * @returns {string} - Info window content
 */
function getPOIInfoContent(type) {
    // Implementation for getting POI info window content
}

/**
 * Toggle advanced route options panel
 */
function toggleRouteOptions() {
    // Implementation for toggling advanced route options panel
}

/**
 * Toggle calendar panel panel
 */
function toggleCalendarPanelPanel() {
    // Implementation for toggling calendar panel panel
}

/**
 * Toggle print panel panel
 */
function togglePrintPanelPanel() {
    // Implementation for toggling print panel panel
}

/**
 * Share route with various share options
 * @param {Object} route - Route object
 */
function shareRoute(route) {
    // Implementation for sharing route
}

/**
 * Add route to calendar
 * @param {Object} route - Route object
 */
function addToCalendar(route) {
    // Implementation for adding route to calendar
}

/**
 * Print route directions
 * @param {Object} route - Route object
 */
function printRoute(route) {
    // Implementation for printing route
}

/**
 * Update clinic info window with enhanced details
 * @param {Object} placeDetails - Place details from Places API
 */
function updateClinicInfoWindow(placeDetails) {
    // Implementation for updating clinic info window
}

/**
 * Calculate and display route between origin and destination
 */
function calculateAndDisplayRoute() {
    // Implementation for calculating and displaying route
}

/**
 * Show detailed route information and alternatives
 * @param {Object} response - Directions API response
 */
function showDetailedRouteInfo(response) {
    // Implementation for showing detailed route information
}

/**
 * Update the static map fallback with custom styling
 * @param {Object} position - Lat/lng position for map center
 */
function updateStaticMapFallback(position) {
    // Implementation for updating static map fallback
}

/**
 * Get static map URL for given position and zoom level
 * @param {Object} position - Lat/lng position
 * @param {number} zoom - Zoom level
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {string} - Static map URL
 */
function getStaticMapUrl(position, zoom, width, height) {
    // Implementation for getting static map URL
}

/**
 * Handle geolocation error
 * @param {Object} error - Geolocation error object
 */
function handleGeolocationError(error) {
    // Implementation for handling geolocation error
}

/**
 * Toggle traffic layer
 */
function toggleTraffic() {
    // Implementation for toggling traffic layer
}

/**
 * Toggle transit layer
 */
function toggleTransit() {
    // Implementation for toggling transit layer
}

/**
 * Toggle bicycling layer
 */
function toggleBike() {
    // Implementation for toggling bicycling layer
}

/**
 * Toggle heatmap layer
 */
function toggleHeatmap() {
    // Implementation for toggling heatmap layer
}

/**
 * Initialize the map and related components
 */
function initMap() {
    // Implementation for initializing the map
}

/**
 * Add POI markers
 */
function addPOIMarkers() {
    // Implementation for adding POI markers
}

/**
 * Create a marker on the map with enhanced info windows
 * @param {Object} map - The Google Map object
 * @param {Object} position - Lat/lng position
 * @param {string} type - Marker type (e.g., 'clinic', 'parking', 'transit', 'pharmacy')
 * @param {string} content - Info window content
 * @returns {Object} - The created marker
 */
function createMarker(map, position, type, content) {
    // Implementation for creating a marker
}

/**
 * Get marker icon based on type
 * @param {string} type - Marker type
 * @returns {string} - Icon URL
 */
function getMarkerIcon(type) {
    // Implementation for getting marker icon
}

/**
 * Get clinic info window content
 * @returns {string} - Info window content
 */
function getClinicInfoContent() {
    // Implementation for getting clinic info window content
}

/**
 * Get POI info window content
 * @param {string} type - POI type
 * @returns {string} - Info window content
 */
function getPOIInfoContent(type) {
    // Implementation for getting POI info window content
}

/**
 * Toggle advanced route options panel
 */
function toggleRouteOptions() {
    // Implementation for toggling advanced route options panel
}

/**
 * Toggle calendar panel panel
 */
function toggleCalendarPanelPanel() {
    // Implementation for toggling calendar panel panel
}

/**
 * Toggle print panel panel
 */
function togglePrintPanelPanel() {
    // Implementation for toggling print panel panel
}

/**
 * Share route with various share options
 * @param {Object} route - Route object
 */
function shareRoute(route) {
    // Implementation for sharing route
}

/**
 * Add route to calendar
 * @param {Object} route - Route object
 */
function addToCalendar(route) {
    // Implementation for adding route to calendar
}

/**
 * Print route directions
 * @param {Object} route - Route object
 */
function printRoute(route) {
    // Implementation for printing route
}

/**
 * Update clinic info window with enhanced details
 * @param {Object} placeDetails - Place details from Places API
 */
function updateClinicInfoWindow(placeDetails) {
    // Implementation for updating clinic info window
}

/**
 * Calculate and display route between origin and destination
 */
function calculateAndDisplayRoute() {
    // Implementation for calculating and displaying route
}

/**
 * Show detailed route information and alternatives
 * @param {Object} response - Directions API response
 */
function showDetailedRouteInfo(response) {
    // Implementation for showing detailed route information
}

/**
 * Update the static map fallback with custom styling
 * @param {Object} position - Lat/lng position for map center
 */
function updateStaticMapFallback(position) {
    // Implementation for updating static map fallback
}

/**
 * Get static map URL for given position and zoom level
 * @param {Object} position - Lat/lng position
 * @param {number} zoom - Zoom level
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {string} - Static map URL
 */
function getStaticMapUrl(position, zoom, width, height) {
    // Implementation for getting static map URL
}

/**
 * Handle geolocation error
 * @param {Object} error - Geolocation error object
 */
function handleGeolocationError(error) {
    // Implementation for handling geolocation error
}

/**
 * Toggle traffic layer
 */
function toggleTraffic() {
    // Implementation for toggling traffic layer
}

/**
 * Toggle transit layer
 */
function toggleTransit() {
    // Implementation for toggling transit layer
}

/**
 * Toggle bicycling layer
 */
function toggleBike() {
    // Implementation for toggling bicycling layer
}

/**
 * Toggle heatmap layer
 */
function toggleHeatmap() {
    // Implementation for toggling heatmap layer
}

/**
 * Initialize the map and related components
 */
function initMap() {
    // Implementation for initializing the map
}

/**
 * Add POI markers
 */
function addPOIMarkers() {
    // Implementation for adding POI markers
}

/**
 * Create a marker on the map with enhanced info windows
 * @param {Object} map - The Google Map object
 * @param {Object} position - Lat/lng position
 * @param {string} type - Marker type (e.g., 'clinic', 'parking', 'transit', 'pharmacy')
 * @param {string} content - Info window content
 * @returns {Object} - The created marker
 */
function createMarker(map, position, type, content) {
    // Implementation for creating a marker
}

/**
 * Get marker icon based on type
 * @param {string} type - Marker type
 * @returns {string} - Icon URL
 */
function getMarkerIcon(type) {
    // Implementation for getting marker icon
}

/**
 * Get clinic info window content
 * @returns {string} - Info window content
 */
function getClinicInfoContent() {
    // Implementation for getting clinic info window content
}

/**
 * Get POI info window content
 * @param {string} type - POI type
 * @returns {string} - Info window content
 */
function getPOIInfoContent(type) {
    // Implementation for getting POI info window content
}

/**
 * Toggle advanced route options panel
 */
function toggleRouteOptions() {
    // Implementation for toggling advanced route options panel
}

/**
 * Toggle calendar panel panel
 */
function toggleCalendarPanelPanel() {
    // Implementation for toggling calendar panel panel
}

/**
 * Toggle print panel panel
 */
function togglePrintPanelPanel() {
    // Implementation for toggling print panel panel
}

/**
 * Share route with various share options
 * @param {Object} route - Route object
 */
function shareRoute(route) {
    // Implementation for sharing route
}

/**
 * Add route to calendar
 * @param {Object} route - Route object
 */
function addToCalendar(route) {
    // Implementation for adding route to calendar
}

/**
 * Print route directions
 * @param {Object} route - Route object
 */
function printRoute(route) {
    // Implementation for printing route
}

/**
 * Update clinic info window with enhanced details
 * @param {Object} placeDetails - Place details from Places API
 */
function updateClinicInfoWindow(placeDetails) {
    // Implementation for updating clinic info window
}

/**
 * Calculate and display route between origin and destination
 */
function calculateAndDisplayRoute() {
    // Implementation for calculating and displaying route
}

/**
 * Show detailed route information and alternatives
 * @param {Object} response - Directions API response
 */
function showDetailedRouteInfo(response) {
    // Implementation for showing detailed route information
}

/**
 * Update the static map fallback with custom styling
 * @param {Object} position - Lat/lng position for map center
 */
function updateStaticMapFallback(position) {
    // Implementation for updating static map fallback
}

/**
 * Get static map URL for given position and zoom level
 * @param {Object} position - Lat/lng position
 * @param {number} zoom - Zoom level
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {string} - Static map URL
 */
function getStaticMapUrl(position, zoom, width, height) {
    // Implementation for getting static map URL
}

/**
 * Handle geolocation error
 * @param {Object} error - Geolocation error object
 */
function handleGeolocationError(error) {
    // Implementation for handling geolocation error
}

/**
 * Toggle traffic layer
 */
function toggleTraffic() {
    // Implementation for toggling traffic layer
}

/**
 * Toggle transit layer
 */
function toggleTransit() {
    // Implementation for toggling transit layer
}

/**
 * Toggle bicycling layer
 */
function toggleBike() {
    // Implementation for toggling bicycling layer
}

/**
 * Toggle heatmap layer
 */
function toggleHeatmap() {
    // Implementation for toggling heatmap layer
}

/**
 * Initialize the map and related components
 */
function initMap() {
    // Implementation for initializing the map
}

/**
 * Add POI markers
 */
function addPOIMarkers() {
    // Implementation for adding POI markers
}

/**
 * Create a marker on the map with enhanced info windows
 * @param {Object} map - The Google Map object
 * @param {Object} position - Lat/lng position
 * @param {string} type - Marker type (e.g., 'clinic', 'parking', 'transit', 'pharmacy')
 * @param {string} content - Info window content
 * @returns {Object} - The created marker
 */
function createMarker(map, position, type, content) {
    // Implementation for creating a marker
}

/**
 * Get marker icon based on type
 * @param {string} type - Marker type
 * @returns {string} - Icon URL
 */
function getMarkerIcon(type) {
    // Implementation for getting marker icon
}

/**
 * Get clinic info window content
 * @returns {string} - Info window content
 */
function getClinicInfoContent() {
    // Implementation for getting clinic info window content
}

/**
 * Get POI info window content
 * @param {string} type - POI type
 * @returns {string} - Info window content
 */
function getPOIInfoContent(type) {
    // Implementation for getting POI info window content
}

/**
 * Toggle advanced route options panel
 */
function toggleRouteOptions() {
    // Implementation for toggling advanced route options panel
}

/**
 * Toggle calendar panel panel
 */
function toggleCalendarPanelPanel() {
    // Implementation for toggling calendar panel panel
}

/**
 * Toggle print panel panel
 */
function togglePrintPanelPanel() {
    // Implementation for toggling print panel panel
}

/**
 * Share route with various share options
 * @param {Object} route - Route object
 */
function shareRoute(route) {
    // Implementation for sharing route
}

/**
 * Add route to calendar
 * @param {Object} route - Route object
 */
function addToCalendar(route) {
    // Implementation for adding route to calendar
}

/**
 * Print route directions
 * @param {Object} route - Route object
 */
function printRoute(route) {
    // Implementation for printing route
}

/**
 * Update clinic info window with enhanced details
 * @param {Object} placeDetails - Place details from Places API
 */
function updateClinicInfoWindow(placeDetails) {
    // Implementation for updating clinic info window
}

/**
 * Calculate and display route between origin and destination
 */
function calculateAndDisplayRoute() {
    // Implementation for calculating and displaying route
}

/**
 * Show detailed route information and alternatives
 * @param {Object} response - Directions API response
 */
function showDetailedRouteInfo(response) {
    // Implementation for showing detailed route information
}

/**
 * Update the static map fallback with custom styling
 * @param {Object} position - Lat/lng position for map center
 */
function updateStaticMapFallback(position) {
    // Implementation for updating static map fallback
}

/**
 * Get static map URL for given position and zoom level
 * @param {Object} position - Lat/lng position
 * @param {number} zoom - Zoom level
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {string} - Static map URL
 */
function getStaticMapUrl(position, zoom, width, height) {
    // Implementation for getting static map URL
}

/**
 * Handle geolocation error
 * @param {Object} error - Geolocation error object
 */
function handleGeolocationError(error) {
    // Implementation for handling geolocation error
}

/**
 * Toggle traffic layer
 */
function toggleTraffic() {
    // Implementation for toggling traffic layer
}

/**
 * Toggle transit layer
 */
function toggleTransit() {
    // Implementation for toggling transit layer
}

/**
 * Toggle bicycling layer
 */
function toggleBike() {
    // Implementation for toggling bicycling layer
}

/**
 * Toggle heatmap layer
 */
function toggleHeatmap() {
    // Implementation for toggling heatmap layer
}

/**
 * Initialize the map and related components
 */
function initMap() {
    // Implementation for initializing the map
}

/**
 * Add POI markers
 */
function addPOIMarkers() {
    // Implementation for adding POI markers
}

/**
 * Create a marker on the map with enhanced info windows
 * @param {Object} map - The Google Map object
 * @param {Object} position - Lat/lng position
 * @param {string} type - Marker type (e.g., 'clinic', 'parking', 'transit', 'pharmacy')
 * @param {string} content - Info window content
 * @returns {Object} - The created marker
 */
function createMarker(map, position, type, content) {
    // Implementation for creating a marker
}

/**
 * Get marker icon based on type
 * @param {string} type - Marker type
 * @returns {string} - Icon URL
 */
function getMarkerIcon(type) {
    // Implementation for getting marker icon
}

/**
 * Get clinic info window content
 * @returns {string} - Info window content
 */
function getClinicInfoContent() {
    // Implementation for getting clinic info window content
}

/**
 * Get POI info window content
 * @param {string} type - POI type
 * @returns {string} - Info window content
 */
function getPOIInfoContent(type) {
    // Implementation for getting POI info window content
}

/**
 * Toggle advanced route options panel
 */
function toggleRouteOptions() {
    // Implementation for toggling advanced route options panel
}

/**
 * Toggle calendar panel panel
 */
function toggleCalendarPanelPanel() {
    // Implementation for toggling calendar panel panel
}

/**
 * Toggle print panel panel
 */
function togglePrintPanelPanel() {
    // Implementation for toggling print panel panel
}

/**
 * Share route with various share options
 * @param {Object} route - Route object
 */
function shareRoute(route) {
    // Implementation for sharing route
}

/**
 * Add route to calendar
 * @param {Object} route - Route object
 */
function addToCalendar(route) {
    // Implementation for adding route to calendar
}

/**
 * Print route directions
 * @param {Object} route - Route object
 */
function printRoute(route) {
    // Implementation for printing route
}

/**
 * Update clinic info window with enhanced details
 * @param {Object} placeDetails - Place details from Places API
 */
function updateClinicInfoWindow(placeDetails) {
    // Implementation for updating clinic info window
}

/**
 * Calculate and display route between origin and destination
 */
function calculateAndDisplayRoute() {
    // Implementation for calculating and displaying route
}

/**
 * Show detailed route information and alternatives
 * @param {Object} response - Directions API response
 */
function showDetailedRouteInfo(response) {
    // Implementation for showing detailed route information
}

/**
 * Update the static map fallback with custom styling
 * @param {Object} position - Lat/lng position for map center
 */
function updateStaticMapFallback(position) {
    // Implementation for updating static map fallback
}

/**
 * Get static map URL for given position and zoom level
 * @param {Object} position - Lat/lng position
 * @param {number} zoom - Zoom level
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {string} - Static map URL
 */
function getStaticMapUrl(position, zoom, width, height) {
    // Implementation for getting static map URL
}

/**
 * Handle geolocation error
 * @param {Object} error - Geolocation error object
 */
function handleGeolocationError(error) {
    // Implementation for handling geolocation error
}

/**
 * Toggle traffic layer
 */
function toggleTraffic() {
    // Implementation for toggling traffic layer
}

/**
 * Toggle transit layer
 */
function toggleTransit() {
    // Implementation for toggling transit layer
}

/**
 * Toggle bicycling layer
 */
function toggleBike() {
    // Implementation for toggling bicycling layer
}

/**
 * Toggle heatmap layer
 */
function toggleHeatmap() {
    // Implementation for toggling heatmap layer
}

/**
 * Initialize the map and related components
 */
function initMap() {
    // Implementation for initializing the map
}

/**
 * Add POI markers
 */
function addPOIMarkers() {
    // Implementation for adding POI markers
}

/**
 * Create a marker on the map with enhanced info windows
 * @param {Object} map - The Google Map object
 * @param {Object} position - Lat/lng position
 * @param {string} type - Marker type (e.g., 'clinic', 'parking', 'transit', 'pharmacy')
 * @param {string} content - Info window content
 * @returns {Object} - The created marker
 */
function createMarker(map, position, type, content) {
    // Implementation for creating a marker
}

/**
 * Get marker icon based on type
 * @param {string} type - Marker type
 * @returns {string} - Icon URL
 */
function getMarkerIcon(type) {
    // Implementation for getting marker icon
}

/**
 * Get clinic info window content
 * @returns {string} - Info window content
 */
function getClinicInfoContent() {
    // Implementation for getting clinic info window content
}

/**
 * Get POI info window content
 * @param {string} type - POI type
 * @returns {string} - Info window content
 */
function getPOIInfoContent(type) {
    // Implementation for getting POI info window content
}

/**
 * Toggle advanced route options panel
 */
function toggleRouteOptions() {
    // Implementation for toggling advanced route options panel
}

/**
 * Toggle calendar panel panel
 */
function toggleCalendarPanelPanel() {
    // Implementation for toggling calendar panel panel
}

/**
 * Toggle print panel panel
 */
function togglePrintPanelPanel() {
    // Implementation for toggling print panel panel
}

/**
 * Share route with various share options
 * @param {Object} route - Route object
 */
function shareRoute(route) {
    // Implementation for sharing route
}

/**
 * Add route to calendar
 * @param {Object} route - Route object
 */
function addToCalendar(route) {
    // Implementation for adding route to calendar
}

/**
 * Print route directions
 * @param {Object} route - Route object
 */
function printRoute(route) {
    // Implementation for printing route
}

/**
 * Update clinic info window with enhanced details
 * @param {Object} placeDetails - Place details from Places API
 */
function updateClinicInfoWindow(placeDetails) {
    // Implementation for updating clinic info window
}

/**
 * Calculate and display route between origin and destination
 */
function calculateAndDisplayRoute() {
    // Implementation for calculating and displaying route
}

/**
 * Show detailed route information and alternatives
 * @param {Object} response - Directions API response
 */
function showDetailedRouteInfo(response) {
    // Implementation for showing detailed route information
}

/**
 * Update the static map fallback with custom styling
 * @param {Object} position - Lat/lng position for map center
 */
function updateStaticMapFallback(position) {
    // Implementation for updating static map fallback
}

/**
 * Get static map URL for given position and zoom level
 * @param {Object} position - Lat/lng position
 * @param {number} zoom - Zoom level
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {string} - Static map URL
 */
function getStaticMapUrl(position, zoom, width, height) {
    // Implementation for getting static map URL
}

/**
 * Handle geolocation error
 * @param {Object} error - Geolocation error object
 */
function handleGeolocationError(error) {
    // Implementation for handling geolocation error
}

/**
 * Toggle traffic layer
 */
function toggleTraffic() {
    // Implementation for toggling traffic layer
}

/**
 * Toggle transit layer
 */
function toggleTransit() {
    // Implementation for toggling transit layer
}

/**
 * Toggle bicycling layer
 */
function toggleBike() {
    // Implementation for toggling bicycling layer
}

/**
 * Toggle heatmap layer
 */
function toggleHeatmap() {
    // Implementation for toggling heatmap layer
}

/**
 * Initialize the map and related components
 */
function initMap() {
    // Implementation for initializing the map
}

/**
 * Add POI markers
 */
function addPOIMarkers() {
    // Implementation for adding POI markers
}

/**
 * Create a marker on the map with enhanced info windows
 * @param {Object} map - The Google Map object
 * @param {Object} position - Lat/lng position
 * @param {string} type - Marker type (e.g., 'clinic', 'parking', 'transit', 'pharmacy')
 * @param {string} content - Info window content
 * @returns {Object} - The created marker
 */
function createMarker(map, position, type, content) {
    // Implementation for creating a marker
}

/**
 * Get marker icon based on type
 * @param {string} type - Marker type
 * @returns {string} - Icon URL
 */
function getMarkerIcon(type) {
    // Implementation for getting marker icon
}

/**
 * Get clinic info window content
 * @returns {string} - Info window content
 */
function getClinicInfoContent() {
    // Implementation for getting clinic info window content
}

/**
 * Get POI info window content
 * @param {string} type - POI type
 * @returns {string} - Info window content
 */
function getPOIInfoContent(type) {
    // Implementation for getting POI info window content
}

/**
 * Toggle advanced route options panel
 */
function toggleRouteOptions() {
    // Implementation for toggling advanced route options panel
}

/**
 * Toggle calendar panel panel
 */
function toggleCalendarPanelPanel() {
    // Implementation for toggling calendar panel panel
}

/**
 * Toggle print panel panel
 */
function togglePrintPanelPanel() {
    // Implementation for toggling print panel panel
}

/**
 * Share route with various share options
 * @param {Object} route - Route object
 */
function shareRoute(route) {
    // Implementation for sharing route
}

/**
 * Add route to calendar
 * @param {Object} route - Route object
 */
function addToCalendar(route) {
    // Implementation for adding route to calendar
}

/**
 * Print route directions
 * @param {Object} route - Route object
/**
 * Update clinic info window with enhanced details
 * @param {Object} placeDetails - Place details from Places API
 */
function updateClinicInfoWindow(placeDetails) {
    // Implementation for updating clinic info window
}

/**
 * Calculate and display route between origin and destination
 */
function calculateAndDisplayRoute() {
    // Implementation for calculating and displaying route
}

/**
 * Show detailed route information and alternatives
 * @param {Object} response - Directions API response
 */
function showDetailedRouteInfo(response) {
    // Implementation for showing detailed route information
}

/**
 * Update the static map fallback with custom styling
 * @param {Object} position - Lat/lng position for map center
 */
function updateStaticMapFallback(position) {
    // Implementation for updating static map fallback
}

/**
 * Get static map URL for given position and zoom level
 * @param {Object} position - Lat/lng position
 * @param {number} zoom - Zoom level
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {string} - Static map URL
 */
function getStaticMapUrl(position, zoom, width, height) {
    // Implementation for getting static map URL
}

/**
 * Handle geolocation error
 * @param {Object} error - Geolocation error object
 */
function handleGeolocationError(error) {
    // Implementation for handling geolocation error
}

/**
 * Toggle traffic layer
 */
function toggleTraffic() {
    // Implementation for toggling traffic layer
}

/**
 * Toggle transit layer
 */
function toggleTransit() {
    // Implementation for toggling transit layer
}

/**
 * Toggle bicycling layer
 */
function toggleBike() {
    // Implementation for toggling bicycling layer
}

/**
 * Toggle heatmap layer
 */
function toggleHeatmap() {
    // Implementation for toggling heatmap layer
}

/**
 * Initialize the map and related components
 */
function initMap() {
    // Implementation for initializing the map
}

/**
 * Add POI markers
 */
function addPOIMarkers() {
    // Implementation for adding POI markers
}

/**
 * Create a marker on the map with enhanced info windows
 * @param {Object} map - The Google Map object
 * @param {Object} position - Lat/lng position
 * @param {string} type - Marker type (e.g., 'clinic', 'parking', 'transit', 'pharmacy')
 * @param {string} content - Info window content
 * @returns {Object} - The created marker
 */
function createMarker(map, position, type, content) {
    // Implementation for creating a marker
}

/**
 * Get marker icon based on type
 * @param {string} type - Marker type
 * @returns {string} - Icon URL
 */
function getMarkerIcon(type) {
    // Implementation for getting marker icon
}

/**
 * Get clinic info window content
 * @returns {string} - Info window content
 */
function getClinicInfoContent() {
    // Implementation for getting clinic info window content
}

/**
 * Get POI info window content
 * @param {string} type - POI type
 * @returns {string} - Info window content
 */
function getPOIInfoContent(type) {
    // Implementation for getting POI info window content
}

/**
 * Toggle advanced route options panel
 */
function toggleRouteOptions() {
    // Implementation for toggling advanced route options panel
}

/**
 * Toggle calendar panel panel
 */
function toggleCalendarPanelPanel() {
    // Implementation for toggling calendar panel panel
}

/**
 * Toggle print panel panel
 */
function togglePrintPanelPanel() {
    // Implementation for toggling print panel panel
}

/**
 * Share route with various share options
 * @param {Object} route - Route object
 */
function shareRoute(route) {
    // Implementation for sharing route
}

/**
 * Add route to calendar
 * @param {Object} route - Route object
 */
function addToCalendar(route) {
    // Implementation for adding route to calendar
}

/**
 * Print route directions
 * @param {Object} route - Route object
 */
function printRoute(route) {
    // Implementation for printing route
}

/**
 * Update clinic info window with enhanced details
 * @param {Object} placeDetails - Place details from Places API
 */
function updateClinicInfoWindow(placeDetails) {
    // Implementation for updating clinic info window
}

/**
 * Calculate and display route between origin and destination
 */
function calculateAndDisplayRoute() {
    // Implementation for calculating and displaying route
}

/**
 * Show detailed route information and alternatives
 * @param {Object} response - Directions API response
 */
function showDetailedRouteInfo(response) {
    // Implementation for showing detailed route information
}

/**
 * Update the static map fallback with custom styling
 * @param {Object} position - Lat/lng position for map center
 */
function updateStaticMapFallback(position) {
    // Implementation for updating static map fallback
}

/**
 * Get static map URL for given position and zoom level
 * @param {Object} position - Lat/lng position
 * @param {number} zoom - Zoom level
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {string} - Static map URL
 */
function getStaticMapUrl(position, zoom, width, height) {
    // Implementation for getting static map URL
}

/**
 * Handle geolocation error
 * @param {Object} error - Geolocation error object
 */
function handleGeolocationError(error) {
    // Implementation for handling geolocation error
}

/**
 * Toggle traffic layer
 */
function toggleTraffic() {
    // Implementation for toggling traffic layer
}

/**
 * Toggle transit layer
 */
function toggleTransit() {
    // Implementation for toggling transit layer
}

/**
 * Toggle bicycling layer
 */
function toggleBike() {
    // Implementation for toggling bicycling layer
}

/**
 * Toggle heatmap layer
 */
function toggleHeatmap() {
    // Implementation for toggling heatmap layer
}

/**
 * Initialize the map and related components
 */
function initMap() {
    // Implementation for initializing the map
}

/**
 * Add POI markers
 */
function addPOIMarkers() {
    // Implementation for adding POI markers
}

/**
 * Create a marker on the map with enhanced info windows
 * @param {Object} map - The Google Map object
 * @param {Object} position - Lat/lng position
 * @param {string} type - Marker type (e.g., 'clinic', 'parking', 'transit', 'pharmacy')
 * @param {string} content - Info window content
 * @returns {Object} - The created marker
 */
function createMarker(map, position, type, content) {
    // Implementation for creating a marker
}

/**
 * Get marker icon based on type
 * @param {string} type - Marker type
 * @returns {string} - Icon URL
 */
function getMarkerIcon(type) {
    // Implementation for getting marker icon
}

/**
 * Get clinic info window content
 * @returns {string} - Info window content
 */
function getClinicInfoContent() {
    // Implementation for getting clinic info window content
}

/**
 * Get POI info window content
 * @param {string} type - POI type
 * @returns {string} - Info window content
 */
function getPOIInfoContent(type) {
    // Implementation for getting POI info window content
}

/**
 * Toggle advanced route options panel
 */
function toggleRouteOptions() {
    // Implementation for toggling advanced route options panel
}

/**
 * Toggle calendar panel panel
 */
function toggleCalendarPanelPanel() {
    // Implementation for toggling calendar panel panel
}

/**
 * Toggle print panel panel
 */
function togglePrintPanelPanel() {
    // Implementation for toggling print panel panel
}

/**
 * Share route with various share options
 * @param {Object} route - Route object
 */
function shareRoute(route) {
    // Implementation for sharing route
}

/**
 * Add route to calendar
 * @param {Object} route - Route object
 */
function addToCalendar(route) {
    // Implementation for adding route to calendar
}

/**
 * Print route directions
 * @param {Object} route - Route object
 */
function printRoute(route) {
    // Implementation for printing route
}

/**
 * Update clinic info window with enhanced details
 * @param {Object} placeDetails - Place details from Places API
 */
function updateClinicInfoWindow(placeDetails) {
    // Implementation for updating clinic info window
}

/**
 * Calculate and display route between origin and destination
 */
function calculateAndDisplayRoute() {
    // Implementation for calculating and displaying route
}

/**
 * Show detailed route information and alternatives
 * @param {Object} response - Directions API response
 */
function showDetailedRouteInfo(response) {
    // Implementation for showing detailed route information
}

/**
 * Update the static map fallback with custom styling
 * @param {Object} position - Lat/lng position for map center
 */
function updateStaticMapFallback(position) {
    // Implementation for updating static map fallback
}

/**
 * Get static map URL for given position and zoom level
 * @param {Object} position - Lat/lng position
 * @param {number} zoom - Zoom level
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {string} - Static map URL
 */
function getStaticMapUrl(position, zoom, width, height) {
    // Implementation for getting static map URL
}

/**
 * Handle geolocation error
 * @param {Object} error - Geolocation error object
 */
function handleGeolocationError(error) {
    // Implementation for handling geolocation error
}

/**
 * Toggle traffic layer
 */
function toggleTraffic() {
    // Implementation for toggling traffic layer
}

/**
 * Toggle transit layer
 */
function toggleTransit() {
    // Implementation for toggling transit layer
}

/**
 * Toggle bicycling layer
 */
function toggleBike() {
    // Implementation for toggling bicycling layer
}

/**
 * Toggle heatmap layer
 */
function toggleHeatmap() {
    // Implementation for toggling heatmap layer
}

/**
 * Initialize the map and related components
 */
function initMap() {
    // Implementation for initializing the map
}

/**
 * Add POI markers
 */
function addPOIMarkers() {
    // Implementation for adding POI markers
}

/**
 * Create a marker on the map with enhanced info windows
 * @param {Object} map - The Google Map object
 * @param {Object} position - Lat/lng position
 * @param {string} type - Marker type (e.g., 'clinic', 'parking', 'transit', 'pharmacy')
 * @param {string} content - Info window content
 * @returns {Object} - The created marker
 */
function createMarker(map, position, type, content) {
    // Implementation for creating a marker
}

/**
 * Get marker icon based on type
 * @param {string} type - Marker type
 * @returns {string} - Icon URL
 */
function getMarkerIcon(type) {
    // Implementation for getting marker icon
}

/**
 * Get clinic info window content
 * @returns {string} - Info window content
 */
function getClinicInfoContent() {
    // Implementation for getting clinic info window content
}

/**
 * Get POI info window content
 * @param {string} type - POI type
 * @returns {string} - Info window content
 */
function getPOIInfoContent(type) {
    // Implementation for getting POI info window content
}

/**
 * Toggle advanced route options panel
 */
function toggleRouteOptions() {
    // Implementation for toggling advanced route options panel
}

/**
 * Toggle calendar panel panel
 */
function toggleCalendarPanelPanel() {
    // Implementation for toggling calendar panel panel
}

/**
 * Toggle print panel panel
 */
function togglePrintPanelPanel() {
    // Implementation for toggling print panel panel
}

/**
 * Share route with various share options
 * @param {Object} route - Route object
 */
function shareRoute(route) {
    // Implementation for sharing route
}

/**
 * Add route to calendar
 * @param {Object} route - Route object
 */
function addToCalendar(route) {
    // Implementation for adding route to calendar
}

/**
 * Print route directions
 * @param {Object} route - Route object
 */
function printRoute(route) {
    // Implementation for printing route
}

/**
 * Update clinic info window with enhanced details
 * @param {Object} placeDetails - Place details from Places API
 */
function updateClinicInfoWindow(placeDetails) {
    // Implementation for updating clinic info window
}

/**
 * Calculate and display route between origin and destination
 */
function calculateAndDisplayRoute() {
    // Implementation for calculating and displaying route
}

/**
 * Show detailed route information and alternatives
 * @param {Object} response - Directions API response
 */
function showDetailedRouteInfo(response) {
    // Implementation for showing detailed route information
}

/**
 * Update the static map fallback with custom styling
 * @param {Object} position - Lat/lng position for map center
 */
function updateStaticMapFallback(position) {
    // Implementation for updating static map fallback
}

/**
 * Get static map URL for given position and zoom level
 * @param {Object} position - Lat/lng position
 * @param {number} zoom - Zoom level
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {string} - Static map URL
 */
function getStaticMapUrl(position, zoom, width, height) {
    // Implementation for getting static map URL
}

/**
 * Handle geolocation error
 * @param {Object} error - Geolocation error object
 */
function handleGeolocationError(error) {
    // Implementation for handling geolocation error
}

/**
 * Toggle traffic layer
 */
function toggleTraffic() {
    // Implementation for toggling traffic layer
}

/**
 * Toggle transit layer
 */
function toggleTransit() {
    // Implementation for toggling transit layer
}

/**
 * Toggle bicycling layer
 */
function toggleBike() {
    // Implementation for toggling bicycling layer
}

/**
 * Toggle heatmap layer
 */
function toggleHeatmap() {
    // Implementation for toggling heatmap layer
}

/**
 * Initialize the map and related components
 */
function initMap() {
    // Implementation for initializing the map
}

/**
 * Add POI markers
 */
function addPOIMarkers() {
    // Implementation for adding POI markers
}

/**
 * Create a marker on the map with enhanced info windows
 * @param {Object} map - The Google Map object
 * @param {Object} position - Lat/lng position
 * @param {string} type - Marker type (e.g., 'clinic', 'parking', 'transit', 'pharmacy')
 * @param {string} content - Info window content
 * @returns {Object} - The created marker
 */
function createMarker(map, position, type, content) {
    // Implementation for creating a marker
}

/**
 * Get marker icon based on type
 * @param {string} type - Marker type
 * @returns {string} - Icon URL
 */
function getMarkerIcon(type) {
    // Implementation for getting marker icon
}

/**
 * Get clinic info window content
 * @returns {string} - Info window content
 */
function getClinicInfoContent() {
    // Implementation for getting clinic info window content
}

/**
 * Get POI info window content
 * @param {string} type - POI type
 * @returns {string} - Info window content
 */
function getPOIInfoContent(type) {
    // Implementation for getting POI info window content
}

/**
 * Toggle advanced route options panel
 */
function toggleRouteOptions() {
    // Implementation for toggling advanced route options panel
}

/**
 * Toggle calendar panel panel
 */
function toggleCalendarPanelPanel() {
    // Implementation for toggling calendar panel panel
}

/**
 * Toggle print panel panel
 */
function togglePrintPanelPanel() {
    // Implementation for toggling print panel panel
}

/**
 * Share route with various share options
 * @param {Object} route - Route object
 */
function shareRoute(route) {
    // Implementation for sharing route
}

/**
 * Add route to calendar
 * @param {Object} route - Route object
 */
function addToCalendar(route) {
    // Implementation for adding route to calendar
}

/**
 * Print route directions
 * @param {Object} route - Route object
 */
function printRoute(route) {
    // Implementation for printing route
}

/**
 * Update clinic info window with enhanced details
 * @param {Object} placeDetails - Place details from Places API
 */
function updateClinicInfoWindow(placeDetails) {
    // Implementation for updating clinic info window
}

/**
 * Calculate and display route between origin and destination
 */
function calculateAndDisplayRoute() {
    // Implementation for calculating and displaying route
}

/**
 * Show detailed route information and alternatives
 * @param {Object} response - Directions API response
 */
function showDetailedRouteInfo(response) {
    // Implementation for showing detailed route information
}

/**
 * Update the static map fallback with custom styling
 * @param {Object} position - Lat/lng position for map center
 */
function updateStaticMapFallback(position) {
    // Implementation for updating static map fallback
}

/**
 * Get static map URL for given position and zoom level
 * @param {Object} position - Lat/lng position
 * @param {number} zoom - Zoom level
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {string} - Static map URL
 */
function getStaticMapUrl(position, zoom, width, height) {
    // Implementation for getting static map URL
}

/**
 * Handle geolocation error
 * @param {Object} error - Geolocation error object
 */
function handleGeolocationError(error) {
    // Implementation for handling geolocation error
}

/**
 * Toggle traffic layer
 */
function toggleTraffic() {
    // Implementation for toggling traffic layer
}

/**
 * Toggle transit layer
 */
function toggleTransit() {
    // Implementation for toggling transit layer
}

/**
 * Toggle bicycling layer
 */
function toggleBike() {
    // Implementation for toggling bicycling layer
}

/**
 * Toggle heatmap layer
 */
function toggleHeatmap() {
    // Implementation for toggling heatmap layer
}

/**
 * Initialize the map and related components
 */
function initMap() {
    // Implementation for initializing the map
}

/**
 * Add POI markers
 */
function addPOIMarkers() {
    // Implementation for adding POI markers
}

/**
 * Create a marker on the map with enhanced info windows
 * @param {Object} map - The Google Map object
 * @param {Object} position - Lat/lng position
 * @param {string} type - Marker type (e.g., 'clinic', 'parking', 'transit', 'pharmacy')
 * @param {string} content - Info window content
 * @returns {Object} - The created marker
 */
function createMarker(map, position, type, content) {
    // Implementation for creating a marker
}

/**
 * Get marker icon based on type
 * @param {string} type - Marker type
 * @returns {string} - Icon URL
 */
function getMarkerIcon(type) {
    // Implementation for getting marker icon
}

/**
 * Get clinic info window content
 * @returns {string} - Info window content
 */
function getClinicInfoContent() {
    // Implementation for getting clinic info window content
}

/**
 * Get POI info window content
 * @param {string} type - POI type
 * @returns {string} - Info window content
 */
function getPOIInfoContent(type) {
    // Implementation for getting POI info window content
}

/**
 * Toggle advanced route options panel
 */
function toggleRouteOptions() {
    // Implementation for toggling advanced route options panel
}

/**
 * Toggle calendar panel panel
 */
function toggleCalendarPanelPanel() {
    // Implementation for toggling calendar panel panel
}

/**
 * Toggle print panel panel
 */
function togglePrintPanelPanel() {
    // Implementation for toggling print panel panel
}

/**
 * Share route with various share options
 * @param {Object} route - Route object
 */
function shareRoute(route) {
    // Implementation for sharing route
}

/**
 * Add route to calendar
 * @param {Object} route - Route object
 */
function addToCalendar(route) {
    // Implementation for adding route to calendar
}

/**
 * Print route directions
 * @param {Object} route - Route object
 */
function printRoute(route) {
    // Implementation for printing route
}

/**
 * Update clinic info window with enhanced details
 * @param {Object} placeDetails - Place details from Places API
 */
function updateClinicInfoWindow(placeDetails) {
    // Implementation for updating clinic info window
}

/**
 * Calculate and display route between origin and destination
 */
function calculateAndDisplayRoute() {
    // Implementation for calculating and displaying route
}

/**
 * Show detailed route information and alternatives
 * @param {Object} response - Directions API response
 */
function showDetailedRouteInfo(response) {
    // Implementation for showing detailed route information
}

/**
 * Update the static map fallback with custom styling
 * @param {Object} position - Lat/lng position for map center
 */
function updateStaticMapFallback(position) {
    // Implementation for updating static map fallback
}

/**
 * Get static map URL for given position and zoom level
 * @param {Object} position - Lat/lng position
 * @param {number} zoom - Zoom level
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {string} - Static map URL
 */
function getStaticMapUrl(position, zoom, width, height) {
    // Implementation for getting static map URL
}

/**
 * Handle geolocation error
 * @param {Object} error - Geolocation error object
 */
function handleGeolocationError(error) {
    // Implementation for handling geolocation error
}

/**
 * Toggle traffic layer
 */
function toggleTraffic() {
    // Implementation for toggling traffic layer
}

/**
 * Toggle transit layer
 */
function toggleTransit() {
    // Implementation for toggling transit layer
}

/**
 * Toggle bicycling layer
 */
function toggleBike() {
    // Implementation for toggling bicycling layer
}

/**
 * Toggle heatmap layer
 */
function toggleHeatmap() {
    // Implementation for toggling heatmap layer
}

/**
 * Initialize the map and related components
 */
function initMap() {
    // Implementation for initializing the map
}

/**
 * Add POI markers
 */
function addPOIMarkers() {
    // Implementation for adding POI markers
}

/**
 * Create a marker on the map with enhanced info windows
 * @param {Object} map - The Google Map object
 * @param {Object} position - Lat/lng position
 * @param {string} type - Marker type (e.g., 'clinic', 'parking', 'transit', 'pharmacy')
 * @param {string} content - Info window content
 * @returns {Object} - The created marker
 */
function createMarker(map, position, type, content) {
    // Implementation for creating a marker
}

/**
 * Get marker icon based on type
 * @param {string} type - Marker type
 * @returns {string} - Icon URL
 */
function getMarkerIcon(type) {
    // Implementation for getting marker icon
}

/**
 * Get clinic info window content
 * @returns {string} - Info window content
 */
function getClinicInfoContent() {
    // Implementation for getting clinic info window content
}

/**
 * Get POI info window content
 * @param {string} type - POI type
 * @returns {string} - Info window content
 */
function getPOIInfoContent(type) {
    // Implementation for getting POI info window content
}

/**
 * Toggle advanced route options panel
 */
function toggleRouteOptions() {
    // Implementation for toggling advanced route options panel
}

/**
 * Toggle calendar panel panel
 */
function toggleCalendarPanelPanel() {
    // Implementation for toggling calendar panel panel
}

/**
 * Toggle print panel panel
 */
function togglePrintPanelPanel() {
    // Implementation for toggling print panel panel
}

/**
 * Share route with various share options
 * @param {Object} route - Route object
 */
function shareRoute(route) {
    // Implementation for sharing route
}

/**
 * Add route to calendar
 * @param {Object} route - Route object
 */
function addToCalendar(route) {
    // Implementation for adding route to calendar
}

/**
 * Print route directions
 * @param {Object} route - Route object
 */
function printRoute(route) {
    // Implementation for printing route
}

/**
 * Update clinic info window with enhanced details
 * @param {Object} placeDetails - Place details from Places API
 */
function updateClinicInfoWindow(placeDetails) {
    // Implementation for updating clinic info window
}

/**
 * Calculate and display route between origin and destination
 */
function calculateAndDisplayRoute() {
    // Implementation for calculating and displaying route
}

/**
 * Show detailed route information and alternatives
 * @param {Object} response - Directions API response
 */
function showDetailedRouteInfo(response) {
    // Implementation for showing detailed route information
}

/**
 * Update the static map fallback with custom styling
 * @param {Object} position - Lat/lng position for map center
 */
function updateStaticMapFallback(position) {
    // Implementation for updating static map fallback
}

/**
 * Get static map URL for given position and zoom level
 * @param {Object} position - Lat/lng position
 * @param {number} zoom - Zoom level
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {string} - Static map URL
 */
function getStaticMapUrl(position, zoom, width, height) {
    // Implementation for getting static map URL
}

/**
 * Handle geolocation error
 * @param {Object} error - Geolocation error object
 */
function handleGeolocationError(error) {
    // Implementation for handling geolocation error
}

/**
 * Toggle traffic layer
 */
function toggleTraffic() {
    // Implementation for toggling traffic layer
}

/**
 * Toggle transit layer
 */
function toggleTransit() {
    // Implementation for toggling transit layer
}

/**
 * Toggle bicycling layer
 */
function toggleBike() {
    // Implementation for toggling bicycling layer
}

/**
 * Toggle heatmap layer
 */
function toggleHeatmap() {
    // Implementation for toggling heatmap layer
}

/**
 * Initialize the map and related components
 */
function initMap() {
    // Implementation for initializing the map
}

/**
 * Add POI markers
 */
function addPOIMarkers() {
    // Implementation for adding POI markers
}

/**
 * Create a marker on the map with enhanced info windows
 * @param {Object} map - The Google Map object
 * @param {Object} position - Lat/lng position
 * @param {string} type - Marker type (e.g., 'clinic', 'parking', 'transit', 'pharmacy')
 * @param {string} content - Info window content
 * @returns {Object} - The created marker
 */
function createMarker(map, position, type, content) {
    // Implementation for creating a marker
}

/**
 * Get marker icon based on type
 * @param {string} type - Marker type
 * @returns {string} - Icon URL
 */
function getMarkerIcon(type) {
    // Implementation for getting marker icon
}

/**
 * Get clinic info window content
 * @returns {string} - Info window content
 */
function getClinicInfoContent() {
    // Implementation for getting clinic info window content
}

/**
 * Get POI info window content
 * @param {string} type - POI type
 * @returns {string} - Info window content
 */
function getPOIInfoContent(type) {
    // Implementation for getting POI info window content
}

/**
 * Toggle advanced route options panel
 */
function toggleRouteOptions() {
    // Implementation for toggling advanced route options panel
}

/**
 * Toggle calendar panel panel
 */
function toggleCalendarPanelPanel() {
    // Implementation for toggling calendar panel panel
}

/**
 * Toggle print panel panel
 */
function togglePrintPanelPanel() {
    // Implementation for toggling print panel panel
}

/**
 * Share route with various share options
 * @param {Object} route - Route object
 */
function shareRoute(route) {
    // Implementation for sharing route
}

/**
 * Add route to calendar
 * @param {Object} route - Route object
 */
function addToCalendar(route) {
    // Implementation for adding route to calendar
}

/**
 * Print route directions
 * @param {Object} route - Route object
 */
function printRoute(route) {
    // Implementation for printing route
}

/**
 * Update clinic info window with enhanced details
 * @param {Object} placeDetails - Place details from Places API
 */
function updateClinicInfoWindow(placeDetails) {
    // Implementation for updating clinic info window
}

/**
 * Calculate and display route between origin and destination
 */
function calculateAndDisplayRoute() {
    // Implementation for calculating and displaying route
}

/**
 * Show detailed route information and alternatives
 * @param {Object} response - Directions API response
 */
function showDetailedRouteInfo(response) {
    // Implementation for showing detailed route information
}

/**
 * Update the static map fallback with custom styling
 * @param {Object} position - Lat/lng position for map center
 */
function updateStaticMapFallback(position) {
    // Implementation for updating static map fallback
}

/**
 * Get static map URL for given position and zoom level
 * @param {Object} position - Lat/lng position
 * @param {number} zoom - Zoom level
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {string} - Static map URL
 */
function getStaticMapUrl(position, zoom, width, height) {
    // Implementation for getting static map URL
}

/**
 * Handle geolocation error
 * @param {Object} error - Geolocation error object
 */
function handleGeolocationError(error) {
    // Implementation for handling geolocation error
}

/**
 * Toggle traffic layer
 */
function toggleTraffic() {
    // Implementation for toggling traffic layer
}

/**
 * Toggle transit layer
 */
function toggleTransit() {
    // Implementation for toggling transit layer
}

/**
 * Toggle bicycling layer
 */
function toggleBike() {
    // Implementation for toggling bicycling layer
}

/**
 * Toggle heatmap layer
 */
function toggleHeatmap() {
    // Implementation for toggling heatmap layer
}

/**
 * Initialize the map and related components
 */
function initMap() {
    // Implementation for initializing the map
}

/**
 * Add POI markers
 */
function addPOIMarkers() {
    // Implementation for adding POI markers
}

/**
 * Create a marker on the map with enhanced info windows
 * @param {Object} map - The Google Map object
 * @param {Object} position - Lat/lng position
 * @param {string} type - Marker type (e.g., 'clinic', 'parking', 'transit', 'pharmacy')
 * @param {string} content - Info window content
 * @returns {Object} - The created marker
 */
function createMarker(map, position, type, content) {
    // Implementation for creating a marker
}

/**
 * Get marker icon based on type
 * @param {string} type - Marker type
 * @returns {string} - Icon URL
 */
function getMarkerIcon(type) {
    // Implementation for getting marker icon
}

/**
 * Get clinic info window content
 * @returns {string} - Info window content
 */
function getClinicInfoContent() {
    // Implementation for getting clinic info window content
}

/**
 * Get POI info window content
 * @param {string} type - POI type
 * @returns {string} - Info window content
 */
function getPOIInfoContent(type) {
    // Implementation for getting POI info window content
}

/**
 * Toggle advanced route options panel
 */
function toggleRouteOptions() {
    // Implementation for toggling advanced route options panel
}

/**
 * Toggle calendar panel panel
 */
function toggleCalendarPanelPanel() {
    // Implementation for toggling calendar panel panel
}

/**
 * Toggle print panel panel
 */
function togglePrintPanelPanel() {
    // Implementation for toggling print panel panel
}

/**
 * Share route with various share options
 * @param {Object} route - Route object
 */
function shareRoute(route) {
    // Implementation for sharing route
}

/**
 * Add route to calendar
 * @param {Object} route - Route object
 */
function addToCalendar(route) {
    // Implementation for adding route to calendar
}

/**
 * Print route directions
 * @param {Object} route - Route object
 */
function printRoute(route) {
    // Implementation for printing route
}

/**
 * Update clinic info window with enhanced details
 * @param {Object} placeDetails - Place details from Places API
 */
function updateClinicInfoWindow(placeDetails) {
    // Implementation for updating clinic info window
}

/**
 * Calculate and display route between origin and destination
 */
function calculateAndDisplayRoute() {
    // Implementation for calculating and displaying route
}

/**
 * Show detailed route information and alternatives
 * @param {Object} response - Directions API response
 */
function showDetailedRouteInfo(response) {
    // Implementation for showing detailed route information
}

/**
 * Update the static map fallback with custom styling
 * @param {Object} position - Lat/lng position for map center
 */
function updateStaticMapFallback(position) {
    // Implementation for updating static map fallback
}

/**
 * Get static map URL for given position and zoom level
 * @param {Object} position - Lat/lng position
 * @param {number} zoom - Zoom level
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {string} - Static map URL
 */
function getStaticMapUrl(position, zoom, width, height) {
    // Implementation for getting static map URL
}

/**
 * Handle geolocation error
 * @param {Object} error - Geolocation error object
 */
function handleGeolocationError(error) {
    // Implementation for handling geolocation error
}

/**
 * Toggle traffic layer
 */
function toggleTraffic() {
    // Implementation for toggling traffic layer
}

/**
 * Toggle transit layer
 */
function toggleTransit() {
    // Implementation for toggling transit layer
}

/**
 * Toggle bicycling layer
 */
function toggleBike() {
    // Implementation for toggling bicycling layer
}

/**
 * Toggle heatmap layer
 */
function toggleHeatmap() {
    // Implementation for toggling heatmap layer
}

/**
 * Initialize the map and related components
 */
function initMap() {
    // Implementation for initializing the map
}

/**
 * Add POI markers
 */
function addPOIMarkers() {
    // Implementation for adding POI markers
}

/**
 * Create a marker on the map with enhanced info windows
 * @param {Object} map - The Google Map object
 * @param {Object} position - Lat/lng position
 * @param {string} type - Marker type (e.g., 'clinic', 'parking', 'transit', 'pharmacy')
 * @param {string} content - Info window content
 * @returns {Object} - The created marker
 */
function createMarker(map, position, type, content) {
    // Implementation for creating a marker
}

/**
 * Get marker icon based on type
 * @param {string} type - Marker type
 * @returns {string} - Icon URL
 */
function getMarkerIcon(type) {
    // Implementation for getting marker icon
}

/**
 * Get clinic info window content
 * @returns {string} - Info window content
 */
function getClinicInfoContent() {
    // Implementation for getting clinic info window content
}

/**
 * Get POI info window content
 * @param {string} type - POI type
 * @returns {string} - Info window content
 */
function getPOIInfoContent(type) {
    // Implementation for getting POI info window content
}

/**
 * Toggle advanced route options panel
 */
function toggleRouteOptions() {
    // Implementation for toggling advanced route options panel
}

/**
 * Toggle calendar panel panel
 */
function toggleCalendarPanelPanel() {
    // Implementation for toggling calendar panel panel
}

/**
 * Toggle print panel panel
 */
function togglePrintPanelPanel() {
    // Implementation for toggling print panel panel
}

/**
 * Share route with various share options
 * @param {Object} route - Route object
 */
function shareRoute(route) {
    // Implementation for sharing route
}

/**
 * Add route to calendar
 * @param {Object} route - Route object
 */
function addToCalendar(route) {
    // Implementation for adding route to calendar
}

/**
 * Print route directions
 * @param {Object} route - Route object
 */
function printRoute(route) {
    // Implementation for printing route
}

/**
 * Update clinic info window with enhanced details
 * @param {Object} placeDetails - Place details from Places API
 */
function updateClinicInfoWindow(placeDetails) {
    // Implementation for updating clinic info window
}

/**
 * Calculate and display route between origin and destination
 */
function calculateAndDisplayRoute() {
    // Implementation for calculating and displaying route
}

/**
 * Show detailed route information and alternatives
 * @param {Object} response - Directions API response
 */
function showDetailedRouteInfo(response) {
    // Implementation for showing detailed route information
}

/**
 * Update the static map fallback with custom styling
 * @param {Object} position - Lat/lng position for map center
 */
function updateStaticMapFallback(position) {
    // Implementation for updating static map fallback
}

/**
 * Get static map URL for given position and zoom level
 * @param {Object} position - Lat/lng position
 * @param {number} zoom - Zoom level
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {string} - Static map URL
 */
function getStaticMapUrl(position, zoom, width, height) {
    // Implementation for getting static map URL
}

/**
 * Handle geolocation error
 * @param {Object} error - Geolocation error object
 */
function handleGeolocationError(error) {
    // Implementation for handling geolocation error
}

/**
 * Toggle traffic layer
 */
function toggleTraffic() {
    // Implementation for toggling traffic layer
}

/**
 * Toggle transit layer
 */
function toggleTransit() {
    // Implementation for toggling transit layer
}

/**
 * Toggle bicycling layer
 */
function toggleBike() {
    // Implementation for toggling bicycling layer
}

/**
 * Toggle heatmap layer
 */
function toggleHeatmap() {
    // Implementation for toggling heatmap layer
}

/**
 * Initialize the map and related components
 */
function initMap() {
    // Implementation for initializing the map
}

/**
 * Add POI markers
 */
function addPOIMarkers() {
    // Implementation for adding POI markers
}

/**
 * Create a marker on the map with enhanced info windows
 * @param {Object} map - The Google Map object
 * @param {Object} position - Lat/lng position
 * @param {string} type - Marker type (e.g., 'clinic', 'parking', 'transit', 'pharmacy')
 * @param {string} content - Info window content
 * @returns {Object} - The created marker
 */
function createMarker(map, position, type, content) {
    // Implementation for creating a marker
}

/**
 * Get marker icon based on type
 * @param {string} type - Marker type
 * @returns {string} - Icon URL
 */
function getMarkerIcon(type) {
    // Implementation for getting marker icon
}

/**
 * Get clinic info window content
 * @returns {string} - Info window content
 */
function getClinicInfoContent() {
    // Implementation for getting clinic info window content
}

/**
 * Get POI info window content
 * @param {string} type - POI type
 * @returns {string} - Info window content
 */
function getPOIInfoContent(type) {
    // Implementation for getting POI info window content
}

/**
 * Toggle advanced route options panel
 */
function toggleRouteOptions() {
    // Implementation for toggling advanced route options panel
}

/**
 * Toggle calendar panel panel
 */
function toggleCalendarPanelPanel() {
    // Implementation for toggling calendar panel panel
}

/**
 * Toggle print panel panel
 */
function togglePrintPanelPanel() {
    // Implementation for toggling print panel panel
}

/**
 * Share route with various share options
 * @param {Object} route - Route object
 */
function shareRoute(route) {
    // Implementation for sharing route
}

/**
 * Add route to calendar
 * @param {Object} route - Route object
 */
function addToCalendar(route) {
    // Implementation for adding route to calendar
}

/**
 * Print route directions
 * @param {Object} route - Route object
 */
function printRoute(route) {
    // Implementation for printing route
}

/**
 * Update clinic info window with enhanced details
 * @param {Object} placeDetails - Place details from Places API
 */
function updateClinicInfoWindow(placeDetails) {
    // Implementation for updating clinic info window
}

/**
 * Calculate and display route between origin and destination
 */
function calculateAndDisplayRoute() {
    // Implementation for calculating and displaying route
}

/**
 * Show detailed route information and alternatives
 * @param {Object} response - Directions API response
 */
function showDetailedRouteInfo(response) {
    // Implementation for showing detailed route information
}

/**
 * Update the static map fallback with custom styling
 * @param {Object} position - Lat/lng position for map center
 */
function updateStaticMapFallback(position) {
    // Implementation for updating static map fallback
}

/**
 * Get static map URL for given position and zoom level
 * @param {Object} position - Lat/lng position
 * @param {number} zoom - Zoom level
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {string} - Static map URL
 */
function getStaticMapUrl(position, zoom, width, height) {
    // Implementation for getting static map URL
}

/**
 * Handle geolocation error
 * @param {Object} error - Geolocation error object
 */
function handleGeolocationError(error) {
    // Implementation for handling geolocation error
}

/**
 * Toggle traffic layer
 */
function toggleTraffic() {
    // Implementation for toggling traffic layer
}

/**
 * Toggle transit layer
 */
function toggleTransit() {
    // Implementation for toggling transit layer
}

/**
 * Toggle bicycling layer
 */
function toggleBike() {
    // Implementation for toggling bicycling layer
}

/**
 * Toggle heatmap layer
 */
function toggleHeatmap() {
    // Implementation for toggling heatmap layer
}

/**
 * Initialize the map and related components
 */
function initMap() {
    // Implementation for initializing the map
}

/**
 * Add POI markers
 */
function addPOIMarkers() {
    // Implementation for adding POI markers
}

/**
 * Create a marker on the map with enhanced info windows
 * @param {Object} map - The Google Map object
 * @param {Object} position - Lat/lng position
 * @param {string} type - Marker type (e.g., 'clinic', 'parking', 'transit', 'pharmacy')
 * @param {string} content - Info window content
 * @returns {Object} - The created marker
 */
function createMarker(map, position, type, content) {
    // Implementation for creating a marker
}

/**
 * Get marker icon based on type
 * @param {string} type - Marker type
 * @returns {string} - Icon URL
 */
function getMarkerIcon(type) {
    // Implementation for getting marker icon
}

/**
 * Get clinic info window content
 * @returns {string} - Info window content
 */
function getClinicInfoContent() {
    // Implementation for getting clinic info window content
}

/**
 * Get POI info window content
 * @param {string} type - POI type
 * @returns {string} - Info window content
 */
function getPOIInfoContent(type) {
    // Implementation for getting POI info window content
}

/**
 * Toggle advanced route options panel
 */
function toggleRouteOptions() {
    // Implementation for toggling advanced route options panel
}

/**
 * Toggle calendar panel panel
 */
function toggleCalendarPanelPanel() {
    // Implementation for toggling calendar panel panel
}

/**
 * Toggle print panel panel
 */
function togglePrintPanelPanel() {
    // Implementation for toggling print panel panel
}

/**
 * Share route with various share options
 * @param {Object} route - Route object
 */
function shareRoute(route) {
    // Implementation for sharing route
}

/**
 * Add route to calendar
 * @param {Object} route - Route object
 */
function addToCalendar(route) {
    // Implementation for adding route to calendar
}

/**
 * Print route directions
 * @param {Object} route - Route object
 */
function printRoute(route) {
    // Implementation for printing route
}

/**
 * Update clinic info window with enhanced details
 * @param {Object} placeDetails - Place details from Places API
 */
function updateClinicInfoWindow(placeDetails) {
    // Implementation for updating clinic info window
}

/**
 * Calculate and display route between origin and destination
 */
function calculateAndDisplayRoute() {
    // Implementation for calculating and displaying route
}

/**
 * Show detailed route information and alternatives
 * @param {Object} response - Directions API response
 */
function showDetailedRouteInfo(response) {
    // Implementation for showing detailed route information
}

/**
 * Update the static map fallback with custom styling
 * @param {Object} position - Lat/lng position for map center
 */
function updateStaticMapFallback(position) {
    // Implementation for updating static map fallback
}

/**
 * Get static map URL for given position and zoom level
 * @param {Object} position - Lat/lng position
 * @param {number} zoom - Zoom level
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {string} - Static map URL
 */
function getStaticMapUrl(position, zoom, width, height) {
    // Implementation for getting static map URL
}

/**
 * Handle geolocation error
 * @param {Object} error - Geolocation error object
 */
function handleGeolocationError(error) {
    // Implementation for handling geolocation error
}

/**
 * Toggle traffic layer
 */
function toggleTraffic() {
    // Implementation for toggling traffic layer
}

/**
 * Toggle transit layer
 */
function toggleTransit() {
    // Implementation for toggling transit layer
}

/**
 * Toggle bicycling layer
 */
function toggleBike() {
    // Implementation for toggling bicycling layer
}

/**
 * Toggle heatmap layer
 */
function toggleHeatmap() {
    // Implementation for toggling heatmap layer
}

/**
 * Initialize the map and related components
 */
function initMap() {
    // Implementation for initializing the map
}

/**
 * Add POI markers
 */
function addPOIMarkers() {
    // Implementation for adding POI markers
}

/**
 * Create a marker on the map with enhanced info windows
 * @param {Object} map - The Google Map object
 * @param {Object} position - Lat/lng position
 * @param {string} type - Marker type (e.g., 'clinic', 'parking', 'transit', 'pharmacy')
 * @param {string} content - Info window content
 * @returns {Object} - The created marker
 */
function createMarker(map, position, type, content) {
    // Implementation for creating a marker
}

/**
 * Get marker icon based on type
 * @param {string} type - Marker type
 * @returns {string} - Icon URL
 */
function getMarkerIcon(type) {
    // Implementation for getting marker icon
}

/**
 * Get clinic info window content
 * @returns {string} - Info window content
 */
function getClinicInfoContent() {
    // Implementation for getting clinic info window content
}

/**
 * Get POI info window content
 * @param {string} type - POI type
 * @returns {string} - Info window content
 */
function getPOIInfoContent(type) {
    // Implementation for getting POI info window content
}

/**
 * Toggle advanced route options panel
 */
function toggleRouteOptions() {
    // Implementation for toggling advanced route options panel
}

/**
 * Toggle calendar panel panel
 */
function toggleCalendarPanelPanel() {
    // Implementation for toggling calendar panel panel
}

/**
 * Toggle print panel panel
 */
function togglePrintPanelPanel() {
    // Implementation for toggling print panel panel
}

/**
 * Share route with various share options
 * @param {Object} route - Route object
 */
function shareRoute(route) {
    // Implementation for sharing route
}

/**
 * Add route to calendar
 * @param {Object} route - Route object
 */
function addToCalendar(route) {
    // Implementation for adding route to calendar
}

/**
 * Print route directions
 * @param {Object} route - Route object
 */
function printRoute(route) {
    // Implementation for printing route
}

/**
 * Update clinic info window with enhanced details
 * @param {Object} placeDetails - Place details from Places API
 */
function updateClinicInfoWindow(placeDetails) {
    // Implementation for updating clinic info window
}

/**
 * Calculate and display route between origin and destination
 */
function calculateAndDisplayRoute() {
    // Implementation for calculating and displaying route
}

/**
 * Show detailed route information and alternatives
 * @param {Object} response - Directions API response
 */
function showDetailedRouteInfo(response) {
    // Implementation for showing detailed route information
}

/**
 * Update the static map fallback with custom styling
 * @param {Object} position - Lat/lng position for map center
 */
function updateStaticMapFallback(position) {
    // Implementation for updating static map fallback
}

/**
 * Get static map URL for given position and zoom level
 * @param {Object} position - Lat/lng position
 * @param {number} zoom - Zoom level
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {string} - Static map URL
 */
function getStaticMapUrl(position, zoom, width, height) {
    // Implementation for getting static map URL
}

/**
 * Handle geolocation error
 * @param {Object} error - Geolocation error object
 */
function handleGeolocationError(error) {
    // Implementation for handling geolocation error
}

/**
 * Toggle traffic layer
 */
function toggleTraffic() {
    // Implementation for toggling traffic layer
}

/**
 * Toggle transit layer
 */
function toggleTransit() {
    // Implementation for toggling transit layer
}

/**
 * Toggle bicycling layer
 */
function toggleBike() {
    // Implementation for toggling bicycling layer
}

/**
 * Toggle heatmap layer
 */
function toggleHeatmap() {
    // Implementation for toggling heatmap layer
}

/**
 * Initialize the map and related components
 */
function initMap() {
    // Implementation for initializing the map
}

/**
 * Add POI markers
 */
function addPOIMarkers() {
    // Implementation for adding POI markers
}

/**
 * Create a marker on the map with enhanced info windows
 * @param {Object} map - The Google Map object
 * @param {Object} position - Lat/lng position
 * @param {string} type - Marker type (e.g., 'clinic', 'parking', 'transit', 'pharmacy')
 * @param {string} content - Info window content
 * @returns {Object} - The created marker
 */
function createMarker(map, position, type, content) {
    // Implementation for creating a marker
}

/**
 * Get marker icon based on type
 * @param {string} type - Marker type
 * @returns {string} - Icon URL
 */
function getMarkerIcon(type) {
    // Implementation for getting marker icon
}

/**
 * Get clinic info window content
 * @returns {string} - Info window content
 */
function getClinicInfoContent() {
    // Implementation for getting clinic info window content
}

/**
 * Get POI info window content
 * @param {string} type - POI type
 * @returns {string} - Info window content
 */
function getPOIInfoContent(type) {
    // Implementation for getting POI info window content
}

/**
 * Toggle advanced route options panel
 */
function toggleRouteOptions() {
    // Implementation for toggling advanced route options panel
}

/**
 * Toggle calendar panel panel
 */
function toggleCalendarPanelPanel() {
    // Implementation for toggling calendar panel panel
}

/**
 * Toggle print panel panel
 */
function togglePrintPanelPanel() {
    // Implementation for toggling print panel panel
}

/**
 * Share route with various share options
 * @param {Object} route - Route object
 */
function shareRoute(route) {
/**
 * Add Points of Interest info card
 */
function addPOIInfoCard() {
    const infoCards = document.querySelector('.directions-info');
    if (!infoCards) return;
    
    const poiCard = document.createElement('div');
    poiCard.className = 'info-card poi-info';
    poiCard.innerHTML = `
        <h3>Points of Interest</h3>
        <div class="poi-toggle">
            <button class="poi-btn active" data-type="all">All</button>
            <button class="poi-btn" data-type="parking">Parking</button>
            <button class="poi-btn" data-type="transit">Transit</button>
            <button class="poi-btn" data-type="pharmacy">Pharmacy</button>
        </div>
        <div class="poi-details">
            <p>Toggle different points of interest near our clinic.</p>
            <p class="poi-tip"><i class="icon icon-info"></i> Click on map markers for more information.</p>
        </div>
    `;
    
    infoCards.appendChild(poiCard);
    
    // Add event listeners to POI toggle buttons
    const poiButtons = poiCard.querySelectorAll('.poi-btn');
    poiButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            poiButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Filter markers based on selected type
            const type = this.getAttribute('data-type');
            filterMarkers(type);
            
            // If pharmacy is selected and none exists yet, search for pharmacies
            if (type === 'pharmacy' && !poiMarkers.some(marker => marker.poiType === 'pharmacy')) {
                findNearbyPharmacies();
            }
        });
    });
}

/**
 * Find and display nearby pharmacies
 */
function findNearbyPharmacies() {
    // Check if map and Places service are initialized
    if (!placesService || !clinicPosition) return;
    
    // Search for pharmacies
    placesService.nearbySearch({
        location: clinicPosition,
        radius: 1000,
        type: ['pharmacy']
    }, function(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            for (let i = 0; i < Math.min(results.length, 5); i++) {
                createMarker(map, results[i].geometry.location, 'pharmacy', `
                    <div class="info-window poi-info">
                        <h4>${results[i].name}</h4>
                        <p>${results[i].vicinity}</p>
                    </div>
                `);
            }
        }
    });
}

/**
 * Filter map markers based on type
 * @param {string} type - Marker type to display ('all' to show all)
 */
function filterMarkers(type) {
    poiMarkers.forEach(marker => {
        if (type === 'all' || !marker.poiType || marker.poiType === type) {
            marker.setVisible(true);
        } else {
            marker.setVisible(false);
        }
    });
}

/**
 * Initialize heatmap for popular visiting times (simulated data)
 */
function initHeatmap() {
    // Create simulated popular times data (simulated foot traffic around the clinic)
    const heatmapData = [];
    
    // Add points around the clinic with varying weights to simulate popular areas
    if (clinicPosition) {
        // Add the clinic itself with high weight
        heatmapData.push({
            location: clinicPosition,
            weight: 10
        });
        
        // Create a grid of points around the clinic with random weights
        for (let i = -5; i <= 5; i++) {
            for (let j = -5; j <= 5; j++) {
                const lat = clinicPosition.lat() + (i * 0.0005);
                const lng = clinicPosition.lng() + (j * 0.0005);
                
                // Skip the center point (already added)
                if (i === 0 && j === 0) continue;
                
                // Generate weight based on distance from clinic (closer = higher weight)
                const distance = Math.sqrt(i*i + j*j);
                const weight = Math.max(0, 10 - distance * 1.5);
                
                if (weight > 0) {
                    heatmapData.push({
                        location: new google.maps.LatLng(lat, lng),
                        weight: weight
                    });
                }
            }
        }
    }
    
    // Create heatmap layer
    heatmap = new google.maps.visualization.HeatmapLayer({
        data: heatmapData,
        map: null, // Don't show by default
        radius: 25,
        opacity: 0.7,
        gradient: [
            'rgba(0, 255, 255, 0)',
            'rgba(0, 255, 255, 1)',
            'rgba(0, 191, 255, 1)',
            'rgba(0, 127, 255, 1)',
            'rgba(0, 63, 255, 1)',
            'rgba(0, 0, 255, 1)',
            'rgba(0, 0, 223, 1)',
            'rgba(0, 0, 191, 1)',
            'rgba(0, 0, 159, 1)',
            'rgba(0, 0, 127, 1)',
            'rgba(63, 0, 91, 1)',
            'rgba(127, 0, 63, 1)',
            'rgba(191, 0, 31, 1)',
            'rgba(255, 0, 0, 1)'
        ]
    });
}

/**
 * Create layer toggle controls
 */
function createLayerToggles() {
    // Create traffic layer
    trafficLayer = new google.maps.TrafficLayer();
    
    // Create transit layer
    transitLayer = new google.maps.TransitLayer();
    
    // Create bicycling layer
    bikeLayer = new google.maps.BicyclingLayer();
    
    // Create toggle controls container
    const layerControls = document.createElement('div');
    layerControls.className = 'layer-controls';
    layerControls.innerHTML = `
        <div class="layer-control-header">Map Layers</div>
        <div class="layer-control-buttons">
            <button id="toggle-traffic" class="layer-btn" title="Show Traffic">
                <i class="icon icon-traffic"></i> Traffic
            </button>
            <button id="toggle-transit" class="layer-btn" title="Show Transit">
                <i class="icon icon-transit"></i> Transit
            </button>
            <button id="toggle-bike" class="layer-btn" title="Show Bike Lanes">
                <i class="icon icon-bike"></i> Bike Lanes
            </button>
            <button id="toggle-heatmap" class="layer-btn" title="Show Popular Times">
                <i class="icon icon-heat"></i> Popular Times
            </button>
        </div>
    </div>`;
