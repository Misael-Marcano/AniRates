<!-- Write a Review Modal - AniRate -->
<!DOCTYPE html>

<html class="dark" lang="es"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>AniRate - Escribir Review</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&amp;family=Inter:wght@400;500;600&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
    tailwind.config = {
      darkMode: "class",
      theme: {
        extend: {
          "colors": {
                  "surface": "#131313",
                  "primary": "#ffe5a0",
                  "on-surface-variant": "#d1c5ac",
                  "on-error-container": "#ffdad6",
                  "surface-container-highest": "#353534",
                  "error-container": "#93000a",
                  "on-secondary-fixed-variant": "#0039b5",
                  "inverse-surface": "#e5e2e1",
                  "surface-dim": "#131313",
                  "surface-bright": "#3a3939",
                  "secondary-fixed": "#dce1ff",
                  "on-background": "#e5e2e1",
                  "tertiary-fixed": "#ebddff",
                  "surface-container-lowest": "#0e0e0e",
                  "tertiary-container": "#d6c0ff",
                  "on-tertiary-fixed": "#250059",
                  "primary-fixed-dim": "#f0c110",
                  "primary-fixed": "#ffe08b",
                  "on-tertiary-fixed-variant": "#5b00c5",
                  "on-primary-container": "#695200",
                  "surface-container-low": "#1c1b1b",
                  "inverse-on-surface": "#313030",
                  "on-error": "#690005",
                  "surface-tint": "#f0c110",
                  "primary-container": "#f5c518",
                  "outline-variant": "#4e4633",
                  "on-primary-fixed": "#241a00",
                  "secondary-fixed-dim": "#b7c4ff",
                  "secondary-container": "#0040cb",
                  "on-tertiary": "#3f008d",
                  "secondary": "#b7c4ff",
                  "on-primary-fixed-variant": "#584400",
                  "on-tertiary-container": "#6a23d6",
                  "on-secondary-container": "#b2c0ff",
                  "surface-container-high": "#2a2a2a",
                  "inverse-primary": "#745b00",
                  "tertiary-fixed-dim": "#d3bbff",
                  "on-primary": "#3d2f00",
                  "error": "#ffb4ab",
                  "tertiary": "#eee1ff",
                  "surface-variant": "#353534",
                  "outline": "#9a9078",
                  "surface-container": "#201f1f",
                  "on-secondary": "#002682",
                  "on-surface": "#e5e2e1",
                  "on-secondary-fixed": "#001551",
                  "background": "#131313"
          },
          "borderRadius": {
                  "DEFAULT": "0.125rem",
                  "lg": "0.25rem",
                  "xl": "0.5rem",
                  "full": "0.75rem"
          },
          "spacing": {},
          "fontFamily": {
                  "headline": [
                          "Manrope"
                  ],
                  "body": [
                          "Inter"
                  ],
                  "label": [
                          "Inter"
                  ]
          }
  },
      },
    }
  </script>
</head>
<body class="bg-surface text-on-surface font-body min-h-screen relative overflow-hidden">
<!-- Background Content (Simulated Detail Screen) -->
<div class="absolute inset-0 z-0 select-none opacity-40">
<div class="h-[614px] w-full bg-surface-container-highest relative">
<img alt="Anime Background" class="w-full h-full object-cover opacity-50 mix-blend-overlay" data-alt="Dark, moody anime landscape with neon lights and cyberpunk aesthetic, cinematic lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAgFZ39c15jYKhmukl880-kZXCo4fVvDwduNm6MfY6wMcZcVx29-YZcVDJf8tIH1MqS3zlW3sjOW1Xj6OrnciiLF2QbVj91wGt4YlhsSVbaIqm20euvAmeJ6ddrD2Q7zITRVabpSbAunMqsQT3eeKUmRdJ1Y_I7c7RGy8NpO5U8204Hi1lWTgmv1vrKZyDwcgQ24uD_yUE0NWPZ9cL3ArOxjnp_sJDLaKJ0iDsP7qNCzq2FRRwQy9KVA4QnnsOiWGa5xL-6aIeLXUQ"/>
<div class="absolute inset-0 bg-gradient-to-t from-surface via-surface/80 to-transparent"></div>
</div>
<div class="max-w-screen-xl mx-auto px-6 -mt-32 relative">
<div class="flex gap-8">
<div class="w-64 h-96 bg-surface-container-low rounded-xl shadow-2xl flex-shrink-0">
<img alt="Poster" class="w-full h-full object-cover rounded-xl" data-alt="Anime character poster, high contrast, vibrant colors on dark background, dramatic pose" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA0ejr5pqWlQxRpEN1LgHl7odmhe6YHwcaAdBpRANU3dzWuPOA2TTpB02USTcTsuAQOtilC--ImC8J2Upna6kw2hWuFpwqNlc_YIY8eOJE4I29x6FOM0_j0t6pR5oqTNjn-boRWosRqVpZc2DgshXn6LbAVW3EjW_7eLMWvXScA7uVbAYU8stVYeGJxTUcquexDGiLtU-JURwQy2n0ID4ZDG_zFLo2O4XOZBgKDd6mbbKRSeiWdHBkkLf7KLksN3_tB1KXF5vQpCxQ"/>
</div>
<div class="pt-8">
<h1 class="font-headline text-5xl font-bold tracking-tight mb-4">Cybernetic Drift: Reborn</h1>
<div class="flex gap-4 mb-6">
<span class="px-3 py-1 bg-secondary-container/20 text-secondary-container rounded-full text-xs font-label uppercase tracking-widest">Anime</span>
<span class="px-3 py-1 bg-surface-container-high rounded-full text-xs font-label uppercase tracking-widest text-on-surface-variant">Sci-Fi</span>
<span class="px-3 py-1 bg-surface-container-high rounded-full text-xs font-label uppercase tracking-widest text-on-surface-variant">Action</span>
</div>
<p class="text-on-surface-variant max-w-2xl text-base leading-relaxed">
            In a dystopian future where humanity has merged with machines, a rogue synthetic attempts to uncover the truth about their origins...
          </p>
</div>
</div>
</div>
</div>
<!-- Modal Overlay / Backdrop -->
<div class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 backdrop-blur-md bg-surface/80">
<!-- Modal Content -->
<div class="w-full max-w-2xl bg-[#1A1A1A] rounded-[12px] shadow-[0px_20px_60px_rgba(245,197,24,0.05)] overflow-hidden flex flex-col transform transition-all border border-white/5">
<!-- Modal Header -->
<div class="px-8 py-6 border-b border-surface-container-low/50 flex justify-between items-center bg-surface-container-lowest/50">
<h2 class="font-headline text-3xl font-semibold tracking-tight text-white">Escribir Review</h2>
<button aria-label="Close modal" class="text-on-surface-variant hover:text-white transition-colors" type="button">
<span class="material-symbols-outlined text-2xl">close</span>
</button>
</div>
<!-- Modal Body -->
<div class="p-8 flex flex-col gap-8">
<!-- Rating Section -->
<div class="flex flex-col items-center justify-center gap-4 py-4">
<p class="text-on-surface-variant font-medium text-sm tracking-wide">TU PUNTUACIÓN</p>
<div class="flex gap-2 group cursor-pointer">
<span class="material-symbols-outlined text-4xl text-primary" style="font-variation-settings: 'FILL' 1;">star</span>
<span class="material-symbols-outlined text-4xl text-primary" style="font-variation-settings: 'FILL' 1;">star</span>
<span class="material-symbols-outlined text-4xl text-primary" style="font-variation-settings: 'FILL' 1;">star</span>
<span class="material-symbols-outlined text-4xl text-primary" style="font-variation-settings: 'FILL' 1;">star</span>
<span class="material-symbols-outlined text-4xl text-surface-container-highest hover:text-primary transition-colors">star</span>
</div>
<p class="text-primary font-headline font-bold text-xl mt-2">8 <span class="text-on-surface-variant text-sm font-normal">/ 10</span></p>
</div>
<!-- Textarea Section -->
<div class="flex flex-col gap-3">
<label class="text-on-surface-variant text-sm font-medium" for="review-content">TU OPINIÓN (Opcional)</label>
<div class="relative">
<textarea class="w-full bg-surface-container-low border border-surface-container-high rounded-lg p-4 text-on-surface placeholder:text-on-surface-variant/50 focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-colors resize-none font-body text-base leading-relaxed" id="review-content" placeholder="¿Qué te pareció? Comparte tus pensamientos sobre la animación, la historia, los personajes..." rows="6"></textarea>
<!-- Optional Markdown/Formatting Hint -->
<div class="absolute bottom-3 right-4 text-xs text-on-surface-variant/50 font-label flex gap-3">
<span class="cursor-pointer hover:text-on-surface-variant transition-colors" title="Negrita"><span class="material-symbols-outlined text-sm align-middle">format_bold</span></span>
<span class="cursor-pointer hover:text-on-surface-variant transition-colors" title="Cursiva"><span class="material-symbols-outlined text-sm align-middle">format_italic</span></span>
<span class="cursor-pointer hover:text-on-surface-variant transition-colors" title="Spoiler"><span class="material-symbols-outlined text-sm align-middle">visibility_off</span></span>
</div>
</div>
<p class="text-xs text-on-surface-variant/70 self-end">0 / 5000</p>
</div>
</div>
<!-- Modal Footer -->
<div class="px-8 py-6 bg-surface-container-lowest/80 flex justify-end gap-4 border-t border-surface-container-low/50">
<button class="px-6 py-3 rounded-md font-medium text-sm border border-outline-variant/30 text-on-surface-variant hover:text-white hover:bg-surface-container-low transition-colors tracking-wide" type="button">
          Cancelar
        </button>
<button class="px-8 py-3 rounded-md font-bold text-sm bg-primary-container text-[#3D2F00] shadow-[0_4px_14px_0_rgba(245,197,24,0.25)] hover:bg-primary-container/90 hover:shadow-[0_6px_20px_rgba(245,197,24,0.3)] transition-all tracking-wide" type="submit">
          Publicar Review
        </button>
</div>
</div>
</div>
</body></html>

<!-- Register - AniRate -->
<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>AniRate - Crear Cuenta</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800;900&amp;family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
          darkMode: "class",
          theme: {
            extend: {
              "colors": {
                      "tertiary-fixed": "#ebddff",
                      "outline-variant": "#4e4633",
                      "on-surface": "#e5e2e1",
                      "on-background": "#e5e2e1",
                      "on-surface-variant": "#d1c5ac",
                      "on-primary-container": "#695200",
                      "surface-variant": "#353534",
                      "surface-dim": "#131313",
                      "on-secondary-fixed": "#001551",
                      "primary-container": "#f5c518",
                      "primary": "#ffe5a0",
                      "surface-container-lowest": "#0e0e0e",
                      "surface": "#131313",
                      "error-container": "#93000a",
                      "surface-container-high": "#2a2a2a",
                      "on-primary": "#3d2f00",
                      "error": "#ffb4ab",
                      "on-error": "#690005",
                      "on-primary-fixed": "#241a00",
                      "surface-container-highest": "#353534",
                      "on-primary-fixed-variant": "#584400",
                      "surface-bright": "#3a3939",
                      "on-secondary-fixed-variant": "#0039b5",
                      "on-secondary": "#002682",
                      "inverse-on-surface": "#313030",
                      "primary-fixed-dim": "#f0c110",
                      "on-tertiary-fixed-variant": "#5b00c5",
                      "surface-container": "#201f1f",
                      "inverse-primary": "#745b00",
                      "on-tertiary": "#3f008d",
                      "surface-container-low": "#1c1b1b",
                      "tertiary-fixed-dim": "#d3bbff",
                      "primary-fixed": "#ffe08b",
                      "inverse-surface": "#e5e2e1",
                      "on-tertiary-fixed": "#250059",
                      "secondary": "#b7c4ff",
                      "tertiary": "#eee1ff",
                      "on-error-container": "#ffdad6",
                      "background": "#131313",
                      "on-secondary-container": "#b2c0ff",
                      "surface-tint": "#f0c110",
                      "outline": "#9a9078",
                      "on-tertiary-container": "#6a23d6",
                      "secondary-fixed": "#dce1ff",
                      "secondary-container": "#0040cb",
                      "tertiary-container": "#d6c0ff",
                      "secondary-fixed-dim": "#b7c4ff"
              },
              "borderRadius": {
                      "DEFAULT": "0.125rem",
                      "lg": "0.25rem",
                      "xl": "0.5rem",
                      "full": "0.75rem"
              },
              "spacing": {},
              "fontFamily": {
                      "headline": [
                              "Manrope"
                      ],
                      "body": [
                              "Inter"
                      ],
                      "label": [
                              "Inter"
                      ]
              }
      },
          },
        }
      </script>
</head>
<body class="bg-surface-container-lowest text-on-surface font-body min-h-screen flex flex-col antialiased selection:bg-primary-container selection:text-on-primary">
<main class="flex-grow flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
<div class="absolute inset-0 z-0">
<div class="absolute inset-0 bg-gradient-to-br from-surface-container-lowest to-surface-container z-10 opacity-80"></div>
<img alt="" class="w-full h-full object-cover opacity-30" data-alt="Abstract anime-style background with glowing neon lines and deep dark shadows, high contrast cinematic lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAv3aKbWGiTMO8_7aPUst9r0Dx9_KRtapE6P_PN9RhzCqHxJySXzLCEoshYzmKsUEsYsNFg56EMab_RlIHaaIx1h1eTavZ6RzJ8neBWLefIsmKZYdutDSL3RNmD5xoT05IWoBryb7qR1ZuxZG4YNT19IFcKLzev-4CUb9Id750UxgjtP2g4WG46sF_fN1z86qtZfAUAtESWmNgXSM0TAmWHWdG_5FQziV-BabzpS2SLzldb29CgXPiSkS335p6QOitSfOKpZAVMhY4"/>
</div>
<div class="w-full max-w-[400px] z-10">
<div class="text-center mb-8">
<h1 class="font-headline font-black text-3xl md:text-4xl tracking-tighter text-primary-container">AniRate</h1>
<p class="text-on-surface-variant text-sm mt-2 font-label tracking-widest uppercase">The Digital Auteur</p>
</div>
<div class="bg-surface-container-high rounded-[12px] p-8 shadow-2xl relative">
<div class="absolute inset-0 bg-surface-container-highest opacity-50 rounded-[12px] -z-10 blur-xl"></div>
<h2 class="font-headline font-bold text-2xl text-on-surface mb-6 tracking-tight text-center">Crear Cuenta</h2>
<form class="space-y-5">
<div>
<label class="block text-xs font-label text-on-surface-variant uppercase tracking-widest mb-1.5" for="nombre">Nombre</label>
<div class="relative">
<span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl z-10" data-icon="person">person</span>
<input class="w-full bg-surface-container-lowest border border-outline-variant/15 rounded-lg py-3 pl-10 pr-4 text-on-surface focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-colors placeholder-on-surface-variant/50 text-sm" id="nombre" name="nombre" placeholder="Tu nombre" type="text"/>
</div>
</div>
<div>
<label class="block text-xs font-label text-on-surface-variant uppercase tracking-widest mb-1.5" for="email">Email</label>
<div class="relative">
<span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl z-10" data-icon="mail">mail</span>
<input class="w-full bg-surface-container-lowest border border-outline-variant/15 rounded-lg py-3 pl-10 pr-4 text-on-surface focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-colors placeholder-on-surface-variant/50 text-sm" id="email" name="email" placeholder="tu@email.com" type="email"/>
</div>
</div>
<div>
<label class="block text-xs font-label text-on-surface-variant uppercase tracking-widest mb-1.5" for="password">Password</label>
<div class="relative">
<span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl z-10" data-icon="lock">lock</span>
<input class="w-full bg-surface-container-lowest border border-outline-variant/15 rounded-lg py-3 pl-10 pr-4 text-on-surface focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-colors placeholder-on-surface-variant/50 text-sm" id="password" name="password" placeholder="••••••••" type="password"/>
</div>
</div>
<div>
<label class="block text-xs font-label text-on-surface-variant uppercase tracking-widest mb-1.5" for="confirm_password">Confirmar Password</label>
<div class="relative">
<span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl z-10" data-icon="lock">lock</span>
<input class="w-full bg-surface-container-lowest border border-outline-variant/15 rounded-lg py-3 pl-10 pr-4 text-on-surface focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-colors placeholder-on-surface-variant/50 text-sm" id="confirm_password" name="confirm_password" placeholder="••••••••" type="password"/>
</div>
</div>
<button class="w-full bg-gradient-to-r from-primary-fixed to-primary-container text-on-primary font-headline font-bold py-3.5 px-4 rounded-lg mt-6 hover:shadow-[0_0_12px_rgba(245,197,24,0.4)] transition-all duration-300 active:scale-[0.98]" type="button">
                        Crear Cuenta
                    </button>
</form>
<div class="mt-8 text-center">
<p class="text-sm text-on-surface-variant">
                        ¿Ya tienes una cuenta? 
                        <a class="text-primary-container hover:text-primary-fixed transition-colors font-semibold ml-1" href="#">Login</a>
</p>
</div>
</div>
</div>
</main>
</body></html>

