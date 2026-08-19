import type { Member } from "@/types/member";

/**
 * Données de démonstration des membres.
 * Servent de repli quand Supabase n'est pas configuré ou injoignable
 * (voir `members-data.ts`). Client-safe : aucun secret ni accès base ici.
 * Valeurs alignées sur `supabase/migration-player-fields.sql`.
 */
export const DEMO_MEMBERS: Member[] = [
  {
    id: "0001",
    first_name: "Ibrahim",
    last_name: "Touré",
    photo_url: null,
    position: "Arrière",
    shirt_number: 7,
    height_cm: 188,
    weight_kg: 78,
    role: "Joueur",
    category: "Senior",
    status: "active",
  },
  {
    id: "0002",
    first_name: "Awa",
    last_name: "Diallo",
    photo_url: null,
    position: null,
    shirt_number: null,
    height_cm: 172,
    weight_kg: null,
    role: "Entraîneuse",
    category: "U17",
    status: "active",
  },
  {
    id: "0003",
    first_name: "Moussa",
    last_name: "Camara",
    photo_url: null,
    position: "Pivot",
    shirt_number: 33,
    height_cm: 196,
    weight_kg: 92,
    role: "Joueur",
    category: "Veteran",
    status: "inactive",
  },
];

/**
 * Récupération des membres (Supabase) — côté serveur uniquement.
 * @see src/lib/members-data.ts  (ne pas importer depuis un composant client)
 */

/** Nom d'affichage : « Prénom NOM ». */
export function fullName(m: Pick<Member, "first_name" | "last_name">): string {
  return `${m.first_name} ${m.last_name.toUpperCase()}`.trim();
}

/** Initiales affichées quand aucune photo n'est disponible. */
export function getInitials(m: Pick<Member, "first_name" | "last_name">): string {
  const a = m.first_name?.charAt(0) ?? "";
  const b = m.last_name?.charAt(0) ?? "";
  return (a + b).toUpperCase();
}

/** Taille en mètres façon FR : 188 → « 1,88 m ». null → « — ». */
export function formatHeight(cm: number | null | undefined): string {
  if (cm == null) return "—";
  const meters = (cm / 100).toFixed(2).replace(".", ",");
  return `${meters} m`;
}

/** Poids : 78 → « 78 kg ». null → « — ». */
export function formatWeight(kg: number | null | undefined): string {
  if (kg == null) return "—";
  return `${kg} kg`;
}