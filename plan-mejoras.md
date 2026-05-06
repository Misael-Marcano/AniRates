# Plan de Mejoras — AniRates

> Objetivo: superar a IMDb en la experiencia de descubrimiento y seguimiento de anime/manga.
> Referencia: AniList, MyAnimeList, IMDb, Letterboxd.

---

## Estado actual (resumen)


| Módulo               | Estado                                                    |
| -------------------- | --------------------------------------------------------- |
| Browse + Búsqueda    | ✅ Funcional                                               |
| Detalle de contenido | ✅ Funcional                                               |
| Sistema de ratings   | ✅ Funcional                                               |
| Reviews de comunidad | ✅ Funcional                                               |
| Favoritos            | ✅ Funcional                                               |
| Perfil de usuario    | ✅ Completo (stats, ratings, reviews, lista, favoritos)    |
| Recomendaciones      | ✅ Funcional (content-based por géneros)                   |
| Perfiles públicos    | ✅ Funcional (`/usuario/[id]` con avatar/bio/stats/badges) |
| Sistema de listas    | ✅ Funcional (Watchlist con estados)                       |
| Social / Follows     | ✅ Funcional (follows + feed de actividad)                 |


---

## PRIORIDAD ALTA — Core de la plataforma

### ✅ 1. Sistema de lista de seguimiento (Watchlist)

**Por qué:** La diferencia más grande vs. Favoritos simples. MAL y AniList son exitosos porque los usuarios pueden organizar su colección con estados.

**Estados propuestos:**

- `Viendo` / `Leyendo`
- `Completado`
- `Planificado`
- `En pausa`
- `Abandonado`

**Cambios necesarios:**

- Nueva entidad `ListaItem` en BD: `usuario_id`, `contenido_id`, `estado`, `progreso_episodios`, `progreso_capitulos`, `fecha_inicio`, `fecha_fin`, `nota_personal`
- Reemplazar o complementar el módulo `Favorites` existente
- Nueva UI en perfil: tabla organizada por estado con progreso
- En la página de detalle: botón desplegable con los 5 estados en lugar de solo "Favoritos"
- Estadísticas en perfil: total visto, tiempo invertido (estimado por episodios × 24min)

---

### ✅ 2. Metadatos enriquecidos del contenido

**Por qué:** El detalle de contenido actual muestra muy poco. IMDb siempre gana en completitud de información.

**Datos disponibles en Jikan pero no usados actualmente:**

- `episodes` — número de episodios (anime)
- `chapters` / `volumes` — capítulos y tomos (manga)
- `studios` — estudio de animación
- `authors` — autor/ilustrador del manga
- `source` — adaptado de (manga, novela ligera, original, etc.)
- `type` — TV, Película, OVA, ONA, Especial / Manga, Manhwa, etc.
- `rating` — clasificación de edad (G, PG-13, R, etc.)
- `season` + `year` — temporada de emisión (Primavera 2024, etc.)
- `duration` — duración por episodio
- `trailer` — embed de YouTube del trailer oficial
- `broadcast` — día y hora de emisión en Japón
- `themes` — temáticas adicionales (Vampiros, Escolar, Viaje en el tiempo)
- `demographics` — Shounen, Shoujo, Seinen, Josei
- `relations` — precuelas, secuelas, adaptaciones, spin-offs
- `aired.from` / `aired.to` — fechas exactas de inicio y fin

**Cambios necesarios:**

- Ampliar la entidad `Contenido` en BD para almacenar estos campos
- Actualizar `findOrCreateByJikanId` para mapear y persistir la nueva metadata
- Rediseñar la sección de información en `/contenido/[id]`:
  - Grid de stats: episodios, duración total, estudio, temporada, clasificación
  - Sección "Relacionados": carrusel de precuelas/secuelas
  - Embed del trailer si existe
  - Tags de temáticas clicables que llevan a búsqueda filtrada

---

### ✅ 3. Perfil de usuario completo

**Por qué:** El perfil actual muestra solo nombre, email y favoritos. Letterboxd y AniList tienen perfiles ricos que fomentan la identidad del usuario.

**Mejoras:**

- ✅ **Tab Ratings funcional**: grid de contenidos calificados con puntuación, ordenado por fecha
- ✅ **Estadísticas reales**: KPIs (completados, puntuación media, género favorito, reviews), histograma de distribución 1-10, lista por estado, **horas estimadas** (5h × completados)
- ✅ **Actividad reciente**: timeline mergeado de reviews/ratings/lista en tab Estadísticas
- ✅ **Avatar personalizable**: campo `avatar_url` en Usuario + componente `Avatar` con prop `imageUrl` (fallback a iniciales si la URL falla). UI en `/configuracion`. Sin upload aún (URL externa); para Cloudinary/S3 queda hook opcional
- ✅ **Bio opcional**: campo `bio` (max 280) en Usuario, editable en `/configuracion` con contador, mostrado en `/perfil` y `/usuario/[id]`
- ✅ **Perfil público**: URL `/usuario/[id]` con avatar/bio/stats/badges visible sin login
- ✅ **Logros / badges**: endpoint `GET /users/:id/badges` computa 10 logros server-side (primer_review, crítico, súper crítico, calificador, explorador, completista, maratonista, conectado, popular, coleccionista) con progreso `{value, target}`. UI con tarjetas dorado/gris según unlock

---

### ✅ 4. Filtros y ordenación avanzados en Browse

**Por qué:** El browse actual solo filtra por tipo y género. MAL y AniList tienen filtros granulares que facilitan el descubrimiento.

**Filtros nuevos:**

- Estado del contenido: En emisión / Finalizado / Próximamente / En pausa
- Rango de año: slider de 1960 a hoy
- Temporada: Invierno / Primavera / Verano / Otoño
- Rango de puntuación: slider 1–10
- Tipo específico: TV / Película / OVA / ONA / Especial / Manga / Manhwa / Novela
- Duración: corto (< 15 min) / estándar / largo (película)
- Clasificación de edad: G / PG / PG-13 / R

**Opciones de ordenación:**

- Más popular (scored_by)
- Mejor puntuado (score)
- Más reciente (año desc)
- Más antiguo (año asc)
- Más reviews en AniRates
- Mejor puntuado en AniRates

**Cambios necesarios:**

- Ampliar parámetros del `searchAnimePaged` / `searchMangaPaged` en `jikan.ts`
- Actualizar la UI del sidebar con los nuevos controles

---

### ✅ 5. Recomendaciones personalizadas

**Por qué:** Es la mayor ventaja competitiva posible. IMDb las tiene pero son genéricas; AniList las tiene basadas en el grafo de usuarios.

**Fase 1 — Basadas en contenido (content-based):** ✅

- ✅ "Porque te gustó X": hook `useRecommendations` cliente, top géneros user × Jikan score>7.5
- ✅ "Tendencias del mismo género": misma lógica, mezcla anime+manga
- ✅ Sección "Para ti" en la home page

**Fase 2 — Basadas en usuarios (collaborative filtering):** ✅

