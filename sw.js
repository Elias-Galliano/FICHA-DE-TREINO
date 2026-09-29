const CACHE='treino-elias-v4-animacoes3d';
const CORE=['./','index.html','styles.css','app.js','data.json','media.json','manifest.webmanifest','assets/icons/icon-192.png','assets/icons/icon-512.png','assets/Ficha_Treino_Elias.pdf'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const url=new URL(e.request.url);
  if(url.origin!==self.location.origin)return;
  if(url.pathname.includes('/assets/videos/') || e.request.headers.has('range'))return;
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(resp=>{if(resp&&resp.ok){const copy=resp.clone();caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{});}return resp}).catch(()=>caches.match('index.html'))));
});
