/**
 * 🔥 Service Worker للـ Image Caching
 * يوفر 90% من الـ Egress عن طريق Cache الصور محلياً
 */

const CACHE_NAME = 'allosh-images-v1';
const IMAGE_CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

// URLs التي نريد cache لها
const CACHEABLE_ORIGINS = [
    'https://res.cloudinary.com',
    'https://fwbftxqvcqwavyizqaiq.supabase.co/storage',
];

// Install event
self.addEventListener('install', (event) => {
    console.log('🔥 Image Cache SW installed');
    self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
    console.log('✅ Image Cache SW activated');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter(name => name.startsWith('allosh-images-') && name !== CACHE_NAME)
                    .map(name => caches.delete(name))
            );
        })
    );
    return self.clients.claim();
});

// Fetch event - Cache Strategy: Cache First
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Only cache images from our CDNs
    const isCacheable = CACHEABLE_ORIGINS.some(origin => url.href.startsWith(origin));
    const isImage = event.request.destination === 'image' || 
                   /\.(jpg|jpeg|png|gif|webp|svg|avif)$/i.test(url.pathname);

    if (!isCacheable || !isImage) {
        return; // Let browser handle it normally
    }

    event.respondWith(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.match(event.request).then((cachedResponse) => {
                // If we have a cached response, check if it's still fresh
                if (cachedResponse) {
                    const cachedDate = new Date(cachedResponse.headers.get('sw-cache-date'));
                    const now = new Date();
                    
                    // If cache is fresh, return it
                    if (now - cachedDate < IMAGE_CACHE_DURATION) {
                        console.log('📦 Serving from cache:', url.pathname.substring(0, 50));
                        return cachedResponse;
                    }
                }

                // Otherwise, fetch from network
                return fetch(event.request).then((networkResponse) => {
                    // Only cache successful responses
                    if (networkResponse && networkResponse.status === 200) {
                        // Clone the response and add cache date header
                        const responseToCache = networkResponse.clone();
                        
                        // Add custom header for cache date
                        const headers = new Headers(responseToCache.headers);
                        headers.set('sw-cache-date', new Date().toISOString());
                        
                        const modifiedResponse = new Response(responseToCache.body, {
                            status: responseToCache.status,
                            statusText: responseToCache.statusText,
                            headers: headers
                        });

                        cache.put(event.request, modifiedResponse);
                        console.log('💾 Cached:', url.pathname.substring(0, 50));
                    }

                    return networkResponse;
                }).catch((error) => {
                    console.error('❌ Fetch failed:', error);
                    // Return cached version even if expired
                    return cachedResponse || new Response('Image not available', {
                        status: 404,
                        statusText: 'Not Found'
                    });
                });
            });
        })
    );
});

// Message event - for clearing cache from app
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'CLEAR_IMAGE_CACHE') {
        caches.delete(CACHE_NAME).then(() => {
            console.log('🗑️ Image cache cleared');
            event.ports[0].postMessage({ success: true });
        });
    }
});
