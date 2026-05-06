# AniRates

AniRates es una plataforma para explorar y valorar anime y manga: reseñas, ratings compartidos, listas personalizadas, feed social ligero y herramientas para moderadores. Integra metadatos vía **proxy Jikan** (cache y límites), opciones de **correo** (digest semanal, verificación, unsubscribe RFC 8058) y **Web Push** en el navegador.

## Stack

| Capa | Tecnología |
|------|------------|
| API | **NestJS** (Node.js), **TypeORM** |
| Datos | **Microsoft SQL Server** |
| Cache / colas ligeras | **Redis** (opcional; recomendado en Compose) |
| Web | **Next.js** (App Router), **React** |
| Contenedores | **Docker Compose** en la raíz (`docker-compose.yml`) |

## Características principales

- **Reseñas y valoraciones** sobre obras y experiencias de visionado.
- **Listas** públicas o privadas y descubrimiento en comunidad.
- **Notificaciones** en la app y **Web Push** para eventos relevantes.
- **Digest por correo** (cron configurable; ver variables en `.env.example`).
- **Moderación y administración**: paneles para informes, usuarios y correo transaccional.
- **Proxy Jikan** (`GET /jikan/v4/*`): reduce presión sobre la API pública con cache (Redis o memoria).
- **Internacionalización**: español, inglés y portugués (Brasil) (`next-intl`).

## Variables de entorno

La referencia completa está en **`anirate-backend/.env.example`** (comentada por secciones). Resumen:

- **App / URLs**: `NODE_ENV`, `PORT`, `BACKEND_URL`, `FRONTEND_URL`.
- **SQL Server**: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME`.
- **Auth**: `JWT_SECRET`; OAuth opcional (`GOOGLE_*`, `DISCORD_*`, `GITHUB_*`).
- **Correo**: `MAIL_FROM`, `RESEND_API_KEY` / SMTP (`SMTP_*`), webhooks Resend.
- **Redis**: `REDIS_URL` (vacío desactiva Redis en local si el código lo permite).
- **Observabilidad**: `SENTRY_DSN`, `LOG_LEVEL`.
- **Push**: claves VAPID (`VAPID_*`).
- **Medios**: Cloudinary opcional para imágenes en reseñas.
- **Otros**: `TMDB_API_KEY`, LibreTranslate, tuning del proxy Jikan.

En el frontend, define al menos **`NEXT_PUBLIC_API_URL`** (URL del backend que ve el navegador). El `docker-compose.yml` pasa build args de ejemplo al servicio frontend.

**No subas** ficheros `.env` con secretos reales; usa siempre `.env.example` como plantilla.

## Requisitos

- **Node.js** 22 (alineado con CI en `.github/workflows/ci.yml`).
- **Docker Desktop** o compatible (opcional pero recomendado para SQL Server + Redis + servicios).

## Ejecutar en local con Docker Compose

Desde la raíz del repositorio:

```bash
docker compose up --build
```

Servicios típicos:

| Servicio | Puerto host |
|----------|-------------|
| Frontend Next.js | http://localhost:5000 |
| API NestJS | http://localhost:5001 |
| Adminer | http://localhost:8080 |
| SQL Server | localhost:1435 (mapeo al 1433 del contenedor) |
| Redis | 6379 |

La base `AniRate` se crea mediante el contenedor `db-init`. **Importante:** las contraseñas del `docker-compose.yml` son de ejemplo; **cámbialas** antes de exponer el stack en red o producción.

## Ejecutar sin Docker (resumen)

1. Levanta **SQL Server** y anota host/puerto. Si usas solo el contenedor SQL del Compose, desde el host suele ser `DB_PORT=1435`.
2. **Redis** es opcional; puedes dejar `REDIS_URL` vacío según configuración local.
3. **Backend**

```bash
cd anirate-backend
copy .env.example .env
npm ci
npm run migration:run
npm run start:dev
```

En Unix/macOS sustituye la primera línea por `cp .env.example .env` y edita `.env` (`DB_*`, `JWT_SECRET`, etc.).

4. **Frontend**

```bash
cd anirate-frontend
npm ci
npm run dev
```

Crea `.env.local` con `NEXT_PUBLIC_API_URL=http://localhost:5001` (ajusta si tu API usa otro origen). El frontend usa el puerto **5000** en desarrollo.