<!-- Favorites - AniRate -->
<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>AniRate - Mis Favoritos</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500&amp;family=Manrope:wght@600;700;800;900&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    "colors": {
                        "tertiary-fixed": "#ebddff",
                        "outline-variant": "#4e4633",
                        "on-surface": "#e5e2e1",
                        "on-background": "#e5e2e1",
                        "on-surface-variant": "#d1c5ac",
                        "on-primary-container": "#695200",
                        "surface-variant": "#353534",
                        "surface-dim": "#131313",
                        "on-secondary-fixed": "#001551",
                        "primary-container": "#f5c518",
                        "primary": "#ffe5a0",
                        "surface-container-lowest": "#0e0e0e",
                        "surface": "#131313",
                        "error-container": "#93000a",
                        "surface-container-high": "#2a2a2a",
                        "on-primary": "#3d2f00",
                        "error": "#ffb4ab",
                        "on-error": "#690005",
                        "on-primary-fixed": "#241a00",
                        "surface-container-highest": "#353534",
                        "on-primary-fixed-variant": "#584400",
                        "surface-bright": "#3a3939",
                        "on-secondary-fixed-variant": "#0039b5",
                        "on-secondary": "#002682",
                        "inverse-on-surface": "#313030",
                        "primary-fixed-dim": "#f0c110",
                        "on-tertiary-fixed-variant": "#5b00c5",
                        "surface-container": "#201f1f",
                        "inverse-primary": "#745b00",
                        "on-tertiary": "#3f008d",
                        "surface-container-low": "#1c1b1b",
                        "tertiary-fixed-dim": "#d3bbff",
                        "primary-fixed": "#ffe08b",
                        "inverse-surface": "#e5e2e1",
                        "on-tertiary-fixed": "#250059",
                        "secondary": "#b7c4ff",
                        "tertiary": "#eee1ff",
                        "on-error-container": "#ffdad6",
                        "background": "#131313",
                        "on-secondary-container": "#b2c0ff",
                        "surface-tint": "#f0c110",
                        "outline": "#9a9078",
                        "on-tertiary-container": "#6a23d6",
                        "secondary-fixed": "#dce1ff",
                        "secondary-container": "#0040cb",
                        "tertiary-container": "#d6c0ff",
                        "secondary-fixed-dim": "#b7c4ff"
                    },
                    "borderRadius": {
                        "DEFAULT": "0.125rem",
                        "lg": "0.25rem",
                        "xl": "0.5rem",
                        "full": "0.75rem"
                    },
                    "spacing": {},
                    "fontFamily": {
                        "headline": ["Manrope"],
                        "body": ["Inter"],
                        "label": ["Inter"]
                    }
                },
            },
        }
    </script>
<style>
        .ken-burns:hover img {
            transform: scale(1.05);
            transition: transform 0.5s ease-out;
        }
        .ken-burns img {
            transition: transform 0.5s ease-out;
        }
        .glass-nav {
            background-color: rgba(19, 19, 19, 0.7);
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
        }
    </style>
</head>
<body class="bg-surface text-on-surface font-body antialiased min-h-screen flex flex-col selection:bg-primary-container selection:text-on-primary">
<!-- TopNavBar -->
<nav class="fixed top-0 w-full z-50 glass-nav border-b-0 shadow-[0px_4px_20px_rgba(245,197,24,0.08)]">
<div class="flex justify-between items-center px-8 py-4 w-full max-w-screen-2xl mx-auto">
<!-- Brand & Navigation Group -->
<div class="flex items-center gap-12">
<a class="text-2xl font-black tracking-tighter text-primary-container font-headline" href="#">
                    AniRate
                </a>
<!-- Desktop Navigation Links -->
<div class="hidden md:flex items-center gap-8 font-headline tracking-tight">
<a class="text-on-surface-variant hover:text-primary-container transition-all duration-300 active:scale-95" href="#">Browse</a>
<a class="text-on-surface-variant hover:text-primary-container transition-all duration-300 active:scale-95" href="#">Seasonal</a>
<a class="text-on-surface-variant hover:text-primary-container transition-all duration-300 active:scale-95" href="#">Manga</a>
<a class="text-on-surface-variant hover:text-primary-container transition-all duration-300 active:scale-95" href="#">Community</a>
</div>
</div>
<!-- Search & Actions Group -->
<div class="flex items-center gap-6">
<!-- Search Bar -->
<div class="hidden lg:flex items-center bg-surface-container-highest rounded-full px-4 py-2 border border-outline-variant/15 focus-within:border-primary-container/50 transition-colors">
<span class="material-symbols-outlined text-on-surface-variant text-sm mr-2">search</span>
<input class="bg-transparent border-none text-sm text-on-surface placeholder:text-on-surface-variant focus:ring-0 p-0 w-48 font-body" placeholder="Search..." type="text"/>
</div>
<!-- Trailing Actions -->
<div class="flex items-center gap-4">
<button class="text-on-surface-variant hover:text-primary-container transition-all duration-300 active:scale-95">
<span class="material-symbols-outlined">notifications</span>
</button>
<button class="text-on-surface-variant hover:text-primary-container transition-all duration-300 active:scale-95">
<span class="material-symbols-outlined">settings</span>
</button>
<!-- User Avatar Placeholder -->
<div class="w-8 h-8 rounded-full bg-surface-container-high border border-outline-variant/15 overflow-hidden ml-2 cursor-pointer active:scale-95 transition-transform">
<img alt="User Avatar" class="w-full h-full object-cover" data-alt="Close up portrait of a stylized anime character profile avatar with dramatic lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBruj2bnL8ojrTiEa4VZE95-panMGcbSckEgz8G5ggYaRSvCW_SIbaF2FA_Y1ufA_oIwOIvCOd6RkCfzswuW84xOdCHCY-H7CYI9C2yVuQ0IbBcP5Ar8CILu_vBren5wKzNG7yUI7CtwaeKMB9Ud17-6V2kudsEomSUgmcHR6E16p1VY2ePrCvyNQv-pCukr1TZ5moIJaC5_tpmZjlW7I_ys4E6G2iUzdB8L4JLgFDRikVWrzc3FwEwC64phX5vpaCvh7ATSfavbHI"/>
</div>
</div>
</div>
</div>
</nav>
<!-- Main Content Canvas -->
<main class="flex-grow pt-32 pb-24 px-6 md:px-12 max-w-screen-2xl mx-auto w-full">
<!-- Header Section -->
<header class="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
<div>
<h1 class="font-headline font-bold text-[48px] md:text-[56px] leading-none tracking-[-0.02em] text-on-surface">
                    Mis Favoritos <span class="text-primary-container/60 text-4xl">24</span>
</h1>
<p class="font-body text-on-surface-variant text-base mt-4 max-w-xl leading-relaxed">
                    Your personal collection of cinematic masterpieces. Handpicked anime and manga that define your taste.
                </p>
</div>
<!-- Filters -->
<div class="flex items-center gap-2 bg-surface-container-low p-1 rounded-full border border-outline-variant/15">
<button class="px-6 py-2 rounded-full text-sm font-label font-medium uppercase tracking-[0.1em] bg-primary-container text-on-primary transition-all shadow-[0_0_12px_rgba(245,197,24,0.3)]">
                    Todos
                </button>
<button class="px-6 py-2 rounded-full text-sm font-label font-medium uppercase tracking-[0.1em] text-on-surface-variant hover:text-on-surface transition-colors">
                    Anime
                </button>
<button class="px-6 py-2 rounded-full text-sm font-label font-medium uppercase tracking-[0.1em] text-on-surface-variant hover:text-on-surface transition-colors">
                    Manga
                </button>
</div>
</header>
<!-- Content Grid (5-6 columns based on screen size) -->
<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-10">
<!-- Card 1 (Anime) -->
<article class="group cursor-pointer flex flex-col gap-3">
<div class="relative w-full aspect-[2/3] rounded-lg overflow-hidden ken-burns bg-surface-container-highest shadow-2xl">
<img alt="Anime Poster 1" class="w-full h-full object-cover" data-alt="Dramatic anime style poster showing a towering mecha robot against a deep crimson sunset sky with debris floating" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA4jfGLlb1NiVGTHgQSGRtBybiepC3C_B0nWwaTlupf50SCz1kEjEaJx6uxl7RFOLHpppxwkZfZ1sz3ea3jfrOTISUkZLdyGDR8NV9hg3OQqjm1k6_eneoMd6rbxJ_Epe7rJMIVaMj9fBvoa3kHyrAZ6Kv2g_mpfJ2aeVpppxK6tWmg7SgzCP1V3hfbpBt-Hbwuqt6eejJc9v3AeyUC2qtXyjqTm2CEgc6pjIXgHAXwFl3v0loGHMfMg6J18gBhghZyMuUJk1YJblo"/>
<!-- Badges Overlay -->
<div class="absolute top-2 left-2 flex flex-col gap-2">
<span class="bg-secondary-container/20 text-secondary-fixed backdrop-blur-sm px-2 py-1 rounded-full font-label text-[10px] uppercase tracking-widest flex items-center gap-1 border border-secondary-fixed/10">
                            Anime
                        </span>
</div>
<!-- Rating Overlay -->
<div class="absolute top-2 right-2 bg-surface/70 backdrop-blur-md px-2 py-1 rounded-full flex items-center gap-1">
<span class="material-symbols-outlined text-primary-container text-sm" style="font-variation-settings: 'FILL' 1;">star</span>
<span class="font-body text-xs font-bold text-on-surface">9.8</span>
</div>
</div>
<div class="flex flex-col">
<h3 class="font-headline font-semibold text-lg leading-tight text-on-surface group-hover:text-primary-container transition-colors line-clamp-2">Neon Genesis Evangelion</h3>
<p class="font-body text-sm text-on-surface-variant mt-1">1995 • 26 Episodes</p>
</div>
</article>
<!-- Card 2 (Manga) -->
<article class="group cursor-pointer flex flex-col gap-3">
<div class="relative w-full aspect-[2/3] rounded-lg overflow-hidden ken-burns bg-surface-container-highest shadow-2xl">
<img alt="Manga Poster 1" class="w-full h-full object-cover grayscale contrast-125" data-alt="High contrast black and white manga panel style illustration showing a close up of an intense eye with speed lines" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAUjEbMUblb7_el2maagEQBQIukptntvc-rM2tm8WmruTgQQBl2a-L0XKLyxIfAZcTCXyeRAr0mCd4VDj6qlyICAYUxhWYcDPuRO5WzGNYBMeA0S49h4lEpbVxx9M0QregTokPFAl7HlOviid3ljoa0PHuDrY8M_87T7ZwJoUft4-oZ2vXLVLq95UfiJfaT7OObVMuKZfkRVTpcEhiEExjw3l-m2oHtTtZDq3WJQfs6iM-M10EUt7QvHFxdw1CeBIssjMWMPFLV3VY"/>
<!-- Badges Overlay -->
<div class="absolute top-2 left-2 flex flex-col gap-2">
<span class="bg-tertiary-container/20 text-tertiary-fixed backdrop-blur-sm px-2 py-1 rounded-full font-label text-[10px] uppercase tracking-widest flex items-center gap-1 border border-tertiary-fixed/10">
                            Manga
                        </span>
</div>
<div class="absolute top-2 right-2 bg-surface/70 backdrop-blur-md px-2 py-1 rounded-full flex items-center gap-1">
<span class="material-symbols-outlined text-primary-container text-sm" style="font-variation-settings: 'FILL' 1;">star</span>
<span class="font-body text-xs font-bold text-on-surface">10.0</span>
</div>
</div>
<div class="flex flex-col">
<h3 class="font-headline font-semibold text-lg leading-tight text-on-surface group-hover:text-primary-container transition-colors line-clamp-2">Berserk</h3>
<p class="font-body text-sm text-on-surface-variant mt-1">1989 • Ongoing</p>
</div>
</article>
<!-- Card 3 (Anime) -->
<article class="group cursor-pointer flex flex-col gap-3">
<div class="relative w-full aspect-[2/3] rounded-lg overflow-hidden ken-burns bg-surface-container-highest shadow-2xl">
<img alt="Anime Poster 2" class="w-full h-full object-cover" data-alt="Cyberpunk city alleyway at night with vibrant neon signs reflecting in rain puddles, high contrast cinematic lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCcRF8_AzBSytVN5l15Vr1Ru2u67zg0XT39M2Z9OlapZbMp81py__OlLGsdboGtLpYdvkyqLYT6hVB8hOx0F_c2TOCFF6f7ugM1Dv3JvwZg0yZ-giOpzyG1C3i9Dtizlqetvi5pYOb-y6oo8w3O7WkH8LYcAQsXCdEDIAZHwOeuEA9QI8SsNOOecFao6d_MmokiEjGufUaaIBMK34AEyhZ6CnfbGaYKrF21AcK2JxWjt67EfFG2VqumWqJpS_FcwN_91fy2HBXt9uc"/>
<div class="absolute top-2 left-2 flex flex-col gap-2">
<span class="bg-secondary-container/20 text-secondary-fixed backdrop-blur-sm px-2 py-1 rounded-full font-label text-[10px] uppercase tracking-widest flex items-center gap-1 border border-secondary-fixed/10">
                            Anime
                        </span>
</div>
<div class="absolute top-2 right-2 bg-surface/70 backdrop-blur-md px-2 py-1 rounded-full flex items-center gap-1">
<span class="material-symbols-outlined text-primary-container text-sm" style="font-variation-settings: 'FILL' 1;">star</span>
<span class="font-body text-xs font-bold text-on-surface">9.5</span>
</div>
</div>
<div class="flex flex-col">
<h3 class="font-headline font-semibold text-lg leading-tight text-on-surface group-hover:text-primary-container transition-colors line-clamp-2">Cowboy Bebop</h3>
<p class="font-body text-sm text-on-surface-variant mt-1">1998 • 26 Episodes</p>
</div>
</article>
<!-- Card 4 (Anime) -->
<article class="group cursor-pointer flex flex-col gap-3">
<div class="relative w-full aspect-[2/3] rounded-lg overflow-hidden ken-burns bg-surface-container-highest shadow-2xl">
<img alt="Anime Poster 3" class="w-full h-full object-cover" data-alt="Ethereal fantasy landscape with glowing floating islands and soft pastel clouds in a cinematic wide shot" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAmL7VXxNu3dBODjwSe8U16hLYWQEvzrnkkYdUlaTL_MGnGuvBbssgBF3-e8c7kz2GHWWJxWJXhrKANPWdNY5E04HhccHTmaph2Un0AaiipvQsxVDFZz64f92EjkRGWeEPC7qpRkNcy8OcNH0H0fUXoFThIWvbm_FFozPxEgLExcHIcYFQh1Hhg8vJkRvbj1LjDiR9IwS-StsH8D_DokX-RLz5qI0teB2r0vJQ1ypkUlHT2er7XRu-sWh4A4Qdo2mBLjkaAjrDZ6cg"/>
<div class="absolute top-2 left-2 flex flex-col gap-2">
<span class="bg-secondary-container/20 text-secondary-fixed backdrop-blur-sm px-2 py-1 rounded-full font-label text-[10px] uppercase tracking-widest flex items-center gap-1 border border-secondary-fixed/10">
                            Anime
                        </span>
</div>
<div class="absolute top-2 right-2 bg-surface/70 backdrop-blur-md px-2 py-1 rounded-full flex items-center gap-1">
<span class="material-symbols-outlined text-primary-container text-sm" style="font-variation-settings: 'FILL' 1;">star</span>
<span class="font-body text-xs font-bold text-on-surface">9.2</span>
</div>
</div>
<div class="flex flex-col">
<h3 class="font-headline font-semibold text-lg leading-tight text-on-surface group-hover:text-primary-container transition-colors line-clamp-2">Spirited Away</h3>
<p class="font-body text-sm text-on-surface-variant mt-1">2001 • Movie</p>
</div>
</article>
<!-- Card 5 (Manga) -->
<article class="group cursor-pointer flex flex-col gap-3">
<div class="relative w-full aspect-[2/3] rounded-lg overflow-hidden ken-burns bg-surface-container-highest shadow-2xl">
<img alt="Manga Poster 2" class="w-full h-full object-cover grayscale contrast-125" data-alt="Detailed ink drawing style illustration of a grim dark fantasy knight standing amidst ruins" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD9njeW6Y6vzo4yC8s3RYLtqxouXW8ShlRJa5wLE30Oh4nxuehmN8x2rPtbRCbsF2wgjiG2qCk5Oj3NjuCCY5pHEtd_96AeTpALCJBpOppgtwoa0xDuFMU_fCblOc0Zc1bg62S48-PecBLTYBlL7ReFw7-_xgiJc0fSyB0f3epYMka2HmnG1a77Mi2jvKpoERChCFMPHLVksuKvOG_BYE6D_gUtPyxK9SGijhleG4Sqq1qVXqryaBCXhjmu7fdY1fmaf6-VyPin3_g"/>
<div class="absolute top-2 left-2 flex flex-col gap-2">
<span class="bg-tertiary-container/20 text-tertiary-fixed backdrop-blur-sm px-2 py-1 rounded-full font-label text-[10px] uppercase tracking-widest flex items-center gap-1 border border-tertiary-fixed/10">
                            Manga
                        </span>
