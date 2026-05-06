import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOAuthAccount1714600000000 implements MigrationInterface {
  name = 'AddOAuthAccount1714600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'OAuthAccount')
      CREATE TABLE OAuthAccount (
        id INT IDENTITY(1,1) PRIMARY KEY,
        provider NVARCHAR(30) NOT NULL,
        provider_user_id NVARCHAR(100) NOT NULL,
        usuario_id INT NOT NULL,
        email NVARCHAR(200) NULL,
        created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
        CONSTRAINT FK_OAuth_Usuario FOREIGN KEY (usuario_id) REFERENCES Usuario(id) ON DELETE CASCADE
      );`);

    await queryRunner.query(`
      IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UQ_OAuth_provider_uid')
      CREATE UNIQUE INDEX UQ_OAuth_provider_uid ON OAuthAccount(provider, provider_user_id);`);

    await queryRunner.query(`
      IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_OAuth_user')
      CREATE INDEX IX_OAuth_user ON OAuthAccount(usuario_id);`);

    await queryRunner
      .query(
        `
      ALTER TABLE Sesion ADD refresh_hash NVARCHAR(100) NULL, refresh_expires_at DATETIME2 NULL;`,
      )
      .catch(() => undefined);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'OAuthAccount') DROP TABLE OAuthAccount;`,
    );
  }
}
