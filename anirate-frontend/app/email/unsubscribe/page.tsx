"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { authApi } from "@/services/api";

type Status = "loading" | "ok" | "error";

function EmailUnsubscribeInner() {
  const t = useTranslations("common");
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token || token.length < 16) {
      setStatus("error");
      setMessage(t("emailUnsubInvalidToken"));
      return;
    }
    authApi
      .emailUnsubscribe(token)
      .then(() => {
        setStatus("ok");
        setMessage(t("emailUnsubOk"));
      })
      .catch((err: Error) => {
        setStatus("error");
        setMessage(err.message || t("emailUnsubFail"));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- next-intl `t` estable por locale
  }, [token]);

  const icon =
    status === "loading" ? "hourglass_empty" : status === "ok" ? "mark_email_read" : "error";
  const color =
    status === "loading" ? "#f5c518" : status === "ok" ? "#81c784" : "#e05c5c";

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--color-surface)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          backgroundColor: "var(--color-surface-container-low)",
          borderRadius: "16px",
          border: "1px solid var(--color-divider-strong)",
          padding: "40px",
          maxWidth: "460px",
          width: "100%",
          textAlign: "center",
        }}
      >
        <span
          className="material-symbols-outlined"
          aria-hidden="true"
          style={{
            fontSize: "56px",
            color,
            display: "block",
            marginBottom: "16px",
            animation: status === "loading" ? "spin 1s linear infinite" : "none",
          }}
        >
          {icon}
        </span>
        <h1
          style={{
            fontFamily: "'Manrope', sans-serif",
            fontWeight: 900,
            fontSize: "1.5rem",
            color: "var(--color-on-surface)",
            margin: "0 0 12px",
            letterSpacing: "-0.03em",
          }}
        >
          {status === "loading"
            ? t("emailUnsubLoading")
            : status === "ok"
              ? t("emailUnsubTitleOk")
              : t("emailUnsubTitleErr")}
        </h1>
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.9rem",
            color: "var(--color-outline)",
            margin: "0 0 24px",
          }}
        >
          {message ||
            (status === "loading" ? t("emailUnsubLoadingHint") : "")}
        </p>

        {status === "ok" && (
          <Link
            href="/configuracion"
            style={{
              display: "inline-block",
              padding: "10px 20px",
              borderRadius: "8px",
              backgroundColor: "#f5c518",
              color: "#3d2f00",
              textDecoration: "none",
              fontFamily: "'Manrope', sans-serif",
              fontWeight: 700,
              fontSize: "0.9rem",
            }}
          >
            {t("emailUnsubPrefs")}
          </Link>
        )}
        {(status === "error" || status === "ok") && (
          <div style={{ marginTop: "16px" }}>
            <Link
              href="/"
              style={{
                display: "inline-block",
                padding: "10px 20px",
                borderRadius: "8px",
                border: "1px solid var(--color-divider-strong)",
                color: "var(--color-on-surface-variant)",
                textDecoration: "none",
                fontFamily: "'Manrope', sans-serif",
                fontWeight: 600,
                fontSize: "0.88rem",
              }}
            >
              {t("emailUnsubHome")}
            </Link>
          </div>
        )}

        <style jsx>{`
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    </main>
  );
}

export default function EmailUnsubscribePage() {
  const t = useTranslations("common");
  return (
    <Suspense
      fallback={
        <main
          style={{
            minHeight: "100vh",
            backgroundColor: "var(--color-surface)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <p style={{ color: "var(--color-outline)", fontFamily: "'Inter', sans-serif" }}>
            {t("emailUnsubLoading")}
          </p>
        </main>
      }
    >
      <EmailUnsubscribeInner />
    </Suspense>
  );
}
