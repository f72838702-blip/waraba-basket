/**
 * Entité Membre du club Waraba Basket.
 * Reflète la table `members` côté Supabase (migration-player-fields.sql).
 */

export type MemberStatus = "active" | "inactive";

export interface Member {
  /** Identifiant unique du membre (UUID côté Supabase). */
  id: string;
  /** Prénom. */
  first_name: string;
  /** Nom. */
  last_name: string;
  /** URL de la photo de membre (null si absent). */
  photo_url: string | null;
  /** Poste : Meneur / Arrière / Ailier / Ailier fort / Pivot (null pour un non-joueur). */
  position: string | null;
  /** Numéro de maillot (null pour un non-joueur). */
  shirt_number: number | null;
  /** Taille en centimètres. */
  height_cm: number | null;
  /** Poids en kilogrammes (null si inconnu). */
  weight_kg: number | null;
  /** Rôle dans le club : joueur, entraîneur, dirigeant, staff... */
  role: string;
  /** Catégorie sportive : U13, U17, Senior, Veteran... */
  category: string;
  /** Statut administratif : licence valide ou non. */
  status: MemberStatus;
}