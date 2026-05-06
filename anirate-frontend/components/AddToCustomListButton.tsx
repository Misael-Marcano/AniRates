"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { listasPersonalizadasApi, type ListaPersonalizadaSummary } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  contenidoMeta: {
    jikan_id: number;
    titulo: string;
    tipo: string;
    imagen?: string;
    año?: number;
    estado?: string;
    descripcion?: string;
  };
  onAdded?: () => void;
}

export default function AddToCustomListButton({ contenidoMeta, onAdded }: Props) {
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();
  const [open, setOpen] = useState(false);
  const [lists, setLists] = useState<ListaPersonalizadaSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<number | null>(null);
  const [added, setAdded] = useState<Set<number>>(new Set());
  const [newListName, setNewListName] = useState("");
  const [creating, setCreating] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  async function handleOpen() {
    if (!isLoggedIn) { router.push("/login"); return; }
    setOpen((o) => !o);
    if (!open && user && lists.length === 0) {
      setLoading(true);
      try {
        const data = await listasPersonalizadasApi.listByUser(user.id);
        setLists(data);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    }
  }

  async function handleAdd(listId: number) {
    setSaving(listId);
    try {
      await listasPersonalizadasApi.addItem(listId, contenidoMeta);
      setAdded((prev) => new Set([...prev, listId]));
      onAdded?.();
    } catch { /* ignore */ }
    finally { setSaving(null); }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const name = newListName.trim();
    if (!name) return;
    setCreating(true);
    try {
      const created = await listasPersonalizadasApi.create({ nombre: name, publica: true });
      await listasPersonalizadasApi.addItem(created.id, contenidoMeta);
      setLists((prev) => [{ ...created, itemCount: 1 }, ...prev]);
      setAdded((prev) => new Set([...prev, created.id]));
      setNewListName("");
      onAdded?.();
    } catch { /* ignore */ }
    finally { setCreating(false); }
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={handleOpen}
        style={{ padding: "10px 18px", borderRadius: "10px", backgroundColor: "transparent", border: "1px solid var(--color-divider-strong)", color: "var(--color-on-surface-variant)", fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", transition: "border-color 0.2s, color 0.2s" }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#f5c518"; e.currentTarget.style.color = "#f5c518"; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--color-divider-strong)"; e.currentTarget.style.color = "var(--color-on-surface-variant)"; }}
      >
        <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "18px" }}>playlist_add</span>
        Guardar en lista
      </button>

      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, width: "280px", backgroundColor: "var(--color-surface-container-low)", border: "1px solid var(--color-divider-strong)", borderRadius: "10px", boxShadow: "0 8px 32px var(--color-scrim)", zIndex: 100, overflow: "hidden" }}>
          <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--color-divider)" }}>
            <span style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.85rem", color: "var(--color-on-surface)" }}>Tus listas</span>
          </div>

          <div style={{ maxHeight: "240px", overflowY: "auto" }}>
            {loading ? (
              <p style={{ padding: "16px", textAlign: "center", color: "var(--color-outline)", fontFamily: "'Inter', sans-serif", fontSize: "0.82rem", margin: 0 }}>Cargando...</p>
            ) : lists.length === 0 ? (
              <p style={{ padding: "16px", textAlign: "center", color: "var(--color-outline)", fontFamily: "'Inter', sans-serif", fontSize: "0.82rem", margin: 0 }}>No tienes listas aún</p>
            ) : (
              lists.map((l) => {
                const isAdded = added.has(l.id);
                return (
                  <button key={l.id} onClick={() => !isAdded && handleAdd(l.id)} disabled={isAdded || saving === l.id}
                    style={{ width: "100%", padding: "10px 14px", border: "none", background: "none", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: isAdded ? "default" : "pointer", textAlign: "left", transition: "background 0.15s" }}
                    onMouseEnter={(e) => { if (!isAdded) e.currentTarget.style.backgroundColor = "var(--color-hover-bg)"; }}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.85rem", color: isAdded ? "var(--color-outline)" : "var(--color-on-surface-variant)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {l.nombre}
                    </span>
                    <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "16px", color: isAdded ? "#4caf50" : "var(--color-outline)" }}>
                      {isAdded ? "check_circle" : saving === l.id ? "hourglass_empty" : "add"}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          <form onSubmit={handleCreate} style={{ padding: "10px 12px", borderTop: "1px solid var(--color-divider)", display: "flex", gap: "6px" }}>
            <input type="text" value={newListName} onChange={(e) => setNewListName(e.target.value)} placeholder="Nueva lista..." maxLength={100}
              style={{ flex: 1, backgroundColor: "var(--color-surface)", border: "1px solid var(--color-divider-strong)", borderRadius: "6px", padding: "7px 10px", color: "var(--color-on-surface)", fontFamily: "'Inter', sans-serif", fontSize: "0.82rem", outline: "none" }}
            />
            <button type="submit" disabled={!newListName.trim() || creating}
              style={{ padding: "7px 12px", borderRadius: "6px", backgroundColor: "#f5c518", border: "none", color: "#3d2f00", fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.78rem", cursor: newListName.trim() && !creating ? "pointer" : "not-allowed", opacity: newListName.trim() && !creating ? 1 : 0.5 }}
            >
              Crear
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
