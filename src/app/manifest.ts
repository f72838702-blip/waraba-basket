import type { MetadataRoute } from "next";

/**
 * Manifest PWA — rend le site installable (Android : « Ajouter à l'écran
 * d'accueil » / bouton d'invitation ; iOS : Partager → Sur l'écran d'accueil).
 * L'app s'ouvre en plein écran (standalone) avec la barre de statut bleu royal.
 * Raccourci applicatif « Espace Admin » : appui long sur l'icône installée.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Matam Waraba — Basketball Academy",
    short_name: "Matam Waraba",
    description:
      "Site officiel de la Matam Waraba Basketball Academy : équipes, effectif, actualités et espace admin.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#172554",
    theme_color: "#172554",
    lang: "fr",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Espace Admin",
        short_name: "Admin",
        description: "Gérer les membres, articles et messages",
        url: "/admin/login",
        icons: [
          {
            src: "/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
      },
    ],
  };
}
