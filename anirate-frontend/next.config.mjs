import { withSentryConfig } from "@sentry/nextjs";

const apiOrigin = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001").origin;
  } catch {
    return "http://localhost:5001";
  }
})();

const sentryHost = process.env.NEXT_PUBLIC_SENTRY_DSN
  ? `https://${new URL(process.env.NEXT_PUBLIC_SENTRY_DSN).host}`
  : "";

const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  `script-src 'self' 'unsafe-inline' ${sentryHost}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https://myanimelist.net https://*.myanimelist.net https://s4.anilist.co https://files.anilist.media https://img1.ak.crunchyroll.com https://img1.akcache.crunchyroll.com https://image.tmdb.org https://media.kitsu.app https://media.kitsu.io",
  `connect-src 'self' ${apiOrigin} https://api.jikan.moe ${sentryHost}`,
  "media-src 'self' https://www.youtube.com https://i.ytimg.com",
  "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com",
  "manifest-src 'self'",
  "worker-src 'self' blob:",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), payment=(), notifications=(self), push=(self)",
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    minimumCacheTTL: 60 * 60 * 24 * 7,
    remotePatterns: [
      { protocol: "https", hostname: "myanimelist.net" },
      { protocol: "https", hostname: "cdn.myanimelist.net" },
      { protocol: "https", hostname: "s4.anilist.co" },
      { protocol: "https", hostname: "files.anilist.media" },
      { protocol: "https", hostname: "api-cdn.myanimelist.net" },
      { protocol: "https", hostname: "image.myanimelist.net" },
      { protocol: "https", hostname: "img1.ak.crunchyroll.com" },
      { protocol: "https", hostname: "img1.akcache.crunchyroll.com" },
      { protocol: "https", hostname: "image.tmdb.org" },
      { protocol: "https", hostname: "media.kitsu.app" },
      { protocol: "https", hostname: "media.kitsu.io" },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

const sentryEnabled = Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN);

export default sentryEnabled
  ? withSentryConfig(nextConfig, {
      silent: true,
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      hideSourceMaps: true,
      disableLogger: true,
    })
  : nextConfig;
