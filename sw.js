const CACHE='treino-elias-v2-video';
const CORE=['./','index.html','styles.css','app.js','data.json','manifest.webmanifest','assets/icons/icon-192.png','assets/icons/icon-512.png','assets/Ficha_Treino_Elias.pdf',
'assets/exercises/a_01.webp','assets/exercises/a_02.webp','assets/exercises/a_03.webp','assets/exercises/a_04.webp','assets/exercises/a_05.webp','assets/exercises/a_06.webp','assets/exercises/a_07.webp','assets/exercises/a_08.webp','assets/exercises/a_09.webp','assets/exercises/a_10.webp','assets/exercises/a_11.webp','assets/exercises/a_12.webp',
'assets/exercises/b_01.webp','assets/exercises/b_02.webp','assets/exercises/b_03.webp','assets/exercises/b_04.webp','assets/exercises/b_05.webp','assets/exercises/b_06.webp','assets/exercises/b_07.webp','assets/exercises/b_08.webp','assets/exercises/b_09.webp','assets/exercises/b_10.webp','assets/exercises/b_11.webp',
'assets/exercises/c_01.webp','assets/exercises/c_02.webp','assets/exercises/c_03.webp','assets/exercises/c_04.webp','assets/exercises/c_05.webp','assets/exercises/c_06.webp','assets/exercises/c_07.webp','assets/exercises/c_08.webp','assets/exercises/c_09.webp','assets/exercises/c_10.webp','assets/exercises/c_11.webp','assets/exercises/c_12.webp'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const url=new URL(e.request.url);
  if(/\.(mp4|webm)$/i.test(url.pathname)){e.respondWith(fetch(e.request));return;}
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(resp=>{if(resp&&resp.ok){const copy=resp.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));}return resp}).catch(()=>caches.match('index.html'))));
});
