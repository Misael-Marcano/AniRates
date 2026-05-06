import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ContenidoView from "./ContenidoView";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:5000";

type Tipo = "anime" | "manga";

interface JikanData {
  mal_id: number;
  title: string;
  title_english?: string;
  synopsis?: string;
  images?: { jpg?: { large_image_url?: string; image_url?: string } };
  score?: number;
  scored_by?: number;
  year?: number;
  episodes?: number;
  chapters?: number;
  volumes?: number;
  duration?: string;
  genres?: { name: string }[];
  studios?: { name: string }[];
  authors?: { name: string }[];
  type?: string;
  status?: string;
  aired?: { from?: string; to?: string };
  published?: { from?: string; to?: string };
}

async function fetchJikan(tipo: Tipo, id: string): Promise<JikanData | null> {
  try {
    const res = await fetch(`https://api.jikan.moe/v4/${tipo}/${id}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data: JikanData };
    return json?.data ?? null;
  } catch {
    return null;
  }
}

interface PageProps {
  params: Promise<{ tipo: string; id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tipo, id } = await params;
  if (tipo !== "anime" && tipo !== "manga") return { title: "Contenido no encontrado" };

  const data = await fetchJikan(tipo, id);
  if (!data) return { title: "Contenido no encontrado" };

  const title = data.title_english || data.title;
  const desc = data.synopsis ? data.synopsis.slice(0, 200).trim() + (data.synopsis.length > 200 ? "…" : "") : `${title} en AniRate`;
  const image = data.images?.jpg?.large_image_url ?? data.images?.jpg?.image_url;
  const path = `/contenido/${tipo}/${id}`;
  const canonical = `${SITE_URL}${path}`;

  return {
    title,
    description: desc,
    alternates: { canonical },
    openGraph: {
      type: "video.tv_show",
      url: canonical,
      title,
      description: desc,
      images: image ? [{ url: image, alt: title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      images: image ? [image] : undefined,
    },
  };
}

function buildJsonLd(tipo: Tipo, data: JikanData) {
  const isAnime = tipo === "anime";
  const dateStart = isAnime ? data.aired?.from : data.published?.from;
  const dateEnd = isAnime ? data.aired?.to : data.published?.to;

  const base: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": isAnime ? "TVSeries" : "Book",
    name: data.title_english || data.title,
    alternateName: data.title,
    description: data.synopsis,
    image: data.images?.jpg?.large_image_url,
    genre: data.genres?.map((g) => g.name) ?? [],
    inLanguage: "ja",
  };

  if (data.score && data.scored_by) {
    base.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: data.score,
      ratingCount: data.scored_by,
      bestRating: 10,
      worstRating: 1,
    };
  }

  if (isAnime) {
    if (data.episodes) base.numberOfEpisodes = data.episodes;
    if (data.studios?.length) base.productionCompany = data.studios.map((s) => ({ "@type": "Organization", name: s.name }));
    if (dateStart) base.startDate = dateStart;
    if (dateEnd) base.endDate = dateEnd;
  } else {
    if (data.volumes) base.numberOfPages = data.volumes;
    if (data.authors?.length) base.author = data.authors.map((a) => ({ "@type": "Person", name: a.name }));
    if (dateStart) base.datePublished = dateStart;
  }

  return base;
}

export default async function Page({ params }: PageProps) {
  const { tipo, id } = await params;
  if (tipo !== "anime" && tipo !== "manga") notFound();

  const data = await fetchJikan(tipo as Tipo, id);
  const jsonLd = data ? buildJsonLd(tipo as Tipo, data) : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ContenidoView />
    </>
  );
}
