// Service worker de Canasta Salta. Sirve para (1) poder instalar la app y (2) abrirla aunque no haya conexión, mostrando lo último que se vio.
// Los precios cambian todos los días: la página y los scripts se piden SIEMPRE a la red primero (con revalidación) y solo se usa la copia
// guardada si no hay conexión o tarda más de 4 s. Las imágenes usan la copia guardada y se refrescan por detrás (su URL lleva un hash).
// No toca nada que no sea de este sitio (salvo la tipografía): los avisos y la medición van directo a Supabase, sin pasar por acá.
const V = "canasta-salta-v1";
const FUENTES = "canasta-salta-fuentes-v1";
const BASE = ["./", "manifest.webmanifest", "assets/icons/icon-192.png", "assets/favicon.png", "assets/marca-claro.png", "assets/marca-oscuro.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(BASE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V && k !== FUENTES).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

const guardar = (req, res) => { if (res && res.ok) { const copia = res.clone(); caches.open(V).then(c => c.put(req, copia)); } return res; };

const redPrimero = req => {
  const red = fetch(req, { cache: "no-cache" }).then(res => guardar(req, res));
  const plazo = new Promise((_, no) => setTimeout(no, 4000));
  return Promise.race([red, plazo]).catch(() => caches.match(req).then(r => r || red.catch(() => caches.match("./"))));
};

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    e.respondWith(caches.open(FUENTES).then(c => c.match(req).then(r => r || fetch(req).then(res => { c.put(req, res.clone()); return res; }))));
    return;
  }
  if (url.origin !== location.origin) return;
  const pagina = req.mode === "navigate" || /\.(html|js|json|webmanifest)$/.test(url.pathname) || url.pathname.endsWith("/");
  if (pagina) { e.respondWith(redPrimero(req)); return; }
  e.respondWith(caches.match(req).then(viejo => {
    const nuevo = fetch(req).then(res => guardar(req, res)).catch(() => viejo);
    return viejo || nuevo;
  }));
});