</div>
<div class="absolute top-2 right-2 bg-surface/70 backdrop-blur-md px-2 py-1 rounded-full flex items-center gap-1">
<span class="material-symbols-outlined text-primary-container text-sm" style="font-variation-settings: 'FILL' 1;">star</span>
<span class="font-body text-xs font-bold text-on-surface">9.7</span>
</div>
</div>
<div class="flex flex-col">
<h3 class="font-headline font-semibold text-lg leading-tight text-on-surface group-hover:text-primary-container transition-colors line-clamp-2">Vagabond</h3>
<p class="font-body text-sm text-on-surface-variant mt-1">1998 • Hiatus</p>
</div>
</article>
<!-- Card 6 (Anime) -->
<article class="group cursor-pointer flex flex-col gap-3">
<div class="relative w-full aspect-[2/3] rounded-lg overflow-hidden ken-burns bg-surface-container-highest shadow-2xl">
<img alt="Anime Poster 4" class="w-full h-full object-cover" data-alt="Vibrant autumn leaves falling around a quiet japanese shrine path, soft sunlight filtering through trees" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCC8wAnuQzuHS7hfY-okafG1-4DkRfd51N4thZ87l1YQz-aESv3hqMe5G_zDCKCXYozXSUJ_cKl9I3FIOJkSAEDqLfTnRfvLR2WqwGuy4rWVHCol2s5H2JshigfhHlel3B5HFJ7YryTrC8Oi5OCQqsA8aIq84zsgnMwuvkUPSxxDy28n-0qKSECfpdX4pSYRuaqoRweqdvoQ2BN4k8efUmC0UYgzbyHaE5tBs3f3dP9cciP0txNcpEHYyCuSUHoUZRB6APUFY0oIuc"/>
<div class="absolute top-2 left-2 flex flex-col gap-2">
<span class="bg-secondary-container/20 text-secondary-fixed backdrop-blur-sm px-2 py-1 rounded-full font-label text-[10px] uppercase tracking-widest flex items-center gap-1 border border-secondary-fixed/10">
                            Anime
                        </span>
</div>
<div class="absolute top-2 right-2 bg-surface/70 backdrop-blur-md px-2 py-1 rounded-full flex items-center gap-1">
<span class="material-symbols-outlined text-primary-container text-sm" style="font-variation-settings: 'FILL' 1;">star</span>
<span class="font-body text-xs font-bold text-on-surface">9.1</span>
</div>
</div>
<div class="flex flex-col">
<h3 class="font-headline font-semibold text-lg leading-tight text-on-surface group-hover:text-primary-container transition-colors line-clamp-2">Mushishi</h3>
<p class="font-body text-sm text-on-surface-variant mt-1">2005 • 26 Episodes</p>
</div>
</article>
<!-- Add more cards as needed to fill out the grid, maintaining the same structure -->
<!-- Placeholder cards for visual completeness of the grid -->
<article class="group cursor-pointer flex flex-col gap-3">
<div class="relative w-full aspect-[2/3] rounded-lg overflow-hidden ken-burns bg-surface-container-highest shadow-2xl flex items-center justify-center border border-outline-variant/15">
<span class="material-symbols-outlined text-surface-bright text-4xl">image</span>
</div>
<div class="flex flex-col">
<h3 class="font-headline font-semibold text-lg leading-tight text-on-surface group-hover:text-primary-container transition-colors line-clamp-2 bg-surface-container-high h-5 w-3/4 rounded animate-pulse"></h3>
<p class="font-body text-sm text-on-surface-variant mt-1 bg-surface-container-high h-4 w-1/2 rounded animate-pulse"></p>
</div>
</article>
<article class="group cursor-pointer flex flex-col gap-3">
<div class="relative w-full aspect-[2/3] rounded-lg overflow-hidden ken-burns bg-surface-container-highest shadow-2xl flex items-center justify-center border border-outline-variant/15">
<span class="material-symbols-outlined text-surface-bright text-4xl">image</span>
</div>
<div class="flex flex-col">
<h3 class="font-headline font-semibold text-lg leading-tight text-on-surface group-hover:text-primary-container transition-colors line-clamp-2 bg-surface-container-high h-5 w-3/4 rounded animate-pulse"></h3>
<p class="font-body text-sm text-on-surface-variant mt-1 bg-surface-container-high h-4 w-1/2 rounded animate-pulse"></p>
</div>
</article>
</div>
<!-- Load More Section -->
<div class="mt-16 flex justify-center w-full">
<button class="px-8 py-3 rounded-lg text-sm font-label font-medium tracking-wide border border-outline-variant/30 text-on-surface-variant hover:border-primary-container/50 hover:text-primary-container transition-all flex items-center gap-2">
                Load More Favorites
                <span class="material-symbols-outlined text-[18px]">expand_more</span>
</button>
</div>
</main>
<!-- BottomNavBar (Mobile Only) -->
<nav class="fixed bottom-0 left-0 w-full flex justify-around items-center py-3 px-4 md:hidden bg-surface-dim/90 backdrop-blur-2xl rounded-t-xl z-50 border-t-0 shadow-2xl">
<a class="flex flex-col items-center text-on-surface-variant hover:text-primary-container transition-colors gap-1" href="#">
<span class="material-symbols-outlined">home</span>
<span class="font-label text-[10px] uppercase tracking-widest">Home</span>
</a>
<a class="flex flex-col items-center text-on-surface-variant hover:text-primary-container transition-colors gap-1" href="#">
<span class="material-symbols-outlined">search</span>
<span class="font-label text-[10px] uppercase tracking-widest">Explore</span>
</a>
<a class="flex flex-col items-center text-on-surface-variant hover:text-primary-container transition-colors gap-1" href="#">
<span class="material-symbols-outlined">auto_stories</span>
<span class="font-label text-[10px] uppercase tracking-widest">Library</span>
</a>
<a class="flex flex-col items-center text-primary-container scale-110 transition-transform gap-1" href="#">
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">person</span>
<span class="font-label text-[10px] uppercase tracking-widest font-bold">Profile</span>
</a>
</nav>
<!-- Footer -->
<footer class="w-full mt-auto bg-surface-container-lowest border-t-0 bg-gradient-to-t from-black to-surface-container-lowest">
<div class="flex flex-col md:flex-row justify-between items-center px-12 py-8 max-w-screen-2xl mx-auto w-full gap-6">
<div class="font-headline font-bold text-primary-container tracking-tight text-xl">
                AniRate
            </div>
<div class="flex flex-wrap justify-center gap-6 font-body text-xs text-on-surface-variant">
<a class="hover:text-on-surface transition-colors cursor-pointer" href="#">Terms of Service</a>
<a class="hover:text-on-surface transition-colors cursor-pointer" href="#">Privacy Policy</a>
<a class="hover:text-on-surface transition-colors cursor-pointer" href="#">API Docs</a>
<a class="hover:text-on-surface transition-colors cursor-pointer" href="#">Support</a>
</div>
<div class="font-body text-xs text-on-surface-variant/60 tracking-wider">
                © 2024 ANIRATE. ENGINEERED FOR THE DIGITAL AUTEUR.
            </div>
</div>
</footer>
</body></html>

<!-- Search & Browse - AniRate -->
<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>AniRate - Browse</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800;900&amp;family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    "colors": {
                        "tertiary-fixed": "#ebddff",
                        "outline-variant": "#4e4633",
                        "on-surface": "#e5e2e1",
                        "on-background": "#e5e2e1",
                        "on-surface-variant": "#d1c5ac",
                        "on-primary-container": "#695200",
                        "surface-variant": "#353534",
                        "surface-dim": "#131313",
                        "on-secondary-fixed": "#001551",
                        "primary-container": "#f5c518",
                        "primary": "#ffe5a0",
                        "surface-container-lowest": "#0e0e0e",
                        "surface": "#131313",
                        "error-container": "#93000a",
                        "surface-container-high": "#2a2a2a",
                        "on-primary": "#3d2f00",
                        "error": "#ffb4ab",
                        "on-error": "#690005",
                        "on-primary-fixed": "#241a00",
                        "surface-container-highest": "#353534",
                        "on-primary-fixed-variant": "#584400",
                        "surface-bright": "#3a3939",
                        "on-secondary-fixed-variant": "#0039b5",
                        "on-secondary": "#002682",
                        "inverse-on-surface": "#313030",
                        "primary-fixed-dim": "#f0c110",
                        "on-tertiary-fixed-variant": "#5b00c5",
                        "surface-container": "#201f1f",
                        "inverse-primary": "#745b00",
                        "on-tertiary": "#3f008d",
                        "surface-container-low": "#1c1b1b",
                        "tertiary-fixed-dim": "#d3bbff",
                        "primary-fixed": "#ffe08b",
                        "inverse-surface": "#e5e2e1",
                        "on-tertiary-fixed": "#250059",
                        "secondary": "#b7c4ff",
                        "tertiary": "#eee1ff",
                        "on-error-container": "#ffdad6",
                        "background": "#131313",
                        "on-secondary-container": "#b2c0ff",
                        "surface-tint": "#f0c110",
                        "outline": "#9a9078",
                        "on-tertiary-container": "#6a23d6",
                        "secondary-fixed": "#dce1ff",
                        "secondary-container": "#0040cb",
                        "tertiary-container": "#d6c0ff",
                        "secondary-fixed-dim": "#b7c4ff"
                    },
                    "borderRadius": {
                        "DEFAULT": "0.125rem",
                        "lg": "0.25rem",
                        "xl": "0.5rem",
                        "full": "0.75rem"
                    },
                    "spacing": {},
                    "fontFamily": {
                        "headline": ["Manrope"],
                        "body": ["Inter"],
                        "label": ["Inter"]
                    }
                },
            },
        }
    </script>
</head>
<body class="bg-surface text-on-surface font-body antialiased selection:bg-primary-container selection:text-on-primary-container min-h-screen flex flex-col">
<!-- TopNavBar -->
<nav class="dark:bg-[#131313]/70 backdrop-blur-md fixed top-0 w-full z-50 bg-[#201F1F] shadow-[0px_4px_20px_rgba(245,197,24,0.08)]">
<div class="flex justify-between items-center px-8 py-4 w-full max-w-screen-2xl mx-auto">
<div class="flex items-center gap-8">
<a class="text-2xl font-black tracking-tighter text-yellow-400 font-['Manrope']" href="#">AniRate</a>
<div class="hidden md:flex gap-6 font-['Manrope'] tracking-tight">
<a class="text-yellow-400 border-b-2 border-yellow-400 pb-1 hover:text-yellow-400 transition-all duration-300 active:scale-95" href="#">Browse</a>
<a class="text-gray-400 hover:text-yellow-400 transition-all duration-300 active:scale-95" href="#">Seasonal</a>
<a class="text-gray-400 hover:text-yellow-400 transition-all duration-300 active:scale-95" href="#">Manga</a>
<a class="text-gray-400 hover:text-yellow-400 transition-all duration-300 active:scale-95" href="#">Community</a>
</div>
</div>
<div class="flex items-center gap-6">
<!-- Search Box inside Nav -->
<div class="relative hidden md:block">
<span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" style="font-variation-settings: 'FILL' 0;">search</span>
<input class="bg-surface-container-low border border-outline-variant/15 rounded-lg py-2 pl-10 pr-4 text-sm text-on-surface focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container w-64 transition-all placeholder:text-on-surface-variant/50" placeholder="Search anime, manga..." type="text"/>
</div>
<button class="text-gray-400 hover:text-yellow-400 transition-all duration-300 active:scale-95">
<span class="material-symbols-outlined" data-icon="notifications">notifications</span>
</button>
<button class="text-gray-400 hover:text-yellow-400 transition-all duration-300 active:scale-95">
<span class="material-symbols-outlined" data-icon="settings">settings</span>
</button>
<div class="w-8 h-8 rounded-full overflow-hidden bg-surface-container-high border border-outline-variant/15 cursor-pointer">
<img alt="User Avatar" class="w-full h-full object-cover" data-alt="close up portrait of a young woman with neon pink lighting, cyberpunk aesthetic, dark background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAaUmy5PnknO7dILZIxW8jYfE4sCWETWM7-Uf4ZUNTEg16vHSuK0ZfLG5z7b24FOiCZZTcpp5lCHhfDJNCcoyjlVcQdemOgBoEzXYEsq2UsssVZVwLtvsyzfQr584vdDh66BQ0fN95XU6Oi8cK3KcU4IoNeRB7dQYXKSlfLwqvM9Hq3l3OBg121QllXRmy0IMVSQAh78r7ueQDz97MEYhvMg2aUhLIuOhQXKoZCjKk_qWCi6JpD5Dat9C-r3gA6SJVlmnAlZUUYDMw"/>
</div>
</div>
</div>
</nav>
<!-- Main Content Grid -->
<main class="flex-grow pt-24 pb-20 md:pb-12 max-w-screen-2xl mx-auto w-full px-4 md:px-8 flex flex-col md:flex-row gap-8">
<!-- Sidebar Filters (240px) -->
<aside class="hidden md:flex flex-col w-[240px] shrink-0 gap-8 h-[calc(100vh-120px)] sticky top-28 overflow-y-auto pr-4 scrollbar-hide">
<!-- Filter Section: Tipo -->
<div class="flex flex-col gap-4">
<h3 class="font-headline font-semibold text-lg text-on-surface tracking-tight">Tipo</h3>
<div class="flex flex-col gap-3">
<label class="flex items-center gap-3 cursor-pointer group">
<div class="relative flex items-center justify-center">
<input checked="" class="peer sr-only" name="tipo" type="radio"/>
<div class="w-5 h-5 rounded border border-outline-variant/30 peer-checked:bg-primary-container peer-checked:border-primary-container transition-all"></div>
<span class="material-symbols-outlined absolute text-[14px] text-on-primary opacity-0 peer-checked:opacity-100 transition-opacity" style="font-variation-settings: 'FILL' 1;">check</span>
</div>
<span class="text-sm text-on-surface-variant group-hover:text-on-surface transition-colors">Todos</span>
</label>
<label class="flex items-center gap-3 cursor-pointer group">
<div class="relative flex items-center justify-center">
<input class="peer sr-only" name="tipo" type="radio"/>
<div class="w-5 h-5 rounded border border-outline-variant/30 peer-checked:bg-primary-container peer-checked:border-primary-container transition-all"></div>
<span class="material-symbols-outlined absolute text-[14px] text-on-primary opacity-0 peer-checked:opacity-100 transition-opacity" style="font-variation-settings: 'FILL' 1;">check</span>
</div>
<span class="text-sm text-on-surface-variant group-hover:text-on-surface transition-colors">Anime</span>
</label>
<label class="flex items-center gap-3 cursor-pointer group">
<div class="relative flex items-center justify-center">
<input class="peer sr-only" name="tipo" type="radio"/>
<div class="w-5 h-5 rounded border border-outline-variant/30 peer-checked:bg-primary-container peer-checked:border-primary-container transition-all"></div>
<span class="material-symbols-outlined absolute text-[14px] text-on-primary opacity-0 peer-checked:opacity-100 transition-opacity" style="font-variation-settings: 'FILL' 1;">check</span>
</div>
<span class="text-sm text-on-surface-variant group-hover:text-on-surface transition-colors">Manga</span>
</label>
</div>
</div>
<!-- Filter Section: Género -->
<div class="flex flex-col gap-4">
<h3 class="font-headline font-semibold text-lg text-on-surface tracking-tight">Género</h3>
<div class="flex flex-col gap-3">
<label class="flex items-center gap-3 cursor-pointer group">
<div class="relative flex items-center justify-center">
<input checked="" class="peer sr-only" type="checkbox"/>
<div class="w-5 h-5 rounded border border-outline-variant/30 peer-checked:bg-primary-container peer-checked:border-primary-container transition-all"></div>
<span class="material-symbols-outlined absolute text-[14px] text-on-primary opacity-0 peer-checked:opacity-100 transition-opacity" style="font-variation-settings: 'FILL' 1;">check</span>
</div>
<span class="text-sm text-on-surface-variant group-hover:text-on-surface transition-colors">Acción</span>
</label>
<label class="flex items-center gap-3 cursor-pointer group">
<div class="relative flex items-center justify-center">
<input class="peer sr-only" type="checkbox"/>
<div class="w-5 h-5 rounded border border-outline-variant/30 peer-checked:bg-primary-container peer-checked:border-primary-container transition-all"></div>
<span class="material-symbols-outlined absolute text-[14px] text-on-primary opacity-0 peer-checked:opacity-100 transition-opacity" style="font-variation-settings: 'FILL' 1;">check</span>
</div>
<span class="text-sm text-on-surface-variant group-hover:text-on-surface transition-colors">Aventura</span>
</label>
<label class="flex items-center gap-3 cursor-pointer group">
<div class="relative flex items-center justify-center">
<input checked="" class="peer sr-only" type="checkbox"/>
<div class="w-5 h-5 rounded border border-outline-variant/30 peer-checked:bg-primary-container peer-checked:border-primary-container transition-all"></div>
<span class="material-symbols-outlined absolute text-[14px] text-on-primary opacity-0 peer-checked:opacity-100 transition-opacity" style="font-variation-settings: 'FILL' 1;">check</span>
</div>
<span class="text-sm text-on-surface-variant group-hover:text-on-surface transition-colors">Fantasía oscura</span>
</label>
<label class="flex items-center gap-3 cursor-pointer group">
<div class="relative flex items-center justify-center">
<input class="peer sr-only" type="checkbox"/>
<div class="w-5 h-5 rounded border border-outline-variant/30 peer-checked:bg-primary-container peer-checked:border-primary-container transition-all"></div>
<span class="material-symbols-outlined absolute text-[14px] text-on-primary opacity-0 peer-checked:opacity-100 transition-opacity" style="font-variation-settings: 'FILL' 1;">check</span>
</div>
<span class="text-sm text-on-surface-variant group-hover:text-on-surface transition-colors">Ciencia ficción</span>
</label>
<label class="flex items-center gap-3 cursor-pointer group">
<div class="relative flex items-center justify-center">
<input class="peer sr-only" type="checkbox"/>
<div class="w-5 h-5 rounded border border-outline-variant/30 peer-checked:bg-primary-container peer-checked:border-primary-container transition-all"></div>
<span class="material-symbols-outlined absolute text-[14px] text-on-primary opacity-0 peer-checked:opacity-100 transition-opacity" style="font-variation-settings: 'FILL' 1;">check</span>
</div>
<span class="text-sm text-on-surface-variant group-hover:text-on-surface transition-colors">Drama</span>
</label>
</div>
<button class="text-xs font-label uppercase tracking-widest text-primary-container hover:text-primary text-left mt-2">Ver más (15+)</button>
</div>
<!-- Filter Section: Año -->
<div class="flex flex-col gap-4">
<h3 class="font-headline font-semibold text-lg text-on-surface tracking-tight">Año</h3>
<div class="flex flex-col gap-3">
<input class="w-full h-1 bg-surface-container-high rounded-lg appearance-none cursor-pointer accent-primary-container" max="2024" min="1980" type="range" value="2020"/>
<div class="flex justify-between text-xs text-on-surface-variant">
<span>1980</span>
<span class="text-primary-container font-medium">2020+</span>
<span>2024</span>
</div>
</div>
</div>
<!-- CTA Button -->
<button class="w-full bg-primary-container text-on-primary font-headline font-bold py-3 rounded-md hover:bg-primary transition-colors hover:shadow-[0_0_12px_rgba(245,197,24,0.3)] mt-4">
                Aplicar Filtros
            </button>
