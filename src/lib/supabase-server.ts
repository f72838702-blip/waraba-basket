import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Client Supabase réservé au serveur (Server Components, route handlers).
 * Utilise la clé service role — secrète et jamais exposée au navigateur.
 * Le guard `server-only` empêche toute importation accidentelle côté client.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Vrai si les variables serveur nécessaires sont renseignées.
 * Permet à `members-data.ts` de basculer sur les données démo en dev.
 */
export const isSupabaseConfigured = Boolean(supabaseUrl && serviceRoleKey);

export const supabaseServer = createClient(
  // URL placeholder quand Supabase n'est pas configuré : createClient rejette
  // une URL vide. Ce client n'est jamais utilisé dans ce cas (gardé par
  // isSupabaseConfigured côté members-data).
  supabaseUrl ?? "https://placeholder.supabase.co",
  serviceRoleKey ?? "placeholder-anon-key",
  {
    auth: { persistSession: false, autoRefreshToken: false },
  }
);