import type { Contenido } from "@/types";

export const mockAnime: Contenido[] = [
  { id: 1, titulo: "Attack on Titan", descripcion: "La humanidad vive dentro de ciudades rodeadas de enormes muros que la protegen de los titanes.", imagen: "https://cdn.myanimelist.net/images/anime/10/47347.jpg", año: 2013, estado: "Finalizado", tipo: "ANIME", rating_promedio: 9.0, total_ratings: 2341 },
  { id: 2, titulo: "Fullmetal Alchemist: Brotherhood", descripcion: "Dos hermanos alquimistas buscan la piedra filosofal para restaurar sus cuerpos.", imagen: "https://cdn.myanimelist.net/images/anime/1223/96541.jpg", año: 2009, estado: "Finalizado", tipo: "ANIME", rating_promedio: 9.1, total_ratings: 3102 },
  { id: 3, titulo: "Death Note", descripcion: "Un estudiante brillante encuentra un cuaderno sobrenatural que mata a quien se escriba su nombre.", imagen: "https://cdn.myanimelist.net/images/anime/9/9453.jpg", año: 2006, estado: "Finalizado", tipo: "ANIME", rating_promedio: 8.6, total_ratings: 2891 },
  { id: 4, titulo: "Demon Slayer", descripcion: "Un joven se convierte en cazador de demonios para salvar a su hermana.", imagen: "https://cdn.myanimelist.net/images/anime/1286/99889.jpg", año: 2019, estado: "En emisión", tipo: "ANIME", rating_promedio: 8.7, total_ratings: 1987 },
  { id: 5, titulo: "One Piece", descripcion: "Monkey D. Luffy y su tripulación de piratas buscan el tesoro supremo llamado One Piece.", imagen: "https://cdn.myanimelist.net/images/anime/6/73245.jpg", año: 1999, estado: "En emisión", tipo: "ANIME", rating_promedio: 8.9, total_ratings: 2654 },
  { id: 6, titulo: "Naruto", descripcion: "Un joven ninja sueña con convertirse en el líder de su aldea.", imagen: "https://cdn.myanimelist.net/images/anime/13/17405.jpg", año: 2002, estado: "Finalizado", tipo: "ANIME", rating_promedio: 8.3, total_ratings: 3001 },
  { id: 7, titulo: "Jujutsu Kaisen", descripcion: "Un estudiante ingiere un dedo maldito y debe exorcizar maldiciones.", imagen: "https://cdn.myanimelist.net/images/anime/1171/109222.jpg", año: 2020, estado: "En emisión", tipo: "ANIME", rating_promedio: 8.7, total_ratings: 1765 },
  { id: 8, titulo: "Hunter x Hunter", descripcion: "Un joven busca a su padre convirtiéndose en cazador.", imagen: "https://cdn.myanimelist.net/images/anime/11/33657.jpg", año: 2011, estado: "Finalizado", tipo: "ANIME", rating_promedio: 9.0, total_ratings: 2210 },
];

export const mockManga: Contenido[] = [
  { id: 101, titulo: "Berserk", descripcion: "La oscura historia de Guts, un guerrero solitario en un mundo medieval brutal.", imagen: "https://cdn.myanimelist.net/images/manga/1/157897.jpg", año: 1989, estado: "En publicación", tipo: "MANGA", rating_promedio: 9.4, total_ratings: 1543 },
  { id: 102, titulo: "Vagabond", descripcion: "La vida ficticia del legendario espadachín japonés Miyamoto Musashi.", imagen: "https://cdn.myanimelist.net/images/manga/1/259070.jpg", año: 1998, estado: "En pausa", tipo: "MANGA", rating_promedio: 9.4, total_ratings: 987 },
  { id: 103, titulo: "One Piece Manga", descripcion: "La aventura original del pirata Monkey D. Luffy en busca del One Piece.", imagen: "https://cdn.myanimelist.net/images/manga/2/253146.jpg", año: 1997, estado: "En publicación", tipo: "MANGA", rating_promedio: 9.2, total_ratings: 2100 },
  { id: 104, titulo: "Vinland Saga", descripcion: "Un joven vikingo busca venganza en la época medieval europea.", imagen: "https://cdn.myanimelist.net/images/manga/2/188925.jpg", año: 2005, estado: "En publicación", tipo: "MANGA", rating_promedio: 9.1, total_ratings: 876 },
  { id: 105, titulo: "Chainsaw Man", descripcion: "Un joven se fusiona con su perro demonio y se convierte en cazador de demonios.", imagen: "https://cdn.myanimelist.net/images/manga/3/216464.jpg", año: 2018, estado: "En publicación", tipo: "MANGA", rating_promedio: 8.9, total_ratings: 1234 },
  { id: 106, titulo: "Oyasumi Punpun", descripcion: "La historia de crecimiento de Punpun, un niño dibujado como pájaro abstracto.", imagen: "https://cdn.myanimelist.net/images/manga/3/77649.jpg", año: 2007, estado: "Finalizado", tipo: "MANGA", rating_promedio: 9.0, total_ratings: 765 },
];

export const mockTop: Contenido[] = [
  mockAnime[1], // FMA Brotherhood 9.1
  mockManga[0], // Berserk 9.4
  mockManga[1], // Vagabond 9.4
  mockAnime[0], // AoT 9.0
  mockAnime[7], // HxH 9.0
  mockManga[2], // OP manga 9.2
];
