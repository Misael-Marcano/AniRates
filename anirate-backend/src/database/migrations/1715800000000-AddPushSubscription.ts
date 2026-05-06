import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPushSubscription1715800000000 implements MigrationInterface {
  name = 'AddPushSubscription1715800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'PushSubscription')
      CREATE TABLE PushSubscription (
        id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        usuario_id INT NOT NULL,
        endpoint NVARCHAR(2048) NOT NULL,
        p256dh NVARCHAR(512) NOT NULL,
        auth NVARCHAR(256) NOT NULL,
        created_at DATETIME2 NOT NULL CONSTRAINT DF_PushSubscription_created DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_PushSubscription_Usuario FOREIGN KEY (usuario_id) REFERENCES Usuario(id) ON DELETE CASCADE
      );
    `);
    await queryRunner.query(`
      IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_PushSubscription_usuario' AND object_id = OBJECT_ID('PushSubscription'))
      CREATE INDEX IX_PushSubscription_usuario ON PushSubscription(usuario_id);
    `);
    await queryRunner.query(`
      IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_PushSubscription_endpoint' AND object_id = OBJECT_ID('PushSubscription'))
      CREATE INDEX IX_PushSubscription_endpoint ON PushSubscription(endpoint);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'PushSubscription')
      DROP TABLE PushSubscription;
    `);
  }
}
