import type { Usuario } from '../database/entities';

/** Values persisted on `Notificacion.tipo` (see entity comment). */
export const NOTIFICATION_TIPOS = [
  'voto_review',
  'nuevo_episodio',
  'lista_inicio',
  'mencion_review',
  'mencion_respuesta',
] as const;

export type NotificationTipo = (typeof NOTIFICATION_TIPOS)[number];

export type NotificationChannel = 'in_app' | 'email' | 'push';

export type TipoChannelPrefs = {
  in_app?: boolean;
  email?: boolean;
  push?: boolean;
};

export type StoredNotificationPrefs = NonNullable<Usuario['notification_prefs']>;

export type MergedNotificationPrefs = {
  email_mentions: boolean;
  email_weekly_digest: boolean;
  digest_timezone?: string;
  push_in_app_browser: boolean;
  tipo_channels?: Partial<Record<NotificationTipo, TipoChannelPrefs>>;
};

export function isNotificationTipo(t: string): t is NotificationTipo {
  return (NOTIFICATION_TIPOS as readonly string[]).includes(t);
}

export function mergeNotificationPrefs(
  raw: Usuario['notification_prefs'] | null | undefined,
): MergedNotificationPrefs {
  return {
    email_mentions: raw?.email_mentions ?? true,
    email_weekly_digest: raw?.email_weekly_digest ?? false,
    digest_timezone: raw?.digest_timezone,
    push_in_app_browser: raw?.push_in_app_browser ?? false,
    tipo_channels: raw?.tipo_channels,
  };
}

/**
 * Effective channel for a notification tipo. Backward compatible when `tipo_channels` is absent.
 */
export function notificationChannelEnabled(
  m: MergedNotificationPrefs,
  tipo: string,
  ch: NotificationChannel,
): boolean {
  const t = isNotificationTipo(tipo) ? tipo : null;
  const row = t ? m.tipo_channels?.[t] : undefined;

  if (ch === 'in_app') {
    if (row && typeof row.in_app === 'boolean') return row.in_app;
    return true;
  }

  if (ch === 'email') {
    if (row && typeof row.email === 'boolean') return row.email;
    if (t === 'mencion_review' || t === 'mencion_respuesta') {
      return m.email_mentions;
    }
    return false;
  }

  if (!m.push_in_app_browser) return false;
  if (row && typeof row.push === 'boolean') return row.push;
  return true;
}

export type EffectiveTipoChannelRow = {
  in_app: boolean;
  email: boolean;
  push: boolean;
};

/** Full grid for API/UI (resolved defaults + overrides). */
export function effectiveTipoChannelsGrid(
  m: MergedNotificationPrefs,
): Record<NotificationTipo, EffectiveTipoChannelRow> {
  const out = {} as Record<NotificationTipo, EffectiveTipoChannelRow>;
  for (const tipo of NOTIFICATION_TIPOS) {
    out[tipo] = {
      in_app: notificationChannelEnabled(m, tipo, 'in_app'),
      email: notificationChannelEnabled(m, tipo, 'email'),
      push: notificationChannelEnabled(m, tipo, 'push'),
    };
  }
  return out;
}

type FullTipoChannels = Record<
  NotificationTipo,
  { in_app: boolean; email: boolean; push: boolean }
>;

/** Validates PATCH body: full grid, all booleans. */
export function parseFullTipoChannelsPatch(
  input: unknown,
): FullTipoChannels | undefined {
  if (input === undefined) return undefined;
  if (input === null) return undefined;
  if (typeof input !== 'object' || Array.isArray(input)) {
    throw new Error('tipo_channels debe ser un objeto');
  }
  const o = input as Record<string, unknown>;
  const keys = Object.keys(o);
  if (keys.length !== NOTIFICATION_TIPOS.length) {
    throw new Error(
      'tipo_channels debe incluir exactamente un objeto por cada tipo de notificación',
    );
  }
  const result = {} as FullTipoChannels;
  for (const tipo of NOTIFICATION_TIPOS) {
    if (!(tipo in o)) {
      throw new Error(`Falta tipo_channels.${tipo}`);
    }
    const v = o[tipo];
    if (typeof v !== 'object' || v === null || Array.isArray(v)) {
      throw new Error(`tipo_channels.${tipo} inválido`);
    }
    const row = v as Record<string, unknown>;
    for (const k of ['in_app', 'email', 'push'] as const) {
      if (typeof row[k] !== 'boolean') {
        throw new Error(`tipo_channels.${tipo}.${k} debe ser booleano`);
      }
    }
    result[tipo] = {
      in_app: row.in_app as boolean,
      email: row.email as boolean,
      push: row.push as boolean,
    };
  }
  for (const k of keys) {
    if (!isNotificationTipo(k)) {
      throw new Error(`tipo de notificación desconocido: ${k}`);
    }
  }
  return result;
}
