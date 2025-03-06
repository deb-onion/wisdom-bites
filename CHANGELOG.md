# Wisdom Bites Dental Clinic - Changelog


## [4.3.7] - 2025-03-06

### Patch Update:
- Updated booking system and calendar configuration


## [4.3.6] - 2025-03-06

### Patch Update:
- Fixed booking form issues with negative maxlength values and calendar functionality


## [4.3.5] - 2025-03-06

### Patch Update:
- Fixed booking form issues with negative maxlength values and calendar functionality


## [4.3.4] - 2025-03-06

### Patch Update:
- Updated booking system and calendar configuration


## [4.3.3] - 2025-03-06

### Patch Update:
- Updated booking system and calendar configuration


## [4.3.2] - 2025-03-06

### Patch Update:
- Updated booking system and calendar configuration


## [4.3.1] - 2025-03-06

### Patch Update:
- Updated booking system and calendar configuration


## [4.3.0] - 2025-03-06

### Feature Update:
- Updated booking system and calendar configuration


## [4.2.0] - 2025-03-06

### Feature Update:
- Updated website with centralized clinic data management system


## [4.1.12] - 2025-03-06

### Patch Update:
- Fixed syntax error in directions.js and updated GitHub workflow


## [4.1.11] - 2025-03-06

### Patch Update:
- Fixed syntax error in directions.js and updated GitHub workflow


## [4.1.10] - 2025-03-06

### Patch Update:
- configuration updated


## [4.1.9] - 2025-03-06

### Patch Update:
- Fixed mapsCallback function in virtual-tour.js


## [4.1.8] - 2025-03-06

### Patch Update:
- configuration updated


## [4.1.7] - 2025-03-06

### Patch Update:
- Fixed virtual tour marker issue and improved booking calendar


## [4.1.6] - 2025-03-06

### Patch Update:
- Fixed virtual tour marker issue and improved booking calendar


## [4.1.5] - 2025-03-06

### Patch Update:
- Fixed booking calendar to enable date and time selection


## [4.1.4] - 2025-03-06

### Patch Update:
- Fixed booking calendar to enable date and time selection


## [4.1.3] - 2025-03-06

### Patch Update:
- Added additional security headers and CORS configuration


## [4.1.2] - 2025-03-06

### Patch Update:
- Added additional security headers and CORS configuration


## [4.1.1] - 2025-03-06

### Patch Update:
- Fixed Content Security Policy for Google APIs and Maps


## [4.1.0] - 2025-03-06

### Feature Update:
- Updated website with centralized clinic data management system


## [4.0.0] - 2025-03-06

### Major Update:
- Complete website redesign


## [3.0.10] - 2025-03-06

### Patch Update:
- configuration upfated


## [3.0.9] - 2025-03-04

### Patch Update:
- Updated README.md with accurate information about MIME type configuration, Google Maps integration, media tracking improvements, and folder structure


## [3.0.8] - 2025-03-04

### Patch Update:
- Fixed Get Directions button functionality, added dynamic directions based on user location, and improved error handling


## [3.0.7] - 2025-03-04

### Patch Update:
- Fixed MIME type issues, font loading errors, and enhanced Google Maps integration on contact page
### Media Updates:
- Updated media assets (see media-updates.log for details)


## [3.0.6] - 2025-03-04

### Patch Update:
- Fixed virtual tour location accuracy: Applied direct panorama ID targeting (fGMVDjDFNHlkGSTF-HuMoQ) to ensure Street View opens at the exact dental clinic instead of 'Excellent Tutorial'. Created multi-level fallback system and fixed CSS animation errors.
### Media Updates:
- Updated media assets (see media-updates.log for details)


## [3.0.5] - 2025-03-04

### Patch Update:
- Fixed virtual tour Street View location issue: Implemented direct panorama ID targeting (fGMVDjDFNHlkGsTF-HuMoQ) to ensure the virtual tour always opens at Wisdom Bites Dental Clinic instead of 'Excellent Tutorial'. Added comprehensive fallback strategy with Place ID, coordinate-based, and embedded map options. Fixed CSS animation errors causing console warnings. Created detailed documentation explaining all attempted fixes, their results, and the final successful solution.
### Media Updates:
- Updated media assets (see media-updates.log for details)


