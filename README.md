# Wisdom Bites Dental Clinic

Official website for Wisdom Bites Dental Clinic, providing comprehensive dental care services.

## Website Features

- Responsive design optimized for all devices
- Fast-loading pages with performance optimizations
- SEO-friendly structure and metadata
- Accessibility compliant
- PWA support for offline functionality
- Cloudflare hosting ready

## Project Structure

- **HTML**: Main pages and service-specific pages
- **CSS**: Styling and responsive design
- **JavaScript**: Interactivity, animations, and performance optimizations
- **Assets**: Images, videos, and other media

## Version Management System

The project includes a comprehensive version management system that works with an automated media tracking system.

### How Our Version System Works

We have two separate but integrated systems:

1. **Automated Media Tracking** - Continuously runs in the background:
   - Automatically watches for any changes to images and videos
   - When media files are added/modified, immediately logs them to `media-updates.log`
   - Runs independently through the file watcher (`npm run watch`)

2. **Version Management and Deployment** - Run manually when deploying updates:
   - Updates version numbers and documentation
   - Commits and deploys all changes, including any media changes that were tracked

### Version Files

The project maintains three log files, each with a specific purpose:

1. **CHANGELOG.md** - The master changelog that provides comprehensive documentation of all changes, including:
   - Feature additions and improvements
   - Bug fixes and optimizations 
   - Deployment and configuration changes
   - Significant media updates and asset changes (high-level summary only)
   
2. **version_history.txt** - A simplified version history with basic entries for each update.

3. **media-updates.log** - Automatically tracks detailed media asset changes (images, videos, etc.), including:
   - Individual file additions and modifications (automatically generated)
   - Timestamp and size information
   - Technical metadata

### Semantic Versioning

We follow [Semantic Versioning](https://semver.org/) principles:

- **Major version** (X.0.0): Breaking changes, significant redesigns, major feature overhauls
- **Minor version** (X.Y.0): New features without breaking existing functionality
- **Patch version** (X.Y.Z): Bug fixes, small updates, content changes

### One-Step Site Update

To update and deploy the site with all changes (including media):

```powershell
.\update-site.ps1 -Description "What you changed" -VersionType "[major|minor|patch|auto]"
```

This single command will:
1. Update version numbers in relevant files
2. Add your description to CHANGELOG.md and version_history.txt
3. Commit ALL tracked changes including:
   - Code changes you've made
   - Documentation updates
   - Any media changes that have been automatically logged
4. Push to GitHub and trigger deployment

**Examples:**
```powershell
# Major update (3.0.0)
.\update-site.ps1 -Description "Complete website redesign with new color scheme" -VersionType "major"

# Minor update (2.1.0)
.\update-site.ps1 -Description "Added new booking calendar feature" -VersionType "minor"

# Patch update (2.0.1)
.\update-site.ps1 -Description "Fixed broken links in footer" -VersionType "patch"

# Auto-detect version type
.\update-site.ps1 -Description "Fixed contact form validation issue"
```

### Automatic Version Detection

The auto-detection determines version type based on keywords in your description:

- **Major**: Contains "BREAKING CHANGE", "MAJOR", "redesign", "complete overhaul"
- **Minor**: Contains "feat", "feature", "add", "new", "enhance"
- **Patch**: Any other description (default for fixes, updates, etc.)

### Setup and Development

1. **Initialize the project:**
   ```
   npm install
   ```

2. **Start media file watcher:**
   ```
   npm run watch
   ```

3. **Start local development server:**
   ```
   npm start
   ```

4. **Update and deploy the site:**
   ```
   npm run update -- -Description "Your update description" -VersionType "auto"
   ```

## License

All rights reserved. This code is proprietary and confidential. 