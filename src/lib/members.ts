import type { Member } from "@/types/member";

/**
 * Données de démonstration des membres.
 * Servent de repli quand Supabase n'est pas configuré ou injoignable
 * (voir `members-data.ts`). Ces données restent côté client sûr :
 * aucun secret ni accès base de données ici.
 */
export const DEMO_MEMBERS: Member[] = [
  {
    id: "0001",
    full_name: "Ibrahim Touré",
    role: "Joueur",
    category: "Senior",
    status: "active",
    photo_url: null,
  },
  {
    id: "0002",
    full_name: "Awa Diallo",
    role: "Entraîneuse",
    category: "U17",
    status: "active",
    photo_url: null,
  },
  {
    id: "0003",
    full_name: "Moussa Camara",
    role: "Joueur",
    category: "Veteran",
    status: "inactive",
    photo_url: null,
  },
];

/**
 * Récupération des membres (Supabase) — côté serveur uniquement.
 * @see src/lib/members-data.ts  (ne pas importer depuis un composant client)
 */

/** Initiales affichées quand aucune photo n'est disponible. */
export function getInitials(fullName: string): string {
  return fullName
    .split(" ")
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();
}