"use client";

import { useActionState, useRef, useState } from "react";
import Link from "next/link";
import {
  Loader2,
  CheckCircle2,
  Plus,
  ExternalLink,
  User,
  Camera,
  ImagePlus,
  X,
  Link2,
} from "lucide-react";
import {
  createMemberAction,
  type CreateMemberState,
} from "@/app/admin/actions";
import { compressImage, formatBytes } from "@/lib/compress-image";

const initialState: CreateMemberState = {};

/** Liste des postes basket proposés (vide = non-joueur / coach). */
const POSITIONS = ["", "Meneur", "Arrière", "Ailier", "Ailier fort", "Pivot"];

const fieldBase =
  "w-full rounded-lg border border-white/10 bg-midnight px-3 py-2.5 text-white placeholder:text-slate-600 focus:border-gold/60 focus:outline-none";
const labelBase = "mb-1.5 block text-sm font-medium text-slate-300";

/**
 * Formulaire de création d'une fiche membre. Un `formKey` permet de remonter
 * le bloc (état + champs) après une création réussie pour enchaîner sans
 * traîner les valeurs précédentes.
 */
export default function CreateMemberForm() {
  const [formKey, setFormKey] = useState(0);

  return (
    <FormBlock
      key={formKey}
      onReset={() => setFormKey((k) => k + 1)}
    />
  );
}

