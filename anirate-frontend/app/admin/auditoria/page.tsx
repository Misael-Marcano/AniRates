"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { usersApi, type ModeracionLogRow } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

function metaLine(meta: Record<string, unknown> | null | undefined): string {
  if (!meta || Object.keys(meta).length === 0) return "—";
  try {
    return JSON.stringify(meta);
  } catch {
    return "—";
  }
}

export default function AdminAuditoriaPage() {
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();
  const t = useTranslations("settings");
  const tc = useTranslations("common");
  const [rows, setRows] = useState<ModeracionLogRow[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    if (user?.tipo !== "admin") {
      router.replace("/");
      return;
    }
    usersApi
      .listModeracionLog()
      .then(setRows)
      .catch(() => setErr(t("adminAuditLoadErr")));
  }, [isLoggedIn, user?.tipo, router, t]);

  if (!user || user.tipo !== "admin") return null;

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "var(--color-surface)", paddingTop: "80px", paddingBottom: "48px" }}>
      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "0 24px" }}>
        <div style={{ marginBottom: "24px" }}>
          <Link href="/configuracion" style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", color: "#64b5f6", textDecoration: "none" }}>
            ← {tc("back")}
          </Link>
          <h1 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "1.75rem", color: "var(--color-on-surface)", margin: "16px 0 8px", letterSpacing: "-0.02em" }}>
            {t("adminAuditTitle")}
          </h1>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.88rem", color: "var(--color-outline)", margin: 0 }}>
            {t("adminAuditSubtitle")}
          </p>
        </div>

        {err && (
          <p role="alert" style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.85rem", color: "#e05c5c", marginBottom: "16px" }}>
            {err}
          </p>
        )}

        {rows === null ? (
          <p style={{ color: "var(--color-outline)", fontFamily: "'Inter', sans-serif" }}>{tc("loading")}</p>
        ) : rows.length === 0 ? (
          <p style={{ color: "var(--color-outline)", fontFamily: "'Inter', sans-serif" }}>{t("adminAuditEmpty")}</p>
        ) : (
          <div style={{ overflowX: "auto", borderRadius: "12px", border: "1px solid var(--color-divider-strong)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'Inter', sans-serif", fontSize: "0.8rem" }}>
              <thead>
                <tr style={{ backgroundColor: "var(--color-surface-container-low)", textAlign: "left" }}>
                  <th style={{ padding: "10px 12px", color: "var(--color-outline)", fontWeight: 600 }}>{t("adminAuditColWhen")}</th>
                  <th style={{ padding: "10px 12px", color: "var(--color-outline)", fontWeight: 600 }}>{t("adminAuditColAdmin")}</th>
                  <th style={{ padding: "10px 12px", color: "var(--color-outline)", fontWeight: 600 }}>{t("adminAuditColAction")}</th>
                  <th style={{ padding: "10px 12px", color: "var(--color-outline)", fontWeight: 600 }}>{t("adminAuditColEntity")}</th>
                  <th style={{ padding: "10px 12px", color: "var(--color-outline)", fontWeight: 600 }}>{t("adminAuditColDetail")}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} style={{ borderTop: "1px solid var(--color-divider)" }}>
                    <td style={{ padding: "10px 12px", color: "var(--color-on-surface-variant)", whiteSpace: "nowrap" }}>
                      {row.fecha ? new Date(row.fecha).toLocaleString() : "—"}
                    </td>
                    <td style={{ padding: "10px 12px", color: "var(--color-on-surface)" }}>
                      {row.admin?.nombre ?? `ID ${row.admin_id}`}
                    </td>
                    <td style={{ padding: "10px 12px", color: "var(--color-on-surface)" }}>
                      {t(`adminAuditAct.${row.accion}` as Parameters<typeof t>[0])}
                    </td>
                    <td style={{ padding: "10px 12px", color: "var(--color-outline)", fontSize: "0.76rem" }}>
                      {row.entidad_tipo ?? "—"}
                      {row.entidad_id != null ? ` #${row.entidad_id}` : ""}
                    </td>
                    <td style={{ padding: "10px 12px", color: "var(--color-outline)", fontSize: "0.72rem", wordBreak: "break-word", maxWidth: "280px" }}>
                      {metaLine(row.metadata)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
