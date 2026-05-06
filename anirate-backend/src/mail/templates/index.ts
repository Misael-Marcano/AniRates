interface TemplateContext {
  appName: string;
  frontendUrl: string;
  nombre?: string;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const wrap = (title: string, body: string) => `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#0f0f0f;font-family:Inter,Arial,sans-serif;color:#e8e8e8;">
  <div style="max-width:560px;margin:0 auto;padding:32px 24px;">
    <div style="font-size:24px;font-weight:800;color:#f5c518;margin-bottom:24px;">AniRate</div>
    <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px;padding:32px;">
      ${body}
    </div>
    <p style="font-size:12px;color:#777;margin-top:24px;text-align:center;">
      © AniRate · Si no esperabas este correo, ignóralo.
    </p>
  </div>
</body>
</html>`;

const button = (href: string, label: string) => `
  <a href="${href}" style="display:inline-block;background:#f5c518;color:#0f0f0f;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:700;font-size:14px;">
    ${label}
  </a>`;

function emailOptionalFooterHtml(frontendUrl: string, unsubscribeUrl?: string): string {
  if (!unsubscribeUrl) return '';
  const base = frontendUrl.replace(/\/$/, '');
  const cfg = `${base}/configuracion`;
  return `<p style="font-size:11px;color:#666;margin-top:28px;line-height:1.45;">
<a href="${unsubscribeUrl}" style="color:#888;">No enviar más correos como este</a>
 · <a href="${cfg}" style="color:#888;">Preferencias</a>
</p>`;
}

export function welcomeEmail(ctx: TemplateContext) {
  return {
    subject: `Bienvenido a ${ctx.appName}`,
    html: wrap(
      `Bienvenido a ${ctx.appName}`,
      `<h1 style="font-size:22px;color:#fff;margin:0 0 12px;">¡Hola ${ctx.nombre ?? ''}!</h1>
       <p style="line-height:1.5;margin:0 0 20px;">Tu cuenta en <strong>${ctx.appName}</strong> está lista. Empieza calificando tus animes y mangas favoritos.</p>
       ${button(ctx.frontendUrl, 'Explorar AniRate')}`,
    ),
    text: `¡Hola ${ctx.nombre ?? ''}! Tu cuenta en ${ctx.appName} está lista. Empieza en ${ctx.frontendUrl}`,
  };
}

export function verifyEmail(ctx: TemplateContext & { token: string }) {
  const url = `${ctx.frontendUrl}/verificar-email/${ctx.token}`;
  return {
    subject: `Verifica tu email en ${ctx.appName}`,
    html: wrap(
      'Verifica tu email',
      `<h1 style="font-size:22px;color:#fff;margin:0 0 12px;">Confirma tu email</h1>
       <p style="line-height:1.5;margin:0 0 20px;">Haz clic para activar tu cuenta. El enlace expira en 24 horas.</p>
       ${button(url, 'Verificar email')}
       <p style="font-size:12px;color:#888;margin-top:20px;word-break:break-all;">O copia esta URL: ${url}</p>`,
    ),
    text: `Verifica tu email: ${url}`,
  };
}

/** Aviso transaccional: mención en review o respuesta (respeta prefs usuario en capa MailService llamador). */
export function mentionNoticeEmail(
  ctx: TemplateContext & {
    authorName: string;
    messageLine: string;
    ctaUrl: string;
    ctaLabel: string;
    unsubscribeUrl?: string;
  },
) {
  const author = escapeHtml(ctx.authorName);
  const line = escapeHtml(ctx.messageLine);
  const unsubHtml = emailOptionalFooterHtml(ctx.frontendUrl, ctx.unsubscribeUrl);
  const unsubTxt = ctx.unsubscribeUrl ? `\n\nNo enviar más: ${ctx.unsubscribeUrl}` : '';
  return {
    subject: `${ctx.authorName} te mencionó en ${ctx.appName}`,
    html: wrap(
      'Te mencionaron',
      `<h1 style="font-size:22px;color:#fff;margin:0 0 12px;">Te mencionaron</h1>
       <p style="line-height:1.55;margin:0 0 8px;"><strong>${author}</strong></p>
       <p style="line-height:1.55;margin:0 0 20px;color:#ccc;">${line}</p>
       ${button(ctx.ctaUrl, ctx.ctaLabel)}
       ${unsubHtml}`,
    ),
    text: `${ctx.messageLine}\n\n${ctx.ctaLabel}: ${ctx.ctaUrl}${unsubTxt}`,
  };
}

export function newLoginAlertEmail(
  ctx: TemplateContext & { ip: string; uaHint: string },
) {
  const ip = escapeHtml(ctx.ip);
  const ua = escapeHtml(ctx.uaHint);
  const nombreEsc = ctx.nombre ? escapeHtml(ctx.nombre) : '';
  const cfg = `${ctx.frontendUrl.replace(/\/$/, '')}/configuracion`;
  return {
    subject: `Nuevo inicio de sesión en ${ctx.appName}`,
    html: wrap(
      'Nueva sesión',
      `<h1 style="font-size:22px;color:#fff;margin:0 0 12px;">Nuevo inicio de sesión</h1>
       <p style="line-height:1.55;color:#ccc;margin:0 0 12px;">Hola${nombreEsc ? ` ${nombreEsc}` : ''}, detectamos un acceso desde una ubicación o dispositivo distinto a tus sesiones recientes.</p>
       <p style="line-height:1.55;color:#ddd;margin:0 0 8px;"><strong>IP:</strong> ${ip}</p>
       <p style="line-height:1.55;color:#ddd;margin:0 0 20px;font-size:0.85rem;word-break:break-word;"><strong>Navegador:</strong> ${ua}</p>
       <p style="line-height:1.55;color:#aaa;margin:0 0 20px;font-size:0.82rem;">Si no fuiste tú, cambia tu contraseña y revisa dispositivos conectados.</p>
       ${button(cfg, 'Ir a configuración')}`,
    ),
    text: `Nuevo inicio de sesión en ${ctx.appName}. IP: ${ctx.ip}. Dispositivo: ${ctx.uaHint}. Si no fuiste tú: ${cfg}`,
  };
}

export function weeklyDigestEmail(
  ctx: TemplateContext & {
    recipientNombre?: string;
    followerNames: string[];
    reviews: {
      contenidoTitulo: string;
      autorNombre: string;
      votos: number;
      url: string;
    }[];
    recommendations?: { titulo: string; url: string }[];
    unsubscribeUrl?: string;
    communityMetrics?: { reviewsPublished: number; newFollows: number };
    digestTimezone?: string;
    digestGeneratedAtLabel?: string;
  },
) {
  const name = ctx.recipientNombre ? escapeHtml(ctx.recipientNombre) : '';
  let htmlBody = `<h1 style="font-size:22px;color:#fff;margin:0 0 12px;">Tu resumen semanal</h1>
       <p style="line-height:1.55;color:#ccc;margin:0 0 12px;">Hola${name ? ` ${name}` : ''}, esto pasó en <strong>${escapeHtml(ctx.appName)}</strong> en los últimos 7 días.</p>`;

  const tzFoot =
    ctx.digestGeneratedAtLabel && ctx.digestTimezone
      ? `<p style="font-size:0.82rem;line-height:1.5;color:#888;margin:0 0 18px;">Ventana de datos: últimos 7 días (UTC). Generado el <strong>${escapeHtml(ctx.digestGeneratedAtLabel)}</strong> · zona <strong>${escapeHtml(ctx.digestTimezone)}</strong>.</p>`
      : `<p style="font-size:0.82rem;line-height:1.5;color:#888;margin:0 0 18px;">Ventana de datos: últimos 7 días (UTC).</p>`;
  htmlBody += tzFoot;

  const pulse = ctx.communityMetrics;
  if (
    pulse &&
    (pulse.reviewsPublished > 0 || pulse.newFollows > 0)
  ) {
    htmlBody += `<h2 style="font-size:16px;color:#f5c518;margin:20px 0 12px;">Pulso de la comunidad</h2>
       <ul style="margin:0;padding-left:20px;line-height:1.65;color:#e8e8e8;">
       ${pulse.reviewsPublished > 0 ? `<li>${pulse.reviewsPublished} reviews nuevas en la plataforma</li>` : ''}
       ${pulse.newFollows > 0 ? `<li>${pulse.newFollows} nuevos seguimientos entre usuarios</li>` : ''}
       </ul>`;
  }

  if (ctx.followerNames.length > 0) {
    htmlBody += `<h2 style="font-size:16px;color:#f5c518;margin:24px 0 12px;">Nuevos seguidores</h2>
       <ul style="margin:0;padding-left:20px;line-height:1.65;color:#e8e8e8;">`;
    for (const n of ctx.followerNames.slice(0, 15)) {
      htmlBody += `<li>${escapeHtml(n)}</li>`;
    }
    htmlBody += '</ul>';
  }

  if (ctx.reviews.length > 0) {
    htmlBody += `<h2 style="font-size:16px;color:#f5c518;margin:24px 0 12px;">Reviews destacadas</h2>`;
    for (const r of ctx.reviews) {
      const ct = escapeHtml(r.contenidoTitulo);
      const au = escapeHtml(r.autorNombre);
      htmlBody += `<p style="line-height:1.55;margin:0 0 14px;color:#ddd;"><strong>${ct}</strong> · ${au} · ${r.votos} votos<br/>
         <a href="${r.url}" style="color:#64b5f6;">Ver contenido</a></p>`;
    }
  }

  const recos = ctx.recommendations ?? [];
  if (recos.length > 0) {
    htmlBody += `<h2 style="font-size:16px;color:#f5c518;margin:24px 0 12px;">Recomendado para ti</h2>
       <p style="line-height:1.55;color:#bbb;margin:0 0 12px;font-size:0.9rem;">Basado en tus gustos y lo que ve la comunidad.</p>`;
    for (const rec of recos) {
      const t = escapeHtml(rec.titulo);
      htmlBody += `<p style="line-height:1.55;margin:0 0 12px;color:#ddd;"><strong>${t}</strong><br/>
         <a href="${rec.url}" style="color:#64b5f6;">Ver ficha</a></p>`;
    }
  }

  htmlBody += `<div style="margin-top:28px;">${button(ctx.frontendUrl, 'Abrir AniRate')}</div>`;
  htmlBody += emailOptionalFooterHtml(ctx.frontendUrl, ctx.unsubscribeUrl);

  const lines: string[] = [`Tu resumen semanal — ${ctx.appName}`, ''];
  if (ctx.recipientNombre) lines.push(`Hola ${ctx.recipientNombre},`);
  lines.push('');
  lines.push('Ventana de datos: últimos 7 días (UTC).');
  if (ctx.digestGeneratedAtLabel && ctx.digestTimezone) {
    lines.push(
      `Generado el ${ctx.digestGeneratedAtLabel} (${ctx.digestTimezone}).`,
    );
  }
  lines.push('');
  if (
    pulse &&
    (pulse.reviewsPublished > 0 || pulse.newFollows > 0)
  ) {
    lines.push('Pulso de la comunidad:');
    if (pulse.reviewsPublished > 0)
      lines.push(`- ${pulse.reviewsPublished} reviews nuevas en la plataforma`);
    if (pulse.newFollows > 0)
      lines.push(`- ${pulse.newFollows} nuevos seguimientos entre usuarios`);
    lines.push('');
  }
  if (ctx.followerNames.length > 0) {
    lines.push(
      'Nuevos seguidores:',
      ...ctx.followerNames.slice(0, 15).map((n) => `- ${n}`),
      '',
    );
  }
  if (ctx.reviews.length > 0) {
    lines.push(
      'Reviews destacadas:',
      ...ctx.reviews.map(
        (r) =>
          `- ${r.contenidoTitulo} — ${r.autorNombre} (${r.votos} votos) ${r.url}`,
      ),
      '',
    );
  }
  if (recos.length > 0) {
    lines.push(
      'Recomendado para ti:',
      ...recos.map((r) => `- ${r.titulo} ${r.url}`),
      '',
    );
  }
  lines.push(`Explora: ${ctx.frontendUrl}`);
  if (ctx.unsubscribeUrl) lines.push('', `No enviar más resúmenes: ${ctx.unsubscribeUrl}`);

  return {
    subject: `Tu resumen semanal — ${ctx.appName}`,
    html: wrap('Resumen semanal', htmlBody),
    text: lines.join('\n'),
  };
}

export function resetPasswordEmail(ctx: TemplateContext & { token: string }) {
  const url = `${ctx.frontendUrl}/resetear-contrasena/${ctx.token}`;
  return {
    subject: `Restablece tu contraseña en ${ctx.appName}`,
    html: wrap(
      'Restablecer contraseña',
      `<h1 style="font-size:22px;color:#fff;margin:0 0 12px;">Restablece tu contraseña</h1>
       <p style="line-height:1.5;margin:0 0 20px;">Recibimos una solicitud para restablecer tu contraseña. El enlace expira en 1 hora.</p>
       ${button(url, 'Cambiar contraseña')}
       <p style="font-size:12px;color:#888;margin-top:20px;">Si no fuiste tú, ignora este correo.</p>`,
    ),
    text: `Restablece tu contraseña: ${url}`,
  };
}
