import { createClient } from "@supabase/supabase-js";

/**
 * Client Supabase navigateur (côté client).
 * Utilise les variables d'environnement publiques (exposées au navigateur).
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // On évite un crash en dev tant que les variables ne sont pas renseignées.
  if (process.env.NODE_ENV !== "production") {
    console.warn(
      "[Matam Waraba] Variables Supabase manquantes : renseignez NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY dans .env.local"
    );
  }
}

export const supabase = createClient(
  supabaseUrl ?? "",
  supabaseAnonKey ?? "",
  {
    auth: { persistSession: true },
  }
);