- ✅ Item-based CF server-side. Algoritmo: para user U con ratings ≥7, encontrar usuarios V que coincidan en al menos 1 item con rating alto, agregar items que V calificó alto pero U no vio. Score = promedio ponderado por similitud Jaccard entre conjuntos de items "altos".
- ✅ Filtra items ya vistos por U (ratings, favoritos, listaItem).
- ✅ Cold start: si U tiene <3 ratings, fallback a content-based (top géneros del propio user, igual a Fase 1 pero server-side).
- ✅ Razón en respuesta: cada item lleva `{ source_jikan_id, source_titulo }` (item del catálogo del user que más contribuyó al score).
- ✅ Cache en memoria 30min por user (Map con TTL).
- ✅ Endpoint `GET /recomendaciones?limit=20` (auth, JWT).
- ✅ Frontend: `recomendacionesApi.getForMe()`, página `/recomendaciones` con grid + razón, sección "Para ti" en home consume server endpoint con fallback al hook cliente.

---

## PRIORIDAD MEDIA — Engagement y comunidad

### ✅ 6. Mejoras al sistema de reviews

**Por qué:** Las reviews son el corazón de la comunidad. Actualmente son básicas comparadas con Letterboxd o IMDb.

**Mejoras:**

- ✅ **Votos en reviews**: botón "Útil" (upvote), ordenar por más votadas
- ✅ **Edición de reviews**: modal de edición en `/contenido/[tipo]/[id]` (`EditReviewModal`)
- ✅ **Etiquetas de spoiler**: blur del comentario hasta clic en "Mostrar spoiler"
- ✅ **Limitación de una review por usuario por contenido**: backend lanza `ConflictException`
- ✅ **Ordenación**: server-side `sort=top|recent` con cursor pagination
- ✅ **Contador de reviews** visible en la card del catálogo: badge inferior derecho en `Card`, batch endpoint `GET /reviews/counts?jikan_ids=...`, consumido en `/buscar`
- ✅ **Review destacada**: cuando `sort=top` y la primera review tiene votos>0, se renderiza fuera del grid con borde dorado y badge "Review destacada"
- ✅ **Respuestas a reviews**: entidad `ReviewRespuesta` (review_id, usuario_id, comentario, fecha) + endpoints `GET/POST /reviews/:id/respuestas`, `DELETE /reviews/respuestas/:rid`. UI: botón "Responder" expande hilo lazy-loaded con textarea inline y borrado del autor

---

### ✅ 7. Búsqueda global mejorada

**Por qué:** La búsqueda actual es funcional pero básica.

**Mejoras:**

- ✅ **Autocompletado en el navbar**: dropdown debounce 300ms, mezcla anime+manga+usuarios, atajo `/` para focus
- ✅ **Búsqueda por estudio**: filtro en `/buscar` con autocomplete sobre `/producers` de Jikan; chips removibles; al seleccionar fuerza tipo=ANIME (Jikan no expone studios para manga). Autor/mangaka excluido por limitación del endpoint
- ✅ **Búsqueda por temporada**: cubierto por página `/temporadas`
- ✅ **Historial de búsquedas recientes**: localStorage `anirate_recent_searches`, máx 6, removible individual o "Limpiar todo"
- ✅ **Resultados con contexto visual**: thumbnail 32×46 en cada item del dropdown + tipo/año/score
- ✅ **Página de resultados vacíos mejorada**: chips con búsquedas populares (Attack on Titan, One Piece, Demon Slayer, Jujutsu Kaisen, Naruto, Berserk, Chainsaw Man, Frieren) + atajo "Limpiar todos los filtros"

---

### ✅ 8. Página de temporadas

**Por qué:** Es la feature más usada en AniList/MAL para descubrir contenido nuevo. Cada temporada tiene lanzamientos que la comunidad sigue.

**Contenido:**

- Calendario de temporadas: Invierno / Primavera / Verano / Otoño por año
- Grid de anime que estrenan esa temporada
- Indicador "Siguiente temporada"
- Filtro rápido por género dentro de la temporada
- URL: `/temporadas/2024/verano`

---

### ✅ 9. Sistema de notificaciones (básico)

**Por qué:** Incentiva el retorno a la plataforma.

**Notificaciones:**

- ✅ Alguien votó tu review como útil (`tipo='voto_review'`): `ReviewsService.vote` → `NotificacionesService.create` (in-app + push si aplica)
- ✅ **Nuevo episodio del anime que estás viendo** (`tipo='nuevo_episodio'`): `AiringSyncService` polea Jikan lazy y compara `last_known_episodes` por `ListaItem`
- ✅ **Anime planificado empezó a emitirse** (`tipo='lista_inicio'`): mismo servicio detecta cambio a `Currently Airing`
- ✅ Confirmación de acciones importantes (toasts en cliente)

**Implementación:** Bell icon en navbar, dropdown con cursor pagination, endpoints `GET /notificaciones`, `PATCH /notificaciones/:id/leer`, `PATCH /notificaciones/leer-todas`, `**POST /notificaciones/sync` (throttle 2/30min)** que recorre lista items viendo/planificado del usuario (max 25) con respeto al rate limit Jikan (400ms entre requests). Trigger lazy desde Navbar al abrir el dropdown, guardando timestamp en `localStorage['anirate_airing_sync_at']` con cooldown 30min client-side. `ListaItem` ahora persiste `last_known_status`, `last_known_episodes`, `last_synced_at`. Iconos diferenciados por tipo (thumb_up, play_circle, play_arrow).

---

### ✅ 10. Página de estadísticas globales

**Por qué:** Genera confianza y es contenido shareable. IMDb lo tiene con sus charts.

**Contenido:**

- Top 50 Anime de todos los tiempos (por rating AniRates)
- Top 50 Manga de todos los tiempos
- Reviews más votadas del mes
- Usuarios más activos
- Géneros más populares (gráfico de barras)
- Estadísticas de la plataforma: total de usuarios, reviews, ratings

---

## PRIORIDAD BAJA — Polish y features avanzadas

### ✅ 11. Sistema de listas personalizadas

**Por qué:** Letterboxd es exitoso principalmente por las listas creativas de sus usuarios.

- Crear lista con nombre, descripción, imagen de portada
- Listas públicas/privadas
- Compartir lista por URL: `/listas/[usuario]/[slug]`
- Clonar lista de otro usuario
- Listas predefinidas del sistema: "Top 10 de 2024", "Para ver este fin de semana"

---

### ✅ 12. Features sociales

**Por qué:** La retención a largo plazo depende de las conexiones sociales.

- **Seguir usuarios**: ver su actividad en feed
- **Feed de actividad**: timeline de las acciones de quienes sigues
- **Compartir en redes**: botón de share para detalle de contenido y reviews
- **Menciones**: @usuario en reviews
- **Perfil con actividad pública** para usuarios que lo habiliten

---

### ✅ 13. Corrección del sistema de autenticación

**Por qué:** Features de seguridad básicas que faltan.

