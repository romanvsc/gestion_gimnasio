const CACHE_NAME = 'yacyreta-shell-v2'

const STATIC_SHELL = [
  '/',
  '/manifest.webmanifest',
  '/brand/yacyreta-logo.svg'
]

function extractSameOriginAssets(html) {
  const assets = [...html.matchAll(/(?:src|href)=["']([^"']+)["']/gi)]

  return assets
    .map(([, path]) => path)
    .map(path => {
      try {
        return new URL(path, self.location.origin)
      } catch {
        return null
      }
    })
    .filter(url => url && url.origin === self.location.origin)
    .map(url => url.pathname + url.search)
}

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME)
    const indexResponse = await fetch('/', { cache: 'no-store' })
    const indexHtml = await indexResponse.clone().text()
    const shellAssets = [...new Set([
      ...STATIC_SHELL,
      ...extractSameOriginAssets(indexHtml)
    ])]

    await cache.put('/', indexResponse.clone())
    await Promise.allSettled(
      shellAssets
        .filter(path => path !== '/')
        .map(path => cache.add(path))
    )

    await self.skipWaiting()
  })())
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys
        .filter((key) => key !== CACHE_NAME)
        .map((key) => caches.delete(key))
    ))
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url)

  // Nunca interceptar Supabase, autenticación ni otros orígenes.
  if (event.request.method !== 'GET' || requestUrl.origin !== self.location.origin) return

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/'))
    )
    return
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse

      return fetch(event.request).then((response) => {
        if (!response.ok) return response

        const responseToCache = response.clone()
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache))
        return response
      })
    })
  )
})
