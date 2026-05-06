"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { listasPersonalizadasApi, type ListaPersonalizadaSummary } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/Skeleton";

function ListaCard({ lista, ownerName }: { lista: ListaPersonalizadaSummary; ownerName?: string }) {
  return (
    <Link href={`/listas/${lista.id}`} style={{ textDecoration: "none" }}>
      <article style={{ backgroundColor: "var(--color-surface-container-low)", borderRadius: "12px", border: "1px solid var(--color-divider-strong)", overflow: "hidden", transition: "transform 0.2s, border-color 0.2s", cursor: "pointer", height: "100%", display: "flex", flexDirection: "column" }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(245,197,24,0.4)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--color-divider-strong)"; e.currentTarget.style.transform = "translateY(0)"; }}
      >
        <div style={{ height: "140px", backgroundColor: "var(--color-surface-container-high)", backgroundImage: lista.imagen_portada ? `url(${lista.imagen_portada})` : "linear-gradient(135deg, var(--color-primary-soft-strong), rgba(183,196,255,0.1))", backgroundSize: "cover", backgroundPosition: "center", position: "relative" }}>
          {!lista.publica && (
            <span style={{ position: "absolute", top: "10px", right: "10px", backgroundColor: "var(--color-scrim-strong)", color: "var(--color-on-surface-variant)", fontSize: "10px", fontFamily: "'Inter', sans-serif", fontWeight: 700, padding: "4px 8px", borderRadius: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
              <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "12px" }}>lock</span>
              Privada
            </span>
          )}
        </div>
        <div style={{ padding: "14px 16px", flex: 1, display: "flex", flexDirection: "column" }}>
          <h3 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "0.95rem", color: "var(--color-on-surface)", margin: "0 0 6px", letterSpacing: "-0.02em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {lista.nombre}
          </h3>
          {lista.descripcion && (
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.78rem", color: "var(--color-outline)", margin: 0, flex: 1, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {lista.descripcion}
            </p>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px", paddingTop: "10px", borderTop: "1px solid var(--color-divider)" }}>
            {ownerName && <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "var(--color-outline)" }}>por {ownerName}</span>}
            {lista.itemCount != null && (
              <span style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "11px", color: "#f5c518" }}>
                {lista.itemCount} {lista.itemCount === 1 ? "ítem" : "ítems"}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}

interface PublicItem extends ListaPersonalizadaSummary {
  usuario?: { id: number; nombre: string };
}

export default function ListasPage() {
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();
  const [mine, setMine] = useState<ListaPersonalizadaSummary[]>([]);
  const [publicas, setPublicas] = useState<PublicItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ nombre: "", descripcion: "", publica: true });

  useEffect(() => {
    Promise.all([
      user ? listasPersonalizadasApi.listByUser(user.id).catch(() => []) : Promise.resolve([]),
      listasPersonalizadasApi.listPublic(20).catch(() => []),
    ]).then(([my, pub]) => {
      setMine(my);
      setPublicas(pub as PublicItem[]);
    }).finally(() => setLoading(false));
  }, [user]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoggedIn) { router.push("/login"); return; }
    if (!form.nombre.trim()) return;
    try {
      const created = await listasPersonalizadasApi.create({
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim() || undefined,
        publica: form.publica,
      });
      router.push(`/listas/${created.id}`);
    } catch { /* ignore */ }
  }

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "var(--color-surface)", paddingTop: "80px", paddingBottom: "60px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 900, fontSize: "2rem", color: "var(--color-on-surface)", margin: "0 0 6px", letterSpacing: "-0.03em" }}>
              Listas
            </h1>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.88rem", color: "var(--color-outline)", margin: 0 }}>
              Listas temáticas creadas por la comunidad
            </p>
          </div>
          {isLoggedIn && (
            <button onClick={() => setCreating((c) => !c)}
              style={{ padding: "10px 18px", borderRadius: "8px", backgroundColor: creating ? "transparent" : "#f5c518", border: creating ? "1px solid var(--color-divider-strong)" : "none", color: creating ? "var(--color-on-surface-variant)" : "#3d2f00", fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.875rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
            >
              <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "18px" }}>{creating ? "close" : "add"}</span>
              {creating ? "Cancelar" : "Nueva lista"}
            </button>
          )}
        </div>

        {creating && (
          <form onSubmit={handleCreate} style={{ backgroundColor: "var(--color-surface-container-low)", borderRadius: "12px", border: "1px solid rgba(245,197,24,0.3)", padding: "20px", marginBottom: "32px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <input type="text" placeholder="Nombre de la lista" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} maxLength={100}
              style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-divider-strong)", borderRadius: "8px", padding: "10px 14px", color: "var(--color-on-surface)", fontSize: "0.9rem", fontFamily: "'Inter', sans-serif", outline: "none" }}
            />
            <textarea placeholder="Descripción (opcional)" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} maxLength={2000} rows={3}
              style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-divider-strong)", borderRadius: "8px", padding: "10px 14px", color: "var(--color-on-surface)", fontSize: "0.9rem", fontFamily: "'Inter', sans-serif", outline: "none", resize: "vertical" }}
            />
            <label style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--color-on-surface-variant)", fontFamily: "'Inter', sans-serif", fontSize: "0.85rem", cursor: "pointer" }}>
              <input type="checkbox" checked={form.publica} onChange={(e) => setForm({ ...form, publica: e.target.checked })} />
              Lista pública (visible para otros usuarios)
            </label>
            <button type="submit" disabled={!form.nombre.trim()}
              style={{ padding: "10px 18px", borderRadius: "8px", backgroundColor: "#f5c518", border: "none", color: "#3d2f00", fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.875rem", cursor: form.nombre.trim() ? "pointer" : "not-allowed", opacity: form.nombre.trim() ? 1 : 0.5, alignSelf: "flex-start" }}
            >
              Crear lista
            </button>
          </form>
        )}

        {isLoggedIn && mine.length > 0 && (
          <section style={{ marginBottom: "48px" }}>
            <h2 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "1.1rem", color: "var(--color-on-surface)", margin: "0 0 16px", letterSpacing: "-0.02em" }}>
              Mis listas
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "16px" }}>
              {mine.map((l) => <ListaCard key={l.id} lista={l} />)}
            </div>
          </section>
        )}

        <section>
          <h2 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "1.1rem", color: "var(--color-on-surface)", margin: "0 0 16px", letterSpacing: "-0.02em" }}>
            Listas destacadas de la comunidad
          </h2>
          {loading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "16px" }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{ backgroundColor: "var(--color-surface-container-low)", borderRadius: "12px", border: "1px solid var(--color-divider-strong)", overflow: "hidden" }}>
                  <Skeleton height="140px" rounded="0" />
                  <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: "8px" }}>
                    <Skeleton width="80%" height="14px" />
                    <Skeleton width="60%" height="11px" />
                  </div>
                </div>
              ))}
            </div>
          ) : publicas.length === 0 ? (
            <div style={{ backgroundColor: "var(--color-surface-container-low)", borderRadius: "12px", border: "1px solid var(--color-divider-strong)", padding: "48px 24px", textAlign: "center" }}>
              <p style={{ fontFamily: "'Inter', sans-serif", color: "var(--color-outline)", margin: 0 }}>Aún no hay listas públicas</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "16px" }}>
              {publicas.map((l) => <ListaCard key={l.id} lista={l} ownerName={l.usuario?.nombre} />)}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
