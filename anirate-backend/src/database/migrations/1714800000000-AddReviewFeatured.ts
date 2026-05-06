import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddReviewFeatured1714800000000 implements MigrationInterface {
  name = 'AddReviewFeatured1714800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      IF COL_LENGTH('Review', 'featured') IS NULL
      ALTER TABLE Review ADD featured BIT NOT NULL CONSTRAINT DF_Review_featured DEFAULT 0;
    `);
    await queryRunner.query(`
      IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Review_contenido_featured')
      CREATE INDEX IX_Review_contenido_featured ON Review(contenido_id, featured DESC);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Review_contenido_featured')
      DROP INDEX IX_Review_contenido_featured ON Review;
    `);
    await queryRunner
      .query(
        `
      IF COL_LENGTH('Review', 'featured') IS NOT NULL
      ALTER TABLE Review DROP CONSTRAINT DF_Review_featured;
    `,
      )
      .catch(async () => {
        // Constraint name may differ between environments.
      });
    await queryRunner.query(`
      IF COL_LENGTH('Review', 'featured') IS NOT NULL
      ALTER TABLE Review DROP COLUMN featured;
    `);
  }
}