</aside>
<!-- Right Content Area -->
<section class="flex-grow flex flex-col gap-6 min-w-0">
<!-- Header & Search -->
<div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-outline-variant/15 pb-6">
<div>
<h1 class="font-headline font-bold text-4xl text-on-surface tracking-tight -ml-0.5">Explorar Catálogo</h1>
<p class="text-on-surface-variant mt-2 text-sm">Mostrando <span class="text-primary-container font-medium">2,451</span> resultados</p>
</div>
<div class="flex items-center gap-3 w-full md:w-auto">
<!-- Mobile Search/Filter Toggle (Hidden on Desktop) -->
<button class="md:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-surface-container-low border border-outline-variant/15 text-on-surface">
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 0;">tune</span>
</button>
<div class="relative flex-grow md:w-72">
<span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" style="font-variation-settings: 'FILL' 0;">sort</span>
<select class="w-full bg-surface-container-low border border-outline-variant/15 rounded-lg py-2 pl-10 pr-8 text-sm text-on-surface focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container appearance-none cursor-pointer">
<option>Más Populares</option>
<option>Mejor Valorados</option>
<option>Agregados Recientemente</option>
<option>Próximos Estrenos</option>
</select>
<span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" style="font-variation-settings: 'FILL' 0;">arrow_drop_down</span>
</div>
</div>
</div>
<!-- Content Grid (Responsive 2 to 5 columns) -->
<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 mt-4">
<!-- Card 1 -->
<article class="group cursor-pointer flex flex-col gap-3">
<div class="relative aspect-[2/3] w-full rounded-lg overflow-hidden bg-surface-container-high shadow-lg">
<img alt="Anime Poster" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" data-alt="cinematic anime style illustration of a neon lit city street at night in the rain, cyberpunk mood" src="https://lh3.googleusercontent.com/aida-public/AB6AXuChD4VspySt0Vvn3FA5Gk-KTldkXw951HET3FNFPYCSzRRv_7yE33QsIJ4rsNWF9M9AgrcQxPCAVVmVxKEVR78w9Veo-_hFh9-XU7L47uKAtkE8rJ0wlgWYT5tbo31Fe2lBLS13bCXi-jB6YPNyvMT_2VpddNt7UT8RVwhJSQS13uvJ_hDLMso1Y6mY9iYgOOjIKji9dRrHJHbx02r3e_1KML7Tf3wQHSHw2snLivCaxf_OQn4xgVfHW-rcqi0JuMYnzrIhVeILIBU"/>
<!-- Rating Badge -->
<div class="absolute top-2 right-2 bg-surface/80 backdrop-blur-md px-2 py-1 rounded text-xs font-bold text-primary-container flex items-center gap-1 border border-outline-variant/15">
<span class="material-symbols-outlined text-[14px]" style="font-variation-settings: 'FILL' 1;">star</span>
                            9.8
                        </div>
<!-- Type Badge -->
<div class="absolute top-2 left-2 bg-secondary-container/80 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-label uppercase tracking-wider text-on-secondary-container">
                            Anime
                        </div>
</div>
<div>
<h3 class="font-headline font-semibold text-base text-on-surface line-clamp-1 group-hover:text-primary-container transition-colors">Neon Genesis Continuum</h3>
<p class="text-xs text-on-surface-variant mt-1">Sci-Fi, Mecha • 2023</p>
</div>
</article>
<!-- Card 2 -->
<article class="group cursor-pointer flex flex-col gap-3">
<div class="relative aspect-[2/3] w-full rounded-lg overflow-hidden bg-surface-container-high shadow-lg">
<img alt="Anime Poster" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" data-alt="dark fantasy illustration of a glowing sword stuck in a stone surrounded by dark mist and red glowing embers" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBHyrQI0SySd1oqclf6W0YvVTQlBLJthcRFI_2CAuOS9DwR5vpQCuj2LmVw4A3md5yrHkjko38ECbWXh4XpYAvXNtBEGsTIBxyzpPucm2kpxhzyLzMsmDPrPE4pwOjuGncSe6gZPDtOZDevF8rqiszMjDfun3dQOYHrt-94BJTbfGKsraH_2ul93yaPYMdzF8RR0gARL0TVooeeWAxyH8UFnTvmrVQJLKUGjdCYKOmAnSdQpqAnc6zDoCnDF9tJ_4cqKTdW9P5qaW4"/>
<div class="absolute top-2 right-2 bg-surface/80 backdrop-blur-md px-2 py-1 rounded text-xs font-bold text-primary-container flex items-center gap-1 border border-outline-variant/15">
<span class="material-symbols-outlined text-[14px]" style="font-variation-settings: 'FILL' 1;">star</span>
                            9.5
                        </div>
<div class="absolute top-2 left-2 bg-secondary-container/80 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-label uppercase tracking-wider text-on-secondary-container">
                            Anime
                        </div>
</div>
<div>
<h3 class="font-headline font-semibold text-base text-on-surface line-clamp-1 group-hover:text-primary-container transition-colors">Crimson Edge</h3>
<p class="text-xs text-on-surface-variant mt-1">Dark Fantasy, Action • 2024</p>
</div>
</article>
<!-- Card 3 -->
<article class="group cursor-pointer flex flex-col gap-3">
<div class="relative aspect-[2/3] w-full rounded-lg overflow-hidden bg-surface-container-high shadow-lg">
<img alt="Manga Cover" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out grayscale hover:grayscale-0" data-alt="black and white manga style ink drawing of a complex cityscape with deep shadows and high contrast" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCIBfzwJ0P9wTnduV3RwvSvIRrjUsW5VSCPX8Pw6ZIHOvMYi2X2kmStpRUNoOVpZ-gVc-9XBA2qTeqPXRX4Kdd-CvHJJytZ796Wh2GzLCduVKPCyPb9iq-60xvFIARYne4ubDnDBMfAJmZv9vMYPmNmE9rBq5KyEmUfyjEGFWAWDuxf263ZSl7aeRVCv30VPogEvvPKhpQC7T_cbXb-q9ND8Q-lU6_iu-JWzvKu64HmLqfjgrywFriylChI3FtHOuGm75Jp3Uw4A20"/>
<div class="absolute top-2 right-2 bg-surface/80 backdrop-blur-md px-2 py-1 rounded text-xs font-bold text-primary-container flex items-center gap-1 border border-outline-variant/15">
<span class="material-symbols-outlined text-[14px]" style="font-variation-settings: 'FILL' 1;">star</span>
                            9.2
                        </div>
<div class="absolute top-2 left-2 bg-tertiary-container/80 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-label uppercase tracking-wider text-on-tertiary-container">
                            Manga
                        </div>
</div>
<div>
<h3 class="font-headline font-semibold text-base text-on-surface line-clamp-1 group-hover:text-primary-container transition-colors">Silent Echoes</h3>
<p class="text-xs text-on-surface-variant mt-1">Psychological, Drama • 2021</p>
</div>
</article>
<!-- Card 4 -->
<article class="group cursor-pointer flex flex-col gap-3">
<div class="relative aspect-[2/3] w-full rounded-lg overflow-hidden bg-surface-container-high shadow-lg">
<img alt="Anime Poster" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" data-alt="cinematic shot of a tranquil japanese garden at dusk with glowing lanterns reflecting on a still pond" src="https://lh3.googleusercontent.com/aida-public/AB6AXuASvv2srCpsaeClyoBGrL2TYy9AUQegpRPYxHsq5J289PkbE72r7qF5L3EjjGlfcIDXSPC-Her21KFhLene2VcD0CEiSPmGW3PfU7kuwf5RaTLH3kr1d0J2cdJfMMJLsnTpoS5Xu4lZY6ucxuV4uZ56MNoaCgENYoUsjqftCYRot1RwhImwSYkPxxbEAOlibL11AHJpQBfV--lkcaGddYmEveT6_vvwS3giQNjOXinECVMH-vCH-FtyX-CSck9IOl7fSKuU7alNuL4"/>
<div class="absolute top-2 right-2 bg-surface/80 backdrop-blur-md px-2 py-1 rounded text-xs font-bold text-primary-container flex items-center gap-1 border border-outline-variant/15">
<span class="material-symbols-outlined text-[14px]" style="font-variation-settings: 'FILL' 1;">star</span>
                            8.9
                        </div>
<div class="absolute top-2 left-2 bg-secondary-container/80 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-label uppercase tracking-wider text-on-secondary-container">
                            Anime
                        </div>
</div>
<div>
<h3 class="font-headline font-semibold text-base text-on-surface line-clamp-1 group-hover:text-primary-container transition-colors">Whispering Willows</h3>
<p class="text-xs text-on-surface-variant mt-1">Slice of Life, Romance • 2022</p>
</div>
</article>
<!-- Card 5 -->
<article class="group cursor-pointer flex flex-col gap-3 hidden sm:flex">
<div class="relative aspect-[2/3] w-full rounded-lg overflow-hidden bg-surface-container-high shadow-lg">
<img alt="Anime Poster" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" data-alt="vibrant abstract explosion of colorful paint in space, dynamic movement, high energy" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAa9ZLZBhomZ9YVSu-FvaRxZt4JZDESk4TO9Ahyvc-5rKOImOdE5puI_vg2R4YTdEj2P2hTKK0Kq9dO8AiXAm1i4oIDOmmjB4Q_Ebb71GN2w8bASRhbsvYzMWHViNNzidyI1vLwiNJdt1y1907myum8iyTCn4kog-TBA7HyVcHP-QjnWcfWr2aEatYtoFD9AJi7IJzaWVDrgKxUWyuztX7qmEBjJhhsmCDPIH9zljOxH3sJYjxyTJttRmuT8OSAURMkblTpSJd8wZU"/>
<div class="absolute top-2 right-2 bg-surface/80 backdrop-blur-md px-2 py-1 rounded text-xs font-bold text-primary-container flex items-center gap-1 border border-outline-variant/15">
<span class="material-symbols-outlined text-[14px]" style="font-variation-settings: 'FILL' 1;">star</span>
                            8.7
                        </div>
<div class="absolute top-2 left-2 bg-secondary-container/80 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-label uppercase tracking-wider text-on-secondary-container">
                            Anime
                        </div>
</div>
<div>
<h3 class="font-headline font-semibold text-base text-on-surface line-clamp-1 group-hover:text-primary-container transition-colors">Astral Dash</h3>
<p class="text-xs text-on-surface-variant mt-1">Sports, Comedy • 2023</p>
</div>
</article>
<!-- Repeat cards to fill grid (simulated) -->
<!-- Card 6 -->
<article class="group cursor-pointer flex flex-col gap-3">
<div class="relative aspect-[2/3] w-full rounded-lg overflow-hidden bg-surface-container-high shadow-lg">
<img alt="Manga Cover" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out grayscale hover:grayscale-0" data-alt="black and white intense manga style close up of an eye reflecting a shattered mirror" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCzGqIwHjO1hCe67v3I7_KtCydT1Y5G2wqFlRVbtGUfvnmGzjhTh0J8wtwE5UjbW-ZS3Pzw8NPIPDoom1iVSteA6cqfYg2Vrn_b5plxwQJptU0MFGNN8OB9_zv-jxt_obX7OptEitYZuCHyDbFFf5MzV2-DE48Akixd66meAMvz2mj_KWJg3izX6XT0FQdTUrKa9EMbrkXEkaguTZ1a3z7Qn1_BOraz9enbY0F172aYDfUic4FFBVMJj0d7wea4XS_lX2tGMGeRBJE"/>
<div class="absolute top-2 right-2 bg-surface/80 backdrop-blur-md px-2 py-1 rounded text-xs font-bold text-primary-container flex items-center gap-1 border border-outline-variant/15">
<span class="material-symbols-outlined text-[14px]" style="font-variation-settings: 'FILL' 1;">star</span>
                            9.1
                        </div>
<div class="absolute top-2 left-2 bg-tertiary-container/80 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-label uppercase tracking-wider text-on-tertiary-container">
                            Manga
                        </div>
</div>
<div>
<h3 class="font-headline font-semibold text-base text-on-surface line-clamp-1 group-hover:text-primary-container transition-colors">Shattered Glass</h3>
<p class="text-xs text-on-surface-variant mt-1">Mystery, Thriller • 2020</p>
</div>
</article>
<!-- Card 7 -->
<article class="group cursor-pointer flex flex-col gap-3">
<div class="relative aspect-[2/3] w-full rounded-lg overflow-hidden bg-surface-container-high shadow-lg">
<img alt="Anime Poster" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" data-alt="beautiful fantasy landscape with floating islands and waterfalls in the sky, warm golden light" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCijJv5zvMmeiYs68nOPiHgJQ_qrgLRgGrSCPjRBVAvLsdMoRnd9hIYN5Ev2GUdKMfbOwdG9Q0e0Q1uO1PpCVA0wB-iYYJBwURCZm7Pj5cQiXruOk4k8u84IB0TTHy-zgI3MYbtBPqomC48JrapEdDMmbMX3a-8baCRxr95VCFN3KL89UmtKSRvUqc_PRNDTvRuk9Ey7Un_09AszPquosCqKFiApK8nDSxHBA8YM9f9Ry-YfPyuGjdLSgD6PykJa35Q0FVFh6V2tyA"/>
<div class="absolute top-2 right-2 bg-surface/80 backdrop-blur-md px-2 py-1 rounded text-xs font-bold text-primary-container flex items-center gap-1 border border-outline-variant/15">
<span class="material-symbols-outlined text-[14px]" style="font-variation-settings: 'FILL' 1;">star</span>
                            8.5
                        </div>
<div class="absolute top-2 left-2 bg-secondary-container/80 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-label uppercase tracking-wider text-on-secondary-container">
                            Anime
                        </div>
</div>
<div>
<h3 class="font-headline font-semibold text-base text-on-surface line-clamp-1 group-hover:text-primary-container transition-colors">Skyward Bound</h3>
<p class="text-xs text-on-surface-variant mt-1">Adventure, Fantasy • 2019</p>
</div>
</article>
<!-- Card 8 -->
<article class="group cursor-pointer flex flex-col gap-3">
<div class="relative aspect-[2/3] w-full rounded-lg overflow-hidden bg-surface-container-high shadow-lg">
<div class="absolute inset-0 bg-surface-container-high animate-pulse"></div> <!-- Placeholder state -->
<div class="absolute top-2 right-2 bg-surface/80 backdrop-blur-md px-2 py-1 rounded text-xs font-bold text-primary-container flex items-center gap-1 border border-outline-variant/15 opacity-50">
<span class="material-symbols-outlined text-[14px]" style="font-variation-settings: 'FILL' 1;">star</span>
                            --
                        </div>
