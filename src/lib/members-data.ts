import "server-only";
import { cache } from "react";
import { randomUUID } from "node:crypto";
import type { Member, MemberStatus } from "@/types/member";
import { supabaseServer, isSupabaseConfigured } from "@/lib/supabase-server";
import { DEMO_MEMBERS } from "@/lib/members";

/**
 * Accès aux membres via Supabase (côté serveur uniquement).
 * - Repli sur les données démo si Supabase n'est pas configuré ou si la
 *   requête échoue, afin que le site reste fonctionnel en dev / au build.
 * - `React.cache` déduplique les appels au sein d'une même requête
 *   (generateMetadata + page appellent getMemberById séparément).
 */

type MemberRow = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  role: string | null;
  category: string | null;
  status: MemberStatus | null;
  photo_url: string | null;
  position: string | null;
  shirt_number: number | null;
  height_cm: number | null;
  weight_kg: number | null;
};

function toMember(row: MemberRow): Member {
  return {
    id: row.id,
    first_name: row.first_name ?? "",
    last_name: row.last_name ?? "",
    role: row.role ?? "",
    category: row.category ?? "",
    status: (row.status ?? "inactive") as MemberStatus,
    photo_url: row.photo_url,
    position: row.position,
    shirt_number: row.shirt_number,
    height_cm: row.height_cm,
    weight_kg: row.weight_kg,
  };
}

export const getAllMembers = cache(async (): Promise<Member[]> => {
  if (!isSupabaseConfigured) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[Matam Waraba] Supabase non configuré — getAllMembers utilise les données démo."
      );
    }
    return DEMO_MEMBERS;
  }

  const { data, error } = await supabaseServer
    .from("members")
    .select("*")
    .order("full_name");

  if (error) {
    console.warn("[Matam Waraba] getAllMembers: erreur Supabase —", error.message);
    return [];
  }

  return (data as MemberRow[]).map(toMember);
});

export const getMemberById = cache(async (id: string): Promise<Member | undefined> => {
  if (!isSupabaseConfigured) {
    return DEMO_MEMBERS.find((m) => m.id === id);
  }

  const { data, error } = await supabaseServer
    .from("members")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.warn("[Matam Waraba] getMemberById: erreur Supabase —", error.message);
    return undefined;
  }

  if (!data) {
    // Pas de membre en base pour cet id → undefined → notFound() côté page.
    return undefined;
  }

  return toMember(data as MemberRow);
});

/** Charge utile d'un membre (tous les champs gérés par le back-office). Sert à
 * l'insertion (create) comme à la mise à jour (update). */
export type MemberInput = {
  first_name: string;
  last_name: string;
  role: string;
  category: string;
  status: MemberStatus;
  photo_url: string | null;
  position: string | null;
  shirt_number: number | null;
  height_cm: number | null;
  weight_kg: number | null;
};

/**
 * Insère un nouveau membre côté serveur (client service role, RLS contournée).
 * `full_name` reste obligatoire en base (NOT NULL + index de tri) : on le
 * reconstitue à partir de first_name/last_name même si l'app l'ignore.
 * Retourne l'UUID du membre créé ou une erreur métier.
 */
export async function insertMember(
  input: MemberInput
): Promise<{ id: string } | { error: string }> {
  if (!isSupabaseConfigured) {
    return { error: "Supabase n'est pas configuré — insertion impossible." };
  }

  const full_name = `${input.first_name} ${input.last_name}`.trim();

  const { data, error } = await supabaseServer
    .from("members")
    .insert({
      full_name,
      first_name: input.first_name,
      last_name: input.last_name,
      role: input.role,
      category: input.category,
      status: input.status,
      photo_url: input.photo_url,
      position: input.position,
      shirt_number: input.shirt_number,
      height_cm: input.height_cm,
      weight_kg: input.weight_kg,
    })
    .select("id")
    .single();

  if (error) {
    console.warn("[Matam Waraba] insertMember: erreur Supabase —", error.message);
    return { error: error.message };
  }

  return { id: (data as { id: string }).id };
}

// ---- Upload des photos membre (Supabase Storage) ----

/** Bucket Storage public accueillant les photos de membres. */
export const PHOTOS_BUCKET = "members-photos";
const PHOTO_MAX_BYTES = 4 * 1024 * 1024; // 4 Mo
const PHOTO_ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];

/** Extension de fichier selon le type MIME (défaut : jpg). */
function mimeToExt(mime: string): string {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "jpg";
}

/**
 * Upload d'une photo de membre vers le bucket Storage public, côté serveur
 * (client service role). Retourne l'URL publique à stocker dans `photo_url`,
 * ou une erreur métier. Le fichier doit provenir d'un FormData de Server Action.
 */
