"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Card from "@/components/Card";
import { recomendacionesApi, type RecomendacionItem } from "@/services/api";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { useAuth } from "@/contexts/AuthContext";
import { SkeletonGrid } from "@/components/Skeleton";
import { jikanPath } from "@/services/routes";
import type { Contenido } from "@/types";

const STRATEGY_LABELS: Record<string, { label: string; icon: string; desc: string }> = {
  cf: {
    label: "Filtrado colaborativo",
    icon: "groups",
    desc: "Usuarios con gustos parecidos calificaron alto estos títulos.",
  },
  content: {
    label: "Basado en tus géneros",
    icon: "category",
    desc: "Calculado a partir de los géneros que más has calificado alto.",
  },
  cold: {
    label: "Descubre",
    icon: "explore",
    desc: "Aún no tienes suficientes ratings — califica más para mejorar.",
  },
};

function toContenido(r: RecomendacionItem): Contenido {
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

export default function RecomendacionesPage() {
  const [items, setItems] = useState<RecomendacionItem[]>([]);
  const [strategy, setStrategy] = useState<string>("cold");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isMobile, isTablet } = useBreakpoint();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    async function load() {
      try {
        const data = await recomendacionesApi.getForMe(30);
        setItems(data.items);
        setStrategy(data.strategy);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error cargando recomendaciones");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const pad = isMobile ? "16px" : isTablet ? "24px 32px" : "32px 48px";
  const gridCols = isMobile
    ? "repeat(2, 1fr)"
    : isTablet
    ? "repeat(4, 1fr)"
    : "repeat(auto-fill, minmax(180px, 1fr))";

  const meta = STRATEGY_LABELS[strategy] ?? STRATEGY_LABELS.cold;

  if (!user) {
    return (
      <div style={{ backgroundColor: "var(--color-surface)", minHeight: "100vh", paddingTop: "120px", textAlign: "center" }}>
        <p style={{ color: "var(--color-on-surface-variant)", fontFamily: "'Inter', sans-serif" }}>
          Inicia sesión para ver recomendaciones personalizadas.
        </p>
        <Link href="/login" style={{
          display: "inline-block", marginTop: "16px",
          backgroundColor: "#f5c518", color: "#3d2f00",
          padding: "10px 24px", borderRadius: "8px",
          fontFamily: "'Manrope', sans-serif", fontWeight: 700,
          textDecoration: "none",
        }}>
          Iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "var(--color-surface)", minHeight: "100vh", paddingTop: "64px" }}>
      <div style={{ maxWidth: "1536px", margin: "0 auto", padding: pad }}>
        <div style={{
          borderBottom: "1px solid var(--color-divider)",
          paddingBottom: "24px", marginBottom: "32px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <span style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              backgroundColor: "#f5c518", borderRadius: "6px", padding: "4px 8px",
            }}>
              <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "16px", color: "#3d2f00", fontVariationSettings: "'FILL' 1" }}>
                {meta.icon}
              </span>
            </span>
            <h1 style={{
              fontFamily: "'Manrope', sans-serif",
              fontWeight: 700,
              fontSize: isMobile ? "1.6rem" : "2.2rem",
              color: "var(--color-on-surface)", letterSpacing: "-0.02em",
            }}>
              Para ti
            </h1>
          </div>
          <p style={{ fontFamily: "'Inter', sans-serif", color: "var(--color-on-surface-variant)", fontSize: "0.875rem" }}>
            <span style={{ color: "#f5c518", fontWeight: 600 }}>{meta.label}</span> — {meta.desc}
          </p>
        </div>

        {loading && <SkeletonGrid count={12} minColWidth={isMobile ? 140 : 180} />}

        {!loading && error && (
          <p style={{ color: "#e05c5c", fontFamily: "'Inter', sans-serif" }}>{error}</p>
        )}

        {!loading && !error && items.length === 0 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "80px", gap: "16px" }}>
            <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "64px", color: "var(--color-outline-variant)" }}>auto_awesome</span>
            <p style={{ color: "var(--color-outline)", fontFamily: "'Inter', sans-serif" }}>
              Aún no hay datos suficientes. Califica algunos títulos para empezar.
            </p>
            <Link href="/buscar" style={{
              backgroundColor: "#f5c518", color: "#3d2f00",
              padding: "10px 24px", borderRadius: "8px",
              fontFamily: "'Manrope', sans-serif", fontWeight: 700,
              fontSize: "0.875rem", textDecoration: "none",
            }}>
              Explorar catálogo
            </Link>
          </div>
        )}

        {!loading && items.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: gridCols, gap: isMobile ? "12px" : "20px" }}>
            {items.map((r) => (
              <div key={r.contenido_id} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <Card item={toContenido(r)} />
                {r.source_titulo && r.source_jikan_id && (
                  <Link
                    href={jikanPath(r.source_jikan_id, r.tipo === "MANGA" ? "manga" : "anime")}
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "0.7rem",
                      color: "var(--color-on-surface-variant)",
                      textDecoration: "none",
                      display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden",
                    }}
                    title={`Porque te gustó ${r.source_titulo}`}
                  >
                    Porque te gustó <span style={{ color: "#f5c518", fontWeight: 600 }}>{r.source_titulo}</span>
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
