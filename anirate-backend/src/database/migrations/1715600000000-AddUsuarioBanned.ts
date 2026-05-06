import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUsuarioBanned1715600000000 implements MigrationInterface {
  name = 'AddUsuarioBanned1715600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      IF NOT EXISTS (
        SELECT 1 FROM sys.columns
        WHERE object_id = OBJECT_ID('Usuario') AND name = 'banned'
      )
      ALTER TABLE Usuario ADD banned BIT NOT NULL
        CONSTRAINT DF_Usuario_banned DEFAULT 0;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      IF EXISTS (
        SELECT 1 FROM sys.columns
        WHERE object_id = OBJECT_ID('Usuario') AND name = 'banned'
      )
      BEGIN
        ALTER TABLE Usuario DROP CONSTRAINT DF_Usuario_banned;
        ALTER TABLE Usuario DROP COLUMN banned;
      END
    `);
  }
}
