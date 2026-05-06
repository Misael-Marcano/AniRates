"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { socialApi, ESTADO_LABELS, ESTADO_COLORS, type FeedEvent, type ListaEstado } from "@/services/api";
import { contenidoPath } from "@/services/routes";
import { useAuth } from "@/contexts/AuthContext";
import { SkeletonRow } from "@/components/Skeleton";
import ReviewImagesGallery from "@/components/ReviewImagesGallery";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "ahora";
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `hace ${d} d`;
  return new Date(iso).toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

function EventCard({ ev }: { ev: FeedEvent }) {
  const href = contenidoPath(ev.contenido);

  const icon = ev.tipo === "review" ? "rate_review" : ev.tipo === "rating" ? "star" : "bookmarks";
  const iconColor = ev.tipo === "review" ? "#80cbc4" : ev.tipo === "rating" ? "#f5c518" : "#b7c4ff";

  let actionText: React.ReactNode;
  if (ev.tipo === "review") actionText = <>escribió una review de <strong style={{ color: "#f5c518" }}>{ev.contenido.titulo}</strong></>;
  else if (ev.tipo === "rating") actionText = <>calificó <strong style={{ color: "#f5c518" }}>{ev.contenido.titulo}</strong> con ★ {ev.payload.puntuacion}</>;
  else {
    const label = ev.payload.estado ? ESTADO_LABELS[ev.payload.estado as ListaEstado] ?? ev.payload.estado : "";
    const color = ev.payload.estado ? ESTADO_COLORS[ev.payload.estado as ListaEstado] ?? "#f5c518" : "#f5c518";
    actionText = <>marcó <strong style={{ color: "#f5c518" }}>{ev.contenido.titulo}</strong> como <span style={{ color }}>{label}</span></>;
  }

  return (
    <article style={{ backgroundColor: "var(--color-surface-container-low)", borderRadius: "12px", border: "1px solid var(--color-divider-strong)", padding: "16px", display: "flex", gap: "14px", alignItems: "flex-start" }}>
      <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: `${iconColor}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "20px", color: iconColor }}>{icon}</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", color: "var(--color-on-surface-variant)", margin: 0, lineHeight: 1.5 }}>
          <Link href={`/usuario/${ev.usuario.id}`} style={{ color: "var(--color-on-surface)", fontWeight: 700, textDecoration: "none" }}>
            {ev.usuario.nombre}
          </Link>
          {" "}{actionText}
        </p>
        {ev.tipo === "review" && ev.payload.comentario && (
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.82rem", color: "var(--color-outline)", margin: "8px 0 0", fontStyle: "italic", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            “{ev.payload.comentario}”
          </p>
        )}
        {ev.tipo === "review" && ev.payload.imagenes && ev.payload.imagenes.length > 0 && (
          <div style={{ marginTop: "10px", maxWidth: "280px" }}>
            <ReviewImagesGallery urls={ev.payload.imagenes} />
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "10px" }}>
          <Link href={href} style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
            <div style={{ position: "relative", width: "28px", height: "40px", borderRadius: "4px", overflow: "hidden", backgroundColor: "var(--color-surface-container-high)", flexShrink: 0 }}>
              {ev.contenido.imagen && <Image src={ev.contenido.imagen} alt={ev.contenido.titulo} fill sizes="28px" style={{ objectFit: "cover" }} />}
            </div>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "var(--color-outline)" }}>
              {ev.contenido.tipo} · {ev.contenido.año ?? "—"}
            </span>
          </Link>
          <span style={{ marginLeft: "auto", fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "var(--color-outline)" }}>
            {timeAgo(ev.fecha)}
          </span>
        </div>
      </div>
    </article>
  );
}

export default function FeedPage() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [events, setEvents] = useState<FeedEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) { router.push("/login"); return; }
    socialApi.getFeed()
      .then(setEvents)
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, [isLoggedIn, router]);

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "var(--color-surface)", paddingTop: "80px", paddingBottom: "60px" }}>
      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "0 24px" }}>
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 900, fontSize: "2rem", color: "var(--color-on-surface)", margin: "0 0 6px", letterSpacing: "-0.03em" }}>
            Feed
          </h1>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.88rem", color: "var(--color-outline)", margin: 0 }}>
            Actividad reciente de los usuarios que sigues
          </p>
        </div>

        {loading ? (
          <SkeletonRow count={5} />
        ) : events.length === 0 ? (
          <div style={{ backgroundColor: "var(--color-surface-container-low)", borderRadius: "12px", border: "1px solid var(--color-divider-strong)", padding: "48px 24px", textAlign: "center" }}>
            <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "48px", color: "var(--color-outline)", opacity: 0.4, display: "block", marginBottom: "12px" }}>dynamic_feed</span>
            <p style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, color: "var(--color-on-surface-variant)", margin: "0 0 6px" }}>Tu feed está vacío</p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.85rem", color: "var(--color-outline)", margin: 0 }}>
              Sigue a otros usuarios para ver su actividad aquí
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {events.map((ev, i) => <EventCard key={`${ev.tipo}-${ev.usuario.id}-${ev.fecha}-${i}`} ev={ev} />)}
          </div>
        )}
      </div>
    </main>
  );
}
