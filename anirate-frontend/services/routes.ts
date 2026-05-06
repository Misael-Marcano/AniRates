import type { Contenido } from "@/types";

/** Build the canonical URL for a contenido (anime | manga) using its Jikan ID. */
export function contenidoPath(c: Pick<Contenido, "tipo" | "jikan_id" | "id">): string {
  const kind = c.tipo === "MANGA" ? "manga" : "anime";
  const id = c.jikan_id ?? c.id;
  return `/contenido/${kind}/${id}`;
}

/** Build a contenido path from a raw Jikan result (anime or manga). */
export function jikanPath(jikanId: number, tipo: "anime" | "manga"): string {
  return `/contenido/${tipo}/${jikanId}`;
}

export type ContenidoKind = "anime" | "manga";

export function parseContenidoKind(raw: string | string[] | undefined): ContenidoKind | null {
  const s = Array.isArray(raw) ? raw[0] : raw;
  if (s === "anime" || s === "manga") return s;
  return null;
}
