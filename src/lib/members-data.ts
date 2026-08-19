import "server-only";
import { cache } from "react";
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