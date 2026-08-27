/**
 * Article publié sur la page d'accueil (rédigé depuis /admin/posts).
 * Couvre les prochains matchs, actualités, partenariats et événements.
 */

export type PostCategory = "match" | "actualite" | "partenariat" | "evenement";

export type Post = {
  id: string;
  created_at: string;
  title: string;
  category: PostCategory;
  /** Accroche courte affichée sur la carte d'accueil. */
  excerpt: string;
  /** Détails complets (optionnel). */
  content: string | null;
  image_url: string | null;
  /** Date du match / événement (ISO yyyy-mm-dd, optionnel). */
  event_date: string | null;
  published: boolean;
};

/** Catégories proposées dans le back-office, avec leur libellé affiché. */
export const POST_CATEGORIES: { value: PostCategory; label: string }[] = [
  { value: "match", label: "Match" },
  { value: "actualite", label: "Actualité" },
  { value: "partenariat", label: "Partenariat" },
  { value: "evenement", label: "Événement" },
];

/** Libellé d'une catégorie (« match » → « Match »). */
export function categoryLabel(category: PostCategory): string {
  return (
    POST_CATEGORIES.find((c) => c.value === category)?.label ?? category
  );
}

/** Formate une date ISO en français (« samedi 12 septembre 2026 »). */
export function formatPostDate(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}
