import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUsuarioShadowbanned1715300000000 implements MigrationInterface {
  name = 'AddUsuarioShadowbanned1715300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      IF NOT EXISTS (
        SELECT 1 FROM sys.columns
        WHERE object_id = OBJECT_ID('Usuario') AND name = 'shadowbanned'
      )
      ALTER TABLE Usuario ADD shadowbanned BIT NOT NULL
        CONSTRAINT DF_Usuario_shadowbanned DEFAULT 0;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      IF EXISTS (
        SELECT 1 FROM sys.columns
        WHERE object_id = OBJECT_ID('Usuario') AND name = 'shadowbanned'
      )
      BEGIN
        ALTER TABLE Usuario DROP CONSTRAINT DF_Usuario_shadowbanned;
        ALTER TABLE Usuario DROP COLUMN shadowbanned;
      END
    `);
  }
}
