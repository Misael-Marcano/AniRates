"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { contenidoApi, ratingsApi, reviewsApi, favoritosApi, listaApi, personajesApi, watchApi, LISTA_ESTADOS, ESTADO_LABELS, ESTADO_ICONS, ESTADO_COLORS, type ListaEstado, type ContenidoPersonajeItem, type WatchResponse } from "@/services/api";
import { jikanApi, GENRE_MAP } from "@/services/jikan";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import Card from "@/components/Card";
import RatingHistogram from "@/components/RatingHistogram";
import AddToCustomListButton from "@/components/AddToCustomListButton";
import Avatar from "@/components/Avatar";
import MarkdownComposer from "@/components/MentionMarkdownComposer";
import ReviewMarkdown from "@/components/ReviewMarkdown";
import ReviewImageFields from "@/components/ReviewImageFields";
import ReviewImagesGallery from "@/components/ReviewImagesGallery";
import { useAuth } from "@/contexts/AuthContext";
import type { Contenido, Review, ReviewRespuesta, ReviewVersion } from "@/types";

function StarRow({
  value,
  interactive = false,
  onRate,
}: {
  value: number;
  interactive?: boolean;
  onRate?: (n: number) => void;
}) {
  const [hover, setHover] = useState(0);
  const display = hover || Math.round((value / 10) * 5);
  return (
    <div style={{ display: "flex", gap: "4px" }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className="material-symbols-outlined"
          aria-hidden="true"
          style={{
            fontSize: "28px",
            color: n <= display ? "#f5c518" : "var(--color-surface-container-highest)",
            cursor: interactive ? "pointer" : "default",
            fontVariationSettings: n <= display ? "'FILL' 1" : "'FILL' 0",
            transition: "color 0.1s",
          }}
          onMouseEnter={() => interactive && setHover(n)}
          onMouseLeave={() => interactive && setHover(0)}
          onClick={() => interactive && onRate?.(n * 2)}
        >
          star
        </span>
      ))}
    </div>
  );
}

function StatItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px", padding: "14px 16px", backgroundColor: "var(--color-surface-container)", borderRadius: "10px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "15px", color: "var(--color-outline)" }}>{icon}</span>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: "var(--color-outline)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>{label}</span>
      </div>
      <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: "0.9rem", color: "var(--color-on-surface)", fontWeight: 600 }}>{value}</span>
    </div>
  );
}

function StatsGrid({ item, isMobile }: { item: import("@/types").Contenido; isMobile: boolean }) {
  const stats: { icon: string; label: string; value: string }[] = [];
  const isAnime = item.tipo === "ANIME";

  if (isAnime && item.episodes) stats.push({ icon: "play_circle", label: "Episodios", value: String(item.episodes) });
  if (!isAnime && item.chapters) stats.push({ icon: "menu_book", label: "Capítulos", value: String(item.chapters) });
  if (!isAnime && item.volumes) stats.push({ icon: "library_books", label: "Volúmenes", value: String(item.volumes) });
  if (isAnime && item.duration) stats.push({ icon: "schedule", label: "Duración", value: item.duration });
  if (isAnime && item.studios?.length) stats.push({ icon: "movie", label: "Estudio", value: item.studios.join(", ") });
  if (!isAnime && item.authors?.length) stats.push({ icon: "person", label: "Autor", value: item.authors.join(", ") });
  if (item.source) stats.push({ icon: "book", label: "Fuente", value: item.source });
  if (item.season) stats.push({ icon: "calendar_today", label: "Temporada", value: item.season });
  if (item.aired_from) {
    const from = new Date(item.aired_from).toLocaleDateString("es", { year: "numeric", month: "short" });
    const to = item.aired_to ? new Date(item.aired_to).toLocaleDateString("es", { year: "numeric", month: "short" }) : "?";
    stats.push({ icon: "date_range", label: isAnime ? "Emisión" : "Publicación", value: item.aired_to ? `${from} – ${to}` : `desde ${from}` });
  }

  if (stats.length === 0) return null;

  return (
    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(auto-fill, minmax(170px, 1fr))", gap: "10px" }}>
      {stats.map((s) => <StatItem key={s.label} {...s} />)}
    </div>
  );
}

