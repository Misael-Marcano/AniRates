import type { Contenido } from "@/types";

/** Align with Jikan normalize so probes match displayed URLs. */
function normalizeHeroImageUrl(url: string): string {
  if (!url) return "";
  return url.replace(/\/r\/\d+x\d+\//, "/");
}

export async function loadImageNaturalDimensions(
  url: string,
  timeoutMs = 4000
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    let settled = false;

    const timer = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new Error("timeout"));
    }, timeoutMs);

    function cleanup() {
      window.clearTimeout(timer);
      img.onload = null;
      img.onerror = null;
    }

    img.onload = () => {
      if (settled) return;
      settled = true;
      cleanup();
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      if (!w || !h) {
        reject(new Error("invalid dimensions"));
        return;
      }
      resolve({ width: w, height: h });
    };

    img.onerror = () => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new Error("load error"));
    };

    img.src = url;
  });
}

export interface HeroDimensionFilterOpts {
  mangaMinW: number;
  mangaMinH: number;
  animeMinW?: number;
  animeMinH?: number;
}

/** Manga poster-ish; anime hero banner-ish — tuned for readability vs empty carousel. */
export const DEFAULT_HERO_DIMENSION_OPTS: HeroDimensionFilterOpts = {
  mangaMinW: 400,
  mangaMinH: 560,
  animeMinW: 640,
  animeMinH: 360,
};

/** One-step relaxed gate when strict filtering leaves too few slides. */
export const RELAXED_HERO_DIMENSION_OPTS: HeroDimensionFilterOpts = {
  mangaMinW: 280,
  mangaMinH: 392,
  animeMinW: 480,
  animeMinH: 270,
};

async function slidePassesDimensionGate(slide: Contenido, opts: HeroDimensionFilterOpts): Promise<boolean> {
  const url = normalizeHeroImageUrl(slide.imagen ?? "");
  if (!url) return true;

  let minW = 0;
  let minH = 0;

  if (slide.tipo === "MANGA") {
    minW = opts.mangaMinW;
    minH = opts.mangaMinH;
  } else if (slide.tipo === "ANIME") {
    if (opts.animeMinW == null || opts.animeMinH == null) return true;
    minW = opts.animeMinW;
    minH = opts.animeMinH;
  } else {
    return true;
  }

  try {
    const { width, height } = await loadImageNaturalDimensions(url);
    return width >= minW && height >= minH;
  } catch {
    return false;
  }
}

/** Keeps slide order; drops slides whose image is below tipo thresholds (load errors → drop). No URL → keep. */
export async function filterHeroSlidesByMinDimensions(
  slides: Contenido[],
  opts: HeroDimensionFilterOpts
): Promise<Contenido[]> {
  const flags = await Promise.all(slides.map((slide) => slidePassesDimensionGate(slide, opts)));
  return slides.filter((_, i) => flags[i]);
}
