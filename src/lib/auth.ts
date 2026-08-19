import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * Authentification admin par mot de passe unique (variable d'env
 * `ADMIN_PASSWORD`). Aucune DB, aucun compte : la « session » est un cookie
 * signé par HMAC-SHA256 dérivé du mot de passe. Si le mot de passe change,
 * les sessions existantes deviennent invalides (le HMAC ne correspond plus).
 *
 * Ce module est réservé au serveur (`server-only`) : la valeur du mot de
 * passe ne fuite jamais côté navigateur.
 */

const COOKIE_NAME = "wb_admin";
const SESSION_MAX_AGE = 60 * 60 * 12; // 12 h
const SIGNATURE_PAYLOAD = "waraba-admin-session";

function getAdminPassword(): string | undefined {
  return process.env.ADMIN_PASSWORD;
}

/** Empreinte attendue du cookie de session (HMAC du mot de passe). */
function expectedSignature(): string | null {
  const password = getAdminPassword();
  if (!password) return null;
  return createHmac("sha256", password).update(SIGNATURE_PAYLOAD).digest("hex");
}

/** Vérifie qu'un mot de passe candidat correspond à `ADMIN_PASSWORD`. */
export function verifyPassword(candidate: string): boolean {
  const password = getAdminPassword();
  if (!password) return false;
  try {
    const a = Buffer.from(password);
    const b = Buffer.from(candidate);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/**
 * Indique si la requête courante provient d'un admin authentifié.
 * À appeler dans une Server Component ou une Server Action (lit les cookies).
 */
export async function isAdmin(): Promise<boolean> {
  const expected = expectedSignature();
  if (!expected) return false; // ADMIN_PASSWORD absent → pas d'admin possible.

  const cookieStore = await cookies();
  const value = cookieStore.get(COOKIE_NAME)?.value;
  if (!value) return false;

  try {
    const a = Buffer.from(expected);
    const b = Buffer.from(value);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/**
 * Pose le cookie de session admin. À appeler uniquement depuis une Server
 * Action (les écritures de cookies ne sont pas autorisées pendant le rendu
 * d'une Server Component).
 */
export async function createAdminSession(): Promise<void> {
  const signature = expectedSignature();
  if (!signature) {
    throw new Error("ADMIN_PASSWORD non configuré — impossible de créer la session.");
  }
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, signature, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

/** Supprime le cookie de session (déconnexion). Server Action uniquement. */
export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export { COOKIE_NAME as ADMIN_COOKIE_NAME };