- ✅ **Recuperación de contraseña**: flow completo — entidad `PasswordResetToken`, endpoints `/auth/forgot-password` y `/auth/reset-password`, páginas `/recuperar-contrasena` y `/resetear-contrasena/[token]`. En dev devuelve el token; producción requeriría integrar un servicio de email.
- ✅ **Verificación de email**: columna `email_verificado` en `Usuario`, entidad `EmailVerificationToken`, endpoints `/auth/verify-email/:token` y `/auth/resend-verification` (auth, throttle 3/h), página `/verificar-email/[token]`. Token se genera en register y se muestra en registro en dev mode.
- ✅ **Sesiones múltiples**: entidad `Sesion` con `jti`, `user_agent`, `ip`, `last_used_at`, `revoked_at`. Login crea sesión, JWT incluye `jti`, `JwtStrategy` valida que no esté revocada. Endpoints `GET /auth/sessions`, `DELETE /auth/sessions/:id`, `DELETE /auth/sessions`. UI en `/configuracion` lista dispositivos (parsea UA → device/browser + icon) y permite revocar individual o todos-excepto-actual. Cambio de contraseña revoca sesiones antiguas.
- ✅ **2FA opcional**: TOTP con apps como Google Authenticator/Authy. Entidad `TwoFactorSecret` (user_id unique, secret base32, enabled, backup_codes JSON de bcrypt-hashes). Endpoints `GET /auth/2fa/status`, `POST /auth/2fa/setup` (genera secret + QR data URL), `POST /auth/2fa/enable` (verifica código, activa, devuelve 10 backup codes), `POST /auth/2fa/disable` (password o código), `POST /auth/2fa/backup-codes` (regenera). Login de 2 pasos: si `two_factor_enabled` → devuelve `{ requires2FA: true, pending_token }` (JWT 5min con `purpose: '2fa'`); `POST /auth/2fa/login-verify` canjea pending_token + código por access_token. Backup codes consumidos al usarse. Frontend: `components/TwoFactorSection.tsx` en `/configuracion` + step 2 en `/login`.
- ✅ **Rate limiting en auth endpoints**: prevenir fuerza bruta (via `@nestjs/throttler`)

---

### ✅ 14. Optimizaciones técnicas (8/8 items)

**Por qué:** Rendimiento y mantenibilidad.

- ✅ **Caché de Jikan (capas)**:
  - **Cliente** (`anirate-frontend/services/jikan.ts`): memoria + `sessionStorage`, cola opcional si se usa API pública directa.
  - **Servidor** (Nest): proxy `**GET /jikan/v4/*`** → `api.jikan.moe`, caché `**CacheService` (Redis o memoria)**, cola única upstream + reintentos 429; header `**X-Cache: HIT|MISS`** para depuración. Frontend: `NEXT_PUBLIC_JIKAN_VIA_BACKEND=true` + `NEXT_PUBLIC_API_URL`; Docker Compose pasa el flag en build del frontend.
- ✅ **Global auth context**: `AuthContext` en React, usado por Navbar, páginas de perfil, favoritos, mi-lista, configuración, login y detalle
- ✅ **Resolver el ID hack de manga**: rutas ahora son `/contenido/anime/[id]` y `/contenido/manga/[id]`; helper `contenidoPath()` centraliza la generación de URLs
- ✅ **Race conditions en findOrCreate**: `jikan_id` ahora es `UNIQUE`; `findOrCreateByJikanId` maneja la excepción del constraint y re-consulta
- ✅ **Paginación con cursor**: helper `src/common/cursor.ts` (encode/decode base64url `sortKey|id` + `clampLimit`). Aplicado a `GET /reviews/contenido/:id` (query `sort=recent|top`, `cursor`, `limit`; ORDER BY tuple-compare para estabilidad con empates) y `GET /notificaciones` (cursor fecha + id). Respuesta `{ items, nextCursor }`. Frontend: `reviewsApi.getByContenido` + `notificacionesApi.getAll` aceptan cursor; botón "Cargar más" en detalle de contenido; sort server-side reemplaza el client-side.
- ✅ **Error boundaries en React**: `ErrorBoundary` envuelve el contenido principal en `layout.tsx`
- ✅ **Tests**: tests unitarios para `RatingsService`, `StatsService`, `UsersService` y `ListasPersonalizadasService` (32 tests con Jest, 100% pass)
- ✅ **Variables de entorno**: validadas con `class-validator` via `validateEnv` en `app.module.ts`

---

### ✅ 15. Mejoras de UI/UX avanzadas (8/8 items)

**Por qué:** Detalles que elevan la percepción de calidad.

