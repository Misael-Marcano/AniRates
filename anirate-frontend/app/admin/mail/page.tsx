"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  usersApi,
  type JikanProxyMetricsSnapshot,
  type MailMetricsSnapshot,
} from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div
      style={{
        padding: "16px 18px",
        borderRadius: "12px",
        border: "1px solid var(--color-divider-strong)",
        backgroundColor: "var(--color-surface-container-low)",
      }}
    >
      <p
        style={{
          margin: "0 0 8px",
          fontFamily: "'Inter', sans-serif",
          fontSize: "0.72rem",
          fontWeight: 600,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "var(--color-outline)",
        }}
      >
        {label}
      </p>
      <p
        style={{
          margin: 0,
          fontFamily: "'Manrope', sans-serif",
          fontWeight: 800,
          fontSize: "1.35rem",
          color: "var(--color-on-surface)",
        }}
      >
        {value}
      </p>
    </div>
  );
}

export default function AdminMailPage() {
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();
  const t = useTranslations("settings");
  const tc = useTranslations("common");
  const [snap, setSnap] = useState<MailMetricsSnapshot | null>(null);
  const [jikanSnap, setJikanSnap] = useState<JikanProxyMetricsSnapshot | null>(null);
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
    Promise.all([usersApi.getAdminMailMetrics(), usersApi.getAdminJikanProxyMetrics()])
      .then(([mail, jikan]) => {
        setSnap(mail);
        setJikanSnap(jikan);
      })
      .catch(() => setErr(t("adminMailLoadErr")));
  }, [isLoggedIn, user?.tipo, router, t]);

  if (!user || user.tipo !== "admin") return null;

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--color-surface)",
        paddingTop: "80px",
        paddingBottom: "48px",
      }}
    >
      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "0 24px" }}>
        <div style={{ marginBottom: "24px" }}>
          <Link
            href="/configuracion"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.8rem",
              color: "#64b5f6",
              textDecoration: "none",
            }}
          >
            ← {tc("back")}
          </Link>
          <h1
            style={{
              fontFamily: "'Manrope', sans-serif",
              fontWeight: 800,
              fontSize: "1.75rem",
              color: "var(--color-on-surface)",
              margin: "16px 0 8px",
              letterSpacing: "-0.02em",
            }}
          >
            {t("adminMailTitle")}
          </h1>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.88rem",
              color: "var(--color-outline)",
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            {t("adminMailSubtitle")}
          </p>
        </div>

        {err && (
          <p
            role="alert"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.85rem",
              color: "#e05c5c",
              marginBottom: "16px",
            }}
          >
            {err}
          </p>
        )}

        {snap === null || jikanSnap === null ? (
          <p
            style={{
              color: "var(--color-outline)",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {tc("loading")}
          </p>
        ) : (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                gap: "14px",
                marginBottom: "20px",
              }}
            >
              <MetricCard label={t("adminMailSmtpAttempts")} value={snap.smtp_attempts} />
              <MetricCard label={t("adminMailSmtpOk")} value={snap.smtp_delivered} />
              <MetricCard label={t("adminMailSmtpFail")} value={snap.smtp_failed} />
              <MetricCard
                label={t("adminMailSmtpSkippedSuppressed")}
                value={snap.smtp_skipped_suppressed}
              />
              <MetricCard label={t("adminMailConsole")} value={snap.console_only} />
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                gap: "14px",
                marginBottom: "20px",
              }}
            >
              <MetricCard label={t("adminMailWebhookEvents")} value={snap.webhook_events} />
              <MetricCard
                label={t("adminMailWebhookDelivered")}
                value={snap.webhook_delivered_events}
              />
              <MetricCard
                label={t("adminMailWebhookSuppressNew")}
                value={snap.webhook_suppressions_new}
              />
              <MetricCard
                label={t("adminMailWebhookSuppressDup")}
                value={snap.webhook_suppressions_duplicate}
              />
              <MetricCard
                label={t("adminMailWebhookUnknown")}
                value={snap.webhook_unknown_recipient}
              />
              <MetricCard
                label={t("adminMailWebhookSoftBounce")}
                value={snap.webhook_soft_bounce_skipped}
              />
            </div>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.82rem",
                color: "var(--color-outline)",
                margin: "0 0 8px",
              }}
            >
              <strong>{t("adminMailLastErr")}:</strong>{" "}
              {snap.last_failure_message ?? "—"}
            </p>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.82rem",
                color: "var(--color-outline)",
                margin: 0,
              }}
            >
              <strong>{t("adminMailUpdated")}:</strong>{" "}
              {snap.updated_at ? new Date(snap.updated_at).toLocaleString() : "—"}
            </p>

            <h2
              style={{
                fontFamily: "'Manrope', sans-serif",
                fontWeight: 800,
                fontSize: "1.25rem",
                color: "var(--color-on-surface)",
                margin: "40px 0 8px",
                letterSpacing: "-0.02em",
              }}
            >
              {t("adminJikanSectionTitle")}
            </h2>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.88rem",
                color: "var(--color-outline)",
                margin: "0 0 16px",
                lineHeight: 1.5,
              }}
            >
              {t("adminJikanSectionSubtitle")}
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                gap: "14px",
                marginBottom: "20px",
              }}
            >
              <MetricCard label={t("adminJikanProxyRequests")} value={jikanSnap.proxy_requests} />
              <MetricCard label={t("adminJikanCacheHits")} value={jikanSnap.cache_hits} />
              <MetricCard label={t("adminJikanCacheMisses")} value={jikanSnap.cache_misses} />
              <MetricCard label={t("adminJikanHttp200")} value={jikanSnap.http_200} />
              <MetricCard label={t("adminJikanHttp429")} value={jikanSnap.http_429} />
              <MetricCard label={t("adminJikanHttp4xx")} value={jikanSnap.http_4xx_other} />
              <MetricCard label={t("adminJikanHttp5xx")} value={jikanSnap.http_5xx} />
              <MetricCard
                label={t("adminJikanClientThrottle")}
                value={jikanSnap.client_throttle_429}
              />
              <MetricCard
                label={t("adminJikanInvalidPath")}
                value={jikanSnap.client_invalid_path_400}
              />
              <MetricCard
                label={t("adminJikanHandlerErrors")}
                value={jikanSnap.proxy_handler_errors}
              />
            </div>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.82rem",
                color: "var(--color-outline)",
                margin: 0,
              }}
            >
              <strong>{t("adminMailUpdated")}:</strong>{" "}
              {jikanSnap.updated_at ? new Date(jikanSnap.updated_at).toLocaleString() : "—"}
            </p>
          </>
        )}
      </div>
    </main>
  );
}
