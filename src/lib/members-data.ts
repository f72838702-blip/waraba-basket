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
        "[Waraba Basket] Supabase non configuré — getAllMembers utilise les données démo."
      );
    }
    return DEMO_MEMBERS;
  }

  const { data, error } = await supabaseServer
    .from("members")
    .select("*")
    .order("full_name");

  if (error) {
    console.warn("[Waraba Basket] getAllMembers: erreur Supabase —", error.message);
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
    console.warn("[Waraba Basket] getMemberById: erreur Supabase —", error.message);
    return undefined;
  }

  if (!data) {
    // Pas de membre en base pour cet id → undefined → notFound() côté page.
    return undefined;
  }

  return toMember(data as MemberRow);
});

/** Charge utile d'insertion d'un membre (tous les champs gérés par le back-office). */
export type NewMemberInput = {
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
  input: NewMemberInput
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
    console.warn("[Waraba Basket] insertMember: erreur Supabase —", error.message);
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
    console.warn("[Waraba Basket] uploadMemberPhoto: erreur —", error.message);
    return { error: error.message };
  }

  const { data } = supabaseServer.storage
    .from(PHOTOS_BUCKET)
    .getPublicUrl(path);
  return { url: data.publicUrl };
}