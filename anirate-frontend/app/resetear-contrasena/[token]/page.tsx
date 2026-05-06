"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { authApi } from "@/services/api";

export default function ResetearContrasenaPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (newPassword.length < 6) { setError("La contraseña debe tener al menos 6 caracteres"); return; }
    if (newPassword !== confirm) { setError("Las contraseñas no coinciden"); return; }
    setLoading(true);
    try {
      await authApi.resetPassword(token, newPassword);
      setDone(true);
      setTimeout(() => router.push("/login"), 2500);
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
          Nueva contraseña
        </h1>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.88rem", color: "var(--color-outline)", margin: "0 0 28px", textAlign: "center" }}>
          Ingresa tu nueva contraseña.
        </p>

        {done ? (
          <div style={{ padding: "16px", backgroundColor: "rgba(76,175,80,0.08)", border: "1px solid rgba(76,175,80,0.25)", borderRadius: "8px", textAlign: "center" }}>
            <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "40px", color: "#81c784", display: "block", marginBottom: "8px" }}>check_circle</span>
            <p style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, color: "#81c784", margin: "0 0 4px" }}>
              Contraseña actualizada
            </p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.85rem", color: "var(--color-outline)", margin: 0 }}>
              Redirigiendo al login...
            </p>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label htmlFor="newPassword" style={{ display: "block", fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "var(--color-outline)", fontWeight: 600, marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Nueva contraseña
                </label>
                <input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} autoFocus
                  style={{ width: "100%", backgroundColor: "var(--color-surface)", border: "1px solid var(--color-divider-strong)", borderRadius: "8px", padding: "12px 14px", color: "var(--color-on-surface)", fontFamily: "'Inter', sans-serif", fontSize: "0.9rem", outline: "none" }}
                />
              </div>

              <div>
                <label htmlFor="confirm" style={{ display: "block", fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "var(--color-outline)", fontWeight: 600, marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Confirmar
                </label>
                <input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={6}
                  style={{ width: "100%", backgroundColor: "var(--color-surface)", border: "1px solid var(--color-divider-strong)", borderRadius: "8px", padding: "12px 14px", color: "var(--color-on-surface)", fontFamily: "'Inter', sans-serif", fontSize: "0.9rem", outline: "none" }}
                />
              </div>

              <button type="submit" disabled={loading}
                style={{ padding: "12px", borderRadius: "8px", backgroundColor: "#f5c518", color: "#3d2f00", border: "none", fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.9rem", cursor: loading ? "wait" : "pointer", opacity: loading ? 0.6 : 1, transition: "opacity 0.2s" }}
              >
                {loading ? "Actualizando..." : "Actualizar contraseña"}
              </button>
            </form>

            {error && (
              <div style={{ marginTop: "16px", padding: "12px 14px", backgroundColor: "rgba(224,92,92,0.12)", border: "1px solid rgba(224,92,92,0.3)", borderRadius: "8px", color: "#e05c5c", fontFamily: "'Inter', sans-serif", fontSize: "0.85rem" }}>
                {error}
              </div>
            )}
          </>
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