</div>
<div>
<div class="h-5 bg-surface-container-high rounded w-3/4 mb-2 animate-pulse"></div>
<div class="h-3 bg-surface-container-high rounded w-1/2 animate-pulse"></div>
</div>
</article>
</div>
<!-- Pagination -->
<div class="flex justify-center items-center gap-2 mt-12 pt-8 border-t border-outline-variant/15">
<button class="w-10 h-10 rounded flex items-center justify-center text-on-surface-variant hover:text-primary-container hover:bg-surface-container-low transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
<span class="material-symbols-outlined">chevron_left</span>
</button>
<button class="w-10 h-10 rounded flex items-center justify-center bg-primary-container text-on-primary font-semibold">1</button>
<button class="w-10 h-10 rounded flex items-center justify-center text-on-surface hover:text-primary-container hover:bg-surface-container-low transition-colors">2</button>
<button class="w-10 h-10 rounded flex items-center justify-center text-on-surface hover:text-primary-container hover:bg-surface-container-low transition-colors">3</button>
<span class="text-on-surface-variant px-2">...</span>
<button class="w-10 h-10 rounded flex items-center justify-center text-on-surface hover:text-primary-container hover:bg-surface-container-low transition-colors">24</button>
<button class="w-10 h-10 rounded flex items-center justify-center text-on-surface hover:text-primary-container hover:bg-surface-container-low transition-colors">
<span class="material-symbols-outlined">chevron_right</span>
</button>
</div>
</section>
</main>
<!-- BottomNavBar (Mobile Only) -->
<nav class="fixed bottom-0 left-0 w-full flex justify-around items-center py-3 px-4 md:hidden dark:bg-[#131313]/90 backdrop-blur-2xl border-t border-white/5 shadow-2xl rounded-t-xl z-50">
<a class="flex flex-col items-center text-gray-500 hover:text-yellow-200 active:scale-90 transition-transform" href="#">
<span class="material-symbols-outlined mb-1" data-icon="home">home</span>
<span class="font-['Inter'] text-[10px] uppercase tracking-widest">Home</span>
</a>
<a class="flex flex-col items-center text-yellow-400 scale-110 hover:text-yellow-200 active:scale-90 transition-transform" href="#">
<span class="material-symbols-outlined mb-1" data-icon="search" style="font-variation-settings: 'FILL' 1;">search</span>
<span class="font-['Inter'] text-[10px] uppercase tracking-widest">Explore</span>
</a>
<a class="flex flex-col items-center text-gray-500 hover:text-yellow-200 active:scale-90 transition-transform" href="#">
<span class="material-symbols-outlined mb-1" data-icon="auto_stories">auto_stories</span>
<span class="font-['Inter'] text-[10px] uppercase tracking-widest">Library</span>
</a>
<a class="flex flex-col items-center text-gray-500 hover:text-yellow-200 active:scale-90 transition-transform" href="#">
<span class="material-symbols-outlined mb-1" data-icon="person">person</span>
<span class="font-['Inter'] text-[10px] uppercase tracking-widest">Profile</span>
</a>
</nav>
<!-- Footer -->
<footer class="w-full mt-auto bg-gradient-to-t from-black to-[#0E0E0E] dark:bg-[#0E0E0E] flex flex-col md:flex-row justify-between items-center px-12 py-8 border-t border-white/5 pb-24 md:pb-8">
<div class="font-['Manrope'] font-bold text-yellow-400 mb-4 md:mb-0">AniRate</div>
<div class="font-['Inter'] text-xs text-gray-500 text-center mb-4 md:mb-0">
            © 2024 ANIRATE. ENGINEERED FOR THE DIGITAL AUTEUR.
        </div>
<div class="flex gap-4 font-['Inter'] text-xs text-gray-500">
<a class="text-gray-600 hover:text-white transition-colors cursor-pointer" href="#">Terms of Service</a>
<a class="text-gray-600 hover:text-white transition-colors cursor-pointer" href="#">Privacy Policy</a>
<a class="text-gray-600 hover:text-white transition-colors cursor-pointer" href="#">API Docs</a>
<a class="text-gray-600 hover:text-white transition-colors cursor-pointer" href="#">Support</a>
</div>
</footer>
</body></html>

<!-- Profile - AniRate -->
<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>AniRate - Profile</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&amp;family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    "colors": {
                        "tertiary-fixed": "#ebddff",
                        "outline-variant": "#4e4633",
                        "on-surface": "#e5e2e1",
                        "on-background": "#e5e2e1",
                        "on-surface-variant": "#d1c5ac",
                        "on-primary-container": "#695200",
                        "surface-variant": "#353534",
                        "surface-dim": "#131313",
                        "on-secondary-fixed": "#001551",
                        "primary-container": "#f5c518",
                        "primary": "#ffe5a0",
                        "surface-container-lowest": "#0e0e0e",
                        "surface": "#131313",
                        "error-container": "#93000a",
                        "surface-container-high": "#2a2a2a",
                        "on-primary": "#3d2f00",
                        "error": "#ffb4ab",
                        "on-error": "#690005",
                        "on-primary-fixed": "#241a00",
                        "surface-container-highest": "#353534",
                        "on-primary-fixed-variant": "#584400",
                        "surface-bright": "#3a3939",
                        "on-secondary-fixed-variant": "#0039b5",
                        "on-secondary": "#002682",
                        "inverse-on-surface": "#313030",
                        "primary-fixed-dim": "#f0c110",
                        "on-tertiary-fixed-variant": "#5b00c5",
                        "surface-container": "#201f1f",
                        "inverse-primary": "#745b00",
                        "on-tertiary": "#3f008d",
                        "surface-container-low": "#1c1b1b",
                        "tertiary-fixed-dim": "#d3bbff",
                        "primary-fixed": "#ffe08b",
                        "inverse-surface": "#e5e2e1",
                        "on-tertiary-fixed": "#250059",
                        "secondary": "#b7c4ff",
                        "tertiary": "#eee1ff",
                        "on-error-container": "#ffdad6",
                        "background": "#131313",
                        "on-secondary-container": "#b2c0ff",
                        "surface-tint": "#f0c110",
                        "outline": "#9a9078",
                        "on-tertiary-container": "#6a23d6",
                        "secondary-fixed": "#dce1ff",
                        "secondary-container": "#0040cb",
                        "tertiary-container": "#d6c0ff",
                        "secondary-fixed-dim": "#b7c4ff"
                    },
                    "borderRadius": {
                        "DEFAULT": "0.125rem",
                        "lg": "0.25rem",
                        "xl": "0.5rem",
                        "full": "0.75rem"
                    },
                    "spacing": {},
                    "fontFamily": {
                        "headline": [
                            "Manrope"
                        ],
                        "body": [
                            "Inter"
                        ],
                        "label": [
                            "Inter"
                        ]
                    }
                },
            },
        }
    </script>
</head>
<body class="bg-background text-on-background font-body antialiased min-h-screen flex flex-col pt-[88px] selection:bg-primary-container selection:text-on-primary-container">
<!-- TopNavBar -->
<nav class="fixed top-0 w-full z-50 dark:bg-[#131313]/70 backdrop-blur-md bg-[#201F1F] shadow-[0px_4px_20px_rgba(245,197,24,0.08)]">
<div class="flex justify-between items-center px-8 py-4 w-full max-w-screen-2xl mx-auto">
<div class="flex items-center gap-8">
<a class="text-2xl font-black tracking-tighter text-yellow-400 font-['Manrope']" href="#">AniRate</a>
<div class="relative hidden md:block w-64">
<span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-sm">search</span>
<input class="w-full bg-surface-container-highest/50 border border-outline-variant/15 rounded-full py-1.5 pl-9 pr-4 text-sm focus:outline-none focus:border-primary-container/50 text-on-surface placeholder:text-on-surface-variant/50 transition-colors" placeholder="Search..." type="text"/>
</div>
</div>
<div class="hidden md:flex items-center gap-6 font-['Manrope'] tracking-tight text-sm font-semibold">
<a class="text-gray-400 hover:text-yellow-400 transition-all duration-300 active:scale-95" href="#">Browse</a>
<a class="text-gray-400 hover:text-yellow-400 transition-all duration-300 active:scale-95" href="#">Seasonal</a>
<a class="text-gray-400 hover:text-yellow-400 transition-all duration-300 active:scale-95" href="#">Manga</a>
<a class="text-gray-400 hover:text-yellow-400 transition-all duration-300 active:scale-95" href="#">Community</a>
</div>
<div class="flex items-center gap-4">
<button class="text-on-surface-variant hover:text-yellow-400 transition-colors active:scale-95">
<span class="material-symbols-outlined">notifications</span>
</button>
<button class="text-on-surface-variant hover:text-yellow-400 transition-colors active:scale-95">
<span class="material-symbols-outlined">settings</span>
</button>
<div class="w-8 h-8 rounded-full overflow-hidden border border-outline-variant/15 active:scale-95 transition-transform cursor-pointer">
<img alt="User Avatar" class="w-full h-full object-cover" data-alt="close-up portrait of a young woman with neon lighting in a cyberpunk city setting, moody atmosphere" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDYJzu6ZKNBb6ykqK6WKwwVFOgXzBQC64VEmShRnfbV0LQqQo0Iq_j4BalTbNEtk9de2pq2_M12DgYtAqjd8DuMjZFKQ_iBc5DBkbKizxfHW9G0QrF5cF7yfvWvorvExZtDJaZZmk4lV4PExYOx4s2bwWtAbg6_1srK2_55s2L7KhRYUwEfSjCrXaDZ8iEn1cbfd8ZjZgvyWGqVACpZH2qcIO7Dbz0da-aJ0Q_pK2NZoa2Ak9yqbe9wFfuZ7yEYfR6HEAgJtG2gqcc"/>
</div>
</div>
</div>
</nav>
<main class="flex-grow w-full max-w-screen-2xl mx-auto px-4 md:px-8 py-8 md:py-12 pb-32">
<!-- Profile Header -->
<section class="bg-surface-container-high rounded-xl p-8 mb-12 relative overflow-hidden group">
<div class="absolute inset-0 opacity-5 pointer-events-none" style="background-image: radial-gradient(circle at right, var(--tw-colors-primary-container), transparent 50%);"></div>
<div class="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
<!-- Avatar -->
<div class="relative shrink-0">
<div class="w-32 h-32 md:w-40 md:h-40 rounded-full p-1 bg-gradient-to-br from-primary-container to-surface-container-highest">
<div class="w-full h-full rounded-full overflow-hidden bg-surface">
<img alt="Profile Picture" class="w-full h-full object-cover" data-alt="close-up portrait of a young woman with neon lighting in a cyberpunk city setting, moody atmosphere" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCBLftI_MoKvbw7BNyEVGj-IiwHvte0xv3FZBfIi194LgxddylqL3-il4KhMZ1nuhFzlADjcj0nXRr7rwCR7wbLc3MYiMDiseJ8fxYrMTk9awhdLyu3P2IAItfk9A834-O6nr_B8vfYB2K5c8yWrElTeEdD_9O2xsjvkUZzuQGcMbZxy-zUPMvAeniWxHSzOad_OGa9p9Mu3HTHaax3J9fe2asa1SyZ1X3TtCdr2zwCvmBUCL3at9FQ_CgI1J51FrsZZHteDtTkVYs"/>
</div>
</div>
</div>
<!-- Info -->
<div class="flex-grow text-center md:text-left flex flex-col justify-center pt-2 md:pt-4">
<h1 class="font-headline text-4xl md:text-5xl font-bold text-on-surface tracking-tight mb-2">AuteurReviewer</h1>
<p class="font-body text-on-surface-variant text-base mb-6">auteur@anirate.io</p>
<!-- Stats -->
<div class="flex flex-wrap justify-center md:justify-start gap-6 md:gap-10">
<div class="flex flex-col items-center md:items-start">
<span class="font-headline text-2xl font-bold text-primary-container">24</span>
<span class="font-label text-[11px] uppercase tracking-widest text-on-surface-variant/70">Favoritos</span>
</div>
<div class="flex flex-col items-center md:items-start">
<span class="font-headline text-2xl font-bold text-on-surface">12</span>
<span class="font-label text-[11px] uppercase tracking-widest text-on-surface-variant/70">Reviews</span>
</div>
<div class="flex flex-col items-center md:items-start">
<span class="font-headline text-2xl font-bold text-on-surface">187</span>
<span class="font-label text-[11px] uppercase tracking-widest text-on-surface-variant/70">Ratings</span>
</div>
</div>
</div>
<!-- Action -->
<div class="absolute top-4 right-4 md:static">
<button class="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant hover:text-primary-container transition-colors border border-outline-variant/15 hover:border-primary-container/30">
<span class="material-symbols-outlined text-xl">edit</span>
</button>
</div>
</div>
</section>
<!-- Tabs -->
<div class="border-b border-outline-variant/15 mb-8">
<div class="flex gap-8 px-2 overflow-x-auto no-scrollbar">
<button class="font-headline text-lg font-semibold text-primary-container border-b-2 border-primary-container pb-4 px-1 whitespace-nowrap">Favoritos</button>
<button class="font-headline text-lg font-semibold text-on-surface-variant hover:text-on-surface pb-4 px-1 whitespace-nowrap transition-colors">Reviews</button>
<button class="font-headline text-lg font-semibold text-on-surface-variant hover:text-on-surface pb-4 px-1 whitespace-nowrap transition-colors">Ratings</button>
</div>
</div>
<!-- Grid Content -->
<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
<!-- Card 1 -->
<div class="group relative rounded-lg overflow-hidden bg-surface-container aspect-[2/3] cursor-pointer">
<img alt="Anime Poster" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100" data-alt="cinematic anime style landscape with glowing neon signs and a lone figure in the rain, dark purple and blue palette" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBvkax-Gc75e-mQs6QTyZ9u9ka-rGT1b4fNQcUn7MBuiQa5LKJ5RLY7beRy8APkcX2xuo-5TzhAd7oqWgXCkeYRxnr86XprHHsHOOFUigQ-KJtmUpypGAfmfoi2BMvhakocSVFj6cwgMkk-4iTsciM4Acx3SJTzb7oqCNMGi9dXgceKtr7htGqhv0UPxLvFlsqzFCLEbkOYI--9NRYx8Hes_71-tRUMFWidQrdo5vM5TK5Ws6V4udBNUqtXzQSckLlN9zmpv9ixmbU"/>
<div class="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface/40 to-transparent"></div>
<div class="absolute top-3 right-3 w-8 h-8 rounded-full bg-surface/70 backdrop-blur-md flex items-center justify-center border border-outline-variant/15">
<span class="material-symbols-outlined text-primary-container text-sm" style="font-variation-settings: 'FILL' 1;">favorite</span>
</div>
<div class="absolute bottom-0 left-0 w-full p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
<div class="flex items-center gap-1 mb-1">
<span class="material-symbols-outlined text-primary-container text-sm" style="font-variation-settings: 'FILL' 1;">star</span>
<span class="font-headline font-bold text-sm text-on-surface">9.8</span>
</div>
<h3 class="font-headline font-semibold text-lg text-on-surface leading-tight line-clamp-2">Neon Genesis Evangelion</h3>
</div>
</div>
<!-- Card 2 -->
<div class="group relative rounded-lg overflow-hidden bg-surface-container aspect-[2/3] cursor-pointer">
<img alt="Anime Poster" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100" data-alt="dramatic futuristic cityscape at night with intense red and black aesthetic, towering brutalist architecture" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCiOpFDU0RNXERbxv6lUXWZtQxOt5kREjBQxMjz50hDI74pm8QeekpJllhcJk_kP0HIotmjwGhVKnLAAoamsSn_NKB-BXN-dRDI2tUaRLpYRPeOOlnbMSR-viBRlWAF9lFpKq6UEfkZdVeuYXG1uWqUgaHh4d6BLmzR4eJAjPbqxqyBDfQVM3WdCX8lsXbUx_f43bXzQMypSFph682-JmR5sXvhfWtS-GCdi1oUqPpJqT7nA0c4J75z78RpVFgKNyTXowCm15yQyYE"/>
<div class="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface/40 to-transparent"></div>
<div class="absolute top-3 right-3 w-8 h-8 rounded-full bg-surface/70 backdrop-blur-md flex items-center justify-center border border-outline-variant/15">
<span class="material-symbols-outlined text-primary-container text-sm" style="font-variation-settings: 'FILL' 1;">favorite</span>
</div>
<div class="absolute bottom-0 left-0 w-full p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
<div class="flex items-center gap-1 mb-1">
<span class="material-symbols-outlined text-primary-container text-sm" style="font-variation-settings: 'FILL' 1;">star</span>
<span class="font-headline font-bold text-sm text-on-surface">9.5</span>
</div>
<h3 class="font-headline font-semibold text-lg text-on-surface leading-tight line-clamp-2">Akira</h3>
</div>
</div>
<!-- Card 3 -->
<div class="group relative rounded-lg overflow-hidden bg-surface-container aspect-[2/3] cursor-pointer">
<img alt="Anime Poster" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100" data-alt="serene mountainous landscape with cherry blossoms in foreground and a traditional temple in background, soft morning light" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC7xPaGiRN8WGazxmJVuJ_jM0AnnwZf1xz-D3Fe6XubZulfmP7z1OHnOvt3yKFmzyDd4uglwrB-S4cr9FRB0BSi3Gs4WE61T5Fxet2PaBKjnd33s8QPWGM0FbmU_0py1m_c8TfvFPV7TGI_By0ReEbYEbqDEN1AlrxPRe5mqQvYrWfI3iRgusZp7APzwA1iVs1pwtDaTkWDNA8Vo-fuIegR1M0LFr7Pn_sbAaVS-GBh-UB8-gsjVQUlnxY9R9lDK8liVXSWK-mm0_8"/>
<div class="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface/40 to-transparent"></div>
<div class="absolute top-3 right-3 w-8 h-8 rounded-full bg-surface/70 backdrop-blur-md flex items-center justify-center border border-outline-variant/15">
<span class="material-symbols-outlined text-primary-container text-sm" style="font-variation-settings: 'FILL' 1;">favorite</span>
</div>
<div class="absolute bottom-0 left-0 w-full p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
<div class="flex items-center gap-1 mb-1">
<span class="material-symbols-outlined text-primary-container text-sm" style="font-variation-settings: 'FILL' 1;">star</span>
<span class="font-headline font-bold text-sm text-on-surface">9.2</span>
</div>
<h3 class="font-headline font-semibold text-lg text-on-surface leading-tight line-clamp-2">Mushishi</h3>
</div>
</div>
<!-- Card 4 -->
<div class="group relative rounded-lg overflow-hidden bg-surface-container aspect-[2/3] cursor-pointer">
<img alt="Anime Poster" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100" data-alt="abstract sci-fi scene with glowing energy spheres floating in a dark, atmospheric room with reflective floor" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBwbh3mH96nFCr9sUzBuLcgsoODfO-bZiAHCPt9VGJipqetYN1IZo94XUcI-h-DVhxbU7Bnb-UJiYn1ybwqCRa3D1ZPP5yHR3s0PnjLJLfzKLIVtQUgbO1G11QtfprtvqwB42HMbkXE7ySk0IW0wb2PVkleqoJDwg6GHTKqg29kKqd7XWd-8rIdynYVkxEicl-7LEnsrXMZnDhroACKQuGXeAWyDU6Yf5hgjP80FStyxBIlUiDVxX97BaErMw1xly4tq_KelQBlwXs"/>
<div class="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface/40 to-transparent"></div>
<div class="absolute top-3 right-3 w-8 h-8 rounded-full bg-surface/70 backdrop-blur-md flex items-center justify-center border border-outline-variant/15">
<span class="material-symbols-outlined text-primary-container text-sm" style="font-variation-settings: 'FILL' 1;">favorite</span>
</div>
<div class="absolute bottom-0 left-0 w-full p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
<div class="flex items-center gap-1 mb-1">
<span class="material-symbols-outlined text-primary-container text-sm" style="font-variation-settings: 'FILL' 1;">star</span>
<span class="font-headline font-bold text-sm text-on-surface">8.9</span>
</div>
<h3 class="font-headline font-semibold text-lg text-on-surface leading-tight line-clamp-2">Ghost in the Shell</h3>
</div>
</div>
</div>
</main>
<!-- BottomNavBar (Mobile Only) -->
<nav class="fixed bottom-0 left-0 w-full flex justify-around items-center py-3 px-4 md:hidden dark:bg-[#131313]/90 backdrop-blur-2xl rounded-t-xl z-50 border-t border-white/5 shadow-2xl">
<a class="flex flex-col items-center text-gray-500 hover:text-yellow-200 active:scale-90 transition-transform" href="#">
<span class="material-symbols-outlined mb-1">home</span>
<span class="font-['Inter'] text-[10px] uppercase tracking-widest">Home</span>
</a>
<a class="flex flex-col items-center text-gray-500 hover:text-yellow-200 active:scale-90 transition-transform" href="#">
<span class="material-symbols-outlined mb-1">search</span>
<span class="font-['Inter'] text-[10px] uppercase tracking-widest">Explore</span>
</a>
<a class="flex flex-col items-center text-gray-500 hover:text-yellow-200 active:scale-90 transition-transform" href="#">
<span class="material-symbols-outlined mb-1">auto_stories</span>
<span class="font-['Inter'] text-[10px] uppercase tracking-widest">Library</span>
</a>
<a class="flex flex-col items-center text-yellow-400 scale-110 active:scale-90 transition-transform" href="#">
<span class="material-symbols-outlined mb-1" style="font-variation-settings: 'FILL' 1;">person</span>
<span class="font-['Inter'] text-[10px] uppercase tracking-widest">Profile</span>
</a>
</nav>
<!-- Footer -->
<footer class="w-full mt-auto flex flex-col md:flex-row justify-between items-center px-12 py-8 border-t border-white/5 bg-gradient-to-t from-black to-[#0E0E0E] dark:bg-[#0E0E0E]">
<div class="mb-4 md:mb-0">
<span class="font-['Manrope'] font-bold text-yellow-400 text-lg">AniRate</span>
</div>
<div class="flex gap-6 mb-4 md:mb-0">
<a class="font-['Inter'] text-xs text-gray-600 hover:text-white transition-colors cursor-pointer" href="#">Terms of Service</a>
<a class="font-['Inter'] text-xs text-gray-600 hover:text-white transition-colors cursor-pointer" href="#">Privacy Policy</a>
<a class="font-['Inter'] text-xs text-gray-600 hover:text-white transition-colors cursor-pointer" href="#">API Docs</a>
<a class="font-['Inter'] text-xs text-gray-600 hover:text-white transition-colors cursor-pointer" href="#">Support</a>
</div>
<div>
<span class="font-['Inter'] text-xs text-gray-500">© 2024 ANIRATE. ENGINEERED FOR THE DIGITAL AUTEUR.</span>
</div>
</footer>
</body></html>

