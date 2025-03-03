/**
 * Media Asset Watcher
 * Wisdom Bites Dental Clinic
 *
 * This script watches for changes to media files (images, videos, etc.)
 * and logs them to a media-updates.log file for version tracking.
 */

const chokidar = require('chokidar');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const statAsync = promisify(fs.stat);
const appendFileAsync = promisify(fs.appendFile);

// Configuration
const CONFIG = {
  // Directories to watch
  watchDirs: [
    './assets/images',
    './assets/videos'
  ],
  // File extensions to watch
  mediaExtensions: [
    // Images
    '.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp',
    // Videos
    '.mp4', '.webm', '.mov', '.avi',
    // Other media
    '.pdf', '.mp3', '.wav'
  ],
  // Log file path
  logFile: 'media-updates.log'
};

/**
 * Format bytes to human-readable format
 * @param {number} bytes - The file size in bytes
 * @param {number} decimals - Decimal places to show
 * @returns {string} - Formatted file size
 */
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

/**
 * Log media file changes to the media updates log
 * @param {string} filepath - Path to the changed file
 * @param {string} eventType - Type of event (add, change, unlink)
 */
async function logMediaChange(filepath, eventType) {
  try {
    // Get file information
    const relativePath = filepath.replace(/\\/g, '/');
    const extension = path.extname(filepath).toLowerCase();
    const eventName = eventType === 'add' ? 'Added' : eventType === 'change' ? 'Modified' : 'Removed';
    
    let logEntry = `[${new Date().toISOString()}] ${eventName}: ${relativePath}`;
    
    // Add file size and modification time if the file exists
    if (eventType !== 'unlink') {
      const stats = await statAsync(filepath);
      const fileSize = formatBytes(stats.size);
      const modifiedTime = stats.mtime.toLocaleString();
      
      logEntry += ` (${fileSize}, last modified: ${modifiedTime})`;
    }
    
    // Append to log file
    await appendFileAsync(CONFIG.logFile, logEntry + '\n');
    console.log(`Media asset ${eventName.toLowerCase()}: ${relativePath}`);
  } catch (error) {
    console.error(`Error logging media change: ${error.message}`);
  }
}

/**
 * Initialize the watcher
 */
function initWatcher() {
  console.log('Initializing media asset watcher...');
  
  // Ensure log file exists
  if (!fs.existsSync(CONFIG.logFile)) {
    fs.writeFileSync(CONFIG.logFile, '# Media Asset Updates Log\n\n');
    console.log(`Created log file: ${CONFIG.logFile}`);
  }
  
  // Create a file watcher
  const watcher = chokidar.watch(CONFIG.watchDirs, {
    ignored: /(^|[\/\\])\../, // Ignore dot files
    persistent: true,
    ignoreInitial: true, // Don't fire events when first starting
    awaitWriteFinish: { // Stabilize file writes before firing events
      stabilityThreshold: 2000,
      pollInterval: 100
    }
  });
  
  // Add event listeners
  watcher
    .on('add', filepath => {
      const ext = path.extname(filepath).toLowerCase();
      if (CONFIG.mediaExtensions.includes(ext)) {
        logMediaChange(filepath, 'add');
      }
    })
    .on('change', filepath => {
      const ext = path.extname(filepath).toLowerCase();
      if (CONFIG.mediaExtensions.includes(ext)) {
        logMediaChange(filepath, 'change');
      }
    })
    .on('unlink', filepath => {
      const ext = path.extname(filepath).toLowerCase();
      if (CONFIG.mediaExtensions.includes(ext)) {
        logMediaChange(filepath, 'unlink');
      }
    })
    .on('error', error => console.error(`Watcher error: ${error}`))
    .on('ready', () => console.log('Media asset watcher ready. Monitoring for changes...'));
  
  // Handle process termination
  process.on('SIGINT', () => {
    console.log('Stopping media asset watcher...');
    watcher.close().then(() => process.exit(0));
  });
}

// Start the watcher
initWatcher(); 