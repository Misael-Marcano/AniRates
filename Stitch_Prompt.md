# Stitch AI Design Prompt – AniRate Platform

## Project Overview

Design a modern, dark-mode web platform called **AniRate** — an IMDb-style website focused on anime and manga. The visual style blends IMDb's information density with Netflix's cinematic dark aesthetic. The interface must feel premium, content-first, and highly visual.

---

## Visual Style

- **Theme:** Dark mode only
- **Aesthetic:** Cinematic, modern, content-heavy — inspired by IMDb and Netflix
- **Typography:** Clean sans-serif, high contrast white on dark
- **Imagery:** Large posters and banners, high emphasis on cover art
- **Animations:** Subtle hover effects on cards, smooth transitions

---

## Color Palette

| Role             | Color Name   | HEX       |
|------------------|--------------|-----------|
| Main background  | Black        | `#0F0F0F` |
| Secondary bg     | Dark gray    | `#1A1A1A` |
| Card background  | Gray         | `#222222` |
| Primary accent   | Yellow       | `#F5C518` |
| Primary text     | White        | `#FFFFFF` |
| Secondary text   | Light gray   | `#B3B3B3` |
| Favorite active  | Red          | `#E53E3E` |
| Favorite inactive| Gray         | `#4A4A4A` |

---

## Typography