function EditReviewModal({ review, saving, onSave, onClose, overlayStyle, modalStyle }: {
  review: Review; saving: boolean;
  onSave: (comentario: string, puntuacion: number | undefined, es_spoiler: boolean, imagenes: string[]) => void;
  onClose: () => void;
  overlayStyle: React.CSSProperties; modalStyle: React.CSSProperties;
}) {
  const [text, setText] = useState(review.comentario);
  const [rating, setRating] = useState(review.puntuacion ?? 0);
  const [spoiler, setSpoiler] = useState(review.es_spoiler ?? false);
  const [imagenes, setImagenes] = useState<string[]>(review.imagenes ?? []);
  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h3 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "1.2rem", color: "var(--color-on-surface)" }}>Editar Review</h3>
          <button onClick={onClose} aria-label="Cerrar modal" style={{ background: "none", border: "none", color: "var(--color-outline)", cursor: "pointer" }}>
            <span className="material-symbols-outlined" aria-hidden="true">close</span>
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
            <StarRow value={rating} interactive onRate={setRating} />
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "var(--color-outline)" }}>
              {rating > 0 ? `${rating}/10` : "Sin puntuación"}
            </p>
          </div>
          <MarkdownComposer value={text} onChange={setText} rows={5} placeholder="Actualiza tu review..." />
          <ReviewImageFields value={imagenes} onChange={setImagenes} />
          <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
            <div onClick={() => setSpoiler((v) => !v)} style={{ width: "36px", height: "20px", borderRadius: "10px", backgroundColor: spoiler ? "#e05c5c" : "var(--color-surface-container-highest)", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
              <div style={{ position: "absolute", top: "2px", left: spoiler ? "18px" : "2px", width: "16px", height: "16px", borderRadius: "50%", backgroundColor: "var(--color-on-surface)", transition: "left 0.2s" }} />
            </div>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", color: spoiler ? "#e05c5c" : "var(--color-outline)" }}>Contiene spoilers</span>
          </label>
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={onClose} style={{ flex: 1, padding: "12px", border: "1px solid var(--color-divider-strong)", backgroundColor: "transparent", color: "var(--color-on-surface-variant)", borderRadius: "8px", fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: "0.875rem", cursor: "pointer" }}>Cancelar</button>
            <button onClick={() => onSave(text, rating || undefined, spoiler, imagenes)} disabled={saving || !text.trim()} style={{ flex: 2, padding: "12px", backgroundColor: "#f5c518", color: "#3d2f00", border: "none", borderRadius: "8px", fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.875rem", cursor: saving || !text.trim() ? "not-allowed" : "pointer", opacity: saving || !text.trim() ? 0.5 : 1 }}>
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewCard({
  review: r, isOwn, voted, featured, currentUserId,
  canFeature,
  replies, repliesOpen, replyDraft, replySubmitting,
  onVote, onEdit, onDelete,
  onToggleFeatured,
  onToggleReplies, onReplyDraftChange, onReplySubmit, onReplyDelete,
  onReportReview,
}: {
  review: Review; isOwn: boolean; voted: boolean;
  featured?: boolean; currentUserId: number | null;
  canFeature: boolean;
  replies: ReviewRespuesta[] | undefined; repliesOpen: boolean;
  replyDraft: string; replySubmitting: boolean;
  onVote: () => void; onEdit: () => void; onDelete: () => void;
  onToggleFeatured: () => void;
  onToggleReplies: () => void;
  onReplyDraftChange: (v: string) => void;
  onReplySubmit: () => void;
  onReplyDelete: (replyId: number) => void;
  onReportReview?: () => void;
}) {
  const tc = useTranslations("content");
  const [spoilerRevealed, setSpoilerRevealed] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [versions, setVersions] = useState<ReviewVersion[] | null>(null);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const isSpoiler = r.es_spoiler && !spoilerRevealed;
  const replyCount = replies?.length ?? 0;

  const toggleHistory = async () => {
    if (historyOpen) {
      setHistoryOpen(false);
      return;
    }
    setHistoryOpen(true);
    setVersions(null);
    setVersionsLoading(true);
    try {
      setVersions(await reviewsApi.getVersions(r.id));
    } catch {
      setVersions([]);
    } finally {
      setVersionsLoading(false);
    }
  };

  return (
    <div id={`review-${r.id}`} style={{
      backgroundColor: featured ? "var(--color-surface-container-high)" : "var(--color-surface-container)",
      borderRadius: "12px", padding: featured ? "24px" : "20px",
      border: featured ? "1px solid rgba(245,197,24,0.4)" : "1px solid var(--color-hover-bg-soft)",
      boxShadow: featured ? "0 8px 32px rgba(245,197,24,0.08)" : undefined,
    }}>
      {featured && (
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px", color: "#f5c518", fontFamily: "'Inter', sans-serif", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>
          <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "16px", fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
          {tc("reviewFeaturedBadge")}
        </div>
      )}
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Link href={r.usuario?.id ? `/usuario/${r.usuario.id}` : "#"} style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
            <Avatar name={r.usuario?.nombre ?? "Usuario"} userId={r.usuario?.id} size={36} />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <h4 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: "0.875rem", color: "var(--color-on-surface)" }}>{r.usuario?.nombre ?? "Usuario"}</h4>
                {r.es_spoiler && <span style={{ fontSize: "10px", fontFamily: "'Inter', sans-serif", backgroundColor: "rgba(224,92,92,0.15)", color: "#e05c5c", border: "1px solid rgba(224,92,92,0.3)", borderRadius: "4px", padding: "1px 6px", fontWeight: 700 }}>{tc("reviewSpoilerTag")}</span>}
              </div>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "var(--color-outline)" }}>
                {r.fecha ? new Date(r.fecha).toLocaleDateString("es", { year: "numeric", month: "short", day: "numeric" }) : ""}
              </span>
            </div>
          </Link>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {r.puntuacion && (
            <span style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.875rem", color: "#f5c518" }}>{r.puntuacion}/10</span>
          )}
          {canFeature && (
            <button onClick={onToggleFeatured} title={r.featured ? "Quitar destacada" : "Marcar destacada"} aria-label={r.featured ? "Quitar destacada" : "Marcar destacada"} style={{ background: "none", border: "none", color: r.featured ? "#f5c518" : "var(--color-outline)", cursor: "pointer", padding: "2px" }}>
              <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "16px", fontVariationSettings: r.featured ? "'FILL' 1" : "'FILL' 0" }}>workspace_premium</span>
            </button>
          )}
          {isOwn && (
            <>
              <button onClick={onEdit} title="Editar" aria-label="Editar review" style={{ background: "none", border: "none", color: "var(--color-outline)", cursor: "pointer", padding: "2px" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-on-surface)")} onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-outline)")}>
                <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "16px" }}>edit</span>
              </button>
              <button onClick={onDelete} title="Eliminar" aria-label="Eliminar review" style={{ background: "none", border: "none", color: "var(--color-outline)", cursor: "pointer", padding: "2px" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#e05c5c")} onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-outline)")}>
                <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "16px" }}>delete</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Body */}
      <div style={{ position: "relative" }}>
        <div style={{ filter: isSpoiler ? "blur(6px)" : "none", userSelect: isSpoiler ? "none" : "auto", transition: "filter 0.2s" }}>
          <ReviewMarkdown text={r.comentario} />
          <ReviewImagesGallery urls={r.imagenes} />
        </div>
        {isSpoiler && (
          <button onClick={() => setSpoilerRevealed(true)} style={{ position: "absolute", inset: 0, width: "100%", background: "color-mix(in srgb, var(--color-surface) 80%, transparent)", border: "1px dashed rgba(224,92,92,0.4)", borderRadius: "6px", color: "#e05c5c", cursor: "pointer", fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
            <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "16px" }}>visibility</span>
            {tc("reviewShowSpoiler")}
          </button>
        )}
      </div>

      {/* Footer: vote + reply toggle */}
      <div style={{ marginTop: "14px", paddingTop: "12px", borderTop: "1px solid var(--color-hover-bg-soft)", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
        <button onClick={onVote} style={{ display: "flex", alignItems: "center", gap: "5px", background: voted ? "rgba(100,181,246,0.12)" : "none", border: `1px solid ${voted ? "rgba(100,181,246,0.35)" : "var(--color-divider)"}`, borderRadius: "6px", color: voted ? "#64b5f6" : "var(--color-outline)", padding: "4px 10px", cursor: "pointer", fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", fontWeight: voted ? 600 : 400, transition: "all 0.15s" }}>
          <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "14px", fontVariationSettings: voted ? "'FILL' 1" : "'FILL' 0" }}>thumb_up</span>
          {tc("reviewUseful")} {(r.votos ?? 0) > 0 && <span>({r.votos})</span>}
        </button>
        <button onClick={onToggleReplies} style={{ display: "flex", alignItems: "center", gap: "5px", background: "none", border: "1px solid var(--color-divider)", borderRadius: "6px", color: "var(--color-outline)", padding: "4px 10px", cursor: "pointer", fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", transition: "all 0.15s" }}>
          <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "14px" }}>chat_bubble_outline</span>
          {tc("reviewReply")}{replyCount > 0 ? ` (${replyCount})` : ""}
          <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "14px" }}>{repliesOpen ? "expand_less" : "expand_more"}</span>
        </button>
        <button
          type="button"
          onClick={() => void toggleHistory()}
          aria-expanded={historyOpen}
          style={{ display: "flex", alignItems: "center", gap: "5px", background: "none", border: "1px solid var(--color-divider)", borderRadius: "6px", color: "var(--color-outline)", padding: "4px 10px", cursor: "pointer", fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", transition: "all 0.15s" }}
        >
          <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "14px" }}>history</span>
          {tc("reviewHistory")}
          {versions !== null && versions.length > 0 && (
            <span style={{ opacity: 0.85 }}>({versions.length})</span>
          )}
          <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "14px" }}>{historyOpen ? "expand_less" : "expand_more"}</span>
        </button>
        {onReportReview && (
          <button
            type="button"
            onClick={onReportReview}
            title={tc("reviewReportAria")}
            aria-label={tc("reviewReportAria")}
            style={{ display: "flex", alignItems: "center", gap: "4px", background: "none", border: "1px solid var(--color-divider)", borderRadius: "6px", color: "var(--color-outline)", padding: "4px 10px", cursor: "pointer", fontFamily: "'Inter', sans-serif", fontSize: "0.75rem" }}
          >
            <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "14px" }}>flag</span>
          </button>
        )}
      </div>

      {historyOpen && (
        <div
          role="region"
          aria-label={tc("reviewHistoryAria")}
          style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px dashed var(--color-divider)" }}
        >
          {versionsLoading && (
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "var(--color-outline)" }}>{tc("reviewHistoryLoading")}</p>
          )}
          {!versionsLoading && versions && versions.length === 0 && (
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "var(--color-outline)" }}>{tc("reviewHistoryEmpty")}</p>
          )}
          {!versionsLoading && versions && versions.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {versions.map((ver) => (
                <div
                  key={ver.id}
                  style={{
                    padding: "10px 12px",
                    backgroundColor: "var(--color-surface-container-low)",
                    borderRadius: "8px",
                    border: "1px solid var(--color-hover-bg-soft)",
                  }}
                >
                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: "var(--color-outline)" }}>
                      {ver.fecha ? new Date(ver.fecha).toLocaleString("es", { dateStyle: "medium", timeStyle: "short" }) : ""}
                    </span>
                    {ver.puntuacion != null && (
                      <span style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.75rem", color: "#f5c518" }}>{ver.puntuacion}/10</span>
                    )}
                    {ver.es_spoiler && (
                      <span style={{ fontSize: "10px", fontFamily: "'Inter', sans-serif", backgroundColor: "rgba(224,92,92,0.15)", color: "#e05c5c", border: "1px solid rgba(224,92,92,0.3)", borderRadius: "4px", padding: "1px 6px", fontWeight: 700 }}>{tc("reviewSpoilerTag")}</span>
                    )}
                  </div>
                  <ReviewMarkdown text={ver.comentario} />
                  <ReviewImagesGallery urls={ver.imagenes} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Replies thread */}
      {repliesOpen && (
        <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px dashed var(--color-divider)", display: "flex", flexDirection: "column", gap: "10px" }}>
          {replies === undefined ? (
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "var(--color-outline)" }}>Cargando respuestas…</p>
          ) : replies.length === 0 ? (
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "var(--color-outline)" }}>Aún no hay respuestas. Sé el primero.</p>
          ) : (
            replies.map((rep) => {
              const ownReply = currentUserId !== null && rep.usuario?.id === currentUserId;
              return (
                <div key={rep.id} style={{ display: "flex", gap: "10px", padding: "10px 12px", backgroundColor: "var(--color-surface-container-low)", borderRadius: "8px" }}>
                  <Avatar name={rep.usuario?.nombre ?? "Usuario"} userId={rep.usuario?.id} size={28} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
                      <Link href={rep.usuario?.id ? `/usuario/${rep.usuario.id}` : "#"} style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: "0.78rem", color: "var(--color-on-surface)" }}>{rep.usuario?.nombre ?? "Usuario"}</span>
                        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: "var(--color-outline)" }}>
                          {rep.fecha ? new Date(rep.fecha).toLocaleDateString("es", { year: "numeric", month: "short", day: "numeric" }) : ""}
                        </span>
                      </Link>
                      {ownReply && (
                        <button onClick={() => onReplyDelete(rep.id)} title="Eliminar" aria-label="Eliminar respuesta" style={{ background: "none", border: "none", color: "var(--color-outline)", cursor: "pointer", padding: "2px" }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "#e05c5c")} onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-outline)")}>
                          <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "14px" }}>delete</span>
                        </button>
                      )}
                    </div>
                    <div style={{ marginTop: "4px" }}>
                      <ReviewMarkdown text={rep.comentario} />
                    </div>
                  </div>
                </div>
              );
            })
          )}
          {currentUserId !== null && (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <MarkdownComposer
                mode="reply"
                value={replyDraft}
                onChange={onReplyDraftChange}
                rows={3}
                placeholder="Escribe una respuesta..."
              />
              <button onClick={onReplySubmit} disabled={replySubmitting || !replyDraft.trim()} style={{ alignSelf: "flex-end", backgroundColor: "#f5c518", color: "#3d2f00", border: "none", borderRadius: "6px", padding: "6px 14px", fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.75rem", cursor: replySubmitting || !replyDraft.trim() ? "not-allowed" : "pointer", opacity: replySubmitting || !replyDraft.trim() ? 0.5 : 1 }}>
                {replySubmitting ? "Enviando..." : "Responder"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SimilarRow({ genreIds, excludeId, isMobile }: { genreIds: number[]; excludeId: number; isMobile: boolean }) {
  const [items, setItems] = useState<Contenido[]>([]);

  useEffect(() => {
    if (genreIds.length === 0) return;
    Promise.allSettled([
      jikanApi.searchAnimePaged({ genres: genreIds, min_score: 7, order_by: "score", sort: "desc" }),
      jikanApi.searchMangaPaged({ genres: genreIds, min_score: 7, order_by: "score", sort: "desc" }),
    ]).then(([ar, mr]) => {
      const all = [
        ...(ar.status === "fulfilled" ? ar.value.items : []),
        ...(mr.status === "fulfilled" ? mr.value.items : []),
      ].filter((i) => i.id !== excludeId).slice(0, 16);
      setItems(all);
    });
  }, [genreIds, excludeId]);

  if (items.length === 0) return null;

  const cardWidth = isMobile ? "120px" : "150px";
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <h2 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: "1.4rem", color: "var(--color-on-surface)", letterSpacing: "-0.01em" }}>
        Más de este género
      </h2>
      <div className="hide-scrollbar" style={{ display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "8px" }}>
        {items.map((item) => (
          <div key={item.id} style={{ width: cardWidth, flexShrink: 0 }}>
            <Card item={item} />
          </div>
        ))}
      </div>
    </section>
  );
}

function Toast({ message, type }: { message: string; type: "error" | "success" }) {
  return (
    <div style={{
      position: "fixed", bottom: "24px", left: "50%",
      transform: "translateX(-50%)",
      zIndex: 200,
      backgroundColor: type === "error" ? "#93000a" : "#1a3a1a",
      border: `1px solid ${type === "error" ? "#ffb4ab" : "#4caf50"}`,
      color: type === "error" ? "#ffb4ab" : "#a5d6a7",
      padding: "12px 24px",
      borderRadius: "8px",
      fontFamily: "'Inter', sans-serif",
      fontSize: "0.875rem",
      boxShadow: "0 8px 32px var(--color-scrim)",
    }}>
      {message}
    </div>
  );
}

export default function ContenidoDetailPage() {
  const { id, tipo } = useParams<{ id: string; tipo: string }>();
  const router = useRouter();
  const tc = useTranslations("content");
  const { isMobile, isTablet } = useBreakpoint();
  const jikanId = Number(id);
  const isManga = tipo === "manga";

  const { user, isLoggedIn } = useAuth();
  const userId = user?.id ?? null;

  const [item, setItem] = useState<Contenido | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const [rateModal, setRateModal] = useState(false);
  const [reviewModal, setReviewModal] = useState(false);
  const [editModal, setEditModal] = useState<Review | null>(null);
  const [userRating, setUserRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewSpoiler, setReviewSpoiler] = useState(false);
  const [reviewImages, setReviewImages] = useState<string[]>([]);
  const [myVotes, setMyVotes] = useState<Set<number>>(new Set());
  const [reviewSort, setReviewSort] = useState<"top" | "recent">("top");
  const [reviewsCursor, setReviewsCursor] = useState<string | null>(null);
  const [reviewsLoadingMore, setReviewsLoadingMore] = useState(false);
  const [repliesByReview, setRepliesByReview] = useState<Record<number, ReviewRespuesta[]>>({});
  const [repliesOpen, setRepliesOpen] = useState<Set<number>>(new Set());
  const [replyDrafts, setReplyDrafts] = useState<Record<number, string>>({});
  const [replySubmitting, setReplySubmitting] = useState<Set<number>>(new Set());
  const [isFav, setIsFav] = useState(false);
  const [favId, setFavId] = useState<number | null>(null);
  const [listaEstado, setListaEstado] = useState<ListaEstado | null>(null);
  const [listaId, setListaId] = useState<number | null>(null);
  const [listaDropdown, setListaDropdown] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "error" | "success" } | null>(null);
  const [ratingDistribution, setRatingDistribution] = useState<number[] | null>(null);
  const [personajes, setPersonajes] = useState<ContenidoPersonajeItem[]>([]);
  const [watch, setWatch] = useState<WatchResponse | null>(null);

  function showToast(message: string, type: "error" | "success" = "error") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  function requireAuth(): boolean {
    if (!isLoggedIn) {
      showToast("Debes iniciar sesión para realizar esta acción");
      setTimeout(() => router.push("/login"), 1500);
      return false;
    }
    return true;
  }

  useEffect(() => {
    if (!listaDropdown) return;
    function handleOutside(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-lista-dropdown]")) setListaDropdown(false);
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [listaDropdown]);

  useEffect(() => {
    if (!userId) return;
    favoritosApi.getByUser(userId).then((favs) => {
      const match = favs.find((f) => f.contenido?.jikan_id === jikanId);
      if (match) { setIsFav(true); setFavId(match.id); }
    }).catch(() => {});
    listaApi.getItem(jikanId).then((item) => {
      if (item) { setListaEstado(item.estado); setListaId(item.id); }
    }).catch(() => {});
    reviewsApi.getMyVotes(jikanId).then((ids) => setMyVotes(new Set(ids))).catch(() => {});
  }, [jikanId, userId]);

  useEffect(() => {
    async function load() {
      try {
        const contenido = isManga
          ? await jikanApi.getMangaById(jikanId)
          : await jikanApi.getAnimeById(jikanId);
        setItem(contenido);
        try {
          const { items, nextCursor } = await reviewsApi.getByContenido(jikanId, { sort: reviewSort });
          setReviews(items);
          setReviewsCursor(nextCursor);
        } catch { setReviews([]); setReviewsCursor(null); }
        ratingsApi.getDistributionByJikanId(jikanId).then(setRatingDistribution).catch(() => {});
        personajesApi.byContenido(jikanId).then(setPersonajes).catch(() => setPersonajes([]));
        if (!isManga && contenido?.titulo) {
          watchApi.byJikanId(jikanId, contenido.titulo).then(setWatch).catch(() => setWatch(null));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [jikanId, isManga, reviewSort]);

  async function handleLoadMoreReviews() {
    if (!reviewsCursor || reviewsLoadingMore) return;
    setReviewsLoadingMore(true);
    try {
      const { items, nextCursor } = await reviewsApi.getByContenido(jikanId, { sort: reviewSort, cursor: reviewsCursor });
      setReviews((prev) => [...prev, ...items]);
      setReviewsCursor(nextCursor);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Error al cargar más reviews");
    } finally {
      setReviewsLoadingMore(false);
    }
  }

  function getContenidoMeta() {
    if (!item) throw new Error("Contenido no cargado");
    return {
      jikan_id: jikanId,
      titulo: item.titulo,
      tipo: item.tipo,
      imagen: item.imagen,
      año: item.año,
      estado: item.estado,
      descripcion: item.descripcion,
    };
  }

  async function handleRate() {
    if (!requireAuth()) return;
    if (!userRating) return;
    setSaving(true);
    try {
      await ratingsApi.rate({ ...getContenidoMeta(), puntuacion: userRating });
      setRateModal(false);
      showToast("¡Calificación guardada!", "success");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Error al guardar calificación");
    } finally { setSaving(false); }
  }

  async function handleReview() {
    if (!requireAuth()) return;
    if (!reviewText.trim()) return;
    const imagenes = reviewImages.map((u) => u.trim()).filter((u) => u.length > 0);
    setSaving(true);
    try {
      const rev = await reviewsApi.create({
        ...getContenidoMeta(),
        comentario: reviewText,
        puntuacion: userRating || undefined,
        es_spoiler: reviewSpoiler,
        imagenes,
      });
      setReviews((prev) => [rev, ...prev]);
      setReviewModal(false);
      setReviewText("");
      setUserRating(0);
      setReviewSpoiler(false);
      setReviewImages([]);
      showToast("¡Review publicada!", "success");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Error al publicar review");
    } finally { setSaving(false); }
  }

  async function handleListaEstado(estado: ListaEstado) {
    if (!requireAuth()) return;
    setSaving(true);
    setListaDropdown(false);
    try {
      const result = await listaApi.upsert({ ...getContenidoMeta(), estado });
      setListaEstado(result.estado);
      setListaId(result.id);
      showToast(`Añadido a "${ESTADO_LABELS[estado]}"`, "success");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Error");
    } finally { setSaving(false); }
  }

  async function handleQuitarLista() {
    if (!listaId) return;
    setSaving(true);
    setListaDropdown(false);
    try {
      await listaApi.remove(listaId);
      setListaEstado(null);
      setListaId(null);
      showToast("Quitado de tu lista", "success");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Error");
    } finally { setSaving(false); }
  }

  async function handleVote(reviewId: number) {
    if (!requireAuth()) return;
    const voted = myVotes.has(reviewId);
    try {
      const res = voted ? await reviewsApi.unvote(reviewId) : await reviewsApi.vote(reviewId);
      setMyVotes((prev) => { const s = new Set(prev); voted ? s.delete(reviewId) : s.add(reviewId); return s; });
      setReviews((prev) => prev.map((r) => r.id === reviewId ? { ...r, votos: res.votos } : r));
    } catch { /* ignore */ }
  }

  async function handleEditReview(comentario: string, puntuacion: number | undefined, es_spoiler: boolean, imagenes: string[]) {
    if (!editModal) return;
    setSaving(true);
    try {
      const updated = await reviewsApi.update(editModal.id, {
        comentario,
        puntuacion,
        es_spoiler,
        imagenes: imagenes.map((u) => u.trim()).filter((u) => u.length > 0),
      });
      setReviews((prev) => prev.map((r) => r.id === editModal.id ? { ...r, ...updated } : r));
      setEditModal(null);
      showToast("Review actualizada", "success");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Error");
    } finally { setSaving(false); }
  }

  async function handleDeleteReview(reviewId: number) {
    try {
      await reviewsApi.delete(reviewId);
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      setRepliesByReview((prev) => { const cp = { ...prev }; delete cp[reviewId]; return cp; });
      setRepliesOpen((prev) => { const s = new Set(prev); s.delete(reviewId); return s; });
      showToast("Review eliminada", "success");
    } catch { /* ignore */ }
  }

  async function handleToggleFeatured(reviewId: number, current: boolean) {
    if (user?.tipo !== "admin") return;
    try {
      const updated = await reviewsApi.setFeatured(reviewId, !current);
      setReviews((prev) => prev.map((r) => (r.id === reviewId ? { ...r, featured: updated.featured } : r)));
      showToast(updated.featured ? "Review marcada como destacada" : "Review ya no destacada", "success");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "No se pudo actualizar destacada");
    }
  }

  async function handleReportReview(reviewId: number) {
    if (!requireAuth()) return;
    const raw = typeof window !== "undefined" ? window.prompt(tc("reviewReportPrompt")) : null;
    if (raw === null) return;
    try {
      await reviewsApi.report(reviewId, raw.trim() || undefined);
      showToast(tc("reviewReportThanks"), "success");
    } catch (e) {
      showToast(e instanceof Error ? e.message : tc("reviewReportError"));
    }
  }

  async function handleReportContenido() {
    if (!requireAuth()) return;
    if (!item?.titulo) return;
    const raw = typeof window !== "undefined" ? window.prompt(tc("contenidoReportPrompt")) : null;
    if (raw === null) return;
    try {
      await contenidoApi.report(jikanId, {
        titulo: item.titulo,
        tipo: isManga ? "manga" : "anime",
        motivo: raw.trim() || undefined,
      });
      showToast(tc("contenidoReportThanks"), "success");
    } catch (e) {
      showToast(e instanceof Error ? e.message : tc("contenidoReportError"));
    }
  }

  async function toggleReplies(reviewId: number) {
    const isOpen = repliesOpen.has(reviewId);
    setRepliesOpen((prev) => { const s = new Set(prev); isOpen ? s.delete(reviewId) : s.add(reviewId); return s; });
    if (!isOpen && repliesByReview[reviewId] === undefined) {
      try {
        const list = await reviewsApi.getReplies(reviewId);
        setRepliesByReview((prev) => ({ ...prev, [reviewId]: list }));
      } catch {
        setRepliesByReview((prev) => ({ ...prev, [reviewId]: [] }));
      }
    }
  }

  async function submitReply(reviewId: number) {
    if (!requireAuth()) return;
    const draft = (replyDrafts[reviewId] ?? "").trim();
    if (!draft) return;
    setReplySubmitting((prev) => new Set(prev).add(reviewId));
    try {
      const created = await reviewsApi.addReply(reviewId, draft);
      setRepliesByReview((prev) => ({ ...prev, [reviewId]: [...(prev[reviewId] ?? []), created] }));
      setReplyDrafts((prev) => ({ ...prev, [reviewId]: "" }));
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Error al responder");
    } finally {
      setReplySubmitting((prev) => { const s = new Set(prev); s.delete(reviewId); return s; });
    }
  }

  async function deleteReply(replyId: number, reviewId: number) {
    try {
      await reviewsApi.deleteReply(replyId);
      setRepliesByReview((prev) => ({ ...prev, [reviewId]: (prev[reviewId] ?? []).filter((r) => r.id !== replyId) }));
    } catch { /* ignore */ }
  }

  async function toggleFav() {
    if (!requireAuth()) return;
    setSaving(true);
    try {
      if (isFav && favId !== null) {
        await favoritosApi.remove(favId);
        setIsFav(false);
        setFavId(null);
        showToast("Eliminado de favoritos", "success");
      } else {
        const added = await favoritosApi.add(getContenidoMeta());
        setIsFav(true);
        setFavId(added?.id ?? null);
        showToast("¡Agregado a favoritos!", "success");
      }
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Error");
    } finally { setSaving(false); }
  }

  const overlayStyle: React.CSSProperties = {
    position: "fixed", inset: 0, zIndex: 100,
    backgroundColor: "rgba(14,14,14,0.85)",
    backdropFilter: "blur(8px)",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "24px",
  };

  const modalStyle: React.CSSProperties = {
    backgroundColor: "var(--color-surface-container-high)",
    border: "1px solid var(--color-divider-strong)",
    borderRadius: "16px",
    padding: "36px",
    width: "100%", maxWidth: "440px",
    boxShadow: "0 30px 60px var(--color-scrim-strong)",
  };

  if (loading) return (
    <div style={{ backgroundColor: "var(--color-surface)", minHeight: "100vh", paddingTop: "64px", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
        <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "48px", color: "var(--color-outline-variant)" }}>hourglass_empty</span>
        <p style={{ color: "var(--color-outline)", fontFamily: "'Inter', sans-serif" }}>Cargando...</p>
      </div>
    </div>
  );

  if (!item) return (
    <div style={{ backgroundColor: "var(--color-surface)", minHeight: "100vh", paddingTop: "64px", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#ffb4ab" }}>Contenido no encontrado.</p>
    </div>
  );

  const isAnime = item.tipo === "ANIME";
  const starsDisplay = Math.round((item.rating_promedio ?? 0) / 2);

  return (
    <div style={{ backgroundColor: "var(--color-surface)", minHeight: "100vh", paddingTop: "64px" }}>
      {toast && <Toast message={toast.message} type={toast.type} />}

      <main style={{
        maxWidth: "1536px", margin: "0 auto",
        padding: isMobile ? "20px 16px 60px" : isTablet ? "28px 28px 60px" : "40px 48px 80px",
        display: "flex", flexDirection: "column", gap: isMobile ? "40px" : "64px",
      }}>
        {/* Content header */}
        <section style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : isTablet ? "180px 1fr" : "250px 1fr",
          gap: isMobile ? "20px" : isTablet ? "32px" : "64px",
          alignItems: "start",
        }}>
          {/* Poster */}
          <div style={{
            width: isMobile ? "140px" : isTablet ? "180px" : "250px",
            margin: isMobile ? "0 auto" : undefined,
            borderRadius: "12px", overflow: "hidden",
            backgroundColor: "var(--color-surface-container-high)",
            boxShadow: "0 20px 60px var(--color-scrim-strong)",
            position: "relative",
          }}>
            {item.imagen ? (
              <Image src={item.imagen} alt={item.titulo} width={250} height={375} priority sizes="(max-width: 640px) 140px, (max-width: 1024px) 180px, 250px" style={{ width: "100%", height: isMobile ? "210px" : isTablet ? "270px" : "375px", objectFit: "cover", display: "block" }} />
            ) : (
              <div style={{ width: "100%", height: isMobile ? "210px" : "375px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "4rem" }}>
                {isAnime ? "🎬" : "📚"}
              </div>
            )}
            <div style={{ position: "absolute", inset: 0, boxShadow: "inset 0 0 0 1px var(--color-divider)", borderRadius: "12px", pointerEvents: "none" }} />
          </div>

          {/* Info */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Badges */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <span style={{
                backgroundColor: isAnime ? "rgba(0,64,203,0.2)" : "rgba(90,0,180,0.2)",
                color: isAnime ? "#b7c4ff" : "#d3bbff",
                fontSize: "11px", fontWeight: 700,
                padding: "4px 14px", borderRadius: "20px",
                letterSpacing: "0.1em", textTransform: "uppercase",
                fontFamily: "'Inter', sans-serif",
              }}>
                {item.tipo}
              </span>
              {item.generos?.slice(0, 3).map((g) => (
                <span key={g.id} style={{
                  backgroundColor: "var(--color-surface-container-high)", color: "var(--color-on-surface-variant)",
                  fontSize: "11px", padding: "4px 12px",
                  borderRadius: "20px", fontFamily: "'Inter', sans-serif",
                  letterSpacing: "0.05em", textTransform: "uppercase",
                }}>
                  {g.nombre}
                </span>
              ))}
            </div>

            {/* Title */}
            <h1 style={{
              fontFamily: "'Manrope', sans-serif",
              fontSize: isMobile ? "1.6rem" : "clamp(2rem, 4vw, 3.5rem)",
              fontWeight: 700, color: "var(--color-on-surface)",
              lineHeight: 1.1, letterSpacing: "-0.02em",
            }}>
              {item.titulo}
            </h1>

            {/* Rating */}
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <div style={{ display: "flex", gap: "2px" }}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <span key={n} className="material-symbols-outlined" aria-hidden="true" style={{
                    fontSize: "28px",
                    color: n <= starsDisplay ? "#ffe5a0" : "var(--color-surface-container-highest)",
                    fontVariationSettings: n <= starsDisplay ? "'FILL' 1" : "'FILL' 0",
                  }}>star</span>
                ))}
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "1.5rem", color: "var(--color-on-surface)" }}>
                  {(item.rating_promedio ?? 0).toFixed(1)}/10
                </span>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "var(--color-on-surface-variant)" }}>
                  {item.total_ratings?.toLocaleString()} calificaciones
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: isMobile ? "8px" : "12px" }}>
              {/* Lista estado button */}
              <div style={{ position: "relative" }} data-lista-dropdown>
                <button
                  onClick={() => setListaDropdown((v) => !v)}
                  disabled={saving}
                  style={{
                    background: listaEstado
                      ? `linear-gradient(135deg, ${ESTADO_COLORS[listaEstado]}33, ${ESTADO_COLORS[listaEstado]}55)`
                      : "var(--color-surface-container-high)",
                    color: listaEstado ? ESTADO_COLORS[listaEstado] : "var(--color-on-surface)",
                    border: `1px solid ${listaEstado ? ESTADO_COLORS[listaEstado] + "88" : "var(--color-divider-strong)"}`,
                    borderRadius: "8px",
                    padding: "12px 20px",
                    fontFamily: "'Manrope', sans-serif",
                    fontWeight: 600, fontSize: "0.9rem",
                    cursor: saving ? "wait" : "pointer",
                    display: "flex", alignItems: "center", gap: "8px",
                    transition: "background 0.2s, border-color 0.2s",
                    minWidth: "160px",
                  }}
                >
                  <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "18px", fontVariationSettings: listaEstado ? "'FILL' 1" : "'FILL' 0" }}>
                    {listaEstado ? ESTADO_ICONS[listaEstado] : "add_circle"}
                  </span>
                  {listaEstado ? ESTADO_LABELS[listaEstado] : "Añadir a lista"}
                  <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "16px", marginLeft: "auto" }}>
                    {listaDropdown ? "expand_less" : "expand_more"}
                  </span>
                </button>

                {listaDropdown && (
                  <div
                    style={{
                      position: "absolute", top: "calc(100% + 6px)", left: 0,
                      backgroundColor: "var(--color-surface-container-high)",
                      border: "1px solid var(--color-divider)",
                      borderRadius: "10px",
                      boxShadow: "0 12px 40px var(--color-scrim-strong)",
                      zIndex: 50,
                      minWidth: "200px",
                      overflow: "hidden",
                    }}
                  >
                    {LISTA_ESTADOS.map((estado) => (
                      <button
                        key={estado}
                        onClick={() => handleListaEstado(estado)}
                        style={{
                          width: "100%", textAlign: "left",
                          background: listaEstado === estado ? `${ESTADO_COLORS[estado]}22` : "none",
                          border: "none",
                          borderLeft: listaEstado === estado ? `3px solid ${ESTADO_COLORS[estado]}` : "3px solid transparent",
                          color: listaEstado === estado ? ESTADO_COLORS[estado] : "var(--color-on-surface-variant)",
                          padding: "11px 16px",
                          fontFamily: "'Inter', sans-serif",
                          fontSize: "0.875rem", cursor: "pointer",
                          display: "flex", alignItems: "center", gap: "10px",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) => { if (listaEstado !== estado) e.currentTarget.style.backgroundColor = "var(--color-hover-bg-soft)"; }}
                        onMouseLeave={(e) => { if (listaEstado !== estado) e.currentTarget.style.backgroundColor = "transparent"; }}
                      >
                        <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "18px", color: ESTADO_COLORS[estado], fontVariationSettings: listaEstado === estado ? "'FILL' 1" : "'FILL' 0" }}>
                          {ESTADO_ICONS[estado]}
                        </span>
                        {ESTADO_LABELS[estado]}
                        {listaEstado === estado && (
                          <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "16px", marginLeft: "auto", color: ESTADO_COLORS[estado] }}>check</span>
                        )}
                      </button>
                    ))}
                    {listaEstado && (
                      <>
                        <div style={{ height: "1px", backgroundColor: "var(--color-divider)", margin: "4px 0" }} />
                        <button
                          onClick={handleQuitarLista}
                          style={{
                            width: "100%", textAlign: "left",
                            background: "none", border: "none", borderLeft: "3px solid transparent",
                            color: "#e05c5c",
                            padding: "11px 16px",
                            fontFamily: "'Inter', sans-serif",
                            fontSize: "0.875rem", cursor: "pointer",
                            display: "flex", alignItems: "center", gap: "10px",
                            transition: "background 0.15s",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(224,92,92,0.08)")}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                        >
                          <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "18px" }}>delete</span>
                          Quitar de lista
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Favorites button */}
              <button
                onClick={toggleFav}
                disabled={saving}
                style={{
                  background: "linear-gradient(135deg, #ffe08b, #f5c518)",
                  color: "#3d2f00", border: "none", borderRadius: "8px",
                  padding: "12px 24px",
                  fontFamily: "'Manrope', sans-serif",
                  fontWeight: 600, fontSize: "0.9rem",
                  cursor: saving ? "wait" : "pointer",
                  display: "flex", alignItems: "center", gap: "8px",
                  opacity: isFav ? 0.8 : 1,
                  transition: "box-shadow 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 0 12px rgba(245,197,24,0.4)")}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
              >
                <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "18px", fontVariationSettings: isFav ? "'FILL' 1" : "'FILL' 0" }}>
                  favorite
                </span>
                {isFav ? "En Favoritos" : "Agregar a Favoritos"}
              </button>

              {item && <AddToCustomListButton contenidoMeta={getContenidoMeta()} />}

              <button
                onClick={() => setReviewModal(true)}
                style={{
                  border: "1px solid var(--color-divider-strong)",
                  backgroundColor: "transparent", color: "var(--color-on-surface)",
                  borderRadius: "8px", padding: "12px 24px",
                  fontFamily: "'Manrope', sans-serif",
                  fontWeight: 600, fontSize: "0.9rem", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: "8px",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-surface-container-high)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "18px" }}>edit</span>
                Escribir Review
              </button>

              <button
                type="button"
                aria-label={tc("contenidoReportAria")}
                onClick={() => void handleReportContenido()}
                style={{
                  border: "1px solid var(--color-divider-strong)",
                  backgroundColor: "transparent",
                  color: "var(--color-outline)",
                  borderRadius: "8px",
                  padding: "12px 20px",
                  fontFamily: "'Manrope', sans-serif",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "background-color 0.2s, border-color 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--color-surface-container-high)";
                  e.currentTarget.style.borderColor = "rgba(224,92,92,0.35)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.borderColor = "var(--color-divider-strong)";
                }}
              >
                <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "18px" }}>flag</span>
                {tc("reportContenido")}
              </button>

              <button
                onClick={() => setRateModal(true)}
                style={{
                  border: "1px solid rgba(245,197,24,0.3)",
                  backgroundColor: "transparent", color: "#f5c518",
                  borderRadius: "8px", padding: "12px 24px",
                  fontFamily: "'Manrope', sans-serif",
                  fontWeight: 600, fontSize: "0.9rem", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: "8px",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-primary-soft)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "18px" }}>star_rate</span>
                Calificar
              </button>
            </div>

            {/* Auth hint */}
            {!isLoggedIn && (
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", color: "var(--color-outline)" }}>
                <a href="/login" style={{ color: "#f5c518", textDecoration: "none", fontWeight: 600 }}>Inicia sesión</a>
                {" "}para calificar, escribir reviews o guardar favoritos.
              </p>
            )}

            {/* Meta inline */}
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", color: "var(--color-outline)" }}>
              {[item.año, item.estado, item.media_type, item.age_rating].filter(Boolean).join(" · ")}
            </p>

            {/* Description */}
            <p style={{
              fontFamily: "'Inter', sans-serif", color: "var(--color-on-surface-variant)",
              fontSize: "1rem", lineHeight: 1.75, maxWidth: "680px",
            }}>
              {item.descripcion || "Sin descripción disponible."}
            </p>

            {/* Themes + demographics */}
            {((item.themes?.length ?? 0) > 0 || (item.demographics?.length ?? 0) > 0) && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {item.demographics?.map((d) => (
                  <span key={d} style={{
                    backgroundColor: "var(--color-primary-soft-strong)", color: "#f5c518",
                    border: "1px solid rgba(245,197,24,0.25)",
                    fontSize: "11px", fontWeight: 700,
                    padding: "3px 12px", borderRadius: "20px",
                    fontFamily: "'Inter', sans-serif", letterSpacing: "0.05em",
                  }}>{d}</span>
                ))}
                {item.themes?.map((t) => (
                  <span key={t} style={{
                    backgroundColor: "var(--color-hover-bg-soft)", color: "var(--color-on-surface-variant)",
                    border: "1px solid var(--color-divider)",
                    fontSize: "11px", padding: "3px 12px", borderRadius: "20px",
                    fontFamily: "'Inter', sans-serif",
                  }}>{t}</span>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Stats grid */}
        <section>
          <StatsGrid item={item} isMobile={isMobile} />
        </section>

        {/* Trailer */}
        {item.trailer_youtube_id && (
          <section style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h2 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: "1.4rem", color: "var(--color-on-surface)", letterSpacing: "-0.01em" }}>
              Trailer
            </h2>
            <div style={{ position: "relative", paddingTop: "56.25%", borderRadius: "12px", overflow: "hidden", backgroundColor: "var(--color-surface-container-low)" }}>
              <iframe
                src={`https://www.youtube.com/embed/${item.trailer_youtube_id}`}
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </section>
        )}

        {/* Similar content */}
        <SimilarRow
          genreIds={(item.generos ?? []).slice(0, 2).map((g) => GENRE_MAP[g.nombre]).filter(Boolean) as number[]}
          excludeId={item.id}
          isMobile={isMobile}
        />

        {/* Relations */}
        {(item.relations?.length ?? 0) > 0 && (
          <section style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h2 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: "1.4rem", color: "var(--color-on-surface)", letterSpacing: "-0.01em" }}>
              Relacionados
            </h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {item.relations?.map((r, i) => {
                return (
                  <a key={i} href={`/contenido/${r.type}/${r.mal_id}`} style={{ textDecoration: "none" }}>
                    <div style={{
                      backgroundColor: "var(--color-surface-container-high)",
                      border: "1px solid var(--color-divider)",
                      borderRadius: "8px", padding: "10px 16px",
                      display: "flex", flexDirection: "column", gap: "4px",
                      transition: "border-color 0.2s, background 0.2s",
                      maxWidth: "220px",
                    }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#f5c518"; e.currentTarget.style.backgroundColor = "var(--color-surface-container-highest)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--color-divider)"; e.currentTarget.style.backgroundColor = "var(--color-surface-container-high)"; }}
                    >
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", fontWeight: 700, color: "#f5c518", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        {r.relation}
                      </span>
                      <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: "0.875rem", color: "var(--color-on-surface)", fontWeight: 600, lineHeight: 1.3 }}>
                        {r.name}
                      </span>
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "var(--color-outline)", textTransform: "uppercase" }}>
                        {r.type}
                      </span>
                    </div>
                  </a>
                );
              })}
            </div>
          </section>
        )}

        {/* Rating distribution histogram */}
        {ratingDistribution && item && (
          <section>
            <RatingHistogram
              distribution={ratingDistribution}
              avg={item.rating_promedio}
              total={item.total_ratings}
            />
          </section>
        )}

        {/* Donde ver */}
        {!isManga && watch && (watch.curated.length > 0 || watch.search.length > 0) && (
          <section>
            <h2 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: "1.4rem", color: "var(--color-on-surface)", marginBottom: "16px", letterSpacing: "-0.01em" }}>
              {tc("watchOn")}
            </h2>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {watch.curated.map((s, i) => (
                <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 18px", borderRadius: "10px", backgroundColor: "var(--color-surface-container-high)", color: "var(--color-on-surface)", textDecoration: "none", fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.85rem", border: "1px solid rgba(245,197,24,0.3)" }}>
                  <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "16px", color: "#f5c518" }}>play_circle</span>
                  {s.provider.charAt(0).toUpperCase() + s.provider.slice(1)}
                </a>
              ))}
              {watch.curated.length === 0 && watch.search.map((s) => (
                <a key={s.provider} href={s.url} target="_blank" rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "8px", border: "1px solid var(--color-divider)", color: "var(--color-on-surface-variant)", textDecoration: "none", fontFamily: "'Inter', sans-serif", fontSize: "0.8rem" }}>
                  <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "14px" }}>search</span>
                  Buscar en {s.provider.charAt(0).toUpperCase() + s.provider.slice(1)}
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Personajes section */}
        {personajes.length > 0 && (
          <section>
            <h2 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: "1.4rem", color: "var(--color-on-surface)", marginBottom: "16px", letterSpacing: "-0.01em" }}>
              {tc("characters")} <span style={{ fontSize: "0.95rem", color: "var(--color-outline)", fontWeight: 400 }}>({personajes.length})</span>
            </h2>
            <div className="hide-scrollbar" style={{ display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "8px" }}>
              {personajes.map((cp) => (
                <Link key={cp.id} href={`/personaje/${cp.personaje.mal_id}`} style={{ textDecoration: "none", flexShrink: 0, width: "120px" }}>
                  <div style={{ position: "relative", width: "120px", height: "168px", borderRadius: "10px", overflow: "hidden", backgroundColor: "var(--color-surface-container-high)" }}>
                    {cp.personaje.imagen && (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={cp.personaje.imagen} alt={cp.personaje.nombre} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </>
                    )}
                  </div>
                  <p style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: "0.8rem", color: "var(--color-on-surface)", margin: "8px 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cp.personaje.nombre}</p>
                  {cp.rol && <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "var(--color-outline)", margin: 0 }}>{cp.rol}</p>}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Reviews section */}
        <section style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--color-hover-bg-soft)", paddingBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
            <h2 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: "1.6rem", color: "var(--color-on-surface)", letterSpacing: "-0.01em" }}>
              {tc("reviews")} <span style={{ fontSize: "1rem", color: "var(--color-outline)", fontWeight: 400 }}>({reviews.length})</span>
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              {/* Sort */}
              {(reviews.length > 1 || reviewsCursor) && (
                <div style={{ display: "flex", gap: "4px" }}>
                  {([["top", tc("sortTop")], ["recent", tc("sortRecent")]] as const).map(([val, label]) => (
                    <button key={val} onClick={() => setReviewSort(val)} style={{ padding: "5px 12px", borderRadius: "6px", border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", fontWeight: reviewSort === val ? 700 : 400, backgroundColor: reviewSort === val ? "#f5c518" : "var(--color-surface-container-high)", color: reviewSort === val ? "#3d2f00" : "var(--color-outline)", transition: "all 0.15s" }}>
                      {label}
                    </button>
                  ))}
                </div>
              )}
              <button onClick={() => setReviewModal(true)} style={{ background: "none", border: "1px solid var(--color-divider)", color: "var(--color-on-surface-variant)", cursor: "pointer", fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", borderRadius: "6px", padding: "5px 14px", display: "flex", alignItems: "center", gap: "4px" }}>
                <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "15px" }}>edit</span>
                {tc("review")}
              </button>
            </div>
          </div>

          {reviews.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", paddingTop: "40px" }}>
              <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "48px", color: "var(--color-outline-variant)" }}>rate_review</span>
              <p style={{ color: "var(--color-outline)", fontFamily: "'Inter', sans-serif" }}>{tc("noReviewsYet")}</p>
            </div>
          ) : (
            <>
              {(() => {
                const explicitFeatured = reviews.find((r) => r.featured);
                const fallbackFeatured = reviewSort === "top" && reviews.length > 0 && (reviews[0].votos ?? 0) > 0 ? reviews[0] : null;
                const featuredCandidate = explicitFeatured ?? fallbackFeatured;
                const restReviews = featuredCandidate ? reviews.filter((r) => r.id !== featuredCandidate.id) : reviews;
                const renderCard = (r: Review, featured: boolean) => {
                  const isOwn = userId !== null && r.usuario?.id === userId;
                  const voted = myVotes.has(r.id);
                  return (
                    <ReviewCard
                      key={r.id}
                      review={r}
                      isOwn={isOwn}
                      voted={voted}
                      featured={featured}
                      currentUserId={userId}
                      canFeature={user?.tipo === "admin"}
                      replies={repliesByReview[r.id]}
                      repliesOpen={repliesOpen.has(r.id)}
                      replyDraft={replyDrafts[r.id] ?? ""}
                      replySubmitting={replySubmitting.has(r.id)}
                      onVote={() => handleVote(r.id)}
                      onEdit={() => setEditModal(r)}
                      onDelete={() => handleDeleteReview(r.id)}
                      onToggleFeatured={() => handleToggleFeatured(r.id, !!r.featured)}
                      onToggleReplies={() => toggleReplies(r.id)}
                      onReplyDraftChange={(v) => setReplyDrafts((prev) => ({ ...prev, [r.id]: v }))}
                      onReplySubmit={() => submitReply(r.id)}
                      onReplyDelete={(rid) => deleteReply(rid, r.id)}
                      onReportReview={userId !== null && !isOwn ? () => { void handleReportReview(r.id); } : undefined}
                    />
                  );
                };
                return (
                  <>
                    {featuredCandidate && (
                      <div style={{ marginBottom: "16px" }}>{renderCard(featuredCandidate, true)}</div>
                    )}
                    {restReviews.length > 0 && (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "16px" }}>
                        {restReviews.map((r) => renderCard(r, false))}
                      </div>
                    )}
                  </>
                );
              })()}
              {reviewsCursor && (
                <div style={{ display: "flex", justifyContent: "center", marginTop: "24px" }}>
                  <button
                    onClick={handleLoadMoreReviews}
                    disabled={reviewsLoadingMore}
                    style={{
                      backgroundColor: "var(--color-surface-container)",
                      border: "1px solid var(--color-divider-strong)",
                      borderRadius: "8px", padding: "10px 28px",
                      color: "var(--color-on-surface)", cursor: reviewsLoadingMore ? "not-allowed" : "pointer",
                      fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: "0.85rem",
                      opacity: reviewsLoadingMore ? 0.6 : 1,
                    }}
                  >
                    {reviewsLoadingMore ? "Cargando..." : "Cargar más"}
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      {/* Rate Modal */}
      {rateModal && (
        <div style={overlayStyle} onClick={() => setRateModal(false)}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
              <h3 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "1.3rem", color: "var(--color-on-surface)" }}>
                Calificar
              </h3>
              <button onClick={() => setRateModal(false)} aria-label="Cerrar modal de calificación" style={{ background: "none", border: "none", color: "var(--color-outline)", cursor: "pointer" }}>
                <span className="material-symbols-outlined" aria-hidden="true">close</span>
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "24px" }}>
              <StarRow value={userRating} interactive onRate={setUserRating} />
              {userRating > 0 && (
                <p style={{ fontFamily: "'Manrope', sans-serif", color: "#f5c518", fontWeight: 700, fontSize: "1.2rem" }}>
                  {userRating}/10
                </p>
              )}
              <button
                onClick={handleRate}
                disabled={saving || !userRating}
                style={{
                  width: "100%", padding: "13px",
                  backgroundColor: "#f5c518", color: "#3d2f00",
                  border: "none", borderRadius: "8px",
                  fontFamily: "'Manrope', sans-serif",
                  fontWeight: 700, fontSize: "0.9rem",
                  cursor: saving || !userRating ? "not-allowed" : "pointer",
                  opacity: saving || !userRating ? 0.5 : 1,
                }}
              >
                {saving ? "Guardando..." : "Guardar Calificación"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewModal && (
        <div style={overlayStyle} onClick={() => { setReviewModal(false); setReviewImages([]); }}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h3 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "1.3rem", color: "var(--color-on-surface)" }}>
                Escribir Review
              </h3>
              <button onClick={() => { setReviewModal(false); setReviewImages([]); }} aria-label="Cerrar modal de review" style={{ background: "none", border: "none", color: "var(--color-outline)", cursor: "pointer" }}>
                <span className="material-symbols-outlined" aria-hidden="true">close</span>
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                <StarRow value={userRating} interactive onRate={setUserRating} />
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "var(--color-outline)" }}>
                  {userRating > 0 ? `Tu calificación: ${userRating}/10` : "Toca las estrellas para calificar (opcional)"}
                </p>
              </div>
              <MarkdownComposer
                value={reviewText}
                onChange={setReviewText}
                rows={5}
                placeholder="Escribe tu review... ¿Que te parecio la historia, los personajes, la animacion?"
              />
              <ReviewImageFields value={reviewImages} onChange={setReviewImages} />
              {/* Spoiler toggle */}
              <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                <div onClick={() => setReviewSpoiler((v) => !v)} style={{ width: "36px", height: "20px", borderRadius: "10px", backgroundColor: reviewSpoiler ? "#e05c5c" : "var(--color-surface-container-highest)", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
                  <div style={{ position: "absolute", top: "2px", left: reviewSpoiler ? "18px" : "2px", width: "16px", height: "16px", borderRadius: "50%", backgroundColor: "var(--color-on-surface)", transition: "left 0.2s" }} />
                </div>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", color: reviewSpoiler ? "#e05c5c" : "var(--color-outline)" }}>
                  Contiene spoilers
                </span>
              </label>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() => { setReviewModal(false); setReviewSpoiler(false); setReviewImages([]); }}
                  style={{
                    flex: 1, padding: "13px",
                    border: "1px solid var(--color-divider-strong)",
                    backgroundColor: "transparent", color: "var(--color-on-surface-variant)",
                    borderRadius: "8px",
                    fontFamily: "'Manrope', sans-serif",
                    fontWeight: 600, fontSize: "0.9rem", cursor: "pointer",
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleReview}
                  disabled={saving || !reviewText.trim()}
                  style={{
                    flex: 2, padding: "13px",
                    backgroundColor: "#f5c518", color: "#3d2f00",
                    border: "none", borderRadius: "8px",
                    fontFamily: "'Manrope', sans-serif",
                    fontWeight: 700, fontSize: "0.9rem",
                    cursor: saving || !reviewText.trim() ? "not-allowed" : "pointer",
                    opacity: saving || !reviewText.trim() ? 0.5 : 1,
                  }}
                >
                  {saving ? "Publicando..." : "Publicar Review"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Review Modal */}
      {editModal && (
        <EditReviewModal
          review={editModal}
          saving={saving}
          onSave={handleEditReview}
          onClose={() => setEditModal(null)}
          overlayStyle={overlayStyle}
          modalStyle={modalStyle}
        />
      )}
    </div>
  );
}
