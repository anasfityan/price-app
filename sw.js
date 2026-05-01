const CACHE = 'trendy-v2';
const CORE = [
  '/price-app/',
  '/price-app/index.html',
  '/price-app/manifest.json',
  '/price-app/icon-192.png',
  '/price-app/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c =>
      Promise.all(CORE.map(url =>
        fetch(url).then(r => {
          if (r.ok) return c.put(url, r);
        }).catch(() => {})
      ))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = e.request.url;

  // rates.json - دائماً من الشبكة
  if (url.includes('rates.json') || url.includes('api.github.com') || url.includes('raw.githubusercontent.com')) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }

  // باقي الطلبات - كاش أولاً ثم شبكة
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res && res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => {
        // إذا فشل كل شيء، ارجع الصفحة الرئيسية من الكاش
        return caches.match('/price-app/index.html');
      });
    })
  );
});
