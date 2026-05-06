"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  contenidoApi,
  reviewsApi,
  usersApi,
  type AdminContenidoReport,
  type AdminReviewReport,
  type AdminUserReport,
} from "@/services/api";
import { contenidoPath } from "@/services/routes";
import { useAuth } from "@/contexts/AuthContext";

function snippet(text: string, max = 220) {
  const s = text.replace(/\s+/g, " ").trim();
  return s.length <= max ? s : `${s.slice(0, max)}…`;
}

type Tab = "reviews" | "users" | "content";

export default function AdminReportsPage() {
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();
  const t = useTranslations("settings");
  const tc = useTranslations("common");
  const [tab, setTab] = useState<Tab>("reviews");
  const [reviewRows, setReviewRows] = useState<AdminReviewReport[] | null>(null);
  const [userRows, setUserRows] = useState<AdminUserReport[] | null>(null);
  const [contentRows, setContentRows] = useState<AdminContenidoReport[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    if (user?.tipo !== "admin") {
      router.replace("/");
      return;
    }
    setErr(null);
    if (tab === "reviews" && reviewRows === null) {
      reviewsApi
        .listAdminReports()
        .then(setReviewRows)
        .catch(() => setErr(t("adminReportsLoadErr")));
    }
    if (tab === "users" && userRows === null) {
      usersApi
        .listAdminUserReports()
        .then(setUserRows)
        .catch(() => setErr(t("adminUserReportsLoadErr")));
    }
    if (tab === "content" && contentRows === null) {
      contenidoApi
        .listAdminReports()
        .then(setContentRows)
        .catch(() => setErr(t("adminContentReportsLoadErr")));
    }
  }, [isLoggedIn, user?.tipo, router, t, tab, reviewRows, userRows, contentRows]);

  async function toggleReviewResolved(r: AdminReviewReport) {
    setBusyId(r.id);
    setErr(null);
    try {
      const updated = await reviewsApi.setAdminReportResolved(r.id, !r.resuelto);
      setReviewRows((prev) => prev?.map((x) => (x.id === r.id ? { ...x, ...updated } : x)) ?? null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error");
    } finally {
      setBusyId(null);
    }
  }

  async function toggleUserResolved(r: AdminUserReport) {
    setBusyId(r.id);
    setErr(null);
    try {
      const updated = await usersApi.setAdminUserReportResolved(r.id, !r.resuelto);
      setUserRows((prev) => prev?.map((x) => (x.id === r.id ? { ...x, ...updated } : x)) ?? null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error");
    } finally {
      setBusyId(null);
    }
  }

  async function toggleContentResolved(r: AdminContenidoReport) {
    setBusyId(r.id);
    setErr(null);
    try {
      const updated = await contenidoApi.setAdminReportResolved(r.id, !r.resuelto);
      setContentRows((prev) => prev?.map((x) => (x.id === r.id ? { ...x, ...updated } : x)) ?? null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error");
    } finally {
      setBusyId(null);
    }
  }

  if (!user || user.tipo !== "admin") return null;

  const loading =
    (tab === "reviews" && reviewRows === null) ||
    (tab === "users" && userRows === null) ||
    (tab === "content" && contentRows === null);

  const title =
    tab === "reviews"
      ? t("adminReportsTitle")
      : tab === "users"
        ? t("adminUserReportsTitle")
        : t("adminContentReportsTitle");

  const subtitle =
    tab === "reviews"
      ? t("adminReportsSubtitle")
      : tab === "users"
        ? t("adminUserReportsSubtitle")
        : t("adminContentReportsSubtitle");

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "var(--color-surface)", paddingTop: "80px", paddingBottom: "48px" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 24px" }}>
        <div style={{ marginBottom: "28px" }}>
          <Link href="/configuracion" style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", color: "#64b5f6", textDecoration: "none" }}>
            ← {tc("back")}
          </Link>
          <h1 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "1.75rem", color: "var(--color-on-surface)", margin: "16px 0 6px", letterSpacing: "-0.02em" }}>
            {title}
          </h1>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.88rem", color: "var(--color-outline)", margin: 0 }}>
            {subtitle}
          </p>
        </div>

        <div style={{ display: "flex", gap: "8px", marginBottom: "24px", borderBottom: "1px solid var(--color-divider-strong)", paddingBottom: "2px", flexWrap: "wrap" }}>
          {(["reviews", "users", "content"] as Tab[]).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setTab(k)}
              style={{
                padding: "10px 16px",
                border: "none",
                background: "none",
                cursor: "pointer",
                fontFamily: "'Manrope', sans-serif",
                fontWeight: 700,
                fontSize: "0.875rem",
                color: tab === k ? "#f5c518" : "var(--color-outline)",
                borderBottom: tab === k ? "2px solid #f5c518" : "2px solid transparent",
                marginBottom: "-3px",
              }}
            >
              {k === "reviews" ? t("adminReportsTabReviews") : k === "users" ? t("adminReportsTabUsers") : t("adminReportsTabContent")}
            </button>
          ))}
        </div>

        {err && (
          <p role="alert" style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.85rem", color: "#e05c5c", marginBottom: "16px" }}>
            {err}
          </p>
        )}

        {loading ? (
          <p style={{ color: "var(--color-outline)", fontFamily: "'Inter', sans-serif" }}>{tc("loading")}</p>
        ) : tab === "reviews" ? (
          reviewRows!.length === 0 ? (
            <p style={{ color: "var(--color-outline)", fontFamily: "'Inter', sans-serif" }}>{t("adminReportsEmpty")}</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {reviewRows!.map((rep) => {
                const c = rep.review?.contenido;
                const href = c
                ? contenidoPath({
                    id: c.id,
                    jikan_id: c.jikan_id ?? undefined,
                    tipo: c.tipo === "MANGA" ? "MANGA" : "ANIME",
                  })
                : "#";
                return (
                  <article
                    key={rep.id}
                    style={{
                      backgroundColor: "var(--color-surface-container-low)",
                      borderRadius: "12px",
                      border: `1px solid ${rep.resuelto ? "rgba(111,207,151,0.35)" : "var(--color-divider-strong)"}`,
                      padding: "16px 18px",
                    }}
                  >
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center", marginBottom: "10px", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
                        <span
                          style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: "10px",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            padding: "3px 8px",
                            borderRadius: "6px",
                            backgroundColor: rep.resuelto ? "rgba(111,207,151,0.15)" : "rgba(245,197,24,0.15)",
                            color: rep.resuelto ? "#6fcf97" : "#f5c518",
                          }}
                        >
                          {rep.resuelto ? t("adminReportsMarked") : t("adminReportsPending")}
                        </span>
                        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "var(--color-outline)" }}>
                          #{rep.id} · {rep.fecha ? new Date(rep.fecha).toLocaleString() : ""}
                        </span>
                      </div>
                      {c && (
                        <Link href={href} style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", color: "#64b5f6", textDecoration: "none", fontWeight: 600 }}>
                          {t("adminReportsOpen")}: {c.titulo}
                        </Link>
                      )}
                    </div>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.82rem", color: "var(--color-outline)", margin: "0 0 8px" }}>
                      <strong style={{ color: "var(--color-on-surface)" }}>{t("adminReportsAuthor")}:</strong>{" "}
                      {rep.review?.usuario?.nombre ?? "—"} · <strong style={{ color: "var(--color-on-surface)" }}>{t("adminReportsReporter")}:</strong>{" "}
                      {rep.reporter?.nombre ?? `ID ${rep.reporter_id}`}
                    </p>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.85rem", color: "var(--color-on-surface-variant)", margin: "0 0 8px", lineHeight: 1.55 }}>
                      <strong style={{ color: "var(--color-on-surface)" }}>{t("adminReportsSnippet")}:</strong> {snippet(rep.review?.comentario ?? "")}
                    </p>
                    {rep.motivo && (
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", color: "var(--color-outline)", margin: "0 0 12px" }}>
                        <strong>{t("adminReportsReason")}:</strong> {rep.motivo}
                      </p>
                    )}
                    <button
                      type="button"
                      disabled={busyId === rep.id}
                      onClick={() => void toggleReviewResolved(rep)}
                      style={{
                        backgroundColor: rep.resuelto ? "transparent" : "rgba(111,207,151,0.12)",
                        color: rep.resuelto ? "var(--color-outline)" : "#6fcf97",
                        border: `1px solid ${rep.resuelto ? "var(--color-divider)" : "rgba(111,207,151,0.35)"}`,
                        borderRadius: "8px",
                        padding: "8px 16px",
                        fontFamily: "'Manrope', sans-serif",
                        fontWeight: 600,
                        fontSize: "0.8rem",
                        cursor: busyId === rep.id ? "not-allowed" : "pointer",
                        opacity: busyId === rep.id ? 0.6 : 1,
                      }}
                    >
                      {busyId === rep.id ? "…" : rep.resuelto ? t("adminReportsToggleUndo") : t("adminReportsToggleResolve")}
                    </button>
                  </article>
                );
              })}
            </div>
          )
        ) : tab === "users" ? (
          userRows!.length === 0 ? (
            <p style={{ color: "var(--color-outline)", fontFamily: "'Inter', sans-serif" }}>{t("adminUserReportsEmpty")}</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {userRows!.map((rep) => (
                <article
                  key={rep.id}
                  style={{
                    backgroundColor: "var(--color-surface-container-low)",
                    borderRadius: "12px",
                    border: `1px solid ${rep.resuelto ? "rgba(111,207,151,0.35)" : "var(--color-divider-strong)"}`,
                    padding: "16px 18px",
                  }}
                >
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center", marginBottom: "10px", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
                      <span
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: "10px",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          padding: "3px 8px",
                          borderRadius: "6px",
                          backgroundColor: rep.resuelto ? "rgba(111,207,151,0.15)" : "rgba(245,197,24,0.15)",
                          color: rep.resuelto ? "#6fcf97" : "#f5c518",
                        }}
                      >
                        {rep.resuelto ? t("adminReportsMarked") : t("adminReportsPending")}
                      </span>
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "var(--color-outline)" }}>
                        #{rep.id} · {rep.fecha ? new Date(rep.fecha).toLocaleString() : ""}
                      </span>
                    </div>
                    <Link href={`/usuario/${rep.reported_user_id}`} style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", color: "#64b5f6", textDecoration: "none", fontWeight: 600 }}>
                      {t("adminUserReportsOpenProfile")}
                    </Link>
                  </div>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.82rem", color: "var(--color-outline)", margin: "0 0 8px" }}>
                    <strong style={{ color: "var(--color-on-surface)" }}>{t("adminUserReportsSubject")}:</strong>{" "}
                    {rep.reported_user?.nombre ?? `ID ${rep.reported_user_id}`} ·{" "}
                    <strong style={{ color: "var(--color-on-surface)" }}>{t("adminReportsReporter")}:</strong>{" "}
                    {rep.reporter?.nombre ?? `ID ${rep.reporter_id}`}
                  </p>
                  {rep.motivo && (
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", color: "var(--color-outline)", margin: "0 0 12px" }}>
                      <strong>{t("adminReportsReason")}:</strong> {rep.motivo}
                    </p>
                  )}
                  <button
                    type="button"
                    disabled={busyId === rep.id}
                    onClick={() => void toggleUserResolved(rep)}
                    style={{
                      backgroundColor: rep.resuelto ? "transparent" : "rgba(111,207,151,0.12)",
                      color: rep.resuelto ? "var(--color-outline)" : "#6fcf97",
                      border: `1px solid ${rep.resuelto ? "var(--color-divider)" : "rgba(111,207,151,0.35)"}`,
                      borderRadius: "8px",
                      padding: "8px 16px",
                      fontFamily: "'Manrope', sans-serif",
                      fontWeight: 600,
                      fontSize: "0.8rem",
                      cursor: busyId === rep.id ? "not-allowed" : "pointer",
                      opacity: busyId === rep.id ? 0.6 : 1,
                    }}
                  >
                    {busyId === rep.id ? "…" : rep.resuelto ? t("adminReportsToggleUndo") : t("adminReportsToggleResolve")}
                  </button>
                </article>
              ))}
            </div>
          )
        ) : contentRows!.length === 0 ? (
          <p style={{ color: "var(--color-outline)", fontFamily: "'Inter', sans-serif" }}>{t("adminContentReportsEmpty")}</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {contentRows!.map((rep) => {
              const c = rep.contenido;
              const href = c
                ? contenidoPath({
                    id: c.id,
                    jikan_id: c.jikan_id ?? undefined,
                    tipo: c.tipo === "MANGA" ? "MANGA" : "ANIME",
                  })
                : "#";
              return (
                <article
                  key={rep.id}
                  style={{
                    backgroundColor: "var(--color-surface-container-low)",
                    borderRadius: "12px",
                    border: `1px solid ${rep.resuelto ? "rgba(111,207,151,0.35)" : "var(--color-divider-strong)"}`,
                    padding: "16px 18px",
                  }}
                >
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center", marginBottom: "10px", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
                      <span
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: "10px",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          padding: "3px 8px",
                          borderRadius: "6px",
                          backgroundColor: rep.resuelto ? "rgba(111,207,151,0.15)" : "rgba(245,197,24,0.15)",
                          color: rep.resuelto ? "#6fcf97" : "#f5c518",
                        }}
                      >
                        {rep.resuelto ? t("adminReportsMarked") : t("adminReportsPending")}
                      </span>
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "var(--color-outline)" }}>
                        #{rep.id} · {rep.fecha ? new Date(rep.fecha).toLocaleString() : ""}
                      </span>
                    </div>
                    {c && (
                      <Link href={href} style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", color: "#64b5f6", textDecoration: "none", fontWeight: 600 }}>
                        {t("adminReportsOpen")}: {snippet(c.titulo ?? "", 80)}
                      </Link>
                    )}
                  </div>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.82rem", color: "var(--color-outline)", margin: "0 0 8px" }}>
                    <strong style={{ color: "var(--color-on-surface)" }}>{t("adminContentReportsSubject")}:</strong>{" "}
                    {c?.titulo ?? `contenido_id ${rep.contenido_id}`}
                    {c?.tipo ? ` (${c.tipo})` : ""} ·{" "}
                    <strong style={{ color: "var(--color-on-surface)" }}>{t("adminReportsReporter")}:</strong>{" "}
                    {rep.reporter?.nombre ?? `ID ${rep.reporter_id}`}
                  </p>
                  {rep.motivo && (
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", color: "var(--color-outline)", margin: "0 0 12px" }}>
                      <strong>{t("adminReportsReason")}:</strong> {rep.motivo}
                    </p>
                  )}
                  <button
                    type="button"
                    disabled={busyId === rep.id}
                    onClick={() => void toggleContentResolved(rep)}
                    style={{
                      backgroundColor: rep.resuelto ? "transparent" : "rgba(111,207,151,0.12)",
                      color: rep.resuelto ? "var(--color-outline)" : "#6fcf97",
                      border: `1px solid ${rep.resuelto ? "var(--color-divider)" : "rgba(111,207,151,0.35)"}`,
                      borderRadius: "8px",
                      padding: "8px 16px",
                      fontFamily: "'Manrope', sans-serif",
                      fontWeight: 600,
                      fontSize: "0.8rem",
                      cursor: busyId === rep.id ? "not-allowed" : "pointer",
                      opacity: busyId === rep.id ? 0.6 : 1,
                    }}
                  >
                    {busyId === rep.id ? "…" : rep.resuelto ? t("adminReportsToggleUndo") : t("adminReportsToggleResolve")}
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
