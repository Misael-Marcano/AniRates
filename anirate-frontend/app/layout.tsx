import React from "react";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import ErrorBoundary from "@/components/ErrorBoundary";
import PageTransition from "@/components/PageTransition";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LocaleProvider } from "@/contexts/LocaleContext";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:5000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "AniRate — Tu plataforma de anime y manga",
    template: "%s · AniRate",
  },
  description: "Explora, califica y reseña anime y manga al estilo IMDb.",
  applicationName: "AniRate",
  keywords: ["anime", "manga", "ratings", "reviews", "IMDb anime", "AniList alternativa", "MyAnimeList"],
  authors: [{ name: "AniRate" }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: SITE_URL,
    siteName: "AniRate",
    title: "AniRate — Tu plataforma de anime y manga",
    description: "Explora, califica y reseña anime y manga al estilo IMDb.",
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "AniRate" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AniRate — Tu plataforma de anime y manga",
    description: "Explora, califica y reseña anime y manga al estilo IMDb.",
    images: ["/og-default.png"],
  },
  appleWebApp: {
    capable: true,
    title: "AniRate",
    statusBarStyle: "black-translucent",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0f0f0f" },
    { media: "(prefers-color-scheme: light)", color: "#fafaf7" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const themeInitScript = `(function(){try{var m=localStorage.getItem('anirate_theme')||'system';var r=m==='system'?(window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'):m;document.documentElement.setAttribute('data-theme',r);}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <a href="#main-content" className="skip-link">Saltar al contenido principal</a>
        <ThemeProvider>
          <LocaleProvider>
          <AuthProvider>
            <Navbar />
            <main id="main-content" className="flex-1" tabIndex={-1}>
              <ErrorBoundary>
                <PageTransition>{children}</PageTransition>
              </ErrorBoundary>
            </main>
          </AuthProvider>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
