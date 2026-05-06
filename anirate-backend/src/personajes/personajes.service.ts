import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Personaje,
  VoiceActor,
  ContenidoPersonaje,
  PersonajeVoiceActor,
  FavoritoPersonaje,
} from '../database/entities';
import { ContenidoService } from '../contenido/contenido.service';
import { CacheService } from '../cache/cache.service';

interface JikanCharacterEntry {
  character: {
    mal_id: number;
    name: string;
    images?: { jpg?: { image_url?: string } };
  };
  role: string;
  voice_actors?: {
    person: {
      mal_id: number;
      name: string;
      images?: { jpg?: { image_url?: string } };
    };
    language: string;
  }[];
}

const JIKAN_BASE = 'https://api.jikan.moe/v4';
const SYNC_TTL_SEC = 7 * 24 * 3600;

@Injectable()
export class PersonajesService {
  private readonly logger = new Logger(PersonajesService.name);

  constructor(
    @InjectRepository(Personaje)
    private readonly personajeRepo: Repository<Personaje>,
    @InjectRepository(VoiceActor)
    private readonly vaRepo: Repository<VoiceActor>,
    @InjectRepository(ContenidoPersonaje)
    private readonly cpRepo: Repository<ContenidoPersonaje>,
    @InjectRepository(PersonajeVoiceActor)
    private readonly pvaRepo: Repository<PersonajeVoiceActor>,
    @InjectRepository(FavoritoPersonaje)
    private readonly favRepo: Repository<FavoritoPersonaje>,
    private readonly contenidoService: ContenidoService,
    private readonly cache: CacheService,
  ) {}

  async favorite(
    userId: number,
    malId: number,
  ): Promise<{ favorited: boolean }> {
    const personaje = await this.ensurePersonaje(malId);
    const existing = await this.favRepo.findOne({
      where: { usuario_id: userId, personaje_id: personaje.id },
    });
    if (existing) return { favorited: true };
    await this.favRepo.save(
      this.favRepo.create({ usuario_id: userId, personaje_id: personaje.id }),
    );
    return { favorited: true };
  }

  async unfavorite(
    userId: number,
    malId: number,
  ): Promise<{ favorited: boolean }> {
    const personaje = await this.personajeRepo.findOne({
      where: { mal_id: malId },
    });
    if (personaje)
      await this.favRepo.delete({
        usuario_id: userId,
        personaje_id: personaje.id,
      });
    return { favorited: false };
  }

  async myFavoritePersonajes(userId: number): Promise<FavoritoPersonaje[]> {
    return this.favRepo.find({
      where: { usuario_id: userId },
      order: { fecha: 'DESC' },
    });
  }

  async isFavorite(
    userId: number,
    malId: number,
  ): Promise<{ favorited: boolean }> {
    const personaje = await this.personajeRepo.findOne({
      where: { mal_id: malId },
    });
    if (!personaje) return { favorited: false };
    const existing = await this.favRepo.findOne({
      where: { usuario_id: userId, personaje_id: personaje.id },
    });
    return { favorited: Boolean(existing) };
  }

  private async ensurePersonaje(malId: number): Promise<Personaje> {
    let personaje = await this.personajeRepo.findOne({
      where: { mal_id: malId },
    });
    if (personaje) return personaje;
    const data = await this.fetchJikan<{
      data: {
        mal_id: number;
        name: string;
        about?: string;
        images?: { jpg?: { image_url?: string } };
      };
    }>(`/characters/${malId}/full`);
    if (!data?.data) throw new NotFoundException();
    personaje = await this.personajeRepo.save(
      this.personajeRepo.create({
        mal_id: data.data.mal_id,
        nombre: data.data.name,
        about: data.data.about,
        imagen: data.data.images?.jpg?.image_url,
      }),
    );
    return personaje;
  }

  private syncedKey(jikanId: number): string {
    return `personajes:synced:${jikanId}`;
  }

  async getByContenido(jikanId: number): Promise<ContenidoPersonaje[]> {
    const contenido = await this.contenidoService.findByJikanId(jikanId);
    if (!contenido) {
      await this.syncFromJikan(jikanId, 'anime');
      const c2 = await this.contenidoService.findByJikanId(jikanId);
      if (!c2) throw new NotFoundException();
      return this.cpRepo.find({
        where: { contenido_id: c2.id },
        order: { orden: 'ASC' },
      });
    }

    const synced = await this.cache.get<boolean>(this.syncedKey(jikanId));
    if (!synced) {
      await this.syncFromJikan(
        jikanId,
        contenido.tipo === 'MANGA' ? 'manga' : 'anime',
      );
      await this.cache.set(this.syncedKey(jikanId), true, SYNC_TTL_SEC);
    }
    return this.cpRepo.find({
      where: { contenido_id: contenido.id },
      order: { orden: 'ASC' },
    });
  }

