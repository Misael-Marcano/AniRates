import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddReviewReport1715000000000 implements MigrationInterface {
  name = 'AddReviewReport1715000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'ReviewReport')
      CREATE TABLE ReviewReport (
        id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        review_id INT NOT NULL,
        reporter_id INT NOT NULL,
        motivo NVARCHAR(500) NULL,
        fecha DATETIME2 NOT NULL CONSTRAINT DF_ReviewReport_fecha DEFAULT SYSDATETIME(),
        CONSTRAINT FK_ReviewReport_Review FOREIGN KEY (review_id) REFERENCES Review(id) ON DELETE CASCADE,
        CONSTRAINT FK_ReviewReport_Usuario FOREIGN KEY (reporter_id) REFERENCES Usuario(id)
      );`);

    await queryRunner.query(`
      IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UQ_ReviewReport_review_reporter')
      CREATE UNIQUE INDEX UQ_ReviewReport_review_reporter ON ReviewReport(review_id, reporter_id);`);

    await queryRunner.query(`
      IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_ReviewReport_fecha')
      CREATE INDEX IX_ReviewReport_fecha ON ReviewReport(fecha DESC);`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_ReviewReport_fecha')
      DROP INDEX IX_ReviewReport_fecha ON ReviewReport;`);
    await queryRunner.query(`
      IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UQ_ReviewReport_review_reporter')
      DROP INDEX UQ_ReviewReport_review_reporter ON ReviewReport;`);
    await queryRunner.query(`
      IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'ReviewReport')
      DROP TABLE ReviewReport;`);
  }
}
