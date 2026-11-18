// Service Worker: App läuft auch offline. Version wird beim Bauen gesetzt.
const V = 'budget-655905d7c0';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icon.svg', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url);
  // Seite selbst: zuerst Netz (damit Updates ankommen), offline aus dem Speicher
  if (r.mode === 'navigate') {
    e.respondWith(fetch(r).then(res => { const cp = res.clone(); caches.open(V).then(c => c.put('index.html', cp)); return res; })
      .catch(() => caches.match('index.html')));
    return;
  }
  // Schriften von Google: aus dem Speicher, im Hintergrund auffrischen
  if (u.host === 'fonts.googleapis.com' || u.host === 'fonts.gstatic.com') {
    e.respondWith(caches.open(V).then(c => c.match(r).then(hit => { const net = fetch(r).then(res => { c.put(r, res.clone()); return res; }).catch(() => hit); return hit || net; })));
    return;
  }
  if (u.origin === location.origin) e.respondWith(caches.match(r).then(hit => hit || fetch(r)));
});
