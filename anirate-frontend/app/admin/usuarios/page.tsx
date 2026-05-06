"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { usersApi, type AdminUserLookupRow } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();
  const t = useTranslations("settings");
  const tc = useTranslations("common");
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [rows, setRows] = useState<AdminUserLookupRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState<null | { userId: number; kind: "shadow" | "ban" }>(null);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedQ(q.trim()), 350);
    return () => clearTimeout(id);
  }, [q]);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    if (user?.tipo !== "admin") {
      router.replace("/");
      return;
    }
    if (debouncedQ.length < 2) {
      setRows([]);
      setErr(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setErr(null);
    usersApi
      .adminLookupUsers(debouncedQ)
      .then(setRows)
      .catch(() => setErr(t("adminUsersLoadErr")))
      .finally(() => setLoading(false));
  }, [isLoggedIn, user?.tipo, router, debouncedQ, t]);

  async function toggleShadowban(row: AdminUserLookupRow) {
    if (row.banned) return;
    setBusy({ userId: row.id, kind: "shadow" });
    setErr(null);
    try {
      const next = !row.shadowbanned;
      await usersApi.setUserShadowban(row.id, next);
      setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, shadowbanned: next } : r)));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(null);
    }
  }

  async function toggleBan(row: AdminUserLookupRow) {
    const next = !row.banned;
    if (next && !window.confirm(t("adminUsersBanConfirm"))) return;
    setBusy({ userId: row.id, kind: "ban" });
    setErr(null);
    try {
      await usersApi.setUserBanned(row.id, next);
      setRows((prev) =>
        prev.map((r) =>
          r.id === row.id
            ? { ...r, banned: next, shadowbanned: next ? false : r.shadowbanned }
            : r,
        ),
      );
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(null);
    }
  }

  if (!user || user.tipo !== "admin") return null;

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "var(--color-surface)", paddingTop: "80px", paddingBottom: "48px" }}>
      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "0 24px" }}>
        <div style={{ marginBottom: "24px" }}>
          <Link href="/configuracion" style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", color: "#64b5f6", textDecoration: "none" }}>
            ← {tc("back")}
          </Link>
          <h1 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "1.75rem", color: "var(--color-on-surface)", margin: "16px 0 8px", letterSpacing: "-0.02em" }}>
            {t("adminUsersTitle")}
          </h1>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.88rem", color: "var(--color-outline)", margin: 0 }}>
            {t("adminUsersSubtitle")}
          </p>
        </div>

        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("adminUsersSearchPlaceholder")}
          autoComplete="off"
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "12px 14px",
            borderRadius: "10px",
            border: "1px solid var(--color-divider-strong)",
            backgroundColor: "var(--color-surface-container-low)",
            color: "var(--color-on-surface)",
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.9rem",
            marginBottom: "20px",
          }}
        />

        {err && (
          <p role="alert" style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.85rem", color: "#e05c5c", marginBottom: "16px" }}>
            {err}
          </p>
        )}

        {debouncedQ.length >= 2 && loading ? (
          <p style={{ color: "var(--color-outline)", fontFamily: "'Inter', sans-serif" }}>{tc("loading")}</p>
        ) : debouncedQ.length >= 2 && rows.length === 0 ? (
          <p style={{ color: "var(--color-outline)", fontFamily: "'Inter', sans-serif" }}>{t("adminUsersEmpty")}</p>
        ) : debouncedQ.length < 2 ? (
          <p style={{ color: "var(--color-outline)", fontFamily: "'Inter', sans-serif" }}>{t("adminUsersHintMinChars")}</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
            {rows.map((row) => {
              const rowBusy = busy?.userId === row.id;
              const accentBanned = row.banned;
              const accentShadow = row.shadowbanned && !row.banned;
              return (
                <li
                  key={row.id}
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                    padding: "14px 16px",
                    borderRadius: "12px",
                    border: `1px solid ${
                      accentBanned
                        ? "rgba(139,0,0,0.45)"
                        : accentShadow
                          ? "rgba(224,92,92,0.35)"
                          : "var(--color-divider-strong)"
                    }`,
                    backgroundColor: "var(--color-surface-container-low)",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0 }}>
                    <span style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, color: "var(--color-on-surface)", fontSize: "0.95rem" }}>
                      {row.nombre}
                    </span>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "var(--color-outline)" }}>
                      ID {row.id}
                      {row.banned ? ` · ${t("adminUsersBadgeBanned")}` : ""}
                      {row.shadowbanned && !row.banned ? ` · ${t("adminUsersBadgeShadow")}` : ""}
                    </span>
                    <Link href={`/usuario/${row.id}`} style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", color: "#64b5f6", textDecoration: "none", fontWeight: 600 }}>
                      {t("adminUserReportsOpenProfile")}
                    </Link>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "stretch" }}>
                    <button
                      type="button"
                      disabled={rowBusy || row.banned}
                      onClick={() => void toggleShadowban(row)}
                      style={{
                        padding: "8px 14px",
                        borderRadius: "8px",
                        border: `1px solid ${row.shadowbanned ? "rgba(111,207,151,0.35)" : "rgba(224,92,92,0.35)"}`,
                        backgroundColor: row.shadowbanned ? "rgba(111,207,151,0.1)" : "rgba(224,92,92,0.08)",
                        color: row.shadowbanned ? "#6fcf97" : "#e05c5c",
                        fontFamily: "'Manrope', sans-serif",
                        fontWeight: 600,
                        fontSize: "0.8rem",
                        cursor: rowBusy || row.banned ? "not-allowed" : "pointer",
                        opacity: rowBusy || row.banned ? 0.5 : 1,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {rowBusy && busy?.kind === "shadow" ? "…" : row.shadowbanned ? t("adminUsersUnshadowban") : t("adminUsersShadowban")}
                    </button>
                    <button
                      type="button"
                      disabled={rowBusy}
                      onClick={() => void toggleBan(row)}
                      style={{
                        padding: "8px 14px",
                        borderRadius: "8px",
                        border: `1px solid ${row.banned ? "rgba(111,207,151,0.35)" : "rgba(139,0,0,0.45)"}`,
                        backgroundColor: row.banned ? "rgba(111,207,151,0.1)" : "rgba(139,0,0,0.12)",
                        color: row.banned ? "#6fcf97" : "#ff8a80",
                        fontFamily: "'Manrope', sans-serif",
                        fontWeight: 600,
                        fontSize: "0.8rem",
                        cursor: rowBusy ? "wait" : "pointer",
                        opacity: rowBusy ? 0.65 : 1,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {rowBusy && busy?.kind === "ban" ? "…" : row.banned ? t("adminUsersUnban") : t("adminUsersBan")}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
