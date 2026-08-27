import "server-only";
import { supabaseServer, isSupabaseConfigured } from "@/lib/supabase-server";

/**
 * Accès aux messages de contact via Supabase (côté serveur uniquement).
 * - Insertion publique (formulaire) via le client service role (RLS contournée
 *   côté serveur ; aucune policy publique — voir migration-contact-messages.sql).
 * - Lecture réservée à l'admin (page /admin/messages gardée par isAdmin()).
 */

export type ContactMessage = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  message: string;
  is_read: boolean;
};

export type ContactInput = {
  name: string;
  email: string;
  message: string;
};

type ContactRow = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  message: string;
  is_read: boolean | null;
};

function toContactMessage(row: ContactRow): ContactMessage {
  return {
    id: row.id,
    created_at: row.created_at,
    name: row.name,
    email: row.email,
    message: row.message,
    is_read: row.is_read ?? false,
  };
}

/**
 * Enregistre un message envoyé via le formulaire de contact public.
 * Échoue proprement si Supabase n'est pas configuré (le formulaire affiche
 * l'erreur plutôt que de laisser croire que le message est parti).
 */
export async function insertContactMessage(
  input: ContactInput
): Promise<{ ok: true } | { error: string }> {
  if (!isSupabaseConfigured) {
    return {
      error:
        "Le service de messagerie n'est pas configuré pour le moment. Réessayez plus tard ou contactez-nous via WhatsApp.",
    };
  }

  const { error } = await supabaseServer
    .from("contact_messages")
    .insert({
      name: input.name,
      email: input.email,
      message: input.message,
    });

  if (error) {
    console.error("[Matam Waraba] insertContactMessage:", error.message);
    return {
      error:
        "Impossible d'enregistrer votre message pour le moment. Réessayez plus tard.",
    };
  }

  return { ok: true };
}

/** Liste tous les messages (admin) — les plus récents d'abord. */
export async function getContactMessages(): Promise<ContactMessage[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabaseServer
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });
  if (error || !data) {
    console.error("[Matam Waraba] getContactMessages:", error?.message);
    return [];
  }
  return (data as ContactRow[]).map(toContactMessage);
}

/** Nombre de messages non lus (badge admin). */
export async function countUnreadContactMessages(): Promise<number> {
  if (!isSupabaseConfigured) return 0;
  const { count, error } = await supabaseServer
    .from("contact_messages")
    .select("id", { count: "exact", head: true })
    .eq("is_read", false);
  if (error || count == null) return 0;
  return count;
}

/** Marque un message comme lu. */
export async function markContactMessageRead(
  id: string
): Promise<{ ok: true } | { error: string }> {
  if (!isSupabaseConfigured) return { error: "Service non configuré." };
  const { error } = await supabaseServer
    .from("contact_messages")
    .update({ is_read: true })
    .eq("id", id);
  if (error) return { error: error.message };
  return { ok: true };
}