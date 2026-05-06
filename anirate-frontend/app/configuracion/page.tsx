"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  usersApi,
  authApi,
  pushApi,
  NOTIFICATION_TIPO_KEYS,
  type SessionInfo,
  type NotificationTipoKey,
  type TipoChannelGrid,
} from "@/services/api";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { useAuth } from "@/contexts/AuthContext";
import TwoFactorSection from "@/components/TwoFactorSection";
import OAuthAccountsSection from "@/components/OAuthAccountsSection";
import Avatar from "@/components/Avatar";

function parseUserAgent(ua: string | null): { device: string; browser: string; icon: string } {
  if (!ua) return { device: "Desconocido", browser: "", icon: "devices" };
  const isMobile = /Mobile|Android|iPhone|iPad/i.test(ua);
  const icon = isMobile ? "smartphone" : "computer";
  let device = "Desktop";
  if (/iPhone/i.test(ua)) device = "iPhone";
  else if (/iPad/i.test(ua)) device = "iPad";
  else if (/Android/i.test(ua)) device = "Android";
  else if (/Windows/i.test(ua)) device = "Windows";
  else if (/Mac OS X|Macintosh/i.test(ua)) device = "macOS";
  else if (/Linux/i.test(ua)) device = "Linux";
  let browser = "";
  if (/Edg\//i.test(ua)) browser = "Edge";
  else if (/Chrome\//i.test(ua)) browser = "Chrome";
  else if (/Firefox\//i.test(ua)) browser = "Firefox";
  else if (/Safari\//i.test(ua)) browser = "Safari";
  return { device, browser, icon };
}

function formatRelative(iso: string | null): string {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60_000) return "ahora mismo";
  if (diff < 3600_000) return `hace ${Math.floor(diff / 60_000)} min`;
  if (diff < 86400_000) return `hace ${Math.floor(diff / 3600_000)} h`;
  return `hace ${Math.floor(diff / 86400_000)} días`;
}

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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", color: "var(--color-outline)", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>
        {label}
      </label>
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
  transition: "border-color 0.2s",
};

function notifEmailAvailableForTipo(tipo: NotificationTipoKey): boolean {
  return tipo === "mencion_review" || tipo === "mencion_respuesta";
}

function notifTipoLabel(tipo: NotificationTipoKey, tr: (key: string) => string): string {
  switch (tipo) {
    case "voto_review":
      return tr("notifTipoVotoReview");
    case "nuevo_episodio":
      return tr("notifTipoNuevoEpisodio");
    case "lista_inicio":
      return tr("notifTipoListaInicio");
    case "mencion_review":
      return tr("notifTipoMencionReview");
    case "mencion_respuesta":
      return tr("notifTipoMencionRespuesta");
    default:
      return tipo;
  }
}

function ChannelCheckbox({
  checked,
  disabled,
  ariaLabel,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  ariaLabel: string;
  onChange: (v: boolean) => void;
}) {
  return (
    <input
      type="checkbox"
      checked={checked}
      disabled={disabled}
      aria-label={ariaLabel}
      onChange={(e) => onChange(e.target.checked)}
      style={{ width: "18px", height: "18px", accentColor: "#64b5f6", cursor: disabled ? "not-allowed" : "pointer" }}
    />
  );
}

function ToggleRow({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: "6px", cursor: "pointer" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          onClick={() => onChange(!checked)}
          style={{
            width: "40px", height: "22px", flexShrink: 0, borderRadius: "11px",
            border: "none", cursor: "pointer",
            backgroundColor: checked ? "#64b5f6" : "var(--color-surface-container-highest)",
            position: "relative",
            transition: "background 0.2s",
          }}
        >
          <span
            style={{
              position: "absolute", top: "3px", left: checked ? "20px" : "3px",
              width: "16px", height: "16px", borderRadius: "50%", backgroundColor: "var(--color-on-surface)",
              transition: "left 0.2s",
            }}
          />
        </button>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", color: "var(--color-on-surface)", lineHeight: 1.45 }}>
          {label}
        </span>
      </div>
      {hint && <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "var(--color-outline)", marginLeft: "52px" }}>{hint}</span>}
    </label>
  );
}

