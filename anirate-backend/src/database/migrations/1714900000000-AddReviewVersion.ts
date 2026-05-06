import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddReviewVersion1714900000000 implements MigrationInterface {
  name = 'AddReviewVersion1714900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'ReviewVersion')
      CREATE TABLE ReviewVersion (
        id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        review_id INT NOT NULL,
        comentario NVARCHAR(MAX) NOT NULL,
        imagenes NVARCHAR(MAX) NULL,
        puntuacion FLOAT NULL,
        es_spoiler BIT NOT NULL CONSTRAINT DF_ReviewVersion_es_spoiler DEFAULT 0,
        fecha DATETIME2 NOT NULL CONSTRAINT DF_ReviewVersion_fecha DEFAULT SYSDATETIME(),
        CONSTRAINT FK_ReviewVersion_Review FOREIGN KEY (review_id) REFERENCES Review(id) ON DELETE CASCADE
      );`);

    await queryRunner.query(`
      IF COL_LENGTH('Review', 'imagenes') IS NULL
      ALTER TABLE Review ADD imagenes NVARCHAR(MAX) NULL;
    `);

    await queryRunner.query(`
      IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_ReviewVersion_review_fecha')
      CREATE INDEX IX_ReviewVersion_review_fecha ON ReviewVersion(review_id, fecha DESC);`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      IF COL_LENGTH('Review', 'imagenes') IS NOT NULL
      ALTER TABLE Review DROP COLUMN imagenes;
    `);
    await queryRunner.query(`
      IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_ReviewVersion_review_fecha')
      DROP INDEX IX_ReviewVersion_review_fecha ON ReviewVersion;`);
    await queryRunner.query(`
      IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'ReviewVersion')
      DROP TABLE ReviewVersion;`);
  }
}
