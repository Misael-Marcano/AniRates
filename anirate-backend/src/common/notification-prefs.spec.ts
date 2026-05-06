import {
  mergeNotificationPrefs,
  notificationChannelEnabled,
  effectiveTipoChannelsGrid,
  parseFullTipoChannelsPatch,
} from './notification-prefs';

describe('notification-prefs', () => {
  it('defaults: in_app on, mention email from email_mentions, push from master', () => {
    const m = mergeNotificationPrefs({
      email_mentions: true,
      email_weekly_digest: false,
      push_in_app_browser: false,
    });
    expect(notificationChannelEnabled(m, 'voto_review', 'in_app')).toBe(true);
    expect(notificationChannelEnabled(m, 'mencion_review', 'email')).toBe(
      true,
    );
    expect(notificationChannelEnabled(m, 'voto_review', 'push')).toBe(false);
    m.push_in_app_browser = true;
    expect(notificationChannelEnabled(m, 'lista_inicio', 'push')).toBe(true);
  });

  it('per-tipo overrides', () => {
    const m = mergeNotificationPrefs({
      email_mentions: true,
      push_in_app_browser: true,
      tipo_channels: {
        voto_review: { in_app: false, push: false },
        mencion_review: { email: false },
      },
    });
    expect(notificationChannelEnabled(m, 'voto_review', 'in_app')).toBe(false);
    expect(notificationChannelEnabled(m, 'voto_review', 'push')).toBe(false);
    expect(notificationChannelEnabled(m, 'mencion_review', 'email')).toBe(
      false,
    );
    expect(notificationChannelEnabled(m, 'mencion_respuesta', 'email')).toBe(
      true,
    );
  });

  it('effectiveTipoChannelsGrid returns 5 keys', () => {
    const g = effectiveTipoChannelsGrid(mergeNotificationPrefs(null));
    expect(Object.keys(g)).toHaveLength(5);
    expect(g.voto_review.in_app).toBe(true);
  });

  it('parseFullTipoChannelsPatch validates shape', () => {
    const ok = parseFullTipoChannelsPatch({
      voto_review: { in_app: true, email: false, push: false },
      nuevo_episodio: { in_app: true, email: false, push: true },
      lista_inicio: { in_app: true, email: false, push: true },
      mencion_review: { in_app: true, email: true, push: false },
      mencion_respuesta: { in_app: true, email: true, push: false },
    });
    expect(ok?.voto_review.push).toBe(false);
    expect(() => parseFullTipoChannelsPatch({})).toThrow();
  });
});
