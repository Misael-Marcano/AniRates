import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AniRate",
    short_name: "AniRate",
    description: "Tu plataforma de descubrimiento, rating y reseñas de anime y manga.",
    start_url: "/",
    display: "standalone",
    background_color: "#0f0f0f",
    theme_color: "#f5c518",
    orientation: "portrait",
    categories: ["entertainment", "lifestyle", "social"],
    lang: "es",
    icons: [
      { src: "/favicon.ico", sizes: "any", type: "image/x-icon" },
    ],
  };
}
