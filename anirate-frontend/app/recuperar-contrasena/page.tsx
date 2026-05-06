"use client";

import { useState } from "react";
import Link from "next/link";
import { authApi } from "@/services/api";

export default function RecuperarContrasenaPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string>("");
  const [devToken, setDevToken] = useState<string>("");
  const [error, setError] = useState<string>("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setMsg(""); setDevToken("");
    if (!email.trim()) return;
    setLoading(true);
    try {
      const res = await authApi.forgotPassword(email.trim());
      setMsg(res.message);
      if (res.devToken) setDevToken(res.devToken);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "var(--color-surface)", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
      <div style={{ backgroundColor: "var(--color-surface-container-low)", borderRadius: "16px", border: "1px solid var(--color-divider-strong)", padding: "40px", maxWidth: "460px", width: "100%" }}>
        <h1 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 900, fontSize: "1.6rem", color: "var(--color-on-surface)", margin: "0 0 8px", letterSpacing: "-0.03em", textAlign: "center" }}>
          Recuperar contraseña
        </h1>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.88rem", color: "var(--color-outline)", margin: "0 0 28px", textAlign: "center" }}>
          Te enviaremos un enlace para restablecer tu contraseña.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label htmlFor="email" style={{ display: "block", fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "var(--color-outline)", fontWeight: 600, marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Email
            </label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus
              style={{ width: "100%", backgroundColor: "var(--color-surface)", border: "1px solid var(--color-divider-strong)", borderRadius: "8px", padding: "12px 14px", color: "var(--color-on-surface)", fontFamily: "'Inter', sans-serif", fontSize: "0.9rem", outline: "none" }}
            />
          </div>

          <button type="submit" disabled={loading || !email.trim()}
            style={{ padding: "12px", borderRadius: "8px", backgroundColor: "#f5c518", color: "#3d2f00", border: "none", fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.9rem", cursor: loading ? "wait" : "pointer", opacity: email.trim() && !loading ? 1 : 0.6, transition: "opacity 0.2s" }}
          >
            {loading ? "Enviando..." : "Enviar enlace de recuperación"}
          </button>
        </form>

        {error && (
          <div style={{ marginTop: "16px", padding: "12px 14px", backgroundColor: "rgba(224,92,92,0.12)", border: "1px solid rgba(224,92,92,0.3)", borderRadius: "8px", color: "#e05c5c", fontFamily: "'Inter', sans-serif", fontSize: "0.85rem" }}>
            {error}
          </div>
        )}

        {msg && (
          <div style={{ marginTop: "16px", padding: "12px 14px", backgroundColor: "rgba(76,175,80,0.08)", border: "1px solid rgba(76,175,80,0.25)", borderRadius: "8px", color: "#81c784", fontFamily: "'Inter', sans-serif", fontSize: "0.85rem" }}>
            {msg}
          </div>
        )}

        {devToken && (
          <div style={{ marginTop: "16px", padding: "14px", backgroundColor: "var(--color-primary-soft)", border: "1px dashed rgba(245,197,24,0.4)", borderRadius: "8px" }}>
            <p style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "11px", color: "#f5c518", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Modo desarrollo — token generado
            </p>
            <Link href={`/resetear-contrasena/${devToken}`}
              style={{ fontFamily: "'JetBrains Mono', monospace, 'Inter', sans-serif", fontSize: "11px", color: "var(--color-on-surface-variant)", wordBreak: "break-all", textDecoration: "underline" }}>
              /resetear-contrasena/{devToken.slice(0, 20)}...
            </Link>
          </div>
        )}

        <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid var(--color-divider)", textAlign: "center" }}>
          <Link href="/login" style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.85rem", color: "var(--color-outline)", textDecoration: "none" }}>
            <span style={{ color: "#f5c518" }}>&larr;</span> Volver al login
          </Link>
        </div>
      </div>
    </main>
  );
}
