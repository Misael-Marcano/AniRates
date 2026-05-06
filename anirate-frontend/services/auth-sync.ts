/** Same-tab invalidación cuando api.ts borra tokens (p. ej. refresh fallido). */
export const AUTH_INVALIDATE_EVENT = "anirate-auth-invalidate";

export function notifyAuthInvalidated(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(AUTH_INVALIDATE_EVENT));
}
