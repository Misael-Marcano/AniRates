import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  RelationId,
  Index,
} from 'typeorm';

// ─── Usuario ────────────────────────────────────────────────────────────────

@Entity('Usuario')
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nombre: string;

  @Column({ unique: true, length: 150 })
  email: string;

  @Column()
  password: string;

  @Column({ default: 'usuario' })
  tipo: string;

  @Column({ default: true })
  estado: boolean;

  @Column({ default: false })
  email_verificado: boolean;

  @Column({ default: false })
  two_factor_enabled: boolean;

  /** Oculta actividad y perfil a terceros (no admin); el usuario sigue navegando con normalidad. */
  @Column({ default: false })
  shadowbanned: boolean;

  /** Suspensión dura: no puede iniciar sesión ni refrescar token; sesiones revocadas al activar. */
  @Column({ default: false })
  banned: boolean;

  @Column({ type: 'nvarchar', length: 280, nullable: true })
  bio: string;

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  avatar_url: string;

  /** Preferencias de notificación (email / push navegador). */
  @Column('simple-json', { nullable: true })
  notification_prefs: {
    email_mentions?: boolean;
    email_weekly_digest?: boolean;
    /** Zona IANA opcional para pie de digest (cron sigue en UTC). */
    digest_timezone?: string;
    /** Si true, el usuario quiere recibir Web Push para notificaciones in-app (tras registrar el dispositivo). */
    push_in_app_browser?: boolean;
    /**
     * Preferencias por `Notificacion.tipo` (in_app / email / push).
     * Si falta, se aplican valores por defecto retrocompatibles.
     */
    tipo_channels?: Partial<
      Record<
        string,
        { in_app?: boolean; email?: boolean; push?: boolean }
      >
    >;
  } | null;

  /** Proveedor (p. ej. Resend webhook bounce/complaint): no enviar más correo a esta dirección. */
  @Column({ type: 'datetime2', nullable: true })
  email_delivery_suppressed_at: Date | null;

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  email_suppression_reason: string | null;
}

@Entity('TwoFactorSecret')
export class TwoFactorSecret {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  usuario_id: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @Column({ length: 64 })
  secret: string;

  @Column({ default: false })
  enabled: boolean;

  @Column({ type: 'text', nullable: true })
  backup_codes: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

@Entity('EmailVerificationToken')
export class EmailVerificationToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  usuario_id: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @Column({ length: 100, unique: true })
  token: string;

  @Column()
  expires_at: Date;

  @Column({ default: false })
  used: boolean;

  @CreateDateColumn()
  fecha_creado: Date;
}

// ─── Genero ─────────────────────────────────────────────────────────────────

@Entity('Genero')
export class Genero {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  nombre: string;
}

// ─── Contenido ───────────────────────────────────────────────────────────────

@Entity('Contenido')
export class Contenido {
  @PrimaryGeneratedColumn()
  id: number;

  /** MAL ID de Jikan (único por tipo). Null para contenido creado manualmente. */
  @Column({ nullable: true, unique: true })
  jikan_id: number;

  @Column({ length: 200 })
  titulo: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ nullable: true })
  imagen: string;

  @Column({ nullable: true })
  año: number;

  @Column({ nullable: true, length: 50 })
  estado: string;

  @Column({ length: 10 })
  tipo: string; // ANIME | MANGA

  @ManyToMany(() => Genero, { eager: true })
  @JoinTable({ name: 'Contenido_Genero' })
  generos: Genero[];

  rating_promedio?: number;
  total_ratings?: number;
}

// ─── ContenidoReport (moderación: ficha de obra) ──────────────────────────────

@Entity('ContenidoReport')
@Index('IX_ContenidoReport_fecha', ['fecha'])
@Index('UQ_ContenidoReport_contenido_reporter', ['contenido_id', 'reporter_id'], {
  unique: true,
})
export class ContenidoReport {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  contenido_id: number;

  @ManyToOne(() => Contenido, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'contenido_id' })
  contenido: Contenido;

  @Column()
  reporter_id: number;

  @ManyToOne(() => Usuario, { onDelete: 'NO ACTION' })
  @JoinColumn({ name: 'reporter_id' })
  reporter: Usuario;

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  motivo: string | null;

  @CreateDateColumn({ type: 'datetime2' })
  fecha: Date;

  @Column({ default: false })
  resuelto: boolean;

  @Column({ type: 'datetime2', nullable: true })
  resuelto_en: Date | null;
}

// ─── ModeracionLog (auditoría acciones staff) ────────────────────────────────

