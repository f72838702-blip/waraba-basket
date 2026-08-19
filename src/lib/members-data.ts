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
  full_name: string;
  role: string;
  category: string;
  status: MemberStatus;
  photo_url: string | null;
};

function toMember(row: MemberRow): Member {
  return {
    id: row.id,
    full_name: row.full_name,
    role: row.role,
    category: row.category,
    status: row.status,
    photo_url: row.photo_url,
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
    return DEMO_MEMBERS;
  }

  if (!data || data.length === 0) {
    return DEMO_MEMBERS;
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
    return DEMO_MEMBERS.find((m) => m.id === id);
  }

  if (!data) {
    // Pas de membre en base pour cet id : repli démo si l'id correspond,
    // sinon undefined → notFound() côté page.
    return DEMO_MEMBERS.find((m) => m.id === id);
  }

  return toMember(data as MemberRow);
});