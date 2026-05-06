"use client";

import { useEffect, useState, useCallback } from "react";
import { authApi, type OAuthAccountInfo } from "@/services/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001";

interface ProviderConfig {
  id: string;
  label: string;
  color: string;
  symbol: string;
}

const PROVIDERS: ProviderConfig[] = [
  { id: "google",  label: "Google",  color: "#ea4335", symbol: "G" },
  { id: "discord", label: "Discord", color: "#5865f2", symbol: "⌬" },
  { id: "github",  label: "GitHub",  color: "var(--color-on-surface)", symbol: "⌥" },
];

export default function OAuthAccountsSection() {
  const [accounts, setAccounts] = useState<OAuthAccountInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await authApi.listOAuthAccounts();
      setAccounts(data);
    } catch (err) {
      setMsg({ type: "err", text: (err as Error).message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleUnlink(provider: string) {
    if (!confirm(`¿Desvincular cuenta de ${provider}?`)) return;
    setMsg(null);
    try {
      await authApi.unlinkOAuth(provider);
      await load();
      setMsg({ type: "ok", text: "Cuenta desvinculada" });
    } catch (err) {
      setMsg({ type: "err", text: (err as Error).message });
    }
  }

  return (
    <div style={{ backgroundColor: "var(--color-surface-container-low)", border: "1px solid var(--color-divider)", borderRadius: "12px", padding: "24px" }}>
      <h2 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "1rem", color: "var(--color-on-surface)", marginBottom: "8px" }}>
        Cuentas vinculadas
      </h2>
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.85rem", color: "var(--color-outline)", marginBottom: "16px" }}>
        Conecta tu cuenta con providers OAuth para iniciar sesión sin contraseña.
      </p>

      {loading ? (
        <p style={{ color: "var(--color-outline)", fontFamily: "'Inter', sans-serif", fontSize: "0.85rem" }}>Cargando...</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {PROVIDERS.map((p) => {
            const linked = accounts.find((a) => a.provider === p.id);
            return (
              <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", backgroundColor: "var(--color-surface)", border: "1px solid var(--color-divider-strong)", borderRadius: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span aria-hidden="true" style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: `${p.color}22`, color: p.color, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Manrope', sans-serif", fontWeight: 800 }}>{p.symbol}</span>
                  <div>
                    <p style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: "0.9rem", color: "var(--color-on-surface)", margin: 0 }}>{p.label}</p>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "var(--color-outline)", margin: "2px 0 0" }}>
                      {linked ? linked.email || "Vinculado" : "No vinculado"}
                    </p>
                  </div>
                </div>
                {linked ? (
                  <button onClick={() => handleUnlink(p.id)} style={{ background: "transparent", border: "1px solid rgba(224,92,92,0.4)", color: "#e05c5c", borderRadius: "6px", padding: "6px 12px", fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: "0.8rem", cursor: "pointer" }}>
                    Desvincular
                  </button>
                ) : (
                  <a href={`${API_URL}/auth/${p.id}`} style={{ background: "rgba(245,197,24,0.15)", border: "1px solid rgba(245,197,24,0.4)", color: "#f5c518", borderRadius: "6px", padding: "6px 12px", fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.8rem", textDecoration: "none" }}>
                    Conectar
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}

      {msg && (
        <p style={{ marginTop: "12px", fontFamily: "'Inter', sans-serif", fontSize: "0.85rem", color: msg.type === "ok" ? "#4caf50" : "#e05c5c" }}>{msg.text}</p>
      )}
    </div>
  );
}
