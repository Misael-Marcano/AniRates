import { describe, it, expect } from "vitest";
import { jikanApi } from "@/services/jikan";

describe("jikan service (with MSW)", () => {
  it("getAnimeById returns mapped Contenido", async () => {
    const result = await jikanApi.getAnimeById(42);
    expect(result.id).toBe(42);
    expect(result.tipo).toBe("ANIME");
    expect(result.titulo).toBe("Anime 42");
    expect(result.episodes).toBe(24);
    expect(result.studios).toContain("Studio Ghibli");
  });

  it("getMangaById returns mapped Contenido", async () => {
    const result = await jikanApi.getMangaById(7);
    expect(result.id).toBe(7);
    expect(result.tipo).toBe("MANGA");
    expect(result.chapters).toBe(120);
    expect(result.volumes).toBe(12);
  });

  it("searchAnime returns array of Contenido", async () => {
    const results = await jikanApi.searchAnime("naruto", 5);
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].titulo).toContain("Result for naruto");
  });
});
