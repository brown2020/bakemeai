/**
 * Baseline response headers.
 * script-src and style-src allow inline tags because Next.js emits them for
 * hydration and the font loader. Recipe HTML is not rendered from raw markup.
 * frame-ancestors blocks clickjacking. Firebase Auth popups/iframes are allowed
 * only as frame-src destinations, not as parents of this app.
 */
export const securityHeaders: Array<{ key: string; value: string }> = [
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self' data:",
      "img-src 'self' data: blob: https://firebasestorage.googleapis.com https://storage.googleapis.com https://*.googleusercontent.com https://images.unsplash.com",
      "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://*.firebaseapp.com https://accounts.google.com https://apis.google.com",
      "frame-src https://accounts.google.com https://apis.google.com https://*.google.com https://*.firebaseapp.com",
      "worker-src 'self' blob:",
    ].join("; "),
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
];