## [3.0.4] - 2025-03-04

### Patch Update:
- Fixed virtual tour Street View location issue: Implemented direct panorama ID targeting (fGMVDjDFNHlkGsTF-HuMoQ) to ensure the virtual tour always opens at Wisdom Bites Dental Clinic instead of 'Excellent Tutorial'. Added comprehensive fallback strategy with Place ID, coordinate-based, and embedded map options. Fixed CSS animation errors causing console warnings. Created detailed documentation explaining all attempted fixes, their results, and the final successful solution.
### Media Updates:
- Updated media assets (see media-updates.log for details)


## [3.0.3] - 2025-03-04

### Patch Update:
- Ensured all tour fallbacks use exact clinic location data: Replaced the Static Map API fallback with the embedded Google Maps iframe for reliability, updated clinic data with precise coordinates (22.496391851463255, 88.36915472944189), and ensured all fallback mechanisms refer specifically to Wisdom Bites Dental Clinic at 1/4A, North Road, Poddar Nagar, Jadavpur, Kolkata. Added better styling for embedded maps and updated clinic service information.
### Media Updates:
- Updated media assets (see media-updates.log for details)


## [3.0.2] - 2025-03-04

### Patch Update:
- Fixed virtual tour location accuracy: The Street View was loading at 'Staff Canteen (Aahar Canteen)' instead of the dental clinic due to imprecise coordinates (22.4969, 88.3722) and suboptimal Google Maps Street View initialization. Updated to exact clinic coordinates (22.496391851463255, 88.36915472944189), implemented a three-tier Street View initialization approach that prioritizes Place ID-based lookup, and added helpful navigation prompts and extensive error logging. This ensures visitors see the actual Wisdom Bites Dental Clinic at 1/4A, North Road, Poddar Nagar, Jadavpur, Kolkata.
### Media Updates:
- Updated media assets (see media-updates.log for details)


## [3.0.1] - 2025-03-04

### Patch Update:
- Fixed virtual tour location accuracy: The Street View was loading random locations instead of the clinic because the code was using a suboptimal location search method. Modified initStreetView() to prioritize Place ID-based lookup (which provides exact matching) rather than relying on coordinate-based search. Added a two-tier initialization approach with better error handling and logging to ensure visitors see the actual clinic location at 1/4A, North Road, Poddar Nagar, Jadavpur, Kolkata.
### Media Updates:
- Updated media assets (see media-updates.log for details)


## [3.0.0] - 2025-03-04

### Major Update:
- Major enhancement: Implemented comprehensive virtual tour feature with Google Maps API integration, responsive panorama viewer, interactive hotspots, place info panel, tour progression indicators, completion dialog, and fallback mechanisms. Also fixed CSS compatibility issues and accessibility problems.
### Media Updates:
- Updated media assets (see media-updates.log for details)


## [2.1.0] - 2025-03-04

### Feature Update:
- Added AI_ASSISTANT_GUIDE.md for better AI-assisted debugging and development
### Media Updates:
- Updated media assets (see media-updates.log for details)


## [2.0.3] - 2025-03-04

### Patch Update:
- Updated README with accurate Cloudflare Pages deployment instructions and troubleshooting
### Media Updates:
- Updated media assets (see media-updates.log for details)


## [2.0.2] - 2025-03-04

### Patch Update:
- Updated README with accurate Cloudflare Pages deployment instructions and troubleshooting
### Media Updates:
- Updated media assets (see media-updates.log for details)


## [2.0.1] - 2025-03-04

### Patch Update:
- Cleaned up repository by removing node_modules from Git tracking and adding proper .gitignore file
### Media Updates:
- Updated media assets (see media-updates.log for details)


## [2.0.0] - 2025-03-04

### Major Update:
- Initial website setup
### Media Updates:
- Updated media assets (see media-updates.log for details)

All notable changes to this website will be documented in this file.

## [1.0.0] - 2023-06-15

### Initial Release:
- Created responsive dental clinic website
- Implemented main pages: Home, About, Services, Booking, and Contact
- Added service-specific pages for general dentistry, cosmetic dentistry, and emergency care
- Implemented responsive design with mobile-first approach
- Added performance optimizations and SEO enhancements
- Implemented PWA capabilities with offline support
- Created comprehensive version management system 