<!-- Login - AniRate -->
<!DOCTYPE html>

<html class="dark" lang="es"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>AniRate - Iniciar Sesión</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&amp;family=Inter:wght@400;500&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            "colors": {
                    "tertiary-fixed": "#ebddff",
                    "outline-variant": "#4e4633",
                    "on-surface": "#e5e2e1",
                    "on-background": "#e5e2e1",
                    "on-surface-variant": "#d1c5ac",
                    "on-primary-container": "#695200",
                    "surface-variant": "#353534",
                    "surface-dim": "#131313",
                    "on-secondary-fixed": "#001551",
                    "primary-container": "#f5c518",
                    "primary": "#ffe5a0",
                    "surface-container-lowest": "#0e0e0e",
                    "surface": "#131313",
                    "error-container": "#93000a",
                    "surface-container-high": "#2a2a2a",
                    "on-primary": "#3d2f00",
                    "error": "#ffb4ab",
                    "on-error": "#690005",
                    "on-primary-fixed": "#241a00",
                    "surface-container-highest": "#353534",
                    "on-primary-fixed-variant": "#584400",
                    "surface-bright": "#3a3939",
                    "on-secondary-fixed-variant": "#0039b5",
                    "on-secondary": "#002682",
                    "inverse-on-surface": "#313030",
                    "primary-fixed-dim": "#f0c110",
                    "on-tertiary-fixed-variant": "#5b00c5",
                    "surface-container": "#201f1f",
                    "inverse-primary": "#745b00",
                    "on-tertiary": "#3f008d",
                    "surface-container-low": "#1c1b1b",
                    "tertiary-fixed-dim": "#d3bbff",
                    "primary-fixed": "#ffe08b",
                    "inverse-surface": "#e5e2e1",
                    "on-tertiary-fixed": "#250059",
                    "secondary": "#b7c4ff",
                    "tertiary": "#eee1ff",
                    "on-error-container": "#ffdad6",
                    "background": "#131313",
                    "on-secondary-container": "#b2c0ff",
                    "surface-tint": "#f0c110",
                    "outline": "#9a9078",
                    "on-tertiary-container": "#6a23d6",
                    "secondary-fixed": "#dce1ff",
                    "secondary-container": "#0040cb",
                    "tertiary-container": "#d6c0ff",
                    "secondary-fixed-dim": "#b7c4ff"
            },
            "borderRadius": {
                    "DEFAULT": "0.125rem",
                    "lg": "0.25rem",
                    "xl": "0.5rem",
                    "full": "0.75rem"
            },
            "spacing": {},
            "fontFamily": {
                    "headline": [
                            "Manrope"
                    ],
                    "body": [
                            "Inter"
                    ],
                    "label": [
                            "Inter"
                    ]
            }
    },
        },
      }
    </script>
</head>
<body class="bg-surface text-on-surface font-body antialiased min-h-screen flex items-center justify-center relative overflow-hidden">
<!-- Blurred Background Image -->
<div class="absolute inset-0 z-0">
<img alt="Background" class="w-full h-full object-cover opacity-30 blur-sm scale-105" data-alt="dramatic cinematic anime style background dark moody lighting neon accents blurry out of focus depth of field" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCNmQ--Tjiz7mMIH8fAXsSz_YlBtzc-eJbpK36ycSO1AZu0j4pkRXY_MSElHtT4P2BYcf5AhTxOWOFhEKXiBKVdnAnij73pzfOkF8WJT0s9SsjI3ynRscWqeWpkErEr020IB5p_9k_7d02FAFLotLfN7eP6tpsu10loaHzBp02c6ak6LxPEMnZhR5RTb8S8ZP3PRyiFO5jjLIrYXh1IPgKXBekzCkPPKaUWuDsQ5RHhR6oJl1RKY5DJmKN5omS_9P8ZO01ct6k9yqM"/>
<div class="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface/80 to-surface/40"></div>
</div>
<!-- Login Card -->
<main class="relative z-10 w-full max-w-[400px] px-6">
<div class="bg-surface-container-high/80 backdrop-blur-2xl rounded-xl p-8 shadow-[0_30px_60px_rgba(0,0,0,0.6)]">
<!-- Brand / Logo -->
<div class="flex flex-col items-center mb-10">
<h1 class="font-headline font-black text-4xl tracking-tighter text-primary-container mb-2">AniRate</h1>
<p class="font-headline font-semibold text-2xl text-on-surface tracking-tight">Iniciar Sesión</p>
</div>
<!-- Form -->
<form action="#" class="space-y-6" method="POST">
<!-- Email Field -->
<div>
<label class="block text-sm font-medium text-on-surface-variant mb-2" for="email">Correo Electrónico</label>
<div class="relative">
<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
<span class="material-symbols-outlined text-outline text-xl">mail</span>
</div>
<input class="block w-full pl-10 pr-3 py-3 border-transparent rounded-lg bg-surface-container focus:bg-surface-container-highest focus:ring-1 focus:ring-primary-container focus:border-primary-container text-on-surface placeholder-outline-variant transition-colors duration-200" id="email" name="email" placeholder="tu@email.com" required="" type="email"/>
</div>
</div>
<!-- Password Field -->
<div>
<div class="flex items-center justify-between mb-2">
<label class="block text-sm font-medium text-on-surface-variant" for="password">Contraseña</label>
<a class="text-sm font-medium text-primary hover:text-primary-fixed-dim transition-colors" href="#">¿Olvidaste tu contraseña?</a>
</div>
<div class="relative">
<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
<span class="material-symbols-outlined text-outline text-xl">lock</span>
</div>
<input class="block w-full pl-10 pr-10 py-3 border-transparent rounded-lg bg-surface-container focus:bg-surface-container-highest focus:ring-1 focus:ring-primary-container focus:border-primary-container text-on-surface placeholder-outline-variant transition-colors duration-200" id="password" name="password" placeholder="••••••••" required="" type="password"/>
<div class="absolute inset-y-0 right-0 pr-3 flex items-center">
<button class="text-outline hover:text-on-surface transition-colors focus:outline-none" type="button">
<span class="material-symbols-outlined text-xl">visibility_off</span>
</button>
</div>
</div>
</div>
<!-- Submit Button -->
<button class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-on-primary bg-primary-container hover:bg-primary-fixed-dim hover:shadow-[0_0_12px_rgba(245,197,24,0.4)] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-container focus:ring-offset-surface-container-high" type="submit">
                    Iniciar Sesión
                </button>
</form>
<!-- Register Link -->
<div class="mt-8 text-center">
<p class="text-sm text-on-surface-variant">
                    ¿No tienes una cuenta? 
                    <a class="font-medium text-primary hover:text-primary-fixed-dim transition-colors ml-1" href="#">Regístrate</a>
</p>
</div>
</div>
</main>
</body></html>

<!-- Content Detail - AniRate -->
<!DOCTYPE html>

<html class="dark" lang="es"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>AniRate - Content Detail</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&amp;family=Inter:wght@400;500;600&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
          darkMode: "class",
          theme: {
            extend: {
              "colors": {
                      "tertiary-fixed": "#ebddff",
                      "outline-variant": "#4e4633",
                      "on-surface": "#e5e2e1",
                      "on-background": "#e5e2e1",
                      "on-surface-variant": "#d1c5ac",
                      "on-primary-container": "#695200",
                      "surface-variant": "#353534",
                      "surface-dim": "#131313",
                      "on-secondary-fixed": "#001551",
                      "primary-container": "#f5c518",
                      "primary": "#ffe5a0",
                      "surface-container-lowest": "#0e0e0e",
                      "surface": "#131313",
                      "error-container": "#93000a",
                      "surface-container-high": "#2a2a2a",
                      "on-primary": "#3d2f00",
                      "error": "#ffb4ab",
                      "on-error": "#690005",
                      "on-primary-fixed": "#241a00",
                      "surface-container-highest": "#353534",
                      "on-primary-fixed-variant": "#584400",
                      "surface-bright": "#3a3939",
                      "on-secondary-fixed-variant": "#0039b5",
                      "on-secondary": "#002682",
                      "inverse-on-surface": "#313030",
                      "primary-fixed-dim": "#f0c110",
                      "on-tertiary-fixed-variant": "#5b00c5",
                      "surface-container": "#201f1f",
                      "inverse-primary": "#745b00",
                      "on-tertiary": "#3f008d",
                      "surface-container-low": "#1c1b1b",
                      "tertiary-fixed-dim": "#d3bbff",
                      "primary-fixed": "#ffe08b",
                      "inverse-surface": "#e5e2e1",
                      "on-tertiary-fixed": "#250059",
                      "secondary": "#b7c4ff",
                      "tertiary": "#eee1ff",
                      "on-error-container": "#ffdad6",
                      "background": "#131313",
                      "on-secondary-container": "#b2c0ff",
                      "surface-tint": "#f0c110",
                      "outline": "#9a9078",
                      "on-tertiary-container": "#6a23d6",
                      "secondary-fixed": "#dce1ff",
                      "secondary-container": "#0040cb",
                      "tertiary-container": "#d6c0ff",
                      "secondary-fixed-dim": "#b7c4ff"
              },
              "borderRadius": {
                      "DEFAULT": "0.125rem",
                      "lg": "0.25rem",
                      "xl": "0.5rem",
                      "full": "0.75rem"
              },
              "spacing": {},
              "fontFamily": {
                      "headline": [
                              "Manrope"
                      ],
                      "body": [
                              "Inter"
                      ],
                      "label": [
                              "Inter"
                      ]
              }
      },
          },
        }
      </script>
</head>
<body class="bg-surface text-on-surface font-body min-h-screen flex flex-col">
<!-- TopNavBar -->
<nav class="fixed top-0 w-full z-50 dark:bg-[#131313]/70 backdrop-blur-md shadow-[0px_4px_20px_rgba(245,197,24,0.08)] hidden md:block border-b-0">
<div class="flex justify-between items-center px-8 py-4 w-full max-w-screen-2xl mx-auto">
<div class="flex items-center gap-8">
<a class="text-2xl font-black tracking-tighter text-yellow-400 font-headline" href="#">AniRate</a>
<div class="flex items-center bg-[#201F1F] rounded-full px-4 py-2">
<span class="material-symbols-outlined text-gray-400 mr-2" data-icon="search">search</span>
<input class="bg-transparent border-none focus:ring-0 text-sm text-on-surface w-64 placeholder-gray-500" placeholder="Search..." type="text"/>
</div>
</div>
<div class="flex items-center gap-8 font-['Manrope'] tracking-tight">
<a class="text-yellow-400 border-b-2 border-yellow-400 pb-1 active:scale-95" href="#">Browse</a>
<a class="text-gray-400 hover:text-yellow-400 transition-all duration-300 active:scale-95" href="#">Seasonal</a>
<a class="text-gray-400 hover:text-yellow-400 transition-all duration-300 active:scale-95" href="#">Manga</a>
<a class="text-gray-400 hover:text-yellow-400 transition-all duration-300 active:scale-95" href="#">Community</a>
</div>
<div class="flex items-center gap-6">
<button class="text-gray-400 hover:text-yellow-400 transition-colors"><span class="material-symbols-outlined" data-icon="notifications">notifications</span></button>
<button class="text-gray-400 hover:text-yellow-400 transition-colors"><span class="material-symbols-outlined" data-icon="settings">settings</span></button>
<img alt="User Avatar" class="w-10 h-10 rounded-full border border-surface-container-high" data-alt="portrait of a young woman with neon lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAqYhcHFiT1UdysYWZ5Lb5rqxzEYfnlgH-ow_EZetzODvBzL0QfZrBDU0H7ZVPV-moveMilLaC6A3IyBaxIqK7wbCTgqsfhXa5-Tc1YpL4IQKrVGoYAVXVsVKd4O4kSd06yXCrqAo222y_OGkCymQykeAIC18AHMZmD1olOod4u1AYS1zGmUi4zwR3qKDUv3TwIGdaZ9Wh1ahd1tKxeg_zF8MLD676znAmdzoZis2t1Goa6SqbQbMA5ER3j5_S0RoP0E_lhFd3O08k"/>
</div>
</div>
</nav>
<!-- Main Content Canvas -->
<main class="flex-grow pt-24 pb-32 md:pb-24 px-4 md:px-12 max-w-screen-2xl mx-auto w-full flex flex-col gap-16">
<!-- Hero Area - Asymmetric Layout -->
<section class="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-8 md:gap-16 items-start mt-8">
<!-- Poster -->
<div class="w-[250px] mx-auto md:mx-0 shrink-0 relative group rounded-lg overflow-hidden shadow-2xl bg-surface-container">
<img alt="Anime Poster" class="w-full h-[375px] object-cover transition-transform duration-700 group-hover:scale-105" data-alt="cinematic digital illustration of a futuristic sci-fi city with neon lights and flying vehicles at night" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAE6xv-iz7AiekbArKLau-KSqP9Af8IS7o3hwVAMwcDmQZVFgFrojbJ5fA_ahj2CxSXHqGH0duMxXpaq4Fg-nrQtnjCpvAd9PnsuB2a3Z3qmvX-ppWWqtNVwxGKqww2aiZta66MJROdISynVqZRCfcFv_jsq1VZ8Xdmk8oV8Z0go0s-axvL8DP-ieadkmuhCgN1A2cR8oq36fEmvnI_RsSt-m8xZY94QhEQLE2Fzxk1v6PnT_aQ11QeobVC9P-Gr8JW-hanJNwAEso"/>
<div class="absolute inset-0 ring-1 ring-inset ring-white/10 pointer-events-none rounded-lg"></div>
</div>
<!-- Details -->
<div class="flex flex-col gap-6">
<div class="flex flex-col gap-2">
<div class="flex items-center gap-3 mb-1">
<span class="bg-secondary-container/20 text-secondary-container px-3 py-1 rounded-full text-[11px] font-label font-bold tracking-[0.1em] uppercase">Anime</span>
<div class="flex gap-2">
<span class="px-3 py-1 bg-surface-container-high rounded-full text-xs text-on-surface-variant font-label tracking-wide uppercase">Action</span>
<span class="px-3 py-1 bg-surface-container-high rounded-full text-xs text-on-surface-variant font-label tracking-wide uppercase">Sci-Fi</span>
</div>
</div>
<h1 class="text-4xl md:text-[56px] leading-[1.1] font-headline font-bold text-on-surface tracking-[-0.02em]">Cybernetic Odyssey</h1>
</div>
<!-- Rating -->
<div class="flex items-center gap-6">
<div class="flex items-center gap-1 text-primary">
<span class="material-symbols-outlined text-3xl" data-icon="star" data-weight="fill" style="font-variation-settings: 'FILL' 1;">star</span>
<span class="material-symbols-outlined text-3xl" data-icon="star" data-weight="fill" style="font-variation-settings: 'FILL' 1;">star</span>
<span class="material-symbols-outlined text-3xl" data-icon="star" data-weight="fill" style="font-variation-settings: 'FILL' 1;">star</span>
<span class="material-symbols-outlined text-3xl" data-icon="star" data-weight="fill" style="font-variation-settings: 'FILL' 1;">star</span>
<span class="material-symbols-outlined text-3xl text-surface-container-highest" data-icon="star">star</span>
</div>
<div class="flex flex-col">
<span class="text-2xl font-headline font-bold text-on-surface">8.6/10</span>
<span class="text-xs text-on-surface-variant font-label">24,501 Reviews</span>
</div>
</div>
<!-- Actions -->
<div class="flex flex-wrap items-center gap-4 mt-2">
<button class="bg-gradient-to-r from-primary-fixed to-primary-container text-on-primary font-headline font-semibold px-8 py-3 rounded-md hover:shadow-[0_0_12px_rgba(245,197,24,0.4)] transition-all flex items-center gap-2">
<span class="material-symbols-outlined" data-icon="favorite" data-weight="fill" style="font-variation-settings: 'FILL' 1;">favorite</span>
                        Agregar a Favoritos
                    </button>
