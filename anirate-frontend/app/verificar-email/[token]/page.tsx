"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { authApi } from "@/services/api";

type Status = "loading" | "ok" | "error";

export default function VerificarEmailPage() {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    authApi.verifyEmail(token)
      .then((res) => { setStatus("ok"); setMessage(res.message); })
      .catch((err) => { setStatus("error"); setMessage((err as Error).message); });
  }, [token]);

  const icon = status === "loading" ? "hourglass_empty" : status === "ok" ? "mark_email_read" : "error";
  const color = status === "loading" ? "#f5c518" : status === "ok" ? "#81c784" : "#e05c5c";
  const title = status === "loading" ? "Verificando..." : status === "ok" ? "¡Email verificado!" : "Error de verificación";

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "var(--color-surface)", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
      <div style={{ backgroundColor: "var(--color-surface-container-low)", borderRadius: "16px", border: "1px solid var(--color-divider-strong)", padding: "40px", maxWidth: "460px", width: "100%", textAlign: "center" }}>
        <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "56px", color, display: "block", marginBottom: "16px", animation: status === "loading" ? "spin 1s linear infinite" : "none" }}>
          {icon}
        </span>
        <h1 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 900, fontSize: "1.5rem", color: "var(--color-on-surface)", margin: "0 0 12px", letterSpacing: "-0.03em" }}>
          {title}
        </h1>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.9rem", color: "var(--color-outline)", margin: "0 0 24px" }}>
          {message || (status === "loading" ? "Estamos confirmando tu correo electrónico." : "")}
        </p>

        {status === "ok" && (
          <Link href="/login" style={{ display: "inline-block", padding: "10px 20px", borderRadius: "8px", backgroundColor: "#f5c518", color: "#3d2f00", textDecoration: "none", fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.9rem" }}>
            Ir al login
          </Link>
        )}
        {status === "error" && (
          <Link href="/" style={{ display: "inline-block", padding: "10px 20px", borderRadius: "8px", border: "1px solid var(--color-divider-strong)", color: "var(--color-on-surface-variant)", textDecoration: "none", fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: "0.88rem" }}>
            Volver al inicio
          </Link>
        )}

        <style jsx>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    </main>
  );
}
