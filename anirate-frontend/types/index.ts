export type ContenidoTipo = "ANIME" | "MANGA";

export interface Genero {
  id: number;
  nombre: string;
}

export interface ContenidoRelacion {
  mal_id: number;
  type: "anime" | "manga";
  name: string;
  relation: string;
}

export interface Contenido {
  id: number;
  jikan_id?: number;
  titulo: string;
  descripcion: string;
  imagen: string;
  año: number;
  estado: string;
  tipo: ContenidoTipo;
  generos?: Genero[];
  rating_promedio?: number;
  total_ratings?: number;
  // Enriched metadata (from Jikan detail)
  episodes?: number;
  chapters?: number;
  volumes?: number;
  studios?: string[];
  authors?: string[];
  source?: string;
  media_type?: string;
  age_rating?: string;
  season?: string;
  duration?: string;
  trailer_youtube_id?: string;
  themes?: string[];
  demographics?: string[];
  aired_from?: string;
  aired_to?: string;
  relations?: ContenidoRelacion[];
}

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  tipo: "admin" | "usuario";
}

export interface Review {
  id: number;
  usuario?: Usuario;
  contenido_id: number;
  comentario: string;
  imagenes?: string[] | null;
  puntuacion?: number;
  es_spoiler?: boolean;
  featured?: boolean;
  votos?: number;
  fecha: string;
}

export interface ReviewRespuesta {
  id: number;
  review_id: number;
  usuario?: Usuario;
  usuario_id: number;
  comentario: string;
  fecha: string;
}

export interface ReviewVersion {
  id: number;
  review_id: number;
  comentario: string;
  imagenes?: string[] | null;
  puntuacion: number | null;
  es_spoiler: boolean;
  fecha: string;
}

export interface Rating {
  id: number;
  usuario_id: number;
  contenido_id: number;
  puntuacion: number;
}

export interface Favorito {
  id: number;
  usuario_id: number;
  contenido: Contenido;
}

export type ListaEstado = 'viendo' | 'completado' | 'planificado' | 'en_pausa' | 'abandonado';

export interface Notificacion {
  id: number;
  usuario_id: number;
  tipo: string;
  mensaje: string;
  leida: boolean;
  referencia_id?: number;
  fecha: string;
}

export interface ListaItem {
  id: number;
  usuario_id: number;
  contenido: Contenido;
  contenido_id: number;
  estado: ListaEstado;
  progreso?: number;
  nota_personal?: string;
  fecha_actualizado: string;
}
