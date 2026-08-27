/**
 * Slots d'images personnalisables de la page d'accueil.
 * Partagé client/serveur (aucun accès base ici — voir site-images-data.ts).
 * Chaque slot a une image PAR DÉFAUT (fichier /public/images) utilisée tant
 * que l'admin n'a pas téléversé de remplacement depuis /admin/images.
 */

export type SiteImageKey =
  | "hero"
  | "u10"
  | "u11"
  | "u14"
  | "u15"
  | "feminine"
  | "coach"
  | "staff";

/** Slots affichés dans le back-office (ordre d'affichage). */
export const SITE_IMAGE_SLOTS: {
  key: SiteImageKey;
  label: string;
  hint: string;
}[] = [
  { key: "hero", label: "Hero", hint: "Grande image en haut de la page d'accueil" },
  { key: "u10", label: "Équipe U10", hint: "Carte « U10 » — section Nos équipes" },
  { key: "u11", label: "Équipe U11", hint: "Carte « U11 » — section Nos équipes" },
  { key: "u14", label: "Équipe U14", hint: "Carte « U14 » — section Nos équipes" },
  { key: "u15", label: "Équipe U15", hint: "Carte « U15 » — section Nos équipes" },
  {
    key: "feminine",
    label: "Équipe féminine",
    hint: "Carte « Équipe féminine » — section Nos équipes",
  },
  { key: "coach", label: "Le Coach", hint: "Carte « Le Coach » — section Encadrement" },
  { key: "staff", label: "Le Staff", hint: "Carte « Le Staff » — section Encadrement" },
];

/** Images par défaut (fichiers locaux) quand aucun remplacement n'existe. */
export const DEFAULT_SITE_IMAGES: Record<SiteImageKey, string> = {
  hero: "/images/feminine.jpg",
  u10: "/images/u10.jpg",
  u11: "/images/u11.jpg",
  u14: "/images/u14.jpg",
  u15: "/images/u15.jpg",
  feminine: "/images/feminine.jpg",
  coach: "/images/coach.jpg",
  staff: "/images/staff.jpg",
};

/** Résout l'image effective d'un slot : remplacement admin > défaut local. */
export function resolveSiteImage(
  overrides: Partial<Record<SiteImageKey, string>>,
  key: SiteImageKey
): string {
  return overrides[key] ?? DEFAULT_SITE_IMAGES[key];
}
