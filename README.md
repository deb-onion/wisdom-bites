# Wisdom Bites Dental Clinic Website

A modern, responsive website for Wisdom Bites Dental Clinic that showcases services, allows appointment booking, and provides essential information to patients.

## 📋 Table of Contents

- [Overview](#overview)
- [What's in This Project](#whats-in-this-project)
- [Features](#features)
  - [Virtual Tour Feature](#virtual-tour-feature)
- [Getting Started](#getting-started)
- [Folder Structure](#folder-structure)
- [How to Update the Website](#how-to-update-the-website)
- [Version Management System](#version-management-system)
- [Cloudflare Deployment](#cloudflare-deployment)
- [Common Issues & Solutions](#common-issues--solutions)
- [Technical Details](#technical-details)
  - [CSS Architecture](#css-architecture)
  - [JavaScript Components](#javascript-components)
  - [API Integrations](#api-integrations)
- [Browser Compatibility](#browser-compatibility)
- [Accessibility Compliance](#accessibility-compliance)
- [Performance Optimizations](#performance-optimizations)
- [Future Enhancements](#future-enhancements)

## 📝 Overview

This is a custom-built dental clinic website featuring:

- **Speed**: Fast-loading pages optimized for all devices
- **SEO**: Search-engine friendly structure and content
- **Accessibility**: WCAG 2.1 AA compliant for users with disabilities
- **Offline Access**: Works even when internet connection is spotty through Service Workers
- **Easy Management**: Simple update system that tracks changes
- **Interactive Features**: Virtual tour, appointment booking, and more
- **Current Version**: 3.0.0 (see [CHANGELOG.md](CHANGELOG.md) for update history)

The site is hosted on Cloudflare for security, speed, and reliability.

## 🧰 What's in This Project

### Main Pages

- **Home** (`index.html`): Introduction to the clinic, services, and virtual tour
- **About** (`about.html`): Information about the clinic and team
- **Services**: 
  - General Dentistry (`services/general-dentistry.html`)
  - Cosmetic Dentistry (`services/cosmetic-dentistry.html`)
  - Emergency Care (`services/emergency-care.html`)
- **Booking** (`booking.html`): Appointment scheduling system
- **Contact** (`contact.html`): Contact form and clinic information
- **FAQ** (`faq.html`): Frequently asked questions with search functionality

### Behind-the-Scenes Features

- **Version Control**: System to track all website changes
- **Media Tracking**: Automatically logs when images or videos are added/changed
- **Automatic Deployment**: Updates go live instantly when approved
- **API Integrations**: Google Maps for virtual tour, appointment booking system
- **Structured Data**: Schema.org markup for enhanced SEO
- **Performance Monitoring**: Built-in analytics for page speed and user interaction

## 🌟 Features

### Virtual Tour Feature

The website includes a comprehensive virtual tour feature (as of version 3.0.0) that allows potential patients to explore the clinic before visiting. This feature includes:

#### Components and Files

- **HTML Structure**: Main container in `index.html` with tour controls and panels
- **CSS Styling**: Dedicated styles in `assets/css/virtual-tour.css`
- **JavaScript Logic**: Core functionality in `assets/js/virtual-tour.js`
- **API Integration**: Google Maps Street View and Places API

#### Key Features

- **Street View Integration**: Explore the clinic's surroundings
- **Interior Panorama View**: View 360° panoramas of the clinic interior
- **Interactive Hotspots**: Clickable points of interest with information
- **Place Info Panel**: Details about the clinic, hours, and reviews
- **Tour Progress Indicators**: Track progress through the virtual tour
- **Responsive Design**: Works on all devices from mobile to desktop
- **Fallback Mechanisms**: Still works if APIs fail to load
- **Completion Dialog**: Prompts for appointment booking after tour

#### Technical Implementation

- **Google Maps API Integration**: 
  - Street View API for exterior views
  - Places API for clinic information
  - Static Maps API as a fallback
- **Local Data Fallback**: Preloaded clinic data in JSON format
- **Responsive Components**: Adapts to various screen sizes
- **Accessible Controls**: Keyboard navigation and screen reader support
- **Performance Optimizations**: Lazy loading of panorama images

#### Usage Instructions

1. Click the "Take a Virtual Tour" button on the homepage
2. Use navigation controls to move around the exterior or interior views
3. Click on hotspots to see information about specific areas
4. Use the "Clinic Info" button to toggle the information panel
5. Complete the tour to see booking options

## 🚀 Getting Started

### First-Time Setup

1. **Clone the Repository**:
   ```
   git clone https://github.com/deb-onion/wisdom-bites.git
   cd wisdom-bites-dental
   ```

2. **Install Required Software**:
   ```
   npm install
   ```
   This installs all the tools needed to run and update the website.

3. **Configure API Keys**:
   - Create a `.env` file in the root directory
   - Add your Google Maps API key: `GOOGLE_MAPS_API_KEY=your_api_key_here`
   - Make sure the API key has the following APIs enabled:
     - Maps JavaScript API
     - Street View API
     - Places API
     - Geocoding API
     - Static Maps API

4. **Start the Local Preview Server**:
   ```
   npm start
   ```
   This lets you view the website on your computer at http://localhost:3000 before it goes live.

5. **Start Media Tracking** (in a separate terminal window):
   ```
   npm run watch
   ```
   This automatically keeps track of any images or videos you add or change.

### Deployment Setup

The website is already configured to deploy automatically to Cloudflare Pages. The setup includes:

1. **GitHub Integration**: Changes pushed to the main branch trigger automatic deployments
2. **Simple Configuration**: No build process required - Cloudflare Pages serves files directly from the repository
3. **Version Management**: The update script manages version numbers and change documentation
4. **Environment Variables**: API keys are securely stored in Cloudflare's environment variables

## 📁 Folder Structure

```
wisdom-bites-dental/
│
├── index.html                 # Homepage with virtual tour
├── about.html                 # About Us page
├── booking.html               # Appointment booking page
├── contact.html               # Contact information page
├── faq.html                   # Frequently asked questions
│
├── services/                  # Service pages
│   ├── general-dentistry.html
│   ├── cosmetic-dentistry.html
│   └── emergency-care.html
│
├── assets/                    # Website resources
│   ├── css/                   # Styling files
│   │   ├── styles.css         # Main styles
│   │   ├── responsive.css     # Mobile-friendly adjustments
│   │   ├── animations.css     # Animation effects
│   │   └── virtual-tour.css   # Virtual tour specific styles
│   │
│   ├── js/                    # Interactive features
│   │   ├── main.js            # Core functionality
│   │   ├── animations.js      # Visual effects
│   │   ├── performance.js     # Speed optimizations
│   │   ├── virtual-tour.js    # Virtual tour functionality
│   │   └── faq.js             # FAQ search and filtering
│   │
│   └── images/                # Pictures used on the website
│       ├── logo.svg           # Main logo
│       ├── logo-white.svg     # White version for dark backgrounds
│       ├── hero-bg.webp       # Hero section background
│       ├── doctor-1.jpg       # Team member photos
│       ├── doctor-2.jpg
│       ├── doctor-3.jpg
│       ├── patient-1.jpg      # Testimonial photos
│       ├── patient-2.jpg
│       ├── patient-3.jpg
│       ├── dental-office.webp # Office image
│       └── entrance-marker.png # Virtual tour entrance marker
│
├── .github/                   # Deployment settings
│   └── workflows/
│       └── deploy.yml         # Automatic deployment rules
│
├── .gitignore                 # Specifies files excluded from Git tracking
├── update-site.ps1            # Website update script (PowerShell)
├── watch-media.js             # Media tracking script
├── version.json               # Current version information
├── CHANGELOG.md               # Detailed history of changes
└── version_history.txt        # Simple list of updates
```

### Key Files Explained

- **HTML Files**: The actual pages visitors see
- **CSS Files**: 
  - `styles.css`: Main styling with CSS custom properties (variables)
  - `responsive.css`: Media queries for different screen sizes
  - `animations.css`: Keyframe animations and transitions
  - `virtual-tour.css`: Specific styles for the virtual tour feature
- **JavaScript Files**: 
  - `main.js`: Core website functionality
  - `animations.js`: Scroll-based animations and effects
  - `performance.js`: Lazy loading and other optimizations
  - `virtual-tour.js`: Virtual tour functionality and API interactions
  - `faq.js`: FAQ page search and filtering functionality
- **Version Files**: Keep track of website changes
- **.gitignore**: Prevents unnecessary files (like node_modules) from being tracked in Git
- **PowerShell Script**: Updates the website in one step

## 🔄 How to Update the Website

### Simple Update Process

1. **Make sure tracking is running**:
   ```
   npm run watch
   ```
   (Keep this running in a separate window)

2. **Make your changes** to any files (HTML, images, etc.)

3. **Test your changes locally**:
   ```
   npm start
   ```
   View at: http://localhost:3000

4. **Update and deploy** when everything looks good:
   ```
   .\update-site.ps1 -Description "What you changed" -VersionType "auto"
   ```

### Update Examples

```powershell
# For small fixes:
.\update-site.ps1 -Description "Fixed typo on homepage"

# For new features:
.\update-site.ps1 -Description "Added new booking calendar feature" -VersionType "minor"

# For major redesigns:
.\update-site.ps1 -Description "Complete website redesign" -VersionType "major"
```

The system will automatically detect if it's a small fix, a new feature, or a major change based on your description.

## 📊 Version Management System

This website uses a smart version numbering system (X.Y.Z):

- **X** (Major): Complete redesigns or big changes
- **Y** (Minor): New features added
- **Z** (Patch): Small fixes and updates

### Current Version

**Version 3.0.0** - Major enhancement with virtual tour implementation and various fixes. See [CHANGELOG.md](CHANGELOG.md) for complete history.

### How Changes are Tracked

The system uses three files:

1. **CHANGELOG.md**: Detailed information about all changes
2. **version_history.txt**: Simple list of version numbers and descriptions
3. **media-updates.log**: Automatically tracks when images/videos are added or changed

You don't need to edit these files manually - the update script handles everything!

### How Media Tracking Works

The `npm run watch` command monitors the `assets` folder. Whenever you:
- Add a new image
- Update an existing image
- Delete an image

The system automatically logs this in `media-updates.log` with details like:
- What changed
- When it changed
- File size information

These logs are included in version updates so you always know what changed.

## ☁️ Cloudflare Deployment

The website is hosted on Cloudflare Pages for:
- Fast loading worldwide
- Protection against attacks
- Automatic HTTPS encryption

### Live Website URL

The live website is accessible at:
- **Main URL**: https://wisdom-bites-dental.pages.dev
- **Custom Domain**: (If a custom domain has been configured, it would be listed here)

### How Deployment Works

The deployment process is simple and automated using both GitHub Actions and Cloudflare Pages:

1. Make your changes to the website files
2. Commit and push your changes to GitHub using the update script:
   ```
   .\update-site.ps1 -Description "Your change description" -VersionType "patch"
   ```
3. This triggers the GitHub Actions workflow which:
   - Optimizes images, CSS, and JavaScript in-place (without creating a build directory)
   - Validates HTML files
   - Deploys directly to Cloudflare Pages from the repository root

4. Your changes go live within minutes

### Cloudflare Pages Configuration

The current deployment configuration uses:
- **Build command**: Empty (no build command needed)
- **Build output directory**: Empty (uses root directory of the repository)
- **Framework preset**: None
- **Environment variables**: API keys stored securely in Cloudflare dashboard

This simple configuration works perfectly for static HTML websites and avoids unnecessary complexity.

### GitHub Actions Workflow

The GitHub workflow (`.github/workflows/deploy.yml`) is configured to:
- Automatically run when changes are pushed to the main branch
- Optimize assets in-place (images, CSS, JavaScript)
- Deploy directly from the repository root to match Cloudflare's configuration
- Send deployment notifications

You don't need to manually upload files to Cloudflare - it happens automatically through the GitHub integration!

## ❓ Common Issues & Solutions

### "Cannot find module" error when running npm commands

**Solution**: Run `npm install` to reinstall dependencies

### Media files not being tracked

**Solution**: Make sure `npm run watch` is running in a separate terminal window

### Update script doesn't work

**Solution**: 
1. Check you're using PowerShell
2. Run: `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`
3. Try again: `.\update-site.ps1 -Description "Your update"`

### Virtual Tour Not Loading

**Solution**:
1. Check if Google Maps API key is valid
2. Verify all required Google Maps APIs are enabled (Maps JavaScript, Street View, Places)
3. Look for console errors in browser developer tools
4. Check that all virtual tour files are properly loaded (JS, CSS)
5. Make sure the `clinic-data` script is present in `index.html` for fallback

### Website not updating after deployment

**Solution**: 
1. Check GitHub Actions run history for any workflow failures
2. Check Cloudflare Pages dashboard for any build errors
3. Verify that both GitHub Actions workflow and Cloudflare Pages are correctly configured to deploy from the root directory
4. Make sure your changes were successfully pushed to GitHub

### Cloudflare Pages build fails

**Solution**:
1. Keep the build command and output directory fields empty in Cloudflare Pages settings
2. Ensure the GitHub Actions workflow is deploying from the repository root (directory: '.')
3. Check the build logs in both GitHub Actions and Cloudflare Pages dashboard for specific errors

### Large images cause deployment to fail

**Solution**: Optimize large images before adding them (aim for under 500KB per image)

### Git repository becomes bloated

**Solution**: 
1. Make sure the .gitignore file is properly set up
2. Never commit the node_modules directory
3. Optimize images before adding them to the repository
4. Use `git status` before committing to verify what's being included

## 🔧 Technical Details

### CSS Architecture

The website uses a thoughtfully organized CSS architecture:

1. **CSS Custom Properties (Variables)**:
   - Defined in `:root` in `styles.css`
   - Categories include colors, typography, spacing, borders, shadows, transitions, and z-index
   - Example: `--primary: #4a90e2;` for consistent color usage

2. **Modular Structure**:
   - Base styles for HTML elements
   - Component-specific styles
   - Utility classes for common patterns

3. **Responsive Design**:
   - Mobile-first approach
   - Breakpoints at 480px, 768px, 992px, and 1200px
   - Flexbox and CSS Grid for layouts

4. **Performance Considerations**:
   - Critical CSS inlined in `<head>`
   - Non-critical CSS loaded asynchronously
   - Minimized use of CSS animations for better performance

### JavaScript Components

The website's JavaScript is organized into modular components:

1. **Core Functionality** (`main.js`):
   - Navigation menu controls
   - Smooth scrolling
   - Form validation
   - Lazy loading of images

2. **Animation System** (`animations.js`):
   - Scroll-based animations
   - Element reveal effects
   - Parallax scrolling

3. **Performance Optimization** (`performance.js`):
   - Resource preloading
   - Deferred loading of non-critical assets
   - Browser idle time utilization

4. **Virtual Tour** (`virtual-tour.js`):
   - Google Maps API integration
   - Street View panorama controls
   - Interior panorama navigation
   - Place details fetching
   - Hotspot interaction
   - Tour state management

5. **FAQ System** (`faq.js`):
   - Search functionality
   - Category filtering
   - Question expansion/collapse

### API Integrations

The website integrates with several external APIs:

1. **Google Maps Platform**:
   - Maps JavaScript API for embedding maps
   - Street View API for virtual tour
   - Places API for clinic information
   - Geocoding API for location data
   - Static Maps API for fallback

2. **Appointment Booking System**:
   - Calendar API for availability
   - Customer data handling
   - Email notifications

3. **Analytics**:
   - Performance tracking
   - User behavior analysis
   - Conversion tracking

## 🌐 Browser Compatibility

The website is tested and compatible with:

- **Chrome**: Version 88+
- **Firefox**: Version 85+
- **Safari**: Version 14+
- **Edge**: Version 88+
- **iOS Safari**: Version 14+
- **Android Chrome**: Version 88+

Browser compatibility is maintained by:
- Using appropriate vendor prefixes
- Ensuring all CSS properties have fallbacks
- Testing against browser compatibility databases
- Using feature detection rather than browser detection

## ♿ Accessibility Compliance

The website follows WCAG 2.1 AA standards, including:

- **Semantic HTML**: Proper heading structure and landmark regions
- **ARIA Attributes**: Used where appropriate to enhance accessibility
- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **Color Contrast**: Meets minimum contrast requirements
- **Alternative Text**: All images have appropriate alt text
- **Focus Indicators**: Visible focus styles on interactive elements
- **Screen Reader Compatibility**: Tested with popular screen readers

Recent fixes included adding aria-label to buttons with icon-only content.

## ⚡ Performance Optimizations

The website employs several performance optimizations:

1. **Image Optimization**:
   - WebP format for modern browsers
   - Appropriate image dimensions
   - Lazy loading for below-the-fold images

2. **Code Optimization**:
   - Minified CSS and JavaScript
   - Critical CSS inlined
   - Deferred loading of non-critical scripts

3. **Caching Strategy**:
   - Browser caching with appropriate headers
   - Service worker for offline functionality
   - Cache busting for updated assets

4. **Resource Hints**:
   - Preconnect for third-party domains
   - Preload for critical assets
   - Prefetch for likely user journeys

## 🚀 Future Enhancements

Planned enhancements for future versions:

1. **Interactive Treatment Planner**:
   - Visual tooth chart
   - Treatment cost calculator
   - Treatment timeline visualization

2. **Multilingual Support**:
   - Multiple language options
   - Automatic language detection
   - Culture-specific content adaptations

3. **Enhanced Virtual Tour**:
   - Interactive equipment demonstrations
   - Staff introductions within tour
   - Virtual consultation room

4. **Patient Portal**:
   - Secure login area
   - Treatment history
   - Appointment management
   - Document uploads

5. **Chat Support**:
   - Live chat during business hours
   - AI-powered chatbot for after-hours

## 🤝 Getting Help

If you encounter any issues not covered here, please contact the website administrator.

---

© 2025 Wisdom Bites Dental Clinic. All rights reserved.
