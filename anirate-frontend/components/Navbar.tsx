"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useLocale, type Locale } from "@/contexts/LocaleContext";
import { jikanApi } from "@/services/jikan";
import { notificacionesApi, socialApi } from "@/services/api";
import { contenidoPath } from "@/services/routes";
import type { Contenido, Notificacion } from "@/types";

interface NavLink {
  href: string;
  labelKey: string;
  icon: string;
  requiresAuth?: boolean;
}

const NAV_LINKS: NavLink[] = [
  { href: "/buscar",        labelKey: "browse",  icon: "explore" },
  { href: "/temporadas",    labelKey: "seasons", icon: "calendar_month" },
  { href: "/feed",          labelKey: "feed",    icon: "dynamic_feed",  requiresAuth: true },
  { href: "/recomendaciones", labelKey: "forYou", icon: "auto_awesome", requiresAuth: true },
  { href: "/mi-lista",      labelKey: "myList",  icon: "bookmarks",     requiresAuth: true },
  { href: "/listas",        labelKey: "lists",   icon: "format_list_bulleted" },
  { href: "/estadisticas",  labelKey: "stats",   icon: "bar_chart" },
];

const HIDDEN_PATHS = ["/login", "/registro"];
const RECENT_KEY = "anirate_recent_searches";
const MAX_RECENT = 6;

function saveRecent(q: string) {
  try {
    const prev: string[] = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
    const updated = [q, ...prev.filter((r) => r !== q)].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  } catch { /* ignore */ }
}

function getRecent(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]"); } catch { return []; }
}

function removeRecent(q: string) {
  try {
    const prev: string[] = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
    localStorage.setItem(RECENT_KEY, JSON.stringify(prev.filter((r) => r !== q)));
  } catch { /* ignore */ }
}

function DropdownItem({ href, icon, label, onClick }: { href: string; icon: string; label: string; onClick: () => void }) {
  return (
    <Link href={href} onClick={onClick}
      style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 16px", color: "var(--color-on-surface-variant)", textDecoration: "none", fontSize: "0.875rem", fontFamily: "'Inter', sans-serif", transition: "background 0.15s" }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-hover-bg)")}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
    >
      <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "17px", color: "var(--color-outline)" }}>{icon}</span>
      {label}
    </Link>
  );
}

function ThemeToggle() {
  const { mode, cycle } = useTheme();
  const icon = mode === "light" ? "light_mode" : mode === "dark" ? "dark_mode" : "contrast";
  const label = mode === "light" ? "Tema claro" : mode === "dark" ? "Tema oscuro" : "Tema sistema";
  return (
    <button onClick={cycle} aria-label={label} title={label}
      style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-outline)", padding: "4px", display: "flex", alignItems: "center", justifyContent: "center", transition: "color 0.2s" }}
      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-on-surface)")}
      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-outline)")}
    >
      <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "22px" }}>{icon}</span>
    </button>
  );
}

