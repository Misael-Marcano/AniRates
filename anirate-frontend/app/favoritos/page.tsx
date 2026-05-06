"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Card from "@/components/Card";
import { favoritosApi } from "@/services/api";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { useAuth } from "@/contexts/AuthContext";
import { SkeletonGrid } from "@/components/Skeleton";
import type { Contenido } from "@/types";

export default function FavoritosPage() {
  const [items, setItems] = useState<Contenido[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const { isMobile, isTablet } = useBreakpoint();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    async function load() {
      try {
        const data = await favoritosApi.getByUser(user!.id);
        setItems(data.map((f) => f.contenido).filter(Boolean));
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const filtered = filter ? items.filter((i) => i.tipo === filter) : items;
  const pad = isMobile ? "16px" : isTablet ? "24px 32px" : "32px 48px";
  const gridCols = isMobile
    ? "repeat(2, 1fr)"
    : isTablet
    ? "repeat(4, 1fr)"
    : "repeat(auto-fill, minmax(180px, 1fr))";

  return (
    <div style={{ backgroundColor: "var(--color-surface)", minHeight: "100vh", paddingTop: "64px" }}>
      <div style={{ maxWidth: "1536px", margin: "0 auto", padding: pad }}>
        {/* Header */}
        <div style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "flex-start" : "flex-end",
          justifyContent: "space-between",
          gap: isMobile ? "16px" : "0",
          borderBottom: "1px solid var(--color-divider)",
          paddingBottom: "24px", marginBottom: "32px",
        }}>
          <div>
            <h1 style={{
              fontFamily: "'Manrope', sans-serif",
              fontWeight: 700,
              fontSize: isMobile ? "1.6rem" : "2.2rem",
              color: "var(--color-on-surface)", letterSpacing: "-0.02em", marginBottom: "4px",
            }}>
              Mis Favoritos
            </h1>
            <p style={{ fontFamily: "'Inter', sans-serif", color: "var(--color-on-surface-variant)", fontSize: "0.875rem" }}>
              {items.length > 0 ? (
                <><span style={{ color: "#f5c518", fontWeight: 600 }}>{items.length}</span> títulos guardados</>
              ) : "Tu colección personal"}
            </p>
          </div>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {[["", "Todos"], ["ANIME", "Anime"], ["MANGA", "Manga"]].map(([val, label]) => (
              <button
                key={val}
                onClick={() => setFilter(val)}
                style={{
                  padding: "8px 16px", borderRadius: "6px", border: "none",
                  cursor: "pointer", fontSize: "0.875rem",
                  fontFamily: "'Manrope', sans-serif", fontWeight: 600,
                  backgroundColor: filter === val ? "#f5c518" : "var(--color-surface-container-high)",
                  color: filter === val ? "#3d2f00" : "var(--color-on-surface-variant)",
                  transition: "all 0.15s",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {loading && <SkeletonGrid count={8} minColWidth={isMobile ? 140 : 180} />}

        {!loading && filtered.length === 0 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingTop: "80px", gap: "16px" }}>
            <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "64px", color: "var(--color-outline-variant)" }}>favorite_border</span>
            <p style={{ color: "var(--color-outline)", fontFamily: "'Inter', sans-serif", fontSize: "1rem" }}>
              {items.length === 0 ? "Aún no tienes favoritos" : "No hay resultados para este filtro"}
            </p>
            {items.length === 0 && (
              <Link href="/buscar" style={{
                backgroundColor: "#f5c518", color: "#3d2f00",
                padding: "10px 24px", borderRadius: "8px",
                fontFamily: "'Manrope', sans-serif", fontWeight: 700,
                fontSize: "0.875rem", textDecoration: "none",
              }}>
                Explorar catálogo
              </Link>
            )}
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: gridCols, gap: isMobile ? "12px" : "20px" }}>
            {filtered.map((item) => <Card key={item.id} item={item} />)}
          </div>
        )}
      </div>
    </div>
  );
}
