"use client";

import { useEffect } from "react";

// Actively unregisters any service worker instead of waiting for the
// browser's own (sometimes slow/throttled) update check to notice the
// kill-switch version. Runs once per browser via a flag, so it doesn't
// reload in a loop.
export function ServiceWorkerCleanup() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    if (sessionStorage.getItem("sw-cleanup-done")) return;

    navigator.serviceWorker.getRegistrations().then((registrations) => {
      if (registrations.length === 0) {
        sessionStorage.setItem("sw-cleanup-done", "1");
        return;
      }
      Promise.all(registrations.map((r) => r.unregister())).then(() => {
        sessionStorage.setItem("sw-cleanup-done", "1");
        window.location.reload();
      });
    });
  }, []);

  return null;
}
