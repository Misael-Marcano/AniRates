"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import HeroCarousel from "@/components/HeroCarousel";
import Card from "@/components/Card";
import { jikanApi, refineHeroSlidesForDisplay } from "@/services/jikan";
import { enrichHeroSlidesWithAnilistCovers } from "@/services/heroCoverArt";
import { mockAnime, mockManga, mockTop } from "@/lib/mockData";
import {
  DEFAULT_HERO_DIMENSION_OPTS,
  RELAXED_HERO_DIMENSION_OPTS,
  filterHeroSlidesByMinDimensions,
} from "@/lib/heroImageDimensions";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { useRecommendations } from "@/hooks/useRecommendations";
import { recomendacionesApi, type RecomendacionItem } from "@/services/api";
import type { Contenido } from "@/types";
import Link from "next/link";
import { SkeletonHomeCardStrip } from "@/components/Skeleton";

const HERO_MERGE_POOL = 22;

interface ContentRowProps {
  title: string;
  items: Contenido[];
  showRank?: boolean;
  href?: string;
  accent?: boolean;
  loading?: boolean;
  skeletonCount?: number;
}

function ContentRow({
  title,
  items,
  showRank = false,
  href = "/buscar",
  accent = false,
  loading = false,
  skeletonCount = 12,
}: ContentRowProps) {
  const tt = useTranslations("home");
  const tc = useTranslations("common");
  const { isMobile, isTablet } = useBreakpoint();
  const hPadPx = isMobile ? 16 : isTablet ? 24 : 44;
  const hPad = `${hPadPx}px`;
  const scrollGap = isMobile ? 10 : 16;
  const cardWidth = isMobile ? "140px" : isTablet ? "160px" : "180px";
  const cardWidthNum = isMobile ? 140 : isTablet ? 160 : 180;

  return (
    <section className="home-section-band" aria-busy={loading} aria-live={loading ? "polite" : undefined}>
      {loading ? (
        <span className="sr-only">{`${title} — ${tc("loading")}`}</span>
      ) : null}
      <div className="home-section-inner">
        <div className="home-section-head">
          <h2 className="home-section-title">
            {accent && (
              <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f5c518", borderRadius: "6px", padding: "2px 6px" }}>
                <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "14px", color: "#3d2f00", fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              </span>
            )}
            {title}
          </h2>
          <Link href={href} className="home-section-seeall" aria-hidden={loading}>
            {tt("seeAll")}
          </Link>
        </div>
        {loading ? (
          <SkeletonHomeCardStrip
            count={skeletonCount}
            cardWidth={cardWidthNum}
            gap={scrollGap}
            hPad={hPadPx}
            showRank={showRank}
          />
        ) : (
          <div
            className="hide-scrollbar home-section-scroll"
            style={{ display: "flex", gap: scrollGap, overflowX: "auto", padding: `8px ${hPad} 4px` }}
          >
            {items.map((item, i) => (
              <div key={item.id} style={{ width: cardWidth, flexShrink: 0 }}>
                <Card item={item} rank={showRank ? i + 1 : undefined} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function noveltyKey(c: Contenido): string {
  return `${c.tipo}-${c.jikan_id ?? c.id}`;
}

function dedupeByKey(items: Contenido[]): Contenido[] {
  const seen = new Set<string>();
  const out: Contenido[] = [];
  for (const c of items) {
    const k = noveltyKey(c);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(c);
  }
  return out;
}

/** Alterna anime (temporada + próximos) con manga reciente para equilibrar el carrusel. */
function mergeNoveltySlides(
  seasonNow: Contenido[],
  upcomingAnime: Contenido[],
  recentManga: Contenido[],
  max = 14
): Contenido[] {
  const anime = dedupeByKey([...seasonNow, ...upcomingAnime]);
  const manga = dedupeByKey(recentManga);
  const seen = new Set<string>();
  const out: Contenido[] = [];
  let ai = 0;
  let mi = 0;
  while (out.length < max && (ai < anime.length || mi < manga.length)) {
    const takeAnimeFirst = out.length % 2 === 0;
    if (takeAnimeFirst && ai < anime.length) {
      const c = anime[ai++]!;
      const k = noveltyKey(c);
      if (!seen.has(k)) {
        seen.add(k);
        out.push(c);
      }
      continue;
    }
    if (!takeAnimeFirst && mi < manga.length) {
      const c = manga[mi++]!;
      const k = noveltyKey(c);
      if (!seen.has(k)) {
        seen.add(k);
        out.push(c);
      }
      continue;
    }
    if (ai < anime.length) {
      const c = anime[ai++]!;
      const k = noveltyKey(c);
      if (!seen.has(k)) {
        seen.add(k);
        out.push(c);
      }
      continue;
    }
    if (mi < manga.length) {
      const c = manga[mi++]!;
      const k = noveltyKey(c);
      if (!seen.has(k)) {
        seen.add(k);
        out.push(c);
      }
    }
  }
  return out;
}

async function refineHeroAfterEnrichment(enriched: Contenido[], minSlides: number, limit = 14): Promise<Contenido[]> {
  let filtered = await filterHeroSlidesByMinDimensions(enriched, DEFAULT_HERO_DIMENSION_OPTS);
  let refined = refineHeroSlidesForDisplay(filtered, limit);
  if (refined.length < minSlides) {
    filtered = await filterHeroSlidesByMinDimensions(enriched, RELAXED_HERO_DIMENSION_OPTS);
    refined = refineHeroSlidesForDisplay(filtered, limit);
  }
  if (refined.length < minSlides) {
    refined = refineHeroSlidesForDisplay(enriched, limit);
  }
  return refined;
}

function recItemToContenido(r: RecomendacionItem): Contenido {
  return {
    id: r.contenido_id,
    jikan_id: r.jikan_id ?? undefined,
    titulo: r.titulo,
    descripcion: "",
    imagen: r.imagen ?? "",
    año: r.año ?? 0,
    estado: "",
    tipo: r.tipo as "ANIME" | "MANGA",
    generos: r.generos,
    rating_promedio: r.rating_promedio,
    total_ratings: r.total_ratings,
  };
}

export default function HomePage() {
  const t = useTranslations("home");
  const [anime, setAnime] = useState<Contenido[]>([]);
  const [manga, setManga] = useState<Contenido[]>([]);
  const [top, setTop] = useState<Contenido[]>([]);
  const [jikanRowsLoaded, setJikanRowsLoaded] = useState(false);
  const [sessionTokenPresent, setSessionTokenPresent] = useState(false);
  const [heroSlides, setHeroSlides] = useState<Contenido[]>(() =>
    mergeNoveltySlides(mockAnime.slice(0, 6), mockAnime.slice(2, 5), mockManga.slice(0, 5), 12)
  );
  const [serverRecs, setServerRecs] = useState<Contenido[]>([]);
  const [serverStrategy, setServerStrategy] = useState<string | null>(null);
  const { isMobile } = useBreakpoint();
  const { items: recItems, topGenres, ready: recReady, loading: recLoading } = useRecommendations();

  useEffect(() => {
    setSessionTokenPresent(Boolean(typeof window !== "undefined" && localStorage.getItem("token")));
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      let seasonNow: Contenido[] = [];

      // Fase 1 — Una sola petición Jikan: temporada en emisión para rellenar el hero antes que el resto.
      try {
        seasonNow = await jikanApi.getSeasonNow(25);
      } catch {
        // La fase 2 sigue trayendo trending / top / upcoming / manga.
      }
      if (cancelled) return;

      if (seasonNow.length > 0) {
        try {
          const quickPool = mergeNoveltySlides(seasonNow, [], [], HERO_MERGE_POOL);
          let enriched = await enrichHeroSlidesWithAnilistCovers(quickPool);
          let quick = await refineHeroAfterEnrichment(enriched, 4, 14);
          if (quick.length < 4) {
            enriched = await enrichHeroSlidesWithAnilistCovers(dedupeByKey(seasonNow).slice(0, 14));
            quick = await refineHeroAfterEnrichment(enriched, 4, 14);
          }
          if (!cancelled && quick.length > 0) {
            setHeroSlides(quick);
          }
        } catch {
          // Se mantiene el mock inicial del hero hasta la fase 3.
        }
      }

      // Fase 2 — Primero las filas (lo que está debajo del fold): menos sensación de “todo a la vez”.
      let trendingAnime: Contenido[] = [];
      let trendingManga: Contenido[] = [];
      let topAnime: Contenido[] = [];
      try {
        [trendingAnime, trendingManga, topAnime] = await Promise.all([
          jikanApi.getTrendingAnime(12),
          jikanApi.getTrendingManga(12),
          jikanApi.getTopAnime(10),
        ]);
        if (!cancelled) {
          setAnime(trendingAnime);
          setManga(trendingManga);
          setTop(topAnime);
        }
      } catch {
        if (!cancelled) {
          setAnime(mockAnime);
          setManga(mockManga);
          setTop(mockTop);
        }
      }
      if (!cancelled) setJikanRowsLoaded(true);

      // Fase 3 — Completar el hero mezclando temporada + próximos + manga (sigue usando la cola global de Jikan).
      try {
        const [upcomingAnime, recentManga] = await Promise.all([
          jikanApi.getSeasonUpcoming(25),
          jikanApi.getRecentPublishingManga(25),
        ]);
        if (cancelled) return;

        const seasonBase = seasonNow.length > 0 ? seasonNow : trendingAnime.slice(0, 14);
        const pooled = mergeNoveltySlides(seasonBase, upcomingAnime, recentManga, HERO_MERGE_POOL);
        let enriched = await enrichHeroSlidesWithAnilistCovers(pooled);
        let heroReady = await refineHeroAfterEnrichment(enriched, 6, 14);
        if (heroReady.length < 6) {
          const fbPool = mergeNoveltySlides(
            trendingAnime.slice(0, 14),
            [],
            trendingManga.slice(0, 14),
            HERO_MERGE_POOL,
          );
          enriched = await enrichHeroSlidesWithAnilistCovers(fbPool);
          heroReady = await refineHeroAfterEnrichment(enriched, 6, 14);
        }
        if (!cancelled && heroReady.length > 0) {
          setHeroSlides(heroReady);
        }
      } catch {
        // Hero puede quedar en fase 1 o mock.
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return;
    async function loadServerRecs() {
      try {
        const data = await recomendacionesApi.getForMe(20);
        setServerRecs(data.items.map(recItemToContenido));
        setServerStrategy(data.strategy);
      } catch {
        setServerRecs([]);
      }
    }
    loadServerRecs();
  }, []);

  const paraTiItems = serverRecs.length > 0 ? serverRecs : recItems;
  const paraTiTitle = serverRecs.length > 0
    ? (serverStrategy === "cf" ? t("forYouCf") : t("forYouGenres", { genres: topGenres.slice(0, 2).join(", ") || t("favoriteGenres") }))
    : t("forYouGenres", { genres: topGenres.slice(0, 2).join(", ") });
  const showParaTiSkeleton =
    sessionTokenPresent && serverRecs.length === 0 && recLoading && paraTiItems.length === 0;
  const showParaTiRow = serverRecs.length > 0 || (recReady && paraTiItems.length > 0);

  return (
    <div className="home-shell" style={{ paddingTop: "64px" }}>
      <HeroCarousel items={heroSlides} />
      <div className="home-feed-inner" style={{ paddingTop: isMobile ? "28px" : "40px", paddingBottom: "32px" }}>
        {showParaTiSkeleton && (
          <ContentRow
            title={t("forYouGenres", { genres: t("favoriteGenres") })}
            items={[]}
            href="/recomendaciones"
            accent
            loading
            skeletonCount={isMobile ? 6 : 10}
          />
        )}
        {showParaTiRow && (
          <ContentRow
            title={paraTiTitle}
            items={paraTiItems}
            href="/recomendaciones"
            accent
          />
        )}
        <ContentRow
          title={t("trendingAnime")}
          items={anime}
          href="/buscar?tipo=ANIME"
          loading={!jikanRowsLoaded}
          skeletonCount={12}
        />
        <ContentRow
          title={t("trendingManga")}
          items={manga}
          href="/buscar?tipo=MANGA"
          loading={!jikanRowsLoaded}
          skeletonCount={12}
        />
        <ContentRow
          title={t("topRated")}
          items={top}
          showRank
          href="/buscar"
          loading={!jikanRowsLoaded}
          skeletonCount={10}
        />
        <ContentRow
          title={t("popular")}
          items={[...anime.slice(0, 6), ...manga.slice(0, 6)]}
          loading={!jikanRowsLoaded}
          skeletonCount={12}
        />
      </div>

      <footer className="home-footer">
        <span style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, color: "#f5c518", fontSize: "1.15rem", letterSpacing: "-0.02em" }}>AniRate</span>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "var(--color-outline)", letterSpacing: "0.05em", textAlign: "center" }}>
          {t("footerTagline", { year: new Date().getFullYear() })}
        </span>
      </footer>
    </div>
  );
}
