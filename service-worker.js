/**
 * Wisdom Bites Dental Clinic
 * Service Worker
 * Version: 1.0
 */

const CACHE_NAME = 'wisdom-bites-v1';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/about.html',
  '/booking.html',
  '/contact.html',
  '/services/general-dentistry.html',
  '/services/cosmetic-dentistry.html',
  '/services/emergency-care.html',
  '/assets/css/styles.css',
  '/assets/css/responsive.css',
  '/assets/js/main.js',
  '/assets/js/animations.js',
  '/assets/js/performance.js',
  '/assets/images/logo.png',
  '/assets/images/hero-background.jpg',
  '/assets/images/icons/icon-192x192.png',
  '/assets/images/icons/icon-512x512.png',
  '/manifest.json',
  '/favicon.ico',
  // Add any additional assets that should be available offline
];

// Install event - Precache specified assets
self.addEventListener('install', event => {
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .catch(error => {
        console.error('Precaching failed:', error);
      })
  );
});

// Activate event - Clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch event - Serve from cache or network
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) return;
  
  // For HTML pages, prefer network with cache fallback strategy
  if (event.request.headers.get('Accept').includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Create a copy of the response to cache
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        })
        .catch(() => {
          return caches.match(event.request)
            .then(cachedResponse => {
              if (cachedResponse) {
                return cachedResponse;
              }
              
              // If not in cache, try to serve the offline page
              return caches.match('/offline.html');
            });
        })
    );
    return;
  }
  
  // For other assets, use cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          // Return cached response but also update cache in background
          fetch(event.request)
            .then(response => {
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, response.clone());
                });
            })
            .catch(() => {/* Ignore errors */});
          
          return cachedResponse;
        }
        
        // If not in cache, fetch from network
        return fetch(event.request)
          .then(response => {
            // Don't cache if it's not a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response to cache it and return it
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch(error => {
            console.error('Fetch failed:', error);
            
            // For image requests, return a placeholder
            if (event.request.url.match(/\.(jpe?g|png|gif|svg)$/)) {
              return caches.match('/assets/images/placeholder.png');
            }
            
            // For other resources, just fail
            throw error;
          });
      })
  );
});

// Listen for push notifications
self.addEventListener('push', event => {
  if (!event.data) return;
  
  const notificationData = event.data.json();
  const options = {
    body: notificationData.body || 'New notification from Wisdom Bites Dental',
    icon: notificationData.icon || '/assets/images/icons/icon-192x192.png',
    badge: '/assets/images/icons/badge-icon.png',
    data: {
      url: notificationData.url || '/'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(
      notificationData.title || 'Wisdom Bites Dental',
      options
    )
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  const urlToOpen = event.notification.data.url;
  
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    })
    .then(windowClients => {
      // Check if there is already a window/tab open with the target URL
      for (let client of windowClients) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      
      // If not, open a new window/tab
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Create offline page
const offlineHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Offline - Wisdom Bites Dental Clinic</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f7f9fa;
            color: #333;
            display: flex;
            flex-direction: column;
            min-height: 100vh;
            text-align: center;
        }
        .offline-container {
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px;
            flex-grow: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        h1 {
            font-size: 2rem;
            margin-bottom: 1rem;
            color: #3498db;
        }
        p {
            font-size: 1.1rem;
            line-height: 1.6;
            margin-bottom: 1.5rem;
        }
        .offline-icon {
            font-size: 5rem;
            margin-bottom: 2rem;
            color: #3498db;
        }
        .btn {
            display: inline-block;
            background-color: #3498db;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 4px;
            font-weight: 500;
            transition: background-color 0.3s;
        }
        .btn:hover {
            background-color: #2980b9;
        }
    </style>
</head>
<body>
    <div class="offline-container">
        <div class="offline-icon">📶</div>
        <h1>You're Offline</h1>
        <p>It seems you've lost your internet connection. The page you're trying to access isn't available offline.</p>
        <p>Please check your connection and try again.</p>
        <a href="/" class="btn">Try Again</a>
    </div>
</body>
</html>
`;

// Create the offline.html page when the service worker is installed
self.addEventListener('install', event => {
  const createOfflinePage = async () => {
    const cache = await caches.open(CACHE_NAME);
    
    // Create a response for the offline.html page
    const response = new Response(offlineHTML, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8'
      }
    });
    
    await cache.put('/offline.html', response);
  };
  
  event.waitUntil(createOfflinePage());
}); 