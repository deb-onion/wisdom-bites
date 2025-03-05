/**
 * Wisdom Bites Dental Clinic
 * Clinic Data Utility
 * 
 * Central utility for accessing clinic data across all pages
 * Ensures consistent business information is displayed throughout the site
 */

"use strict";

const ClinicDataUtil = {
    /**
     * The cached clinic data
     */
    clinicData: null,
    
    /**
     * Initialize clinic data utility
     */
    init: function() {
        this.loadClinicData();
        console.log('Clinic Data Utility initialized');
    },
    
    /**
     * Load clinic data from JSON script tag
     * @returns {Object} Clinic data object
     */
    loadClinicData: function() {
        if (this.clinicData) {
            return this.clinicData;
        }
        
        const dataScript = document.getElementById('clinic-data');
        if (dataScript) {
            try {
                this.clinicData = JSON.parse(dataScript.textContent);
                return this.clinicData;
            } catch (error) {
                console.warn('Could not parse clinic data:', error);
                return null;
            }
        } else {
            console.warn('Clinic data script tag not found. Make sure it exists in the HTML.');
            return null;
        }
    },
    
    /**
     * Get clinic data
     * @returns {Object} Clinic data object
     */
    getClinicData: function() {
        return this.clinicData || this.loadClinicData();
    },
    
    /**
     * Get clinic name
     * @returns {string} Clinic name
     */
    getClinicName: function() {
        const data = this.getClinicData();
        return data ? data.name : '';
    },
    
    /**
     * Get clinic address
     * @returns {string} Clinic address
     */
    getClinicAddress: function() {
        const data = this.getClinicData();
        return data ? data.address : '';
    },
    
    /**
     * Get clinic phone number
     * @returns {string} Clinic phone number
     */
    getClinicPhone: function() {
        const data = this.getClinicData();
        return data ? data.phone : '';
    },
    
    /**
     * Get clinic operating hours
     * @returns {Array} Clinic operating hours by day
     */
    getClinicHours: function() {
        const data = this.getClinicData();
        return data && data.hours ? data.hours : [];
    },
    
    /**
     * Get clinic services
     * @returns {Array} List of services offered
     */
    getClinicServices: function() {
        const data = this.getClinicData();
        return data && data.services ? data.services : [];
    },
    
    /**
     * Get clinic position (lat/lng)
     * @returns {Object} Latitude and longitude position
     */
    getClinicPosition: function() {
        const data = this.getClinicData();
        return data && data.position ? data.position : null;
    },
    
    /**
     * Get Google Maps Place ID
     * @returns {string} Place ID for Maps API
     */
    getPlaceId: function() {
        const data = this.getClinicData();
        return data ? data.placeId : '';
    },
    
    /**
     * Update DOM elements with clinic data
     * Update all elements with data-clinic-* attributes
     */
    updateDomElements: function() {
        // Update clinic name elements
        document.querySelectorAll('[data-clinic-name]').forEach(el => {
            el.textContent = this.getClinicName();
        });
        
        // Update clinic address elements
        document.querySelectorAll('[data-clinic-address]').forEach(el => {
            el.textContent = this.getClinicAddress();
        });
        
        // Update clinic phone elements
        document.querySelectorAll('[data-clinic-phone]').forEach(el => {
            el.textContent = this.getClinicPhone();
            if (el.tagName === 'A') {
                el.href = 'tel:' + this.getClinicPhone().replace(/\s/g, '');
            }
        });
        
        // Update clinic hours elements
        const hours = this.getClinicHours();
        document.querySelectorAll('[data-clinic-hours]').forEach(el => {
            if (hours.length > 0) {
                el.innerHTML = hours.map(hour => `<li>${hour}</li>`).join('');
            }
        });
        
        // Update clinic services list
        const services = this.getClinicServices();
        document.querySelectorAll('[data-clinic-services]').forEach(el => {
            if (services.length > 0) {
                el.innerHTML = services.map(service => `<li>${service}</li>`).join('');
            }
        });
    }
};

// Initialize the utility when the DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    ClinicDataUtil.init();
    ClinicDataUtil.updateDomElements();
}); 