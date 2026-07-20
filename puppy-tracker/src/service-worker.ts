/// <reference types="@sveltejs/kit" />
/// <reference lib="webworker" />

import { build, files, version } from '$service-worker';

const sw = self as unknown as ServiceWorkerGlobalScope;

const CACHE = `puppy-cache-${version}`;
// Precache the built app shell + static assets (icons, manifest).
const ASSETS = [...build, ...files];

sw.addEventListener('install', (event) => {
	event.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => sw.skipWaiting()));
});

sw.addEventListener('activate', (event) => {
	event.waitUntil(
		(async () => {
			for (const key of await caches.keys()) {
				if (key !== CACHE) await caches.delete(key);
			}
			await sw.clients.claim();
		})()
	);
});

sw.addEventListener('fetch', (event) => {
	const req = event.request;
	if (req.method !== 'GET') return;

	const url = new URL(req.url);
	// Never cache API responses — stale "last fed" would be dangerous.
	if (url.pathname.startsWith('/api/')) return;

	// Cache-first for our own precached assets.
	if (ASSETS.includes(url.pathname)) {
		event.respondWith(caches.match(req).then((r) => r ?? fetch(req)));
		return;
	}

	// Network-first for navigations, falling back to cache when offline.
	if (req.mode === 'navigate') {
		event.respondWith(fetch(req).catch(() => caches.match('/') as Promise<Response>));
	}
});
