import type { Contenido } from "@/types";
import { coverArtApi } from "@/services/api";

const CONCURRENCY = 3;

/** Sustituye la URL del hero por arte de AniList cuando exista (banner en anime, poster en manga). */
export async function enrichHeroSlidesWithAnilistCovers(slides: Contenido[]): Promise<Contenido[]> {
  const out = slides.map((s) => ({ ...s }));
  let next = 0;

  async function enrichIndex(idx: number) {
    const slide = out[idx];
    const id = slide.jikan_id ?? slide.id;
    const tipo = slide.tipo === "MANGA" ? "manga" : "anime";
    try {
      const art = await coverArtApi.get(id, tipo);
      const url =
        slide.tipo === "ANIME"
          ? art.banner ?? art.poster
          : art.poster ?? art.banner;
      if (url) out[idx] = { ...slide, imagen: url };
    } catch {
      /* sin backend o sin datos AniList: mantener imagen Jikan */
    }
  }

  async function worker() {
    while (next < out.length) {
      const idx = next;
      next += 1;
      await enrichIndex(idx);
    }
  }

  const workers = Math.min(CONCURRENCY, Math.max(out.length, 1));
  await Promise.all(Array.from({ length: workers }, () => worker()));
  return out;
}
