import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFavoritoPersonaje1714700000000 implements MigrationInterface {
  name = 'AddFavoritoPersonaje1714700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'FavoritoPersonaje')
      CREATE TABLE FavoritoPersonaje (
        id INT IDENTITY(1,1) PRIMARY KEY,
        usuario_id INT NOT NULL,
        personaje_id INT NOT NULL,
        fecha DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
        CONSTRAINT FK_FavPersonaje_Usuario FOREIGN KEY (usuario_id) REFERENCES Usuario(id) ON DELETE CASCADE,
        CONSTRAINT FK_FavPersonaje_Personaje FOREIGN KEY (personaje_id) REFERENCES Personaje(id) ON DELETE CASCADE
      );`);

    await queryRunner.query(`
      IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UQ_FavPersonaje_user')
      CREATE UNIQUE INDEX UQ_FavPersonaje_user ON FavoritoPersonaje(usuario_id, personaje_id);`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'FavoritoPersonaje') DROP TABLE FavoritoPersonaje;`,
    );
  }
}
