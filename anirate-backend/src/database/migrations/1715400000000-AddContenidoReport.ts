import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddContenidoReport1715400000000 implements MigrationInterface {
  name = 'AddContenidoReport1715400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'ContenidoReport')
      CREATE TABLE ContenidoReport (
        id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        contenido_id INT NOT NULL,
        reporter_id INT NOT NULL,
        motivo NVARCHAR(500) NULL,
        fecha DATETIME2 NOT NULL CONSTRAINT DF_ContenidoReport_fecha DEFAULT SYSDATETIME(),
        resuelto BIT NOT NULL CONSTRAINT DF_ContenidoReport_resuelto DEFAULT 0,
        resuelto_en DATETIME2 NULL,
        CONSTRAINT FK_ContenidoReport_Contenido FOREIGN KEY (contenido_id) REFERENCES Contenido(id) ON DELETE CASCADE,
        CONSTRAINT FK_ContenidoReport_Reporter FOREIGN KEY (reporter_id) REFERENCES Usuario(id)
      );`);

    await queryRunner.query(`
      IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UQ_ContenidoReport_contenido_reporter')
      CREATE UNIQUE INDEX UQ_ContenidoReport_contenido_reporter ON ContenidoReport(contenido_id, reporter_id);`);

    await queryRunner.query(`
      IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_ContenidoReport_fecha')
      CREATE INDEX IX_ContenidoReport_fecha ON ContenidoReport(fecha DESC);`);

    await queryRunner.query(`
      IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_ContenidoReport_resuelto_fecha')
      CREATE INDEX IX_ContenidoReport_resuelto_fecha ON ContenidoReport(resuelto ASC, fecha DESC);`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_ContenidoReport_resuelto_fecha')
      DROP INDEX IX_ContenidoReport_resuelto_fecha ON ContenidoReport;`);
    await queryRunner.query(`
      IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_ContenidoReport_fecha')
      DROP INDEX IX_ContenidoReport_fecha ON ContenidoReport;`);
    await queryRunner.query(`
      IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UQ_ContenidoReport_contenido_reporter')
      DROP INDEX UQ_ContenidoReport_contenido_reporter ON ContenidoReport;`);
    await queryRunner.query(`
      IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'ContenidoReport')
      DROP TABLE ContenidoReport;`);
  }
}
