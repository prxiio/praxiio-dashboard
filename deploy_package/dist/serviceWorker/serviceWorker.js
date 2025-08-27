"use strict";
const CACHE_NAME = 'praxiio-cache-v1';
const TIMESTAMP = '2025-08-27 13:09:59';
const USER = 'prxiio';
const STATIC_RESOURCES = [
    '/',
    '/index.html',
    '/styles/main.css',
    '/scripts/app.js',
    '/assets/icons/logo.svg'
];
self.addEventListener('install', (event) => {
    event.waitUntil(caches.open(CACHE_NAME).then(cache => {
        console.log(`Cache opened at ${TIMESTAMP} by ${USER}`);
        return cache.addAll(STATIC_RESOURCES);
    }));
});
self.addEventListener('fetch', (event) => {
    event.respondWith(caches.match(event.request).then(response => {
        // Return cached version if available
        if (response) {
            return response;
        }
        // Clone the request because it's a one-time-use stream
        const fetchRequest = event.request.clone();
        return fetch(fetchRequest).then(response => {
            // Check if valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
            }
            // Clone the response because it's a one-time-use stream
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, responseToCache);
            });
            return response;
        }).catch(() => {
            // Return offline fallback if fetch fails
            return caches.match('/offline.html');
        });
    }));
});
self.addEventListener('activate', (event) => {
    event.waitUntil(caches.keys().then(cacheNames => {
        return Promise.all(cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
                return caches.delete(cacheName);
            }
        }));
    }));
});
// Handle background sync
self.addEventListener('sync', (event) => {
    if (event.tag === 'syncPatientData') {
        event.waitUntil(syncPatientData());
    }
});
async function syncPatientData() {
    try {
        const dataToSync = await getDataToSync();
        for (const item of dataToSync) {
            await fetch('/api/sync', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Timestamp': TIMESTAMP,
                    'X-User': USER
                },
                body: JSON.stringify(item)
            });
        }
    }
    catch (error) {
        console.error('Background sync failed:', error);
    }
}
async function getDataToSync() {
    // Get data from IndexedDB that needs syncing
    const db = await openDB('praxiio-offline', 1);
    return await db.getAll('syncQueue');
}
