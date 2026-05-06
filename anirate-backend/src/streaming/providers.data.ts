export interface StreamingEntry {
  provider:
    | 'crunchyroll'
    | 'netflix'
    | 'hidive'
    | 'disney'
    | 'amazon'
    | 'hulu'
    | 'youtube';
  url: string;
  region?: string;
  type?: 'subscription' | 'free' | 'rent';
}

/**
 * Curated mapping of Jikan/MAL IDs → streaming providers.
 * Add new entries as data becomes available. Generic JustWatch fallback handled in service.
 */
export const STREAMING_MAP: Record<number, StreamingEntry[]> = {
  // Demon Slayer (Kimetsu no Yaiba)
  38000: [
    {
      provider: 'crunchyroll',
      url: 'https://www.crunchyroll.com/series/GY5P48XEY',
      type: 'subscription',
    },
    {
      provider: 'netflix',
      url: 'https://www.netflix.com/title/81091393',
      type: 'subscription',
    },
  ],
  // Attack on Titan
  16498: [
    {
      provider: 'crunchyroll',
      url: 'https://www.crunchyroll.com/series/GR751KNZY',
      type: 'subscription',
    },
    {
      provider: 'hulu',
      url: 'https://www.hulu.com/series/attack-on-titan-7e7bf405-e329-461e-bcdc-2bff8a5fd66e',
      type: 'subscription',
    },
  ],
  // Jujutsu Kaisen
  40748: [
    {
      provider: 'crunchyroll',
      url: 'https://www.crunchyroll.com/series/GRDV0019R',
      type: 'subscription',
    },
    {
      provider: 'netflix',
      url: 'https://www.netflix.com/title/81226429',
      type: 'subscription',
    },
  ],
  // One Piece
  21: [
    {
      provider: 'crunchyroll',
      url: 'https://www.crunchyroll.com/series/GRMG8ZQZR',
      type: 'subscription',
    },
    {
      provider: 'netflix',
      url: 'https://www.netflix.com/title/80107103',
      type: 'subscription',
    },
  ],
  // Naruto
  20: [
    {
      provider: 'crunchyroll',
      url: 'https://www.crunchyroll.com/series/GY9PJ5KWR',
      type: 'subscription',
    },
    {
      provider: 'hulu',
      url: 'https://www.hulu.com/series/naruto-c1cd6f80-7d7b-49f8-a17f-5c6b54c41c63',
      type: 'subscription',
    },
  ],
  // Frieren: Beyond Journey's End
  52991: [
    {
      provider: 'crunchyroll',
      url: 'https://www.crunchyroll.com/series/G9VHN9P43',
      type: 'subscription',
    },
  ],
  // Spy x Family
  50265: [
    {
      provider: 'crunchyroll',
      url: 'https://www.crunchyroll.com/series/GRMG8ZQZR',
      type: 'subscription',
    },
    {
      provider: 'hulu',
      url: 'https://www.hulu.com/series/spy-x-family',
      type: 'subscription',
    },
  ],
  // Chainsaw Man
  44511: [
    {
      provider: 'crunchyroll',
      url: 'https://www.crunchyroll.com/series/GRDV0019R',
      type: 'subscription',
    },
    {
      provider: 'hulu',
      url: 'https://www.hulu.com/series/chainsaw-man-7c5dc6a4-d5f7-4ee3-bfd3-48bc3d5bbe6a',
      type: 'subscription',
    },
  ],
  // My Hero Academia
  31964: [
    {
      provider: 'crunchyroll',
      url: 'https://www.crunchyroll.com/series/GY5P48XEY',
      type: 'subscription',
    },
    {
      provider: 'hulu',
      url: 'https://www.hulu.com/series/my-hero-academia',
      type: 'subscription',
    },
  ],
  // Death Note
  1535: [
    {
      provider: 'netflix',
      url: 'https://www.netflix.com/title/70205012',
      type: 'subscription',
    },
    {
      provider: 'hulu',
      url: 'https://www.hulu.com/series/death-note',
      type: 'subscription',
    },
  ],
  // Fullmetal Alchemist Brotherhood
  5114: [
    {
      provider: 'crunchyroll',
      url: 'https://www.crunchyroll.com/series/GR751KNZY',
      type: 'subscription',
    },
    {
      provider: 'netflix',
      url: 'https://www.netflix.com/title/70204970',
      type: 'subscription',
    },
    {
      provider: 'hulu',
      url: 'https://www.hulu.com/series/fullmetal-alchemist-brotherhood',
      type: 'subscription',
    },
  ],
  // Hunter x Hunter (2011)
  11061: [
    {
      provider: 'crunchyroll',
      url: 'https://www.crunchyroll.com/series/GY5P48XEY',
      type: 'subscription',
    },
    {
      provider: 'netflix',
      url: 'https://www.netflix.com/title/80075675',
      type: 'subscription',
    },
  ],
  // Steins;Gate
  9253: [
    {
      provider: 'crunchyroll',
      url: 'https://www.crunchyroll.com/series/GR3VWXP06',
      type: 'subscription',
    },
    {
      provider: 'hulu',
      url: 'https://www.hulu.com/series/steinsgate',
      type: 'subscription',
    },
  ],
  // Code Geass
  1575: [
    {
      provider: 'crunchyroll',
      url: 'https://www.crunchyroll.com/series/GY9PJ5KWR',
      type: 'subscription',
    },
    {
      provider: 'netflix',
      url: 'https://www.netflix.com/title/70220715',
      type: 'subscription',
    },
    {
      provider: 'hulu',
      url: 'https://www.hulu.com/series/code-geass-lelouch-of-the-rebellion',
      type: 'subscription',
    },
  ],
  // Tokyo Ghoul
  22319: [
    {
      provider: 'crunchyroll',
      url: 'https://www.crunchyroll.com/series/GR751KNZY',
      type: 'subscription',
    },
    {
      provider: 'hulu',
      url: 'https://www.hulu.com/series/tokyo-ghoul',
      type: 'subscription',
    },
  ],
  // Vinland Saga
  37521: [
    {
      provider: 'crunchyroll',
      url: 'https://www.crunchyroll.com/series/GRDV0019R',
      type: 'subscription',
    },
    {
      provider: 'netflix',
      url: 'https://www.netflix.com/title/81247439',
      type: 'subscription',
    },
  ],
  // Mob Psycho 100
  32182: [
    {
      provider: 'crunchyroll',
      url: 'https://www.crunchyroll.com/series/GRDV0019R',
      type: 'subscription',
    },
  ],
  // One Punch Man
  30276: [
    {
      provider: 'hulu',
      url: 'https://www.hulu.com/series/one-punch-man',
      type: 'subscription',
    },
    {
      provider: 'netflix',
      url: 'https://www.netflix.com/title/80159415',
      type: 'subscription',
    },
  ],
  // Dragon Ball Z
  813: [
    {
      provider: 'crunchyroll',
      url: 'https://www.crunchyroll.com/series/GYE5MEPK6',
      type: 'subscription',
    },
    {
      provider: 'hulu',
      url: 'https://www.hulu.com/series/dragon-ball-z',
      type: 'subscription',
    },
  ],
  // Cowboy Bebop
  1: [
    {
      provider: 'crunchyroll',
      url: 'https://www.crunchyroll.com/series/GYZX4P49R',
      type: 'subscription',
    },
    {
      provider: 'hulu',
      url: 'https://www.hulu.com/series/cowboy-bebop',
      type: 'subscription',
    },
    {
      provider: 'netflix',
      url: 'https://www.netflix.com/title/80991146',
      type: 'subscription',
    },
  ],
  // Bleach
  269: [
    {
      provider: 'crunchyroll',
      url: 'https://www.crunchyroll.com/series/GY9P3DZK6',
      type: 'subscription',
    },
    {
      provider: 'hulu',
      url: 'https://www.hulu.com/series/bleach',
      type: 'subscription',
    },
  ],
  // Re:Zero
  31240: [
    {
      provider: 'crunchyroll',
      url: 'https://www.crunchyroll.com/series/GRDV0019R',
      type: 'subscription',
    },
  ],
  // Made in Abyss
  34599: [
    {
      provider: 'hidive',
      url: 'https://www.hidive.com/tv/made-in-abyss',
      type: 'subscription',
    },
  ],
  // Konosuba
  30831: [
    {
      provider: 'crunchyroll',
      url: 'https://www.crunchyroll.com/series/GR3VWXP06',
      type: 'subscription',
    },
  ],
  // Black Clover
  34572: [
    {
      provider: 'crunchyroll',
      url: 'https://www.crunchyroll.com/series/GR3VWXP06',
      type: 'subscription',
    },
    {
      provider: 'hulu',
      url: 'https://www.hulu.com/series/black-clover',
      type: 'subscription',
    },
  ],
  // Mushoku Tensei
  39535: [
    {
      provider: 'crunchyroll',
      url: 'https://www.crunchyroll.com/series/GRDV0019R',
      type: 'subscription',
    },
  ],
  // 86 Eighty-Six
  41457: [
    {
      provider: 'crunchyroll',
      url: 'https://www.crunchyroll.com/series/GRDV0019R',
      type: 'subscription',
    },
  ],
  // Oshi no Ko
  52034: [
    {
      provider: 'hidive',
      url: 'https://www.hidive.com/tv/oshi-no-ko',
      type: 'subscription',
    },
  ],
};

export function justWatchSearch(title: string): string {
  return `https://www.justwatch.com/us/buscar?q=${encodeURIComponent(title)}`;
}

export function crunchyrollSearch(title: string): string {
  return `https://www.crunchyroll.com/search?q=${encodeURIComponent(title)}`;
}
