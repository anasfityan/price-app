const CACHE = 'trendy-v14';
const APP_SHELL = ['./index.html','./ui-refinement.css','./ui-refinement.js','./security-lockdown.js','./runtime-cleanup.js','./manifest.json'];
const API_CACHE = 'trendy-api-v2';

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.all(APP_SHELL.map(path =>
        fetch(path).then(r => r.ok ? c.put(path, r.clone()) : null).catch(() => null)
      )))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE && k !== API_CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

function sanitizeLegacyHtml(html){
  return html
    .replace(/const\s+_c\s*=\s*atob\([^;]+\);?/g, "const _c = ''; // disabled: browser-side GitHub credentials are not allowed")
    .replace(/,\s*user-scalable\s*=\s*no/gi, '')
    .replace(/user-scalable\s*=\s*no\s*,?/gi, '');
}

async function injectUiRefinements(response){
  if(!response || !response.ok) return response;
  const type = response.headers.get('content-type') || '';
  if(!type.includes('text/html')) return response;

  let html = sanitizeLegacyHtml(await response.text());
  if(!html.includes('ui-refinement.css')) {
    html = html.replace('</head>', '<link rel="stylesheet" href="./ui-refinement.css">\n</head>');
  }
  if(!html.includes('ui-refinement.js')) {
    html = html.replace('</body>', '<script src="./ui-refinement.js"></script>\n</body>');
  }
  if(!html.includes('security-lockdown.js')) {
    html = html.replace('</body>', '<script src="./security-lockdown.js"></script>\n</body>');
  }
  if(!html.includes('runtime-cleanup.js')) {
    html = html.replace('</body>', '<script src="./runtime-cleanup.js"></script>\n</body>');
  }

  const headers = new Headers(response.headers);
  headers.delete('content-length');
  return new Response(html, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

function stableApiCacheKey(request){
  const u = new URL(request.url);
  if(u.hostname === 'raw.githubusercontent.com') u.search = '';
  return new Request(u.toString(), {method:'GET'});
}

async function networkFirstWithCache(request){
  const cache = await caches.open(API_CACHE);
  const key = stableApiCacheKey(request);
  try {
    const res = await fetch(request, {cache:'no-store'});
    if(res && res.ok) await cache.put(key, res.clone());
    return res;
  } catch(err) {
    const cached = await cache.match(key);
    if(cached) return cached;
    return new Response('{}', {headers:{'Content-Type':'application/json'}});
  }
}

self.addEventListener('fetch', e => {
  const url = e.request.url;

  if (url.includes('raw.githubusercontent.com/anasfityan/price-app/') || url.includes('open.er-api.com')) {
    e.respondWith(networkFirstWithCache(e.request));
    return;
  }

  if (url.includes('api.github.com')) {
    e.respondWith(fetch(e.request).catch(() => new Response('{}', {headers:{'Content-Type':'application/json'}})));
    return;
  }

  if (url.includes('.png') || url.includes('.ico') || url.includes('icon') || url.includes('logo') || url.includes('apple-icon')) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }

  if (e.request.mode === 'navigate') {
    e.respondWith((async () => {
      try {
        const res = await fetch(e.request);
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return injectUiRefinements(res);
      } catch(err) {
        const cached = await caches.match(e.request) || await caches.match('./index.html');
        return injectUiRefinements(cached);
      }
    })());
    return;
  }

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
