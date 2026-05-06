import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:5000";
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001";

interface CatalogItem {
  jikan_id: number;
  tipo: "ANIME" | "MANGA";
  fecha_actualizado?: string;
}

interface ListaPersonalizada {
  slug: string;
  fecha_actualizada?: string;
}

async function fetchCatalogIds(): Promise<CatalogItem[]> {
  try {
    const res = await fetch(`${API_URL}/contenido/top?limit=500`, { next: { revalidate: 86400 } });
    if (!res.ok) return [];
    const data = (await res.json()) as CatalogItem[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function fetchPublicLists(): Promise<ListaPersonalizada[]> {
  try {
    const res = await fetch(`${API_URL}/listas?publica=true&limit=200`, { next: { revalidate: 86400 } });
    if (!res.ok) return [];
    const data = (await res.json()) as ListaPersonalizada[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${SITE_URL}/buscar`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/temporadas`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/estadisticas`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/listas`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/recomendaciones`, lastModified: now, changeFrequency: "daily", priority: 0.6 },
  ];

  const [catalog, lists] = await Promise.all([fetchCatalogIds(), fetchPublicLists()]);

  const catalogRoutes: MetadataRoute.Sitemap = catalog.map((c) => ({
    url: `${SITE_URL}/contenido/${c.tipo === "ANIME" ? "anime" : "manga"}/${c.jikan_id}`,
    lastModified: c.fecha_actualizado ? new Date(c.fecha_actualizado) : now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const listRoutes: MetadataRoute.Sitemap = lists.map((l) => ({
    url: `${SITE_URL}/listas/${l.slug}`,
    lastModified: l.fecha_actualizada ? new Date(l.fecha_actualizada) : now,
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  return [...staticRoutes, ...catalogRoutes, ...listRoutes];
}
