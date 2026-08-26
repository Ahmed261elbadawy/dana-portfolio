// Minimal service worker, present only to satisfy PWA installability checks.
// Deliberately no fetch handler - intercepting requests without a real
// caching strategy risks breaking navigation and form/Server Action
// submissions instead of just passing them through.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
