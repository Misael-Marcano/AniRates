import type {
  Contenido,
  ContenidoTipo,
  Review,
  ReviewRespuesta,
  ReviewVersion,
  Rating,
  Favorito,
  ListaItem,
  Notificacion,
} from "@/types";

import { notifyAuthInvalidated } from "./auth-sync";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001";

const TOKEN_KEY = "token";
const REFRESH_KEY = "refresh_token";

function readTokens(): { access: string | null; refresh: string | null } {
  if (typeof window === "undefined") return { access: null, refresh: null };
  return {
    access: localStorage.getItem(TOKEN_KEY),
    refresh: localStorage.getItem(REFRESH_KEY),
  };
}

function writeTokens(access: string, refresh: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
}

function clearTokens(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  notifyAuthInvalidated();
}

let refreshing: Promise<string | null> | null = null;

async function tryRefresh(): Promise<string | null> {
  if (refreshing) return refreshing;
  refreshing = (async () => {
    const { refresh } = readTokens();
    if (!refresh) return null;
    try {
      const res = await fetch(`${BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refresh }),
      });
      if (!res.ok) {
        clearTokens();
        return null;
      }
      const data = (await res.json()) as { access_token: string; refresh_token: string };
      writeTokens(data.access_token, data.refresh_token);
      return data.access_token;
    } catch {
      return null;
    } finally {
      refreshing = null;
    }
  })();
  return refreshing;
}

async function request<T>(path: string, options: RequestInit = {}, retryOn401 = true): Promise<T> {
  const { access } = readTokens();
  const headers: Record<string, string> = {};
  const isFormBody = typeof FormData !== "undefined" && options.body instanceof FormData;
  if (!isFormBody) {
    headers["Content-Type"] = "application/json";
  }
  if (options.headers) {
    Object.assign(headers, options.headers as Record<string, string>);
  }
  if (access) headers["Authorization"] = `Bearer ${access}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401 && retryOn401 && access) {
    const newAccess = await tryRefresh();
    if (newAccess) return request<T>(path, options, false);
  }

  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string | string[] };
    const raw = err.message;
    const msg = Array.isArray(raw) ? raw.join("; ") : (raw ?? `HTTP ${res.status}`);
    const e = new Error(msg) as Error & { status: number };
    e.status = res.status;
    throw e;
  }
  if (res.status === 204 || res.headers.get("content-length") === "0") {
    return undefined as T;
  }
  const text = await res.text();
  return text ? (JSON.parse(text) as T) : (undefined as T);
}

export const tokenStorage = { read: readTokens, write: writeTokens, clear: clearTokens };

export const LISTA_ESTADOS = ['viendo', 'completado', 'planificado', 'en_pausa', 'abandonado'] as const;
export type ListaEstado = typeof LISTA_ESTADOS[number];

export const ESTADO_LABELS: Record<ListaEstado, string> = {
  viendo:      'Viendo',
  completado:  'Completado',
  planificado: 'Planificado',
  en_pausa:    'En pausa',
  abandonado:  'Abandonado',
};

export const ESTADO_ICONS: Record<ListaEstado, string> = {
  viendo:      'play_circle',
  completado:  'check_circle',
  planificado: 'bookmark',
  en_pausa:    'pause_circle',
  abandonado:  'cancel',
};

export const ESTADO_COLORS: Record<ListaEstado, string> = {
  viendo:      '#4caf50',
  completado:  '#2196f3',
  planificado: '#f5c518',
  en_pausa:    '#ff9800',
  abandonado:  '#e05c5c',
};

// Lista
export const listaApi = {
  upsert: (data: ContenidoMeta & { estado: ListaEstado; progreso?: number; nota_personal?: string }) =>
    request<ListaItem>('/lista', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: { estado?: ListaEstado; progreso?: number; nota_personal?: string }) =>
    request<ListaItem>(`/lista/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  remove: (id: number) =>
    request<void>(`/lista/${id}`, { method: 'DELETE' }),
  getMine: () =>
    request<ListaItem[]>('/lista/me'),
  getItem: (jikanId: number) =>
    request<ListaItem | null>(`/lista/item?jikanId=${jikanId}`),
};

// Users
export interface AdminUserLookupRow {
  id: number;
  nombre: string;
  shadowbanned: boolean;
  banned: boolean;
}

export interface ModeracionLogRow {
  id: number;
  admin_id: number;
  accion: string;
  entidad_tipo: string | null;
  entidad_id: number | null;
  metadata: Record<string, unknown> | null;
  fecha: string;
  admin: { id: number; nombre: string } | null;
}

export interface MailMetricsSnapshot {
  smtp_attempts: number;
  smtp_delivered: number;
  smtp_failed: number;
  smtp_skipped_suppressed: number;
  console_only: number;
  last_failure_message: string | null;
  webhook_events: number;
  webhook_delivered_events: number;
  webhook_suppressions_new: number;
  webhook_suppressions_duplicate: number;
  webhook_unknown_recipient: number;
  webhook_soft_bounce_skipped: number;
  updated_at: string | null;
}

export interface JikanProxyMetricsSnapshot {
  proxy_requests: number;
  cache_hits: number;
  cache_misses: number;
  http_200: number;
  http_429: number;
  http_4xx_other: number;
  http_5xx: number;
  client_throttle_429: number;
  client_invalid_path_400: number;
  proxy_handler_errors: number;
  updated_at: string | null;
}

export interface PushVapidInfo {
  publicKey: string | null;
  configured: boolean;
}

export const pushApi = {
  getVapidPublicKey: () =>
    request<PushVapidInfo>("/push/vapid-public-key", {}, true),
  subscribe: (body: { endpoint: string; p256dh: string; auth: string }) =>
    request<void>("/push/subscribe", { method: "POST", body: JSON.stringify(body) }),
  unsubscribe: (endpoint: string) =>
    request<void>("/push/unsubscribe", {
      method: "POST",
      body: JSON.stringify({ endpoint }),
    }),
};

export const usersApi = {
  searchUsers: (q: string) =>
    request<{ id: number; nombre: string }[]>(`/users/search?q=${encodeURIComponent(q)}`),
  updateMe: (data: {
    nombre?: string;
    bio?: string;
    avatar_url?: string;
    currentPassword?: string;
    newPassword?: string;
    notification_prefs?: {
      email_mentions?: boolean;
      email_weekly_digest?: boolean;
      digest_timezone?: string;
      push_in_app_browser?: boolean;
      tipo_channels?: TipoChannelGrid;
    };
  }) =>
    request<{ access_token: string; refresh_token: string }>("/auth/me", { method: "PATCH", body: JSON.stringify(data) }),
  getMe: () => request<MeProfile>("/users/me"),
  getBadges: (userId: number) => request<Badge[]>(`/users/${userId}/badges`),
  exportMyData: () => request<Record<string, unknown>>("/users/me/export"),
  deleteMyAccount: () => request<{ message: string }>("/users/me", { method: "DELETE" }),
  reportUser: (userId: number, motivo?: string) =>
    request<{ ok: boolean }>(`/users/${userId}/report`, {
      method: "POST",
      body: JSON.stringify({ motivo: motivo ?? undefined }),
    }),
  listAdminUserReports: () => request<AdminUserReport[]>("/users/admin/user-reports"),
  setAdminUserReportResolved: (reportId: number, resuelto: boolean) =>
    request<AdminUserReport>(`/users/admin/user-reports/${reportId}`, {
      method: "PATCH",
      body: JSON.stringify({ resuelto }),
    }),
  adminLookupUsers: (q: string) =>
    request<AdminUserLookupRow[]>(`/users/admin/lookup?q=${encodeURIComponent(q)}`),
  setUserShadowban: (userId: number, shadowbanned: boolean) =>
    request<{ id: number; shadowbanned: boolean }>(
      `/users/admin/users/${userId}/shadowban`,
      { method: "PATCH", body: JSON.stringify({ shadowbanned }) },
    ),
  setUserBanned: (userId: number, banned: boolean) =>
    request<{ id: number; banned: boolean }>(
      `/users/admin/users/${userId}/ban`,
      { method: "PATCH", body: JSON.stringify({ banned }) },
    ),
  listModeracionLog: () =>
    request<ModeracionLogRow[]>("/users/admin/moderacion-log"),
  getAdminMailMetrics: () =>
    request<MailMetricsSnapshot>("/users/admin/mail-metrics"),
  getAdminJikanProxyMetrics: () =>
    request<JikanProxyMetricsSnapshot>("/users/admin/jikan-proxy-metrics"),
};

// Personajes / VAs
export interface PersonajeShort {
  id: number; mal_id: number; nombre: string; imagen?: string | null; about?: string | null;
}
export interface VoiceActorShort {
  id: number; mal_id: number; nombre: string; imagen?: string | null; idioma?: string | null;
}
export interface ContenidoPersonajeItem {
  id: number; rol: string; orden: number; personaje: PersonajeShort;
}
export interface PersonajeFull extends PersonajeShort {
  voice_actors: VoiceActorShort[];
}
export interface VoiceActorFull extends VoiceActorShort {
  personajes: PersonajeShort[];
}

export interface FavoritoPersonajeItem {
  id: number;
  usuario_id: number;
  personaje_id: number;
  personaje: PersonajeShort;
  fecha: string;
}

export const personajesApi = {
  byContenido: (jikanId: number) => request<ContenidoPersonajeItem[]>(`/contenido/${jikanId}/personajes`),
  one: (malId: number) => request<PersonajeFull>(`/personaje/${malId}`),
  voiceActor: (malId: number) => request<VoiceActorFull>(`/voice-actor/${malId}`),
  myFavorites: () => request<FavoritoPersonajeItem[]>("/me/favoritos-personajes"),
  isFavorite: (malId: number) => request<{ favorited: boolean }>(`/personaje/${malId}/is-favorito`),
  favorite: (malId: number) => request<{ favorited: boolean }>(`/personaje/${malId}/favorito`, { method: "POST" }),
  unfavorite: (malId: number) => request<{ favorited: boolean }>(`/personaje/${malId}/favorito`, { method: "DELETE" }),
};

// Watch / streaming providers
export interface StreamingEntry {
  provider: 'crunchyroll' | 'netflix' | 'hidive' | 'disney' | 'amazon' | 'hulu' | 'youtube';
  url: string;
  region?: string;
  type?: 'subscription' | 'free' | 'rent';
}
export interface WatchResponse {
  jikan_id: number;
  curated: StreamingEntry[];
  search: { provider: string; url: string }[];
}
export const watchApi = {
  byJikanId: (jikanId: number, title: string) => request<WatchResponse>(`/watch/${jikanId}?title=${encodeURIComponent(title)}`),
  listProviders: () => request<{ providers: string[] }>("/watch/providers"),
  idsByProvider: (provider: string) => request<{ jikan_ids: number[] }>(`/watch/by-provider/${provider}`),
};

// Import MAL / AniList
export interface ImportResult {
  imported: number;
  skipped: number;
  errors: number;
  total: number;
}
// Synopsis multi-idioma (AniList + Jikan fallback)
export interface SynopsisResponse {
  jikan_id: number;
  lang: "en" | "es" | "pt-BR" | "ja";
  source: "anilist" | "jikan" | "fallback";
  text: string;
  available_langs: string[];
}
export const synopsisApi = {
  get: (jikanId: number, lang: string, tipo: "anime" | "manga" = "anime") =>
    request<SynopsisResponse>(`/contenido/${jikanId}/synopsis?lang=${encodeURIComponent(lang)}&tipo=${tipo}`),
};

/** Arte editorial desde AniList (MAL id); mejor para hero que solo Jikan. */
export interface CoverArtResponse {
  jikan_id: number;
  tipo: "anime" | "manga";
  poster: string | null;
  banner: string | null;
  source: "anilist" | "none";
}

export const coverArtApi = {
  get: (jikanId: number, tipo: "anime" | "manga" = "anime") =>
    request<CoverArtResponse>(`/contenido/${jikanId}/cover-art?tipo=${tipo}`),
};

export interface AdminContenidoReport {
  id: number;
  contenido_id: number;
  reporter_id: number;
  motivo: string | null;
  fecha: string;
  resuelto: boolean;
  resuelto_en: string | null;
  contenido?: { id: number; jikan_id: number | null; titulo: string; tipo: string };
  reporter?: { id: number; nombre: string };
}

export const contenidoApi = {
  report: (jikanId: number, body: { titulo: string; tipo: string; motivo?: string }) =>
    request<{ ok: boolean }>(`/contenido/jikan/${jikanId}/report`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  listAdminReports: () => request<AdminContenidoReport[]>("/contenido/admin/reports"),
  setAdminReportResolved: (reportId: number, resuelto: boolean) =>
    request<AdminContenidoReport>(`/contenido/admin/reports/${reportId}`, {
      method: "PATCH",
      body: JSON.stringify({ resuelto }),
    }),
};

export const importApi = {
  mal: (xml: string) => request<ImportResult>("/import/mal", { method: "POST", body: JSON.stringify({ xml }) }),
  anilist: (username: string) => request<ImportResult>("/import/anilist", { method: "POST", body: JSON.stringify({ username }) }),
};

export interface Badge {
  id: string;
  label: string;
  icon: string;
  description: string;
  unlocked: boolean;
  progress?: { value: number; target: number };
}

/** Must match backend `Notificacion.tipo` + `notification-prefs.ts`. */
export const NOTIFICATION_TIPO_KEYS = [
  "voto_review",
  "nuevo_episodio",
  "lista_inicio",
  "mencion_review",
  "mencion_respuesta",
] as const;

export type NotificationTipoKey = (typeof NOTIFICATION_TIPO_KEYS)[number];

export type TipoChannelGrid = Record<
  NotificationTipoKey,
  { in_app: boolean; email: boolean; push: boolean }
>;

export interface MeProfile extends PublicProfile {
  email: string | null;
  notification_prefs: {
    email_mentions: boolean;
    email_weekly_digest: boolean;
    digest_timezone?: string;
    push_in_app_browser?: boolean;
    /** Resuelto en servidor (valores efectivos por tipo). */
    tipo_channels: TipoChannelGrid;
  };
}

// Auth
export interface LoginResponse {
  access_token?: string;
  refresh_token?: string;
  requires2FA?: boolean;
  pending_token?: string;
}

export interface TwoFactorStatus {
  enabled: boolean;
  pending_setup: boolean;
}

export interface TwoFactorSetupResponse {
  secret: string;
  otpauth_url: string;
  qr_data_url: string;
}

export interface OAuthAccountInfo {
  provider: string;
  email: string;
  created_at: string;
}

export const authApi = {
  login: (data: { email: string; password: string }) =>
    request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  loginVerify2FA: (pending_token: string, code: string) =>
    request<{ access_token: string; refresh_token: string }>("/auth/2fa/login-verify", {
      method: "POST",
      body: JSON.stringify({ pending_token, code }),
    }),
  register: (data: { nombre: string; email: string; password: string }) =>
    request<{ id: number; verifyToken?: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  verifyEmail: (token: string) =>
    request<{ message: string }>(`/auth/verify-email/${encodeURIComponent(token)}`),
  emailUnsubscribe: (token: string) =>
    request<{ ok: true }>("/auth/email-unsubscribe", {
      method: "POST",
      body: JSON.stringify({ token }),
    }),
  resendVerification: () =>
    request<{ message: string; devToken?: string }>("/auth/resend-verification", { method: "POST" }),
  forgotPassword: (email: string) =>
    request<{ message: string; devToken?: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
  resetPassword: (token: string, newPassword: string) =>
    request<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, newPassword }),
    }),
  listSessions: () =>
    request<SessionInfo[]>("/auth/sessions"),
  revokeSession: (id: number) =>
    request<{ message: string }>(`/auth/sessions/${id}`, { method: "DELETE" }),
  revokeAllOtherSessions: () =>
    request<{ count: number }>("/auth/sessions", { method: "DELETE" }),
  twoFactorStatus: () =>
    request<TwoFactorStatus>("/auth/2fa/status"),
  twoFactorSetup: () =>
    request<TwoFactorSetupResponse>("/auth/2fa/setup", { method: "POST" }),
  twoFactorEnable: (code: string) =>
    request<{ backup_codes: string[] }>("/auth/2fa/enable", { method: "POST", body: JSON.stringify({ code }) }),
  twoFactorDisable: (data: { password?: string; code?: string }) =>
    request<{ message: string }>("/auth/2fa/disable", { method: "POST", body: JSON.stringify(data) }),
  twoFactorRegenerateBackupCodes: (code: string) =>
    request<{ backup_codes: string[] }>("/auth/2fa/backup-codes", { method: "POST", body: JSON.stringify({ code }) }),
  listOAuthAccounts: () =>
    request<OAuthAccountInfo[]>("/auth/oauth/accounts"),
  unlinkOAuth: (provider: string) =>
    request<{ message: string }>(`/auth/oauth/${provider}`, { method: "DELETE" }),
};

export interface SessionInfo {
  id: number;
  user_agent: string | null;
  ip: string | null;
  created_at: string;
  last_used_at: string | null;
  current: boolean;
}

// Contenido metadata embedded in requests (for backend upsert)
interface ContenidoMeta {
  jikan_id: number;
  titulo: string;
  tipo: string;
  imagen?: string;
  año?: number;
  estado?: string;
  descripcion?: string;
}

// Ratings
export const ratingsApi = {
  rate: (data: ContenidoMeta & { puntuacion: number }) =>
    request<Rating>("/ratings", { method: "POST", body: JSON.stringify(data) }),
  getByContenido: (id: number) => request<Rating[]>(`/ratings/contenido/${id}`),
  getMine: () => request<(Rating & { contenido: import("@/types").Contenido; fecha: string })[]>("/ratings/me"),
  getDistribution: (id: number) => request<number[]>(`/ratings/distribution/${id}`),
  getDistributionByJikanId: (jikanId: number) => request<number[]>(`/ratings/distribution/jikan/${jikanId}`),
};

export interface Paginated<T> {
  items: T[];
  nextCursor: string | null;
}

export interface AdminReviewReport {
  id: number;
  review_id: number;
  reporter_id: number;
  motivo: string | null;
  fecha: string;
  resuelto: boolean;
  resuelto_en: string | null;
  review?: {
    id: number;
    comentario: string;
    usuario?: { id: number; nombre: string };
    contenido?: { id: number; jikan_id: number; titulo: string; tipo: ContenidoTipo };
  };
  reporter?: { id: number; nombre: string };
}

export interface AdminUserReport {
  id: number;
  reported_user_id: number;
  reporter_id: number;
  motivo: string | null;
  fecha: string;
  resuelto: boolean;
  resuelto_en: string | null;
  reported_user?: { id: number; nombre: string };
  reporter?: { id: number; nombre: string };
}

// Reviews — incluye metadata del contenido para upsert automático en backend
export const reviewsApi = {
  getUploadStatus: () => request<{ enabled: boolean }>("/reviews/upload-status"),
  uploadReviewImage: (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return request<{ url: string }>("/reviews/upload-imagen", { method: "POST", body: fd });
  },
  report: (reviewId: number, motivo?: string) =>
    request<{ ok: boolean }>(`/reviews/${reviewId}/report`, {
      method: "POST",
      body: JSON.stringify({ motivo: motivo ?? undefined }),
    }),

  listAdminReports: () => request<AdminReviewReport[]>("/reviews/admin/reports"),
  setAdminReportResolved: (reportId: number, resuelto: boolean) =>
    request<AdminReviewReport>(`/reviews/admin/reports/${reportId}`, {
      method: "PATCH",
      body: JSON.stringify({ resuelto }),
    }),

  create: (data: ContenidoMeta & { comentario: string; puntuacion?: number; es_spoiler?: boolean; imagenes?: string[] }) =>
    request<Review>("/reviews", { method: "POST", body: JSON.stringify(data) }),
  getByContenido: (jikanId: number, opts: { sort?: "recent" | "top"; cursor?: string; limit?: number } = {}) => {
    const qs = new URLSearchParams();
    if (opts.sort) qs.set("sort", opts.sort);
    if (opts.cursor) qs.set("cursor", opts.cursor);
    if (opts.limit) qs.set("limit", String(opts.limit));
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return request<Paginated<Review>>(`/reviews/contenido/${jikanId}${suffix}`);
  },
  getByUser: (userId: number) =>
    request<Review[]>(`/reviews/user/${userId}`),
  update: (id: number, data: Partial<Pick<Review, "comentario" | "puntuacion" | "es_spoiler" | "imagenes">>) =>
    request<Review>(`/reviews/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  setFeatured: (id: number, featured: boolean) =>
    request<Review>(`/reviews/${id}/featured`, { method: "PATCH", body: JSON.stringify({ featured }) }),
  delete: (id: number) => request<void>(`/reviews/${id}`, { method: "DELETE" }),
  vote: (id: number) => request<{ votos: number }>(`/reviews/${id}/vote`, { method: "POST" }),
  unvote: (id: number) => request<{ votos: number }>(`/reviews/${id}/vote`, { method: "DELETE" }),
  getMyVotes: (jikanId: number) => request<number[]>(`/reviews/my-votes?jikanId=${jikanId}`),
  getVersions: (reviewId: number) => request<ReviewVersion[]>(`/reviews/${reviewId}/versiones`),
  getReplies: (reviewId: number) => request<ReviewRespuesta[]>(`/reviews/${reviewId}/respuestas`),
  addReply: (reviewId: number, comentario: string) =>
    request<ReviewRespuesta>(`/reviews/${reviewId}/respuestas`, { method: "POST", body: JSON.stringify({ comentario }) }),
  deleteReply: (replyId: number) => request<void>(`/reviews/respuestas/${replyId}`, { method: "DELETE" }),
  getCounts: (jikanIds: number[]) => {
    if (jikanIds.length === 0) return Promise.resolve({} as Record<number, number>);
    return request<Record<number, number>>(`/reviews/counts?jikan_ids=${jikanIds.join(",")}`);
  },
};

// Listas personalizadas
export interface ListaPersonalizadaSummary {
  id: number;
  nombre: string;
  descripcion?: string;
  imagen_portada?: string;
  publica: boolean;
  slug: string;
  fecha_creada: string;
  fecha_actualizada: string;
  itemCount?: number;
}

export interface ListaPersonalizadaItem {
  id: number;
  lista_id: number;
  contenido_id: number;
  contenido: import("@/types").Contenido;
  orden: number;
  nota?: string;
  fecha_agregado: string;
}

export interface ListaPersonalizadaDetail extends ListaPersonalizadaSummary {
  usuario: { id: number; nombre: string };
  isOwner: boolean;
  items: ListaPersonalizadaItem[];
}

export const listasPersonalizadasApi = {
  listPublic: (limit = 20) => request<ListaPersonalizadaSummary[]>(`/listas/publicas?limit=${limit}`),
  listByUser: (userId: number) => request<ListaPersonalizadaSummary[]>(`/listas/usuario/${userId}`),
  getOne: (id: number) => request<ListaPersonalizadaDetail>(`/listas/${id}`),
  create: (data: { nombre: string; descripcion?: string; imagen_portada?: string; publica?: boolean }) =>
    request<ListaPersonalizadaSummary>("/listas", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: { nombre?: string; descripcion?: string; imagen_portada?: string; publica?: boolean }) =>
    request<ListaPersonalizadaSummary>(`/listas/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  remove: (id: number) => request<void>(`/listas/${id}`, { method: "DELETE" }),
  addItem: (id: number, data: ContenidoMeta & { nota?: string }) =>
    request<ListaPersonalizadaItem>(`/listas/${id}/items`, { method: "POST", body: JSON.stringify(data) }),
  removeItem: (id: number, itemId: number) =>
    request<void>(`/listas/${id}/items/${itemId}`, { method: "DELETE" }),
};

// Users / Social
export interface PublicProfile {
  id: number;
  nombre: string;
  bio: string | null;
  avatar_url: string | null;
  stats: {
    favoritos: number;
    reviews: number;
    ratings: number;
    lista: number;
    completados: number;
    horas_estimadas: number;
    seguidores: number;
    siguiendo: number;
  };
  isFollowing: boolean;
  isSelf: boolean;
}

export interface FeedEvent {
  tipo: "review" | "rating" | "lista";
  fecha: string;
  usuario: { id: number; nombre: string };
  contenido: import("@/types").Contenido;
  payload: { comentario?: string; puntuacion?: number; estado?: string; imagenes?: string[] | null };
}

export const socialApi = {
  getProfile: (id: number) => request<PublicProfile>(`/users/${id}`),
  follow: (id: number) => request<void>(`/users/${id}/seguir`, { method: "POST" }),
  unfollow: (id: number) => request<void>(`/users/${id}/seguir`, { method: "DELETE" }),
  getFollowers: (id: number) => request<{ id: number; nombre: string; fecha: string }[]>(`/users/${id}/seguidores`),
  getFollowing: (id: number) => request<{ id: number; nombre: string; fecha: string }[]>(`/users/${id}/siguiendo`),
  getFeed: () => request<FeedEvent[]>("/users/me/feed"),
  search: (q: string) => request<{ id: number; nombre: string }[]>(`/users/search?q=${encodeURIComponent(q)}`),
};

// Notificaciones
export const notificacionesApi = {
  getAll: (opts: { cursor?: string; limit?: number } = {}) => {
    const qs = new URLSearchParams();
    if (opts.cursor) qs.set("cursor", opts.cursor);
    if (opts.limit) qs.set("limit", String(opts.limit));
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return request<Paginated<Notificacion>>(`/notificaciones${suffix}`);
  },
  unreadCount: () => request<number>("/notificaciones/unread-count"),
  markRead: (id: number) => request<void>(`/notificaciones/${id}/leer`, { method: "PATCH" }),
  markAllRead: () => request<void>("/notificaciones/leer-todas", { method: "PATCH" }),
  syncAiring: () => request<{ checked: number; created: number }>("/notificaciones/sync", { method: "POST" }),
};

// Recomendaciones — collaborative filtering server-side
export interface RecomendacionItem {
  contenido_id: number;
  jikan_id: number | null;
  titulo: string;
  imagen: string | null;
  tipo: string;
  año: number | null;
  score: number;
  rating_promedio: number;
  total_ratings: number;
  source_jikan_id: number | null;
  source_titulo: string | null;
  generos?: { id: number; nombre: string }[];
}

export interface RecomendacionesResponse {
  items: RecomendacionItem[];
  strategy: 'cf' | 'content' | 'cold';
}

export const recomendacionesApi = {
  getForMe: (limit = 20) =>
    request<RecomendacionesResponse>(`/recomendaciones?limit=${limit}`),
};

// Favoritos — incluye metadata del contenido para upsert automático en backend
export const favoritosApi = {
  add: (data: ContenidoMeta) =>
    request<Favorito>("/favorites", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  remove: (id: number) =>
    request<void>(`/favorites/${id}`, { method: "DELETE" }),
  getByUser: (userId: number) =>
    request<Favorito[]>(`/favorites/user/${userId}`),
};