- ✅ **Histograma de ratings**: en la página de detalle, distribución 1-10 con barras coloreadas (componente `RatingHistogram`)
- ✅ **Modo oscuro / claro**: toggle manual en Navbar (dark → light → system), persistido en `localStorage`; paleta light en `globals.css` vía `:root[data-theme="light"]`; script anti-FOUC en `layout.tsx`; `ThemeContext` expone `useTheme()`. Colores de marca (#f5c518 / #3d2f00) mantienen constancia entre temas.
- ✅ **Animaciones de página**: transiciones entre rutas con Framer Motion (`PageTransition`, respeta `prefers-reduced-motion`)
- ✅ **Skeleton loaders personalizados**: `Skeleton`, `SkeletonGrid` y `SkeletonRow` reutilizables — aplicados en favoritos, listas y feed
- ✅ **Infinite scroll**: en `/buscar` con `IntersectionObserver` que carga la siguiente página cuando el usuario se acerca al final; la paginación numerada sigue funcionando como fallback
- ✅ **PWA**: `manifest.ts` con nombre, icons, theme_color, display standalone; `viewport` y `apple-web-app` meta en layout
- ✅ **Atajos de teclado**: `/` enfoca la búsqueda del Navbar, `ESC` cierra el dropdown
- ✅ **Avatar con color determinístico** (reemplaza las iniciales en `Ratings Cards`, reviews y perfil): componente `Avatar` con paleta de 8 colores derivada de hash(userId)

---

## FASE 5 — Próxima iteración (recomendaciones tras revisión de código)

> Tras revisión del estado actual del repo (backend NestJS + frontend Next.js 16). Items 1-15 ya cubren el core IMDb-like. Esta fase ataca **producción, escala, calidad y diferenciación**.

---

### ✅ 16. SEO + Server-Side Rendering ⚠️ **CRÍTICO para descubrimiento orgánico**

**Por qué:** Hoy las páginas de detalle (`/contenido/[tipo]/[id]`) son `"use client"` puro. Google no indexa títulos/sinopsis/reviews → tráfico orgánico = 0. IMDb gana SEO con SSR + datos estructurados.

**Cambios:**

- ✅ Convertido `/contenido/[tipo]/[id]` a server component (`page.tsx`) con `generateMetadata` dinámico desde Jikan + cliente extraído a `ContenidoView.tsx`
- ✅ JSON-LD `schema.org/TVSeries` (anime) y `Book` (manga) inyectado server-side con aggregateRating/genres/dates
- ✅ `app/sitemap.ts` con rutas estáticas + top 500 contenidos + listas públicas (revalidate 24h)
- ✅ `app/robots.ts` con disallow de `/configuracion`, `/login`, `/registro`, `/recuperar-contrasena`, `/resetear-contrasena/`*, `/verificar-email/`*
- ✅ Open Graph + Twitter Card globales en `layout.tsx` + per-page en detalle
- ✅ `metadataBase` + canonical URLs por página
- Pendiente: Hreflang (sigue ítem 23 i18n)

---

### ✅ 17. Observabilidad + monitoreo ⚠️ **Prerrequisito de producción**

**Por qué:** No hay logs estructurados ni error tracking. En prod no se sabrá qué falla.

**Cambios:**

- ✅ Backend: `nestjs-pino` con JSON logs, `x-request-id` auto-generado, `user_id` desde JWT, redact de password/authorization, pino-pretty en dev
- ✅ Sentry frontend (`@sentry/nextjs` con client/server/edge configs + source maps via `withSentryConfig`) y backend (`@sentry/node` con profiling, init en `instrument.ts`, `setupExpressErrorHandler` en main)
- ✅ Health checks: `GET /health` (memory heap), `GET /ready` (DB ping + Jikan ping) con `@nestjs/terminus`
- ✅ Proxy Jikan: caché Redis/memoria + cabecera `**X-Cache: HIT|MISS**` en `/jikan/v4/*` + **métricas agregadas en memoria** (`JikanProxyMetricsService`: HIT/MISS, HTTP upstream, 429 propio, rutas inválidas); `GET /users/admin/jikan-proxy-metrics` (admin) y bloque en `/admin/mail`
- ⏭️ Pendiente: Métricas Prometheus, analytics Plausible/PostHog, Web Vitals, audit log de producto (acciones usuario)

---

### ✅ 18. Performance + escalabilidad

**Por qué:** App actual sirve para 1k usuarios. Para 100k+ faltan optimizaciones.

**Cambios:**

- ✅ `CacheService` con Redis (`ioredis`) + fallback in-memory si `REDIS_URL` ausente. Reemplaza Map cache 30min en `RecomendacionesService`. CacheModule global en `src/cache/`
- ✅ Índices compuestos vía `@Index` decorators en entidades + migración `1714200000000-AddCompositeIndexes` para prod (UNIQUE en Rating/Review/ReviewVoto/ListaItem/Favorito/Seguimiento + IX en Notificacion/Sesion/etc)
- ✅ Next/Image en `Card`, `HeroBanner`, `Navbar` autocomplete, `ContenidoView` poster (LCP). remotePatterns `cdn.myanimelist.net`, `img1.ak.crunchyroll.com`
- ✅ ISR en page server detalle: `revalidate: 3600` en fetch Jikan
- ✅ Sitemap revalidate 24h
- ✅ Migrados todos los `<img>` restantes a `<Image>` (estadisticas, feed, listas/[id], mi-lista, perfil 3x, TwoFactorSection)
- ✅ Connection pooling TypeORM: `pool.max` (10 dev / 50 prod), `pool.min` 2, `idleTimeoutMillis` 30s. Vars `DB_POOL_MAX`/`DB_POOL_MIN` en validación env
- ✅ Proxy Jikan centralizado (Redis + ritmo upstream): ver ítem **14** Optimizaciones técnicas.
- Pendiente: DataLoader N+1, edge runtime, read replicas

---

### ✅ 19. Testing más completo

**Por qué:** Backend tiene 32 tests unitarios; frontend **cero**. E2E inexistente.

**Cambios:**

- ✅ Vitest + RTL configurado (`vitest.config.ts`, `tests/setup.ts`). 31 tests pass: Avatar, Badge, Button, StarRating, RatingHistogram, jikan service, axe a11y components
- ✅ Playwright E2E configurado: `e2e/smoke.spec.ts` (6 smoke tests) + `e2e/a11y.spec.ts` (axe en 6 páginas)
- ✅ MSW configurado: `tests/mocks/handlers.ts` mock Jikan (anime/manga/seasons/producers) + `server.ts`. Activo en setup
- ✅ Coverage gates: backend `coverageThreshold` global 15% lines/functions/branches/statements (jest); frontend `vitest.config.ts` thresholds (5% lines/functions/statements, 30% branches). CI corre `test:cov`/`test:coverage`
- ✅ axe-core a11y: `vitest-axe` para componentes (5 componentes verde) + `@axe-core/playwright` para 6 páginas con tags wcag2a/wcag2aa
- Pendiente: tests integración DB real (testcontainers), visual regression Chromatic, subir coverage al ≥70% conforme se añadan tests

---

### ✅ 20. CI/CD + DevOps

**Por qué:** No hay GitHub Actions, ni Docker Compose dev, ni migraciones BD. `synchronize: true` en prod = pérdida de datos garantizada.

**Cambios:**

- ✅ GitHub Actions `.github/workflows/ci.yml`: lint + build + test backend, lint + typecheck + build frontend (push y PR a main)
- ✅ Migraciones TypeORM: `data-source.ts` standalone + scripts `migration:generate|run|revert|create|show`. `synchronize` solo dev, `migrationsRun: true` en producción
- ✅ Docker Compose extendido: añadidos `redis` + `adminer` al stack existente
- ✅ `.env.example` completo: NODE_ENV, MAIL_FROM, RESEND_API_KEY/SMTP_*, SENTRY_DSN, LOG_LEVEL, REDIS_URL
- Pendiente: Renovate/Dependabot, backups automáticos, deploy auto, Dockerfile non-root user

---

### ✅ 21. Email transaccional real

**Por qué:** Reset password y verify email devuelven el token en dev. En producción **no llegan emails**, así que las features no funcionan.

**Cambios:**

- ✅ `MailModule` global con `MailService` basado en Nodemailer. Provider auto-detect: Resend SMTP si `RESEND_API_KEY`, fallback SMTP genérico, fallback dev (consola)
- ✅ Templates inline TS para `welcome`, `verifyEmail`, `resetPasswordEmail` con HTML branded (#f5c518)
- ✅ Integrado en `AuthService.register` (verify + welcome), `resendVerification`, `forgotPassword` — devToken solo si dev y email no entregado
- ✅ Validación env en prod: requiere `MAIL_FROM` + (`RESEND_API_KEY` o `SMTP_HOST`) + `FRONTEND_URL`
- ✅ Helmet añadido a backend (`crossOriginResourcePolicy: cross-origin`)
- ✅ Aviso por **correo al mencionar** en review/respuesta: `ReviewsService` + `MailService.sendMentionNotice` si usuario tiene `email_mentions` (merge con default `true`), `email_verificado`, y SMTP/Resend configurado; enlace a `/contenido/{anime|manga}/{id}` (`FRONTEND_URL`)
- ✅ **Digest semanal por correo** (`DigestModule`): cron `@nestjs/schedule` domingo **09:00 UTC** por defecto (`WEEKLY_DIGEST_CRON`), sólo usuarios `email_weekly_digest` + email verificado; por usuario: nuevos seguidores (7d) + top 5 reviews globales por votos + hasta 5 recomendaciones (`RecomendacionesService`) + bloque **pulso comunidad** (reviews publicadas y nuevos follows en 7d, si hay actividad) + pie con **marca temporal en `notification_prefs.digest_timezone`** (UI `/configuracion`). **No envía** si no hay seguidores nuevos, ni reviews globales, ni recomendaciones personales. `DISABLE_WEEKLY_DIGEST_CRON=true` lo desactiva.
- ✅ **Unsubscribe one-click** (menciones / digest): pie HTML → frontend `**/email/unsubscribe?token=`** + `**POST /auth/email-unsubscribe`** `{ token }`; HMAC `JWT_SECRET` (~1 año). Alcances `mentions` / `digest` / `all` (reservado).
- ✅ **RFC 8058** en correos transaccionales opcionales: cabeceras `List-Unsubscribe` + `List-Unsubscribe-Post: List-Unsubscribe=One-Click` apuntando a `**POST /auth/email-unsubscribe/one-click?token=`** (body `application/x-www-form-urlencoded`); `**BACKEND_URL`** público HTTPS en prod + `express.urlencoded` en `main.ts`.
- ✅ **Aviso “nuevo inicio de sesión”**: tras login / OAuth / 2FA (no tras refresh ni `PATCH /auth/me`), si email verificado y combinación IP+UA distinta a sesiones activas previas → `MailService.sendNewLoginAlert`.
- ✅ **Webhook Resend:** `POST /auth/mail-webhooks/resend` + `RESEND_WEBHOOK_SECRET` (Bearer); procesa `email.bounced` (permanentes) / `email.complained` → columnas `Usuario.email_delivery_suppressed_at` + motivo; omite envíos SMTP si suprimido; métricas webhook en `MailMetricsService` + `/admin/mail`. ⏭️ Opcional: afinado de plantillas / políticas de alertas en Resend

---

### ✅ 22. Seguridad endurecida

**Por qué:** Auth básico ✅, pero faltan capas defensivas.

**Cambios:**

- ✅ Helmet en NestJS (Sprint 1 ya hecho)
- ✅ CSP estricta + HSTS + X-Frame-Options DENY + Referrer-Policy + Permissions-Policy en `next.config.mjs` `headers()`. Incluye script-src/style-src/img-src/connect-src/frame-src whitelisted
- ✅ Refresh tokens: access JWT 15min + refresh opaco 30d con bcrypt-hash en `Sesion.refresh_hash`. Endpoint `POST /auth/refresh` con rotación + revoke en token reuse. Frontend `services/api.ts` con interceptor 401 → refresh → retry. AuthContext + login/configuracion pasan refresh_token
- ✅ Sanitización XSS: util `sanitizePlainText` quita HTML tags + dangerous protocols. Aplicado a Review.comentario, ReviewRespuesta.comentario, Usuario.bio, Usuario.nombre
- ✅ `npm audit --audit-level=high` en CI (frontend + backend), no bloqueante
- ✅ Dependabot configurado (`.github/dependabot.yml`) semanal con grupos por ecosistema
- ✅ GDPR: `GET /users/me/export` devuelve JSON con todos los datos del usuario (favoritos, reviews, ratings, lista, follows, listas personalizadas). `DELETE /users/me` ejecuta hard delete dentro de transacción (votos, respuestas, reviews propias + recibidas, ratings, favs, lista, notifs, follows, listas personalizadas + items, sesiones, 2FA, tokens reset/verify, usuario)
- Pendiente: nonces CSP, CSRF si se mueve a cookies, ZAP baseline

---

### ✅ 23. Internacionalización (i18n) — infraestructura

**Por qué:** Mercado anime/manga es global (LATAM, Brasil, US, EU). Hoy todo en español hardcoded.

**Cambios:**

- ✅ `next-intl` instalado, `LocaleProvider` envuelve app con `NextIntlClientProvider`
- ✅ `messages/{es,en,pt-BR}.json` con keys nav/common/content/auth (33 strings cada uno)
- ✅ Detección automática: localStorage > navigator.language > es default
- ✅ `useLocale()` hook con `setLocale` persistente en localStorage
- ✅ Selector idioma en Navbar (`LocaleSwitcher` desktop, ES/EN/PT)
- ✅ Strings de Navbar extraídos a `t('nav.*')` con `useTranslations` (browse/seasons/feed/forYou/myList/lists/stats)
- ✅ Strings de Home extraídos a `t('home.*')` (forYouCf, forYouGenres, trendingAnime, trendingManga, topRated, popular, footerTagline) con interpolación `{year}`/`{genres}`
- ✅ Sinopsis multi-idioma: `SynopsisService` consulta AniList GraphQL por `idMal` (description en/ja) con fallback a Jikan synopsis. Cache Redis 24h. Endpoint `GET /contenido/:jikanId/synopsis?lang=&tipo=`. Strip HTML AniList. Frontend `synopsisApi.get()`
- ✅ Traducción ES/PT-BR vía LibreTranslate (env-gated `LIBRETRANSLATE_URL` + opcional `LIBRETRANSLATE_API_KEY`). Si configurado, traduce sinopsis EN→ES/PT-BR; si falla o no configurado, fallback a inglés
- ✅ Strings extra extraídos a i18n: `/login` (loginTitle/twoFactorTitle/loginSubmit/wrongCredentials/etc), `/registro` (registerTitle/registerSubmit/haveAccount/etc), `/perfil` tabs (stats/myList/ratings/reviews/favoritos/personajes + EmptyStates), `/configuracion` Section titles (profileInfo/changePassword/connectedDevices/session)
- ✅ `ContenidoView` headings principales extraídos: `tc('watchOn')`, `tc('characters')`, `tc('reviews')`, sort labels (`sortTop`/`sortRecent`), empty state (`noReviewsYet`), button `review`
- **Out of scope (backlog v2):** URL routing `/[locale]/...` requiere refactor estructural completo (mover todo `app/`* bajo `app/[locale]/`*, middleware next-intl, `generateStaticParams`, ajustar Sentry/Sitemap/SEO). Decisión: locale persiste vía localStorage + `NextIntlClientProvider` con `locale` dinámico — suficiente para SPA actual. Re-evaluar cuando SEO multi-idioma sea prioritario

---

### 24. Reviews enriquecidas

**Por qué:** Comentarios texto plano. Letterboxd permite formato + spoilers inline.

**Cambios:**

- ✅ **Markdown** en reviews/respuestas (negrita, itálica, listas, links). Render con `react-markdown` + `remark-gfm`
- ✅ Spoiler tags inline: `||texto oculto||` (estilo Discord/AniList)
- ✅ Editor con preview (modal crear/editar review) + toolbar básica para markdown
- ✅ Imágenes en reviews: hasta 3 por review (URLs https + normalización servidor). **Upload opcional** Cloudinary (`POST /reviews/upload-imagen`, env `CLOUDINARY`_*), validación MIME/tamaño en backend + UI subida en modales
- ✅ Moderación mínima: `POST /reviews/:id/report` + tabla `ReviewReport` (UQ review+reporter). API admin (`GET /reviews/admin/reports`, `PATCH …/reports/:id` con `{ resuelto }`, campos `resuelto`/`resuelto_en`) + **panel** `/admin/reportes` (menú usuario admin + enlace en moderación en `/configuracion`). **Reportes de usuario:** tabla `UserReport` (UQ reported+reporter), `POST /users/:id/report`, `GET/PATCH /users/admin/user-reports`, pestaña en `/admin/reportes`, botón en perfil público `/usuario/[id]`. **Reportes de obra:** tabla `ContenidoReport` (UQ contenido+reporter), `POST /contenido/jikan/:jikanId/report` (body titulo/tipo + motivo), `GET/PATCH /contenido/admin/reports`, pestaña «Obras» en `/admin/reportes`, botón en ficha de contenido. **Shadowban:** `Usuario.shadowbanned`, JWT opcional en perfil/listados, filtros en reviews/listados/stats/digest/menciones/búsqueda, `GET /users/admin/lookup`, `PATCH /users/admin/users/:id/shadowban`, UI `/admin/usuarios`. Preferencias correo `Usuario.notification_prefs` + digest cron + unsubscribe desde correo (ítems **21** / **29**)
- ✅ Menciones con autocomplete (`@` + búsqueda `GET /users/search`) inserta `[@nombre](/usuario/:id)` + notificación in-app (`mencion_review` / `mencion_respuesta`, `common/mentions.ts`)
- ✅ Reviews "destacadas por staff" (campo `featured` + endpoint admin `PATCH /reviews/:id/featured` + toggle en UI detalle)
- ✅ Histórico de ediciones: entidad `ReviewVersion`, migración `1714900000000`, snapshot al `PATCH /reviews/:id`, `GET /reviews/:id/versiones`, panel «Historial» en `ContenidoView`

---

### ✅ 25. Datos enriquecidos del contenido — Personajes y VAs

**Por qué:** AniList y MAL ganan aquí. Página de personaje con voice actors + apariciones es un imán de tráfico.

**Cambios:**

- ✅ Entidades `Personaje`, `VoiceActor`, `ContenidoPersonaje`, `PersonajeVoiceActor` con índices únicos compuestos
- ✅ Migration `1714500000000-AddPersonajesAndVoiceActors`
- ✅ `PersonajesService` con sync lazy desde Jikan `/anime|manga/:id/characters` (max 30 personajes), cache Redis 7d/contenido + 24h/jikan request
- ✅ Endpoints: `GET /contenido/:jikanId/personajes`, `GET /personaje/:malId`, `GET /voice-actor/:malId`
- ✅ Páginas frontend `/personaje/[id]` y `/voice-actor/[id]` con apariciones cruzadas
- ✅ Sección "Personajes" en `ContenidoView` con carousel horizontal
- ✅ Favoritar personaje: entidad `FavoritoPersonaje` (UQ user+personaje) + migration `1714700000000`. Endpoints `GET/POST/DELETE /personaje/:malId/favorito`, `GET /me/favoritos-personajes`, `GET /personaje/:malId/is-favorito`. Botón en página personaje + tab "Personajes" en `/perfil`

---

### ✅ 26. "Dónde ver" — integraciones streaming

**Por qué:** El usuario quiere ratings + acción (ir a ver). IMDb tiene "Watch on…", AniList no. Ventaja diferencial.

**Cambios:**

- ✅ `StreamingService` con mapping curado por jikan_id (top 8 anime cargados: Demon Slayer, AoT, Jujutsu Kaisen, One Piece, Naruto, Frieren, Spy x Family, Chainsaw Man) → providers (crunchyroll, netflix, hulu)
- ✅ Endpoint `GET /watch/:jikanId?title=...` con curated + fallback a search en JustWatch + Crunchyroll
- ✅ UI sección "Dónde ver" en `ContenidoView` con badges deep-link (target _blank, rel noopener)
- ✅ Mapeo curado expandido: 24 anime (My Hero Academia, Death Note, FMA Brotherhood, HxH, Steins;Gate, Code Geass, Tokyo Ghoul, Vinland Saga, Mob Psycho, OPM, DBZ, Cowboy Bebop, Bleach, Re:Zero, Made in Abyss, Konosuba, Black Clover, Mushoku Tensei, 86, Oshi no Ko + previos)
- ✅ Endpoints `GET /watch/providers` (lista providers únicos), `GET /watch/by-provider/:provider` (jikan_ids con ese provider)
- ✅ Filtro "Disponible en" UI integrado en `/buscar`: dropdown en sidebar, filtra resultados client-side por `providerFilterIds` (Set). Counter en activeFilters + clear en clearFilters
- ✅ TMDB watch providers fallback (env-gated `TMDB_API_KEY`): cuando jikan_id no está en STREAMING_MAP curado y es anime, busca por título en TMDB → /tv/{id}/watch/providers, prioriza US > MX > ES, mapea provider names a search URLs deeplink. Cache Redis 7d
- ✅ Auto-load filtered: cuando `selectedProvider` activo y `filteredResults < 12`, dispara `fetchResults(page+1, true)` automáticamente hasta 5 páginas o exhausto. Compensa filter client-side reduce visible count

---

### ✅ 27. Importar listas externas (MAL / AniList)

**Por qué:** Usuario nuevo abandona si tiene que recalificar 500 animes. Importar = retención inmediata.

**Cambios:**

- ✅ `ImportService` con `importMalXml(userId, xml)` parser regex (CDATA + tags) que detecta anime/manga, mapea status MAL → estado AniRates, score → Rating, episodios/capítulos → progreso
- ✅ `importAnilist(userId, username)` query GraphQL público (anime + manga combos), no requiere OAuth, mapea `idMal` directamente
- ✅ Endpoints `POST /import/mal` y `/import/anilist` (auth, throttle 3-5/h)
- ✅ Upsert: existing → actualiza estado/progreso/rating, sino crea ListaItem nuevo
- ✅ UI `/configuracion/importar` con tabs MAL/AniList, file upload XML, username AniList, resultado con counters (importados/actualizados/errores/total)
- Pendiente: OAuth MAL/AniList propio (actualmente usa lista pública AniList), preview pre-confirm, WebSocket progress para imports grandes

---

### ✅ 28. Auth social (OAuth)

**Por qué:** Reduce fricción de registro. Conversion lift +30-40% típico.

**Cambios:**

- ✅ Google + Discord OAuth con `passport-google-oauth20` y `passport-discord`. Strategies se cargan condicionalmente solo si `*_CLIENT_ID` + `*_CLIENT_SECRET` env vars presentes (no crashea sin config)
- ✅ Entidad `OAuthAccount` (provider, provider_user_id unique compuesto, usuario_id, email) + migration `1714600000000-AddOAuthAccount`
- ✅ `AuthService.loginOAuth()`: lookup por (provider, providerId) → user existente; sino lookup por email → vincula; sino crea usuario nuevo con `email_verificado=true` y password aleatorio
- ✅ Endpoints `GET /auth/google`, `/auth/google/callback`, `/auth/discord`, `/auth/discord/callback`
- ✅ Callback redirige a `${FRONTEND_URL}/auth/callback#access_token=...&refresh_token=...`
- ✅ Frontend `/auth/callback` parsea hash, llama `login(access, refresh)`, redirige a `/`
- ✅ Botones "Continuar con Google/Discord/GitHub" en `/login` (oculto si pendingToken 2FA)
- ✅ GitHub OAuth con `passport-github2` strategy + endpoints `GET /auth/github` + callback (mismo conditional load pattern)
- ✅ Gestión de cuentas vinculadas: `GET /auth/oauth/accounts`, `DELETE /auth/oauth/:provider` (bloquea desvincular última opción si user no tiene password). Componente `OAuthAccountsSection` en `/configuracion` con conectar/desvincular por provider

---

### 29. Notificaciones avanzadas

**Por qué:** Hoy solo bell in-app. Falta retorno cuando usuario está fuera.

**Cambios:**

- ✅ Preferencias persistidas `Usuario.notification_prefs` + UI en `/configuracion` (`email_mentions`, `email_weekly_digest` desactivado por defecto)
- ✅ **Email al mencionar** (review y respuesta): misma línea de mensaje que la notificación in-app; sólo si `email_mentions` y email verificado; requiere mail configurado (ítem **21**)
- ✅ **Web Push (MVP VAPID)**: tabla `PushSubscription`, `GET /push/vapid-public-key`, `POST /push/subscribe` / `POST /push/unsubscribe` (JWT), envío al crear notificación in-app si `notification_prefs.push_in_app_browser` y VAPID en env; `public/sw.js` + registro en `/configuracion` + i18n. Migración `1715800000000-AddPushSubscription`
- ✅ **Deep link en payload push**: `PushService` + `notification-push-url.ts` resuelve URL desde `tipo` + `referencia_id` → `/contenido/anime|manga/{jikan}` (episodio / lista) o misma ruta + `#review-{id}` (voto, mención review, mención respuesta vía `review_id`). Ancla `#review-{id}` en tarjeta de review en `ContenidoView`. `public/sw.js`: al clic, `clients.navigate(abs)` cuando exista ventana (fallback `openWindow`)
- ✅ **Preferencias por tipo y canal** (`notification_prefs.tipo_channels`): in-app / correo / push por cada `Notificacion.tipo` (voto, episodio, lista, menciones); PATCH con validación estricta; `GET /users/me` devuelve grid **resuelta** (retrocompatible con `email_mentions` + `push_in_app_browser`); UI tabla en `/configuracion` + i18n; sin migración SQL (JSON en columna existente). Correo de menciones y Web Push respetan la grid; enlace **darse de baja** de menciones también desactiva email en ambos tipos de mención.
- ✅ **Email digest semanal** (cron): `email_weekly_digest` + verificado; seguidores últimos 7 días + reviews nuevas más votadas (global) + **hasta 5 recomendaciones personalizadas** por usuario (`RecomendacionesService`, CF/content-based según ratings); env opcional `WEEKLY_DIGEST_CRON` / `DISABLE_WEEKLY_DIGEST_CRON`
- ✅ Enlaces **darse de baja** en correos de menciones y digest → `/email/unsubscribe`
- ✅ Enriquecer digest: recomendaciones personalizadas (motor existente en digest semanal); ✅ bloque **Pulso de la comunidad** (reviews nuevas + nuevos seguimientos en 7d); ✅ pie con **fecha de generación en zona IANA** (`notification_prefs.digest_timezone`, UI `/configuracion`; cron sigue UTC)
- ⏭️ Categorías nuevas: lista clonada, watchlist próximo a estreno (cron diario)

---

### 30. Moderación + admin panel

**Por qué:** Cuando crezcan los reviews, habrá spam, hate, contenido NSFW. Sin tools = caos.

**Cambios:**

- ✅ **Reportar:** review (`ReviewReport`), usuario (`UserReport`), obra (`ContenidoReport`) + colas y resolución en `/admin/reportes`
- ✅ **Rol `admin`:** paneles y APIs admin (no hay flujo separado `moderador` en código hoy; el campo `tipo` en `Usuario` admite extensión futura)
- ✅ **Panel admin:** reportes, usuarios (shadowban/ban), correo (métricas), auditoría `/admin/auditoria`
- ⏭️ Filtro automático palabras prohibidas (lista config) → flag para revisión
- ✅ **Shadowban** (contenido oculto a terceros; ver detalle ítem **24**)
- ✅ Rate limit en `**POST /reviews`**: cuentas con **menos de 6 reviews** en total no pueden publicar más de **4 reviews en 24 h** (429 si se supera). Proxy para spam sin migración de “fecha de alta”; opción futura: columna `fecha_registro` en `Usuario` para ventana estricta 7 días.
- ✅ **Auditoría:** tabla `ModeracionLog`, registro tras resolver reportes (review/usuario/obra) y shadowban on/off; `GET /users/admin/moderacion-log`; UI `/admin/auditoria` + enlaces admin. Migración `1715500000000-AddModeracionLog`.
- ✅ **Ban duro:** `Usuario.banned`, JWT/login/refresh/OAuth bloqueados con mensaje controlado, revocación de todas las sesiones al suspender; perfil oculto como shadowban salvo admin; reviews destacadas/digest/búsqueda excluyen autores suspendidos; `PATCH /users/admin/users/:id/ban`; UI en `/admin/usuarios`; auditoría `ban_on` / `ban_off`. Migración `1715600000000-AddUsuarioBanned`.

---

### 31. Discusión por episodio (foros)

**Por qué:** Lo que MAL hace mejor. Cada episodio nuevo = thread con 1000 comentarios. Engagement masivo durante temporada.

**Cambios:**

- Entidad `Discusion` (contenido_id, episodio_num, titulo, fecha)
- Entidad `Mensaje` (discusion_id, usuario_id, comentario, parent_id, fecha)
- Auto-crear discusión cuando `AiringSyncService` detecta episodio nuevo
- UI tab "Discusión" en detalle de anime, sublistado por episodio
- Threaded comments hasta 3 niveles

---

### ✅ 32. Accesibilidad (WCAG 2.1 AA) — fundamentos

**Por qué:** Cubrir 15% de usuarios con discapacidad + requisito legal en EU/US para apps comerciales.

**Cambios:**

- ✅ Skip-to-content link en `layout.tsx` (`.skip-link` visible solo en focus, salta a `#main-content`)
- ✅ Focus visible global en `:where(a, button, [role=button], input, select, textarea, [tabindex])` con outline dorado #f5c518
- ✅ Utility `.sr-only` para etiquetas accesibles ocultas visualmente
- ✅ `<main>` con `id="main-content"` y `tabIndex={-1}` para focus tras skip-link
- ✅ ARIA en iconos material-symbols: `aria-hidden="true"` aplicado masivamente a 100+ spans decorativos. `aria-label` en buttons icon-only (Cerrar modal, Editar/Eliminar review/respuesta, Cerrar filtros)
- ✅ `<span className="sr-only">` en badges de Card (Puntuación, Reviews) para contexto a SR
- ✅ axe-core integrado en CI: vitest-axe (5 componentes) + Playwright axe (6 páginas)
- Pendiente: refactor inline styles a tokens (item 33), screen reader testing manual, color-contrast checks

---

### 33. Refactor frontend — extraer inline styles

**Por qué:** Páginas como `/contenido/[tipo]/[id]` tienen cientos de líneas de `style={{...}}` inline. Anti-patrón Tailwind v4: rompe theming consistente, dificulta mantenimiento, infla bundle.

**Cambios:**

- Extraer estilos repetidos a clases Tailwind o CSS modules
- Tokens de diseño en `globals.css` (spacing, radius, shadows)
- Storybook para componentes (`Card`, `Avatar`, `Badge`, `Button`, `StarRating`)
- Auditoría: detectar duplicación con `npx jscodeshift`

---

### 34. API pública + documentación

**Por qué:** Comunidad puede construir extensiones (Discord bots, mobile apps) si hay API estable + docs.

**Cambios:**

- Swagger/OpenAPI con `@nestjs/swagger`. UI en `/api/docs`
- Versioning `/api/v1/...` (URI versioning)
- API Keys para clientes terceros (entidad `ApiKey` con scope + rate limit propio)
- Webhook subscriptions: `POST /webhooks` para evento `nuevo_episodio`, `lista_actualizada`

---

### 35. Mobile apps (React Native / Expo)

**Por qué:** PWA cubre lo básico, pero notificaciones push iOS son limitadas y app store presence ayuda discoverability.

**Cambios:**

- Expo + React Native con shared types desde `types/index.ts`
- Reuso de servicios `api.ts` (fetch wrapper)
- Native push notifications (FCM + APNs)
- Deep linking a contenido específico
- App Store + Play Store

---

### 36. Engagement / gamificación extra

**Por qué:** Streak diaria + leaderboards = retención. Duolingo lo demostró.

**Cambios:**

- Streak diaria de logs en lista (rate, review, watchlist update)
- Leaderboard semanal: más reviews, más helpful votes recibidos
- "Mi año en AniRates" wrap-up estilo Spotify (diciembre)
- Predicción de rating: pre-fill estimado al rating slider basado en CF
- Quizzes diarios: "¿De qué anime es este screenshot?" (datos Jikan)

---

### Checklist despliegue (prefs + moderación reviews)

- En **backend**, antes de liberar una versión con este bloque: ejecutar migración `**1715100000000-AddNotifPrefsAndReportResolved**` (`cd anirate-backend && npm run migration:run`). Crea/ajusta `Usuario.notification_prefs`, `ReviewReport.resuelto` / `resuelto_en` e índice asociado.
- Moderación reciente: migraciones `**1715500000000-AddModeracionLog**` (auditoría) y `**1715600000000-AddUsuarioBanned**` (columna `Usuario.banned`).
- Webhook Resend / supresión rebotes: migración `**1715700000000-AddUsuarioEmailSuppression**` (`Usuario.email_delivery_suppressed_at`, `email_suppression_reason`).
- Web Push: migración `**1715800000000-AddPushSubscription**` (tabla `PushSubscription`); variables `**VAPID_PUBLIC_KEY**`, `**VAPID_PRIVATE_KEY**`, `**VAPID_SUBJECT**` (mailto o https).
- **Producción:** `FRONTEND_URL` correcto; `**BACKEND_URL`** HTTPS público del API (List-Unsubscribe / one-click); proveedor mail según ítem **21** (`MAIL_FROM` + Resend o SMTP).
- **Digest:** una sola instancia del API debe ejecutar el cron (evitar duplicados si escalas horizontalmente sin coordinador), o `DISABLE_WEEKLY_DIGEST_CRON=true` y lanzar el job desde un worker externo.

---

### Priorización sugerida Fase 5

```
Sprint 1 (4 semanas) — Producción-ready
  ├── 16 SEO + SSR (impacto orgánico inmediato)
  ├── 17 Observabilidad (Sentry + logs)
  ├── 20 CI/CD + migraciones BD (sin esto NO se despliega)
  └── 21 Email real (reset/verify funcional)

Sprint 2 (4 semanas) — Escala + calidad
  ├── 18 Performance (Redis, índices, Image)
  ├── 19 Testing (E2E + frontend tests)
  ├── 22 Seguridad (Helmet, refresh tokens, CSP)
  └── 32 Accesibilidad (audit + fixes)

Sprint 3 (6 semanas) — Diferenciación
  ├── 23 i18n (EN + PT-BR)
  ├── 25 Personajes + VAs
  ├── 26 Dónde ver (JustWatch)
  └── 27 Importar MAL/AniList
  └── 28 OAuth Google/Discord

Sprint 4 (4 semanas) — Comunidad madura — **cerrado (alcance acordado)**; evolutivo 29/30 continúa en Sprint 5
  ├── ✅ 24 Reviews: markdown, spoilers, menciones, staff pick, histórico, imágenes (URL + Cloudinary opcional), reporte de contenido
  ├── ✅ 29 Notificaciones: prefs + UI + email menciones + digest (reco + pulso + TZ pie) + unsubscribe + **List-Unsubscribe (RFC 8058)** + **alerta sesión nueva** + **Web Push MVP (VAPID + SW + `/configuracion`)** + **deep links en payload push** + **prefs por tipo/canal (`tipo_channels`)**
  ├── ✅ 30 Moderación: cola reports + shadowban + ban duro + `/admin/reportes` + `/admin/usuarios` + **auditoría** `/admin/auditoria`
  └── ⏭️ 31 Foros por episodio → backlog (alcance producto aparte)

Sprint 5 (≈4 semanas) — Cierre 29 + moderación incremental
  ├── ✅ Infra Jikan: **proxy Nest `/jikan/v4/`*** + caché Redis + **`X-Cache`** + frontend/Docker **`NEXT_PUBLIC_JIKAN_VIA_BACKEND`**
  ├── 29 restante (incremental): ✅ prefs push/email/in-app **por tipo** (`tipo_channels`); ✅ deep links en payload (`tipo`/`referencia_id`); ⏭️ categorías nuevas (lista clonada, watchlist próximo a estreno); digest ✚ reco ✅ + pulso comunidad + TZ pie ✅
  ├── 21 compartido: webhook Resend ✅ + **supresión rebotes/spam** (`Usuario.email_delivery_suppressed_at`) ✅; List-Unsubscribe dashboards si hace falta
  ├── 30 incremental: ✅ **tope reviews / 24h**; ✅ **reportes usuario**; ✅ **shadowban**; ✅ **ban duro** (`Usuario.banned` + revocación sesiones + panel); ✅ **reportes obra**; ✅ **auditoría** (`ModeracionLog` + `/admin/auditoria`)
  └── Observabilidad: ✅ **métricas correo + webhook Resend** (`MailMetricsService`) + `GET /users/admin/mail-metrics` + página `/admin/mail`; ✅ **métricas agregadas proxy Jikan** (`JikanProxyMetricsService`, contadores en memoria) + `GET /users/admin/jikan-proxy-metrics` en la misma página admin

Backlog (cuando haya señal de PMF)
  ├── 33 Refactor inline styles + Storybook
  ├── 34 API pública + docs
  ├── 35 Mobile apps nativas
  └── 36 Gamificación / wrap-up anual
```

---

## Comparativa final: AniRates vs. competencia


| Feature               | AniRates (repo) | AniList | IMDb        |
| --------------------- | --------------- | ------- | ----------- |
| Browse + filtros      | ✅ Avanzado      | ✅       | ✅           |
| Metadatos completos   | ✅ Muy completo  | ✅       | ✅           |
| Watchlist con estados | ✅               | ✅       | ⚠️          |
| Reviews + votos       | ✅               | ✅       | ✅           |
| Recomendaciones       | ✅               | ✅       | ✅           |
| Perfiles públicos     | ✅               | ✅       | ✅           |
| Temporadas            | ✅               | ✅       | ❌           |
| Listas personalizadas | ✅               | ✅       | ⚠️          |
| Social / Follows      | ✅               | ✅       | ⚠️          |
| UX móvil              | ✅               | ⚠️      | ⚠️          |
| Diseño visual         | ✅ Superior     | ⚠️      | ❌ Anticuado |


> **Ventaja diferencial de AniRates**: diseño visual moderno oscuro (mejor que AniList y muy superior a IMDb/MAL), UX móvil nativa, y al estar construido desde cero puede iterar más rápido que plataformas legacy.

---

## Orden de implementación sugerido

```
Fase 1 (MVP mejorado)
  └── Watchlist con estados
  └── Metadatos enriquecidos
  └── Filtros avanzados en Browse
  └── Perfil completo (tab Ratings + estadísticas)

Fase 2 (Comunidad)
  └── Recomendaciones basadas en géneros
  └── Reviews con votos + edición en UI
  └── Autocompletado en búsqueda
  └── Página de temporadas

Fase 3 (Social y escala)
  └── Perfiles públicos
  └── Sistema de listas
  └── Follows + feed de actividad
  └── Notificaciones

Fase 4 (Técnico y polish)
  └── Caché Redis para Jikan
  └── Auth context global
  └── Recuperación de contraseña
  └── PWA + atajos de teclado
  └── Tests
```

