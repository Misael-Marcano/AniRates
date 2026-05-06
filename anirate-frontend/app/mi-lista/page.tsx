"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { listaApi, LISTA_ESTADOS, ESTADO_LABELS, ESTADO_ICONS, ESTADO_COLORS, type ListaEstado } from "@/services/api";
import { contenidoPath } from "@/services/routes";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { useAuth } from "@/contexts/AuthContext";
import type { ListaItem } from "@/types";

export default function MiListaPage() {
  const router = useRouter();
  const { isMobile } = useBreakpoint();
  const { isLoggedIn } = useAuth();
  const [items, setItems] = useState<ListaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ListaEstado | "todos">("todos");
  const [removing, setRemoving] = useState<number | null>(null);

  useEffect(() => {
    if (!isLoggedIn) { router.push("/login"); return; }
    listaApi.getMine()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [router, isLoggedIn]);

  async function handleRemove(item: ListaItem) {
    setRemoving(item.id);
    try {
      await listaApi.remove(item.id);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch { /* ignore */ } finally {
      setRemoving(null);
    }
  }

  async function handleChangeEstado(item: ListaItem, estado: ListaEstado) {
    try {
      const updated = await listaApi.update(item.id, { estado });
      setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, estado: updated.estado } : i));
    } catch { /* ignore */ }
  }

  const filtered = activeTab === "todos" ? items : items.filter((i) => i.estado === activeTab);

  const countByEstado = LISTA_ESTADOS.reduce((acc, e) => {
    acc[e] = items.filter((i) => i.estado === e).length;
    return acc;
  }, {} as Record<ListaEstado, number>);

  function getContentUrl(item: ListaItem) {
    return item.contenido ? contenidoPath(item.contenido) : "#";
  }

  return (
    <div style={{ backgroundColor: "var(--color-surface)", minHeight: "100vh", paddingTop: "64px" }}>
      <main style={{
        maxWidth: "1280px", margin: "0 auto",
        padding: isMobile ? "24px 16px 60px" : "40px 48px 80px",
      }}>
        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{
            fontFamily: "'Manrope', sans-serif",
            fontSize: isMobile ? "1.8rem" : "2.5rem",
            fontWeight: 700, color: "var(--color-on-surface)",
            letterSpacing: "-0.02em", marginBottom: "8px",
          }}>
            Mi Lista
          </h1>
          <p style={{ fontFamily: "'Inter', sans-serif", color: "var(--color-outline)", fontSize: "0.9rem" }}>
            {items.length} {items.length === 1 ? "título" : "títulos"} en tu lista
          </p>
        </div>

        {/* Stats row */}
        {items.length > 0 && (
          <div style={{
            display: "flex", flexWrap: "wrap", gap: "10px",
            marginBottom: "28px",
          }}>
            {LISTA_ESTADOS.map((e) => countByEstado[e] > 0 && (
              <div key={e} style={{
                display: "flex", alignItems: "center", gap: "8px",
                backgroundColor: `${ESTADO_COLORS[e]}18`,
                border: `1px solid ${ESTADO_COLORS[e]}44`,
                borderRadius: "8px", padding: "8px 16px",
              }}>
                <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "16px", color: ESTADO_COLORS[e], fontVariationSettings: "'FILL' 1" }}>
                  {ESTADO_ICONS[e]}
                </span>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", color: ESTADO_COLORS[e], fontWeight: 600 }}>
                  {ESTADO_LABELS[e]}
                </span>
                <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: "0.9rem", color: "var(--color-on-surface)", fontWeight: 700 }}>
                  {countByEstado[e]}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div style={{
          display: "flex", gap: "4px", flexWrap: "wrap",
          borderBottom: "1px solid var(--color-divider)",
          marginBottom: "28px", paddingBottom: "0",
        }}>
          {(["todos", ...LISTA_ESTADOS] as const).map((tab) => {
            const count = tab === "todos" ? items.length : countByEstado[tab];
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  background: "none", border: "none",
                  borderBottom: isActive ? "2px solid #f5c518" : "2px solid transparent",
                  color: isActive ? "#f5c518" : "var(--color-outline)",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.875rem", fontWeight: isActive ? 600 : 400,
                  padding: "10px 16px",
                  cursor: "pointer",
                  transition: "color 0.15s",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = "var(--color-on-surface-variant)"; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = "var(--color-outline)"; }}
              >
                {tab === "todos" ? "Todos" : ESTADO_LABELS[tab]}
                {count > 0 && (
                  <span style={{
                    marginLeft: "6px",
                    backgroundColor: isActive ? "rgba(245,197,24,0.2)" : "var(--color-divider)",
                    color: isActive ? "#f5c518" : "var(--color-outline)",
                    borderRadius: "10px", padding: "1px 7px",
                    fontSize: "0.75rem",
                  }}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", paddingTop: "60px" }}>
            <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "48px", color: "var(--color-outline-variant)" }}>hourglass_empty</span>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", paddingTop: "80px" }}>
            <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "64px", color: "var(--color-outline-variant)" }}>bookmarks</span>
            <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: "1.1rem", color: "var(--color-outline)", fontWeight: 600 }}>
              {activeTab === "todos" ? "Tu lista está vacía" : `No tienes nada en "${ESTADO_LABELS[activeTab]}"`}
            </p>
            <Link href="/buscar" style={{
              marginTop: "8px",
              backgroundColor: "#f5c518", color: "#3d2f00",
              borderRadius: "8px", padding: "10px 24px",
              fontFamily: "'Manrope', sans-serif", fontWeight: 700,
              fontSize: "0.9rem", textDecoration: "none",
            }}>
              Explorar contenido
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {filtered.map((item) => (
              <ListaRow
                key={item.id}
                item={item}
                removing={removing === item.id}
                onRemove={() => handleRemove(item)}
                onChangeEstado={(e) => handleChangeEstado(item, e)}
                getUrl={getContentUrl}
                isMobile={isMobile}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function ListaRow({
  item, removing, onRemove, onChangeEstado, getUrl, isMobile,
}: {
  item: ListaItem;
  removing: boolean;
  onRemove: () => void;
  onChangeEstado: (e: ListaEstado) => void;
  getUrl: (i: ListaItem) => string;
  isMobile: boolean;
}) {
  const [dropdown, setDropdown] = useState(false);
  const estado = item.estado as ListaEstado;
  const c = item.contenido;

  useEffect(() => {
    if (!dropdown) return;
    function handler(e: MouseEvent) {
      if (!(e.target as HTMLElement).closest("[data-row-dropdown]")) setDropdown(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropdown]);

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "16px",
      backgroundColor: "var(--color-surface-container)",
      borderRadius: "10px", padding: isMobile ? "12px" : "14px 16px",
      opacity: removing ? 0.4 : 1, transition: "opacity 0.2s",
      marginBottom: "4px",
    }}>
      {/* Poster */}
      <Link href={getUrl(item)} style={{ flexShrink: 0 }}>
        <div style={{
          position: "relative",
          width: isMobile ? "44px" : "52px",
          height: isMobile ? "62px" : "72px",
          borderRadius: "6px", overflow: "hidden",
          backgroundColor: "var(--color-surface-container-high)",
        }}>
          {c?.imagen ? (
            <Image src={c.imagen} alt={c.titulo} fill sizes="52px" style={{ objectFit: "cover" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem" }}>
              {c?.tipo === "ANIME" ? "🎬" : "📚"}
            </div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <Link href={getUrl(item)} style={{ textDecoration: "none" }}>
          <h3 style={{
            fontFamily: "'Manrope', sans-serif", fontWeight: 600,
            fontSize: isMobile ? "0.875rem" : "0.95rem", color: "var(--color-on-surface)",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {c?.titulo ?? "Sin título"}
          </h3>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px", flexWrap: "wrap" }}>
          {c?.tipo && (
            <span style={{
              backgroundColor: c.tipo === "ANIME" ? "rgba(0,64,203,0.2)" : "rgba(90,0,180,0.2)",
              color: c.tipo === "ANIME" ? "#b7c4ff" : "#d3bbff",
              fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em",
              padding: "2px 8px", borderRadius: "10px",
              fontFamily: "'Inter', sans-serif", textTransform: "uppercase",
            }}>
              {c.tipo}
            </span>
          )}
          {c?.año && (
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "var(--color-outline)" }}>
              {c.año}
            </span>
          )}
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "var(--color-outline)" }}>
            {new Date(item.fecha_actualizado).toLocaleDateString("es", { day: "numeric", month: "short", year: "numeric" })}
          </span>
        </div>
      </div>

      {/* Estado selector */}
      <div style={{ position: "relative", flexShrink: 0 }} data-row-dropdown>
        <button
          onClick={() => setDropdown((v) => !v)}
          style={{
            background: `${ESTADO_COLORS[estado]}22`,
            border: `1px solid ${ESTADO_COLORS[estado]}55`,
            borderRadius: "8px",
            color: ESTADO_COLORS[estado],
            padding: isMobile ? "6px 10px" : "7px 14px",
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.8rem", fontWeight: 600,
            cursor: "pointer",
            display: "flex", alignItems: "center", gap: "6px",
            transition: "background 0.15s",
          }}
        >
          <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "15px", fontVariationSettings: "'FILL' 1" }}>
            {ESTADO_ICONS[estado]}
          </span>
          {!isMobile && ESTADO_LABELS[estado]}
          <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "14px" }}>
            {dropdown ? "expand_less" : "expand_more"}
          </span>
        </button>

        {dropdown && (
          <div style={{
            position: "absolute", top: "calc(100% + 4px)", right: 0,
            backgroundColor: "var(--color-surface-container-high)",
            border: "1px solid var(--color-divider)",
            borderRadius: "10px",
            boxShadow: "0 12px 40px var(--color-scrim-strong)",
            zIndex: 50, minWidth: "180px", overflow: "hidden",
          }}>
            {LISTA_ESTADOS.map((e) => (
              <button
                key={e}
                onClick={() => { onChangeEstado(e); setDropdown(false); }}
                style={{
                  width: "100%", textAlign: "left",
                  background: estado === e ? `${ESTADO_COLORS[e]}22` : "none",
                  border: "none",
                  borderLeft: estado === e ? `3px solid ${ESTADO_COLORS[e]}` : "3px solid transparent",
                  color: estado === e ? ESTADO_COLORS[e] : "var(--color-on-surface-variant)",
                  padding: "10px 14px",
                  fontFamily: "'Inter', sans-serif", fontSize: "0.875rem",
                  cursor: "pointer",
                  display: "flex", alignItems: "center", gap: "10px",
                }}
                onMouseEnter={(e2) => { if (estado !== e) e2.currentTarget.style.backgroundColor = "var(--color-hover-bg-soft)"; }}
                onMouseLeave={(e2) => { if (estado !== e) e2.currentTarget.style.backgroundColor = "transparent"; }}
              >
                <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "16px", color: ESTADO_COLORS[e], fontVariationSettings: estado === e ? "'FILL' 1" : "'FILL' 0" }}>
                  {ESTADO_ICONS[e]}
                </span>
                {ESTADO_LABELS[e]}
                {estado === e && <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "14px", marginLeft: "auto", color: ESTADO_COLORS[e] }}>check</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Remove button */}
      <button
        onClick={onRemove}
        disabled={removing}
        title="Quitar de lista"
        style={{
          background: "none", border: "none",
          color: "var(--color-outline)", cursor: removing ? "wait" : "pointer",
          padding: "6px", borderRadius: "6px",
          display: "flex", alignItems: "center",
          transition: "color 0.15s, background 0.15s",
          flexShrink: 0,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = "#e05c5c"; e.currentTarget.style.backgroundColor = "rgba(224,92,92,0.1)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-outline)"; e.currentTarget.style.backgroundColor = "transparent"; }}
      >
        <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "18px" }}>delete</span>
      </button>
    </div>
  );
}
