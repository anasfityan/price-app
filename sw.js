const CACHE = 'trendy-v20';
const API_CACHE = 'trendy-api-v5';
const APP_VERSION = '20';

const STATIC_ASSETS = [
  './ui-refinement.css',
  './ui-refinement.js',
  './security-lockdown.js',
  './runtime-cleanup.js',
  './performance-tuning.js',
  './performance-tuning.css',
  './final-audit.js',
  './manifest.json',
  './icon.png',
  './apple-icon.png',
  './logo.png'
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await Promise.all(STATIC_ASSETS.map(async path => {
      try {
        const response = await fetch(path, { cache: 'reload' });
        if (response.ok) await cache.put(path, response.clone());
      } catch (_) {}
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith('trendy-') && k !== CACHE && k !== API_CACHE).map(k => caches.delete(k)));
    await self.clients.claim();

    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    await Promise.all(windows.map(client => {
      try {
        const url = new URL(client.url);
        if (url.searchParams.get('appv') === APP_VERSION) return Promise.resolve();
        url.searchParams.set('appv', APP_VERSION);
        return client.navigate(url.toString()).catch(() => null);
      } catch (_) {
        return Promise.resolve();
      }
    }));
  })());
});

function sanitize(html) {
  return html
    .replace(/const\s+_c\s*=\s*atob\([^;]+\);?/g, "const _c = ''; // disabled")
    .replace(/,\s*user-scalable\s*=\s*no/gi, '')
    .replace(/user-scalable\s*=\s*no\s*,?/gi, '');
}

function enhance(html) {
  html = sanitize(html);

  if (!html.includes('ui-refinement.css')) {
    html = html.replace('</head>',
      '<link rel="stylesheet" href="./ui-refinement.css?v=20">' +
      '<link rel="stylesheet" href="./performance-tuning.css?v=20">' +
      '</head>');
  }

  if (!html.includes('ui-refinement.js')) {
    html = html.replace('</body>',
      '<script src="./ui-refinement.js?v=20"><\/script>' +
      '<script src="./security-lockdown.js?v=20"><\/script>' +
      '<script src="./runtime-cleanup.js?v=20"><\/script>' +
      '<script src="./performance-tuning.js?v=20"><\/script>' +
      '<script src="./final-audit.js?v=20"><\/script>' +
      '</body>');
  }

  return html;
}

async function enhancedNavigation(request) {
  try {
    const response = await fetch(request, { cache: 'no-store' });
    if (!response.ok) return response;

    const headers = new Headers(response.headers);
    headers.delete('content-length');
    const html = enhance(await response.text());
    const result = new Response(html, {
      status: response.status,
      statusText: response.statusText,
      headers
    });

    const cache = await caches.open(CACHE);
    await cache.put('./__offline.html', result.clone());
    return result;
  } catch (_) {
    const cache = await caches.open(CACHE);
    return (await cache.match('./__offline.html')) || new Response('Offline', { status: 503 });
  }
}

function stableApiKey(request) {
  const url = new URL(request.url);
  if (url.hostname === 'raw.githubusercontent.com') url.search = '';
  return new Request(url.toString(), { method: 'GET' });
}

async function networkFirstApi(request) {
  const cache = await caches.open(API_CACHE);
  const key = stableApiKey(request);
  try {
    const response = await fetch(request, { cache: 'no-store' });
    if (response.ok) {
      await cache.put(key, response.clone());
      return response;
    }
    return (await cache.match(key)) || response;
  } catch (_) {
    return (await cache.match(key)) || new Response('{}', {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.mode === 'navigate') {
    event.respondWith(enhancedNavigation(request));
    return;
  }

  if (url.hostname === 'api.github.com') {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      event.respondWith(new Response(JSON.stringify({ error: 'Browser-side GitHub writes are disabled' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      }));
      return;
    }
    event.respondWith(fetch(request, { cache: 'no-store' }).catch(() => new Response('{}', { status: 503 })));
    return;
  }

  if (url.hostname === 'open.er-api.com' ||
      (url.hostname === 'raw.githubusercontent.com' && url.pathname.includes('/anasfityan/price-app/'))) {
    event.respondWith(networkFirstApi(request));
    return;
  }

  if (request.method === 'GET' && url.origin === self.location.origin) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      const cached = await cache.match(request);
      if (cached) return cached;
      try {
        const response = await fetch(request, { cache: 'no-cache' });
        if (response.ok) await cache.put(request, response.clone());
        return response;
      } catch (_) {
        return new Response('', { status: 408 });
      }
    })());
  }
});