@Entity('ModeracionLog')
@Index('IX_ModeracionLog_fecha', ['fecha'])
export class ModeracionLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  admin_id: number;

  @ManyToOne(() => Usuario, { onDelete: 'NO ACTION' })
  @JoinColumn({ name: 'admin_id' })
  admin: Usuario;

  @Column({ length: 64 })
  accion: string;

  @Column({ length: 32, nullable: true })
  entidad_tipo: string | null;

  @Column({ type: 'int', nullable: true })
  entidad_id: number | null;

  @Column('simple-json', { nullable: true })
  metadata: Record<string, unknown> | null;

  @CreateDateColumn({ type: 'datetime2' })
  fecha: Date;
}

// ─── Rating ──────────────────────────────────────────────────────────────────

@Entity('Rating')
@Index('UQ_Rating_user_contenido', ['usuario_id', 'contenido_id'], {
  unique: true,
})
@Index('IX_Rating_contenido_punt', ['contenido_id', 'puntuacion'])
export class Rating {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @Column()
  usuario_id: number;

  @ManyToOne(() => Contenido, { eager: true })
  @JoinColumn({ name: 'contenido_id' })
  contenido: Contenido;

  @Column()
  contenido_id: number;

  @Column('float')
  puntuacion: number;

  @CreateDateColumn()
  fecha: Date;
}

// ─── Review ──────────────────────────────────────────────────────────────────

@Entity('Review')
@Index('UQ_Review_user_contenido', ['usuario_id', 'contenido_id'], {
  unique: true,
})
@Index('IX_Review_contenido_fecha', ['contenido_id', 'fecha'])
@Index('IX_Review_contenido_votos', ['contenido_id', 'votos'])
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Usuario, { eager: true })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @Column()
  usuario_id: number;

  @ManyToOne(() => Contenido)
  @JoinColumn({ name: 'contenido_id' })
  contenido: Contenido;

  @Column()
  contenido_id: number;

  @Column({ type: 'text' })
  comentario: string;

  @Column('simple-json', { nullable: true })
  imagenes: string[] | null;

  @Column('float', { nullable: true })
  puntuacion: number;

  @Column({ default: false })
  es_spoiler: boolean;

  @Column({ default: 0 })
  votos: number;

  @Column({ default: false })
  featured: boolean;

  @CreateDateColumn()
  fecha: Date;
}

// ─── ReviewVersion (histórico al editar) ───────────────────────────────────────

@Entity('ReviewVersion')
@Index('IX_ReviewVersion_review_fecha', ['review_id', 'fecha'])
export class ReviewVersion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  review_id: number;

  @ManyToOne(() => Review, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'review_id' })
  review: Review;

  @Column({ type: 'text' })
  comentario: string;

  @Column('simple-json', { nullable: true })
  imagenes: string[] | null;

  @Column('float', { nullable: true })
  puntuacion: number | null;

  @Column({ default: false })
  es_spoiler: boolean;

  @CreateDateColumn({ type: 'datetime2' })
  fecha: Date;
}

// ─── ReviewReport (moderación) ───────────────────────────────────────────────

@Entity('ReviewReport')
@Index('IX_ReviewReport_fecha', ['fecha'])
@Index('UQ_ReviewReport_review_reporter', ['review_id', 'reporter_id'], {
  unique: true,
})
export class ReviewReport {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  review_id: number;

  @ManyToOne(() => Review, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'review_id' })
  review: Review;

  @Column()
  reporter_id: number;

  @ManyToOne(() => Usuario, { onDelete: 'NO ACTION' })
  @JoinColumn({ name: 'reporter_id' })
  reporter: Usuario;

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  motivo: string | null;

  @CreateDateColumn({ type: 'datetime2' })
  fecha: Date;

  @Column({ default: false })
  resuelto: boolean;

  @Column({ type: 'datetime2', nullable: true })
  resuelto_en: Date | null;
}

// ─── UserReport (moderación: perfil de usuario) ──────────────────────────────

@Entity('UserReport')
@Index('IX_UserReport_fecha', ['fecha'])
@Index('IX_UserReport_resuelto_fecha', ['resuelto', 'fecha'])
@Index('UQ_UserReport_reported_reporter', ['reported_user_id', 'reporter_id'], {
  unique: true,
})
export class UserReport {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  reported_user_id: number;

  @ManyToOne(() => Usuario, { onDelete: 'NO ACTION' })
  @JoinColumn({ name: 'reported_user_id' })
  reported_user: Usuario;

  @Column()
  reporter_id: number;

  @ManyToOne(() => Usuario, { onDelete: 'NO ACTION' })
  @JoinColumn({ name: 'reporter_id' })
  reporter: Usuario;

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  motivo: string | null;

  @CreateDateColumn({ type: 'datetime2' })
  fecha: Date;

  @Column({ default: false })
  resuelto: boolean;

  @Column({ type: 'datetime2', nullable: true })
  resuelto_en: Date | null;
}

