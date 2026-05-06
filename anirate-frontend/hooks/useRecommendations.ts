"use client";

import { useState, useEffect } from "react";
import { favoritosApi, ratingsApi } from "@/services/api";
import { jikanApi, GENRE_MAP } from "@/services/jikan";
import type { Contenido, Favorito } from "@/types";

export function useRecommendations() {
  const [items, setItems] = useState<Contenido[]>([]);
  const [topGenres, setTopGenres] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) { setReady(true); return; }

    let userId: number;
    try {
      userId = JSON.parse(atob(token.split(".")[1])).sub as number;
    } catch { setReady(true); return; }

    async function load() {
      setLoading(true);
      try {
        const [favs, ratings] = await Promise.all([
          favoritosApi.getByUser(userId),
          ratingsApi.getMine(),
        ]);

        const genreCount: Record<string, number> = {};

        (favs as Favorito[]).forEach((f) => {
          f.contenido?.generos?.forEach((g) => {
            genreCount[g.nombre] = (genreCount[g.nombre] ?? 0) + 2;
          });
        });

        (ratings as { puntuacion: number; contenido?: { generos?: { nombre: string }[] } }[]).forEach((r) => {
          if (r.puntuacion >= 7) {
            r.contenido?.generos?.forEach((g) => {
              genreCount[g.nombre] = (genreCount[g.nombre] ?? 0) + 1;
            });
          }
        });

        const top = Object.entries(genreCount)
          .sort((a, b) => b[1] - a[1])
          .map(([name]) => name)
          .filter((name) => GENRE_MAP[name])
          .slice(0, 3);

        setTopGenres(top);
        if (top.length === 0) { setReady(true); setLoading(false); return; }

        const genreIds = top.map((g) => GENRE_MAP[g]).filter(Boolean) as number[];

        const [ar, mr] = await Promise.allSettled([
          jikanApi.searchAnimePaged({ genres: genreIds, min_score: 7.5, order_by: "score", sort: "desc" }),
          jikanApi.searchMangaPaged({ genres: genreIds, min_score: 7.5, order_by: "score", sort: "desc" }),
        ]);

        const all = [
          ...(ar.status === "fulfilled" ? ar.value.items : []),
          ...(mr.status === "fulfilled" ? mr.value.items : []),
        ].slice(0, 24);

        setItems(all);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
        setReady(true);
      }
    }

    load();
  }, []);

  return { items, topGenres, loading, ready };
}
