"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import Card from "@/components/Card";
import { favoritosApi, reviewsApi, ratingsApi, listaApi, usersApi, personajesApi, ESTADO_LABELS, ESTADO_COLORS, ESTADO_ICONS, type ListaEstado, type Badge, type MeProfile, type FavoritoPersonajeItem } from "@/services/api";
import { contenidoPath } from "@/services/routes";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { useAuth } from "@/contexts/AuthContext";
import Avatar from "@/components/Avatar";
import ReviewMarkdown from "@/components/ReviewMarkdown";
import ReviewImagesGallery from "@/components/ReviewImagesGallery";
import type { Contenido, Review, Favorito, ListaItem } from "@/types";

type Tab = "stats" | "lista" | "ratings" | "reviews" | "favoritos" | "personajes";

type RatingWithContenido = {
  id: number;
  puntuacion: number;
  fecha: string;
  contenido: Contenido;
};

export default function PerfilPage() {
  const t = useTranslations("profile");
  const [tab, setTab] = useState<Tab>("stats");
  const [favoritos, setFavoritos] = useState<Contenido[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [ratings, setRatings] = useState<RatingWithContenido[]>([]);
  const [lista, setLista] = useState<ListaItem[]>([]);
  const [me, setMe] = useState<MeProfile | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [favPersonajes, setFavPersonajes] = useState<FavoritoPersonajeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { isMobile, isTablet } = useBreakpoint();

  useEffect(() => {
    if (!user) return;
    async function load() {
      setLoading(true);
      try {
        const [favData, revData, ratData, listaData, meData, badgesData, favPData] = await Promise.all([
          favoritosApi.getByUser(user!.id),
          reviewsApi.getByUser(user!.id),
          ratingsApi.getMine(),
          listaApi.getMine(),
          usersApi.getMe().catch(() => null),
          usersApi.getBadges(user!.id).catch(() => [] as Badge[]),
          personajesApi.myFavorites().catch(() => [] as FavoritoPersonajeItem[]),
        ]);
        setFavoritos((favData as Favorito[]).map((f) => f.contenido).filter(Boolean));
        setReviews(revData);
        setRatings(ratData as RatingWithContenido[]);
        setLista(listaData);
        setMe(meData);
        setBadges(badgesData);
        setFavPersonajes(favPData);
      } catch {
        setFavoritos([]); setReviews([]); setRatings([]); setLista([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  if (!user && !loading) {
    return (
      <div style={{ backgroundColor: "var(--color-surface)", minHeight: "100vh", paddingTop: "64px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
          <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "56px", color: "var(--color-outline-variant)" }}>person_off</span>
          <p style={{ color: "var(--color-on-surface-variant)", fontFamily: "'Inter', sans-serif" }}>
            Debes{" "}<Link href="/login" style={{ color: "#f5c518", textDecoration: "none", fontWeight: 600 }}>iniciar sesión</Link>{" "}para ver tu perfil.
          </p>
        </div>
      </div>
    );
  }

  const completados = lista.filter((i) => i.estado === "completado").length;
  const avgRating = ratings.length ? (ratings.reduce((s, r) => s + r.puntuacion, 0) / ratings.length).toFixed(1) : "—";
  const horasEstimadas = me?.stats.horas_estimadas ?? completados * 5;

  // Genre frequency from ratings contenido
  const genreCount: Record<string, number> = {};
  ratings.forEach((r) => {
    r.contenido?.generos?.forEach((g) => {
      genreCount[g.nombre] = (genreCount[g.nombre] ?? 0) + 1;
    });
  });
  const topGenre = Object.entries(genreCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  // Rating histogram 1-10
  const histogram = Array.from({ length: 10 }, (_, i) => ({
    score: i + 1,
    count: ratings.filter((r) => Math.round(r.puntuacion) === i + 1).length,
  }));
  const maxCount = Math.max(...histogram.map((h) => h.count), 1);

  // Activity timeline: merge reviews + ratings + lista sorted by date desc
  const activity = [
    ...reviews.map((r) => ({ type: "review" as const, date: r.fecha, data: r })),
    ...ratings.map((r) => ({ type: "rating" as const, date: r.fecha, data: r })),
    ...lista.map((i) => ({ type: "lista" as const, date: i.fecha_actualizado, data: i })),
  ]
    .filter((a) => a.date)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 20);

  const TABS: { key: Tab; label: string; icon: string }[] = [
    { key: "stats", label: t("stats"), icon: "bar_chart" },
    { key: "lista", label: t("myList"), icon: "bookmarks" },
    { key: "ratings", label: t("ratings"), icon: "star" },
    { key: "reviews", label: t("reviews"), icon: "rate_review" },
    { key: "favoritos", label: t("favoritos"), icon: "favorite" },
    { key: "personajes", label: t("personajes"), icon: "person" },
  ];

  const pad = isMobile ? "16px" : isTablet ? "24px 32px" : "32px 48px 80px";
  const gridCols = isMobile ? "repeat(3, 1fr)" : isTablet ? "repeat(5, 1fr)" : "repeat(8, 1fr)";

  return (
    <div style={{ backgroundColor: "var(--color-surface)", minHeight: "100vh", paddingTop: "64px" }}>
      <main style={{ maxWidth: "1536px", margin: "0 auto", padding: pad }}>

        {/* Profile header */}
        <section style={{
          backgroundColor: "var(--color-surface-container-high)", borderRadius: "16px",
          padding: isMobile ? "24px 20px" : "40px",
          marginBottom: "32px", position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at right, rgba(245,197,24,0.05) 0%, transparent 60%)", pointerEvents: "none" }} />
          <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-start" : "center", gap: isMobile ? "16px" : "32px", position: "relative" }}>
            {/* Avatar */}
            <div style={{ borderRadius: "50%", background: "linear-gradient(135deg, #f5c518, var(--color-surface-container))", padding: "3px", flexShrink: 0 }}>
              <Avatar name={user?.nombre ?? "?"} userId={user?.id} size={isMobile ? 72 : 96} imageUrl={me?.avatar_url ?? null} />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: isMobile ? "1.4rem" : "2rem", color: "var(--color-on-surface)", letterSpacing: "-0.02em", marginBottom: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user?.nombre}
              </h1>
              <p style={{ fontFamily: "'Inter', sans-serif", color: "var(--color-outline)", fontSize: "0.9rem", marginBottom: me?.bio ? "10px" : "16px" }}>{user?.email}</p>
              {me?.bio && (
                <p style={{ fontFamily: "'Inter', sans-serif", color: "var(--color-on-surface-variant)", fontSize: "0.9rem", lineHeight: 1.55, marginBottom: "16px", maxWidth: "640px", whiteSpace: "pre-wrap" }}>
                  {me.bio}
                </p>
              )}
              <div style={{ display: "flex", gap: isMobile ? "20px" : "32px", flexWrap: "wrap" }}>
                {[
                  { value: lista.length, label: "En lista" },
                  { value: completados, label: "Completados" },
                  { value: ratings.length, label: "Ratings" },
                  { value: reviews.length, label: "Reviews" },
                  { value: favoritos.length, label: "Favoritos" },
                  { value: `${horasEstimadas}h`, label: "Tiempo estimado" },
                ].map(({ value, label }) => (
                  <div key={label} style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: isMobile ? "1.1rem" : "1.4rem", color: "#f5c518" }}>{value}</span>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-outline)" }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <Link href="/configuracion" style={{
              display: "flex", alignItems: "center", gap: "6px",
              color: "var(--color-outline)", textDecoration: "none",
              fontFamily: "'Inter', sans-serif", fontSize: "0.8rem",
              padding: "8px 14px", borderRadius: "8px",
              border: "1px solid var(--color-divider)",
              transition: "color 0.15s, border-color 0.15s",
              flexShrink: 0,
            }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-on-surface)"; e.currentTarget.style.borderColor = "var(--color-divider-strong)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-outline)"; e.currentTarget.style.borderColor = "var(--color-divider)"; }}
            >
              <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "16px" }}>settings</span>
              Configuración
            </Link>
          </div>
        </section>

        {/* Tabs */}
        <div style={{ borderBottom: "1px solid var(--color-divider)", marginBottom: "28px" }}>
          <div style={{ display: "flex", gap: "0" }}>
            {TABS.map(({ key, label, icon }) => (
              <button key={key} onClick={() => setTab(key)} style={{
                padding: isMobile ? "10px 12px" : "12px 18px",
                border: "none", background: "none", cursor: "pointer",
                fontFamily: "'Manrope', sans-serif", fontWeight: 600,
                fontSize: isMobile ? "0.8rem" : "0.9rem",
                color: tab === key ? "#f5c518" : "var(--color-outline)",
                borderBottom: tab === key ? "2px solid #f5c518" : "2px solid transparent",
                marginBottom: "-1px", transition: "color 0.15s",
                display: "flex", alignItems: "center", gap: "6px",
                whiteSpace: "nowrap",
              }}>
                <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "16px", fontVariationSettings: tab === key ? "'FILL' 1" : "'FILL' 0" }}>{icon}</span>
                {label}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div style={{ display: "flex", justifyContent: "center", paddingTop: "60px" }}>
            <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "48px", color: "var(--color-outline-variant)" }}>hourglass_empty</span>
          </div>
        )}

        {/* ── STATS ─────────────────────────────────────────────────────────── */}
        {!loading && tab === "stats" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            {/* KPI row */}
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: "12px" }}>
              {[
                { icon: "check_circle", label: "Completados", value: String(completados), color: "#4caf50" },
                { icon: "star", label: "Puntuación media", value: String(avgRating), color: "#f5c518" },
                { icon: "rate_review", label: "Reviews escritas", value: String(reviews.length), color: "#64b5f6" },
                { icon: "favorite", label: "Género favorito", value: topGenre, color: "#e05c5c" },
              ].map(({ icon, label, value, color }) => (
                <div key={label} style={{ backgroundColor: "var(--color-surface-container)", borderRadius: "12px", padding: "20px 16px", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "24px", color, fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                  <span style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "1.4rem", color: "var(--color-on-surface)" }}>{value}</span>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "var(--color-outline)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
                </div>
              ))}
            </div>

            {/* Lista breakdown */}
            {lista.length > 0 && (
              <div style={{ backgroundColor: "var(--color-surface-container)", borderRadius: "12px", padding: "24px" }}>
                <h3 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: "1rem", color: "var(--color-on-surface)", marginBottom: "20px" }}>Lista por estado</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {(["viendo", "completado", "planificado", "en_pausa", "abandonado"] as ListaEstado[]).map((e) => {
                    const count = lista.filter((i) => i.estado === e).length;
                    const pct = lista.length ? (count / lista.length) * 100 : 0;
                    return (
                      <div key={e} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "16px", color: ESTADO_COLORS[e], fontVariationSettings: "'FILL' 1", flexShrink: 0 }}>{ESTADO_ICONS[e]}</span>
                        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", color: "var(--color-on-surface-variant)", width: "90px", flexShrink: 0 }}>{ESTADO_LABELS[e]}</span>
                        <div style={{ flex: 1, backgroundColor: "var(--color-surface-container-high)", borderRadius: "4px", height: "8px", overflow: "hidden" }}>
                          <div style={{ width: `${pct}%`, height: "100%", backgroundColor: ESTADO_COLORS[e], borderRadius: "4px", transition: "width 0.5s" }} />
                        </div>
                        <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: "0.85rem", fontWeight: 700, color: "var(--color-on-surface)", width: "28px", textAlign: "right", flexShrink: 0 }}>{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Rating histogram */}
            {ratings.length > 0 && (
              <div style={{ backgroundColor: "var(--color-surface-container)", borderRadius: "12px", padding: "24px" }}>
                <h3 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: "1rem", color: "var(--color-on-surface)", marginBottom: "20px" }}>Distribución de ratings</h3>
                <div style={{ display: "flex", alignItems: "flex-end", gap: isMobile ? "6px" : "10px", height: "100px" }}>
                  {histogram.map(({ score, count }) => (
                    <div key={score} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", height: "100%" }}>
                      <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end" }}>
                        <div style={{ width: "100%", height: `${(count / maxCount) * 100}%`, backgroundColor: count > 0 ? "#f5c518" : "var(--color-surface-container-high)", borderRadius: "4px 4px 0 0", minHeight: count > 0 ? "4px" : "0", transition: "height 0.4s" }} />
                      </div>
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: "var(--color-outline)" }}>{score}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Badges */}
            {badges.length > 0 && (
              <div style={{ backgroundColor: "var(--color-surface-container)", borderRadius: "12px", padding: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "20px" }}>
                  <h3 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: "1rem", color: "var(--color-on-surface)" }}>Logros</h3>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "var(--color-outline)" }}>
                    {badges.filter((b) => b.unlocked).length} / {badges.length}
                  </span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(auto-fill, minmax(180px, 1fr))", gap: "10px" }}>
                  {badges.map((b) => {
                    const pct = b.progress ? Math.min(100, (b.progress.value / b.progress.target) * 100) : (b.unlocked ? 100 : 0);
                    return (
                      <div key={b.id} title={b.description} style={{
                        display: "flex", flexDirection: "column", gap: "8px",
                        padding: "14px", borderRadius: "10px",
                        backgroundColor: b.unlocked ? "var(--color-primary-soft)" : "var(--color-surface-container-high)",
                        border: `1px solid ${b.unlocked ? "rgba(245,197,24,0.4)" : "var(--color-divider)"}`,
                        opacity: b.unlocked ? 1 : 0.65,
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: b.unlocked ? "#f5c518" : "var(--color-surface-container)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "20px", color: b.unlocked ? "#3d2f00" : "var(--color-outline)", fontVariationSettings: "'FILL' 1" }}>{b.icon}</span>
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.85rem", color: "var(--color-on-surface)", lineHeight: 1.2 }}>{b.label}</p>
                            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: "var(--color-outline)", marginTop: "2px" }}>{b.description}</p>
                          </div>
                        </div>
                        {b.progress && !b.unlocked && (
                          <div>
                            <div style={{ width: "100%", backgroundColor: "var(--color-surface-container)", borderRadius: "3px", height: "4px", overflow: "hidden" }}>
                              <div style={{ width: `${pct}%`, height: "100%", backgroundColor: "#f5c518", transition: "width 0.4s" }} />
                            </div>
                            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: "var(--color-outline)", marginTop: "3px", display: "block" }}>
                              {b.progress.value} / {b.progress.target}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Activity timeline */}
            {activity.length > 0 && (
              <div style={{ backgroundColor: "var(--color-surface-container)", borderRadius: "12px", padding: "24px" }}>
                <h3 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: "1rem", color: "var(--color-on-surface)", marginBottom: "20px" }}>Actividad reciente</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                  {activity.map((a, i) => {
                    let icon = "star"; let color = "#f5c518"; let text = "";
                    if (a.type === "review") {
                      icon = "rate_review"; color = "#64b5f6";
                      const r = a.data as Review & { contenido?: { titulo?: string } };
                      text = `Escribió una review de "${r.contenido?.titulo ?? "contenido"}"`;
                      color = "#64b5f6";
                    } else if (a.type === "rating") {
                      const r = a.data as RatingWithContenido;
                      text = `Calificó "${r.contenido?.titulo ?? "contenido"}" con ${r.puntuacion}/10`;
                    } else {
                      const l = a.data as ListaItem;
                      icon = ESTADO_ICONS[l.estado as ListaEstado] ?? "bookmarks";
                      color = ESTADO_COLORS[l.estado as ListaEstado] ?? "var(--color-outline)";
                      text = `Marcó "${l.contenido?.titulo ?? "contenido"}" como ${ESTADO_LABELS[l.estado as ListaEstado]}`;
                    }
                    return (
                      <div key={i} style={{ display: "flex", gap: "14px", alignItems: "flex-start", padding: "12px 0", borderBottom: i < activity.length - 1 ? "1px solid var(--color-hover-bg-soft)" : "none" }}>
                        <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: `${color}22`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "2px" }}>
                          <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "16px", color, fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", color: "var(--color-on-surface-variant)", lineHeight: 1.5 }}>{text}</p>
                          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "var(--color-outline)" }}>
                            {new Date(a.date).toLocaleDateString("es", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {lista.length === 0 && ratings.length === 0 && reviews.length === 0 && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "60px", gap: "16px" }}>
                <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "56px", color: "var(--color-outline-variant)" }}>bar_chart</span>
                <p style={{ color: "var(--color-outline)", fontFamily: "'Inter', sans-serif" }}>Aún no hay actividad para mostrar estadísticas.</p>
                <Link href="/buscar" style={{ backgroundColor: "#f5c518", color: "#3d2f00", padding: "10px 24px", borderRadius: "8px", fontFamily: "'Manrope', sans-serif", fontWeight: 700, textDecoration: "none", fontSize: "0.875rem" }}>Explorar catálogo</Link>
              </div>
            )}
          </div>
        )}

        {/* ── LISTA ─────────────────────────────────────────────────────────── */}
        {!loading && tab === "lista" && (
          lista.length === 0 ? (
            <EmptyState icon="bookmarks" text="Tu lista está vacía" href="/buscar" />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {lista.map((item) => {
                const c = item.contenido;
                const estado = item.estado as ListaEstado;
                return (
                  <Link key={item.id} href={c ? contenidoPath(c) : "#"} style={{ textDecoration: "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px", backgroundColor: "var(--color-surface-container)", borderRadius: "8px", padding: "12px 14px", transition: "background 0.15s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-surface-container)")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--color-surface-container)")}
                    >
                      <div style={{ position: "relative", width: "40px", height: "56px", borderRadius: "4px", overflow: "hidden", backgroundColor: "var(--color-surface-container-high)", flexShrink: 0 }}>
                        {c?.imagen && <Image src={c.imagen} alt={c.titulo} fill sizes="40px" style={{ objectFit: "cover" }} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: "0.875rem", color: "var(--color-on-surface)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c?.titulo}</p>
                        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "var(--color-outline)", marginTop: "2px" }}>{c?.tipo} · {c?.año}</p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                        <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "15px", color: ESTADO_COLORS[estado], fontVariationSettings: "'FILL' 1" }}>{ESTADO_ICONS[estado]}</span>
                        {!isMobile && <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", color: ESTADO_COLORS[estado] }}>{ESTADO_LABELS[estado]}</span>}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )
        )}

        {/* ── RATINGS ───────────────────────────────────────────────────────── */}
        {!loading && tab === "ratings" && (
          ratings.length === 0 ? (
            <EmptyState icon="star_border" text={t("noRatings")} href="/buscar" />
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px" }}>
              {ratings.map((r) => {
                const c = r.contenido;
                return (
                  <Link key={r.id} href={c ? contenidoPath(c) : "#"} style={{ textDecoration: "none" }}>
                    <div style={{ backgroundColor: "var(--color-surface-container)", borderRadius: "10px", overflow: "hidden", transition: "transform 0.2s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
                    >
                      <div style={{ position: "relative", paddingTop: "150%", backgroundColor: "var(--color-surface-container-high)" }}>
                        {c?.imagen && <Image src={c.imagen} alt={c.titulo} fill sizes="(max-width: 640px) 50vw, 200px" style={{ objectFit: "cover" }} />}
                        <div style={{ position: "absolute", bottom: "8px", right: "8px", backgroundColor: "color-mix(in srgb, var(--color-surface) 80%, transparent)", borderRadius: "6px", padding: "4px 8px", display: "flex", alignItems: "center", gap: "4px" }}>
                          <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "13px", color: "#f5c518", fontVariationSettings: "'FILL' 1" }}>star</span>
                          <span style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.875rem", color: "#f5c518" }}>{r.puntuacion}/10</span>
                        </div>
                      </div>
                      <div style={{ padding: "10px 12px" }}>
                        <p style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: "0.8rem", color: "var(--color-on-surface)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c?.titulo}</p>
                        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: "var(--color-outline)", marginTop: "2px" }}>
                          {r.fecha ? new Date(r.fecha).toLocaleDateString("es", { month: "short", year: "numeric" }) : ""}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )
        )}

        {/* ── REVIEWS ───────────────────────────────────────────────────────── */}
        {!loading && tab === "reviews" && (
          reviews.length === 0 ? (
            <EmptyState icon="rate_review" text={t("noReviews")} href="/buscar" />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: isMobile ? "100%" : "720px" }}>
              {reviews.map((r) => {
                const rc = (r as Review & { contenido?: import("@/types").Contenido }).contenido;
                const hrefRc = rc ? contenidoPath(rc) : "#";
                return (
                  <div key={r.id} style={{ backgroundColor: "var(--color-surface-container)", borderRadius: "12px", padding: isMobile ? "16px" : "20px 24px", border: "1px solid var(--color-hover-bg-soft)" }}>
                    {/* Contenido header */}
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px", paddingBottom: "14px", borderBottom: "1px solid var(--color-hover-bg-soft)" }}>
                      {rc?.imagen && (
                        <Link href={hrefRc} style={{ flexShrink: 0 }}>
                          <Image src={rc.imagen} alt={rc.titulo} width={36} height={52} sizes="36px" style={{ width: "36px", height: "52px", borderRadius: "4px", objectFit: "cover", display: "block" }} />
                        </Link>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Link href={hrefRc} style={{ textDecoration: "none" }}>
                          <p style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.9rem", color: "var(--color-on-surface)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {rc?.titulo ?? "Contenido"}
                          </p>
                        </Link>
                        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "var(--color-outline)", marginTop: "2px" }}>
                          {rc?.tipo} · {r.fecha ? new Date(r.fecha).toLocaleDateString("es", { day: "numeric", month: "short", year: "numeric" }) : ""}
                        </p>
                      </div>
                      {r.puntuacion && (
                        <div style={{ display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 }}>
                          <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "14px", color: "#f5c518", fontVariationSettings: "'FILL' 1" }}>star</span>
                          <span style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.875rem", color: "#f5c518" }}>{r.puntuacion}/10</span>
                        </div>
                      )}
                    </div>
                    <ReviewMarkdown text={r.comentario} />
                    <ReviewImagesGallery urls={r.imagenes} />
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* ── FAVORITOS ─────────────────────────────────────────────────────── */}
        {!loading && tab === "favoritos" && (
          favoritos.length === 0 ? (
            <EmptyState icon="favorite_border" text={t("noFavorites")} href="/buscar" />
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: gridCols, gap: isMobile ? "10px" : "16px" }}>
              {favoritos.map((item) => <Card key={item.id} item={item} />)}
            </div>
          )
        )}

        {!loading && tab === "personajes" && (
          favPersonajes.length === 0 ? (
            <EmptyState icon="person_off" text={t("noFavCharacters")} href="/buscar" />
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(auto-fill, minmax(160px, 1fr))", gap: "12px" }}>
              {favPersonajes.map((fp) => (
                <Link key={fp.id} href={`/personaje/${fp.personaje.mal_id}`} style={{ textDecoration: "none" }}>
                  <div style={{ backgroundColor: "var(--color-surface-container)", borderRadius: "10px", overflow: "hidden", padding: "12px", display: "flex", gap: "10px", alignItems: "center" }}>
                    {fp.personaje.imagen && (
                      <div style={{ position: "relative", width: "44px", height: "60px", borderRadius: "6px", overflow: "hidden", flexShrink: 0, backgroundColor: "var(--color-surface-container-high)" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={fp.personaje.imagen} alt={fp.personaje.nombre} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                    )}
                    <p style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: "0.85rem", color: "var(--color-on-surface)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fp.personaje.nombre}</p>
                  </div>
                </Link>
              ))}
            </div>
          )
        )}
      </main>
    </div>
  );
}

function EmptyState({ icon, text, href }: { icon: string; text: string; href: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "64px", gap: "16px" }}>
      <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "56px", color: "var(--color-outline-variant)" }}>{icon}</span>
      <p style={{ color: "var(--color-outline)", fontFamily: "'Inter', sans-serif" }}>{text}</p>
      <Link href={href} style={{ backgroundColor: "#f5c518", color: "#3d2f00", padding: "10px 24px", borderRadius: "8px", fontFamily: "'Manrope', sans-serif", fontWeight: 700, textDecoration: "none", fontSize: "0.875rem" }}>
        Explorar catálogo
      </Link>
    </div>
  );
}
