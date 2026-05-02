const CACHE = 'trendy-v4';

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c =>
      fetch('./index.html').then(r => {
        if (r.ok) return c.put('./index.html', r);
      }).catch(() => {})
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

  // طلبات API والأسعار - دائماً من الشبكة
  if (url.includes('api.github.com') || url.includes('raw.githubusercontent.com') || url.includes('open.er-api.com')) {
    e.respondWith(fetch(e.request).catch(() => new Response('{}', {headers:{'Content-Type':'application/json'}})));
    return;
  }

  // الأيقونات - دائماً من الشبكة (لا تُكاش)
  if (url.includes('icon-') || url.includes('.png') || url.includes('.ico')) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }

  // HTML - شبكة أولاً، ثم كاش كـ fallback
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => caches.match(e.request) || caches.match('./index.html'))
    );
    return;
  }

  // باقي الملفات - كاش أولاً
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res && res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => new Response('', {status: 408}));
    })
  );
});