  async getPersonaje(malId: number) {
    let personaje = await this.personajeRepo.findOne({
      where: { mal_id: malId },
    });
    if (!personaje) {
      const data = await this.fetchJikan<{
        data: {
          mal_id: number;
          name: string;
          about?: string;
          images?: { jpg?: { image_url?: string } };
        };
      }>(`/characters/${malId}/full`);
      if (!data?.data) throw new NotFoundException();
      personaje = await this.personajeRepo.save(
        this.personajeRepo.create({
          mal_id: data.data.mal_id,
          nombre: data.data.name,
          about: data.data.about,
          imagen: data.data.images?.jpg?.image_url,
        }),
      );
    }
    const vas = await this.pvaRepo.find({
      where: { personaje_id: personaje.id },
    });
    return { ...personaje, voice_actors: vas.map((v) => v.voice_actor) };
  }

  async getVoiceActor(malId: number) {
    let va = await this.vaRepo.findOne({ where: { mal_id: malId } });
    if (!va) {
      const data = await this.fetchJikan<{
        data: {
          mal_id: number;
          name: string;
          images?: { jpg?: { image_url?: string } };
        };
      }>(`/people/${malId}/full`);
      if (!data?.data) throw new NotFoundException();
      va = await this.vaRepo.save(
        this.vaRepo.create({
          mal_id: data.data.mal_id,
          nombre: data.data.name,
          imagen: data.data.images?.jpg?.image_url,
          idioma: '',
        }),
      );
    }
    const pvas = await this.pvaRepo.find({ where: { voice_actor_id: va.id } });
    return { ...va, personajes: pvas.map((p) => p.personaje) };
  }

  private async syncFromJikan(
    jikanId: number,
    tipo: 'anime' | 'manga',
  ): Promise<void> {
    let contenido = await this.contenidoService.findByJikanId(jikanId);
    if (!contenido) {
      try {
        const meta = await this.fetchJikan<{
          data: {
            mal_id: number;
            title: string;
            type?: string;
            year?: number;
            status?: string;
            synopsis?: string;
            images?: { jpg?: { image_url?: string } };
          };
        }>(`/${tipo}/${jikanId}`);
        if (!meta?.data) return;
        contenido = await this.contenidoService.findOrCreateByJikanId({
          jikan_id: meta.data.mal_id,
          titulo: meta.data.title,
          tipo: tipo.toUpperCase(),
          imagen: meta.data.images?.jpg?.image_url,
          año: meta.data.year,
          estado: meta.data.status,
          descripcion: meta.data.synopsis,
        });
      } catch {
        return;
      }
    }

    let chars: { data: JikanCharacterEntry[] } | null = null;
    try {
      chars = await this.fetchJikan<{ data: JikanCharacterEntry[] }>(
        `/${tipo}/${jikanId}/characters`,
      );
    } catch {
      return;
    }
    if (!chars?.data) return;

    let orden = 0;
    for (const entry of chars.data.slice(0, 30)) {
      orden += 1;
      let personaje = await this.personajeRepo.findOne({
        where: { mal_id: entry.character.mal_id },
      });
      if (!personaje) {
        personaje = await this.personajeRepo.save(
          this.personajeRepo.create({
            mal_id: entry.character.mal_id,
            nombre: entry.character.name,
            imagen: entry.character.images?.jpg?.image_url,
          }),
        );
      }

      const existing = await this.cpRepo.findOne({
        where: { contenido_id: contenido.id, personaje_id: personaje.id },
      });
      if (!existing) {
        await this.cpRepo.save(
          this.cpRepo.create({
            contenido_id: contenido.id,
            personaje_id: personaje.id,
            rol: entry.role,
            orden,
          }),
        );
      }

      for (const va of entry.voice_actors ?? []) {
        let voiceActor = await this.vaRepo.findOne({
          where: { mal_id: va.person.mal_id },
        });
        if (!voiceActor) {
          voiceActor = await this.vaRepo.save(
            this.vaRepo.create({
              mal_id: va.person.mal_id,
              nombre: va.person.name,
              idioma: va.language,
              imagen: va.person.images?.jpg?.image_url,
            }),
          );
        }
        const linkExists = await this.pvaRepo.findOne({
          where: { personaje_id: personaje.id, voice_actor_id: voiceActor.id },
        });
        if (!linkExists) {
          await this.pvaRepo.save(
            this.pvaRepo.create({
              personaje_id: personaje.id,
              voice_actor_id: voiceActor.id,
            }),
          );
        }
      }
    }
  }

  private async fetchJikan<T>(path: string): Promise<T | null> {
    const cacheKey = `jikan:${path}`;
    const cached = await this.cache.get<T>(cacheKey);
    if (cached) return cached;
    try {
      const res = await fetch(`${JIKAN_BASE}${path}`);
      if (!res.ok) {
        this.logger.warn(`Jikan ${path} → ${res.status}`);
        return null;
      }
      const json = (await res.json()) as T;
      await this.cache.set(cacheKey, json, 24 * 3600);
      return json;
    } catch (err) {
      this.logger.warn(`Jikan fetch error: ${(err as Error).message}`);
      return null;
    }
  }
}
