"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Contenido, Review } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001";

interface GlobalStats {
  totalContenido: number;
  totalRatings: number;
  totalReviews: number;
  totalUsuarios: number;
}

interface GeneroStat {
  nombre: string;
  count: number;
  avgRating: number;
}

async function fetchStats<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

function StatCard({ icon, label, value, color = "#f5c518" }: { icon: string; label: string; value: string | number; color?: string }) {
  return (
    <div style={{ backgroundColor: "var(--color-surface-container-low)", borderRadius: "12px", border: "1px solid var(--color-divider-strong)", padding: "24px", display: "flex", alignItems: "center", gap: "16px" }}>
      <div style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "24px", color }}>{icon}</span>
      </div>
      <div>
        <p style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "1.75rem", color: "var(--color-on-surface)", margin: 0, lineHeight: 1 }}>{typeof value === "number" ? value.toLocaleString("es-ES") : value}</p>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", color: "var(--color-outline)", margin: "4px 0 0" }}>{label}</p>
      </div>
    </div>
  );
}

function ContentRow({ item, rank }: { item: Contenido; rank: number }) {
  const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null;
  return (
    <Link href={`/contenido/${item.id}`} style={{ textDecoration: "none" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "12px 16px", borderRadius: "8px", transition: "background 0.15s", cursor: "pointer" }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-hover-bg-soft)")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
      >
        <span style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "0.85rem", color: rank <= 3 ? "#f5c518" : "var(--color-outline)", width: "28px", textAlign: "center", flexShrink: 0 }}>
          {medal ?? `#${rank}`}
        </span>
        <div style={{ position: "relative", width: "36px", height: "52px", borderRadius: "4px", overflow: "hidden", backgroundColor: "var(--color-surface-container-high)", flexShrink: 0 }}>
          {item.imagen && <Image src={item.imagen} alt={item.titulo} fill sizes="36px" style={{ objectFit: "cover" }} />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: "0.875rem", color: "var(--color-on-surface)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.titulo}</p>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "var(--color-outline)", margin: "3px 0 0" }}>
            <span style={{ color: item.tipo === "ANIME" ? "#b7c4ff" : "#d3bbff", fontWeight: 600 }}>{item.tipo}</span>
            {item.año ? ` · ${item.año}` : ""}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 }}>
          <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "14px", color: "#f5c518" }}>star</span>
          <span style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.875rem", color: "#f5c518" }}>
            {(item.rating_promedio ?? 0).toFixed(1)}
          </span>
          {item.total_ratings != null && (
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "var(--color-outline)", marginLeft: "2px" }}>
              ({item.total_ratings})
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function GeneroBar({ genero, maxCount }: { genero: GeneroStat; maxCount: number }) {
  const pct = maxCount > 0 ? (genero.count / maxCount) * 100 : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", color: "var(--color-on-surface-variant)", width: "100px", flexShrink: 0, textAlign: "right" }}>{genero.nombre}</span>
      <div style={{ flex: 1, backgroundColor: "var(--color-divider)", borderRadius: "4px", height: "10px", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", backgroundColor: "#f5c518", borderRadius: "4px", transition: "width 0.6s ease" }} />
      </div>
      <span style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.8rem", color: "var(--color-outline)", width: "32px", flexShrink: 0 }}>{genero.count}</span>
    </div>
  );
}

type TopTab = "anime" | "manga" | "todo";

export default function EstadisticasPage() {
  const [global, setGlobal] = useState<GlobalStats | null>(null);
  const [topAnime, setTopAnime] = useState<Contenido[]>([]);
  const [topManga, setTopManga] = useState<Contenido[]>([]);
  const [topReviews, setTopReviews] = useState<Review[]>([]);
  const [generos, setGeneros] = useState<GeneroStat[]>([]);
  const [tab, setTab] = useState<TopTab>("anime");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchStats<GlobalStats>("/stats"),
      fetchStats<Contenido[]>("/stats/top-contenido?tipo=ANIME&limit=20"),
      fetchStats<Contenido[]>("/stats/top-contenido?tipo=MANGA&limit=20"),
      fetchStats<Review[]>("/stats/top-reviews?limit=10"),
      fetchStats<GeneroStat[]>("/stats/generos"),
    ]).then(([g, anime, manga, reviews, gens]) => {
      setGlobal(g);
      setTopAnime(anime);
      setTopManga(manga);
      setTopReviews(reviews);
      setGeneros(gens);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const topItems = tab === "anime" ? topAnime : tab === "manga" ? topManga : [...topAnime, ...topManga].sort((a, b) => (b.rating_promedio ?? 0) - (a.rating_promedio ?? 0)).slice(0, 20);
  const maxGeneroCount = generos[0]?.count ?? 1;

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "var(--color-surface)", paddingTop: "80px", paddingBottom: "60px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>

        {/* Header */}
        <div style={{ marginBottom: "40px" }}>
          <h1 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 900, fontSize: "2rem", color: "var(--color-on-surface)", margin: "0 0 8px", letterSpacing: "-0.03em" }}>
            Estadísticas
          </h1>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.9rem", color: "var(--color-outline)", margin: 0 }}>
            Datos en tiempo real de la comunidad AniRates
          </p>
        </div>

        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "40px" }}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} style={{ backgroundColor: "var(--color-surface-container-low)", borderRadius: "12px", height: "96px", animation: "pulse 1.5s infinite" }} />
            ))}
          </div>
        ) : global && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "48px" }}>
            <StatCard icon="people" label="Usuarios registrados" value={global.totalUsuarios} />
            <StatCard icon="movie" label="Títulos catalogados" value={global.totalContenido} color="#b7c4ff" />
            <StatCard icon="star" label="Ratings dados" value={global.totalRatings} color="#ffd54f" />
            <StatCard icon="rate_review" label="Reviews escritas" value={global.totalReviews} color="#80cbc4" />
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "32px", alignItems: "start" }}>

          {/* Top ranking */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <h2 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "1.15rem", color: "var(--color-on-surface)", margin: 0, letterSpacing: "-0.02em" }}>
                Top 20 — Mejor puntuados
              </h2>
              <div style={{ display: "flex", gap: "4px", backgroundColor: "var(--color-divider)", borderRadius: "8px", padding: "3px" }}>
                {(["anime", "manga", "todo"] as TopTab[]).map((t) => (
                  <button key={t} onClick={() => setTab(t)}
                    style={{ padding: "5px 12px", borderRadius: "6px", border: "none", cursor: "pointer", fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: "0.78rem", transition: "all 0.15s", backgroundColor: tab === t ? "#f5c518" : "transparent", color: tab === t ? "#3d2f00" : "var(--color-outline)", textTransform: "capitalize" }}
                  >
                    {t === "todo" ? "Todo" : t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ backgroundColor: "var(--color-surface-container-low)", borderRadius: "12px", border: "1px solid var(--color-divider-strong)", overflow: "hidden", padding: "8px 0" }}>
              {topItems.length === 0 ? (
                <div style={{ padding: "40px", textAlign: "center", color: "var(--color-outline)", fontFamily: "'Inter', sans-serif", fontSize: "0.85rem" }}>
                  No hay datos suficientes todavía
                </div>
              ) : (
                topItems.map((item, i) => <ContentRow key={item.id} item={item} rank={i + 1} />)
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>

            {/* Géneros más populares */}
            <div style={{ backgroundColor: "var(--color-surface-container-low)", borderRadius: "12px", border: "1px solid var(--color-divider-strong)", padding: "20px" }}>
              <h3 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "0.95rem", color: "var(--color-on-surface)", margin: "0 0 16px", letterSpacing: "-0.02em" }}>
                Géneros más populares
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {generos.length === 0 ? (
                  <p style={{ color: "var(--color-outline)", fontFamily: "'Inter', sans-serif", fontSize: "0.82rem", margin: 0 }}>Sin datos todavía</p>
                ) : (
                  generos.map((g) => <GeneroBar key={g.nombre} genero={g} maxCount={maxGeneroCount} />)
                )}
              </div>
            </div>

            {/* Reviews más votadas */}
            <div style={{ backgroundColor: "var(--color-surface-container-low)", borderRadius: "12px", border: "1px solid var(--color-divider-strong)", padding: "20px" }}>
              <h3 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "0.95rem", color: "var(--color-on-surface)", margin: "0 0 16px", letterSpacing: "-0.02em" }}>
                Reviews más votadas
              </h3>
              {topReviews.length === 0 ? (
                <p style={{ color: "var(--color-outline)", fontFamily: "'Inter', sans-serif", fontSize: "0.82rem", margin: 0 }}>Sin datos todavía</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {topReviews.map((r) => {
                    const rev = r as Review & { contenido?: Contenido };
                    return (
                      <div key={r.id} style={{ borderBottom: "1px solid var(--color-hover-bg)", paddingBottom: "12px" }}>
                        {rev.contenido && (
                          <Link href={`/contenido/${rev.contenido.id}`} style={{ textDecoration: "none" }}>
                            <p style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.78rem", color: "#f5c518", margin: "0 0 4px" }}>
                              {rev.contenido.titulo}
                            </p>
                          </Link>
                        )}
                        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.78rem", color: "var(--color-on-surface-variant)", margin: "0 0 6px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {r.comentario}
                        </p>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: "var(--color-outline)" }}>
                            por {r.usuario?.nombre ?? "Usuario"}
                          </span>
                          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "12px", color: "#f5c518" }}>thumb_up</span>
                            <span style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "11px", color: "#f5c518" }}>{r.votos ?? 0}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
