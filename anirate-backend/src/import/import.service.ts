import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ListaItem, Rating } from '../database/entities';
import { ContenidoService } from '../contenido/contenido.service';

const MAL_STATUS_MAP: Record<string, string> = {
  '1': 'viendo',
  '2': 'completado',
  '3': 'en_pausa',
  '4': 'abandonado',
  '6': 'planificado',
  Watching: 'viendo',
  Completed: 'completado',
  'On-Hold': 'en_pausa',
  Dropped: 'abandonado',
  'Plan to Watch': 'planificado',
  Reading: 'viendo',
  'Plan to Read': 'planificado',
};

const ANILIST_STATUS_MAP: Record<string, string> = {
  CURRENT: 'viendo',
  COMPLETED: 'completado',
  PAUSED: 'en_pausa',
  DROPPED: 'abandonado',
  PLANNING: 'planificado',
  REPEATING: 'viendo',
};

export interface ImportResult {
  imported: number;
  skipped: number;
  errors: number;
  total: number;
}

interface MalEntry {
  malId: number;
  tipo: 'ANIME' | 'MANGA';
  titulo: string;
  estado: string;
  puntuacion?: number;
  progreso?: number;
}

@Injectable()
export class ImportService {
  private readonly logger = new Logger(ImportService.name);

  constructor(
    @InjectRepository(ListaItem)
    private readonly listaRepo: Repository<ListaItem>,
    @InjectRepository(Rating) private readonly ratingRepo: Repository<Rating>,
    private readonly contenidoService: ContenidoService,
  ) {}

  async importMalXml(userId: number, xml: string): Promise<ImportResult> {
    if (!xml || typeof xml !== 'string' || xml.length < 50) {
      throw new BadRequestException('XML inválido');
    }
    const entries = this.parseMalXml(xml);
    return this.importEntries(userId, entries);
  }

  async importAnilist(userId: number, username: string): Promise<ImportResult> {
    if (!username || username.length < 2)
      throw new BadRequestException('Username requerido');
    const entries = await this.fetchAnilistLists(username);
    return this.importEntries(userId, entries);
  }

  private parseMalXml(xml: string): MalEntry[] {
    const entries: MalEntry[] = [];
    const isManga =
      /<myanimelist>\s*<myinfo>\s*<user_export_type>2/i.test(xml) ||
      /<manga_mangadb_id>/i.test(xml);
    const itemTag = isManga ? 'manga' : 'anime';
    const itemRegex = new RegExp(`<${itemTag}>([\\s\\S]*?)</${itemTag}>`, 'g');
    const blocks = xml.match(itemRegex) ?? [];

    for (const block of blocks) {
      const malId = parseInt(
        this.field(block, isManga ? 'manga_mangadb_id' : 'series_animedb_id') ??
          '0',
        10,
      );
      if (!malId) continue;
      const titulo =
        this.field(block, isManga ? 'manga_title' : 'series_title') ?? '';
      const estadoRaw =
        this.field(block, isManga ? 'my_status' : 'my_status') ?? '';
      const estado = MAL_STATUS_MAP[estadoRaw] ?? 'planificado';
      const puntuacionStr = this.field(
        block,
        isManga ? 'my_score' : 'my_score',
      );
      const puntuacion = puntuacionStr
        ? parseInt(puntuacionStr, 10)
        : undefined;
      const progresoStr = this.field(
        block,
        isManga ? 'my_read_chapters' : 'my_watched_episodes',
      );
      const progreso = progresoStr ? parseInt(progresoStr, 10) : undefined;

      entries.push({
        malId,
        tipo: isManga ? 'MANGA' : 'ANIME',
        titulo,
        estado,
        puntuacion: puntuacion && puntuacion > 0 ? puntuacion : undefined,
        progreso: progreso && progreso > 0 ? progreso : undefined,
      });
    }
    return entries;
  }

  private field(block: string, name: string): string | null {
    const cdata = new RegExp(
      `<${name}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${name}>`,
    ).exec(block);
    if (cdata) return cdata[1].trim();
    const plain = new RegExp(`<${name}>([\\s\\S]*?)</${name}>`).exec(block);
    return plain ? plain[1].trim() : null;
  }