// ─── ReviewVoto ───────────────────────────────────────────────────────────────

@Entity('ReviewVoto')
@Index('UQ_ReviewVoto_review_user', ['review_id', 'usuario_id'], {
  unique: true,
})
export class ReviewVoto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  review_id: number;

  @Column()
  usuario_id: number;
}

// ─── ReviewRespuesta ─────────────────────────────────────────────────────────

@Entity('ReviewRespuesta')
@Index('IX_ReviewRespuesta_review_fecha', ['review_id', 'fecha'])
export class ReviewRespuesta {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  review_id: number;

  @ManyToOne(() => Review, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'review_id' })
  review: Review;

  @Column()
  usuario_id: number;

  @ManyToOne(() => Usuario, { eager: true })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @Column({ type: 'text' })
  comentario: string;

  @CreateDateColumn()
  fecha: Date;
}

// ─── ListaItem ───────────────────────────────────────────────────────────────

export const LISTA_ESTADOS = [
  'viendo',
  'completado',
  'planificado',
  'en_pausa',
  'abandonado',
] as const;
export type ListaEstado = (typeof LISTA_ESTADOS)[number];

@Entity('ListaItem')
@Index('UQ_ListaItem_user_contenido', ['usuario_id', 'contenido_id'], {
  unique: true,
})
@Index('IX_ListaItem_user_estado', ['usuario_id', 'estado'])
export class ListaItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @Column()
  usuario_id: number;

  @ManyToOne(() => Contenido, { eager: true })
  @JoinColumn({ name: 'contenido_id' })
  contenido: Contenido;

  @Column()
  contenido_id: number;

  @Column({ length: 20 })
  estado: string;

  @Column({ nullable: true })
  progreso: number;

  @Column({ type: 'text', nullable: true })
  nota_personal: string;

  @Column({ length: 50, nullable: true })
  last_known_status: string;

  @Column({ nullable: true })
  last_known_episodes: number;

  @Column({ type: 'datetime2', nullable: true })
  last_synced_at: Date;

  @UpdateDateColumn()
  fecha_actualizado: Date;
}

// ─── Notificacion ────────────────────────────────────────────────────────────

@Entity('Notificacion')
@Index('IX_Notificacion_user_leida_fecha', ['usuario_id', 'leida', 'fecha'])
export class Notificacion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  usuario_id: number;

  /** voto_review | nuevo_episodio | lista_inicio | mencion_review | mencion_respuesta */
  @Column({ length: 30 })
  tipo: string;

  @Column({ type: 'text' })
  mensaje: string;

  @Column({ default: false })
  leida: boolean;

  /** ID del recurso relacionado (review_id, contenido_id…) */
  @Column({ nullable: true })
  referencia_id: number;

  @CreateDateColumn()
  fecha: Date;
}

@Entity('PushSubscription')
@Index('IX_PushSubscription_usuario', ['usuario_id'])
@Index('IX_PushSubscription_endpoint', ['endpoint'])
export class PushSubscription {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  usuario_id: number;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @Column({ type: 'nvarchar', length: 2048 })
  endpoint: string;

  @Column({ type: 'nvarchar', length: 512 })
  p256dh: string;

  @Column({ type: 'nvarchar', length: 256 })
  auth: string;

  @CreateDateColumn()
  created_at: Date;
}

// ─── Favorito ────────────────────────────────────────────────────────────────

@Entity('Favorito')
@Index('UQ_Favorito_user_contenido', ['usuario_id', 'contenido_id'], {
  unique: true,
})
export class Favorito {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @Column()
  usuario_id: number;

  @ManyToOne(() => Contenido, { eager: true })
  @JoinColumn({ name: 'contenido_id' })
  contenido: Contenido;

  @Column()
  contenido_id: number;
}

// ─── Lista Personalizada ─────────────────────────────────────────────────────

@Entity('ListaPersonalizada')
@Index('IX_ListaPersonalizada_user', ['usuario_id'])
export class ListaPersonalizada {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  usuario_id: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @Column({ length: 100 })
  nombre: string;

  @Column({ length: 100, unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ nullable: true, length: 500 })
  imagen_portada: string;

  @Column({ default: true })
  publica: boolean;

  @CreateDateColumn()
  fecha_creada: Date;

  @UpdateDateColumn()
  fecha_actualizada: Date;
}

@Entity('ListaPersonalizada_Contenido')
@Index('UQ_LPC_lista_contenido', ['lista_id', 'contenido_id'], { unique: true })
export class ListaPersonalizadaContenido {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  lista_id: number;

