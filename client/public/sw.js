// ═══════════════════════════════════════════════════
// Service Worker — منصة اجتهاد
// Cache-first strategy for static assets
// Network-first for API calls (Supabase)
// ═══════════════════════════════════════════════════
const CACHE_NAME = 'ijtihad-v1'
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
]

// Install: cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

// Activate: clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// Fetch: network-first for Supabase, cache-first for static
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url)

  // Skip Supabase API requests (always network)
  if (url.hostname.includes('supabase.co')) return

  // Skip non-GET requests
  if (event.request.method !== 'GET') return

  // Skip Vite HMR requests (e.g., ?t= timestamps) to prevent dev server issues
  if (url.searchParams.has('t')) return

  event.respondWith(
    caches.match(event.request).then(cached => {
      const networkFetch = fetch(event.request).then(response => {
        if (response.ok) {
          // ✅ Fix: Only cache http/https requests (prevents chrome-extension errors)
          if (url.protocol.startsWith('http')) {
            const clone = response.clone()
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone))
          }
        }
        return response
      }).catch(() => {
        // If it's a navigation request (page load), return the cached index.html
        if (event.request.mode === 'navigate') {
          return caches.match('/')
        }
        // Fallback: if no cache, return a basic error response to prevent TypeError
        return cached || new Response('Network error', { status: 503, statusText: 'Service Unavailable' })
      })

      // Return cached version immediately if available, or fetch from network
      return cached || networkFetch
    })
  )
})