  private async fetchAnilistLists(username: string): Promise<MalEntry[]> {
    const query = `query ($name: String) {
      MediaListCollection(userName: $name, type: ANIME) {
        lists { entries { status score(format: POINT_10) progress media { idMal title { romaji } type } } }
      }
      mangaCollection: MediaListCollection(userName: $name, type: MANGA) {
        lists { entries { status score(format: POINT_10) progress media { idMal title { romaji } type } } }
      }
    }`;

    const res = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables: { name: username } }),
    });
    if (!res.ok) throw new BadRequestException(`AniList ${res.status}`);
    const json = (await res.json()) as {
      data?: {
        MediaListCollection?: {
          lists: {
            entries: {
              status: string;
              score: number;
              progress: number;
              media: {
                idMal: number | null;
                title: { romaji: string };
                type: string;
              };
            }[];
          }[];
        };
        mangaCollection?: {
          lists: {
            entries: {
              status: string;
              score: number;
              progress: number;
              media: {
                idMal: number | null;
                title: { romaji: string };
                type: string;
              };
            }[];
          }[];
        };
      };
      errors?: { message: string }[];
    };
    if (json.errors?.length)
      throw new BadRequestException(json.errors[0].message);

    const entries: MalEntry[] = [];
    const collect = (
      lists:
        | {
            entries: {
              status: string;
              score: number;
              progress: number;
              media: {
                idMal: number | null;
                title: { romaji: string };
                type: string;
              };
            }[];
          }[]
        | undefined,
      tipo: 'ANIME' | 'MANGA',
    ) => {
      for (const l of lists ?? []) {
        for (const e of l.entries) {
          if (!e.media.idMal) continue;
          entries.push({
            malId: e.media.idMal,
            tipo,
            titulo: e.media.title.romaji,
            estado: ANILIST_STATUS_MAP[e.status] ?? 'planificado',
            puntuacion: e.score > 0 ? e.score : undefined,
            progreso: e.progress > 0 ? e.progress : undefined,
          });
        }
      }
    };
    collect(json.data?.MediaListCollection?.lists, 'ANIME');
    collect(json.data?.mangaCollection?.lists, 'MANGA');
    return entries;
  }

  private async importEntries(
    userId: number,
    entries: MalEntry[],
  ): Promise<ImportResult> {
    let imported = 0,
      skipped = 0,
      errors = 0;

    for (const entry of entries) {
      try {
        const contenido = await this.contenidoService.findOrCreateByJikanId({
          jikan_id: entry.malId,
          titulo: entry.titulo,
          tipo: entry.tipo,
        });

        const existing = await this.listaRepo.findOne({
          where: { usuario_id: userId, contenido_id: contenido.id },
        });
        if (existing) {
          existing.estado = entry.estado;
          if (entry.progreso != null) existing.progreso = entry.progreso;
          await this.listaRepo.save(existing);
          skipped += 1;
        } else {
          await this.listaRepo.save(
            this.listaRepo.create({
              usuario_id: userId,
              contenido_id: contenido.id,
              estado: entry.estado,
              progreso: entry.progreso,
            }),
          );
          imported += 1;
        }

        if (
          entry.puntuacion &&
          entry.puntuacion >= 1 &&
          entry.puntuacion <= 10
        ) {
          const existingRating = await this.ratingRepo.findOne({
            where: { usuario_id: userId, contenido_id: contenido.id },
          });
          if (existingRating) {
            existingRating.puntuacion = entry.puntuacion;
            await this.ratingRepo.save(existingRating);
          } else {
            await this.ratingRepo.save(
              this.ratingRepo.create({
                usuario_id: userId,
                contenido_id: contenido.id,
                puntuacion: entry.puntuacion,
              }),
            );
          }
        }
      } catch (err) {
        this.logger.warn(
          `Import error mal_id=${entry.malId}: ${(err as Error).message}`,
        );
        errors += 1;
      }
    }

    return { imported, skipped, errors, total: entries.length };
  }
}
