# Wisdom Bites Dental Clinic Website

A modern, responsive website for Wisdom Bites Dental Clinic that showcases services, allows appointment booking, and provides essential information to patients.

## 📋 Table of Contents

- [Overview](#overview)
- [What's in This Project](#whats-in-this-project)
- [Getting Started](#getting-started)
- [Folder Structure](#folder-structure)
- [How to Update the Website](#how-to-update-the-website)
- [Version Management System](#version-management-system)
- [Cloudflare Deployment](#cloudflare-deployment)
- [Common Issues & Solutions](#common-issues--solutions)

## 📝 Overview

This is a custom-built dental clinic website featuring:

- **Speed**: Fast-loading pages optimized for all devices
- **SEO**: Search-engine friendly structure and content
- **Accessibility**: Easy to use for people with disabilities
- **Offline Access**: Works even when internet connection is spotty
- **Easy Management**: Simple update system that tracks changes

The site is hosted on Cloudflare for security and speed.

## 🧰 What's in This Project

### Main Pages

- **Home** (`index.html`): Introduction to the clinic and services
- **About** (`about.html`): Information about the clinic and team
- **Services**: 
  - General Dentistry (`services/general-dentistry.html`)
  - Cosmetic Dentistry (`services/cosmetic-dentistry.html`)
  - Emergency Care (`services/emergency-care.html`)
- **Booking** (`booking.html`): Appointment scheduling system
- **Contact** (`contact.html`): Contact form and clinic information

### Behind-the-Scenes Features

- **Version Control**: System to track all website changes
- **Media Tracking**: Automatically logs when images or videos are added/changed
- **Automatic Deployment**: Updates go live instantly when approved

## 🚀 Getting Started

### First-Time Setup

1. **Install Required Software**:
   ```
   npm install
   ```
   This installs all the tools needed to run and update the website.

2. **Start the Local Preview Server**:
   ```
   npm start
   ```
   This lets you view the website on your computer before it goes live.

3. **Start Media Tracking** (in a separate terminal window):
   ```
   npm run watch
   ```
   This automatically keeps track of any images or videos you add or change.

## 📁 Folder Structure

```
wisdom-bites-dental/
│
├── index.html                 # Homepage
├── about.html                 # About Us page
├── booking.html               # Appointment booking page
├── contact.html               # Contact information page
│
├── services/                  # Service pages
│   ├── general-dentistry.html
│   ├── cosmetic-dentistry.html
│   └── emergency-care.html
│
├── assets/                    # Website resources
│   ├── css/                   # Styling files
│   │   ├── styles.css         # Main styles
│   │   └── responsive.css     # Mobile-friendly adjustments
│   │
│   ├── js/                    # Interactive features
│   │   ├── main.js            # Core functionality
│   │   ├── animations.js      # Visual effects
│   │   └── performance.js     # Speed optimizations
│   │
│   └── images/                # Pictures used on the website
│       ├── logo.png
│       └── [other images]
│
├── .github/                   # Deployment settings
│   └── workflows/
│       └── deploy.yml         # Automatic deployment rules
│
├── update-site.ps1            # Website update script (PowerShell)
├── watch-media.js             # Media tracking script
├── version.json               # Current version information
├── CHANGELOG.md               # Detailed history of changes
└── version_history.txt        # Simple list of updates
```

### Key Files Explained

- **HTML Files**: The actual pages visitors see
- **CSS Files**: Control how the website looks
- **JavaScript Files**: Add interactive features
- **Version Files**: Keep track of website changes
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

### How Deployment Works

When you run the update script:

1. Version numbers are updated
2. Changes are documented
3. Everything is pushed to GitHub
4. The website automatically rebuilds on Cloudflare
5. Your changes go live within minutes

You don't need to manually upload files to Cloudflare - it happens automatically!

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

### Website not updating after deployment

**Solution**: Check Cloudflare Pages dashboard for any build errors

### Large images cause deployment to fail

**Solution**: Optimize large images before adding them (aim for under 500KB per image)

## 🤝 Getting Help

If you encounter any issues not covered here, please contact the website administrator.

---

© 2023 Wisdom Bites Dental Clinic. All rights reserved.
