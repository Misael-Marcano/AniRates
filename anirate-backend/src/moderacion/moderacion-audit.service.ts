import { Injectable, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ModeracionLog } from '../database/entities';

/** Claves `accion` para búsqueda/analytics (convención estable). */
export const MOD_AUDIT = {
  REVIEW_REPORT_RESOLVE: 'review_report_resolve',
  USER_REPORT_RESOLVE: 'user_report_resolve',
  CONTENIDO_REPORT_RESOLVE: 'contenido_report_resolve',
  SHADOWBAN_ON: 'shadowban_on',
  SHADOWBAN_OFF: 'shadowban_off',
  BAN_ON: 'ban_on',
  BAN_OFF: 'ban_off',
} as const;

export type ModeracionLogListItem = {
  id: number;
  admin_id: number;
  accion: string;
  entidad_tipo: string | null;
  entidad_id: number | null;
  metadata: Record<string, unknown> | null;
  fecha: Date;
  admin: { id: number; nombre: string } | null;
};

@Injectable()
export class ModeracionAuditService {
  private readonly logger = new Logger(ModeracionAuditService.name);

  constructor(
    @InjectRepository(ModeracionLog)
    private readonly repo: Repository<ModeracionLog>,
  ) {}

  async append(
    adminId: number,
    accion: string,
    entidad_tipo: string | null,
    entidad_id: number | null,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    try {
      await this.repo.save(
        this.repo.create({
          admin_id: adminId,
          accion,
          entidad_tipo,
          entidad_id,
          metadata: metadata ?? null,
        }),
      );
    } catch (e) {
      this.logger.warn(
        `moderacion audit append failed: ${(e as Error).message}`,
      );
    }
  }

  async listRecent(
    userTipo: string,
    take = 200,
  ): Promise<ModeracionLogListItem[]> {
    if (userTipo !== 'admin') throw new ForbiddenException();
    const rows = await this.repo.find({
      relations: ['admin'],
      order: { fecha: 'DESC' },
      take,
    });
    return rows.map((r) => ({
      id: r.id,
      admin_id: r.admin_id,
      accion: r.accion,
      entidad_tipo: r.entidad_tipo,
      entidad_id: r.entidad_id,
      metadata: r.metadata,
      fecha: r.fecha,
      admin: r.admin
        ? { id: r.admin.id, nombre: r.admin.nombre }
        : null,
    }));
  }
}
