"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { authApi, type TwoFactorStatus, type TwoFactorSetupResponse } from "@/services/api";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      backgroundColor: "var(--color-surface-container-low)",
      border: "1px solid var(--color-divider)",
      borderRadius: "12px",
      padding: "24px",
    }}>
      <h2 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "1rem", color: "var(--color-on-surface)", marginBottom: "20px" }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  backgroundColor: "var(--color-surface)",
  border: "1px solid var(--color-divider-strong)",
  borderRadius: "8px",
  padding: "10px 14px",
  color: "var(--color-on-surface)",
  fontSize: "0.875rem",
  fontFamily: "'Inter', sans-serif",
  outline: "none",
  width: "100%",
};

const primaryBtn: React.CSSProperties = {
  backgroundColor: "#f5c518", color: "#3d2f00",
  border: "none", borderRadius: "8px", padding: "10px 20px",
  fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.85rem",
  cursor: "pointer",
};

const secondaryBtn: React.CSSProperties = {
  background: "transparent",
  border: "1px solid var(--color-divider-strong)",
  borderRadius: "8px", padding: "10px 20px",
  color: "var(--color-on-surface-variant)",
  cursor: "pointer",
  fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: "0.85rem",
};

type Mode = "idle" | "setup" | "disable" | "backup";

