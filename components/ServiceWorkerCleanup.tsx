"use client";

import { useEffect } from "react";

export function ServiceWorkerCleanup() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) =>
        Promise.all(
          registrations.map((registration) => registration.unregister()),
        ),
      )
      .catch(() => {});

    if ("caches" in window) {
      caches
        .keys()
        .then((cacheNames) =>
          Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName))),
        )
        .catch(() => {});
    }
  }, []);

  return null;
}