## Migraciones (TypeORM)

Con las variables de base de datos cargadas:

```bash
cd anirate-backend
npm run migration:run
```

Otros scripts útiles: `migration:show`, `migration:revert`, `migration:generate` (ver `package.json`).

## Documentación en el repositorio

- **[Documentacion.md](Documentacion.md)** — contexto técnico, flujos y convenciones del proyecto.
- **[plan-mejoras.md](plan-mejoras.md)** — roadmap, mejoras planificadas y deuda técnica.

## Despliegue

### Producción (aplicación completa)

El modo habitual es **contenedores** (Compose extendido o orquestador) o **frontend en Vercel/similar** apuntando a una API NestJS desplegada con Node detrás de HTTPS. El frontend está configurado con **output: standalone** en `next.config.mjs` para empaquetado Docker-friendly.

### GitHub Pages (sitio estático)

La aplicación Next.js usa **rutas dinámicas** (`contenido/[tipo]/[id]`, `usuario/[id]`, tokens de verificación, etc.) y depende del API en tiempo real; **`next export` / `output: export` no es viable** como sustituto de la app completa sin un rediseño grande.

Por eso el workflow **[`.github/workflows/deploy-github-pages.yml`](.github/workflows/deploy-github-pages.yml)** publica solo la carpeta **`docs/`** (landing HTML estática). Tras el primer despliegue, la URL será del tipo:

`https://misael-marcano.github.io/AniRates/`

En GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

Para la **demo completa** del producto, usa Docker o un proveedor con Node y variables configuradas.

### GitHub Pages (repo público)

GitHub **no** habilita Pages en repos **privados** en el plan gratuito (salvo GitHub Enterprise con Pages para privados). El repo debe ser **público** para que funcione la URL tipo `https://misael-marcano.github.io/AniRates/` con este workflow.

En GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions** (no *Deploy from a branch*). Si aparece solicitud de aprobación del entorno **`github-pages`**, acéptala en la primera corrida. Tras un push a `main` que modifique `docs/**` o `.github/workflows/deploy-github-pages.yml`, revisa **Actions** para el workflow **Deploy GitHub Pages**.

Si `git push` por HTTPS falla por autenticación, usa **`gh auth login`**, **SSH** o un **PAT (classic)** con alcance `repo`; detalle en la sección **Contribuir y publicar el remoto** más abajo.

## CI

El archivo **[`.github/workflows/ci.yml`](.github/workflows/ci.yml)** ejecuta lint, tests y build del backend y del frontend en cada push o PR a `main`.

## Contribuir y publicar el remoto

Si aún no tienes remoto:

```bash
git remote add origin https://github.com/Misael-Marcano/AniRates.git
git branch -M main
git push -u origin main
```

Si **`git push` falla por autenticación**, GitHub ya no acepta contraseña en HTTPS; usa una de estas opciones:

1. **GitHub CLI**: `gh auth login` y vuelve a ejecutar `git push`.
2. **SSH**: cambia el remoto a `git@github.com:Misael-Marcano/AniRates.git` y configura una clave SSH en tu cuenta GitHub.
3. **Personal Access Token (classic)** con alcance `repo`: úsalo como contraseña cuando Git pida credenciales HTTPS.

Verifica antes del commit que **`anirate-backend/.env`** y otros secretos locales **no** están en el índice (`git status`, `git diff --cached`).

---

Licencia y detalle de módulos: revisa los `package.json` de `anirate-backend` y `anirate-frontend`.
