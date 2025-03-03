/**
 * Wisdom Bites Dental Clinic
 * Performance Optimizations
 * Version: 1.0
 */

document.addEventListener('DOMContentLoaded', function() {
    'use strict';
    
    // Initialize performance optimizations
    initLazyLoading();
    initDeferredScripts();
    initPreloadAssets();
    initFontOptimization();
    initDynamicCaching();
    
    // Register Service Worker if supported
    if ('serviceWorker' in navigator) {
        registerServiceWorker();
    }
    
    // Performance monitoring
    if (window.performance) {
        logPagePerformance();
    }
});

/**
 * Lazy Loading Images and iframes
 */
function initLazyLoading() {
    // Check if IntersectionObserver is supported
    if ('IntersectionObserver' in window) {
        const lazyElements = document.querySelectorAll('[data-src], [data-srcset], [data-background-src]');
        
        const lazyLoadObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    
                    // Process images
                    if (element.dataset.src) {
                        element.src = element.dataset.src;
                        element.removeAttribute('data-src');
                    }
                    
                    // Process image srcsets
                    if (element.dataset.srcset) {
                        element.srcset = element.dataset.srcset;
                        element.removeAttribute('data-srcset');
                    }
                    
                    // Process background images
                    if (element.dataset.backgroundSrc) {
                        element.style.backgroundImage = `url('${element.dataset.backgroundSrc}')`;
                        element.removeAttribute('data-background-src');
                    }
                    
                    // For iframes
                    if (element.tagName.toLowerCase() === 'iframe' && element.dataset.src) {
                        element.src = element.dataset.src;
                        element.removeAttribute('data-src');
                    }
                    
                    element.classList.add('loaded');
                    observer.unobserve(element);
                }
            });
        }, {
            rootMargin: '100px 0px',
            threshold: 0.01
        });
        
        lazyElements.forEach(element => {
            lazyLoadObserver.observe(element);
        });
    } else {
        // Fallback for browsers that don't support IntersectionObserver
        function lazyLoadFallback() {
            const lazyElements = document.querySelectorAll('[data-src], [data-srcset], [data-background-src]');
            
            lazyElements.forEach(element => {
                const rect = element.getBoundingClientRect();
                
                if (rect.top <= window.innerHeight && rect.bottom >= 0) {
                    // Process images
                    if (element.dataset.src) {
                        element.src = element.dataset.src;
                        element.removeAttribute('data-src');
                    }
                    
                    // Process image srcsets
                    if (element.dataset.srcset) {
                        element.srcset = element.dataset.srcset;
                        element.removeAttribute('data-srcset');
                    }
                    
                    // Process background images
                    if (element.dataset.backgroundSrc) {
                        element.style.backgroundImage = `url('${element.dataset.backgroundSrc}')`;
                        element.removeAttribute('data-background-src');
                    }
                    
                    element.classList.add('loaded');
                }
            });
        }
        
        // Run on load
        lazyLoadFallback();
        
        // Run on scroll, resize, and orientation change
        ['scroll', 'resize', 'orientationchange'].forEach(event => {
            window.addEventListener(event, lazyLoadFallback);
        });
    }
}

/**
 * Deferred and Async Script Loading
 */
function initDeferredScripts() {
    // Find scripts with data-defer attribute
    const deferredScripts = document.querySelectorAll('script[data-defer]');
    
    deferredScripts.forEach(script => {
        const src = script.getAttribute('data-defer');
        
        // Create a new script element
        const deferScript = document.createElement('script');
        deferScript.src = src;
        
        // Copy attributes except data-defer
        Array.from(script.attributes).forEach(attr => {
            if (attr.name !== 'data-defer') {
                deferScript.setAttribute(attr.name, attr.value);
            }
        });
        
        // Load the script after page load
        window.addEventListener('load', () => {
            document.body.appendChild(deferScript);
        });
        
        // Remove the original script tag
        script.parentNode.removeChild(script);
    });
}

/**
 * Preload Critical Assets
 */
