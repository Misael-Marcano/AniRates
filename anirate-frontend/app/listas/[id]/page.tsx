"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { listasPersonalizadasApi, type ListaPersonalizadaDetail } from "@/services/api";
import { contenidoPath } from "@/services/routes";
import { useAuth } from "@/contexts/AuthContext";

export default function ListaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [lista, setLista] = useState<ListaPersonalizadaDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ nombre: "", descripcion: "", publica: true });
  const [error, setError] = useState("");

  const listaId = Number(id);

  useEffect(() => {
    listasPersonalizadasApi.getOne(listaId)
      .then((data) => {
        setLista(data);
        setForm({ nombre: data.nombre, descripcion: data.descripcion ?? "", publica: data.publica });
      })
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, [listaId]);

  async function handleSave() {
    if (!lista) return;
    try {
      const updated = await listasPersonalizadasApi.update(listaId, {
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim() || undefined,
        publica: form.publica,
      });
      setLista({ ...lista, ...updated });
      setEditing(false);
    } catch { /* ignore */ }
  }

  async function handleDelete() {
    if (!lista) return;
    if (!confirm(`¿Eliminar la lista "${lista.nombre}"? Esta acción no se puede deshacer.`)) return;
    try {
      await listasPersonalizadasApi.remove(listaId);
      router.push("/listas");
    } catch { /* ignore */ }
  }

  async function handleRemoveItem(itemId: number) {
    if (!lista) return;
    try {
      await listasPersonalizadasApi.removeItem(listaId, itemId);
      setLista({ ...lista, items: lista.items.filter((i) => i.id !== itemId) });
    } catch { /* ignore */ }
  }

  if (loading) {
    return <main style={{ minHeight: "100vh", backgroundColor: "var(--color-surface)", paddingTop: "120px", textAlign: "center" }}><p style={{ color: "var(--color-outline)", fontFamily: "'Inter', sans-serif" }}>Cargando...</p></main>;
  }

  if (!lista) {
    return <main style={{ minHeight: "100vh", backgroundColor: "var(--color-surface)", paddingTop: "120px", textAlign: "center" }}>
      <p style={{ color: "var(--color-on-surface)", fontFamily: "'Manrope', sans-serif", fontWeight: 700 }}>{error || "Lista no encontrada"}</p>
      <Link href="/listas" style={{ color: "#f5c518", fontFamily: "'Inter', sans-serif", fontSize: "0.9rem", marginTop: "16px", display: "inline-block" }}>Volver a listas</Link>
    </main>;
  }

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "var(--color-surface)", paddingTop: "80px", paddingBottom: "60px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px" }}>

        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <Link href="/listas" style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", color: "var(--color-outline)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px", marginBottom: "12px" }}>
            <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "16px" }}>arrow_back</span>
            Todas las listas
          </Link>

          {editing ? (
            <div style={{ backgroundColor: "var(--color-surface-container-low)", borderRadius: "12px", border: "1px solid rgba(245,197,24,0.3)", padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <input type="text" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} maxLength={100}
                style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-divider-strong)", borderRadius: "8px", padding: "10px 14px", color: "var(--color-on-surface)", fontSize: "1.1rem", fontFamily: "'Manrope', sans-serif", fontWeight: 800, outline: "none" }}
              />
              <textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} maxLength={2000} rows={3} placeholder="Descripción"
                style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-divider-strong)", borderRadius: "8px", padding: "10px 14px", color: "var(--color-on-surface)", fontSize: "0.9rem", fontFamily: "'Inter', sans-serif", outline: "none", resize: "vertical" }}
              />
              <label style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--color-on-surface-variant)", fontFamily: "'Inter', sans-serif", fontSize: "0.85rem", cursor: "pointer" }}>
                <input type="checkbox" checked={form.publica} onChange={(e) => setForm({ ...form, publica: e.target.checked })} />
                Pública
              </label>
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={handleSave} style={{ padding: "8px 16px", borderRadius: "8px", backgroundColor: "#f5c518", border: "none", color: "#3d2f00", fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}>Guardar</button>
                <button onClick={() => setEditing(false)} style={{ padding: "8px 16px", borderRadius: "8px", backgroundColor: "transparent", border: "1px solid var(--color-divider-strong)", color: "var(--color-on-surface-variant)", fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" }}>Cancelar</button>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px", flexWrap: "wrap" }}>
                  <h1 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 900, fontSize: "2rem", color: "var(--color-on-surface)", margin: 0, letterSpacing: "-0.03em" }}>
                    {lista.nombre}
                  </h1>
                  {!lista.publica && (
                    <span style={{ backgroundColor: "rgba(224,92,92,0.15)", color: "#e05c5c", fontSize: "11px", fontFamily: "'Inter', sans-serif", fontWeight: 700, padding: "3px 8px", borderRadius: "4px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "12px" }}>lock</span>
                      Privada
                    </span>
                  )}
                </div>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.85rem", color: "var(--color-outline)", margin: 0 }}>
                  Por <Link href={`/usuario/${lista.usuario.id}`} style={{ color: "#f5c518", textDecoration: "none", fontWeight: 600 }}>{lista.usuario.nombre}</Link>
                  {" · "}{lista.items.length} {lista.items.length === 1 ? "ítem" : "ítems"}
                </p>
                {lista.descripcion && (
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.92rem", color: "var(--color-on-surface-variant)", margin: "12px 0 0", lineHeight: 1.6 }}>
                    {lista.descripcion}
                  </p>
                )}
              </div>
              {lista.isOwner && (
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => setEditing(true)}
                    style={{ padding: "8px 14px", borderRadius: "8px", backgroundColor: "transparent", border: "1px solid var(--color-divider-strong)", color: "var(--color-on-surface-variant)", fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: "0.82rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px" }}
                  >
                    <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "16px" }}>edit</span>
                    Editar
                  </button>
                  <button onClick={handleDelete}
                    style={{ padding: "8px 14px", borderRadius: "8px", backgroundColor: "transparent", border: "1px solid rgba(224,92,92,0.4)", color: "#e05c5c", fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: "0.82rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px" }}
                  >
                    <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "16px" }}>delete</span>
                    Eliminar
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Items */}
        {lista.items.length === 0 ? (
          <div style={{ backgroundColor: "var(--color-surface-container-low)", borderRadius: "12px", border: "1px solid var(--color-divider-strong)", padding: "48px 24px", textAlign: "center" }}>
            <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "40px", color: "var(--color-outline)", opacity: 0.4, display: "block", marginBottom: "12px" }}>format_list_bulleted</span>
            <p style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, color: "var(--color-on-surface-variant)", margin: "0 0 8px" }}>Lista vacía</p>
            {lista.isOwner && (
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.85rem", color: "var(--color-outline)", margin: 0 }}>
                Añade títulos desde la página de cada anime/manga
              </p>
            )}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "16px" }}>
            {lista.items.map((item) => {
              const href = contenidoPath(item.contenido);
              return (
                <div key={item.id} style={{ position: "relative" }}>
                  <Link href={href} style={{ textDecoration: "none" }}>
                    <div style={{ position: "relative", aspectRatio: "2/3", borderRadius: "8px", overflow: "hidden", backgroundColor: "var(--color-surface-container-high)", marginBottom: "8px" }}>
                      {item.contenido.imagen && <Image src={item.contenido.imagen} alt={item.contenido.titulo} fill sizes="(max-width: 640px) 50vw, 200px" style={{ objectFit: "cover" }} />}
                    </div>
                    <p style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: "0.82rem", color: "var(--color-on-surface)", margin: "0 0 3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.contenido.titulo}
                    </p>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "var(--color-outline)", margin: 0 }}>
                      {item.contenido.tipo} · {item.contenido.año ?? "—"}
                    </p>
                  </Link>
                  {lista.isOwner && (
                    <button onClick={() => handleRemoveItem(item.id)}
                      style={{ position: "absolute", top: "6px", right: "6px", width: "26px", height: "26px", borderRadius: "50%", backgroundColor: "rgba(0,0,0,0.75)", border: "none", color: "#e05c5c", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.15s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(224,92,92,0.2)")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.75)")}
                      title="Quitar de la lista"
                    >
                      <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "16px" }}>close</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
