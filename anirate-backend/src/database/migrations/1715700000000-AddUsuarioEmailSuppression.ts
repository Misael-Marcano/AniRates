import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUsuarioEmailSuppression1715700000000
  implements MigrationInterface
{
  name = 'AddUsuarioEmailSuppression1715700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      IF NOT EXISTS (
        SELECT 1 FROM sys.columns
        WHERE object_id = OBJECT_ID('Usuario') AND name = 'email_delivery_suppressed_at'
      )
      ALTER TABLE Usuario ADD email_delivery_suppressed_at DATETIME2 NULL;
    `);
    await queryRunner.query(`
      IF NOT EXISTS (
        SELECT 1 FROM sys.columns
        WHERE object_id = OBJECT_ID('Usuario') AND name = 'email_suppression_reason'
      )
      ALTER TABLE Usuario ADD email_suppression_reason NVARCHAR(500) NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      IF EXISTS (
        SELECT 1 FROM sys.columns
        WHERE object_id = OBJECT_ID('Usuario') AND name = 'email_suppression_reason'
      )
      ALTER TABLE Usuario DROP COLUMN email_suppression_reason;
    `);
    await queryRunner.query(`
      IF EXISTS (
        SELECT 1 FROM sys.columns
        WHERE object_id = OBJECT_ID('Usuario') AND name = 'email_delivery_suppressed_at'
      )
      ALTER TABLE Usuario DROP COLUMN email_delivery_suppressed_at;
    `);
  }
}
