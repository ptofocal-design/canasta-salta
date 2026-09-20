// Configuración del formulario de avisos de precios (Supabase). Ver README, sección "Avisos de usuarios".
// Mientras "url" y "key" estén vacíos, el formulario NO aparece en la página.
//   url:      la "Project URL" de Supabase (Project Settings > API), por ejemplo https://abcdefgh.supabase.co
//   key:      la clave PÚBLICA: "Publishable key" (empieza con sb_publishable_) o la clave "anon public" (eyJ...). Está pensada para ser
//             pública: los permisos los limita setup_avisos.sql. NUNCA pegar acá la clave "secret" ni la "service_role".
//   contacto: mail o WhatsApp del proyecto para que la gente pida borrar su aviso (se muestra en el aviso de privacidad).
window.AVISOS = { url: "https://agiobvgxeopqwqglyuyt.supabase.co", key: "sb_publishable_FvIb2Z7to4qTVI38Qnecgg_dkdR0WyE", contacto: "ptofocal@gmail.com" };
