// Kill switch: an earlier version of this file registered a fetch
// handler that broke navigation on some browsers. This version
// self-unregisters and reloads any open tabs the moment it takes over,
// so anyone who already installed the broken one gets fixed
// automatically on their next visit, no manual steps required.
self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      await self.registration.unregister();
      const clientsList = await self.clients.matchAll({ type: "window" });
      for (const client of clientsList) {
        client.navigate(client.url);
      }
    })(),
  );
});
