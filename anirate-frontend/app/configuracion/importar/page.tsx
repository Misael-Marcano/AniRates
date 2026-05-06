"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { importApi, type ImportResult } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

export default function ImportarPage() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [tab, setTab] = useState<"mal" | "anilist">("anilist");
  const [malXml, setMalXml] = useState("");
  const [anilistUsername, setAnilistUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState("");

  if (!isLoggedIn) {
    if (typeof window !== "undefined") router.push("/login");
    return null;
  }

  async function handleImport() {
    setError(""); setResult(null); setLoading(true);
    try {
      const res = tab === "mal" ? await importApi.mal(malXml) : await importApi.anilist(anilistUsername.trim());
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error en import");
    } finally {
      setLoading(false);
    }
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setMalXml(reader.result as string);
    reader.readAsText(file);
  }

  const sectionStyle: React.CSSProperties = { backgroundColor: "var(--color-surface-container-low)", border: "1px solid var(--color-divider)", borderRadius: "12px", padding: "24px" };
  const inputStyle: React.CSSProperties = { width: "100%", backgroundColor: "var(--color-surface)", border: "1px solid var(--color-divider-strong)", borderRadius: "8px", padding: "10px 14px", color: "var(--color-on-surface)", fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", outline: "none" };

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "var(--color-surface)", paddingTop: "80px", paddingBottom: "60px" }}>
      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "0 24px" }}>
        <Link href="/configuracion" style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.85rem", color: "#f5c518", textDecoration: "none", display: "inline-block", marginBottom: "16px" }}>← Volver a configuración</Link>

        <h1 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 900, fontSize: "1.8rem", color: "var(--color-on-surface)", letterSpacing: "-0.03em", marginBottom: "24px" }}>
          Importar lista
        </h1>

        <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
          {(["anilist", "mal"] as const).map((t) => (
            <button key={t} onClick={() => { setTab(t); setResult(null); setError(""); }}
              style={{ padding: "8px 16px", borderRadius: "8px", border: tab === t ? "1px solid #f5c518" : "1px solid var(--color-divider)", backgroundColor: tab === t ? "rgba(245,197,24,0.1)" : "transparent", color: tab === t ? "#f5c518" : "var(--color-outline)", fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" }}>
              {t === "mal" ? "MyAnimeList" : "AniList"}
            </button>
          ))}
        </div>

        {tab === "anilist" ? (
          <div style={sectionStyle}>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.85rem", color: "var(--color-on-surface-variant)", marginBottom: "16px", lineHeight: 1.5 }}>
              Ingresa tu usuario público de AniList. Importaremos tu lista completa (anime + manga) con estados, ratings y progreso.
            </p>
            <input type="text" placeholder="username" value={anilistUsername} onChange={(e) => setAnilistUsername(e.target.value)} style={inputStyle} />
          </div>
        ) : (
          <div style={sectionStyle}>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.85rem", color: "var(--color-on-surface-variant)", marginBottom: "16px", lineHeight: 1.5 }}>
              Sube el archivo XML exportado desde MyAnimeList. Para obtenerlo: MAL → Profile → Export → Generate XML.
            </p>
            <input type="file" accept=".xml,text/xml" onChange={handleFile} style={{ ...inputStyle, padding: "8px" }} />
            {malXml && <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "var(--color-outline)", marginTop: "8px" }}>Archivo cargado ({malXml.length.toLocaleString()} caracteres)</p>}
          </div>
        )}

        <button onClick={handleImport} disabled={loading || (tab === "anilist" ? !anilistUsername.trim() : !malXml)}
          style={{ marginTop: "16px", padding: "12px 24px", backgroundColor: "#f5c518", color: "#3d2f00", border: "none", borderRadius: "8px", fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.9rem", cursor: loading ? "wait" : "pointer", opacity: loading ? 0.6 : 1 }}>
          {loading ? "Importando..." : "Importar"}
        </button>

        {error && <p style={{ marginTop: "16px", color: "#e05c5c", fontFamily: "'Inter', sans-serif", fontSize: "0.85rem" }}>{error}</p>}

        {result && (
          <div style={{ marginTop: "20px", padding: "16px", backgroundColor: "rgba(76,175,80,0.1)", border: "1px solid rgba(76,175,80,0.3)", borderRadius: "10px" }}>
            <p style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, color: "#4caf50", marginBottom: "8px" }}>Import completado</p>
            <ul style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.85rem", color: "var(--color-on-surface-variant)", paddingLeft: "20px" }}>
              <li>Total: {result.total}</li>
              <li>Importados: {result.imported}</li>
              <li>Actualizados: {result.skipped}</li>
              <li>Errores: {result.errors}</li>
            </ul>
            <Link href="/mi-lista" style={{ display: "inline-block", marginTop: "12px", color: "#f5c518", fontFamily: "'Inter', sans-serif", fontSize: "0.85rem", textDecoration: "none" }}>Ver Mi Lista →</Link>
          </div>
        )}
      </div>
    </main>
  );
}
