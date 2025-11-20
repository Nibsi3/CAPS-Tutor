/**
 * Service Worker for blocking Appwrite font requests at the network level
 * 
 * This service worker intercepts ALL network requests and blocks any requests
 * to assets.appwrite.io/fonts/* to prevent CORS errors.
 * 
 * Register this in src/app/layout.tsx
 */

const FONT_BLOCK_PATTERNS = [
  'assets.appwrite.io/fonts',
  'assets.appwrite.io/fonts/fira-code',
  'assets.appwrite.io/fonts/inter',
  '/fonts/fira-code/',
  '/fonts/inter/',
];

const isFontRequest = (url) => {
  if (!url || typeof url !== 'string') return false;
  const urlLower = url.toLowerCase();
  return FONT_BLOCK_PATTERNS.some(pattern => urlLower.includes(pattern.toLowerCase()));
};

// Install service worker
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Activate immediately
});

// Activate service worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    clients.claim() // Take control of all pages immediately
  );
});

// Intercept ALL fetch requests
self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  
  // Block Appwrite font requests
  if (isFontRequest(url)) {
    event.respondWith(
      new Response('', {
        status: 200,
        statusText: 'OK',
        headers: {
          'Content-Type': 'text/plain',
        },
      })
    );
    return;
  }
  
  // Allow all other requests to proceed normally
  event.respondWith(fetch(event.request));
});