function initPreloadAssets() {
    // Critical paths for preloading
    const criticalAssets = [
        { type: 'style', href: '/assets/css/styles.css' },
        { type: 'font', href: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Roboto:wght@300;400;500;700&display=swap' },
        { type: 'script', href: '/assets/js/main.js' }
    ];
    
    criticalAssets.forEach(asset => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = asset.href;
        
        if (asset.type === 'style') {
            link.as = 'style';
        } else if (asset.type === 'font') {
            link.as = 'font';
            link.crossOrigin = 'anonymous';
        } else if (asset.type === 'script') {
            link.as = 'script';
        } else if (asset.type === 'image') {
            link.as = 'image';
        }
        
        document.head.appendChild(link);
    });
}

/**
 * Font Display Optimization
 */
function initFontOptimization() {
    // Handle font loading stages
    document.documentElement.classList.add('fonts-loading');
    
    if ('fonts' in document) {
        Promise.all([
            document.fonts.load('1em Roboto'),
            document.fonts.load('1em Montserrat')
        ]).then(() => {
            document.documentElement.classList.remove('fonts-loading');
            document.documentElement.classList.add('fonts-loaded');
            
            // Store font loaded flag in session storage
            sessionStorage.setItem('fontsLoaded', 'true');
        });
    } else {
        // Fallback for browsers that don't support the Font Loading API
        // Set a timeout to assume fonts are loaded after 2 seconds
        setTimeout(() => {
            document.documentElement.classList.remove('fonts-loading');
            document.documentElement.classList.add('fonts-loaded');
        }, 2000);
    }
    
    // If fonts were previously loaded in this session, skip the loading state
    if (sessionStorage.getItem('fontsLoaded')) {
        document.documentElement.classList.remove('fonts-loading');
        document.documentElement.classList.add('fonts-loaded');
    }
}

/**
 * Service Worker Registration for Offline Support and Caching
 */
function registerServiceWorker() {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            })
            .catch(error => {
                console.log('ServiceWorker registration failed: ', error);
            });
    });
}

/**
 * Dynamic Resource Caching
 */
function initDynamicCaching() {
    // Set up prefetch for pages likely to be visited
    const prefetchLinks = [
        '/about.html',
        '/services/general-dentistry.html',
        '/services/cosmetic-dentistry.html',
        '/booking.html'
    ];
    
    // Only prefetch on fast connections
    if (navigator.connection && (navigator.connection.saveData === false) && 
        (navigator.connection.effectiveType === '4g')) {
        
        prefetchLinks.forEach(url => {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = url;
            document.head.appendChild(link);
        });
    }
}

/**
 * Log Performance Metrics
 */
function logPagePerformance() {
    // Wait for the page to fully load
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = window.performance.timing;
            const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
            const domReadyTime = perfData.domComplete - perfData.domLoading;
            
            console.log('Page load time: ' + pageLoadTime + 'ms');
            console.log('DOM ready time: ' + domReadyTime + 'ms');
            
            // More detailed metrics
            if (window.performance.getEntriesByType) {
                const resources = window.performance.getEntriesByType('resource');
                
                // Total resource size and load time
                let totalSize = 0;
                let totalLoadTime = 0;
                
                resources.forEach(resource => {
                    totalLoadTime += resource.duration;
                    
                    // If transfer size is available
                    if (resource.transferSize) {
                        totalSize += resource.transferSize;
                    }
                });
                
                console.log('Total resources: ' + resources.length);
                console.log('Total resource size: ' + (totalSize / 1024).toFixed(2) + 'KB');
                console.log('Total resource load time: ' + totalLoadTime.toFixed(2) + 'ms');
                
                // Log slow resources (> 1s)
                const slowResources = resources.filter(resource => resource.duration > 1000);
                if (slowResources.length > 0) {
                    console.log('Slow resources:');
                    slowResources.forEach(resource => {
                        console.log(resource.name + ': ' + resource.duration.toFixed(2) + 'ms');
                    });
                }
            }
            
            // Send metrics to analytics if needed
            if (typeof ga !== 'undefined') {
                ga('send', 'timing', 'Performance', 'Page Load', pageLoadTime);
                ga('send', 'timing', 'Performance', 'DOM Ready', domReadyTime);
            }
        }, 0);
    });
} 