- **Headings:** Bold, white, large — 28px to 48px
- **Body:** Regular, light gray (#B3B3B3) — 14px to 16px
- **Labels / Badges:** Uppercase, small caps, semi-bold
- **Rating numbers:** Yellow (#F5C518), bold, prominent

---

## Global Components

### Navbar
- Fixed top, full width
- Background: `#0F0F0F` with slight bottom border in `#222222`
- **Left:** AniRate logo (yellow text + small icon)
- **Center:** Search bar (rounded, dark input `#1A1A1A`, magnifier icon in yellow)
- **Right:** Navigation links — Inicio · Anime · Manga · Top · Favoritos · Perfil
- Active link underlined in yellow (`#F5C518`)
- On mobile: hamburger menu collapses right links

### Card Component
- Fixed size: ~180px wide × 270px tall (portrait ratio)
- Background: `#222222`, rounded corners (8px)
- Full-bleed cover image on top (2/3 of card height)
- Bottom area: title (white, small bold), star rating in yellow, type badge
- **Badge:** small pill — "ANIME" (blue `#3B82F6`) or "MANGA" (purple `#8B5CF6`)
- Hover effect: scale up 1.05, add yellow border glow, show overlay with "Ver detalles" button

### Badge Component
- Pill shape, small text, uppercase
- ANIME: blue background `#1D4ED8`, white text
- MANGA: purple background `#6D28D9`, white text
- Genre tags: dark `#333333` background, gray text `#B3B3B3`

### Button Component
- Primary: yellow `#F5C518` background, black text, bold, rounded (6px)
- Secondary: transparent, yellow border, yellow text
- Danger: red `#E53E3E`, white text
- Hover: slightly brighter, subtle scale

### Star Rating Component
- 10-star scale displayed as 5 filled stars (each = 2 points)
- Active stars: yellow `#F5C518`
- Inactive stars: dark gray `#333333`
- Interactive version: highlight on hover
- Display version: static, shows numeric score beside stars (e.g. ⭐ 8.4)

### Input Component
- Background: `#1A1A1A`
- Border: `#333333`, focus border yellow `#F5C518`
- Text: white, placeholder in `#B3B3B3`
- Rounded corners 6px

### Modal Component
- Background: `#1A1A1A`
- Dark overlay backdrop (60% opacity black)
- Close button top-right (X icon, gray)
- Used for: Login, Register, Rate content

### Heart / Favorite Button
- Icon only, positioned top-right of card or detail page
- Active: red heart `#E53E3E` filled
- Inactive: gray outline `#4A4A4A`
- Toggle animation on click

---

## Page Designs

---

### PAGE 1 — Home (/)

**Layout:** Full-width dark page

#### Section 1 — Hero Banner
- Full-width, ~500px tall
- Background: blurred poster image of a featured anime/manga
- Dark gradient overlay (left to right: 80% black → transparent)
- Left-aligned content:
  - Small badge: "ANIME" or "MANGA"
  - Large title (white, 42px bold)
  - Short description (gray, 2 lines max)
  - Two buttons side by side: [Ver Detalles] (yellow primary) · [Calificar] (secondary outline)
  - Star rating below buttons: ⭐ 9.1 / 10 (yellow number)

#### Section 2 — Trending Anime
- Section title: "Trending Anime" (white, 22px bold) + "Ver todo →" link right-aligned (yellow)
- Horizontal scrollable row of Cards
- Arrow navigation buttons on left and right edges

#### Section 3 — Trending Manga
- Same layout as Trending Anime
- Section title: "Trending Manga"

#### Section 4 — Top Rated
- Section title: "Top Rated" (white bold)
- Horizontal scrollable row of Cards with ranking number overlay (1, 2, 3... in large yellow font, bottom-left of card)

#### Section 5 — Populares
- Same horizontal scroll row layout

---

### PAGE 2 — Content Detail (/contenido/:id)

**Layout:** Two-column hero area + full-width sections below

#### Hero Area (top)
- Left: Large poster image (250px wide, full height, rounded)
- Right: Content info
  - Type badge (ANIME / MANGA)
  - Title (white, 36px bold)
  - Genre tags (row of pill badges)
  - Year · Status (gray text, small)
  - Star rating interactive component
  - Numeric average: e.g. "8.6 / 10 · 1,243 ratings" (gray small text)
  - Two buttons: [Agregar a Favoritos ♥] · [Escribir Review]
  - Full description text (gray, expandable "Ver más")

#### Section — Reviews
- Title: "Reviews de la comunidad" (white bold)
- Review cards:
  - User avatar (circle, initials fallback)
  - Username (white, bold)
  - Star rating (yellow stars, small)
  - Comment text (gray)
  - Date (light gray, small, right-aligned)
- Pagination below

---

### PAGE 3 — Login (/login)

**Layout:** Centered card on dark background

- Background: `#0F0F0F` with subtle pattern or blurred anime art
- Centered card: `#1A1A1A`, 400px wide, rounded 12px, padding 40px
- AniRate logo at top of card (centered, yellow)
- Title: "Iniciar Sesión" (white, 24px bold)
- Fields: Email, Password (dark inputs)
- [Iniciar Sesión] button — full width, yellow
- Link below: "¿No tienes cuenta? Regístrate" (yellow link)
- Divider line with "o" in center
- Social login placeholder (optional)

---

### PAGE 4 — Register (/registro)

Same layout as Login card:
- Title: "Crear Cuenta"
- Fields: Nombre, Email, Password, Confirmar Password
- [Crear Cuenta] button — full width, yellow
- Link: "¿Ya tienes cuenta? Inicia sesión"

---

### PAGE 5 — Search / Browse (/buscar)

**Layout:** Sidebar filters + content grid

#### Left Sidebar (240px fixed)
- Title: "Filtros" (white bold)
- Filter group: **Tipo**
  - Toggle buttons: [🎬 Anime] [📚 Manga] [Todos]
- Filter group: **Género**
  - Checkbox list: Acción, Aventura, Comedia, Drama, Fantasy, Romance, Sci-Fi, etc.
- Filter group: **Año**
  - Range slider or dropdown (2000–2024)
- [Aplicar Filtros] button (yellow)
- [Limpiar] link (gray)

#### Right Content Area
- Search bar at top (full width of content area)
- Results count: "Mostrando 48 resultados" (gray small)
- Grid of Cards:
  - Desktop: 5–6 columns
  - Tablet: 3 columns
  - Mobile: 2 columns
- Pagination at bottom

---

### PAGE 6 — Profile (/perfil)

**Layout:** Top profile header + tabbed sections

#### Profile Header
- Background: `#1A1A1A` card, full width
- Large avatar circle (80px, yellow border)
- Username (white, 24px bold)
- Email (gray, small)
- Stats row: [24 Favoritos] · [12 Reviews] · [187 Ratings]

#### Tabs
- [Favoritos] · [Reviews] · [Ratings] — active tab underlined in yellow

#### Tab — Favoritos
- Grid of Cards (same as browse grid)
- Empty state: heart icon + "Aún no tienes favoritos"

#### Tab — Reviews
- List of review cards (same component as detail page)
- Each has: content poster thumbnail + content title + review text + rating

#### Tab — Ratings
- List with: content thumbnail, title, user's rating stars, date rated

---

### PAGE 7 — Favorites (/favoritos)

- Same as Profile Favoritos tab but full page
- Top bar with count: "Mis Favoritos (24)"
- Filter by tipo: [Todos] [Anime] [Manga]
- Grid of Cards

---

## Responsive Breakpoints

| Breakpoint | Cards per row | Notes |
|------------|---------------|-------|
| Mobile (<640px) | 1–2 | Sidebar hidden → filter drawer |
| Tablet (640–1024px) | 2–3 | Sidebar collapsible |
| Desktop (>1024px) | 4–6 | Full sidebar visible |

---

## Design Tokens Summary

```
--color-bg:         #0F0F0F
--color-bg-2:       #1A1A1A
--color-card:       #222222
--color-primary:    #F5C518
--color-text:       #FFFFFF
--color-text-muted: #B3B3B3
--color-anime:      #1D4ED8
--color-manga:      #6D28D9
--color-danger:     #E53E3E
--radius-card:      8px
--radius-modal:     12px
--radius-btn:       6px
```

---

## Additional Design Notes

- All sections have consistent horizontal padding (24px mobile, 48px desktop)
- Section rows use horizontal scroll with hidden scrollbar on mobile
- Skeleton loaders (gray shimmer) for all card areas while loading
- Toast notifications for actions: favorito agregado, review guardada, etc.
- No white backgrounds anywhere — entire app stays in dark mode
- Yellow (#F5C518) is used ONLY for: primary buttons, active stars, active nav links, logo, key numbers
- Avoid overusing yellow — it should draw the eye to the most important elements only
