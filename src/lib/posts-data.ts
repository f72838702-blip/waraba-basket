import "server-only";
import { cache } from "react";
import { supabaseServer, isSupabaseConfigured } from "@/lib/supabase-server";
import { deleteMemberPhoto } from "@/lib/members-data";
import type { Post, PostCategory } from "@/types/post";

/**
 * Accès aux articles (posts) via Supabase, côté serveur uniquement.
 * - La lecture publique (accueil) ne renvoie que les articles publiés.
 * - L'écriture est réservée aux server actions admin (gardées par isAdmin).
 * - Si Supabase n'est pas configuré ou si la table est absente (migration
 *   non exécutée), on renvoie [] proprement : l'accueil masque la section.
 *
 * Les images réutilisent le bucket « members-photos » + les helpers
 * upload/delete de members-data.ts (même règles mime / 4 Mo).
 */

export type PostInput = {
  title: string;
  category: PostCategory;
  excerpt: string;
  content: string | null;
  image_url: string | null;
  event_date: string | null;
  published: boolean;
};

type PostRow = {
  id: string;
  created_at: string;
  updated_at: string | null;
  title: string;
  category: PostCategory;
  excerpt: string;
  content: string | null;
  image_url: string | null;
  event_date: string | null;
  published: boolean | null;
};

function toPost(row: PostRow): Post {
  return {
    id: row.id,
    created_at: row.created_at,
    title: row.title,
    category: row.category,
    excerpt: row.excerpt,
    content: row.content,
    image_url: row.image_url,
    event_date: row.event_date,
    published: row.published ?? true,
  };
}

/** Articles publiés pour la page d'accueil (les plus récents d'abord). */
export const getPublishedPosts = cache(async (limit = 6): Promise<Post[]> => {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabaseServer
    .from("posts")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error || !data) {
    // Table absente (migration non exécutée) ou erreur → section masquée.
    console.warn("[Matam Waraba] getPublishedPosts:", error?.message);
    return [];
  }
  return (data as PostRow[]).map(toPost);
});

/** Tous les articles (back-office), plus récents d'abord. */
export const getAllPosts = cache(async (): Promise<Post[]> => {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabaseServer
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });
  if (error || !data) {
    console.warn("[Matam Waraba] getAllPosts:", error?.message);
    return [];
  }
  return (data as PostRow[]).map(toPost);
});

/** Un article par id (page d'édition admin). */
export async function getPostById(id: string): Promise<Post | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabaseServer
    .from("posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return toPost(data as PostRow);
}

/** Insère un article. L'appelant (server action) valide les champs. */
export async function insertPost(
  input: PostInput
): Promise<{ ok: true; id: string } | { error: string }> {
  if (!isSupabaseConfigured) {
    return { error: "Supabase n'est pas configuré — création impossible." };
  }
  const { data, error } = await supabaseServer
    .from("posts")
    .insert(input)
    .select("id")
    .single();
  if (error) {
    console.error("[Matam Waraba] insertPost:", error.message);
    return { error: error.message };
  }
  return { ok: true, id: data.id as string };
}

/** Met à jour un article (l'image finale est calculée par l'action). */
export async function updatePost(
  id: string,
  input: PostInput
): Promise<{ ok: true } | { error: string }> {
  if (!isSupabaseConfigured) {
    return { error: "Supabase n'est pas configuré — mise à jour impossible." };
  }
  const { error } = await supabaseServer
    .from("posts")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) {
    console.error("[Matam Waraba] updatePost:", error.message);
    return { error: error.message };
  }
  return { ok: true };
}

/** Supprime un article + son image Storage (best-effort). */
export async function deletePost(
  id: string
): Promise<{ ok: true } | { error: string }> {
  if (!isSupabaseConfigured) {
    return { error: "Supabase n'est pas configuré — suppression impossible." };
  }
  const { data } = await supabaseServer
    .from("posts")
    .select("image_url")
    .eq("id", id)
    .maybeSingle();
  await deleteMemberPhoto((data?.image_url as string | null) ?? null);

  const { error } = await supabaseServer.from("posts").delete().eq("id", id);
  if (error) {
    console.error("[Matam Waraba] deletePost:", error.message);
    return { error: error.message };
  }
  return { ok: true };
}
