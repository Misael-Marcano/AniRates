"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { socialApi, reviewsApi, usersApi, type PublicProfile, type Badge } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import Avatar from "@/components/Avatar";
import ReviewMarkdown from "@/components/ReviewMarkdown";
import ReviewImagesGallery from "@/components/ReviewImagesGallery";
import type { Review } from "@/types";

type Tab = "resumen" | "reviews" | "seguidores" | "siguiendo";

function StatBlock({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "0 14px" }}>
      <span style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "1.4rem", color: "var(--color-on-surface)", lineHeight: 1 }}>
        {value.toLocaleString("es-ES")}
      </span>
      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "var(--color-outline)", marginTop: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </span>
    </div>
  );
}

export default function PerfilPublicoPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const tp = useTranslations("profile");
  const { isLoggedIn } = useAuth();
  const { isMobile } = useBreakpoint();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("resumen");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [followers, setFollowers] = useState<{ id: number; nombre: string }[]>([]);
  const [following, setFollowing] = useState<{ id: number; nombre: string }[]>([]);
  const [following_loading, setFollowingLoading] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportMotivo, setReportMotivo] = useState("");
  const [reportBusy, setReportBusy] = useState(false);
  const [reportMsg, setReportMsg] = useState<{ ok?: boolean; text: string } | null>(null);

  const userId = Number(id);

  useEffect(() => {
    socialApi.getProfile(userId)
      .then((p) => {
        setProfile(p);
        if (p.isSelf) router.replace("/perfil");
      })
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
    usersApi.getBadges(userId).then(setBadges).catch(() => setBadges([]));
  }, [userId, router]);

  useEffect(() => {
    if (tab === "reviews" && reviews.length === 0) {
      reviewsApi.getByUser(userId).then(setReviews).catch(() => {});
    }
    if (tab === "seguidores" && followers.length === 0) {
      socialApi.getFollowers(userId).then(setFollowers).catch(() => {});
    }
    if (tab === "siguiendo" && following.length === 0) {
      socialApi.getFollowing(userId).then(setFollowing).catch(() => {});
    }
  }, [tab, userId, reviews.length, followers.length, following.length]);

  async function handleFollowToggle() {
    if (!isLoggedIn) { router.push("/login"); return; }
    if (!profile) return;
    setFollowingLoading(true);
    try {
      if (profile.isFollowing) {
        await socialApi.unfollow(userId);
        setProfile({ ...profile, isFollowing: false, stats: { ...profile.stats, seguidores: profile.stats.seguidores - 1 } });
      } else {
        await socialApi.follow(userId);
        setProfile({ ...profile, isFollowing: true, stats: { ...profile.stats, seguidores: profile.stats.seguidores + 1 } });
      }
    } catch { /* ignore */ }
    finally { setFollowingLoading(false); }
  }

  function openReportModal() {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    setReportMotivo("");
    setReportMsg(null);
    setReportOpen(true);
  }

  async function submitReport() {
    setReportBusy(true);
    setReportMsg(null);
    try {
      await usersApi.reportUser(userId, reportMotivo.trim() || undefined);
      setReportMsg({ ok: true, text: tp("reportUserThanks") });
      setReportMotivo("");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error";
      setReportMsg({ ok: false, text: msg });
    } finally {
      setReportBusy(false);
    }
  }

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", backgroundColor: "var(--color-surface)", paddingTop: "120px", textAlign: "center" }}>
        <p style={{ color: "var(--color-outline)", fontFamily: "'Inter', sans-serif" }}>Cargando perfil...</p>
      </main>
    );
  }

  if (!profile) {
    return (
      <main style={{ minHeight: "100vh", backgroundColor: "var(--color-surface)", paddingTop: "120px", textAlign: "center" }}>
        <p style={{ color: "var(--color-on-surface)", fontFamily: "'Manrope', sans-serif", fontWeight: 700 }}>Usuario no encontrado</p>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "var(--color-surface)", paddingTop: "80px", paddingBottom: "60px" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: `0 ${isMobile ? "16px" : "32px"}` }}>

        {/* Header */}
        <div style={{ backgroundColor: "var(--color-surface-container-low)", borderRadius: "16px", border: "1px solid var(--color-divider-strong)", padding: isMobile ? "24px" : "32px", marginBottom: profile.bio ? "20px" : "32px", display: "flex", alignItems: "center", gap: isMobile ? "16px" : "24px", flexWrap: "wrap" }}>
          <Avatar name={profile.nombre} userId={profile.id} size={isMobile ? 72 : 96} imageUrl={profile.avatar_url} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 900, fontSize: isMobile ? "1.4rem" : "1.8rem", color: "var(--color-on-surface)", margin: 0, letterSpacing: "-0.03em" }}>
              {profile.nombre}
            </h1>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.85rem", color: "var(--color-outline)", margin: "4px 0 0" }}>
              @{profile.nombre.toLowerCase().replace(/\s+/g, "")}
            </p>
          </div>
          {!profile.isSelf && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
              <button onClick={handleFollowToggle} disabled={following_loading}
                style={{ padding: "10px 20px", borderRadius: "8px", border: profile.isFollowing ? "1px solid var(--color-divider-strong)" : "none", backgroundColor: profile.isFollowing ? "transparent" : "#f5c518", color: profile.isFollowing ? "var(--color-on-surface-variant)" : "#3d2f00", fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.875rem", cursor: following_loading ? "wait" : "pointer", transition: "all 0.15s" }}
              >
                {profile.isFollowing ? "Siguiendo" : "Seguir"}
              </button>
              <button type="button" onClick={openReportModal}
                style={{ padding: "10px 16px", borderRadius: "8px", border: "1px solid var(--color-divider-strong)", backgroundColor: "transparent", color: "var(--color-outline)", fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: "0.8rem", cursor: "pointer", transition: "all 0.15s" }}
              >
                {tp("reportUser")}
              </button>
            </div>
          )}
        </div>

        {/* Bio */}
        {profile.bio && (
          <div style={{ backgroundColor: "var(--color-surface-container-low)", borderRadius: "12px", border: "1px solid var(--color-divider-strong)", padding: "20px 24px", marginBottom: "24px" }}>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.9rem", color: "var(--color-on-surface-variant)", lineHeight: 1.6, margin: 0, whiteSpace: "pre-wrap" }}>
              {profile.bio}
            </p>
          </div>
        )}

        {/* Stats */}
        <div style={{ backgroundColor: "var(--color-surface-container-low)", borderRadius: "12px", border: "1px solid var(--color-divider-strong)", padding: "20px", marginBottom: "24px", display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: "16px 0" }}>
          <StatBlock label="Seguidores" value={profile.stats.seguidores} />
          <StatBlock label="Siguiendo" value={profile.stats.siguiendo} />
          <StatBlock label="Reviews" value={profile.stats.reviews} />
          <StatBlock label="Ratings" value={profile.stats.ratings} />
          <StatBlock label="Lista" value={profile.stats.lista} />
          <StatBlock label="Completados" value={profile.stats.completados} />
          <StatBlock label="Tiempo (h)" value={profile.stats.horas_estimadas} />
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "4px", borderBottom: "1px solid var(--color-divider-strong)", marginBottom: "24px", overflowX: "auto" }}>
          {(["resumen", "reviews", "seguidores", "siguiendo"] as Tab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding: "10px 18px", border: "none", background: "none", cursor: "pointer", fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.875rem", color: tab === t ? "#f5c518" : "var(--color-outline)", borderBottom: tab === t ? "2px solid #f5c518" : "2px solid transparent", marginBottom: "-1px", textTransform: "capitalize", whiteSpace: "nowrap" }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Content */}
        {tab === "resumen" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ backgroundColor: "var(--color-surface-container-low)", borderRadius: "12px", border: "1px solid var(--color-divider-strong)", padding: "24px", color: "var(--color-on-surface-variant)", fontFamily: "'Inter', sans-serif", fontSize: "0.9rem" }}>
              {profile.nombre} tiene <strong style={{ color: "var(--color-on-surface)" }}>{profile.stats.reviews}</strong> reviews,
              ha calificado <strong style={{ color: "var(--color-on-surface)" }}>{profile.stats.ratings}</strong> títulos
              y completado <strong style={{ color: "var(--color-on-surface)" }}>{profile.stats.completados}</strong> series
              (~<strong style={{ color: "#f5c518" }}>{profile.stats.horas_estimadas}h</strong> de visualización estimadas).
            </div>

            {badges.length > 0 && (
              <div style={{ backgroundColor: "var(--color-surface-container-low)", borderRadius: "12px", border: "1px solid var(--color-divider-strong)", padding: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "16px" }}>
                  <h3 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "1rem", color: "var(--color-on-surface)", margin: 0 }}>Logros</h3>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "var(--color-outline)" }}>
                    {badges.filter((b) => b.unlocked).length} / {badges.length}
                  </span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(auto-fill, minmax(180px, 1fr))", gap: "10px" }}>
                  {badges.map((b) => {
                    const pct = b.progress ? Math.min(100, (b.progress.value / b.progress.target) * 100) : (b.unlocked ? 100 : 0);
                    return (
                      <div key={b.id} title={b.description} style={{
                        display: "flex", flexDirection: "column", gap: "8px",
                        padding: "14px", borderRadius: "10px",
                        backgroundColor: b.unlocked ? "var(--color-primary-soft)" : "var(--color-surface-container)",
                        border: `1px solid ${b.unlocked ? "rgba(245,197,24,0.4)" : "var(--color-divider)"}`,
                        opacity: b.unlocked ? 1 : 0.65,
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: b.unlocked ? "#f5c518" : "var(--color-surface-container-high)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "20px", color: b.unlocked ? "#3d2f00" : "var(--color-outline)", fontVariationSettings: "'FILL' 1" }}>{b.icon}</span>
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.85rem", color: "var(--color-on-surface)", lineHeight: 1.2 }}>{b.label}</p>
                            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: "var(--color-outline)", marginTop: "2px" }}>{b.description}</p>
                          </div>
                        </div>
                        {b.progress && !b.unlocked && (
                          <div>
                            <div style={{ width: "100%", backgroundColor: "var(--color-surface-container-high)", borderRadius: "3px", height: "4px", overflow: "hidden" }}>
                              <div style={{ width: `${pct}%`, height: "100%", backgroundColor: "#f5c518", transition: "width 0.4s" }} />
                            </div>
                            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: "var(--color-outline)", marginTop: "3px", display: "block" }}>
                              {b.progress.value} / {b.progress.target}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "reviews" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {reviews.length === 0 ? (
              <p style={{ color: "var(--color-outline)", textAlign: "center", padding: "32px", fontFamily: "'Inter', sans-serif" }}>Sin reviews aún</p>
            ) : (
              reviews.map((r) => (
                <div key={r.id} style={{ backgroundColor: "var(--color-surface-container-low)", borderRadius: "10px", border: "1px solid var(--color-divider-strong)", padding: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "8px" }}>
                    {r.puntuacion != null && (
                      <span style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "1rem", color: "#f5c518" }}>★ {r.puntuacion}/10</span>
                    )}
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "var(--color-outline)" }}>
                      {new Date(r.fecha).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                  <ReviewMarkdown text={r.comentario} />
                  <ReviewImagesGallery urls={r.imagenes} />
                </div>
              ))
            )}
          </div>
        )}

        {tab === "seguidores" && (
          <UserListBlock users={followers} emptyText="No tiene seguidores aún" />
        )}

        {tab === "siguiendo" && (
          <UserListBlock users={following} emptyText="No sigue a nadie todavía" />
        )}
      </div>

      {reportOpen && (
        <div
          role="presentation"
          style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.55)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}
          onClick={() => !reportBusy && setReportOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && !reportBusy && setReportOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-user-title"
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: "var(--color-surface-container-low)", borderRadius: "14px", border: "1px solid var(--color-divider-strong)", padding: isMobile ? "20px" : "26px", maxWidth: "420px", width: "100%", boxShadow: "0 16px 48px rgba(0,0,0,0.35)" }}
          >
            <h2 id="report-user-title" style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "1.1rem", color: "var(--color-on-surface)", margin: "0 0 8px" }}>
              {tp("reportUserModalTitle")}
            </h2>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.82rem", color: "var(--color-outline)", margin: "0 0 14px", lineHeight: 1.5 }}>
              {tp("reportUserHint")}
            </p>
            <textarea
              value={reportMotivo}
              onChange={(e) => setReportMotivo(e.target.value)}
              maxLength={500}
              rows={4}
              disabled={reportBusy || reportMsg?.ok}
              placeholder={tp("reportUserPlaceholder")}
              style={{ width: "100%", boxSizing: "border-box", borderRadius: "10px", border: "1px solid var(--color-divider-strong)", padding: "12px", fontFamily: "'Inter', sans-serif", fontSize: "0.85rem", backgroundColor: "var(--color-surface)", color: "var(--color-on-surface)", resize: "vertical", marginBottom: "12px" }}
            />
            {reportMsg && (
              <p role={reportMsg.ok ? "status" : "alert"} style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.82rem", color: reportMsg.ok ? "#6fcf97" : "#e05c5c", margin: "0 0 12px" }}>
                {reportMsg.text}
              </p>
            )}
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", flexWrap: "wrap" }}>
              <button type="button" disabled={reportBusy} onClick={() => setReportOpen(false)}
                style={{ padding: "10px 16px", borderRadius: "8px", border: "1px solid var(--color-divider-strong)", background: "transparent", color: "var(--color-on-surface-variant)", fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: "0.85rem", cursor: reportBusy ? "wait" : "pointer" }}
              >
                {reportMsg?.ok ? tp("reportUserClose") : tp("reportUserCancel")}
              </button>
              {!reportMsg?.ok && (
                <button type="button" disabled={reportBusy} onClick={() => void submitReport()}
                  style={{ padding: "10px 18px", borderRadius: "8px", border: "none", backgroundColor: "#f5c518", color: "#3d2f00", fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.85rem", cursor: reportBusy ? "wait" : "pointer", opacity: reportBusy ? 0.7 : 1 }}
                >
                  {reportBusy ? "…" : tp("reportUserSubmit")}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function UserListBlock({ users, emptyText }: { users: { id: number; nombre: string }[]; emptyText: string }) {
  if (users.length === 0) {
    return <p style={{ color: "var(--color-outline)", textAlign: "center", padding: "32px", fontFamily: "'Inter', sans-serif" }}>{emptyText}</p>;
  }
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "10px" }}>
      {users.map((u) => (
        <Link key={u.id} href={`/usuario/${u.id}`} style={{ textDecoration: "none" }}>
          <div style={{ backgroundColor: "var(--color-surface-container-low)", borderRadius: "10px", border: "1px solid var(--color-divider-strong)", padding: "12px 16px", display: "flex", alignItems: "center", gap: "12px", transition: "background 0.15s", cursor: "pointer" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-hover-bg)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--color-surface-container-low)")}
          >
            <Avatar name={u.nombre} userId={u.id} size={36} />
            <span style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: "0.875rem", color: "var(--color-on-surface)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {u.nombre}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
