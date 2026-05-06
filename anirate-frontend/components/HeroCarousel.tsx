"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { contenidoPath } from "@/services/routes";
import type { Contenido } from "@/types";

const AUTO_INTERVAL_MS = 6200;

function isUpcomingStatus(estado: string | undefined): boolean {
  if (!estado) return false;
  const s = estado.toLowerCase();
  return s.includes("not yet") || s.includes("upcoming");
}

type HeroBadgeKey = "heroBadgeUpcoming" | "heroBadgeAiring" | "heroBadgePublishing" | "heroBadgeComplete";

function heroBadgeKeyForSlide(slide: { tipo: string; estado: string }): HeroBadgeKey {
  if (isUpcomingStatus(slide.estado)) return "heroBadgeUpcoming";
  if (slide.tipo === "MANGA") {
    const s = slide.estado.toLowerCase();
    if (s.includes("finish") || s.includes("complete")) return "heroBadgeComplete";
    return "heroBadgePublishing";
  }
  return "heroBadgeAiring";
}

interface HeroCarouselProps {
  items: Contenido[];
}

export default function HeroCarousel({ items }: HeroCarouselProps) {
  const t = useTranslations("home");
  const { isMobile, isTablet } = useBreakpoint();
  const [index, setIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const safeItems = items.length ? items : [];
  const slide = safeItems[index] ?? null;
  const n = safeItems.length;

  useEffect(() => {
    setIndex((i) => (n <= 1 ? 0 : Math.min(i, n - 1)));
  }, [n]);

  const go = useCallback(
    (delta: number) => {
      if (n <= 1) return;
      setIndex((i) => (i + delta + n) % n);
    },
    [n]
  );

  useEffect(() => {
    if (n <= 1 || reducedMotion || paused) return;
    const id = window.setInterval(() => go(1), AUTO_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [n, reducedMotion, paused, go, index]);

  const bottomPad = isMobile ? "22px" : isTablet ? "36px" : "42px";
  const sidePad = isMobile ? "14px" : isTablet ? "28px" : "40px";
  const transition = useMemo(
    () => ({ duration: reducedMotion ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] as const }),
    [reducedMotion]
  );

  if (!slide) {
    return (
      <div
        style={{
          height: "min(560px, 78vh)",
          minHeight: "480px",
          backgroundColor: "var(--color-surface)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p style={{ color: "var(--color-outline-variant)" }}>{t("heroLoading")}</p>
      </div>
    );
  }

  const isAnime = slide.tipo === "ANIME";
  const statusBadgeKey = heroBadgeKeyForSlide(slide);

  const overlayTop = isAnime
    ? "linear-gradient(to top, color-mix(in srgb, var(--color-surface) 78%, transparent) 0%, color-mix(in srgb, var(--color-surface) 42%, transparent) 42%, transparent 100%)"
    : "linear-gradient(to top, color-mix(in srgb, var(--color-surface) 88%, transparent) 0%, color-mix(in srgb, var(--color-surface) 48%, transparent) 48%, transparent 92%)";
  const overlaySide = isAnime
    ? "linear-gradient(to right, color-mix(in srgb, var(--color-surface) 74%, transparent) 0%, color-mix(in srgb, var(--color-surface) 36%, transparent) 52%, transparent 100%)"
    : "linear-gradient(to right, color-mix(in srgb, var(--color-surface) 82%, transparent) 0%, color-mix(in srgb, var(--color-surface) 38%, transparent) 55%, transparent 96%)";

  return (
    <section
      role="region"
      aria-roledescription="carousel"
      aria-label={t("heroNoveltiesAria")}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{ position: "relative", width: "100%", height: "min(560px, 78vh)", minHeight: "480px", overflow: "hidden" }}
    >
      <span className="sr-only" aria-live="polite">
        {t("heroSlideStatus", { current: index + 1, total: n })}
        {slide.titulo}
      </span>

      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={slide.jikan_id ?? slide.id}
            initial={{ opacity: reducedMotion ? 1 : 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: reducedMotion ? 1 : 0 }}
            transition={transition}
            style={{ position: "absolute", inset: 0 }}
          >
            {slide.imagen ? (
              isAnime ? (
                <img
                  src={slide.imagen}
                  alt=""
                  aria-hidden="true"
                  decoding="async"
                  fetchPriority={index === 0 ? "high" : "low"}
                  className="home-hero-anime-cover"
                />
              ) : reducedMotion ? (
                <img
                  src={slide.imagen}
                  alt=""
                  aria-hidden="true"
                  decoding="async"
                  fetchPriority={index === 0 ? "high" : "low"}
                  className="home-hero-manga-front"
                  style={{ backgroundColor: "var(--color-surface-container-lowest)" }}
                />
              ) : (
                <>
                  <img
                    src={slide.imagen}
                    alt=""
                    aria-hidden="true"
                    decoding="async"
                    fetchPriority={index === 0 ? "high" : "low"}
                    className="home-hero-manga-fill"
                  />
                  <img
                    src={slide.imagen}
                    alt=""
                    aria-hidden="true"
                    decoding="async"
                    fetchPriority={index === 0 ? "high" : "low"}
                    className="home-hero-manga-front"
                  />
                </>
              )
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>

      <div
        style={{
          position: "absolute",
          inset: 0,
          background: overlayTop,
          zIndex: 1,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: overlaySide,
          zIndex: 1,
          pointerEvents: "none",
        }}
      />

      {n > 1 && (
        <>
          <button
            type="button"
            aria-label={t("heroCarouselPrev")}
            onClick={() => go(-1)}
            style={{
              position: "absolute",
              left: sidePad,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 20,
              width: 44,
              height: 44,
              borderRadius: "50%",
              border: "1px solid var(--color-divider-strong)",
              backgroundColor: "color-mix(in srgb, var(--color-surface) 85%, transparent)",
              color: "var(--color-on-surface)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "28px" }}>
              chevron_left
            </span>
          </button>
          <button
            type="button"
            aria-label={t("heroCarouselNext")}
            onClick={() => go(1)}
            style={{
              position: "absolute",
              right: sidePad,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 20,
              width: 44,
              height: 44,
              borderRadius: "50%",
              border: "1px solid var(--color-divider-strong)",
              backgroundColor: "color-mix(in srgb, var(--color-surface) 85%, transparent)",
              color: "var(--color-on-surface)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "28px" }}>
              chevron_right
            </span>
          </button>
          <nav
            aria-label={t("heroDotsLabel")}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: bottomPad,
              zIndex: 20,
              display: "flex",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            {safeItems.map((_, i) => (
              <button
                key={`dot-${safeItems[i]!.jikan_id ?? safeItems[i]!.id}`}
                type="button"
                aria-label={t("heroGoToSlide", { n: i + 1 })}
                aria-current={i === index ? "true" : undefined}
                onClick={() => setIndex(i)}
                style={{
                  width: i === index ? 22 : 8,
                  height: 8,
                  borderRadius: 4,
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  backgroundColor:
                    i === index ? "#f5c518" : "color-mix(in srgb, var(--color-outline) 50%, transparent)",
                  transition: "width 0.25s ease, background-color 0.2s",
                }}
              />
            ))}
          </nav>
        </>
      )}

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={slide.jikan_id ?? slide.id}
          initial={{ opacity: reducedMotion ? 1 : 0, y: reducedMotion ? 0 : 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: reducedMotion ? 1 : 0, y: reducedMotion ? 0 : -8 }}
          transition={transition}
          style={{
            position: "relative",
            zIndex: 10,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: `${bottomPad} ${sidePad} calc(${bottomPad} + ${n > 1 ? "18px" : "0px"})`,
            maxWidth: "1536px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              maxWidth: isMobile ? "min(100%, 360px)" : isTablet ? "min(100%, 420px)" : "440px",
              width: "100%",
              backgroundColor: "color-mix(in srgb, var(--color-surface) 38%, transparent)",
              border: "1px solid color-mix(in srgb, var(--color-divider-strong) 55%, transparent)",
              backdropFilter: "blur(4px)",
              borderRadius: "12px",
              padding: isMobile ? "11px 13px" : "13px 15px",
              boxShadow: "0 10px 32px rgba(0,0,0,0.24)",
            }}
          >
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#f5c518",
                marginBottom: "6px",
              }}
            >
              {t("heroNoveltiesKicker")}
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", flexWrap: "wrap" }}>
              <span
                style={{
                  backgroundColor: isAnime ? "rgba(0,64,203,0.2)" : "rgba(90,0,180,0.2)",
                  color: isAnime ? "#b7c4ff" : "#d3bbff",
                  fontSize: "10px",
                  fontWeight: 700,
                  padding: "2px 9px",
                  borderRadius: "20px",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                {slide.tipo}
              </span>
              <span
                style={{
                  backgroundColor:
                    statusBadgeKey === "heroBadgeUpcoming"
                      ? "rgba(245,197,24,0.15)"
                      : statusBadgeKey === "heroBadgePublishing" || statusBadgeKey === "heroBadgeComplete"
                        ? "rgba(180,140,255,0.12)"
                        : "rgba(80,220,140,0.12)",
                  color:
                    statusBadgeKey === "heroBadgeUpcoming"
                      ? "#f5e6a8"
                      : statusBadgeKey === "heroBadgePublishing" || statusBadgeKey === "heroBadgeComplete"
                        ? "#dcc9ff"
                        : "#b8f0cf",
                  fontSize: "10px",
                  fontWeight: 700,
                  padding: "2px 9px",
                  borderRadius: "20px",
                  letterSpacing: "0.05em",
                  fontFamily: "'Manrope', sans-serif",
                }}
              >
                {t(statusBadgeKey)}
              </span>
              {(slide.rating_promedio ?? 0) > 0 && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "3px",
                    color: "#f5c518",
                    fontFamily: "'Manrope', sans-serif",
                    fontWeight: 700,
                    fontSize: "0.8125rem",
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    aria-hidden="true"
                    style={{ fontSize: "16px", fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </span>
                  <span>{(slide.rating_promedio ?? 0).toFixed(1)}</span>
                </div>
              )}
            </div>

            <h1
              style={{
                fontFamily: "'Manrope', sans-serif",
                fontSize: isMobile ? "clamp(1.2rem, 4.2vw, 1.45rem)" : "clamp(1.28rem, 2.4vw, 1.75rem)",
                fontWeight: 700,
                color: "var(--color-on-surface)",
                lineHeight: 1.18,
                letterSpacing: "-0.02em",
                marginBottom: "10px",
                display: "-webkit-box",
                WebkitLineClamp: isMobile ? 3 : 4,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                wordBreak: "break-word",
              }}
              title={slide.titulo}
            >
              {slide.titulo}
            </h1>

            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                color: "var(--color-on-surface-variant)",
                fontSize: isMobile ? "0.8125rem" : "0.875rem",
                lineHeight: 1.55,
                marginBottom: "14px",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {slide.descripcion}
            </p>

            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <Link
                href={contenidoPath(slide)}
                style={{
                  backgroundColor: "#f5c518",
                  color: "#3d2f00",
                  padding: isMobile ? "9px 16px" : "10px 18px",
                  borderRadius: "6px",
                  fontFamily: "'Manrope', sans-serif",
                  fontWeight: 700,
                  fontSize: "0.8125rem",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "box-shadow 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 0 12px rgba(245,197,24,0.4)")}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
              >
                <span
                  className="material-symbols-outlined"
                  aria-hidden="true"
                  style={{ fontSize: "18px", fontVariationSettings: "'FILL' 1" }}
                >
                  play_arrow
                </span>
                {t("heroCtaDetails")}
              </Link>
              <Link
                href={contenidoPath(slide)}
                style={{
                  backgroundColor: "color-mix(in srgb, var(--color-surface) 80%, transparent)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid var(--color-divider-strong)",
                  color: "var(--color-on-surface)",
                  padding: isMobile ? "9px 16px" : "10px 18px",
                  borderRadius: "6px",
                  fontFamily: "'Manrope', sans-serif",
                  fontWeight: 700,
                  fontSize: "0.8125rem",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(42,42,42,0.8)")}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "color-mix(in srgb, var(--color-surface) 80%, transparent)")
                }
              >
                <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "18px" }}>
                  star_rate
                </span>
                {t("heroCtaRate")}
              </Link>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
