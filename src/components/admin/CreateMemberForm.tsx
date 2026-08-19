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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Ouvre le sélecteur : `capture` force la caméra arrière sur mobile, absent
  // pour laisser le choix galerie/fichier.
  function pickPhoto(useCamera: boolean) {
    const el = fileInputRef.current;
    if (!el) return;
    if (useCamera) {
      el.setAttribute("capture", "environment");
    } else {
      el.removeAttribute("capture");
    }
    el.click();
  }

  function onPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(file ? URL.createObjectURL(file) : null);
  }

  function clearPhoto() {
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
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
            {photoPreview && (
              <div className="mb-3 inline-flex items-center gap-3 rounded-xl border border-white/10 bg-midnight p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoPreview}
                  alt="Aperçu photo"
                  className="h-20 w-20 rounded-lg object-cover"
                />
                <button
                  type="button"
                  onClick={clearPhoto}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-sm text-slate-300 transition hover:border-red-500/40 hover:text-red-300"
                >
                  <X className="h-4 w-4" />
                  Supprimer
                </button>
              </div>
            )}

            {/* Input fichier unique : capture dynamique selon le bouton cliqué */}
            <input
              ref={fileInputRef}
              type="file"
              name="photo_file"
              accept="image/jpeg,image/png,image/webp"
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
              jpg, png ou webp — 4 Mo max. Sur mobile, « Prendre une photo »
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