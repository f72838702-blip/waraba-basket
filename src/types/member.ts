/**
 * Entité Membre du club Waraba Basket.
 * Reflète la table `members` côté Supabase.
 */

export type MemberStatus = "active" | "inactive";

export interface Member {
  /** Identifiant unique du membre (UUID côté Supabase). */
  id: string;
  /** Nom complet du membre. */
  full_name: string;
  /** Rôle dans le club : joueur, entraîneur, dirigeant, staff... */
  role: string;
  /** Catégorie sportive : U13, U17, Senior, Veteran... */
  category: string;
  /** Statut administratif : licence valide ou non. */
  status: MemberStatus;
  /** URL de la photo de membre (null si absent). */
  photo_url: string | null;
}