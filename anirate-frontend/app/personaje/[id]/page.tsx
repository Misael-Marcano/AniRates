"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { personajesApi, type PersonajeFull } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

export default function PersonajePage() {
  const params = useParams<{ id: string }>();
  const malId = Number(params.id);
  const { isLoggedIn } = useAuth();
  const [data, setData] = useState<PersonajeFull | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [favorited, setFavorited] = useState(false);
  const [favSaving, setFavSaving] = useState(false);

  useEffect(() => {
    personajesApi.one(malId)
      .then(setData)
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
    if (isLoggedIn) {
      personajesApi.isFavorite(malId).then((r) => setFavorited(r.favorited)).catch(() => {});
    }
  }, [malId, isLoggedIn]);

  async function toggleFavorite() {
    if (!isLoggedIn || favSaving) return;
    setFavSaving(true);
    try {
      const res = favorited ? await personajesApi.unfavorite(malId) : await personajesApi.favorite(malId);
      setFavorited(res.favorited);
    } catch { /* ignore */ } finally {
      setFavSaving(false);
    }
  }

  if (loading) {
    return <main style={{ minHeight: "100vh", paddingTop: "120px", textAlign: "center", color: "var(--color-outline)" }}>Cargando...</main>;
  }
  if (error || !data) {
    return <main style={{ minHeight: "100vh", paddingTop: "120px", textAlign: "center" }}>
      <p style={{ color: "var(--color-on-surface)" }}>{error || "Personaje no encontrado"}</p>
    </main>;
  }

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "var(--color-surface)", paddingTop: "80px", paddingBottom: "60px" }}>
      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "0 24px" }}>
        <header style={{ display: "flex", gap: "24px", marginBottom: "32px", flexWrap: "wrap" }}>
          {data.imagen && (
            <div style={{ position: "relative", width: "200px", height: "280px", borderRadius: "12px", overflow: "hidden", flexShrink: 0, backgroundColor: "var(--color-surface-container-high)" }}>
              <Image src={data.imagen} alt={data.nombre} fill sizes="200px" style={{ objectFit: "cover" }} />
            </div>
          )}
          <div style={{ flex: 1, minWidth: "260px" }}>
            <h1 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 900, fontSize: "2rem", color: "var(--color-on-surface)", letterSpacing: "-0.03em", margin: "0 0 8px" }}>
              {data.nombre}
            </h1>
            {isLoggedIn && (
              <button onClick={toggleFavorite} disabled={favSaving} aria-label={favorited ? "Quitar de favoritos" : "Marcar como favorito"}
                style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "8px", border: favorited ? "1px solid #e05c5c" : "1px solid var(--color-divider-strong)", backgroundColor: favorited ? "rgba(224,92,92,0.15)" : "transparent", color: favorited ? "#e05c5c" : "var(--color-on-surface-variant)", cursor: favSaving ? "wait" : "pointer", fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: "0.85rem", marginBottom: "12px" }}>
                <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "18px", fontVariationSettings: favorited ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
                {favorited ? "En favoritos" : "Favorito"}
              </button>
            )}
            {data.about && (
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.9rem", lineHeight: 1.6, color: "var(--color-on-surface-variant)", whiteSpace: "pre-wrap" }}>
                {data.about.length > 800 ? data.about.slice(0, 800) + "…" : data.about}
              </p>
            )}
          </div>
        </header>

        {data.voice_actors.length > 0 && (
          <section>
            <h2 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "1.2rem", color: "var(--color-on-surface)", marginBottom: "16px" }}>
              Voice Actors
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "12px" }}>
              {data.voice_actors.map((va) => (
                <Link key={va.id} href={`/voice-actor/${va.mal_id}`} style={{ textDecoration: "none" }}>
                  <div style={{ backgroundColor: "var(--color-surface-container)", borderRadius: "10px", overflow: "hidden", padding: "12px", display: "flex", gap: "10px", alignItems: "center" }}>
                    {va.imagen && (
                      <div style={{ position: "relative", width: "44px", height: "60px", borderRadius: "6px", overflow: "hidden", flexShrink: 0 }}>
                        <Image src={va.imagen} alt={va.nombre} fill sizes="44px" style={{ objectFit: "cover" }} />
                      </div>
                    )}
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: "0.85rem", color: "var(--color-on-surface)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{va.nombre}</p>
                      {va.idioma && <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "var(--color-outline)", margin: "2px 0 0" }}>{va.idioma}</p>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