function SearchBox({ onNavigate }: { onNavigate?: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Contenido[]>([]);
  const [userSuggestions, setUserSuggestions] = useState<{ id: number; nombre: string }[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showDropdown = focused && (query.trim().length > 0 ? suggestions.length > 0 || userSuggestions.length > 0 || loading : recentSearches.length > 0);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (!q.trim()) { setSuggestions([]); setUserSuggestions([]); return; }
    setLoading(true);
    try {
      const [anime, manga, users] = await Promise.allSettled([
        jikanApi.searchAnime(q, 5),
        jikanApi.searchManga(q, 4),
        socialApi.search(q),
      ]);
      const results = [
        ...(anime.status === "fulfilled" ? anime.value : []),
        ...(manga.status === "fulfilled" ? manga.value : []),
      ].slice(0, 8);
      setSuggestions(results);
      setUserSuggestions(users.status === "fulfilled" ? users.value.slice(0, 4) : []);
    } catch { setSuggestions([]); setUserSuggestions([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      void Promise.resolve().then(() => {
        setSuggestions([]);
        setUserSuggestions([]);
        setLoading(false);
      });
      return;
    }
    debounceRef.current = setTimeout(() => fetchSuggestions(query), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, fetchSuggestions]);

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setFocused(false);
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable) return;
      e.preventDefault();
      inputRef.current?.focus();
      inputRef.current?.select();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function handleFocus() {
    setRecentSearches(getRecent());
    setFocused(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    saveRecent(q);
    setFocused(false);
    router.push(`/buscar?q=${encodeURIComponent(q)}`);
    onNavigate?.();
  }

  function handleSelectSuggestion(item: Contenido) {
    saveRecent(item.titulo);
    setQuery("");
    setFocused(false);
    router.push(contenidoPath(item));
    onNavigate?.();
  }

  function handleSelectRecent(q: string) {
    setQuery(q);
    setFocused(false);
    saveRecent(q);
    router.push(`/buscar?q=${encodeURIComponent(q)}`);
    onNavigate?.();
  }

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <form onSubmit={handleSubmit}>
        <div style={{ position: "relative" }}>
          <span className="material-symbols-outlined" aria-hidden="true" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: focused ? "#f5c518" : "var(--color-outline)", fontSize: "17px", pointerEvents: "none", transition: "color 0.2s" }}>search</span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Buscar anime, manga...  (presiona / )"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={handleFocus}
            onKeyDown={(e) => {
              if (e.key === "Escape") { setFocused(false); inputRef.current?.blur(); }
            }}
            style={{ width: "260px", backgroundColor: "var(--color-surface-container-low)", border: `1px solid ${focused ? "#f5c518" : "var(--color-divider-strong)"}`, borderRadius: focused && showDropdown ? "8px 8px 0 0" : "8px", padding: "8px 14px 8px 36px", color: "var(--color-on-surface)", fontSize: "0.85rem", outline: "none", transition: "border-color 0.2s, border-radius 0.1s" }}
          />
        </div>
      </form>

      {/* Dropdown */}
      {showDropdown && (
        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, backgroundColor: "var(--color-surface-container-low)", border: "1px solid #f5c518", borderTop: "none", borderRadius: "0 0 10px 10px", boxShadow: "0 12px 40px var(--color-scrim-strong)", zIndex: 200, overflow: "hidden", maxHeight: "420px", overflowY: "auto" }}>
          {query.trim() ? (
            /* Suggestions */
            loading ? (
              <div style={{ padding: "16px", textAlign: "center", color: "var(--color-outline)", fontFamily: "'Inter', sans-serif", fontSize: "0.8rem" }}>Buscando...</div>
            ) : (
              <>
                {suggestions.map((item) => (
                  <button key={item.id} onMouseDown={() => handleSelectSuggestion(item)}
                    style={{ width: "100%", display: "flex", alignItems: "center", gap: "12px", padding: "10px 14px", background: "none", border: "none", cursor: "pointer", textAlign: "left", transition: "background 0.1s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-hover-bg)")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <div style={{ position: "relative", width: "32px", height: "46px", borderRadius: "4px", overflow: "hidden", backgroundColor: "var(--color-surface-container-high)", flexShrink: 0 }}>
                      {item.imagen && <Image src={item.imagen} alt={item.titulo} fill sizes="32px" style={{ objectFit: "cover" }} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: "0.85rem", color: "var(--color-on-surface)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.titulo}</p>
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "var(--color-outline)", marginTop: "2px" }}>
                        <span style={{ color: item.tipo === "ANIME" ? "#b7c4ff" : "#d3bbff", fontWeight: 600 }}>{item.tipo}</span>
                        {item.año ? ` · ${item.año}` : ""}
                        {(item.rating_promedio ?? 0) > 0 ? ` · ★ ${item.rating_promedio?.toFixed(1)}` : ""}
                      </p>
                    </div>
                  </button>
                ))}
                {userSuggestions.length > 0 && (
                  <>
                    <div style={{ padding: "6px 14px 2px", borderTop: "1px solid var(--color-divider)" }}>
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: "var(--color-outline)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>Usuarios</span>
                    </div>
                    {userSuggestions.map((u) => (
                      <button key={`u-${u.id}`} onMouseDown={() => { setQuery(""); setFocused(false); router.push(`/usuario/${u.id}`); onNavigate?.(); }}
                        style={{ width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "9px 14px", background: "none", border: "none", cursor: "pointer", textAlign: "left", transition: "background 0.1s" }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-hover-bg)")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                      >
                        <div style={{ width: "28px", height: "28px", borderRadius: "50%", backgroundColor: "#f5c518", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "10px", color: "#3d2f00", flexShrink: 0 }}>
                          {u.nombre.slice(0, 2).toUpperCase()}
                        </div>
                        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.85rem", color: "var(--color-on-surface-variant)" }}>{u.nombre}</span>
                      </button>
                    ))}
                  </>
                )}
                <button onMouseDown={handleSubmit as unknown as React.MouseEventHandler}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", background: "var(--color-primary-soft)", border: "none", borderTop: "1px solid var(--color-divider)", cursor: "pointer", color: "#f5c518", fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", fontWeight: 600 }}
                >
                  <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "15px" }}>search</span>
                  Ver todos los resultados de &ldquo;{query}&rdquo;
                </button>
              </>
            )
          ) : (
            /* Recent searches */
            <>
              <div style={{ padding: "8px 14px 4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: "var(--color-outline)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>Búsquedas recientes</span>
                <button onMouseDown={() => { localStorage.removeItem(RECENT_KEY); setRecentSearches([]); }} style={{ background: "none", border: "none", color: "var(--color-outline)", fontSize: "10px", fontFamily: "'Inter', sans-serif", cursor: "pointer" }}>Limpiar</button>
              </div>
              {recentSearches.map((r) => (
                <div key={r} style={{ display: "flex", alignItems: "center" }}>
                  <button onMouseDown={() => handleSelectRecent(r)}
                    style={{ flex: 1, display: "flex", alignItems: "center", gap: "10px", padding: "9px 14px", background: "none", border: "none", cursor: "pointer", textAlign: "left", transition: "background 0.1s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-hover-bg-soft)")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "15px", color: "var(--color-outline)" }}>history</span>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.85rem", color: "var(--color-on-surface-variant)" }}>{r}</span>
                  </button>
                  <button onMouseDown={(e) => { e.stopPropagation(); removeRecent(r); setRecentSearches(getRecent()); }}
                    style={{ background: "none", border: "none", color: "var(--color-outline)", cursor: "pointer", padding: "9px 12px" }}>
                    <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "14px" }}>close</span>
                  </button>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function LocaleSwitcher() {
  const { locale, setLocale } = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const OPTIONS: { code: Locale; label: string }[] = [
    { code: "es", label: "ES" },
    { code: "en", label: "EN" },
    { code: "pt-BR", label: "PT" },
  ];

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  const current = OPTIONS.find((o) => o.code === locale) ?? OPTIONS[0];

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => setOpen((v) => !v)} aria-label={`Idioma: ${current.label}`}
        style={{ background: "none", border: "1px solid var(--color-divider)", borderRadius: "6px", padding: "4px 10px", cursor: "pointer", color: "var(--color-outline)", fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.05em" }}>
        {current.label}
      </button>
      {open && (
        <div style={{ position: "absolute", top: "100%", right: 0, marginTop: "6px", backgroundColor: "var(--color-surface-container-high)", border: "1px solid var(--color-divider-strong)", borderRadius: "8px", padding: "4px", minWidth: "80px", zIndex: 100 }}>
          {OPTIONS.map((o) => (
            <button key={o.code} onClick={() => { setLocale(o.code); setOpen(false); }}
              style={{ width: "100%", textAlign: "left", padding: "6px 10px", border: "none", background: o.code === locale ? "rgba(245,197,24,0.15)" : "transparent", color: o.code === locale ? "#f5c518" : "var(--color-on-surface-variant)", fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer", borderRadius: "4px" }}>
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isMobile } = useBreakpoint();
  const { user, isLoggedIn, logout } = useAuth();
  const tNav = useTranslations("nav");
  const tSettings = useTranslations("settings");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notificacion[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    void Promise.resolve().then(() => setMenuOpen(false));
  }, [pathname]);

  useEffect(() => {
    if (!isLoggedIn) {
      void Promise.resolve().then(() => setUnreadCount(0));
      return;
    }
    notificacionesApi.unreadCount().then(setUnreadCount).catch(() => {});
    const interval = setInterval(() => {
      notificacionesApi.unreadCount().then(setUnreadCount).catch(() => {});
    }, 60000);
    return () => clearInterval(interval);
  }, [isLoggedIn, pathname]);

  async function handleOpenNotif() {
    setNotifOpen((o) => !o);
    if (!notifOpen) {
      // Lazy sync de airing/episodios (max 1 vez cada 30min por client)
      try {
        const SYNC_KEY = "anirate_airing_sync_at";
        const last = Number(localStorage.getItem(SYNC_KEY) ?? 0);
        if (Date.now() - last > 30 * 60 * 1000) {
          notificacionesApi.syncAiring().then((res) => {
            localStorage.setItem(SYNC_KEY, String(Date.now()));
            if (res.created > 0) {
              notificacionesApi.unreadCount().then(setUnreadCount).catch(() => {});
            }
          }).catch(() => {});
        }
      } catch { /* ignore */ }
      try {
        const { items } = await notificacionesApi.getAll();
        setNotifs(items);
        if (unreadCount > 0) {
          await notificacionesApi.markAllRead();
          setUnreadCount(0);
          setNotifs(items.map((n) => ({ ...n, leida: true })));
        }
      } catch { /* ignore */ }
    }
  }

  if (HIDDEN_PATHS.includes(pathname)) return null;

  function handleLogout() {
    logout();
    setDropdownOpen(false);
    setMenuOpen(false);
    router.push("/login");
  }

  const userName = user?.nombre ?? null;
  const initials = userName ? userName.slice(0, 2).toUpperCase() : "";

  return (
    <>
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, backgroundColor: "color-mix(in srgb, var(--color-surface) 70%, transparent)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", boxShadow: "0px 4px 20px var(--color-primary-soft-strong)", borderBottom: "1px solid var(--color-divider)", height: "64px" }}>
        <div style={{ maxWidth: "1536px", margin: "0 auto", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: isMobile ? "0 16px" : "0 32px", gap: "16px" }}>

          {/* Logo */}
          <Link href="/" style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 900, fontSize: "1.5rem", letterSpacing: "-0.04em", color: "#f5c518", textDecoration: "none", flexShrink: 0 }}>
            AniRate
          </Link>

          {/* Desktop nav links */}
          {!isMobile && (
            <div style={{ display: "flex", alignItems: "center", gap: "24px", flex: 1 }}>
              {NAV_LINKS.filter((l) => !l.requiresAuth || isLoggedIn).map((l) => {
                const isActive = pathname === l.href;
                return (
                  <Link key={l.href} href={l.href} style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: "0.9rem", letterSpacing: "-0.01em", color: isActive ? "#f5c518" : "var(--color-outline)", textDecoration: "none", borderBottom: isActive ? "2px solid #f5c518" : "2px solid transparent", paddingBottom: "2px", transition: "color 0.2s" }}
                    onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = "var(--color-on-surface)"; }}
                    onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = "var(--color-outline)"; }}
                  >
                    {tNav(l.labelKey)}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Right section */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* Desktop autocomplete search */}
            {!isMobile && <SearchBox />}

            {/* Theme toggle (desktop) */}
            {!isMobile && <ThemeToggle />}

            {/* Locale switcher (desktop) */}
            {!isMobile && <LocaleSwitcher />}

            {/* Notification bell (desktop, logged in) */}
            {!isMobile && isLoggedIn && (
              <div ref={notifRef} style={{ position: "relative" }}>
                <button onClick={handleOpenNotif}
                  style={{ position: "relative", background: "none", border: "none", cursor: "pointer", color: notifOpen ? "#f5c518" : "var(--color-outline)", padding: "4px", display: "flex", alignItems: "center", justifyContent: "center", transition: "color 0.2s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-on-surface)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = notifOpen ? "#f5c518" : "var(--color-outline)")}
                >
                  <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "22px" }}>notifications</span>
                  {unreadCount > 0 && (
                    <span style={{ position: "absolute", top: "0", right: "0", backgroundColor: "var(--color-danger)", color: "#fff", borderRadius: "50%", width: "16px", height: "16px", fontSize: "10px", fontFamily: "'Inter', sans-serif", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>
                {notifOpen && (
                  <div style={{ position: "absolute", top: "calc(100% + 10px)", right: "-60px", width: "320px", backgroundColor: "var(--color-surface-container-low)", border: "1px solid var(--color-divider-strong)", borderRadius: "12px", boxShadow: "0 8px 32px var(--color-scrim)", overflow: "hidden", zIndex: 100 }}>
                    <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--color-divider)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.9rem", color: "var(--color-on-surface)" }}>Notificaciones</span>
                    </div>
                    <div style={{ maxHeight: "360px", overflowY: "auto" }}>
                      {notifs.length === 0 ? (
                        <div style={{ padding: "24px 16px", textAlign: "center", color: "var(--color-outline)", fontFamily: "'Inter', sans-serif", fontSize: "0.85rem" }}>
                          <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "32px", display: "block", marginBottom: "8px", opacity: 0.4 }}>notifications_off</span>
                          Sin notificaciones
                        </div>
                      ) : (
                        notifs.map((n) => (
                          <div key={n.id} style={{ padding: "12px 16px", borderBottom: "1px solid var(--color-hover-bg-soft)", backgroundColor: n.leida ? "transparent" : "var(--color-primary-soft)", display: "flex", gap: "10px", alignItems: "flex-start" }}>
                            <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "18px", color: n.tipo === "voto_review" ? "#f5c518" : n.tipo === "nuevo_episodio" ? "#64b5f6" : n.tipo === "lista_inicio" ? "#4caf50" : n.tipo === "mencion_review" || n.tipo === "mencion_respuesta" ? "#ce93d8" : "var(--color-outline)", flexShrink: 0, marginTop: "1px" }}>
                              {n.tipo === "voto_review" ? "thumb_up" : n.tipo === "nuevo_episodio" ? "play_circle" : n.tipo === "lista_inicio" ? "play_arrow" : n.tipo === "mencion_review" || n.tipo === "mencion_respuesta" ? "alternate_email" : "notifications"}
                            </span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.82rem", color: "var(--color-on-surface-variant)", margin: 0, lineHeight: 1.4 }}>{n.mensaje}</p>
                              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: "var(--color-outline)", margin: "4px 0 0" }}>
                                {new Date(n.fecha).toLocaleDateString("es-ES", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Desktop auth */}
            {!isMobile && (
              isLoggedIn ? (
                <div ref={dropdownRef} style={{ position: "relative" }}>
                  <button onClick={() => setDropdownOpen((o) => !o)}
                    style={{ width: "34px", height: "34px", borderRadius: "50%", backgroundColor: "#f5c518", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, color: "#3d2f00", fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "12px", transition: "box-shadow 0.2s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 0 0 2px rgba(245,197,24,0.4)")}
                    onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
                  >
                    {initials}
                  </button>
                  {dropdownOpen && (
                    <div style={{ position: "absolute", top: "calc(100% + 10px)", right: 0, backgroundColor: "var(--color-surface-container-low)", border: "1px solid var(--color-divider-strong)", borderRadius: "10px", minWidth: "190px", boxShadow: "0 8px 32px var(--color-scrim)", overflow: "hidden", zIndex: 100 }}>
                      <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--color-divider)" }}>
                        <p style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.875rem", color: "var(--color-on-surface)", margin: 0 }}>{userName}</p>
                      </div>
                      <div style={{ padding: "4px 0" }}>
                        <DropdownItem href="/perfil" icon="person" label="Mi Perfil" onClick={() => setDropdownOpen(false)} />
                        <DropdownItem href="/configuracion" icon="settings" label="Configuración" onClick={() => setDropdownOpen(false)} />
                        {user?.tipo === "admin" && (
                          <>
                            <DropdownItem href="/admin/reportes" icon="gavel" label={tSettings("adminReportsMenu")} onClick={() => setDropdownOpen(false)} />
                            <DropdownItem href="/admin/usuarios" icon="manage_accounts" label={tSettings("adminUsersMenu")} onClick={() => setDropdownOpen(false)} />
                            <DropdownItem href="/admin/mail" icon="analytics" label={tSettings("adminMailMenu")} onClick={() => setDropdownOpen(false)} />
                            <DropdownItem href="/admin/auditoria" icon="history" label={tSettings("adminAuditMenu")} onClick={() => setDropdownOpen(false)} />
                          </>
                        )}
                        <div style={{ height: "1px", backgroundColor: "var(--color-divider)", margin: "4px 0" }} />
                        <button onClick={handleLogout}
                          style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%", padding: "9px 16px", background: "none", border: "none", cursor: "pointer", color: "var(--color-danger)", fontSize: "0.875rem", fontFamily: "'Inter', sans-serif", textAlign: "left", transition: "background 0.15s" }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(224,92,92,0.08)")}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                        >
                          <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "17px" }}>logout</span>
                          Cerrar sesión
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Link href="/login" style={{ padding: "7px 16px", borderRadius: "8px", border: "1px solid var(--color-divider-strong)", color: "var(--color-on-surface-variant)", textDecoration: "none", fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: "0.875rem", transition: "border-color 0.2s, color 0.2s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#f5c518"; e.currentTarget.style.color = "#f5c518"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--color-divider-strong)"; e.currentTarget.style.color = "var(--color-on-surface-variant)"; }}
                  >
                    Iniciar sesión
                  </Link>
                  <Link href="/registro" style={{ padding: "7px 16px", borderRadius: "8px", backgroundColor: "#f5c518", color: "#3d2f00", textDecoration: "none", fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.875rem", transition: "box-shadow 0.2s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 0 10px rgba(245,197,24,0.35)")}
                    onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
                  >
                    Crear cuenta
                  </Link>
                </div>
              )
            )}

            {/* Mobile hamburger */}
            {isMobile && (
              <>
                <ThemeToggle />
                <button onClick={() => setMenuOpen((o) => !o)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-on-surface-variant)", padding: "4px", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "26px" }}>{menuOpen ? "close" : "menu"}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {isMobile && menuOpen && (
        <div style={{ position: "fixed", top: "64px", left: 0, right: 0, zIndex: 49, backgroundColor: "color-mix(in srgb, var(--color-surface) 97%, transparent)", backdropFilter: "blur(16px)", borderBottom: "1px solid var(--color-divider)", padding: "20px 16px 24px", display: "flex", flexDirection: "column", gap: "4px" }}>
          {/* Mobile search with autocomplete */}
          <div style={{ marginBottom: "12px" }}>
            <SearchBox onNavigate={() => setMenuOpen(false)} />
          </div>

          {/* Nav links */}
          {NAV_LINKS.filter((l) => !l.requiresAuth || isLoggedIn).map((l) => {
            const isActive = pathname === l.href;
            return (
              <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
                style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 8px", color: isActive ? "#f5c518" : "var(--color-on-surface-variant)", textDecoration: "none", fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: "1rem", borderRadius: "8px", backgroundColor: isActive ? "var(--color-primary-soft-strong)" : "transparent" }}
              >
                <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "20px" }}>{l.icon}</span>
                {tNav(l.labelKey)}
              </Link>
            );
          })}

          <div style={{ height: "1px", backgroundColor: "var(--color-divider)", margin: "8px 0" }} />

          {isLoggedIn ? (
            <>
              <div style={{ padding: "8px 8px 12px", display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#f5c518", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "12px", color: "#3d2f00", flexShrink: 0 }}>{initials}</div>
                <span style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600, color: "var(--color-on-surface)", fontSize: "0.9rem" }}>{userName}</span>
              </div>
              <Link href="/perfil" onClick={() => setMenuOpen(false)} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 8px", color: "var(--color-on-surface-variant)", textDecoration: "none", fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: "1rem" }}>
                <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "20px" }}>person</span>Mi Perfil
              </Link>
              <Link href="/configuracion" onClick={() => setMenuOpen(false)} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 8px", color: "var(--color-on-surface-variant)", textDecoration: "none", fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: "1rem" }}>
                <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "20px" }}>settings</span>Configuración
              </Link>
              {user?.tipo === "admin" && (
                <>
                  <Link href="/admin/reportes" onClick={() => setMenuOpen(false)} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 8px", color: "var(--color-on-surface-variant)", textDecoration: "none", fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: "1rem" }}>
                    <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "20px" }}>gavel</span>{tSettings("adminReportsMenu")}
                  </Link>
                  <Link href="/admin/usuarios" onClick={() => setMenuOpen(false)} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 8px", color: "var(--color-on-surface-variant)", textDecoration: "none", fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: "1rem" }}>
                    <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "20px" }}>manage_accounts</span>{tSettings("adminUsersMenu")}
                  </Link>
                  <Link href="/admin/mail" onClick={() => setMenuOpen(false)} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 8px", color: "var(--color-on-surface-variant)", textDecoration: "none", fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: "1rem" }}>
                    <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "20px" }}>analytics</span>{tSettings("adminMailMenu")}
                  </Link>
                  <Link href="/admin/auditoria" onClick={() => setMenuOpen(false)} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 8px", color: "var(--color-on-surface-variant)", textDecoration: "none", fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: "1rem" }}>
                    <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "20px" }}>history</span>{tSettings("adminAuditMenu")}
                  </Link>
                </>
              )}
              <button onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 8px", background: "none", border: "none", cursor: "pointer", color: "var(--color-danger)", fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: "1rem", textAlign: "left" }}>
                <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "20px" }}>logout</span>Cerrar sesión
              </button>
            </>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", paddingTop: "4px" }}>
              <Link href="/login" onClick={() => setMenuOpen(false)} style={{ display: "block", textAlign: "center", padding: "12px", borderRadius: "8px", border: "1px solid var(--color-divider-strong)", color: "var(--color-on-surface-variant)", textDecoration: "none", fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: "0.95rem" }}>
                Iniciar sesión
              </Link>
              <Link href="/registro" onClick={() => setMenuOpen(false)} style={{ display: "block", textAlign: "center", padding: "12px", borderRadius: "8px", backgroundColor: "#f5c518", color: "#3d2f00", textDecoration: "none", fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.95rem" }}>
                Crear cuenta
              </Link>
            </div>
          )}
        </div>
      )}
    </>
  );
}
