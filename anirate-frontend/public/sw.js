/* AniRates Web Push — scope raíz; payload JSON { title, body, url } */
self.addEventListener('push', (event) => {
  let data = { title: 'AniRates', body: '', url: '/' };
  try {
    const t = event.data?.text();
    if (t) data = { ...data, ...JSON.parse(t) };
  } catch {
    /* ignore */
  }
  event.waitUntil(
    self.registration.showNotification(data.title || 'AniRates', {
      body: data.body || '',
      data: { url: typeof data.url === 'string' ? data.url : '/' },
      icon: '/favicon.ico',
      badge: '/favicon.ico',
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const raw = event.notification?.data?.url || '/';
  const abs =
    typeof raw === 'string' && raw.startsWith('http')
      ? raw
      : new URL(raw, self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const c of clientList) {
        if ('navigate' in c && typeof c.navigate === 'function') {
          return c.navigate(abs).then((ok) => {
            if (ok && 'focus' in c) return c.focus();
            if (self.clients.openWindow) return self.clients.openWindow(abs);
          });
        }
        if (c.url && 'focus' in c) {
          void c.focus();
          return;
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(abs);
    }),
  );
});