const DIGEST_TIMEZONE_IDS: string[] = [
  "UTC",
  "Europe/Madrid",
  "Europe/London",
  "America/Mexico_City",
  "America/Bogota",
  "America/Santiago",
  "America/Buenos_Aires",
  "America/New_York",
  "America/Sao_Paulo",
  "America/Los_Angeles",
  "Asia/Tokyo",
];

function digestTimezoneOptions(current: string): string[] {
  const c = current?.trim();
  const list = [...DIGEST_TIMEZONE_IDS];
  if (c && !list.includes(c)) list.unshift(c);
  return list;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function ConfiguracionPage() {
  const router = useRouter();
  const t = useTranslations("settings");
  const { isMobile } = useBreakpoint();
  const { user, login } = useAuth();

  const [nombre, setNombre] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [nombreLoading, setNombreLoading] = useState(false);
  const [nombreMsg, setNombreMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passLoading, setPassLoading] = useState(false);
  const [passMsg, setPassMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const [sessions, setSessions] = useState<SessionInfo[] | null>(null);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsMsg, setSessionsMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const [tipoChannels, setTipoChannels] = useState<TipoChannelGrid | null>(null);
  const [notifDigest, setNotifDigest] = useState(false);
  const [notifDigestTz, setNotifDigestTz] = useState("UTC");
  const [notifPushBrowser, setNotifPushBrowser] = useState(false);
  const [pushVapidConfigured, setPushVapidConfigured] = useState<boolean | null>(null);
  const [pushRegisterLoading, setPushRegisterLoading] = useState(false);
  const [pushRegisterMsg, setPushRegisterMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifMsg, setNotifMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const loadSessions = useCallback(async () => {
    setSessionsLoading(true);
    try {
      const data = await authApi.listSessions();
      setSessions(data);
    } catch (err) {
      setSessionsMsg({ type: "err", text: (err as Error).message });
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    const u = user;
    void Promise.resolve().then(() => {
      setNombre(u.nombre);
      void loadSessions();
    });
    usersApi.getMe().then((me) => {
      setBio(me.bio ?? "");
      setAvatarUrl(me.avatar_url ?? "");
      if (me.notification_prefs?.tipo_channels) {
        setTipoChannels(structuredClone(me.notification_prefs.tipo_channels));
      }
      setNotifDigest(me.notification_prefs?.email_weekly_digest ?? false);
      setNotifDigestTz(me.notification_prefs?.digest_timezone?.trim() || "UTC");
      setNotifPushBrowser(me.notification_prefs?.push_in_app_browser ?? false);
    }).catch(() => {});
    pushApi.getVapidPublicKey().then((v) => setPushVapidConfigured(v.configured)).catch(() => setPushVapidConfigured(false));
  }, [router, user, loadSessions]);

  useEffect(() => {
    if (!notifPushBrowser) {
      setTipoChannels((prev) => {
        if (!prev) return prev;
        const next = structuredClone(prev);
        for (const key of NOTIFICATION_TIPO_KEYS) {
          next[key].push = false;
        }
        return next;
      });
    }
  }, [notifPushBrowser]);

  async function handleRevokeSession(id: number) {
    setSessionsMsg(null);
    try {
      await authApi.revokeSession(id);
      await loadSessions();
      setSessionsMsg({ type: "ok", text: "Sesión revocada." });
    } catch (err) {
      setSessionsMsg({ type: "err", text: (err as Error).message });
    }
  }

  async function handleRevokeAllOthers() {
    if (!confirm("Esto cerrará la sesión en todos los demás dispositivos. ¿Continuar?")) return;
    setSessionsMsg(null);
    try {
      const res = await authApi.revokeAllOtherSessions();
      await loadSessions();
      setSessionsMsg({ type: "ok", text: `${res.count} sesión(es) cerradas.` });
    } catch (err) {
      setSessionsMsg({ type: "err", text: (err as Error).message });
    }
  }

  async function handleNombreSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const payload: { nombre?: string; bio?: string; avatar_url?: string } = {};
    if (nombre.trim() && nombre.trim() !== user.nombre) payload.nombre = nombre.trim();
    payload.bio = bio.trim();
    if (avatarUrl.trim()) payload.avatar_url = avatarUrl.trim();
    else payload.avatar_url = "";
    if (Object.keys(payload).length === 0) return;
    setNombreLoading(true);
    setNombreMsg(null);
    try {
      const res = await usersApi.updateMe(payload);
      login(res.access_token, res.refresh_token);
      setNombreMsg({ type: "ok", text: "Perfil actualizado correctamente." });
    } catch (err) {
      setNombreMsg({ type: "err", text: (err as Error).message });
    } finally {
      setNombreLoading(false);
    }
  }

  async function handleNotifSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !tipoChannels) return;
    setNotifLoading(true);
    setNotifMsg(null);
    try {
      const res = await usersApi.updateMe({
        notification_prefs: {
          email_mentions:
            tipoChannels.mencion_review.email &&
            tipoChannels.mencion_respuesta.email,
          email_weekly_digest: notifDigest,
          digest_timezone: notifDigestTz.trim() || "UTC",
          push_in_app_browser: notifPushBrowser,
          tipo_channels: tipoChannels,
        },
      });
      login(res.access_token, res.refresh_token);
      setNotifMsg({ type: "ok", text: t("notifSaved") });
    } catch (err) {
      setNotifMsg({ type: "err", text: (err as Error).message });
    } finally {
      setNotifLoading(false);
    }
  }

  async function handlePushRegister() {
    setPushRegisterMsg(null);
    if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      setPushRegisterMsg({ type: "err", text: t("pushUnsupported") });
      return;
    }
    setPushRegisterLoading(true);
    try {
      const vapid = await pushApi.getVapidPublicKey();
      if (!vapid.configured || !vapid.publicKey) {
        setPushRegisterMsg({ type: "err", text: t("pushServerOff") });
        return;
      }
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setPushRegisterMsg({ type: "err", text: t("pushDenied") });
        return;
      }
      const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      await reg.update();
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          vapid.publicKey,
        ) as BufferSource,
      });
      const json = sub.toJSON();
      const ep = json.endpoint;
      const key256 = json.keys?.p256dh;
      const auth = json.keys?.auth;
      if (!ep || !key256 || !auth) {
        setPushRegisterMsg({ type: "err", text: t("pushSubscribeFail") });
        return;
      }
      await pushApi.subscribe({ endpoint: ep, p256dh: key256, auth });
      setPushRegisterMsg({ type: "ok", text: t("pushRegistered") });
    } catch (err) {
      setPushRegisterMsg({ type: "err", text: (err as Error).message || t("pushSubscribeFail") });
    } finally {
      setPushRegisterLoading(false);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) return;
    if (newPassword !== confirmPassword) {
      setPassMsg({ type: "err", text: "Las contraseñas nuevas no coinciden." });
      return;
    }
    if (newPassword.length < 6) {
      setPassMsg({ type: "err", text: "La nueva contraseña debe tener al menos 6 caracteres." });
      return;
    }
    setPassLoading(true);
    setPassMsg(null);
    try {
      const res = await usersApi.updateMe({ currentPassword, newPassword });
      localStorage.setItem("token", res.access_token);
      if (res.refresh_token) localStorage.setItem("refresh_token", res.refresh_token);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPassMsg({ type: "ok", text: "Contraseña actualizada correctamente." });
    } catch (err) {
      setPassMsg({ type: "err", text: (err as Error).message });
    } finally {
      setPassLoading(false);
    }
  }

  if (!user) return null;

  const digestTzSel = notifDigestTz.trim() || "UTC";
  const digestTzOpts = digestTimezoneOptions(digestTzSel);

  return (
    <div style={{ backgroundColor: "var(--color-surface)", minHeight: "100vh", paddingTop: "64px" }}>
      <div style={{ maxWidth: "640px", margin: "0 auto", padding: isMobile ? "24px 16px" : "40px 24px", display: "flex", flexDirection: "column", gap: "24px" }}>
        <div>
          <h1 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "1.75rem", color: "var(--color-on-surface)", letterSpacing: "-0.02em" }}>
            Configuración
          </h1>
          <p style={{ fontFamily: "'Inter', sans-serif", color: "var(--color-outline)", fontSize: "0.875rem", marginTop: "4px" }}>
            {user.email}
          </p>
        </div>

        {/* Nombre / Bio / Avatar */}
        <Section title={t("profileInfo")}>
          <form onSubmit={handleNombreSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <Avatar name={nombre || user.nombre} userId={user.id} size={64} imageUrl={avatarUrl || null} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "var(--color-outline)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>Vista previa</p>
                <p style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, color: "var(--color-on-surface)", marginTop: "4px" }}>{nombre || user.nombre}</p>
              </div>
            </div>
            <Field label="Nombre de usuario">
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#f5c518")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-divider-strong)")}
              />
            </Field>
            <Field label="Correo electrónico">
              <input
                type="text"
                value={user.email}
                disabled
                style={{ ...inputStyle, color: "var(--color-outline-variant)", cursor: "not-allowed" }}
              />
            </Field>
            <Field label="URL de avatar (https://…)">
              <input
                type="url"
                value={avatarUrl}
                placeholder="https://ejemplo.com/avatar.jpg"
                onChange={(e) => setAvatarUrl(e.target.value)}
                style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#f5c518")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-divider-strong)")}
              />
            </Field>
            <Field label={`Biografía (${bio.length}/280)`}>
              <textarea
                value={bio}
                maxLength={280}
                rows={3}
                placeholder="Cuéntale a la comunidad sobre ti..."
                onChange={(e) => setBio(e.target.value)}
                style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#f5c518")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-divider-strong)")}
              />
            </Field>
            {nombreMsg && (
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", color: nombreMsg.type === "ok" ? "#6fcf97" : "#e05c5c" }}>
                {nombreMsg.text}
              </p>
            )}
            <button
              type="submit"
              disabled={nombreLoading || !nombre.trim()}
              style={{
                alignSelf: "flex-start",
                backgroundColor: "#f5c518", color: "#3d2f00",
                border: "none", borderRadius: "8px", padding: "10px 24px",
                fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.875rem",
                cursor: nombreLoading || !nombre.trim() ? "not-allowed" : "pointer",
                opacity: nombreLoading || !nombre.trim() ? 0.5 : 1,
                transition: "opacity 0.2s",
              }}
            >
              {nombreLoading ? "Guardando..." : "Guardar cambios"}
            </button>
          </form>
        </Section>

        <Section title={t("notifTitle")}>
          <form onSubmit={handleNotifSave} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", color: "var(--color-outline)", margin: 0, lineHeight: 1.5 }}>
              {t("notifPerTypeHint")}
            </p>
            {tipoChannels ? (
              <div style={{ overflowX: "auto", border: "1px solid var(--color-divider)", borderRadius: "8px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'Inter', sans-serif", fontSize: "0.78rem" }}>
                  <thead>
                    <tr style={{ backgroundColor: "var(--color-surface)" }}>
                      <th style={{ textAlign: "left", padding: "10px 12px", color: "var(--color-outline)", fontWeight: 600 }}>{t("notifColTipo")}</th>
                      <th style={{ textAlign: "center", padding: "10px 8px", color: "var(--color-outline)", fontWeight: 600 }}>{t("notifColInApp")}</th>
                      <th style={{ textAlign: "center", padding: "10px 8px", color: "var(--color-outline)", fontWeight: 600 }}>{t("notifColEmail")}</th>
                      <th style={{ textAlign: "center", padding: "10px 8px", color: "var(--color-outline)", fontWeight: 600 }}>{t("notifColPush")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {NOTIFICATION_TIPO_KEYS.map((tipo) => (
                      <tr key={tipo} style={{ borderTop: "1px solid var(--color-divider)" }}>
                        <td style={{ padding: "10px 12px", color: "var(--color-on-surface)", fontWeight: 600 }}>{notifTipoLabel(tipo, t)}</td>
                        <td style={{ textAlign: "center", padding: "8px" }}>
                          <ChannelCheckbox
                            checked={tipoChannels[tipo].in_app}
                            ariaLabel={`${notifTipoLabel(tipo, t)} — ${t("notifColInApp")}`}
                            onChange={(v) =>
                              setTipoChannels((prev) => {
                                if (!prev) return prev;
                                const n = structuredClone(prev);
                                n[tipo].in_app = v;
                                return n;
                              })}
                          />
                        </td>
                        <td style={{ textAlign: "center", padding: "8px" }}>
                          {notifEmailAvailableForTipo(tipo) ? (
                            <ChannelCheckbox
                              checked={tipoChannels[tipo].email}
                              ariaLabel={`${notifTipoLabel(tipo, t)} — ${t("notifColEmail")}`}
                              onChange={(v) =>
                                setTipoChannels((prev) => {
                                  if (!prev) return prev;
                                  const n = structuredClone(prev);
                                  n[tipo].email = v;
                                  return n;
                                })}
                            />
                          ) : (
                            <span style={{ color: "var(--color-outline-variant)" }} aria-hidden>—</span>
                          )}
                        </td>
                        <td style={{ textAlign: "center", padding: "8px" }}>
                          <ChannelCheckbox
                            checked={tipoChannels[tipo].push}
                            disabled={!notifPushBrowser}
                            ariaLabel={`${notifTipoLabel(tipo, t)} — ${t("notifColPush")}`}
                            onChange={(v) =>
                              setTipoChannels((prev) => {
                                if (!prev) return prev;
                                const n = structuredClone(prev);
                                n[tipo].push = v;
                                return n;
                              })}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", color: "var(--color-outline)" }}>…</p>
            )}
            <ToggleRow checked={notifDigest} onChange={setNotifDigest} label={t("notifDigestLabel")} hint={t("notifDigestHint")} />
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <Field label={t("notifDigestTimezoneLabel")}>
                <select
                  value={digestTzSel}
                  onChange={(e) => setNotifDigestTz(e.target.value)}
                  style={{ ...inputStyle, cursor: "pointer", maxWidth: "320px" }}
                >
                  {digestTzOpts.map((id) => (
                    <option key={id} value={id}>
                      {id}
                    </option>
                  ))}
                </select>
              </Field>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "var(--color-outline)", paddingLeft: "2px" }}>
                {t("notifDigestTimezoneHint")}
              </span>
            </div>
            <ToggleRow
              checked={notifPushBrowser}
              onChange={setNotifPushBrowser}
              label={t("pushBrowserLabel")}
              hint={t("pushBrowserHint")}
            />
            {pushVapidConfigured === false && (
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "var(--color-outline)", margin: 0 }}>
                {t("pushServerOffHint")}
              </p>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-start" }}>
              <button
                type="button"
                disabled={pushRegisterLoading || !notifPushBrowser || pushVapidConfigured === false}
                onClick={() => void handlePushRegister()}
                style={{
                  backgroundColor: "rgba(100,181,246,0.15)",
                  color: "#64b5f6",
                  border: "1px solid rgba(100,181,246,0.45)",
                  borderRadius: "8px",
                  padding: "10px 18px",
                  fontFamily: "'Manrope', sans-serif",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  cursor: pushRegisterLoading || !notifPushBrowser || pushVapidConfigured === false ? "not-allowed" : "pointer",
                  opacity: pushRegisterLoading || !notifPushBrowser || pushVapidConfigured === false ? 0.45 : 1,
                }}
              >
                {pushRegisterLoading ? "…" : t("pushRegisterButton")}
              </button>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "var(--color-outline)", lineHeight: 1.45 }}>
                {t("pushRegisterHint")}
              </span>
              {pushRegisterMsg && (
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", color: pushRegisterMsg.type === "ok" ? "#6fcf97" : "#e05c5c", margin: 0 }}>
                  {pushRegisterMsg.text}
                </p>
              )}
            </div>
            {notifMsg && (
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", color: notifMsg.type === "ok" ? "#6fcf97" : "#e05c5c" }}>
                {notifMsg.text}
              </p>
            )}
            <button
              type="submit"
              disabled={notifLoading || !tipoChannels}
              style={{
                alignSelf: "flex-start",
                backgroundColor: "#f5c518", color: "#3d2f00",
                border: "none", borderRadius: "8px", padding: "10px 24px",
                fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.875rem",
                cursor: notifLoading || !tipoChannels ? "not-allowed" : "pointer",
                opacity: notifLoading || !tipoChannels ? 0.5 : 1,
              }}
            >
              {notifLoading ? "…" : t("notifSave")}
            </button>
          </form>
        </Section>

        {user.tipo === "admin" && (
          <Section title={t("adminReports")}>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.85rem", color: "var(--color-outline)", marginBottom: "12px", lineHeight: 1.5 }}>
              {t("adminReportsSubtitle")}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              <Link
                href="/admin/reportes"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 18px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(100,181,246,0.12)",
                  border: "1px solid rgba(100,181,246,0.35)",
                  color: "#64b5f6",
                  textDecoration: "none",
                  fontFamily: "'Manrope', sans-serif",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                }}
              >
                <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "18px" }}>gavel</span>
                {t("adminReportsMenu")}
              </Link>
              <Link
                href="/admin/usuarios"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 18px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(245,197,24,0.08)",
                  border: "1px solid rgba(245,197,24,0.35)",
                  color: "#f5c518",
                  textDecoration: "none",
                  fontFamily: "'Manrope', sans-serif",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                }}
              >
                <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "18px" }}>manage_accounts</span>
                {t("adminUsersMenu")}
              </Link>
              <Link
                href="/admin/mail"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 18px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(129,199,132,0.1)",
                  border: "1px solid rgba(129,199,132,0.45)",
                  color: "#81c784",
                  textDecoration: "none",
                  fontFamily: "'Manrope', sans-serif",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                }}
              >
                <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "18px" }}>analytics</span>
                {t("adminMailMenu")}
              </Link>
              <Link
                href="/admin/auditoria"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 18px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(147,112,219,0.1)",
                  border: "1px solid rgba(147,112,219,0.4)",
                  color: "#b39ddb",
                  textDecoration: "none",
                  fontFamily: "'Manrope', sans-serif",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                }}
              >
                <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "18px" }}>history</span>
                {t("adminAuditMenu")}
              </Link>
            </div>
          </Section>
        )}

        {/* Contraseña */}
        <Section title={t("changePassword")}>
          <form onSubmit={handlePasswordSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <Field label="Contraseña actual">
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#f5c518")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-divider-strong)")}
              />
            </Field>
            <Field label="Nueva contraseña">
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#f5c518")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-divider-strong)")}
              />
            </Field>
            <Field label="Confirmar nueva contraseña">
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#f5c518")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-divider-strong)")}
              />
            </Field>
            {passMsg && (
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", color: passMsg.type === "ok" ? "#6fcf97" : "#e05c5c" }}>
                {passMsg.text}
              </p>
            )}
            <button
              type="submit"
              disabled={passLoading || !currentPassword || !newPassword || !confirmPassword}
              style={{
                alignSelf: "flex-start",
                backgroundColor: "#f5c518", color: "#3d2f00",
                border: "none", borderRadius: "8px", padding: "10px 24px",
                fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.875rem",
                cursor: passLoading || !currentPassword || !newPassword || !confirmPassword ? "not-allowed" : "pointer",
                opacity: passLoading || !currentPassword || !newPassword || !confirmPassword ? 0.5 : 1,
                transition: "opacity 0.2s",
              }}
            >
              {passLoading ? "Actualizando..." : "Cambiar contraseña"}
            </button>
          </form>
        </Section>

        {/* Sesiones activas */}
        <Section title={t("connectedDevices")}>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.85rem", color: "var(--color-outline)", marginBottom: "16px" }}>
            Sesiones activas en tu cuenta. Revoca cualquier dispositivo que no reconozcas.
          </p>
          {sessionsLoading && !sessions ? (
            <p style={{ color: "var(--color-outline)", fontFamily: "'Inter', sans-serif", fontSize: "0.85rem" }}>Cargando...</p>
          ) : (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {sessions?.map((s) => {
                  const { device, browser, icon } = parseUserAgent(s.user_agent);
                  return (
                    <div key={s.id} style={{
                      display: "flex", alignItems: "center", gap: "14px",
                      padding: "12px 14px", borderRadius: "10px",
                      backgroundColor: s.current ? "var(--color-primary-soft)" : "var(--color-surface-container)",
                      border: `1px solid ${s.current ? "#f5c518" : "var(--color-divider)"}`,
                    }}>
                      <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "24px", color: s.current ? "#f5c518" : "var(--color-outline)" }}>{icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.9rem", color: "var(--color-on-surface)", margin: 0 }}>
                          {device}{browser ? ` · ${browser}` : ""}
                          {s.current && <span style={{ marginLeft: "8px", fontSize: "0.7rem", color: "#f5c518", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Actual</span>}
                        </p>
                        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "var(--color-outline)", margin: "2px 0 0" }}>
                          {s.ip ?? "IP desconocida"} · Última actividad {formatRelative(s.last_used_at)}
                        </p>
                      </div>
                      {!s.current && (
                        <button onClick={() => handleRevokeSession(s.id)}
                          style={{ background: "none", border: "1px solid var(--color-divider-strong)", borderRadius: "6px", padding: "6px 12px", color: "#e05c5c", cursor: "pointer", fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", fontWeight: 600 }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(224,92,92,0.08)")}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                        >
                          Revocar
                        </button>
                      )}
                    </div>
                  );
                })}
                {sessions?.length === 0 && (
                  <p style={{ color: "var(--color-outline)", fontFamily: "'Inter', sans-serif", fontSize: "0.85rem" }}>No hay sesiones activas.</p>
                )}
              </div>
              {sessionsMsg && (
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", color: sessionsMsg.type === "ok" ? "#6fcf97" : "#e05c5c", marginTop: "12px" }}>
                  {sessionsMsg.text}
                </p>
              )}
              {(sessions?.length ?? 0) > 1 && (
                <button onClick={handleRevokeAllOthers}
                  style={{ marginTop: "16px", alignSelf: "flex-start", background: "transparent", border: "1px solid var(--color-divider-strong)", borderRadius: "8px", padding: "10px 20px", color: "var(--color-on-surface-variant)", cursor: "pointer", fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: "0.85rem" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#f5c518"; e.currentTarget.style.color = "#f5c518"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--color-divider-strong)"; e.currentTarget.style.color = "var(--color-on-surface-variant)"; }}
                >
                  Cerrar todas las demás sesiones
                </button>
              )}
            </>
          )}
        </Section>

        <TwoFactorSection />

        <OAuthAccountsSection />

        {/* Zona de peligro */}
        <Section title={t("session")}>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", color: "var(--color-outline)", marginBottom: "16px" }}>
            Cerrar sesión en este dispositivo.
          </p>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              router.push("/login");
            }}
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              backgroundColor: "transparent",
              border: "1px solid rgba(224,92,92,0.3)",
              borderRadius: "8px", padding: "10px 20px",
              color: "#e05c5c", cursor: "pointer",
              fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: "0.875rem",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(224,92,92,0.08)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "17px" }}>logout</span>
            Cerrar sesión
          </button>
        </Section>
      </div>
    </div>
  );
}
