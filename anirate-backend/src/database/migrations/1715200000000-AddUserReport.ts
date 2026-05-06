import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserReport1715200000000 implements MigrationInterface {
  name = 'AddUserReport1715200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'UserReport')
      CREATE TABLE UserReport (
        id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        reported_user_id INT NOT NULL,
        reporter_id INT NOT NULL,
        motivo NVARCHAR(500) NULL,
        fecha DATETIME2 NOT NULL CONSTRAINT DF_UserReport_fecha DEFAULT SYSDATETIME(),
        resuelto BIT NOT NULL CONSTRAINT DF_UserReport_resuelto DEFAULT 0,
        resuelto_en DATETIME2 NULL,
        CONSTRAINT FK_UserReport_Reported FOREIGN KEY (reported_user_id) REFERENCES Usuario(id),
        CONSTRAINT FK_UserReport_Reporter FOREIGN KEY (reporter_id) REFERENCES Usuario(id)
      );`);

    await queryRunner.query(`
      IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UQ_UserReport_reported_reporter')
      CREATE UNIQUE INDEX UQ_UserReport_reported_reporter ON UserReport(reported_user_id, reporter_id);`);

    await queryRunner.query(`
      IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_UserReport_resuelto_fecha')
      CREATE INDEX IX_UserReport_resuelto_fecha ON UserReport(resuelto ASC, fecha DESC);`);

    await queryRunner.query(`
      IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_UserReport_fecha')
      CREATE INDEX IX_UserReport_fecha ON UserReport(fecha DESC);`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_UserReport_fecha')
      DROP INDEX IX_UserReport_fecha ON UserReport;`);
    await queryRunner.query(`
      IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_UserReport_resuelto_fecha')
      DROP INDEX IX_UserReport_resuelto_fecha ON UserReport;`);
    await queryRunner.query(`
      IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UQ_UserReport_reported_reporter')
      DROP INDEX UQ_UserReport_reported_reporter ON UserReport;`);
    await queryRunner.query(`
      IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'UserReport')
      DROP TABLE UserReport;`);
  }
}
