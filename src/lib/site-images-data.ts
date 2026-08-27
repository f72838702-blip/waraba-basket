import "server-only";
import { cache } from "react";
import { isSupabaseConfigured, supabaseServer } from "@/lib/supabase-server";
import type { SiteImageKey } from "@/lib/site-images";

/**
 * Accès serveur à la table `site_images` (remplacements d'images de l'accueil).
 * Si la table n'existe pas encore (migration non exécutée), toutes les
 * lectures renvoient {} : le site retombe sur les images par défaut.
 */

type SiteImageRow = {
  key: string;
  image_url: string;
  updated_at: string;
};

/** Remplacements actifs, indexés par clé (cache par requête). */
export const getSiteImageOverrides = cache(
  async (): Promise<Partial<Record<SiteImageKey, string>>> => {
    if (!isSupabaseConfigured) return {};
    const { data, error } = await supabaseServer
      .from("site_images")
      .select("key, image_url");
    if (error) {
      console.warn(
        "[Matam Waraba] site_images indisponible (migration à exécuter ?) —",
        error.message
      );
      return {};
    }
    const overrides: Partial<Record<SiteImageKey, string>> = {};
    for (const row of (data ?? []) as SiteImageRow[]) {
      overrides[row.key as SiteImageKey] = row.image_url;
    }
    return overrides;
  }
);

/** URL actuellement enregistrée pour un slot (null = pas de remplacement). */
export async function getSiteImageUrl(key: SiteImageKey): Promise<string | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabaseServer
    .from("site_images")
    .select("image_url")
    .eq("key", key)
    .maybeSingle();
  if (error) {
    console.warn("[Matam Waraba] lecture site_images impossible —", error.message);
    return null;
  }
  return (data as SiteImageRow | null)?.image_url ?? null;
}

/** Enregistre (ou remplace) l'image d'un slot. */
export async function setSiteImage(
  key: SiteImageKey,
  imageUrl: string
): Promise<{ ok: true } | { error: string }> {
  if (!isSupabaseConfigured) {
    return { error: "Supabase n'est pas configuré — enregistrement impossible." };
  }
  const { error } = await supabaseServer
    .from("site_images")
    .upsert({ key, image_url: imageUrl, updated_at: new Date().toISOString() });
  if (error) {
    console.warn("[Matam Waraba] setSiteImage: erreur —", error.message);
    return { error: error.message };
  }
  return { ok: true };
}

/** Supprime le remplacement d'un slot (retour à l'image par défaut). */
export async function deleteSiteImage(
  key: SiteImageKey
): Promise<{ ok: true } | { error: string }> {
  if (!isSupabaseConfigured) {
    return { error: "Supabase n'est pas configuré — suppression impossible." };
  }
  const { error } = await supabaseServer
    .from("site_images")
    .delete()
    .eq("key", key);
  if (error) {
    console.warn("[Matam Waraba] deleteSiteImage: erreur —", error.message);
    return { error: error.message };
  }
  return { ok: true };
}
