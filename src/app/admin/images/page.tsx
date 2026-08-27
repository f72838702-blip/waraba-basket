import { redirect } from "next/navigation";
import { Images } from "lucide-react";
import { isAdmin } from "@/lib/auth";
import {
  SITE_IMAGE_SLOTS,
  DEFAULT_SITE_IMAGES,
} from "@/lib/site-images";
import { getSiteImageOverrides } from "@/lib/site-images-data";
import SiteImageCard from "@/components/admin/SiteImageCard";

export const metadata = {
  title: "Images de l'accueil — Matam Waraba",
};

/**
 * Gestion des images de la page d'accueil : chaque emplacement (hero, cartes
 * d'équipes, encadrement) peut être remplacé par une photo téléversée.
 * Sans remplacement, l'image par défaut du site s'affiche.
 */
export default async function AdminImagesPage() {
  if (!(await isAdmin())) {
    redirect("/admin/login");
  }

  const overrides = await getSiteImageOverrides();

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
      <div className="mb-8 flex items-start gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-400/10">
          <Images className="h-5 w-5 text-amber-300" />
        </span>
        <div>
          <h1 className="text-2xl font-black text-white">
            Images de la page d&apos;accueil
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Remplacez les photos de l&apos;accueil à votre guise : la nouvelle
            image est visible en ligne dès l&apos;enregistrement. Bouton
            « Image par défaut » pour revenir à la photo d&apos;origine.
          </p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {SITE_IMAGE_SLOTS.map((slot) => {
          const override = overrides[slot.key];
          return (
            <SiteImageCard
              key={slot.key}
              slotKey={slot.key}
              label={slot.label}
              hint={slot.hint}
              currentUrl={override ?? DEFAULT_SITE_IMAGES[slot.key]}
              isCustom={Boolean(override)}
              maxDimension={slot.key === "hero" ? 1920 : 1600}
            />
          );
        })}
      </div>
    </main>
  );
}