<button class="border border-white/15 text-on-surface font-headline font-semibold px-8 py-3 rounded-md hover:bg-surface-container-high transition-colors flex items-center gap-2">
<span class="material-symbols-outlined" data-icon="edit">edit</span>
                        Escribir Review
                    </button>
</div>
<!-- Description -->
<div class="mt-4 max-w-3xl">
<p class="text-on-surface-variant text-base md:text-lg leading-relaxed font-body">
                        In a dystopian future where humanity has merged with technology, a rogue operative discovers a conspiracy that threatens the very fabric of reality. Hunted by the megacorporations she once served, she must navigate the neon-lit underbelly of Neo-Tokyo to uncover the truth. 
                    </p>
<button class="text-primary mt-2 font-body text-sm font-semibold hover:underline">Read more</button>
</div>
</div>
</section>
<!-- Reviews Section - Cinematic Layering -->
<section class="flex flex-col gap-8">
<div class="flex justify-between items-end border-b border-white/5 pb-4">
<h2 class="text-2xl md:text-[32px] font-headline font-semibold text-on-surface">Reviews de la comunidad</h2>
<button class="text-on-surface-variant hover:text-primary text-sm font-label uppercase tracking-widest transition-colors flex items-center gap-1">
                    Ver Todos <span class="material-symbols-outlined text-sm" data-icon="arrow_forward">arrow_forward</span>
</button>
</div>
<!-- Bento-style Grid for Reviews -->
<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
<!-- Review Card 1 -->
<div class="bg-surface-container-highest p-6 rounded-lg relative overflow-hidden group">
<div class="flex items-start justify-between mb-4">
<div class="flex items-center gap-4">
<img alt="User" class="w-12 h-12 rounded-full border border-surface-container-low" data-alt="portrait of a young man with glasses in an urban setting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBWu42wnoPgiKoiaTPxLKc1Ku9eKdF9cxkZ07iQ0tTts7y60hS7a2RgEbY4JGdPEmQtZSJZkMEVWMQkH6dFcC77TqtrqmC6YlJ2IGU6Vg5qWvE4nzzjOn-GZaQxTHiigMXDsyb1z12KODO1ja786dELNcUw0tMh_XsBPIYUPZtF6HdRRXzyY6leLcY0gbgzIfoXRnMjRHCwFO_XQnyCndNO2CytH0hWU60ANzdWVzNurI5dv3_0auIKNp4eetjgGtpx2_4ZzHxkpxY"/>
<div>
<h4 class="font-headline font-semibold text-on-surface">Alex Mercer</h4>
<span class="text-xs text-on-surface-variant font-label">Hace 2 días</span>
</div>
</div>
<div class="flex gap-0.5 text-primary">
<span class="material-symbols-outlined text-xl" data-icon="star" data-weight="fill" style="font-variation-settings: 'FILL' 1;">star</span>
<span class="material-symbols-outlined text-xl" data-icon="star" data-weight="fill" style="font-variation-settings: 'FILL' 1;">star</span>
<span class="material-symbols-outlined text-xl" data-icon="star" data-weight="fill" style="font-variation-settings: 'FILL' 1;">star</span>
<span class="material-symbols-outlined text-xl" data-icon="star" data-weight="fill" style="font-variation-settings: 'FILL' 1;">star</span>
<span class="material-symbols-outlined text-xl" data-icon="star" data-weight="fill" style="font-variation-settings: 'FILL' 1;">star</span>
</div>
</div>
<p class="text-on-surface-variant text-sm leading-relaxed font-body">
                        Absolute masterpiece. The animation quality in the final battle sequences is some of the best I've seen this decade. Pacing drops slightly in the middle arc, but the payoff is well worth it.
                    </p>
<div class="absolute inset-0 ring-1 ring-inset ring-white/5 pointer-events-none rounded-lg"></div>
</div>
<!-- Review Card 2 -->
<div class="bg-surface-container-highest p-6 rounded-lg relative overflow-hidden group">
<div class="flex items-start justify-between mb-4">
<div class="flex items-center gap-4">
<img alt="User" class="w-12 h-12 rounded-full border border-surface-container-low" data-alt="portrait of a woman smiling with soft natural lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCWNazt_0GsMbexrYByLBxxdLmtZ3O0GmV6-0gq9FhMsiJSJlQYvFZan1PWofc4n6kEfCPuTwV179GnhLvCkOysLx-EmgLNkhVxXRMtgQ8s7vMyYOfPiHJFyUHdaFJRz65VWZzf7zebaxiaB25uvkeXRYhSE2H5ssM0ufnLDpriwNVMDfQNT0OrZrb0jMs18jznIm55B5zQhKoiCYdGyzfPdxdlAkPIuq8gewzrGXohV91ra9dDMUxvrjYYMic0nif3_D6glnp8rLo"/>
<div>
<h4 class="font-headline font-semibold text-on-surface">Sarah Connor</h4>
<span class="text-xs text-on-surface-variant font-label">Hace 1 semana</span>
</div>
</div>
<div class="flex gap-0.5 text-primary">
<span class="material-symbols-outlined text-xl" data-icon="star" data-weight="fill" style="font-variation-settings: 'FILL' 1;">star</span>
<span class="material-symbols-outlined text-xl" data-icon="star" data-weight="fill" style="font-variation-settings: 'FILL' 1;">star</span>
<span class="material-symbols-outlined text-xl" data-icon="star" data-weight="fill" style="font-variation-settings: 'FILL' 1;">star</span>
<span class="material-symbols-outlined text-xl" data-icon="star" data-weight="fill" style="font-variation-settings: 'FILL' 1;">star</span>
<span class="material-symbols-outlined text-xl text-surface-container-low" data-icon="star">star</span>
</div>
</div>
<p class="text-on-surface-variant text-sm leading-relaxed font-body">
                        The world-building is incredible, but I felt the main character's development was a bit rushed towards the end. Still, visually stunning and the soundtrack by Yoko Kanno is top tier.
                    </p>
<div class="absolute inset-0 ring-1 ring-inset ring-white/5 pointer-events-none rounded-lg"></div>
</div>
</div>
</section>
</main>
<!-- BottomNavBar (Mobile) -->
<nav class="fixed bottom-0 left-0 w-full flex justify-around items-center py-3 px-4 md:hidden dark:bg-[#131313]/90 backdrop-blur-2xl rounded-t-xl z-50 border-t border-white/5 shadow-2xl">
<a class="flex flex-col items-center text-gray-500 hover:text-yellow-200 active:scale-90 transition-transform" href="#">
<span class="material-symbols-outlined mb-1" data-icon="home">home</span>
<span class="font-['Inter'] text-[10px] uppercase tracking-widest">Home</span>
</a>
<a class="flex flex-col items-center text-yellow-400 scale-110 active:scale-90 transition-transform" href="#">
<span class="material-symbols-outlined mb-1" data-icon="search" data-weight="fill" style="font-variation-settings: 'FILL' 1;">search</span>
<span class="font-['Inter'] text-[10px] uppercase tracking-widest">Explore</span>
</a>
<a class="flex flex-col items-center text-gray-500 hover:text-yellow-200 active:scale-90 transition-transform" href="#">
<span class="material-symbols-outlined mb-1" data-icon="auto_stories">auto_stories</span>
<span class="font-['Inter'] text-[10px] uppercase tracking-widest">Library</span>
</a>
<a class="flex flex-col items-center text-gray-500 hover:text-yellow-200 active:scale-90 transition-transform" href="#">
<span class="material-symbols-outlined mb-1" data-icon="person">person</span>
<span class="font-['Inter'] text-[10px] uppercase tracking-widest">Profile</span>
</a>
</nav>
<!-- Footer -->
<footer class="w-full mt-auto dark:bg-[#0E0E0E] bg-gradient-to-t from-black to-[#0E0E0E] flex flex-col md:flex-row justify-between items-center px-12 py-8 border-t border-white/5 pb-24 md:pb-8">
<div class="mb-6 md:mb-0 text-center md:text-left">
<span class="font-['Manrope'] font-bold text-yellow-400 text-lg block mb-2">AniRate</span>
<span class="font-['Inter'] text-xs text-gray-500">© 2024 ANIRATE. ENGINEERED FOR THE DIGITAL AUTEUR.</span>
</div>
<div class="flex flex-wrap justify-center gap-6 font-['Inter'] text-xs text-gray-500">
<a class="text-gray-600 hover:text-white transition-colors cursor-pointer" href="#">Terms of Service</a>
<a class="text-gray-600 hover:text-white transition-colors cursor-pointer" href="#">Privacy Policy</a>
<a class="text-gray-600 hover:text-white transition-colors cursor-pointer" href="#">API Docs</a>
<a class="text-gray-600 hover:text-white transition-colors cursor-pointer" href="#">Support</a>
</div>
</footer>
</body></html>

<!-- Home - AniRate -->
<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>AniRate - Home</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&amp;family=Inter:wght@400;500;600&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "tertiary-fixed": "#ebddff",
                        "outline-variant": "#4e4633",
                        "on-surface": "#e5e2e1",
                        "on-background": "#e5e2e1",
                        "on-surface-variant": "#d1c5ac",
                        "on-primary-container": "#695200",
                        "surface-variant": "#353534",
                        "surface-dim": "#131313",
                        "on-secondary-fixed": "#001551",
                        "primary-container": "#f5c518",
                        "primary": "#ffe5a0",
                        "surface-container-lowest": "#0e0e0e",
                        "surface": "#131313",
                        "error-container": "#93000a",
                        "surface-container-high": "#2a2a2a",
                        "on-primary": "#3d2f00",
                        "error": "#ffb4ab",
                        "on-error": "#690005",
                        "on-primary-fixed": "#241a00",
                        "surface-container-highest": "#353534",
                        "on-primary-fixed-variant": "#584400",
                        "surface-bright": "#3a3939",
                        "on-secondary-fixed-variant": "#0039b5",
                        "on-secondary": "#002682",
                        "inverse-on-surface": "#313030",
                        "primary-fixed-dim": "#f0c110",
                        "on-tertiary-fixed-variant": "#5b00c5",
                        "surface-container": "#201f1f",
                        "inverse-primary": "#745b00",
                        "on-tertiary": "#3f008d",
                        "surface-container-low": "#1c1b1b",
                        "tertiary-fixed-dim": "#d3bbff",
                        "primary-fixed": "#ffe08b",
                        "inverse-surface": "#e5e2e1",
                        "on-tertiary-fixed": "#250059",
                        "secondary": "#b7c4ff",
                        "tertiary": "#eee1ff",
                        "on-error-container": "#ffdad6",
                        "background": "#131313",
                        "on-secondary-container": "#b2c0ff",
                        "surface-tint": "#f0c110",
                        "outline": "#9a9078",
                        "on-tertiary-container": "#6a23d6",
                        "secondary-fixed": "#dce1ff",
                        "secondary-container": "#0040cb",
                        "tertiary-container": "#d6c0ff",
                        "secondary-fixed-dim": "#b7c4ff"
                    },
                    borderRadius: {
                        "DEFAULT": "0.125rem",
                        "lg": "0.25rem",
                        "xl": "0.5rem",
                        "full": "0.75rem"
                    },
                    fontFamily: {
                        "headline": ["Manrope"],
                        "body": ["Inter"],
                        "label": ["Inter"]
                    }
                }
            }
        }
    </script>
