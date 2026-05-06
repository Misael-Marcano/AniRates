"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { authApi } from "@/services/api";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const t = useTranslations("auth");
  const { isMobile } = useBreakpoint();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingToken, setPendingToken] = useState<string | null>(null);
  const [code2fa, setCode2fa] = useState("");
  const is2FA = Boolean(pendingToken);
  const canSubmit = form.email.trim().length > 0 && form.password.trim().length > 0;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await authApi.login(form);
      if (res.requires2FA && res.pending_token) {
        setPendingToken(res.pending_token);
      } else if (res.access_token) {
        login(res.access_token, res.refresh_token);
        router.push("/");
      } else {
        setError("Respuesta inesperada del servidor");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("wrongCredentials"));
    } finally {
      setLoading(false);
    }
  }

  async function handle2FASubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!pendingToken) return;
    setError("");
    setLoading(true);
    try {
      const result = await authApi.loginVerify2FA(pendingToken, code2fa.trim());
      login(result.access_token, result.refresh_token);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("invalidCode"));
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

  const surfaceColor = "rgba(26, 26, 26, 0.82)";
  const surfaceBorder = "1px solid var(--color-divider-strong)";

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--color-surface)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background decoration */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 25% 20%, rgba(245,197,24,0.13) 0%, transparent 45%), radial-gradient(ellipse at 80% 80%, rgba(245,197,24,0.1) 0%, transparent 55%)",
          pointerEvents: "none",
        }}
      />

      {/* Card */}
      <main
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          maxWidth: isMobile ? "420px" : "980px",
          padding: "0 24px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1.1fr 1fr",
            borderRadius: "20px",
            overflow: "hidden",
            boxShadow: "0 30px 70px var(--color-scrim-strong)",
            border: surfaceBorder,
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            backgroundColor: surfaceColor,
          }}
        >
          {!isMobile && (
            <section
              style={{
                padding: "44px 40px",
                borderRight: "1px solid var(--color-divider)",
                background:
                  "linear-gradient(140deg, rgba(245,197,24,0.12) 0%, rgba(26,26,26,0.7) 45%, rgba(26,26,26,0.95) 100%)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "0.75rem",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    borderRadius: "999px",
                    border: "1px solid rgba(245,197,24,0.35)",
                    padding: "6px 12px",
                    color: "#ffe39a",
                    marginBottom: "20px",
                  }}
                >
                  <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "16px" }}>
                    bolt
                  </span>
                  AniRate Experience
                </span>
                <h2
                  style={{
                    margin: 0,
                    fontFamily: "'Manrope', sans-serif",
                    fontSize: "2rem",
                    lineHeight: 1.1,
                    letterSpacing: "-0.03em",
                    color: "var(--color-on-surface)",
                  }}
                >
                  Tu centro para seguir, descubrir y puntuar anime y manga.
                </h2>
                <p
                  style={{
                    marginTop: "16px",
                    color: "var(--color-on-surface-variant)",
                    fontSize: "0.95rem",
                    lineHeight: 1.6,
                  }}
                >
                  Continúa donde lo dejaste: recomendaciones para ti, lista de seguimiento y actividad de la comunidad.
                </p>
              </div>
              <div style={{ display: "grid", gap: "10px", marginTop: "20px" }}>
                {[
                  "Recomendaciones personalizadas",
                  "Feed social en tiempo real",
                  "Watchlist con progreso",
                ].map((feature) => (
                  <div
                    key={feature}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      color: "var(--color-on-surface)",
                      fontSize: "0.9rem",
                    }}
                  >
                    <span className="material-symbols-outlined" aria-hidden="true" style={{ color: "#f5c518", fontSize: "18px" }}>
                      check_circle
                    </span>
                    {feature}
                  </div>
                ))}
              </div>
            </section>
          )}

          <section style={{ padding: isMobile ? "28px 20px" : "40px" }}>
          {/* Back to home */}
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "var(--color-outline)", fontSize: "0.8rem", fontFamily: "'Inter', sans-serif", textDecoration: "none", marginBottom: "24px" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-on-surface-variant)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-outline)")}
          >
            <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "15px" }}>arrow_back</span>
            {t("backToHome")}
          </Link>

          {/* Brand */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "40px" }}>
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
              fontWeight: 700, fontSize: "1.25rem",
              color: "var(--color-on-surface)", letterSpacing: "-0.02em",
              margin: 0,
            }}>
              {is2FA ? t("twoFactorTitle") : t("loginTitle")}
            </p>
          </div>

          {is2FA ? (
            <form onSubmit={handle2FASubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <p style={{ fontSize: "0.85rem", color: "var(--color-on-surface-variant)", fontFamily: "'Inter', sans-serif", textAlign: "center" }}>
                {t("twoFactorPrompt")} También puedes usar un código de respaldo.
              </p>
              <div>
                <label htmlFor="code-2fa" style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "var(--color-on-surface-variant)", marginBottom: "8px", fontFamily: "'Inter', sans-serif" }}>
                  Código
                </label>
                <input
                  id="code-2fa"
                  type="text"
                  inputMode="text"
                  autoComplete="one-time-code"
                  placeholder="123456"
                  required
                  autoFocus
                  value={code2fa}
                  onChange={(e) => setCode2fa(e.target.value)}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? "login-error" : undefined}
                  style={{ ...inputStyle, paddingLeft: "16px", textAlign: "center", letterSpacing: "0.3em", fontSize: "1.2rem" }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "#f5c518"; e.currentTarget.style.backgroundColor = "var(--color-surface-container-highest)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "transparent"; e.currentTarget.style.backgroundColor = "var(--color-surface-container)"; }}
                />
              </div>
              {error && (
                <p
                  id="login-error"
                  role="alert"
                  style={{ fontSize: "0.8rem", textAlign: "center", color: "#ffb4ab", fontFamily: "'Inter', sans-serif" }}
                >
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={loading || !code2fa.trim()}
                style={{
                  width: "100%", padding: "14px",
                  backgroundColor: "#f5c518", color: "#3d2f00",
                  border: "none", borderRadius: "8px",
                  fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.95rem",
                  cursor: loading || !code2fa.trim() ? "not-allowed" : "pointer",
                  opacity: loading || !code2fa.trim() ? 0.7 : 1,
                }}
              >
                {loading ? t("twoFactorVerifying") : t("twoFactorVerify")}
              </button>
              <button
                type="button"
                onClick={() => { setPendingToken(null); setCode2fa(""); setError(""); }}
                style={{ background: "none", border: "none", color: "var(--color-outline)", cursor: "pointer", fontSize: "0.8rem", fontFamily: "'Inter', sans-serif", textDecoration: "underline" }}
              >
                Cancelar
              </button>
            </form>
          ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Email */}
            <div>
              <label htmlFor="login-email" style={{
                display: "block", fontSize: "0.875rem", fontWeight: 500,
                color: "var(--color-on-surface-variant)", marginBottom: "8px", fontFamily: "'Inter', sans-serif",
              }}>
                {t("email")}
              </label>
              <div style={{ position: "relative" }}>
                <span className="material-symbols-outlined" aria-hidden="true" style={{
                  position: "absolute", left: "12px", top: "50%",
                  transform: "translateY(-50%)", color: "var(--color-outline)", fontSize: "20px",
                  pointerEvents: "none",
                }}>mail</span>
                <input
                  id="login-email"
                  type="email"
                  placeholder="tu@email.com"
                  autoComplete="username"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? "login-error" : undefined}
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

            {/* Password */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <label htmlFor="login-password" style={{
                  fontSize: "0.875rem", fontWeight: 500,
                  color: "var(--color-on-surface-variant)", fontFamily: "'Inter', sans-serif",
                }}>
                  {t("password")}
                </label>
                <Link href="/recuperar-contrasena" style={{ fontSize: "0.875rem", fontWeight: 500, color: "#ffe5a0", textDecoration: "none" }}>
                  {t("forgotPassword")}
                </Link>
              </div>
              <div style={{ position: "relative" }}>
                <span className="material-symbols-outlined" aria-hidden="true" style={{
                  position: "absolute", left: "12px", top: "50%",
                  transform: "translateY(-50%)", color: "var(--color-outline)", fontSize: "20px",
                  pointerEvents: "none",
                }}>lock</span>
                <input
                  id="login-password"
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? "login-error" : undefined}
                  style={{ ...inputStyle, paddingRight: "44px" }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#f5c518";
                    e.currentTarget.style.backgroundColor = "var(--color-surface-container-highest)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "transparent";
                    e.currentTarget.style.backgroundColor = "var(--color-surface-container)";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
                  style={{
                    position: "absolute", right: "12px", top: "50%",
                    transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    color: "var(--color-outline)", padding: 0,
                  }}
                >
                  <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "20px" }}>
                    {showPass ? "visibility" : "visibility_off"}
                  </span>
                </button>
              </div>
            </div>

            {error && (
              <p
                id="login-error"
                role="alert"
                style={{
                fontSize: "0.8rem", textAlign: "center",
                color: "#ffb4ab", fontFamily: "'Inter', sans-serif",
              }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !canSubmit}
              style={{
                width: "100%", padding: "14px",
                backgroundColor: "#f5c518", color: "#3d2f00",
                border: "none", borderRadius: "8px",
                fontFamily: "'Manrope', sans-serif",
                fontWeight: 700, fontSize: "0.95rem",
                cursor: loading || !canSubmit ? "not-allowed" : "pointer",
                opacity: loading || !canSubmit ? 0.7 : 1,
                transition: "box-shadow 0.2s",
              }}
              onMouseEnter={(e) => { if (!loading && canSubmit) e.currentTarget.style.boxShadow = "0 0 12px rgba(245,197,24,0.4)"; }}
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
            >
              {loading ? t("loginLoading") : t("loginSubmit")}
            </button>
            <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--color-outline)", textAlign: "center", fontFamily: "'Inter', sans-serif" }}>
              Usa el mismo correo que registraste para acceder a tus ratings y watchlist.
            </p>
          </form>
          )}

          {!pendingToken && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "24px 0 16px" }}>
                <div style={{ flex: 1, height: "1px", backgroundColor: "var(--color-divider)" }} />
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "var(--color-outline)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{t("or")}</span>
                <div style={{ flex: 1, height: "1px", backgroundColor: "var(--color-divider)" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <a href={`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001"}/auth/google`}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", padding: "12px", backgroundColor: "var(--color-surface-container)", border: "1px solid var(--color-divider-strong)", borderRadius: "10px", color: "var(--color-on-surface)", textDecoration: "none", fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: "0.875rem" }}>
                  <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "18px" }}>public</span> {t("continueWithGoogle")}
                </a>
                <a href={`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001"}/auth/discord`}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", padding: "12px", backgroundColor: "rgba(88,101,242,0.15)", border: "1px solid rgba(88,101,242,0.4)", borderRadius: "10px", color: "#b9c2ff", textDecoration: "none", fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: "0.875rem" }}>
                  <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "18px" }}>forum</span> {t("continueWithDiscord")}
                </a>
                <a href={`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001"}/auth/github`}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", padding: "12px", backgroundColor: "var(--color-surface-container-high)", border: "1px solid var(--color-divider-strong)", borderRadius: "10px", color: "var(--color-on-surface)", textDecoration: "none", fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: "0.875rem" }}>
                  <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "18px" }}>code</span> {t("continueWithGithub")}
                </a>
              </div>
            </>
          )}

          {/* Register link */}
          <div style={{ marginTop: "32px", textAlign: "center" }}>
            <p style={{ fontSize: "0.875rem", color: "var(--color-on-surface-variant)", fontFamily: "'Inter', sans-serif" }}>
              {t("noAccount")}{" "}
              <Link href="/registro" style={{ fontWeight: 600, color: "#ffe5a0", textDecoration: "none" }}>
                {t("registerLink")}
              </Link>
            </p>
          </div>
          </section>
        </div>
      </main>
    </div>
  );
}
