'use client';

import { useEffect } from 'react';

export function SWRegistration() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    if (process.env.NODE_ENV !== 'production') {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => registration.unregister());
      }).catch((err) => {
        console.error('ServiceWorker cleanup failed: ', err);
      });

      if ('caches' in window) {
        caches.keys().then((cacheNames) => {
          cacheNames
            .filter((cacheName) => cacheName.startsWith('kisanmind-') || cacheName.startsWith('forkisan-'))
            .forEach((cacheName) => caches.delete(cacheName));
        }).catch((err) => {
          console.error('Cache cleanup failed: ', err);
        });
      }

      return;
    }

    const registerServiceWorker = () => {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.error('ServiceWorker registration failed: ', err);
      });
    };

    window.addEventListener('load', registerServiceWorker);

    return () => {
      window.removeEventListener('load', registerServiceWorker);
    };
  }, []);

  return null;
}
