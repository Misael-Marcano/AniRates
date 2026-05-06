"use client";

import Link from "next/link";
import { contenidoPath } from "@/services/routes";
import type { Contenido } from "@/types";

interface CardProps {
  item: Contenido;
  rank?: number;
  reviewCount?: number;
}

export default function Card({ item, rank, reviewCount }: CardProps) {
  const isAnime = item.tipo === "ANIME";
  const genres = item.generos?.slice(0, 2).map((g) => g.nombre).join(", ") || "";
  const year = item.año || "";

  return (
    <Link href={contenidoPath(item)} style={{ textDecoration: "none", display: "block", width: "100%" }}>
      <article style={{ cursor: "pointer", display: "flex", flexDirection: "column", gap: "10px" }}>
        {/* Poster container - aspect 2/3 */}
        <div style={{
          position: "relative",
          width: "100%",
          paddingTop: "150%", /* 2:3 ratio */
          borderRadius: "8px",
          overflow: "hidden",
          backgroundColor: "var(--color-surface-container-high)",
          boxShadow: "0 4px 16px var(--color-scrim)",
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
        }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLDivElement).style.transform = "scale(1.04)";
            (e.currentTarget as HTMLDivElement).style.boxShadow = "0 0 0 2px #f5c518, 0 8px 32px var(--color-scrim-strong)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLDivElement).style.transform = "scale(1)";
            (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 16px var(--color-scrim)";
          }}
        >
          {/* Image */}
          {item.imagen ? (
            <img
              src={item.imagen}
              alt={item.titulo}
              loading="lazy"
              decoding="async"
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          ) : (
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "3rem",
            }}>
              {isAnime ? "🎬" : "📚"}
            </div>
          )}

          {/* Rank number */}
          {rank && (
            <span style={{
              position: "absolute", bottom: "8px", left: "10px",
              fontSize: "2.5rem", fontWeight: 900, lineHeight: 1,
              fontFamily: "'Manrope', sans-serif",
              color: "#f5c518",
              textShadow: "0 2px 8px var(--color-scrim-strong), -1px -1px 0 #000, 1px 1px 0 #000",
            }}>
              {rank}
            </span>
          )}

          {/* Type badge — top left */}
          <div style={{
            position: "absolute", top: "8px", left: "8px",
            backgroundColor: isAnime ? "rgba(0,64,203,0.8)" : "rgba(90,0,180,0.8)",
            backdropFilter: "blur(8px)",
            color: isAnime ? "#b2c0ff" : "#d3bbff",
            fontSize: "10px", fontWeight: 700,
            padding: "2px 8px", borderRadius: "20px",
            letterSpacing: "0.08em", textTransform: "uppercase",
            fontFamily: "'Inter', sans-serif",
            border: isAnime ? "1px solid rgba(183,196,255,0.2)" : "1px solid rgba(211,187,255,0.2)",
          }}>
            {item.tipo}
          </div>

          {/* Rating badge — top right */}
          {(item.rating_promedio ?? 0) > 0 && (
            <div style={{
              position: "absolute", top: "8px", right: "8px",
              backgroundColor: "color-mix(in srgb, var(--color-surface) 80%, transparent)",
              backdropFilter: "blur(8px)",
              border: "1px solid var(--color-divider-strong)",
              color: "#f5c518",
              fontSize: "11px", fontWeight: 700,
              padding: "3px 7px", borderRadius: "4px",
              display: "flex", alignItems: "center", gap: "3px",
              fontFamily: "'Manrope', sans-serif",
            }}>
              <span className="material-symbols-outlined" aria-hidden="true" style={{
                fontSize: "13px",
                fontVariationSettings: "'FILL' 1",
              }}>star</span>
              <span className="sr-only">Puntuación </span>
              {(item.rating_promedio ?? 0).toFixed(1)}
            </div>
          )}

          {/* Review count badge — bottom right */}
          {(reviewCount ?? 0) > 0 && (
            <div style={{
              position: "absolute", bottom: "8px", right: "8px",
              backgroundColor: "color-mix(in srgb, var(--color-surface) 80%, transparent)",
              backdropFilter: "blur(8px)",
              border: "1px solid var(--color-divider-strong)",
              color: "var(--color-on-surface-variant)",
              fontSize: "10px", fontWeight: 600,
              padding: "2px 6px", borderRadius: "4px",
              display: "flex", alignItems: "center", gap: "3px",
              fontFamily: "'Inter', sans-serif",
            }}>
              <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "12px" }}>rate_review</span>
              <span className="sr-only">Reviews </span>
              {reviewCount}
            </div>
          )}
        </div>

        {/* Title + meta below */}
        <div>
          <h3 style={{
            fontFamily: "'Manrope', sans-serif",
            fontWeight: 600,
            fontSize: "0.875rem",
            color: "var(--color-on-surface)",
            lineHeight: 1.3,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 1,
            WebkitBoxOrient: "vertical",
            transition: "color 0.2s",
          }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#f5c518")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-on-surface)")}
          >
            {item.titulo}
          </h3>
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "11px",
            color: "var(--color-on-surface-variant)",
            marginTop: "3px",
          }}>
            {genres}{genres && year ? " • " : ""}{year}
          </p>
        </div>
      </article>
    </Link>
  );
}