export default function TwoFactorSection() {
  const [status, setStatus] = useState<TwoFactorStatus | null>(null);
  const [mode, setMode] = useState<Mode>("idle");
  const [setupData, setSetupData] = useState<TwoFactorSetupResponse | null>(null);
  const [code, setCode] = useState("");
  const [disablePassword, setDisablePassword] = useState("");
  const [useCodeToDisable, setUseCodeToDisable] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const loadStatus = useCallback(async () => {
    try {
      const s = await authApi.twoFactorStatus();
      setStatus(s);
    } catch (err) {
      setMsg({ type: "err", text: (err as Error).message });
    }
  }, []);

  useEffect(() => { loadStatus(); }, [loadStatus]);

  async function handleBeginSetup() {
    setLoading(true); setMsg(null); setBackupCodes(null);
    try {
      const data = await authApi.twoFactorSetup();
      setSetupData(data);
      setMode("setup");
    } catch (err) {
      setMsg({ type: "err", text: (err as Error).message });
    } finally {
      setLoading(false);
    }
  }

  async function handleEnable() {
    if (!code.trim()) return;
    setLoading(true); setMsg(null);
    try {
      const res = await authApi.twoFactorEnable(code.trim());
      setBackupCodes(res.backup_codes);
      setCode("");
      setSetupData(null);
      setMode("idle");
      setMsg({ type: "ok", text: "2FA activado. Guarda los códigos de respaldo en un lugar seguro." });
      await loadStatus();
    } catch (err) {
      setMsg({ type: "err", text: (err as Error).message });
    } finally {
      setLoading(false);
    }
  }

  async function handleDisable() {
    setLoading(true); setMsg(null);
    try {
      await authApi.twoFactorDisable(
        useCodeToDisable ? { code: code.trim() } : { password: disablePassword },
      );
      setCode(""); setDisablePassword("");
      setMode("idle");
      setMsg({ type: "ok", text: "2FA desactivado." });
      setBackupCodes(null);
      await loadStatus();
    } catch (err) {
      setMsg({ type: "err", text: (err as Error).message });
    } finally {
      setLoading(false);
    }
  }

  async function handleRegenerate() {
    if (!code.trim()) return;
    setLoading(true); setMsg(null);
    try {
      const res = await authApi.twoFactorRegenerateBackupCodes(code.trim());
      setBackupCodes(res.backup_codes);
      setCode("");
      setMode("idle");
      setMsg({ type: "ok", text: "Nuevos códigos generados. Los anteriores ya no funcionan." });
    } catch (err) {
      setMsg({ type: "err", text: (err as Error).message });
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    setMode("idle"); setCode(""); setDisablePassword(""); setSetupData(null); setMsg(null);
  }

  if (!status) return null;

  return (
    <Section title="Autenticación en dos pasos (2FA)">
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.85rem", color: "var(--color-outline)", marginBottom: "16px" }}>
        Añade una capa extra de seguridad requiriendo un código de tu app de autenticación al iniciar sesión.
      </p>

      {status.enabled ? (
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
          <span className="material-symbols-outlined" aria-hidden="true" style={{ color: "#4caf50", fontSize: "22px" }}>verified_user</span>
          <span style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600, color: "#4caf50", fontSize: "0.9rem" }}>Activado</span>
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
          <span className="material-symbols-outlined" aria-hidden="true" style={{ color: "var(--color-outline)", fontSize: "22px" }}>lock_open</span>
          <span style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600, color: "var(--color-outline)", fontSize: "0.9rem" }}>No activado</span>
        </div>
      )}

      {mode === "idle" && !status.enabled && (
        <button type="button" onClick={handleBeginSetup} disabled={loading} style={{ ...primaryBtn, opacity: loading ? 0.6 : 1 }}>
          {loading ? "Generando..." : "Activar 2FA"}
        </button>
      )}

      {mode === "idle" && status.enabled && (
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button type="button" onClick={() => setMode("backup")} style={secondaryBtn}>Regenerar códigos de respaldo</button>
          <button type="button" onClick={() => setMode("disable")} style={{ ...secondaryBtn, color: "#e05c5c", borderColor: "rgba(224,92,92,0.3)" }}>Desactivar 2FA</button>
        </div>
      )}

      {mode === "setup" && setupData && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.85rem", color: "var(--color-on-surface-variant)" }}>
            1. Escanea este QR con Google Authenticator, Authy, 1Password u otra app TOTP.
          </p>
          <div style={{ display: "flex", justifyContent: "center", padding: "16px", backgroundColor: "#fff", borderRadius: "8px" }}>
            <Image src={setupData.qr_data_url} alt="Código QR para configurar 2FA" width={200} height={200} unoptimized style={{ width: "200px", height: "200px" }} />
          </div>
          <details style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", color: "var(--color-outline)" }}>
            <summary style={{ cursor: "pointer" }}>¿No puedes escanear? Usa este código manual</summary>
            <code style={{ display: "block", marginTop: "8px", padding: "10px", backgroundColor: "var(--color-surface)", borderRadius: "6px", wordBreak: "break-all", color: "var(--color-on-surface)" }}>
              {setupData.secret}
            </code>
          </details>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.85rem", color: "var(--color-on-surface-variant)" }}>
            2. Ingresa el código de 6 dígitos que genera la app.
          </p>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="123456"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            style={{ ...inputStyle, textAlign: "center", letterSpacing: "0.3em", fontSize: "1.1rem" }}
          />
          <div style={{ display: "flex", gap: "10px" }}>
            <button type="button" onClick={handleEnable} disabled={loading || !code.trim()} style={{ ...primaryBtn, opacity: loading || !code.trim() ? 0.6 : 1 }}>
              {loading ? "Verificando..." : "Activar"}
            </button>
            <button type="button" onClick={handleCancel} style={secondaryBtn}>Cancelar</button>
          </div>
        </div>
      )}

      {mode === "disable" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", gap: "16px", fontFamily: "'Inter', sans-serif", fontSize: "0.85rem" }}>
            <label style={{ display: "flex", gap: "6px", cursor: "pointer", color: "var(--color-on-surface-variant)" }}>
              <input type="radio" checked={!useCodeToDisable} onChange={() => setUseCodeToDisable(false)} />
              Contraseña
            </label>
            <label style={{ display: "flex", gap: "6px", cursor: "pointer", color: "var(--color-on-surface-variant)" }}>
              <input type="radio" checked={useCodeToDisable} onChange={() => setUseCodeToDisable(true)} />
              Código 2FA
            </label>
          </div>
          {useCodeToDisable ? (
            <input type="text" inputMode="text" placeholder="Código 2FA o respaldo" value={code} onChange={(e) => setCode(e.target.value)} style={inputStyle} />
          ) : (
            <input type="password" placeholder="Tu contraseña" value={disablePassword} onChange={(e) => setDisablePassword(e.target.value)} style={inputStyle} />
          )}
          <div style={{ display: "flex", gap: "10px" }}>
            <button type="button" onClick={handleDisable} disabled={loading || (useCodeToDisable ? !code.trim() : !disablePassword)} style={{ ...primaryBtn, backgroundColor: "#e05c5c", color: "#fff", opacity: loading ? 0.6 : 1 }}>
              {loading ? "Desactivando..." : "Desactivar"}
            </button>
            <button type="button" onClick={handleCancel} style={secondaryBtn}>Cancelar</button>
          </div>
        </div>
      )}

      {mode === "backup" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.85rem", color: "var(--color-on-surface-variant)" }}>
            Confirma con un código 2FA actual. Se generarán nuevos códigos de respaldo y los anteriores dejarán de funcionar.
          </p>
          <input type="text" inputMode="numeric" placeholder="Código 2FA" value={code} onChange={(e) => setCode(e.target.value)} style={{ ...inputStyle, textAlign: "center", letterSpacing: "0.3em", fontSize: "1.1rem" }} />
          <div style={{ display: "flex", gap: "10px" }}>
            <button type="button" onClick={handleRegenerate} disabled={loading || !code.trim()} style={{ ...primaryBtn, opacity: loading ? 0.6 : 1 }}>
              {loading ? "Generando..." : "Regenerar"}
            </button>
            <button type="button" onClick={handleCancel} style={secondaryBtn}>Cancelar</button>
          </div>
        </div>
      )}

      {backupCodes && (
        <div style={{ marginTop: "16px", padding: "16px", backgroundColor: "var(--color-surface)", borderRadius: "8px", border: "1px solid #f5c518" }}>
          <p style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, color: "#f5c518", fontSize: "0.9rem", marginBottom: "12px" }}>
            Códigos de respaldo — guárdalos ahora
          </p>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", color: "var(--color-outline)", marginBottom: "12px" }}>
            Úsalos si pierdes acceso a tu app. Cada uno se puede usar una sola vez.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "6px", fontFamily: "monospace", fontSize: "0.9rem", color: "var(--color-on-surface)" }}>
            {backupCodes.map((c) => (
              <code key={c} style={{ padding: "6px 10px", backgroundColor: "var(--color-surface-container)", borderRadius: "4px" }}>{c}</code>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(backupCodes.join("\n"));
              setMsg({ type: "ok", text: "Códigos copiados al portapapeles" });
            }}
            style={{ ...secondaryBtn, marginTop: "12px" }}
          >
            Copiar al portapapeles
          </button>
        </div>
      )}

      {msg && (
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", color: msg.type === "ok" ? "#6fcf97" : "#e05c5c", marginTop: "12px" }}>
          {msg.text}
        </p>
      )}
    </Section>
  );
}
