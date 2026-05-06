# 📘 Documento de Especificación – Plataforma Tipo IMDb para Anime y Manga

## 🏷️ Nombre del Proyecto

**AniRate**

---

## 🎯 Objetivo del Proyecto

Desarrollar una plataforma web tipo IMDb enfocada en **anime y manga**, donde los usuarios puedan:

* Explorar contenido
* Ver detalles completos
* Calificar (ratings)
* Escribir reseñas
* Guardar favoritos
* Descubrir tendencias

---

## 🧱 Arquitectura General

* Frontend: SPA moderna
* Backend: API REST
* Base de datos relacional
* Integración con API externa (anime/manga)

---

## 🛠️ Tecnologías a Utilizar

### 🔹 Frontend

* Next.js
* React
* Tailwind CSS
* JavaScript

### 🔹 Backend

* NestJS
* Node.js

### 🔹 Base de Datos

* SQL Server

### 🔹 Integración externa

* API de anime/manga (Jikan, AniList, etc.)

---

## 🧩 Módulos del Sistema

### 1. 🔐 Autenticación

* Registro
* Login / Logout
* JWT
* Roles (admin / usuario)

---

### 2. 🎬📚 Gestión de Contenido (Anime + Manga)

* Listado de contenido
* Detalle:

  * Título
  * Descripción
  * Imagen
  * Géneros
  * Año
  * Estado
  * Tipo (ANIME | MANGA)

---

### 3. ⭐ Ratings

* Escala 1–10
* Promedio automático
* 1 rating por usuario por contenido

---

### 4. 📝 Reviews

* Crear / editar / eliminar
* Listado por contenido

---

### 5. ❤️ Favoritos

* Agregar / eliminar
* Lista personal

---

### 6. 🔍 Buscador

* Por nombre
* Por género
* Por tipo (anime/manga)

---

### 7. 📈 Tendencias

* Trending Anime
* Trending Manga
* Top global

---

## 🗄️ Modelo de Base de Datos (Optimizado)

### 🧠 Tabla principal: CONTENIDO

```sql
CONTENIDO
- id
- titulo
- descripcion
- imagen
- año
- estado
- tipo (ANIME | MANGA)
```

---

### Usuario

* id
* nombre
* email
* password
* tipo
* estado

---

### Genero

* id
* nombre

---

### Contenido_Genero

* id
* contenido_id
* genero_id

---

### Rating

* id
* usuario_id
* contenido_id
* puntuacion

---

### Review

* id
* usuario_id
* contenido_id
* comentario
* fecha

---

### Favorito

* id
* usuario_id
* contenido_id

---

## 🔌 Endpoints API

### 🔹 Contenido

* GET /contenido
* GET /contenido/:id
* GET /contenido?tipo=ANIME
* GET /contenido?tipo=MANGA
* GET /contenido/top
* GET /contenido/search?q=

---

### 🔹 Auth

* POST /auth/register
* POST /auth/login

---

### 🔹 Ratings

* POST /ratings
* GET /ratings/contenido/:id

---

### 🔹 Reviews

* POST /reviews
* GET /reviews/contenido/:id

---

### 🔹 Favoritos

* POST /favorites
* GET /favorites/user/:id

---

## 🎨 UI / UX – Guía de Diseño (OBLIGATORIO)

---

## 🎯 Concepto Visual

* Estilo IMDb + Netflix
* Modo oscuro
* Diseño moderno
* Alto enfoque en imágenes

---

## 🎨 Paleta de Colores

| Uso              | Color       | HEX     |
| ---------------- | ----------- | ------- |
| Fondo            | Negro       | #0F0F0F |
| Fondo secundario | Gris oscuro | #1A1A1A |
| Cards            | Gris        | #222222 |
| Primario         | Amarillo    | #F5C518 |
| Texto            | Blanco      | #FFFFFF |
| Secundario       | Gris claro  | #B3B3B3 |

---

## 🧭 Navbar

* Logo izquierda
* Buscador centro
* Menú derecha:

  * Inicio
  * Anime
  * Manga
  * Top
  * Favoritos
  * Perfil

---

## 🎬📚 Filtros de Contenido

* Tipo:

  * 🎬 Anime
  * 📚 Manga
* Géneros
* Año

---

## 🎬 Banner Principal

* Imagen destacada
* Título
* Descripción
* Botones:

  * Ver detalles
  * Calificar

---

## 🎞️ Secciones

* Trending Anime
* Trending Manga
* Top Rated
* Populares

---

## 🧾 Cards (Contenido)

* Tamaño fijo
* Imagen
* Rating ⭐
* Tipo visible (badge ANIME / MANGA)

---

## 📄 Página de Detalle

### Incluye:

* Poster
* Título
* Tipo (badge)
* Géneros
* Descripción
* Rating
* Reviews

---

## ⭐ UI Rating

* Color amarillo
* Interactivo

---

## 📝 Reviews UI

* Tarjetas con:

  * Usuario
  * Comentario
  * Rating

---

## ❤️ Favoritos UI

* Corazón:

  * Activo (rojo)
  * Inactivo (gris)

---

## 👤 Perfil

* Información usuario
* Favoritos
* Reviews

---

## 📱 Responsive

* Mobile: 1 columna
* Tablet: 2–3 columnas
* Desktop: 4–6 columnas

---

## 🎛️ Componentes

* Card
* Button
* Input
* Modal
* Badge (tipo y género)
* Rating

---

## 🎥 Animaciones

* Hover en cards
* Transiciones suaves

---

## 🔐 Seguridad

* JWT
* bcrypt
* Validaciones DTO

---

## 📦 Estructura del Proyecto

### Backend

```
/auth
/users
/contenido
/ratings
/reviews
/favorites
```

### Frontend

```
/pages
/components
/services
/styles
```

---

## 🚀 Funcionalidades Futuras

* Recomendaciones inteligentes
* Watchlist
* Ranking por temporadas
* Comentarios en reviews

---

## 📌 Resultado Esperado

Una plataforma moderna tipo IMDb enfocada en:

🎬 Anime
📚 Manga

Con:

* Excelente UX
* Sistema de ratings
* Comunidad activa
* Diseño profesional

---

## ✅ Entregables

* API (NestJS)
* Frontend (Next.js)
* Base de datos
* UI implementada correctamente

---

## 📣 Nota Final

El sistema debe ser:

* Escalable
* Modular
* Visualmente atractivo
* Fácil de usar

el front y el back deben estar separados