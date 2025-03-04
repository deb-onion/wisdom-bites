# Wisdom Bites Dental Clinic - Changelog


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