  @ManyToOne(() => ListaPersonalizada, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lista_id' })
  lista: ListaPersonalizada;

  @Column()
  contenido_id: number;

  @ManyToOne(() => Contenido, { eager: true })
  @JoinColumn({ name: 'contenido_id' })
  contenido: Contenido;

  @Column({ default: 0 })
  orden: number;

  @Column({ type: 'text', nullable: true })
  nota: string;

  @CreateDateColumn()
  fecha_agregado: Date;
}

// ─── PasswordResetToken ──────────────────────────────────────────────────────

@Entity('PasswordResetToken')
export class PasswordResetToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  usuario_id: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @Column({ length: 100, unique: true })
  token: string;

  @Column()
  expires_at: Date;

  @Column({ default: false })
  used: boolean;

  @CreateDateColumn()
  fecha_creado: Date;
}

// ─── Sesion ──────────────────────────────────────────────────────────────────

@Entity('Sesion')
@Index('IX_Sesion_user_revoked', ['usuario_id', 'revoked_at'])
export class Sesion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  usuario_id: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @Column({ length: 64, unique: true })
  jti: string;

  @Column({ length: 500, nullable: true })
  user_agent: string;

  @Column({ length: 64, nullable: true })
  ip: string;

  @CreateDateColumn()
  created_at: Date;

  @Column({ type: 'datetime2', nullable: true })
  last_used_at: Date;

  @Column({ type: 'datetime2', nullable: true })
  revoked_at: Date;

  @Column({ length: 100, nullable: true })
  refresh_hash: string;

  @Column({ type: 'datetime2', nullable: true })
  refresh_expires_at: Date;
}

// ─── Seguimiento ─────────────────────────────────────────────────────────────

// ─── OAuthAccount ────────────────────────────────────────────────────────────

@Entity('OAuthAccount')
@Index('UQ_OAuth_provider_uid', ['provider', 'provider_user_id'], {
  unique: true,
})
@Index('IX_OAuth_user', ['usuario_id'])
export class OAuthAccount {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 30 })
  provider: string; // google | discord | github

  @Column({ length: 100 })
  provider_user_id: string;

  @Column()
  usuario_id: number;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @Column({ length: 200, nullable: true })
  email: string;

  @CreateDateColumn()
  created_at: Date;
}

// ─── Personaje + VoiceActor ──────────────────────────────────────────────────

@Entity('Personaje')
export class Personaje {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  mal_id: number;

  @Column({ length: 200 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  about: string;

  @Column({ type: 'text', nullable: true })
  imagen: string;
}

@Entity('VoiceActor')
export class VoiceActor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  mal_id: number;

  @Column({ length: 200 })
  nombre: string;

  @Column({ length: 30, nullable: true })
  idioma: string;

  @Column({ type: 'text', nullable: true })
  imagen: string;
}

@Entity('ContenidoPersonaje')
@Index('UQ_CP_contenido_personaje', ['contenido_id', 'personaje_id'], {
  unique: true,
})
@Index('IX_CP_contenido_orden', ['contenido_id', 'orden'])
export class ContenidoPersonaje {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  contenido_id: number;

  @ManyToOne(() => Contenido, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'contenido_id' })
  contenido: Contenido;

  @Column()
  personaje_id: number;

  @ManyToOne(() => Personaje, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'personaje_id' })
  personaje: Personaje;

  @Column({ length: 30, nullable: true })
  rol: string; // Main, Supporting

  @Column({ default: 0 })
  orden: number;
}

@Entity('FavoritoPersonaje')
@Index('UQ_FavPersonaje_user', ['usuario_id', 'personaje_id'], { unique: true })
export class FavoritoPersonaje {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  usuario_id: number;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @Column()
  personaje_id: number;

  @ManyToOne(() => Personaje, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'personaje_id' })
  personaje: Personaje;

  @CreateDateColumn()
  fecha: Date;
}

@Entity('PersonajeVoiceActor')
@Index('UQ_PVA_personaje_va', ['personaje_id', 'voice_actor_id'], {
  unique: true,
})
export class PersonajeVoiceActor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  personaje_id: number;

  @ManyToOne(() => Personaje, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'personaje_id' })
  personaje: Personaje;

  @Column()
  voice_actor_id: number;

  @ManyToOne(() => VoiceActor, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'voice_actor_id' })
  voice_actor: VoiceActor;
}

@Entity('Seguimiento')
@Index('UQ_Seguimiento_pair', ['seguidor_id', 'seguido_id'], { unique: true })
@Index('IX_Seguimiento_seguidor_fecha', ['seguidor_id', 'fecha'])
@Index('IX_Seguimiento_seguido', ['seguido_id'])
export class Seguimiento {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  seguidor_id: number;

  @Column()
  seguido_id: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'seguidor_id' })
  seguidor: Usuario;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'seguido_id' })
  seguido: Usuario;

  @CreateDateColumn()
  fecha: Date;
}
