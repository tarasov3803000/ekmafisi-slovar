/* «Словарь» — service worker. Оболочка (страница, код, значки, шрифты) — в кэш при установке, отдаётся из кэша.
   Статьи и звук сюда не попадают: их кладёт в свой кэш slovar.js после входа (общий с Экмафиси — один адрес github.io). */
const VERSION = '4b9d608d85';  /* tools/app.py slovar-site ставит сюда отпечаток файлов оболочки */
const SHELL = 'slovar-shell-' + VERSION;  /* не «ekmafisi-shell-»: тот кэш чистит service worker Экмафиси */
const FILES = ['./', 'index.html', 'tokeny.css', 'main.js', 'sync.js', 'slovar.js', 'config.js', 'vendor/supabase.js', 'manifest.webmanifest',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-512.png', 'icons/apple-touch-icon.png', 'icons/favicon-32.png'];
const FONTS = /^https:\/\/fonts\.(googleapis|gstatic)\.com\//;

self.addEventListener('install', e => {
  e.waitUntil(caches.open(SHELL).then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('slovar-shell-') && k !== SHELL).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin === location.origin && u.pathname.startsWith(new URL(self.registration.scope).pathname)) {
    if (r.mode === 'navigate') { e.respondWith(caches.match('index.html', { ignoreSearch: true }).then(x => x || fetch(r))); return; }
    e.respondWith(caches.match(r, { ignoreSearch: true }).then(x => x || fetch(r)));
    return;
  }
  if (FONTS.test(r.url)) {
    e.respondWith(caches.open(SHELL).then(c => c.match(r).then(x => x || fetch(r).then(resp => { if (resp.ok || resp.type === 'opaque') c.put(r, resp.clone()); return resp; }))));
  }
});
