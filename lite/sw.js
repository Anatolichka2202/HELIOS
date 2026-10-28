"use strict";
// Offline shell only. No analytics, push notifications or background sync.
const CACHE="helios-venus-shell-v0.8.0";
const ASSETS=[
 "./","./index.html","./style.css","./engine.js","./ecosystem.js","./scenes.js","./cinema.js","./game.js",
 "./manifest.webmanifest","./assets/helios-icon.svg","./assets/venus-clouds.svg"
];
self.addEventListener("install",event=>{
 event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith("helios-venus-shell-")&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener("fetch",event=>{
 const request=event.request;
 if(request.method!=="GET"||new URL(request.url).origin!==self.location.origin)return;
 event.respondWith(caches.match(request).then(cached=>cached||fetch(request)));
});
