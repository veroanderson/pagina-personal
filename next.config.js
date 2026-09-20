/** @type {import('next').NextConfig} */

// CSP base.
//
// Honestidad sobre qué protege y qué no: con 'unsafe-inline' y 'unsafe-eval' en
// script-src, esta CSP NO frena XSS — si un atacante logra inyectar un <script>
// en la página, se ejecuta. Lo que sí hace es acotar el daño: `connect-src
// 'self'` impide exfiltrar datos a un dominio externo, `object-src 'none'`
// bloquea plugins, `base-uri 'self'` impide reescribir la base de las URLs
// relativas, y `frame-ancestors 'none'` bloquea clickjacking.
//
// Los dos 'unsafe-*' son necesarios para el runtime de Next 14 sin CSP basada
// en nonces. Una CSP con nonces sí frena XSS, pero exige generar el nonce por
// request en el middleware y propagarlo — más complejidad de la que justifica
// un sitio institucional. Si el proyecto maneja datos sensibles, esa es la
// mejora a hacer primero.
const SUPABASE_ORIGIN = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin
  : null;
const SUPABASE_HOSTNAME = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : null;

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob:${SUPABASE_ORIGIN ? ` ${SUPABASE_ORIGIN}` : ''}`,
  "font-src 'self' data:",
  `connect-src 'self'${SUPABASE_ORIGIN ? ` ${SUPABASE_ORIGIN}` : ''}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

const nextConfig = {
  images: {
    remotePatterns: SUPABASE_HOSTNAME
      ? [{ protocol: 'https', hostname: SUPABASE_HOSTNAME }]
      : [],
  },
  // No exponer la versión de Next.js en las respuestas: es información gratis
  // para quien busca instalaciones con una CVE conocida sin parchear.
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          // Legacy, redundante con frame-ancestors de la CSP, pero sigue siendo
          // lo único que entienden algunos navegadores viejos.
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Content-Security-Policy', value: CONTENT_SECURITY_POLICY },
          // X-XSS-Protection está deprecado y los browsers modernos lo ignoran
          // (en versiones viejas de Chrome llegó a ser explotable). No se
          // incluye a propósito.
        ],
      },
      {
        // El panel admin nunca debe quedar cacheado en un proxy intermedio ni
        // en el historial del navegador.
        source: '/admin/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store, max-age=0' }],
      },
    ];
  },
};

module.exports = nextConfig;
