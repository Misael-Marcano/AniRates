"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Card from "@/components/Card";
import { jikanApi } from "@/services/jikan";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import type { Contenido } from "@/types";

const SEASONS = [
  { val: "winter", label: "Invierno", icon: "ac_unit" },
  { val: "spring", label: "Primavera", icon: "local_florist" },
  { val: "summer", label: "Verano", icon: "wb_sunny" },
  { val: "fall",   label: "Otoño",   icon: "park" },
];

const SEASON_COLORS: Record<string, string> = {
  winter: "#90caf9",
  spring: "#a5d6a7",
  summer: "#ffcc02",
  fall:   "#ffab40",
};

function getCurrentSeason(): { year: number; season: string } {
  const month = new Date().getMonth() + 1;
  const year  = new Date().getFullYear();
  if (month <= 3)  return { year, season: "winter" };
  if (month <= 6)  return { year, season: "spring" };
  if (month <= 9)  return { year, season: "summer" };
  return { year, season: "fall" };
}

function buildYears(): number[] {
  const current = new Date().getFullYear();
  const years: number[] = [];
  for (let y = current + 1; y >= 1990; y--) years.push(y);
  return years;
}

function TemporadasContent() {
  const router        = useRouter();
  const params        = useSearchParams();
  const { isMobile, isTablet } = useBreakpoint();

  const def = getCurrentSeason();
  const [year,   setYear]   = useState<number>(() => Number(params.get("year"))   || def.year);
  const [season, setSeason] = useState<string>(() => params.get("season")         || def.season);
  const [items,  setItems]  = useState<Contenido[]>([]);
  const [page,   setPage]   = useState(1);
  const [total,  setTotal]  = useState(1);
  const [loading, setLoading] = useState(false);
  const [genreFilter, setGenreFilter] = useState("");

  const years = buildYears();

  const load = useCallback(async (y: number, s: string, p: number) => {
    setLoading(true);
    try {
      const res = await jikanApi.getSeasonAnime(y, s, p);
      setItems(p === 1 ? res.items : prev => [...prev, ...res.items]);
      setTotal(res.totalPages);
      setPage(res.currentPage);
    } catch {
      // season may not exist yet
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setItems([]);
    setPage(1);
    load(year, season, 1);
    router.replace(`/temporadas?year=${year}&season=${season}`, { scroll: false });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, season]);

  const loadMore = () => {
    if (page < total && !loading) load(year, season, page + 1);
  };

  const filtered = genreFilter
    ? items.filter(i => i.generos?.some(g => g.nombre === genreFilter))
    : items;

  const cols = isMobile ? "repeat(3, 1fr)" : isTablet ? "repeat(5, 1fr)" : "repeat(7, 1fr)";
  const accentColor = SEASON_COLORS[season] ?? "#f5c518";
  const seasonLabel = SEASONS.find(s => s.val === season)?.label ?? season;

  const genresInPage = Array.from(
    new Set(items.flatMap(i => i.generos?.map(g => g.nombre) ?? []))
  ).sort();

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: isMobile ? "16px 12px" : "24px 32px" }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 700, color: "var(--color-on-surface)", margin: 0 }}>
          <span style={{ color: accentColor }}>{seasonLabel} {year}</span>
          <span style={{ color: "var(--color-outline)", fontSize: 14, fontWeight: 400, marginLeft: 12 }}>
            Temporada de anime
          </span>
        </h1>
      </div>

      {/* Controls */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 12,
        marginBottom: 24,
        alignItems: "center",
      }}>
        {/* Season tabs */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {SEASONS.map(s => (
            <button
              key={s.val}
              onClick={() => setSeason(s.val)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                borderRadius: 20,
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
                background: season === s.val ? SEASON_COLORS[s.val] : "var(--color-surface-container-low)",
                color:      season === s.val ? "#0a0a1a"             : "var(--color-outline)",
                transition: "all 0.15s",
              }}
            >
              <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: 16 }}>{s.icon}</span>
              {s.label}
            </button>
          ))}
        </div>

        {/* Year selector */}
        <select
          value={year}
          onChange={e => setYear(Number(e.target.value))}
          style={{
            background: "var(--color-surface-container-low)",
            color: "var(--color-on-surface)",
            border: "1px solid var(--color-divider-strong)",
            borderRadius: 8,
            padding: "8px 12px",
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          {years.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        {/* Genre quick-filter */}
        {genresInPage.length > 0 && (
          <select
            value={genreFilter}
            onChange={e => setGenreFilter(e.target.value)}
            style={{
              background: "var(--color-surface-container-low)",
              color: genreFilter ? "#f5c518" : "var(--color-outline)",
              border: `1px solid ${genreFilter ? "#f5c518" : "var(--color-divider-strong)"}`,
              borderRadius: 8,
              padding: "8px 12px",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            <option value="">Todos los géneros</option>
            {genresInPage.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        )}
      </div>

      {/* Stats bar */}
      {!loading && items.length > 0 && (
        <div style={{
          display: "flex",
          gap: 20,
          marginBottom: 20,
          padding: "10px 16px",
          background: "var(--color-surface-container-lowest)",
          borderRadius: 10,
          borderLeft: `3px solid ${accentColor}`,
        }}>
          <span style={{ color: "var(--color-outline)", fontSize: 13 }}>
            <b style={{ color: "var(--color-on-surface)" }}>{filtered.length}</b>
            {genreFilter ? ` de ${items.length}` : ""} títulos
          </span>
          {page < total && (
            <span style={{ color: "var(--color-outline)", fontSize: 13 }}>
              Página <b style={{ color: "var(--color-on-surface)" }}>{page}</b> / {total}
            </span>
          )}
        </div>
      )}

      {/* Grid */}
      {filtered.length > 0 ? (
        <div style={{
          display: "grid",
          gridTemplateColumns: cols,
          gap: isMobile ? "8px" : "12px",
        }}>
          {filtered.map(item => (
            <Card key={item.id} item={item} />
          ))}
        </div>
      ) : !loading ? (
        <div style={{
          textAlign: "center",
          padding: "80px 20px",
          color: "var(--color-outline)",
        }}>
          <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: 48, display: "block", marginBottom: 12 }}>
            calendar_today
          </span>
          <p style={{ margin: 0, fontSize: 16 }}>
            No hay datos disponibles para {seasonLabel.toLowerCase()} {year}
          </p>
        </div>
      ) : null}

      {/* Loading skeleton */}
      {loading && (
        <div style={{ display: "grid", gridTemplateColumns: cols, gap: isMobile ? "8px" : "12px" }}>
          {Array.from({ length: 14 }).map((_, i) => (
            <div key={i} style={{
              background: "var(--color-surface-container-lowest)",
              borderRadius: 8,
              paddingTop: "150%",
              animation: "pulse 1.5s ease-in-out infinite",
            }} />
          ))}
        </div>
      )}

      {/* Load more */}
      {page < total && !loading && (
        <div style={{ textAlign: "center", marginTop: 32 }}>
          <button
            onClick={loadMore}
            style={{
              background: "var(--color-surface-container-low)",
              color: "var(--color-on-surface)",
              border: `1px solid ${accentColor}`,
              borderRadius: 8,
              padding: "10px 28px",
              fontSize: 14,
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Cargar más
          </button>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}

export default function TemporadasPage() {
  return (
    <Suspense>
      <TemporadasContent />
    </Suspense>
  );
}
