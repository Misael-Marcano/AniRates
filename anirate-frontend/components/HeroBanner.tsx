"use client";

import Link from "next/link";
import Image from "next/image";
import { contenidoPath } from "@/services/routes";
import type { Contenido } from "@/types";

interface HeroBannerProps {
  item: Contenido | null;
}

export default function HeroBanner({ item }: HeroBannerProps) {
  if (!item) return (
    <div style={{ height: "500px", backgroundColor: "var(--color-surface)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "var(--color-outline-variant)" }}>Cargando...</p>
    </div>
  );

  const isAnime = item.tipo === "ANIME";

  return (
    <section style={{ position: "relative", width: "100%", height: "500px", overflow: "hidden" }}>
      {/* Background */}
      {item.imagen && (
        <Image
          src={item.imagen}
          alt=""
          aria-hidden="true"
          fill
          priority
          sizes="100vw"
          style={{ objectFit: "cover", opacity: 0.6 }}
        />
      )}

      {/* Gradient overlays */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to top, var(--color-surface) 0%, color-mix(in srgb, var(--color-surface) 80%, transparent) 40%, transparent 100%)",
      }} />
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to right, var(--color-surface) 0%, color-mix(in srgb, var(--color-surface) 80%, transparent) 50%, transparent 100%)",
      }} />

      {/* Content */}
      <div style={{
        position: "relative", zIndex: 10,
        height: "100%",
        display: "flex", flexDirection: "column", justifyContent: "flex-end",
        padding: "0 48px 48px",
        maxWidth: "1536px",
        margin: "0 auto",
      }}>
        <div style={{ maxWidth: "560px" }}>
          {/* Badges */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
            <span style={{
              backgroundColor: isAnime ? "rgba(0,64,203,0.2)" : "rgba(90,0,180,0.2)",
              color: isAnime ? "#b7c4ff" : "#d3bbff",
              fontSize: "11px", fontWeight: 700,
              padding: "3px 12px", borderRadius: "20px",
              letterSpacing: "0.1em", textTransform: "uppercase",
              fontFamily: "'Inter', sans-serif",
            }}>
              {item.tipo}
            </span>
            {(item.rating_promedio ?? 0) > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#f5c518", fontFamily: "'Manrope', sans-serif", fontWeight: 700 }}>
                <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "18px", fontVariationSettings: "'FILL' 1" }}>star</span>
                <span>{(item.rating_promedio ?? 0).toFixed(1)}</span>
              </div>
            )}
          </div>

          {/* Title */}
          <h1 style={{
            fontFamily: "'Manrope', sans-serif",
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            fontWeight: 700,
            color: "var(--color-on-surface)",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            marginBottom: "16px",
          }}>
            {item.titulo}
          </h1>

          {/* Description */}
          <p style={{
            fontFamily: "'Inter', sans-serif",
            color: "var(--color-on-surface-variant)",
            fontSize: "1rem",
            lineHeight: 1.7,
            marginBottom: "32px",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}>
            {item.descripcion}
          </p>

          {/* Buttons */}
          <div style={{ display: "flex", gap: "12px" }}>
            <Link href={contenidoPath(item)} style={{
              backgroundColor: "#f5c518", color: "#3d2f00",
              padding: "12px 28px", borderRadius: "6px",
              fontFamily: "'Manrope', sans-serif",
              fontWeight: 700, fontSize: "0.95rem",
              textDecoration: "none",
              display: "flex", alignItems: "center", gap: "8px",
              transition: "box-shadow 0.2s",
            }}
              onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 0 12px rgba(245,197,24,0.4)")}
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
            >
              <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "20px", fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
              Ver Detalles
            </Link>
            <Link href={contenidoPath(item)} style={{
              backgroundColor: "color-mix(in srgb, var(--color-surface) 80%, transparent)",
              backdropFilter: "blur(8px)",
              border: "1px solid var(--color-divider-strong)",
              color: "var(--color-on-surface)",
              padding: "12px 28px", borderRadius: "6px",
              fontFamily: "'Manrope', sans-serif",
              fontWeight: 700, fontSize: "0.95rem",
              textDecoration: "none",
              display: "flex", alignItems: "center", gap: "8px",
              transition: "background-color 0.2s",
            }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(42,42,42,0.8)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "color-mix(in srgb, var(--color-surface) 80%, transparent)")}
            >
              <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "20px" }}>star_rate</span>
              Calificar
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
