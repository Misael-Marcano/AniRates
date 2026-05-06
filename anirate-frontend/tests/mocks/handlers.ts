import { http, HttpResponse } from "msw";

const animeFixture = (mal_id: number, title: string) => ({
  mal_id,
  title,
  synopsis: `Synopsis de ${title}`,
  images: { jpg: { large_image_url: `https://cdn.myanimelist.net/images/anime/${mal_id}.jpg`, image_url: `https://cdn.myanimelist.net/images/anime/${mal_id}.jpg` } },
  year: 2024,
  status: "Finished Airing",
  score: 8.5,
  scored_by: 12345,
  genres: [{ mal_id: 1, name: "Action" }, { mal_id: 27, name: "Shounen" }],
  episodes: 24,
  studios: [{ mal_id: 1, name: "Studio Ghibli" }],
  source: "Manga",
  type: "TV",
  rating: "PG-13",
  duration: "24 min per ep",
  aired: { from: "2024-01-01", to: "2024-06-30" },
});

const mangaFixture = (mal_id: number, title: string) => ({
  mal_id,
  title,
  synopsis: `Synopsis de ${title}`,
  images: { jpg: { large_image_url: `https://cdn.myanimelist.net/images/manga/${mal_id}.jpg` } },
  published: { from: "2020-01-01", to: null, prop: { from: { year: 2020 } } },
  status: "Publishing",
  score: 9.0,
  scored_by: 5678,
  genres: [{ mal_id: 4, name: "Comedy" }],
  chapters: 120,
  volumes: 12,
  authors: [{ mal_id: 1, name: "Test Author", type: "Story & Art" }],
  type: "Manga",
});

export const handlers = [
  http.get("https://api.jikan.moe/v4/anime/:id/full", ({ params }) => {
    const id = Number(params.id);
    return HttpResponse.json({ data: animeFixture(id, `Anime ${id}`) });
  }),

  http.get("https://api.jikan.moe/v4/manga/:id/full", ({ params }) => {
    const id = Number(params.id);
    return HttpResponse.json({ data: mangaFixture(id, `Manga ${id}`) });
  }),

  http.get("https://api.jikan.moe/v4/anime/:id", ({ params }) => {
    const id = Number(params.id);
    return HttpResponse.json({ data: animeFixture(id, `Anime ${id}`) });
  }),

  http.get("https://api.jikan.moe/v4/manga/:id", ({ params }) => {
    const id = Number(params.id);
    return HttpResponse.json({ data: mangaFixture(id, `Manga ${id}`) });
  }),

  http.get("https://api.jikan.moe/v4/anime", ({ request }) => {
    const url = new URL(request.url);
    const q = url.searchParams.get("q") ?? "";
    return HttpResponse.json({
      data: [animeFixture(1, `Result for ${q}`)],
      pagination: { last_visible_page: 1, has_next_page: false, current_page: 1, items: { count: 1, total: 1, per_page: 25 } },
    });
  }),

  http.get("https://api.jikan.moe/v4/manga", () =>
    HttpResponse.json({
      data: [mangaFixture(1, "Mock Manga")],
      pagination: { last_visible_page: 1, has_next_page: false, current_page: 1, items: { count: 1, total: 1, per_page: 25 } },
    })),

  http.get("https://api.jikan.moe/v4/seasons/:year/:season", () =>
    HttpResponse.json({
      data: [animeFixture(2, "Seasonal anime")],
      pagination: { last_visible_page: 1, has_next_page: false, current_page: 1, items: { count: 1, total: 1, per_page: 25 } },
    })),

  http.get("https://api.jikan.moe/v4/seasons/now", () =>
    HttpResponse.json({
      data: [animeFixture(3, "Now season anime")],
      pagination: { last_visible_page: 1, has_next_page: false, current_page: 1, items: { count: 1, total: 1, per_page: 25 } },
    })),

  http.get("https://api.jikan.moe/v4/seasons/upcoming", () =>
    HttpResponse.json({
      data: [{ ...animeFixture(4, "Upcoming anime"), status: "Not yet aired" }],
      pagination: { last_visible_page: 1, has_next_page: false, current_page: 1, items: { count: 1, total: 1, per_page: 25 } },
    })),

  http.get("https://api.jikan.moe/v4/producers", () =>
    HttpResponse.json({
      data: [{ mal_id: 1, titles: [{ title: "MAPPA" }], count: 100 }],
      pagination: { last_visible_page: 1, has_next_page: false, current_page: 1, items: { count: 1, total: 1, per_page: 25 } },
    })),
];