function FormBlock({ onReset }: { onReset: () => void }) {
  const [state, formAction, pending] = useActionState(
    createMemberAction,
    initialState
  );

  // Deux inputs séparés pour fiabiliser la caméra sur mobile :
  // - fileInputRef : input NOMMÉ « photo_file » (soumis avec le formulaire),
  //   accepte les fichiers image classiques (galerie / sélecteur).
  // - cameraInputRef : input DÉDIÉ caméra (accept="image/*" + capture), sans
  //   name. Le fichier capturé est compressé puis transféré vers fileInputRef
  //   (cf. onPhotoChange). Séparer les inputs évite le basculement dynamique
  //   de l'attribut `capture`, peu fiable sur iOS Safari notamment, et
  //   `accept="image/*"` est nécessaire pour qu'iOS honore `capture`.
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoSize, setPhotoSize] = useState<number | null>(null);
  const [compressing, setCompressing] = useState(false);

  // Ouvre la caméra (useCamera=true) ou le sélecteur de fichiers.
  function pickPhoto(useCamera: boolean) {
    const el = useCamera ? cameraInputRef.current : fileInputRef.current;
    if (!el) return;
    // Réinitialise pour permettre de reprendre/rechoisir la même photo.
    el.value = "";
    el.click();
  }

  // À la sélection (caméra ou fichier), la photo est compressée en arrière-plan
  // (redimensionnée + ré-encodée en JPEG léger) puis transférée vers l'input
  // NOMMÉ « photo_file » : le formulaire enverra donc la version légère, quel
  // que soit l'input source. L'input caméra (non nommé) est ensuite réinitialisé
  // pour permettre de reprendre la même photo.
  async function onPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const sourceInput = e.target;
    const file = sourceInput.files?.[0];
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    if (!file) {
      setPhotoPreview(null);
      setPhotoSize(null);
      return;
    }

    setCompressing(true);
    try {
      const compressed = await compressImage(file);
      const dt = new DataTransfer();
      dt.items.add(compressed);
      if (fileInputRef.current) fileInputRef.current.files = dt.files;
      setPhotoPreview(URL.createObjectURL(compressed));
      setPhotoSize(compressed.size);
    } catch {
      // Repli : on garde l'original si la compression échoue.
      const dt = new DataTransfer();
      dt.items.add(file);
      if (fileInputRef.current) fileInputRef.current.files = dt.files;
      setPhotoPreview(URL.createObjectURL(file));
      setPhotoSize(file.size);
    } finally {
      setCompressing(false);
      // Libère l'input source quand ce n'est pas l'input nommé (caméra), pour
      // pouvoir reprendre la même photo ensuite.
      if (sourceInput !== fileInputRef.current) sourceInput.value = "";
    }
  }

  function clearPhoto() {
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
    setPhotoSize(null);
  }

  // Une création réussie : on affiche un panneau de confirmation au-dessus du
  // formulaire (qui reste vide, prêt pour la fiche suivante).
  if (state.ok) {
    return (
      <div className="mx-auto w-full max-w-2xl">
        <div className="overflow-hidden rounded-2xl border border-emerald-500/40 bg-emerald-500/10 shadow-2xl">
          <div className="flex items-center gap-3 bg-emerald-600/20 px-5 py-4">
            <CheckCircle2 className="h-6 w-6 text-emerald-400" />
            <div>
              <p className="font-bold text-emerald-300">
                Fiche créée — {state.name}
              </p>
              <p className="text-xs text-emerald-400/80">
                Le membre est désormais visible dans l&apos;annuaire.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3 p-5 sm:flex-row">
            <Link
              href={state.url ?? "/members"}
              target="_blank"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-gold px-4 py-2.5 font-bold text-midnight transition hover:bg-gold-light"
            >
              <ExternalLink className="h-4 w-4" />
              Voir la fiche
            </Link>
            <Link
              href="/members"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 font-semibold text-white transition hover:bg-white/5"
            >
              Voir l&apos;annuaire
            </Link>
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gold/40 px-4 py-2.5 font-semibold text-gold-light transition hover:bg-gold hover:text-midnight"
            >
              <Plus className="h-4 w-4" />
              Créer une autre fiche
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="mx-auto w-full max-w-2xl">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-midnight-light shadow-2xl">
        <div className="flex items-center gap-2 bg-royal px-5 py-4">
          <User className="h-5 w-5 text-gold-light" />
          <span className="text-sm font-bold uppercase tracking-wider text-white">
            Nouvelle fiche membre
          </span>
        </div>

        <div className="space-y-5 p-5">
          {/* Identité */}
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className={labelBase}>Prénom *</span>
              <input
                name="first_name"
                required
                placeholder="Ibrahim"
                className={fieldBase}
              />
            </label>
            <label className="block">
              <span className={labelBase}>Nom *</span>
              <input
                name="last_name"
                required
                placeholder="Touré"
                className={fieldBase}
              />
            </label>
          </div>

          {/* Rôle + Catégorie */}
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className={labelBase}>Rôle</span>
              <input
                name="role"
                placeholder="Joueur, Entraîneur, Dirigeant…"
                className={fieldBase}
              />
            </label>
            <label className="block">
              <span className={labelBase}>Catégorie</span>
              <input
                name="category"
                placeholder="U13, U17, Senior, Veteran…"
                className={fieldBase}
              />
            </label>
          </div>

          {/* Photo : caméra ou fichier (upload vers Supabase Storage) */}
          <div>
            <span className={labelBase}>Photo</span>

            {/* Aperçu + bouton supprimer */}
            {(photoPreview || compressing) && (
              <div className="mb-3 inline-flex items-center gap-3 rounded-xl border border-white/10 bg-midnight p-2">
                {compressing ? (
                  <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-royal-dark">
                    <Loader2 className="h-6 w-6 animate-spin text-gold-light" />
                  </div>
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={photoPreview ?? ""}
                    alt="Aperçu photo"
                    className="h-20 w-20 rounded-lg object-cover"
                  />
                )}
                <div className="flex flex-col gap-1.5">
                  {compressing ? (
                    <span className="text-sm text-slate-300">
                      Compression en cours…
                    </span>
                  ) : (
                    <>
                      <span className="text-xs text-emerald-400">
                        ✓ Photo optimisée ({formatBytes(photoSize ?? 0)})
                      </span>
                      <button
                        type="button"
                        onClick={clearPhoto}
                        className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-sm text-slate-300 transition hover:border-red-500/40 hover:text-red-300"
                      >
                        <X className="h-4 w-4" />
                        Supprimer
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Input NOMMÉ (soumis avec le formulaire) : sélection fichier.
                C'est lui qui porte réellement la photo envoyée au serveur. */}
            <input
              ref={fileInputRef}
              type="file"
              name="photo_file"
              accept="image/jpeg,image/png,image/webp"
              onChange={onPhotoChange}
              className="hidden"
            />
            {/* Input caméra DÉDIÉ (sans name) : accept="image/*" + capture
                ouvre directement la caméra arrière sur mobile (iOS incluse).
                Le fichier capturé est transféré vers l'input nommé ci-dessus
                après compression ; il n'est jamais soumis directement. */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={onPhotoChange}
              className="hidden"
            />

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => pickPhoto(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2.5 text-sm font-semibold text-midnight transition hover:bg-gold-light"
              >
                <Camera className="h-4 w-4" />
                Prendre une photo
              </button>
              <button
                type="button"
                onClick={() => pickPhoto(false)}
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/5"
              >
                <ImagePlus className="h-4 w-4" />
                Choisir un fichier
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              jpg, png ou webp. La photo est automatiquement redimensionnée et
              compressée avant l&apos;envoi (≈100-200 Ko) pour économiser
              l&apos;espace de stockage. Sur mobile, « Prendre une photo »
              ouvre la caméra ; sur ordinateur, le sélecteur de fichiers.
            </p>

            {/* Alternative : coller une URL */}
            <label className="mt-3 block">
              <span className="mb-1.5 block text-xs font-medium text-slate-500">
                <Link2 className="mr-1 inline h-3 w-3" />
                ou collez une URL de photo
              </span>
              <input
                type="url"
                name="photo_url"
                placeholder="https://… (facultatif, ignoré si une photo est sélectionnée)"
                className={fieldBase}
              />
            </label>
          </div>

          <hr className="border-white/10" />

          {/* Stats joueur */}
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Infos joueur (facultatif)
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className={labelBase}>Poste</span>
              <select name="position" className={fieldBase} defaultValue="">
                {POSITIONS.map((p) => (
                  <option key={p} value={p}>
                    {p === "" ? "— Aucun —" : p}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className={labelBase}>Statut</span>
              <select name="status" className={fieldBase} defaultValue="active">
                <option value="active">Licence valide</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
            <label className="block">
              <span className={labelBase}>Numéro de maillot</span>
              <input
                type="number"
                inputMode="numeric"
                name="shirt_number"
                min={0}
                placeholder="7"
                className={fieldBase}
              />
            </label>
            <label className="block">
              <span className={labelBase}>Taille (cm)</span>
              <input
                type="number"
                inputMode="numeric"
                name="height_cm"
                min={0}
                placeholder="188"
                className={fieldBase}
              />
            </label>
            <label className="block">
              <span className={labelBase}>Poids (kg)</span>
              <input
                type="number"
                inputMode="numeric"
                name="weight_kg"
                min={0}
                placeholder="78"
                className={fieldBase}
              />
            </label>
          </div>

          {state.error && (
            <p
              role="alert"
              className="rounded-lg border border-red-500/40 bg-red-500/15 px-3 py-2 text-sm text-red-300"
            >
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gold px-4 py-3 font-bold text-midnight transition hover:bg-gold-light disabled:opacity-60"
          >
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Créer la fiche
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}