export async function uploadMemberPhoto(
  file: File
): Promise<{ url: string } | { error: string }> {
  if (!isSupabaseConfigured) {
    return { error: "Supabase n'est pas configuré — upload impossible." };
  }
  if (!file || file.size === 0) {
    return { error: "Fichier photo vide." };
  }
  if (file.size > PHOTO_MAX_BYTES) {
    return { error: "La photo dépasse 4 Mo." };
  }
  const mime = file.type || "image/jpeg";
  if (!PHOTO_ALLOWED_MIME.includes(mime)) {
    return { error: "Format non supporté (jpg, png ou webp uniquement)." };
  }

  const path = `photo_${randomUUID()}.${mimeToExt(mime)}`;
  const arrayBuffer = await file.arrayBuffer();

  const { error } = await supabaseServer.storage
    .from(PHOTOS_BUCKET)
    .upload(path, arrayBuffer, { contentType: mime, upsert: false });

  if (error) {
    console.warn("[Matam Waraba] uploadMemberPhoto: erreur —", error.message);
    return { error: error.message };
  }

  const { data } = supabaseServer.storage
    .from(PHOTOS_BUCKET)
    .getPublicUrl(path);
  return { url: data.publicUrl };
}

// ---- Édition / suppression d'un membre ----

/**
 * Extrait le chemin de l'objet Storage depuis une URL publique de photo.
 * Les URLs publiques Supabase sont de la forme :
 *   https://<project>.supabase.co/storage/v1/object/public/members-photos/<path>
 * Retourne `null` si l'URL n'appartient pas à notre bucket (URL externe collée
 * via le champ URL) → dans ce cas il n'y a rien à supprimer côté Storage.
 */
function storagePathFromPhotoUrl(url: string | null): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    const marker = `/storage/v1/object/public/${PHOTOS_BUCKET}/`;
    const idx = u.pathname.indexOf(marker);
    if (idx === -1) return null;
    return decodeURIComponent(u.pathname.slice(idx + marker.length));
  } catch {
    return null;
  }
}

/**
 * Supprime l'objet Storage d'une photo de membre. **Best-effort** : une erreur
 * de suppression (objet déjà absent, problème réseau) est seulement loggée et
 * ne bloque pas l'opération métier (update/delete du membre). Exportée pour
 * que l'action d'édition puisse libérer l'ancienne photo lors d'un remplacement.
 */
export async function deleteMemberPhoto(url: string | null): Promise<void> {
  const path = storagePathFromPhotoUrl(url);
  if (!path) return; // URL externe ou absente → rien à faire.
  const { error } = await supabaseServer.storage
    .from(PHOTOS_BUCKET)
    .remove([path]);
  if (error) {
    console.warn(
      "[Matam Waraba] deleteMemberPhoto: suppression Storage ignorée —",
      error.message
    );
  }
}

/**
 * Met à jour un membre côté serveur (client service role). `full_name` est
 * reconstitué (NOT NULL + index de tri). La gestion de la photo (upload nouvelle
 * / suppression / conservation) est à la charge de l'action appelante, qui
 * passe ici le `photo_url` final.
 */
export async function updateMember(
  id: string,
  input: MemberInput
): Promise<{ ok: true } | { error: string }> {
  if (!isSupabaseConfigured) {
    return { error: "Supabase n'est pas configuré — mise à jour impossible." };
  }

  const full_name = `${input.first_name} ${input.last_name}`.trim();

  const { error } = await supabaseServer
    .from("members")
    .update({
      full_name,
      first_name: input.first_name,
      last_name: input.last_name,
      role: input.role,
      category: input.category,
      status: input.status,
      photo_url: input.photo_url,
      position: input.position,
      shirt_number: input.shirt_number,
      height_cm: input.height_cm,
      weight_kg: input.weight_kg,
    })
    .eq("id", id);

  if (error) {
    console.warn("[Matam Waraba] updateMember: erreur Supabase —", error.message);
    return { error: error.message };
  }

  return { ok: true };
}

/**
 * Supprime un membre côté serveur : récupère sa photo (pour nettoyer le bucket
 * Storage), supprime l'objet photo (best-effort), puis supprime la ligne.
 * Retourne `{ ok: true }` ou une erreur métier.
 */
export async function deleteMember(
  id: string
): Promise<{ ok: true } | { error: string }> {
  if (!isSupabaseConfigured) {
    return { error: "Supabase n'est pas configuré — suppression impossible." };
  }

  // 1) Récupère la photo actuelle (pour libérer le bucket Storage).
  const { data: row, error: feErr } = await supabaseServer
    .from("members")
    .select("photo_url")
    .eq("id", id)
    .maybeSingle();
  if (feErr) {
    console.warn(
      "[Matam Waraba] deleteMember: erreur lecture photo —",
      feErr.message
    );
  }
  const photoUrl = (row as { photo_url: string | null } | null)?.photo_url ?? null;

  // 2) Nettoyage Storage (best-effort, ne bloque pas la suite).
  await deleteMemberPhoto(photoUrl);

  // 3) Suppression de la ligne.
  const { error } = await supabaseServer.from("members").delete().eq("id", id);
  if (error) {
    console.warn("[Matam Waraba] deleteMember: erreur Supabase —", error.message);
    return { error: error.message };
  }

  return { ok: true };
}