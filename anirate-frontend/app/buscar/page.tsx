"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Card from "@/components/Card";
import { jikanApi, GENRE_MAP, type ProducerSuggestion } from "@/services/jikan";
import { reviewsApi, watchApi } from "@/services/api";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import type { Contenido } from "@/types";

const POPULAR_SEARCHES = [
  "Attack on Titan",
  "One Piece",
  "Demon Slayer",
  "Jujutsu Kaisen",
  "Naruto",
  "Berserk",
  "Chainsaw Man",
  "Frieren",
];

const GENRES = [
  "Acción", "Aventura", "Comedia", "Drama",
  "Fantasía", "Romance", "Sci-Fi", "Terror",
  "Misterio", "Slice of Life", "Deportes", "Sobrenatural",
  "Psicológico", "Ecchi", "Mecha", "Musical",
  "Escolar", "Seinen", "Shoujo", "Shounen",
];

const ANIME_TYPES = [
  { val: "", label: "Todos" },
  { val: "tv", label: "TV" },
  { val: "movie", label: "Película" },
  { val: "ova", label: "OVA" },
  { val: "ona", label: "ONA" },
  { val: "special", label: "Especial" },
];

const MANGA_TYPES = [
  { val: "", label: "Todos" },
  { val: "manga", label: "Manga" },
  { val: "manhwa", label: "Manhwa" },
  { val: "manhua", label: "Manhua" },
  { val: "novel", label: "Novela" },
  { val: "light_novel", label: "Light Novel" },
  { val: "one_shot", label: "One-Shot" },
];

const ANIME_STATUS = [
  { val: "", label: "Todos" },
  { val: "airing", label: "En emisión" },
  { val: "complete", label: "Finalizado" },
  { val: "upcoming", label: "Próximamente" },
];

const MANGA_STATUS = [
  { val: "", label: "Todos" },
  { val: "publishing", label: "En publicación" },
  { val: "complete", label: "Finalizado" },
  { val: "hiatus", label: "En pausa" },
  { val: "upcoming", label: "Próximamente" },
];

const SORT_OPTIONS = [
  { val: "popularity|desc", label: "Más popular" },
  { val: "score|desc", label: "Mejor puntuado" },
  { val: "start_date|desc", label: "Más reciente" },
  { val: "start_date|asc", label: "Más antiguo" },
  { val: "title|asc", label: "A–Z" },
];

const SCORES = ["", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
const CURRENT_YEAR = new Date().getFullYear();

function Pagination({ page, totalPages, onPage }: { page: number; totalPages: number; onPage: (p: number) => void }) {
  if (totalPages <= 1) return null;
  const pages: (number | "...")[] = [];
  const addPage = (p: number) => { if (p >= 1 && p <= totalPages && !pages.includes(p)) pages.push(p); };
  addPage(1);
  if (page - 2 > 2) pages.push("...");
  addPage(page - 1); addPage(page); addPage(page + 1);
  if (page + 2 < totalPages - 1) pages.push("...");
  addPage(totalPages);

  const btn: React.CSSProperties = { width: "40px", height: "40px", borderRadius: "6px", border: "none", cursor: "pointer", fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: "0.875rem", transition: "all 0.15s", display: "flex", alignItems: "center", justifyContent: "center" };
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "6px", marginTop: "48px", paddingTop: "24px", borderTop: "1px solid var(--color-divider)" }}>
      <button onClick={() => onPage(page - 1)} disabled={page === 1} style={{ ...btn, backgroundColor: "transparent", color: page === 1 ? "var(--color-outline-variant)" : "var(--color-on-surface-variant)", cursor: page === 1 ? "not-allowed" : "pointer" }}>
        <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "20px" }}>chevron_left</span>
      </button>
      {pages.map((p, i) => p === "..." ? (
        <span key={`d${i}`} style={{ color: "var(--color-outline)", padding: "0 4px" }}>…</span>
      ) : (
        <button key={p} onClick={() => onPage(p as number)} style={{ ...btn, backgroundColor: page === p ? "#f5c518" : "transparent", color: page === p ? "#3d2f00" : "var(--color-on-surface)" }}
          onMouseEnter={(e) => { if (page !== p) e.currentTarget.style.backgroundColor = "var(--color-surface-container-high)"; }}
          onMouseLeave={(e) => { if (page !== p) e.currentTarget.style.backgroundColor = "transparent"; }}
        >{p}</button>
      ))}
      <button onClick={() => onPage(page + 1)} disabled={page === totalPages} style={{ ...btn, backgroundColor: "transparent", color: page === totalPages ? "var(--color-outline-variant)" : "var(--color-on-surface-variant)", cursor: page === totalPages ? "not-allowed" : "pointer" }}>
        <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "20px" }}>chevron_right</span>
      </button>
    </div>
  );
}

