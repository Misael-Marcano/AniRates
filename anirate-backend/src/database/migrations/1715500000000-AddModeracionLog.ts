import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddModeracionLog1715500000000 implements MigrationInterface {
  name = 'AddModeracionLog1715500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'ModeracionLog')
      CREATE TABLE ModeracionLog (
        id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        admin_id INT NOT NULL,
        accion NVARCHAR(64) NOT NULL,
        entidad_tipo NVARCHAR(32) NULL,
        entidad_id INT NULL,
        metadata NVARCHAR(MAX) NULL,
        fecha DATETIME2 NOT NULL CONSTRAINT DF_ModeracionLog_fecha DEFAULT SYSDATETIME(),
        CONSTRAINT FK_ModeracionLog_Admin FOREIGN KEY (admin_id) REFERENCES Usuario(id)
      );`);

    await queryRunner.query(`
      IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_ModeracionLog_fecha')
      CREATE INDEX IX_ModeracionLog_fecha ON ModeracionLog(fecha DESC);`);

    await queryRunner.query(`
      IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_ModeracionLog_admin_fecha')
      CREATE INDEX IX_ModeracionLog_admin_fecha ON ModeracionLog(admin_id ASC, fecha DESC);`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_ModeracionLog_admin_fecha')
      DROP INDEX IX_ModeracionLog_admin_fecha ON ModeracionLog;`);
    await queryRunner.query(`
      IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_ModeracionLog_fecha')
      DROP INDEX IX_ModeracionLog_fecha ON ModeracionLog;`);
    await queryRunner.query(`
      IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'ModeracionLog')
      DROP TABLE ModeracionLog;`);
  }
}
