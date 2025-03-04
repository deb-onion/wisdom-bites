# AI Assistant Guide: Wisdom Bites Dental Clinic

This document provides technical specifications, patterns, and contextual information to help AI assistants effectively debug and develop code for the Wisdom Bites Dental Clinic website.

## 🔍 Technical Overview

### Architecture

- **Type**: Static HTML website with vanilla JavaScript
- **Structure**: Multi-page application (no SPA framework)
- **Styling**: Custom CSS (no frameworks)
- **Deployment**: GitHub → Cloudflare Pages
- **Build System**: None (direct deployment from repository root)
- **Version Control**: Git with automated versioning script

### Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Local Server**: npm serve package
- **Media Tracking**: Custom Node.js script (watch-media.js)
- **Version Management**: PowerShell script (update-site.ps1)
- **Deployment Automation**: GitHub Actions + Cloudflare Pages

## 💻 Code Patterns & Conventions

### HTML Structure

The HTML follows this general pattern:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="...">
    <meta name="keywords" content="...">
    <title>Page Title | Wisdom Bites Dental Clinic</title>
    <link rel="stylesheet" href="/assets/css/styles.css">
    <link rel="stylesheet" href="/assets/css/responsive.css">
    <!-- Any page-specific CSS would go here -->
</head>
<body>
    <header>
        <!-- Navigation -->
    </header>
    
    <main>
        <!-- Page-specific content -->
    </main>
    
    <footer>
        <!-- Common footer elements -->
    </footer>
    
    <script src="/assets/js/main.js"></script>
    <!-- Any page-specific scripts would go here -->
</body>
</html>
```

### CSS Organization

- **styles.css**: Contains global styles and common components
- **responsive.css**: Contains media queries and responsive adjustments
- Class naming convention: Descriptive, lowercase with hyphens (e.g., `hero-section`, `contact-form`)

### JavaScript Patterns

- Vanilla JavaScript with ES6+ features
- Event listeners attached in main.js or page-specific scripts
- Functions are organized by feature/component

## 🛠️ Development Workflow

### Local Development Process

1. Start the local server: `npm start`
2. Start the media tracking process: `npm run watch`
3. Modify files directly in the project structure
4. Test changes in the browser at http://localhost:3000
5. Deploy using the update script

### File Modification Guidelines

When modifying existing files:
1. Maintain the same HTML structure and CSS classes
2. Reuse existing JavaScript functions when possible
3. Keep media assets optimized (<500KB per image)
4. Follow existing naming conventions

When creating new files:
1. Use existing files as templates
2. Place in the appropriate directory based on content type
3. Link to global CSS and JS files
4. Add to navigation if it's a main page

## 🧪 Testing & Debugging

### Common Issues and Solutions

#### JavaScript Console Errors

- Check for proper script loading order
- Verify path references (absolute vs relative)
- Look for typos in function or variable names
- Confirm element IDs and classes match between HTML and JS

#### CSS Styling Issues

- Inspect element to check which styles are applied/overridden
- Verify media queries for responsive designs
- Check for missing closing brackets or semicolons
- Confirm class naming matches between HTML and CSS

#### HTML Rendering Problems

- Validate HTML structure
- Check for unclosed tags
- Verify asset paths for images and other media
- Test across different browsers

### Testing Approach

- Cross-browser testing (Chrome, Firefox, Safari, Edge)
- Mobile responsiveness testing
- Performance optimization (Google PageSpeed)
- Accessibility testing (WCAG guidelines)

## 📂 Directory Structure Analysis

Understanding key directories and their purposes:

### Services Pages (`/services/`)

These pages follow a consistent pattern:
- Hero section with service title
- Overview section explaining service
- Detailed service listings with icons/images
- CTA section encouraging appointment booking

### Asset Organization (`/assets/`)

- **CSS**: Global styles and responsive adjustments
- **JS**: Core functionality and animations
- **Images**: Optimized for web, organized by usage

## 🔄 Version Control & Deployment

### Git Workflow

- Main branch is the production branch
- Commits should be descriptive and reference the type of change
- The update script handles versioning and change documentation
- Node modules and other build artifacts are excluded via .gitignore

### Deployment Process Technical Details

1. Changes are committed locally
2. Update script runs to:
   - Increment version numbers in version.json
   - Update CHANGELOG.md with commit details
   - Process media-updates.log entries
   - Commit all changes with version tag
   - Push to GitHub repository
3. GitHub triggers Cloudflare Pages deployment
4. Cloudflare Pages deploys directly from repository root

## 🤖 AI Assistance Guidelines

### Effective AI Prompting

When working with this codebase, provide the AI with:
- Specific file paths you're working with
- Context about where the file fits in the site structure
- The exact issue or enhancement you're trying to implement
- Any error messages you're encountering

Example of a good prompt:
```
I'm trying to update the booking.html page to add a new field for "Preferred contact method" 
in the booking form. The form is inside the main content section. I'm getting a JavaScript 
error: "Uncaught TypeError: Cannot read properties of null" when I try to select the new 
form field.
```

### Context Windows

The AI may have limited context. For large files, focus on sharing:
1. The relevant HTML section rather than the entire page
2. The specific JavaScript function causing issues
3. The CSS rules related to the component being modified

### Code Generation Best Practices

When asking the AI to generate code:
1. Request code that matches the existing patterns and conventions
2. Specify any requirements for browser compatibility
3. Ask for explanations of complex logic
4. Request validation steps to test the new code

## 📚 Technical Reference

### HTML Structure Patterns

Each page type follows specific patterns:

- **Home**: Hero slider → Services preview → Testimonials → About summary → CTA
- **Services**: Hero → Overview → Service details → What to expect → Testimonials → FAQ → CTA
- **Booking**: Hero → Form → Insurance info → What to expect → CTA
- **Contact**: Hero → Contact info → Map → Form → FAQ → CTA

### JavaScript Functionality Map

- **main.js**: Navigation, common UI interactions, form validation
- **animations.js**: Scrolling effects, transitions, reveals
- **performance.js**: Lazy loading, optimization functions

### SEO Implementation

- Each page has custom meta description and keywords
- Semantic HTML structure with proper heading hierarchy
- Image alt attributes for accessibility and SEO
- Schema.org markup for local business

## 🔍 Code Analysis for AI

When analyzing this codebase, focus on:
1. Simple, modular HTML structure
2. Direct DOM manipulation with vanilla JavaScript
3. Straightforward CSS with responsive design
4. No build process or transpilation
5. Repository structure organized by page type and asset type

This codebase intentionally avoids complexity to maintain simplicity and ease of maintenance.

---

*This guide is specifically for AI assistants helping with the Wisdom Bites Dental Clinic website project.* 