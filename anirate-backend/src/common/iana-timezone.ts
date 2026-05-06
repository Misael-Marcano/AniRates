/** Valida zona IANA para uso en Intl (digest / UI). */
export function isValidIanaTimezone(tz: string): boolean {
  if (!tz || tz.length > 64) return false;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/** Texto localizado (es) para pie de digest; fallback UTC si la zona es inválida. */
export function formatDigestLocalizedTimestamp(date: Date, timeZone: string): string {
  const tz = isValidIanaTimezone(timeZone) ? timeZone : 'UTC';
  return new Intl.DateTimeFormat('es', {
    timeZone: tz,
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(date);
}
