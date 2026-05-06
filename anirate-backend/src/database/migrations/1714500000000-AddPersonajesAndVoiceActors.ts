import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPersonajesAndVoiceActors1714500000000 implements MigrationInterface {
  name = 'AddPersonajesAndVoiceActors1714500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'Personaje')
      CREATE TABLE Personaje (
        id INT IDENTITY(1,1) PRIMARY KEY,
        mal_id INT NOT NULL UNIQUE,
        nombre NVARCHAR(200) NOT NULL,
        about NVARCHAR(MAX) NULL,
        imagen NVARCHAR(MAX) NULL
      );`);

    await queryRunner.query(`
      IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'VoiceActor')
      CREATE TABLE VoiceActor (
        id INT IDENTITY(1,1) PRIMARY KEY,
        mal_id INT NOT NULL UNIQUE,
        nombre NVARCHAR(200) NOT NULL,
        idioma NVARCHAR(30) NULL,
        imagen NVARCHAR(MAX) NULL
      );`);

    await queryRunner.query(`
      IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'ContenidoPersonaje')
      CREATE TABLE ContenidoPersonaje (
        id INT IDENTITY(1,1) PRIMARY KEY,
        contenido_id INT NOT NULL,
        personaje_id INT NOT NULL,
        rol NVARCHAR(30) NULL,
        orden INT NOT NULL DEFAULT 0,
        CONSTRAINT FK_CP_Contenido FOREIGN KEY (contenido_id) REFERENCES Contenido(id) ON DELETE CASCADE,
        CONSTRAINT FK_CP_Personaje FOREIGN KEY (personaje_id) REFERENCES Personaje(id) ON DELETE CASCADE
      );`);

    await queryRunner.query(`
      IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UQ_CP_contenido_personaje')
      CREATE UNIQUE INDEX UQ_CP_contenido_personaje ON ContenidoPersonaje(contenido_id, personaje_id);`);

    await queryRunner.query(`
      IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_CP_contenido_orden')
      CREATE INDEX IX_CP_contenido_orden ON ContenidoPersonaje(contenido_id, orden);`);

    await queryRunner.query(`
      IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'PersonajeVoiceActor')
      CREATE TABLE PersonajeVoiceActor (
        id INT IDENTITY(1,1) PRIMARY KEY,
        personaje_id INT NOT NULL,
        voice_actor_id INT NOT NULL,
        CONSTRAINT FK_PVA_Personaje FOREIGN KEY (personaje_id) REFERENCES Personaje(id) ON DELETE CASCADE,
        CONSTRAINT FK_PVA_VA FOREIGN KEY (voice_actor_id) REFERENCES VoiceActor(id) ON DELETE CASCADE
      );`);

    await queryRunner.query(`
      IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UQ_PVA_personaje_va')
      CREATE UNIQUE INDEX UQ_PVA_personaje_va ON PersonajeVoiceActor(personaje_id, voice_actor_id);`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'PersonajeVoiceActor') DROP TABLE PersonajeVoiceActor;`,
    );
    await queryRunner.query(
      `IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'ContenidoPersonaje') DROP TABLE ContenidoPersonaje;`,
    );
    await queryRunner.query(
      `IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'VoiceActor') DROP TABLE VoiceActor;`,
    );
    await queryRunner.query(
      `IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'Personaje') DROP TABLE Personaje;`,
    );
  }
}
