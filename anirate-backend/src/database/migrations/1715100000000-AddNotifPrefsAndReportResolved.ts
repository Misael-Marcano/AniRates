import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNotifPrefsAndReportResolved1715100000000 implements MigrationInterface {
  name = 'AddNotifPrefsAndReportResolved1715100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      IF COL_LENGTH('Usuario', 'notification_prefs') IS NULL
      ALTER TABLE Usuario ADD notification_prefs NVARCHAR(MAX) NULL;
    `);

    await queryRunner.query(`
      IF COL_LENGTH('ReviewReport', 'resuelto') IS NULL
      ALTER TABLE ReviewReport ADD resuelto BIT NOT NULL CONSTRAINT DF_ReviewReport_resuelto DEFAULT 0;
    `);
    await queryRunner.query(`
      IF COL_LENGTH('ReviewReport', 'resuelto_en') IS NULL
      ALTER TABLE ReviewReport ADD resuelto_en DATETIME2 NULL;
    `);

    await queryRunner.query(`
      IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_ReviewReport_resuelto_fecha')
      CREATE INDEX IX_ReviewReport_resuelto_fecha ON ReviewReport(resuelto, fecha DESC);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_ReviewReport_resuelto_fecha')
      DROP INDEX IX_ReviewReport_resuelto_fecha ON ReviewReport;`);
    await queryRunner.query(`
      IF COL_LENGTH('ReviewReport', 'resuelto_en') IS NOT NULL
      ALTER TABLE ReviewReport DROP COLUMN resuelto_en;`);
    await queryRunner.query(`
      IF COL_LENGTH('ReviewReport', 'resuelto') IS NOT NULL
      BEGIN
        IF EXISTS (SELECT 1 FROM sys.default_constraints WHERE parent_object_id = OBJECT_ID('ReviewReport') AND name = 'DF_ReviewReport_resuelto')
        ALTER TABLE ReviewReport DROP CONSTRAINT DF_ReviewReport_resuelto;
        ALTER TABLE ReviewReport DROP COLUMN resuelto;
      END`);
    await queryRunner.query(`
      IF COL_LENGTH('Usuario', 'notification_prefs') IS NOT NULL
      ALTER TABLE Usuario DROP COLUMN notification_prefs;`);
  }
}
