"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { authApi } from "@/services/api";
import { useBreakpoint } from "@/hooks/useBreakpoint";

type FormKey = "nombre" | "email" | "password" | "confirm";

const FIELDS: { key: FormKey; label: string; placeholder: string; type: string; icon: string }[] = [
  { key: "nombre", label: "Nombre", placeholder: "Tu nombre", type: "text", icon: "person" },
  { key: "email", label: "Correo Electrónico", placeholder: "tu@email.com", type: "email", icon: "mail" },
  { key: "password", label: "Contraseña", placeholder: "••••••••", type: "password", icon: "lock" },
  { key: "confirm", label: "Confirmar Contraseña", placeholder: "••••••••", type: "password", icon: "lock" },
];

export default function RegistroPage() {
  const router = useRouter();
  const t = useTranslations("auth");
  const { isMobile } = useBreakpoint();
  const [form, setForm] = useState<Record<FormKey, string>>({ nombre: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [devVerifyToken, setDevVerifyToken] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) {
      setError("Las contraseñas no coinciden");
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.register({ nombre: form.nombre, email: form.email, password: form.password });
      if (res.verifyToken) {
        setDevVerifyToken(res.verifyToken);
      } else {
        router.push("/login");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrarse");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    display: "block", width: "100%",
    paddingLeft: "44px", paddingRight: "16px", paddingTop: "14px", paddingBottom: "14px",
    border: "1px solid transparent",
    borderRadius: "8px",
    backgroundColor: "var(--color-surface-container)",
    color: "var(--color-on-surface)",
    fontSize: "0.875rem",
    outline: "none",
    fontFamily: "'Inter', sans-serif",
    transition: "border-color 0.2s, background-color 0.2s",
  };

  return (
    <div style={{
      minHeight: "100vh", backgroundColor: "var(--color-surface)",
      display: "flex", alignItems: "center", justifyContent: "center",
      position: "relative", overflow: "hidden",
    }}>
      {/* Background decoration */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at 40% 50%, var(--color-primary-soft) 0%, transparent 60%)",
        pointerEvents: "none",
      }} />

      <main style={{
        position: "relative", zIndex: 10,
        width: "100%", maxWidth: "420px",
        padding: "0 24px",
      }}>
        <div style={{
          backgroundColor: "rgba(42,42,42,0.85)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderRadius: "16px",
          padding: isMobile ? "28px 20px" : "40px",
          boxShadow: "0 30px 60px var(--color-scrim-strong)",
          border: "1px solid var(--color-divider-strong)",
        }}>
          {/* Back to home */}
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "var(--color-outline)", fontSize: "0.8rem", fontFamily: "'Inter', sans-serif", textDecoration: "none", marginBottom: "24px" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-on-surface-variant)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-outline)")}
          >
            <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "15px" }}>arrow_back</span>
            {t("backToHome")}
          </Link>

          {/* Brand */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "36px" }}>
            <h1 style={{
              fontFamily: "'Manrope', sans-serif",
              fontWeight: 900, fontSize: "2.5rem",
              letterSpacing: "-0.04em", color: "#f5c518",
              marginBottom: "8px",
            }}>
              AniRate
            </h1>
            <p style={{
              fontFamily: "'Manrope', sans-serif",
              fontWeight: 600, fontSize: "1.4rem",
              color: "var(--color-on-surface)", letterSpacing: "-0.02em",
            }}>
              {t("registerTitle")}
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {FIELDS.map(({ key, label, placeholder, type, icon }) => (
              <div key={key}>
                <label style={{
                  display: "block", fontSize: "0.875rem", fontWeight: 500,
                  color: "var(--color-on-surface-variant)", marginBottom: "8px", fontFamily: "'Inter', sans-serif",
                }}>
                  {label}
                </label>
                <div style={{ position: "relative" }}>
                  <span className="material-symbols-outlined" aria-hidden="true" style={{
                    position: "absolute", left: "12px", top: "50%",
                    transform: "translateY(-50%)", color: "var(--color-outline)", fontSize: "20px",
                    pointerEvents: "none",
                  }}>{icon}</span>
                  <input
                    type={type}
                    placeholder={placeholder}
                    required
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    style={inputStyle}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "#f5c518";
                      e.currentTarget.style.backgroundColor = "var(--color-surface-container-highest)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "transparent";
                      e.currentTarget.style.backgroundColor = "var(--color-surface-container)";
                    }}
                  />
                </div>
              </div>
            ))}

            {error && (
              <p style={{
                fontSize: "0.8rem", textAlign: "center",
                color: "#ffb4ab", fontFamily: "'Inter', sans-serif",
              }}>
                {error}
              </p>
            )}

            {devVerifyToken && (
              <div style={{ padding: "14px", backgroundColor: "var(--color-primary-soft)", border: "1px dashed rgba(245,197,24,0.4)", borderRadius: "8px" }}>
                <p style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "11px", color: "#f5c518", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Cuenta creada — verificación de email (dev mode)
                </p>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", color: "var(--color-on-surface-variant)", margin: "0 0 10px" }}>
                  En producción recibirías un email con el enlace. Ahora puedes verificar aquí:
                </p>
                <Link href={`/verificar-email/${devVerifyToken}`}
                  style={{ display: "inline-block", padding: "8px 14px", borderRadius: "6px", backgroundColor: "#f5c518", color: "#3d2f00", textDecoration: "none", fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.82rem" }}>
                  Verificar mi email
                </Link>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", padding: "14px",
                backgroundColor: "#f5c518", color: "#3d2f00",
                border: "none", borderRadius: "8px",
                fontFamily: "'Manrope', sans-serif",
                fontWeight: 700, fontSize: "0.95rem",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                marginTop: "4px",
                transition: "box-shadow 0.2s",
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.boxShadow = "0 0 12px rgba(245,197,24,0.4)"; }}
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
            >
              {loading ? t("registerLoading") : t("registerSubmit")}
            </button>
          </form>

          <div style={{ marginTop: "28px", textAlign: "center" }}>
            <p style={{ fontSize: "0.875rem", color: "var(--color-on-surface-variant)", fontFamily: "'Inter', sans-serif" }}>
              {t("haveAccount")}{" "}
              <Link href="/login" style={{ fontWeight: 600, color: "#ffe5a0", textDecoration: "none" }}>
                {t("loginLink")}
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
