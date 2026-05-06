import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCompositeIndexes1714200000000 implements MigrationInterface {
  name = 'AddCompositeIndexes1714200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const stmts: string[] = [
      `IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UQ_Rating_user_contenido') CREATE UNIQUE INDEX UQ_Rating_user_contenido ON Rating(usuario_id, contenido_id);`,
      `IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Rating_contenido_punt') CREATE INDEX IX_Rating_contenido_punt ON Rating(contenido_id, puntuacion);`,
      `IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UQ_Review_user_contenido') CREATE UNIQUE INDEX UQ_Review_user_contenido ON Review(usuario_id, contenido_id);`,
      `IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Review_contenido_fecha') CREATE INDEX IX_Review_contenido_fecha ON Review(contenido_id, fecha DESC);`,
      `IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Review_contenido_votos') CREATE INDEX IX_Review_contenido_votos ON Review(contenido_id, votos DESC);`,
      `IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UQ_ReviewVoto_review_user') CREATE UNIQUE INDEX UQ_ReviewVoto_review_user ON ReviewVoto(review_id, usuario_id);`,
      `IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_ReviewRespuesta_review_fecha') CREATE INDEX IX_ReviewRespuesta_review_fecha ON ReviewRespuesta(review_id, fecha);`,
      `IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UQ_ListaItem_user_contenido') CREATE UNIQUE INDEX UQ_ListaItem_user_contenido ON ListaItem(usuario_id, contenido_id);`,
      `IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_ListaItem_user_estado') CREATE INDEX IX_ListaItem_user_estado ON ListaItem(usuario_id, estado);`,
      `IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Notificacion_user_leida_fecha') CREATE INDEX IX_Notificacion_user_leida_fecha ON Notificacion(usuario_id, leida, fecha DESC);`,
      `IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UQ_Favorito_user_contenido') CREATE UNIQUE INDEX UQ_Favorito_user_contenido ON Favorito(usuario_id, contenido_id);`,
      `IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_ListaPersonalizada_user') CREATE INDEX IX_ListaPersonalizada_user ON ListaPersonalizada(usuario_id);`,
      `IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UQ_LPC_lista_contenido') CREATE UNIQUE INDEX UQ_LPC_lista_contenido ON ListaPersonalizada_Contenido(lista_id, contenido_id);`,
      `IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Sesion_user_revoked') CREATE INDEX IX_Sesion_user_revoked ON Sesion(usuario_id, revoked_at);`,
      `IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UQ_Seguimiento_pair') CREATE UNIQUE INDEX UQ_Seguimiento_pair ON Seguimiento(seguidor_id, seguido_id);`,
      `IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Seguimiento_seguidor_fecha') CREATE INDEX IX_Seguimiento_seguidor_fecha ON Seguimiento(seguidor_id, fecha DESC);`,
      `IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Seguimiento_seguido') CREATE INDEX IX_Seguimiento_seguido ON Seguimiento(seguido_id);`,
    ];
    for (const sql of stmts) await queryRunner.query(sql);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const drops = [
      'UQ_Rating_user_contenido',
      'IX_Rating_contenido_punt',
      'UQ_Review_user_contenido',
      'IX_Review_contenido_fecha',
      'IX_Review_contenido_votos',
      'UQ_ReviewVoto_review_user',
      'IX_ReviewRespuesta_review_fecha',
      'UQ_ListaItem_user_contenido',
      'IX_ListaItem_user_estado',
      'IX_Notificacion_user_leida_fecha',
      'UQ_Favorito_user_contenido',
      'IX_ListaPersonalizada_user',
      'UQ_LPC_lista_contenido',
      'IX_Sesion_user_revoked',
      'UQ_Seguimiento_pair',
      'IX_Seguimiento_seguidor_fecha',
      'IX_Seguimiento_seguido',
    ];
    const tableMap: Record<string, string> = {
      UQ_Rating_user_contenido: 'Rating',
      IX_Rating_contenido_punt: 'Rating',
      UQ_Review_user_contenido: 'Review',
      IX_Review_contenido_fecha: 'Review',
      IX_Review_contenido_votos: 'Review',
      UQ_ReviewVoto_review_user: 'ReviewVoto',
      IX_ReviewRespuesta_review_fecha: 'ReviewRespuesta',
      UQ_ListaItem_user_contenido: 'ListaItem',
      IX_ListaItem_user_estado: 'ListaItem',
      IX_Notificacion_user_leida_fecha: 'Notificacion',
      UQ_Favorito_user_contenido: 'Favorito',
      IX_ListaPersonalizada_user: 'ListaPersonalizada',
      UQ_LPC_lista_contenido: 'ListaPersonalizada_Contenido',
      IX_Sesion_user_revoked: 'Sesion',
      UQ_Seguimiento_pair: 'Seguimiento',
      IX_Seguimiento_seguidor_fecha: 'Seguimiento',
      IX_Seguimiento_seguido: 'Seguimiento',
    };
    for (const idx of drops) {
      await queryRunner.query(
        `IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = '${idx}') DROP INDEX ${idx} ON ${tableMap[idx]};`,
      );
    }
  }
}
