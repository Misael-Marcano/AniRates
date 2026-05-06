import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:5000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/configuracion",
          "/configuracion/*",
          "/login",
          "/registro",
          "/recuperar-contrasena",
          "/resetear-contrasena/*",
          "/verificar-email/*",
          "/admin",
          "/admin/*",
          "/api/*",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