<style>
        body { font-family: 'Inter', sans-serif; background-color: #131313; color: #e5e2e1; }
        h1, h2, h3, h4, h5, h6 { font-family: 'Manrope', sans-serif; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .ken-burns:hover img { transform: scale(1.05); transition: transform 0.5s ease-out; }
        .primary-glow:hover { box-shadow: 0 0 12px var(--tw-colors-primary-container); }
    </style>
</head>
<body class="bg-surface text-on-surface antialiased flex flex-col min-h-screen">
<!-- TopNavBar (Shared Component) -->
<nav class="hidden md:flex fixed top-0 w-full z-50 dark:bg-[#131313]/70 backdrop-blur-md font-['Manrope'] tracking-tight flex justify-between items-center px-8 py-4 max-w-screen-2xl mx-auto shadow-[0px_4px_20px_rgba(245,197,24,0.08)] bg-[#201F1F]">
<div class="flex items-center gap-8">
<span class="text-2xl font-black tracking-tighter text-yellow-400">AniRate</span>
<div class="flex gap-6">
<a class="text-yellow-400 border-b-2 border-yellow-400 pb-1 font-semibold" href="#">Browse</a>
<a class="text-gray-400 hover:text-yellow-400 transition-all duration-300 font-semibold" href="#">Seasonal</a>
<a class="text-gray-400 hover:text-yellow-400 transition-all duration-300 font-semibold" href="#">Manga</a>
<a class="text-gray-400 hover:text-yellow-400 transition-all duration-300 font-semibold" href="#">Community</a>
</div>
</div>
<div class="flex items-center gap-6">
<div class="relative hidden lg:block">
<span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
<input class="bg-surface-container-low border border-outline-variant/30 text-sm rounded-full py-2 pl-9 pr-4 focus:outline-none focus:border-primary-container text-on-surface w-64 placeholder-on-surface-variant font-body" placeholder="Search anime, manga..." type="text"/>
</div>
<button class="text-on-surface hover:text-yellow-400 transition-all duration-300"><span class="material-symbols-outlined">notifications</span></button>
<button class="text-on-surface hover:text-yellow-400 transition-all duration-300"><span class="material-symbols-outlined">settings</span></button>
<div class="w-8 h-8 rounded-full bg-surface-container-high overflow-hidden border border-outline-variant/30">
<img alt="User Avatar" class="w-full h-full object-cover" data-alt="close up portrait of a young woman with neon lighting in a cyberpunk city" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDVmCigRuggxahKqH6GbOa45Zu4b8Ep3SpA4bqzsoDyRtJ610ul8lG7nFDHFub1X64jq5sTtjBcf2z--WYuukwI5b95j6ksE_AoPv_C1hajqpDPX0xBdxOweaYHQRCOds38glJt0Ni6IkxYYiAhjIk1q2noIScCUgOf4qXWYw-Z9tFFARpDNZzSHX6wCGLUgD-_Z09QRlLe37BC7irjDUdnIhmXjE8_2M_SUcjVM3OeW3jbYlWxCA6v50XPK_wUeS11ItKsoHTwqcs"/>
</div>
</div>
</nav>
<!-- Main Content Canvas -->
<main class="flex-grow pt-0 md:pt-20 pb-24 md:pb-12">
<!-- Hero Banner -->
<section class="relative w-full h-[500px] mb-16 overflow-hidden">
<div class="absolute inset-0">
<img alt="Hero Background" class="w-full h-full object-cover opacity-60" data-alt="cinematic wide shot of an anime style fantasy city at dusk with glowing lights and dramatic clouds" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDKpcWG6SwIvi4-O8LvsFRMClyjsVVSxH7XQKgLaKCRSrzH4S1hMgubYFJ4G86vRvUUxw0Av3-l2AfMi8xu_E1g6gXL_W9qBgD-PkFldKABOlCGFwYhFbesTHPSy_wMYjMGYIUInhb--Ds3SUrOl9vdlmteExwkZxpfbUAeX44MHRJckFyxE5xi6BNVlTaJbarwzJ-ijmfsyOyI5nkr0KPH62W3lCq5Kl1nK9XDfvc1q_E20kNq9gVPLzFbR0f0hz7OiDt9Y47LuTU"/>
</div>
<div class="absolute inset-0 bg-gradient-to-t from-surface via-surface/80 to-transparent"></div>
<div class="absolute inset-0 bg-gradient-to-r from-surface via-surface/60 to-transparent"></div>
<div class="relative h-full flex items-end pb-12 px-6 md:px-12 max-w-screen-2xl mx-auto z-10">
<div class="w-full md:w-2/3 lg:w-1/2">
<div class="flex items-center gap-3 mb-3">
<span class="bg-secondary-container/20 text-secondary-fixed-dim px-3 py-1 rounded-full text-[11px] font-label font-bold tracking-widest uppercase">Anime</span>
<div class="flex items-center gap-1 text-primary-container font-headline font-bold">
<span class="material-symbols-outlined text-lg" style="font-variation-settings: 'FILL' 1;">star</span>
<span>9.1</span>
</div>
</div>
<h1 class="text-5xl md:text-6xl font-headline font-bold tracking-tight mb-4 text-on-surface leading-tight drop-shadow-md">Cybernetic Horizon</h1>
<p class="text-on-surface-variant font-body text-base md:text-lg mb-8 line-clamp-2 md:line-clamp-3 leading-relaxed max-w-xl">
                        In a neo-Tokyo torn apart by rogue AI factions, a disgraced detective must partner with a prototype android to unravel a conspiracy that threatens the very fabric of reality.
                    </p>
<div class="flex items-center gap-4">
<button class="bg-primary-container text-on-primary font-headline font-bold py-3 px-8 rounded-lg flex items-center gap-2 primary-glow transition-all duration-300">
<span class="material-symbols-outlined text-xl" style="font-variation-settings: 'FILL' 1;">play_arrow</span>
                            Ver Detalles
                        </button>
<button class="border border-outline-variant/30 text-on-surface bg-surface/30 backdrop-blur-md font-headline font-bold py-3 px-8 rounded-lg hover:bg-surface-container-high transition-colors flex items-center gap-2">
<span class="material-symbols-outlined text-xl">star_rate</span>
                            Calificar
                        </button>
</div>
</div>
</div>
</section>
<!-- Trending Anime Section -->
<section class="mb-16 px-6 md:px-12 max-w-screen-2xl mx-auto">
<div class="flex justify-between items-end mb-6">
<h2 class="text-2xl md:text-3xl font-headline font-semibold text-on-surface tracking-tight">Trending Anime</h2>
<a class="text-sm font-headline text-on-surface-variant hover:text-primary-container transition-colors" href="#">See all</a>
</div>
<div class="flex overflow-x-auto gap-4 md:gap-6 pb-6 hide-scrollbar -mx-6 px-6 md:mx-0 md:px-0 snap-x snap-mandatory">
<!-- Card 1 -->
<div class="flex-none w-[160px] md:w-[180px] snap-start ken-burns group cursor-pointer">
<div class="relative w-full h-[240px] md:h-[270px] rounded-lg overflow-hidden mb-3 bg-surface-container shadow-lg">
<img alt="Anime Cover" class="w-full h-full object-cover transition-transform duration-500" data-alt="dramatic lighting close up of a stylized anime character with glowing red eyes in shadows" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBuA6ecEfdJtABDu5rsQMCEMHpBQQkOZ4K4ULq_zmbjEWWZiwzbf8Ke5zOZEXVlEy5jJjQQbDCKj0qVKr7PpqeRdy5tk-3V3Ve_fPdUtB0Q3_mjbELnxy81yzj6gxWyH3HhMB9gnQPi7kMj7XTN08UjklYRrlrzFB2P0Nd0zmf3qTnxX37p1ccggG1-HbNZRAaY7mRs94K50lBhUNTfGkyrEFkl4R3BRocMU5tnKTw6U19yK-xzZiQiOtaS_S0Ub009cjQDhYWtwf4"/>
<div class="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/90 via-transparent to-transparent opacity-80"></div>
<div class="absolute top-2 left-2">
<span class="bg-secondary-container/80 backdrop-blur-sm text-secondary-fixed-dim px-2 py-0.5 rounded-full text-[10px] font-label font-bold tracking-wider uppercase border border-secondary/20">Anime</span>
</div>
</div>
<h3 class="font-headline font-semibold text-on-surface text-base leading-tight mb-1 truncate group-hover:text-primary-container transition-colors">Neon Genesis</h3>
<div class="flex items-center gap-1 text-sm text-on-surface-variant font-body">
<span class="material-symbols-outlined text-primary-container text-xs" style="font-variation-settings: 'FILL' 1;">star</span>
<span class="font-medium text-primary-fixed-dim">8.9</span>
<span class="mx-1 opacity-30">•</span>
<span>24 Ep</span>
</div>
</div>
<!-- Card 2 -->
<div class="flex-none w-[160px] md:w-[180px] snap-start ken-burns group cursor-pointer">
<div class="relative w-full h-[240px] md:h-[270px] rounded-lg overflow-hidden mb-3 bg-surface-container shadow-lg">
<img alt="Anime Cover" class="w-full h-full object-cover transition-transform duration-500" data-alt="vibrant abstract anime style background with glowing blue and pink neon particles" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAIGo9ORcwfSjYKH77u1e1ZwUderq05fAdXnuXvBA8CcyGPHloF1rxBHEs_ycyS8TMSIXQWKZzQAH2en9wwxDO0rTcQ-Keau5hUmrw0-GGpcs8WC40tWM9xUZtxuoHypuANaHv-IAAqBDszfxtab32yjlcyfYa744GeT-1xGOh7eb1dQ5NpTl6St79SaPE6bl-_erv9Yh-vXXcPPiyetNPPu3rI6hc99d7R4DMI0FZG8sk3nwY1CFYTudnwvn2u99DaZ7SKBtu7RaU"/>
<div class="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/90 via-transparent to-transparent opacity-80"></div>
<div class="absolute top-2 left-2">
<span class="bg-secondary-container/80 backdrop-blur-sm text-secondary-fixed-dim px-2 py-0.5 rounded-full text-[10px] font-label font-bold tracking-wider uppercase border border-secondary/20">Anime</span>
</div>
</div>
<h3 class="font-headline font-semibold text-on-surface text-base leading-tight mb-1 truncate group-hover:text-primary-container transition-colors">Stellar Resonance</h3>
<div class="flex items-center gap-1 text-sm text-on-surface-variant font-body">
<span class="material-symbols-outlined text-primary-container text-xs" style="font-variation-settings: 'FILL' 1;">star</span>
<span class="font-medium text-primary-fixed-dim">8.5</span>
<span class="mx-1 opacity-30">•</span>
<span>12 Ep</span>
</div>
</div>
<!-- Card 3 -->
<div class="flex-none w-[160px] md:w-[180px] snap-start ken-burns group cursor-pointer">
<div class="relative w-full h-[240px] md:h-[270px] rounded-lg overflow-hidden mb-3 bg-surface-container shadow-lg">
<img alt="Anime Cover" class="w-full h-full object-cover transition-transform duration-500" data-alt="moody dark aesthetic anime illustration of rain falling in a cyberpunk alleyway" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDuA-BLDf-G8z2DJ0MgsRagDhv7jpgLgZ9Al4gODSv0q9CHKT0hVqxAuh5iK_GeFNAWJd_VET9K0kK0ne1po34VB97j7lkSMqX_9Nl0DjTgnRIX81El-Drf3XU-kWhHH3rb1wPg4_lR122KK07L3b2ABQQFtI02KB-kr3lSwQjVgBx7KNIaWsty-Eq4ThwojKNPPQa_PqvVW44sw03pML3XADBu207WWXpnHI50jXbkBgd5iBddabFxnoDKKqbczXGhWymp2Bnkszc"/>
<div class="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/90 via-transparent to-transparent opacity-80"></div>
<div class="absolute top-2 left-2">
<span class="bg-secondary-container/80 backdrop-blur-sm text-secondary-fixed-dim px-2 py-0.5 rounded-full text-[10px] font-label font-bold tracking-wider uppercase border border-secondary/20">Anime</span>
</div>
</div>
<h3 class="font-headline font-semibold text-on-surface text-base leading-tight mb-1 truncate group-hover:text-primary-container transition-colors">Shadow Blade</h3>
<div class="flex items-center gap-1 text-sm text-on-surface-variant font-body">
<span class="material-symbols-outlined text-primary-container text-xs" style="font-variation-settings: 'FILL' 1;">star</span>
<span class="font-medium text-primary-fixed-dim">9.2</span>
<span class="mx-1 opacity-30">•</span>
<span>Ongoing</span>
</div>
</div>
<!-- Card 4 (Partial cutoff for affordance) -->
<div class="flex-none w-[160px] md:w-[180px] snap-start ken-burns group cursor-pointer">
<div class="relative w-full h-[240px] md:h-[270px] rounded-lg overflow-hidden mb-3 bg-surface-container shadow-lg">
<img alt="Anime Cover" class="w-full h-full object-cover transition-transform duration-500" data-alt="bright colorful magical girl anime aesthetic with glowing sparkles and stars" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCaoKSf-I8H6C3aRr4TBQCizGagb_dIEGFdehnP1s0salQD-y8Ag_Rs1Yj1OZ__rfUTU7gGhIwra4ItBNRn6oTkyaNHXaOCmpvh8FxD1s8Zeeb-I89tcQyjNiZp-WwVNLjhxIH5mWV2ZpLAowrWkJUM4viNbmmDaZKx1uLdiQFQzziT9kEumnAH3JiYZoja8_uVo22Pc52EtTcSMHNlD6HUe66fhBiZvxIsOQly74mgWrKTLU6P57Oi_J73lX42rFIKs2ivzRFDxLk"/>
<div class="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/90 via-transparent to-transparent opacity-80"></div>
<div class="absolute top-2 left-2">
<span class="bg-secondary-container/80 backdrop-blur-sm text-secondary-fixed-dim px-2 py-0.5 rounded-full text-[10px] font-label font-bold tracking-wider uppercase border border-secondary/20">Anime</span>
</div>
</div>
<h3 class="font-headline font-semibold text-on-surface text-base leading-tight mb-1 truncate group-hover:text-primary-container transition-colors">Magic Academy</h3>
<div class="flex items-center gap-1 text-sm text-on-surface-variant font-body">
<span class="material-symbols-outlined text-primary-container text-xs" style="font-variation-settings: 'FILL' 1;">star</span>
<span class="font-medium text-primary-fixed-dim">7.8</span>
<span class="mx-1 opacity-30">•</span>
<span>24 Ep</span>
</div>
</div>
</div>
</section>
<!-- Top Rated Section (Numbered) -->
<section class="mb-16 bg-surface-container-lowest py-12 px-6 md:px-12 border-y border-outline-variant/10">
<div class="max-w-screen-2xl mx-auto">
<div class="flex justify-between items-end mb-8">
<h2 class="text-2xl md:text-3xl font-headline font-semibold text-on-surface tracking-tight">Top Rated</h2>
</div>
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
<!-- Top 1 -->
<div class="flex items-center gap-4 bg-surface-container rounded-xl p-3 hover:bg-surface-container-high transition-colors cursor-pointer group">
<div class="text-6xl font-headline font-black text-primary-container/20 group-hover:text-primary-container transition-colors w-16 text-center">1</div>
<img alt="Thumbnail" class="w-16 h-24 rounded-md object-cover" data-alt="cinematic macro shot of a glowing futuristic eye anime style" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCTwBdEoWuI1hfTrJZxJ9jrRw06U5r9O3i9tho75cnLFgPR9lQdjSohNYgydInDSEVjovNIKfS-Now06RRVGorkqmAi-9vHbGIMXJvIxJ0cVzFhTMT7S7S-utZL1gHebhxORim1QqAlNz382Qe4vYpwEz09Yg34aH_VuLWJO2aGKF6etTlDY_Bdqe5OSe1vhGIYzVRXI0oBNASVHGRxlO5FhOkdQWhB9LU6CVaIahVFLF1wyQ7NwkoucLlphx-Xcj2p214KYr2Zqfo"/>
<div class="flex-grow">
<h4 class="font-headline font-semibold text-on-surface mb-1 group-hover:text-primary-fixed transition-colors">FMA: Brotherhood</h4>
<div class="flex items-center gap-2 mb-1 text-xs">
<span class="bg-secondary-container/20 text-secondary-fixed-dim px-2 py-0.5 rounded-full font-label uppercase tracking-wider border border-secondary/10">Anime</span>
<div class="flex items-center text-primary-fixed-dim">
<span class="material-symbols-outlined text-xs" style="font-variation-settings: 'FILL' 1;">star</span>
<span class="font-bold ml-1">9.8</span>
</div>
</div>
<p class="text-xs text-on-surface-variant font-body truncate">64 Episodes • Action, Fantasy</p>
</div>
</div>
<!-- Top 2 -->
<div class="flex items-center gap-4 bg-surface-container rounded-xl p-3 hover:bg-surface-container-high transition-colors cursor-pointer group">
<div class="text-6xl font-headline font-black text-surface-bright group-hover:text-on-surface transition-colors w-16 text-center">2</div>
<img alt="Thumbnail" class="w-16 h-24 rounded-md object-cover" data-alt="dark gothic fantasy illustration of a massive sword driven into ground anime style" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBlgkTOAEwwSVOoPJDztStDmeiiRjAePI8WViXmlo5xr-vePG2OmjOmqyJHUsFPMflgBgC3yPTd1hpaANDz5hO46c6_6KzngBf5gKrRhtwkYmDpYb2lv10Vk0BDTE2FN-FWiaIbUfWSZxOQCe_P4m-C5FWHKr6r1DpwC3tWraUbEGLh1zCBdvNyM1iaTDOakAbtBYZGTIJ7rHyRTNiPsY8nspst5UEG1YaSNKw06qJyqsFxBIsA9QQRO0Ao1aM_4Wm8U43iAeDkPqQ"/>
<div class="flex-grow">
<h4 class="font-headline font-semibold text-on-surface mb-1 group-hover:text-primary-fixed transition-colors">Attack on Titan</h4>
<div class="flex items-center gap-2 mb-1 text-xs">
<span class="bg-secondary-container/20 text-secondary-fixed-dim px-2 py-0.5 rounded-full font-label uppercase tracking-wider border border-secondary/10">Anime</span>
<div class="flex items-center text-primary-fixed-dim">
<span class="material-symbols-outlined text-xs" style="font-variation-settings: 'FILL' 1;">star</span>
<span class="font-bold ml-1">9.5</span>
</div>
</div>
<p class="text-xs text-on-surface-variant font-body truncate">89 Episodes • Dark Fantasy</p>
</div>
</div>
</div>
</div>
</section>
</main>
<!-- BottomNavBar (Shared Component) -->
<nav class="fixed bottom-0 left-0 w-full flex justify-around items-center py-3 px-4 md:hidden dark:bg-[#131313]/90 backdrop-blur-2xl font-['Inter'] text-[10px] uppercase tracking-widest rounded-t-xl z-50 border-t border-white/5 shadow-2xl bg-surface">
<a class="flex flex-col items-center text-yellow-400 scale-110" href="#">
<span class="material-symbols-outlined mb-1" style="font-variation-settings: 'FILL' 1;">home</span>
<span>Home</span>
</a>
<a class="flex flex-col items-center text-gray-500 hover:text-yellow-200 active:scale-90 transition-transform" href="#">
<span class="material-symbols-outlined mb-1">search</span>
<span>Explore</span>
</a>
<a class="flex flex-col items-center text-gray-500 hover:text-yellow-200 active:scale-90 transition-transform" href="#">
<span class="material-symbols-outlined mb-1">auto_stories</span>
<span>Library</span>
</a>
<a class="flex flex-col items-center text-gray-500 hover:text-yellow-200 active:scale-90 transition-transform" href="#">
<span class="material-symbols-outlined mb-1">person</span>
<span>Profile</span>
</a>
</nav>
<!-- Footer (Shared Component) -->
<footer class="flex flex-col md:flex-row justify-between items-center px-12 py-8 border-t border-white/5 dark:bg-[#0E0E0E] w-full mt-auto bg-gradient-to-t from-black to-[#0E0E0E]">
<div class="font-['Manrope'] font-bold text-yellow-400 mb-4 md:mb-0 text-xl">AniRate</div>
<p class="font-['Inter'] text-xs text-gray-500 mb-4 md:mb-0 text-center md:text-left">© 2024 ANIRATE. ENGINEERED FOR THE DIGITAL AUTEUR.</p>
<div class="flex flex-wrap justify-center gap-4 font-['Inter'] text-xs">
<a class="text-gray-600 hover:text-white transition-colors cursor-pointer" href="#">Terms of Service</a>
<a class="text-gray-600 hover:text-white transition-colors cursor-pointer" href="#">Privacy Policy</a>
<a class="text-gray-600 hover:text-white transition-colors cursor-pointer" href="#">API Docs</a>
<a class="text-gray-600 hover:text-white transition-colors cursor-pointer" href="#">Support</a>
</div>
</footer>
</body></html>