function dedup(items: Contenido[]): Contenido[] {
  const seen = new Set<string>(); const titles = new Set<string>();
  return items.filter((item) => {
    const key = `${item.tipo}:${item.id}`;
    const t = item.titulo.toLowerCase().trim();
    if (seen.has(key) || titles.has(t)) return false;
    seen.add(key); titles.add(t); return true;
  });
}

function RadioGroup({ label, options, value, onChange }: { label: string; options: { val: string; label: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <h3 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: "0.85rem", color: "var(--color-on-surface)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</h3>
      {options.map(({ val, label: l }) => (
        <label key={val} onClick={() => onChange(val)} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
          <div style={{ width: "16px", height: "16px", borderRadius: "50%", border: `2px solid ${value === val ? "#f5c518" : "var(--color-divider-strong)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" }}>
            {value === val && <div style={{ width: "7px", height: "7px", borderRadius: "50%", backgroundColor: "#f5c518" }} />}
          </div>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", color: value === val ? "var(--color-on-surface)" : "var(--color-outline)" }}>{l}</span>
        </label>
      ))}
    </div>
  );
}

function SelectFilter({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <h3 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: "0.85rem", color: "var(--color-on-surface)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</h3>
      <select value={value} onChange={(e) => onChange(e.target.value)} style={{ backgroundColor: "var(--color-surface-container-high)", border: "1px solid var(--color-divider-strong)", borderRadius: "6px", color: "var(--color-on-surface)", padding: "8px 10px", fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", outline: "none", cursor: "pointer", width: "100%" }}>
        {options.map((o) => <option key={o} value={o}>{o || "Todos"}</option>)}
      </select>
    </div>
  );
}

function BuscarContent() {
  const searchParams = useSearchParams();
  const { isMobile, isTablet } = useBreakpoint();
  const [results, setResults] = useState<Contenido[]>([]);
  const [reviewCounts, setReviewCounts] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(false);
  const [appending, setAppending] = useState(false);
  const [searched, setSearched] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Filters
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [tipo, setTipo] = useState(searchParams.get("tipo") ?? "");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [status, setStatus] = useState("");
  const [mediaType, setMediaType] = useState("");
  const [minScore, setMinScore] = useState("");
  const [startYear, setStartYear] = useState("");
  const [endYear, setEndYear] = useState("");
  const [sortVal, setSortVal] = useState("popularity|desc");
  const [studioQuery, setStudioQuery] = useState("");
  const [studioOptions, setStudioOptions] = useState<ProducerSuggestion[]>([]);
  const [studioLoading, setStudioLoading] = useState(false);
  const [studioOpen, setStudioOpen] = useState(false);
  const [selectedStudios, setSelectedStudios] = useState<ProducerSuggestion[]>([]);
  const studioDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [providerOptions, setProviderOptions] = useState<string[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [providerFilterIds, setProviderFilterIds] = useState<Set<number> | null>(null);

  useEffect(() => {
    watchApi.listProviders().then((r) => setProviderOptions(r.providers)).catch(() => setProviderOptions([]));
  }, []);

  useEffect(() => {
    if (!selectedProvider) { setProviderFilterIds(null); return; }
    watchApi.idsByProvider(selectedProvider)
      .then((r) => setProviderFilterIds(new Set(r.jikan_ids)))
      .catch(() => setProviderFilterIds(new Set()));
  }, [selectedProvider]);

  function getGenreIds(genres: string[]): number[] {
    return genres.map((g) => GENRE_MAP[g]).filter(Boolean) as number[];
  }

  function buildOpts(p: number) {
    const [order_by, sort] = sortVal.split("|") as [string, "asc" | "desc"];
    return {
      q: query || undefined,
      page: p,
      genres: getGenreIds(selectedGenres),
      status: status || undefined,
      type: mediaType || undefined,
      min_score: minScore ? Number(minScore) : undefined,
      start_year: startYear ? Number(startYear) : undefined,
      end_year: endYear ? Number(endYear) : undefined,
      order_by,
      sort,
      producers: selectedStudios.map((s) => s.id),
    };
  }

  useEffect(() => {
    if (studioDebounceRef.current) clearTimeout(studioDebounceRef.current);
    if (!studioQuery.trim()) { setStudioOptions([]); return; }
    setStudioLoading(true);
    studioDebounceRef.current = setTimeout(() => {
      jikanApi.searchProducers(studioQuery)
        .then((opts) => setStudioOptions(opts.filter((o) => !selectedStudios.some((s) => s.id === o.id))))
        .catch(() => setStudioOptions([]))
        .finally(() => setStudioLoading(false));
    }, 350);
    return () => { if (studioDebounceRef.current) clearTimeout(studioDebounceRef.current); };
  }, [studioQuery, selectedStudios]);

  async function fetchResults(p = 1, append = false) {
    if (append) setAppending(true); else setLoading(true);
    setSearched(true);
    setPage(p);
    const opts = buildOpts(p);
    // producers solo aplica a anime; si hay estudios seleccionados, forzamos anime
    const effectiveTipo = opts.producers.length > 0 ? "ANIME" : tipo;
    try {
      let items: Contenido[] = [];
      let pages = 1;
      if (effectiveTipo === "ANIME") {
        const res = await jikanApi.searchAnimePaged(opts);
        items = res.items; pages = res.totalPages;
      } else if (effectiveTipo === "MANGA") {
        const res = await jikanApi.searchMangaPaged({ ...opts, producers: undefined });
        items = res.items; pages = res.totalPages;
      } else {
        const [ar, mr] = await Promise.allSettled([
          jikanApi.searchAnimePaged(opts),
          jikanApi.searchMangaPaged({ ...opts, producers: undefined }),
        ]);
        const a = ar.status === "fulfilled" ? ar.value : null;
        const m = mr.status === "fulfilled" ? mr.value : null;
        items = [...(a?.items ?? []), ...(m?.items ?? [])];
        pages = Math.max(a?.totalPages ?? 1, m?.totalPages ?? 1);
      }
      if (append) {
        setResults((prev) => dedup([...prev, ...items]));
      } else {
        setResults(dedup(items));
      }
      setTotalPages(pages);

      const ids = items.map((i) => i.jikan_id ?? i.id).filter((n): n is number => typeof n === "number" && n > 0);
      if (ids.length > 0) {
        reviewsApi.getCounts(ids).then((counts) => {
          setReviewCounts((prev) => append ? { ...prev, ...counts } : counts);
        }).catch(() => {});
      } else if (!append) {
        setReviewCounts({});
      }
    } catch {
      if (!append) { setResults([]); setTotalPages(1); }
    } finally {
      if (append) setAppending(false); else setLoading(false);
      if (!append) window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  const loadMore = useCallback(() => {
    if (loading || appending) return;
    if (page >= totalPages) return;
    fetchResults(page + 1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, appending, page, totalPages]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    if (!searched || results.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: "600px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [searched, results.length, loadMore]);

  useEffect(() => {
    const q = searchParams.get("q") ?? "";
    const t = searchParams.get("tipo") ?? "";
    setQuery(q); setTipo(t);
    setSelectedGenres([]); setStatus(""); setMediaType("");
    setMinScore(""); setStartYear(""); setEndYear("");
    setSortVal("popularity|desc");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    fetchResults(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  function toggleGenre(g: string) {
    setSelectedGenres((prev) => prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]);
  }

  function clearFilters() {
    setTipo(""); setQuery(""); setSelectedGenres([]); setStatus("");
    setMediaType(""); setMinScore(""); setStartYear(""); setEndYear("");
    setSortVal("popularity|desc"); setSelectedStudios([]); setStudioQuery("");
    setSelectedProvider("");
  }

  const activeFilterCount = selectedGenres.length + (tipo ? 1 : 0) + (status ? 1 : 0) + (mediaType ? 1 : 0) + (minScore ? 1 : 0) + (startYear || endYear ? 1 : 0) + selectedStudios.length + (selectedProvider ? 1 : 0);

  const filteredResults = providerFilterIds
    ? results.filter((r) => providerFilterIds.has(r.jikan_id ?? r.id))
    : results;

  // Auto-load más páginas si el filtro reduce demasiado resultados visibles
  useEffect(() => {
    if (!providerFilterIds || !searched) return;
    if (loading || appending) return;
    if (page >= totalPages) return;
    if (filteredResults.length >= 12) return;
    if (page >= 5) return; // tope para no abusar Jikan
    fetchResults(page + 1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providerFilterIds, filteredResults.length, page, totalPages, loading, appending, searched]);
  const typeOptions = tipo === "MANGA" ? MANGA_TYPES : tipo === "ANIME" ? ANIME_TYPES : [...ANIME_TYPES, ...MANGA_TYPES.slice(1)];
  const statusOptions = tipo === "MANGA" ? MANGA_STATUS : ANIME_STATUS;

  const SidebarContent = (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Ordenar */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <h3 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: "0.85rem", color: "var(--color-on-surface)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Ordenar por</h3>
        <select value={sortVal} onChange={(e) => setSortVal(e.target.value)} style={{ backgroundColor: "var(--color-surface-container-high)", border: "1px solid var(--color-divider-strong)", borderRadius: "6px", color: "var(--color-on-surface)", padding: "8px 10px", fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", outline: "none", cursor: "pointer", width: "100%" }}>
          {SORT_OPTIONS.map((o) => <option key={o.val} value={o.val}>{o.label}</option>)}
        </select>
      </div>

      {/* Tipo */}
      <RadioGroup label="Tipo" options={[{ val: "", label: "Todos" }, { val: "ANIME", label: "Anime" }, { val: "MANGA", label: "Manga" }]} value={tipo} onChange={setTipo} />

      {/* Formato */}
      <RadioGroup label="Formato" options={typeOptions} value={mediaType} onChange={setMediaType} />

      {/* Estado */}
      <RadioGroup label="Estado" options={statusOptions} value={status} onChange={setStatus} />

      {/* Puntuación mínima */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <h3 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: "0.85rem", color: "var(--color-on-surface)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Puntuación mínima</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
          {SCORES.map((s) => (
            <button key={s} onClick={() => setMinScore(s)} style={{ padding: "4px 10px", borderRadius: "6px", border: "none", cursor: "pointer", fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: "0.75rem", backgroundColor: minScore === s ? "#f5c518" : "var(--color-surface-container-high)", color: minScore === s ? "#3d2f00" : "var(--color-outline)", transition: "all 0.15s" }}>
              {s === "" ? "—" : `${s}+`}
            </button>
          ))}
        </div>
      </div>

      {/* Año */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <h3 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: "0.85rem", color: "var(--color-on-surface)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Año</h3>
        <div style={{ display: "flex", gap: "8px" }}>
          <input type="number" placeholder="Desde" min={1960} max={CURRENT_YEAR} value={startYear} onChange={(e) => setStartYear(e.target.value)}
            style={{ flex: 1, backgroundColor: "var(--color-surface-container-high)", border: "1px solid var(--color-divider-strong)", borderRadius: "6px", color: "var(--color-on-surface)", padding: "7px 8px", fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", outline: "none", width: 0 }}
            onFocus={(e) => e.currentTarget.style.borderColor = "#f5c518"} onBlur={(e) => e.currentTarget.style.borderColor = "var(--color-divider-strong)"} />
          <input type="number" placeholder="Hasta" min={1960} max={CURRENT_YEAR} value={endYear} onChange={(e) => setEndYear(e.target.value)}
            style={{ flex: 1, backgroundColor: "var(--color-surface-container-high)", border: "1px solid var(--color-divider-strong)", borderRadius: "6px", color: "var(--color-on-surface)", padding: "7px 8px", fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", outline: "none", width: 0 }}
            onFocus={(e) => e.currentTarget.style.borderColor = "#f5c518"} onBlur={(e) => e.currentTarget.style.borderColor = "var(--color-divider-strong)"} />
        </div>
      </div>

      {/* Estudio (anime) */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", position: "relative" }}>
        <h3 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: "0.85rem", color: "var(--color-on-surface)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Estudio (anime)</h3>
        <div style={{ position: "relative" }}>
          <input
            type="text"
            placeholder="Ghibli, Madhouse, MAPPA..."
            value={studioQuery}
            onChange={(e) => { setStudioQuery(e.target.value); setStudioOpen(true); }}
            onFocus={() => setStudioOpen(true)}
            onBlur={() => setTimeout(() => setStudioOpen(false), 120)}
            style={{ width: "100%", backgroundColor: "var(--color-surface-container-high)", border: "1px solid var(--color-divider-strong)", borderRadius: "6px", color: "var(--color-on-surface)", padding: "7px 10px", fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", outline: "none" }}
            onFocusCapture={(e) => (e.currentTarget.style.borderColor = "#f5c518")}
          />
          {studioOpen && studioQuery.trim() && (
            <div style={{ position: "absolute", top: "100%", left: 0, right: 0, backgroundColor: "var(--color-surface-container-low)", border: "1px solid var(--color-divider-strong)", borderRadius: "6px", marginTop: "4px", maxHeight: "240px", overflowY: "auto", zIndex: 30, boxShadow: "0 8px 24px var(--color-scrim)" }}>
              {studioLoading && <div style={{ padding: "10px", color: "var(--color-outline)", fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", textAlign: "center" }}>Buscando...</div>}
              {!studioLoading && studioOptions.length === 0 && <div style={{ padding: "10px", color: "var(--color-outline)", fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", textAlign: "center" }}>Sin resultados</div>}
              {studioOptions.map((opt) => (
                <button key={opt.id} onMouseDown={() => {
                  setSelectedStudios((prev) => prev.some((s) => s.id === opt.id) ? prev : [...prev, opt]);
                  setStudioQuery(""); setStudioOpen(false);
                }}
                  style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", background: "none", border: "none", cursor: "pointer", textAlign: "left", color: "var(--color-on-surface-variant)", fontFamily: "'Inter', sans-serif", fontSize: "0.8rem" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-hover-bg-soft)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{opt.name}</span>
                  <span style={{ fontSize: "10px", color: "var(--color-outline)", flexShrink: 0, marginLeft: "8px" }}>{opt.count}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        {selectedStudios.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
            {selectedStudios.map((s) => (
              <span key={s.id} style={{ display: "flex", alignItems: "center", gap: "4px", backgroundColor: "#f5c518", color: "#3d2f00", fontSize: "11px", padding: "3px 6px 3px 10px", borderRadius: "20px", fontFamily: "'Inter', sans-serif", fontWeight: 700 }}>
                {s.name}
                <button onClick={() => setSelectedStudios((prev) => prev.filter((x) => x.id !== s.id))}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#3d2f00", display: "flex", padding: 0 }}>
                  <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "14px" }}>close</span>
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Disponible en (streaming) */}
      {providerOptions.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <h3 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: "0.85rem", color: "var(--color-on-surface)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Disponible en</h3>
          <select value={selectedProvider} onChange={(e) => setSelectedProvider(e.target.value)} style={{ backgroundColor: "var(--color-surface-container-high)", border: "1px solid var(--color-divider-strong)", borderRadius: "6px", color: "var(--color-on-surface)", padding: "8px 10px", fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", outline: "none", cursor: "pointer", width: "100%" }}>
            <option value="">Cualquier plataforma</option>
            {providerOptions.map((p) => (
              <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
            ))}
          </select>
        </div>
      )}

      {/* Géneros */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <h3 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: "0.85rem", color: "var(--color-on-surface)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Géneros</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
          {GENRES.map((g) => {
            const active = selectedGenres.includes(g);
            return (
              <span key={g} onClick={() => toggleGenre(g)} style={{ backgroundColor: active ? "#f5c518" : "var(--color-surface-container-high)", color: active ? "#3d2f00" : "var(--color-outline)", fontSize: "11px", padding: "3px 9px", borderRadius: "20px", fontFamily: "'Inter', sans-serif", border: `1px solid ${active ? "#f5c518" : "var(--color-divider-strong)"}`, cursor: "pointer", userSelect: "none", fontWeight: active ? 700 : 400, transition: "all 0.15s" }}>
                {g}
              </span>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <button onClick={() => { fetchResults(1); setFiltersOpen(false); }} style={{ backgroundColor: "#f5c518", color: "#3d2f00", border: "none", borderRadius: "6px", padding: "11px", fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.875rem", cursor: "pointer" }}>
        Aplicar filtros
      </button>
      {activeFilterCount > 0 && (
        <button onClick={clearFilters} style={{ background: "none", border: "none", color: "var(--color-outline)", cursor: "pointer", fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", padding: "0" }}>
          Limpiar filtros ({activeFilterCount})
        </button>
      )}
    </div>
  );

  const gridCols = isMobile ? "repeat(3, 1fr)" : isTablet ? "repeat(6, 1fr)" : "repeat(8, 1fr)";

  return (
    <div style={{ backgroundColor: "var(--color-surface)", minHeight: "100vh", paddingTop: "64px", display: "flex" }}>
      {/* Mobile filter overlay + sheet */}
      {isMobile && filtersOpen && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 80, backgroundColor: "var(--color-scrim-strong)", backdropFilter: "blur(4px)" }} onClick={() => setFiltersOpen(false)} />
          <div className="hide-scrollbar" style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 90, backgroundColor: "var(--color-surface-container-low)", borderTop: "1px solid var(--color-divider-strong)", borderRadius: "16px 16px 0 0", padding: "20px 20px 32px", maxHeight: "85vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <span style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, color: "var(--color-on-surface)" }}>Filtros</span>
              <button onClick={() => setFiltersOpen(false)} aria-label="Cerrar filtros" style={{ background: "none", border: "none", color: "var(--color-outline)", cursor: "pointer" }}>
                <span className="material-symbols-outlined" aria-hidden="true">close</span>
              </button>
            </div>
            {SidebarContent}
          </div>
        </>
      )}

      {/* Desktop sidebar */}
      {!isMobile && (
        <aside className="hide-scrollbar" style={{ width: "220px", flexShrink: 0, backgroundColor: "var(--color-surface-container-low)", borderRight: "1px solid var(--color-divider)", padding: "24px 14px", display: "flex", flexDirection: "column", position: "sticky", top: "64px", height: "calc(100vh - 64px)", overflowY: "auto" }}>
          {SidebarContent}
        </aside>
      )}

      {/* Main */}
      <div style={{ flex: 1, padding: isMobile ? "16px" : "24px 28px", minWidth: 0 }}>
        {/* Header */}
        <div style={{ borderBottom: "1px solid var(--color-divider)", paddingBottom: "14px", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
            <h1 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: isMobile ? "1.4rem" : "1.8rem", color: "var(--color-on-surface)", letterSpacing: "-0.02em" }}>
              Explorar Catálogo
            </h1>
            {isMobile && (
              <button onClick={() => setFiltersOpen(true)} style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: activeFilterCount > 0 ? "#f5c518" : "var(--color-surface-container-high)", color: activeFilterCount > 0 ? "#3d2f00" : "var(--color-on-surface-variant)", border: "none", borderRadius: "8px", padding: "8px 14px", fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: "0.8rem", cursor: "pointer", flexShrink: 0 }}>
                <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "16px" }}>tune</span>
                Filtros{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
              </button>
            )}
          </div>
          <p style={{ fontFamily: "'Inter', sans-serif", color: "var(--color-outline)", fontSize: "0.8rem", marginTop: "4px" }}>
            {loading ? "Buscando…" : searched ? `Página ${page} de ${totalPages} · ${filteredResults.length} resultados${providerFilterIds ? ` (filtrado por ${selectedProvider})` : ""}` : ""}
          </p>
        </div>

        {/* Search bar */}
        <form onSubmit={(e) => { e.preventDefault(); fetchResults(1); }} style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <span className="material-symbols-outlined" aria-hidden="true" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--color-outline)", fontSize: "18px", pointerEvents: "none" }}>search</span>
            <input type="text" placeholder="Buscar anime o manga..." value={query} onChange={(e) => setQuery(e.target.value)}
              style={{ width: "100%", backgroundColor: "var(--color-surface-container-low)", border: "1px solid var(--color-divider-strong)", borderRadius: "8px", padding: "10px 16px 10px 40px", color: "var(--color-on-surface)", fontSize: "0.875rem", outline: "none", fontFamily: "'Inter', sans-serif", transition: "border-color 0.2s" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#f5c518")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-divider-strong)")} />
          </div>
          <button type="submit" style={{ backgroundColor: "#f5c518", color: "#3d2f00", border: "none", borderRadius: "8px", padding: "10px 20px", fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.875rem", cursor: "pointer" }}>
            Buscar
          </button>
        </form>

        {/* Skeleton */}
        {loading && (
          <div style={{ display: "grid", gridTemplateColumns: gridCols, gap: "12px" }}>
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} style={{ borderRadius: "8px", paddingTop: "150%", backgroundColor: "var(--color-surface-container-low)", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, transparent 0%, rgba(42,42,42,0.6) 50%, transparent 100%)", animation: "shimmer 1.5s infinite" }} />
              </div>
            ))}
          </div>
        )}

        {!loading && results.length === 0 && searched && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "60px", gap: "20px" }}>
            <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "56px", color: "var(--color-outline-variant)" }}>search_off</span>
            <div style={{ textAlign: "center" }}>
              <p style={{ color: "var(--color-on-surface)", fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "1.1rem" }}>Sin resultados</p>
              <p style={{ color: "var(--color-outline)", fontFamily: "'Inter', sans-serif", fontSize: "0.85rem", marginTop: "4px" }}>
                Prueba ajustando los filtros o buscando algo popular:
              </p>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center", maxWidth: "640px" }}>
              {POPULAR_SEARCHES.map((s) => (
                <button key={s} onClick={() => { setQuery(s); setTimeout(() => fetchResults(1), 0); }}
                  style={{ backgroundColor: "var(--color-surface-container-high)", border: "1px solid var(--color-divider)", color: "var(--color-on-surface-variant)", padding: "6px 14px", borderRadius: "20px", cursor: "pointer", fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", transition: "all 0.15s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#f5c518"; e.currentTarget.style.color = "#f5c518"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--color-divider)"; e.currentTarget.style.color = "var(--color-on-surface-variant)"; }}
                >
                  {s}
                </button>
              ))}
            </div>
            {activeFilterCount > 0 && (
              <button onClick={() => { clearFilters(); setTimeout(() => fetchResults(1), 0); }}
                style={{ backgroundColor: "transparent", border: "1px solid var(--color-divider-strong)", color: "var(--color-on-surface-variant)", padding: "8px 18px", borderRadius: "8px", cursor: "pointer", fontFamily: "'Manrope', sans-serif", fontSize: "0.8rem", fontWeight: 600 }}>
                Limpiar todos los filtros
              </button>
            )}
          </div>
        )}

        {!loading && results.length > 0 && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: gridCols, gap: "12px" }}>
              {filteredResults.map((item) => <Card key={`${item.tipo}-${item.id}`} item={item} reviewCount={reviewCounts[item.jikan_id ?? item.id]} />)}
            </div>

            {/* Infinite scroll sentinel */}
            <div ref={sentinelRef} style={{ height: "1px" }} />

            {appending && (
              <div style={{ display: "flex", justifyContent: "center", padding: "24px", color: "var(--color-outline)", fontFamily: "'Inter', sans-serif", fontSize: "0.85rem", gap: "8px", alignItems: "center" }}>
                <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "18px", animation: "spin 0.9s linear infinite" }}>progress_activity</span>
                Cargando más resultados...
                <style jsx>{`
                  @keyframes spin { to { transform: rotate(360deg); } }
                `}</style>
              </div>
            )}

            {page >= totalPages && results.length > 0 && (
              <p style={{ textAlign: "center", color: "var(--color-outline)", fontFamily: "'Inter', sans-serif", fontSize: "0.82rem", padding: "20px 0" }}>
                — Final de los resultados —
              </p>
            )}

            <Pagination page={page} totalPages={totalPages} onPage={(p) => { if (p >= 1 && p <= totalPages && p !== page) fetchResults(p); }} />
          </>
        )}
      </div>
    </div>
  );
}

export default function BuscarPage() {
  return <Suspense><BuscarContent /></Suspense>;
}
