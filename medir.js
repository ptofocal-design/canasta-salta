// Medición de visitas ANÓNIMA de Canasta Salta. Sin cookies, sin identificadores, sin IP, sin herramientas de terceros.
// Manda a nuestra base (Supabase, tabla "visitas") solo: qué pantalla (portada/metodología), tipo de pantalla (móvil/tablet/escritorio),
// de qué sitio venís (solo el dominio) y qué botones importantes se tocan. Ver README, "Medición de visitas", y la página de Metodología.
// "visitante nuevo del día" se aproxima guardando en tu dispositivo únicamente la FECHA de tu última visita (no un identificador).
(function () {
  const bot = /bot|crawl|spider|headless|preview|lighthouse|pagespeed/i.test(navigator.userAgent) || navigator.webdriver;
  const local = location.protocol === "file:" || /^(localhost|127\.|192\.168\.)/.test(location.hostname);
  const activo = () => !bot && !local && !!(window.AVISOS && AVISOS.url && AVISOS.key) && navigator.doNotTrack !== "1";
  const hoy = () => new Date().toLocaleDateString("sv-SE");
  const pantalla = () => innerWidth < 640 ? "movil" : innerWidth < 1024 ? "tablet" : "escritorio";
  const origen = () => { try { const h = new URL(document.referrer).hostname.replace(/^www\./, ""); return h === location.hostname ? "" : h.slice(0, 60); } catch (e) { return ""; } };
  const cab = () => AVISOS.key.startsWith("sb_") ? { apikey: AVISOS.key } : { apikey: AVISOS.key, Authorization: "Bearer " + AVISOS.key };

  window.track = function (tipo, detalle, extra) {
    try {
      if (!activo()) return;
      const fila = Object.assign({ tipo: tipo, detalle: detalle ? String(detalle).slice(0, 60) : null, pantalla: pantalla() }, extra || {});
      fetch(AVISOS.url + "/rest/v1/visitas", { method: "POST", keepalive: true,
        headers: Object.assign({ "Content-Type": "application/json", Prefer: "return=minimal" }, cab()), body: JSON.stringify(fila) }).catch(function () {});
    } catch (e) {}
  };

  // La visita se cuenta una vez, apenas está lista la configuración (config-avisos.js se carga aparte).
  let intentos = 0;
  const t = setInterval(function () {
    if (window.AVISOS && AVISOS.url) {
      clearInterval(t);
      let nuevo = false;
      try { const f = localStorage.getItem("cs_v"); if (f !== hoy()) { nuevo = true; localStorage.setItem("cs_v", hoy()); } } catch (e) {}
      window.track("vista", /metodologia/.test(location.pathname) ? "metodologia" : "portada", { nuevo: nuevo, origen: origen() });
    } else if (++intentos > 50) clearInterval(t);
  }, 200);
})();
