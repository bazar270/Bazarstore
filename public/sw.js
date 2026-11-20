const offlinePage='/offline.html';
const cacheName='bazar-offline-v1';
self.addEventListener('install',event=>{
 event.waitUntil((async()=>{const cache=await caches.open(cacheName);await cache.add(offlinePage);await self.skipWaiting()})())
});
self.addEventListener('activate',event=>{
 event.waitUntil((async()=>{for(const key of await caches.keys())if(key.startsWith('bazar-offline-')&&key!==cacheName)await caches.delete(key);await self.clients.claim()})())
});
self.addEventListener('fetch',event=>{
 const req=event.request;
 if(req.method!=='GET'||req.mode!=='navigate'||new URL(req.url).origin!==self.location.origin)return;
 event.respondWith(fetch(req).catch(async()=>await caches.match(offlinePage)||Response.error()))
});
