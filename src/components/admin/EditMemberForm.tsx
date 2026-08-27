"use client";

import { useActionState, useRef, useState } from "react";
import Link from "next/link";
import {
  Loader2,
  CheckCircle2,
  Save,
  ExternalLink,
  ArrowLeft,
  User,
  Camera,
  ImagePlus,
  X,
  RotateCcw,
} from "lucide-react";
import {
  updateMemberAction,
  type UpdateMemberState,
} from "@/app/admin/actions";
import { compressImage, formatBytes } from "@/lib/compress-image";
import type { Member } from "@/types/member";

const initialState: UpdateMemberState = {};

const POSITIONS = ["", "Meneur", "Arrière", "Ailier", "Ailier fort", "Pivot"];

const fieldBase =
  "w-full rounded-lg border border-white/10 bg-midnight px-3 py-2.5 text-white placeholder:text-slate-600 focus:border-gold/60 focus:outline-none";
const labelBase = "mb-1.5 block text-sm font-medium text-slate-300";

type PhotoMode = "current" | "new" | "removed";

/**
 * Formulaire d'édition d'une fiche membre. Pré-rempli depuis `member`, utilise
 * `updateMemberAction`. Contrairement à la création, le formulaire reste
 * visible après enregistrement (banner succès au-dessus) : l'admin peut
 * enchaîner les modifications sans recharger.
 *
 * Photo : 3 modes locaux —
 *  - "current"  : on montre la photo actuelle (ou « Aucune photo »).
 *  - "new"      : une nouvelle photo a été choisie + compressée (remplace).
 *  - "removed"  : l'admin a demandé la suppression (sera retirée à l'enregistrement).
 */
export default function EditMemberForm({ member }: { member: Member }) {
  const [state, formAction, pending] = useActionState(
    updateMemberAction,
    initialState
  );

  // Deux inputs séparés pour fiabiliser la caméra sur mobile (cf. CreateMemberForm).
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [photoMode, setPhotoMode] = useState<PhotoMode>("current");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoSize, setPhotoSize] = useState<number | null>(null);
  const [compressing, setCompressing] = useState(false);

  // Ouvre la caméra (useCamera=true) ou le sélecteur de fichiers.
  function pickPhoto(useCamera: boolean) {
    const el = useCamera ? cameraInputRef.current : fileInputRef.current;
    if (!el) return;
    el.value = "";
    el.click();
  }

  async function onPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const sourceInput = e.target;
    const file = sourceInput.files?.[0];
    if (!file) return;

    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setCompressing(true);
    try {
      const compressed = await compressImage(file);
      // Transfère la version compressée vers l'input NOMMÉ (photo_file).
      const dt = new DataTransfer();
      dt.items.add(compressed);
      if (fileInputRef.current) fileInputRef.current.files = dt.files;
      setPhotoPreview(URL.createObjectURL(compressed));
      setPhotoSize(compressed.size);
      setPhotoMode("new");
    } catch {
      // Repli sur l'original si la compression échoue.
      const dt = new DataTransfer();
      dt.items.add(file);
      if (fileInputRef.current) fileInputRef.current.files = dt.files;
      setPhotoPreview(URL.createObjectURL(file));
      setPhotoSize(file.size);
      setPhotoMode("new");
    } finally {
      setCompressing(false);
      if (sourceInput !== fileInputRef.current) sourceInput.value = "";
    }
  }

  // Abandon de la nouvelle photo : on revient à la photo actuelle (ou aucune).
  function clearNewPhoto() {
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
    setPhotoSize(null);
    setPhotoMode("current");
  }

  function removeCurrentPhoto() {
    setPhotoMode("removed");
  }

  function restorePhoto() {
    setPhotoMode("current");
  }

  const showCurrentPhoto = photoMode === "current" && !!member.photo_url;
  const showNewPhoto = photoMode === "new";
  const showRemoved = photoMode === "removed";
  const showEmpty = photoMode === "current" && !member.photo_url;

  return (
    <div className="space-y-5">
      {/* Bannière succès (le formulaire reste disponible en dessous) */}
      {state.ok && (
        <div className="overflow-hidden rounded-2xl border border-emerald-500/40 bg-emerald-500/10 shadow-2xl">
          <div className="flex items-center gap-3 bg-emerald-600/20 px-5 py-4">
            <CheckCircle2 className="h-6 w-6 text-emerald-400" />
            <div>
              <p className="font-bold text-emerald-300">
                Fiche mise à jour — {state.name}
              </p>
              <p className="text-xs text-emerald-400/80">
                Les modifications sont visibles dans l&apos;annuaire et la fiche
                publique.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3 p-5 sm:flex-row">
            <Link
              href={state.url ?? `/member/${member.id}`}
              target="_blank"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-gold px-4 py-2.5 font-bold text-midnight transition hover:bg-gold-light"
            >
              <ExternalLink className="h-4 w-4" />
              Voir la fiche
            </Link>
            <Link
              href="/admin/members"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 font-semibold text-white transition hover:bg-white/5"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour à la liste
            </Link>
          </div>
        </div>
      )}

      <form action={formAction} className="mx-auto w-full max-w-2xl">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-midnight-light shadow-2xl">
          <div className="flex items-center gap-2 bg-royal px-5 py-4">
            <User className="h-5 w-5 text-gold-light" />
            <span className="text-sm font-bold uppercase tracking-wider text-white">
              Modifier la fiche
            </span>
          </div>

          <div className="space-y-5 p-5">
            {/* Identifiants requis pour l'action */}
            <input type="hidden" name="id" value={member.id} />
            <input
              type="hidden"
              name="current_photo_url"
              value={member.photo_url ?? ""}
            />
            <input
              type="hidden"
              name="remove_photo"
              value={photoMode === "removed" ? "1" : "0"}
            />

            {/* Identité */}
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className={labelBase}>Prénom *</span>
                <input
                  name="first_name"
                  required
                  defaultValue={member.first_name}
                  placeholder="Ibrahim"
                  className={fieldBase}
                />
              </label>
              <label className="block">
                <span className={labelBase}>Nom *</span>
                <input
                  name="last_name"
                  required
                  defaultValue={member.last_name}
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
                  defaultValue={member.role}
                  placeholder="Joueur, Entraîneur, Dirigeant…"
                  className={fieldBase}
                />
              </label>
              <label className="block">
                <span className={labelBase}>Catégorie</span>
                <input
                  name="category"
                  defaultValue={member.category}
                  placeholder="U13, U17, Senior, Veteran…"
                  className={fieldBase}
                />
              </label>
            </div>

            {/* Photo : actuelle / nouvelle / supprimée */}
            <div>
              <span className={labelBase}>Photo</span>

              {/* Aperçu selon le mode */}
              {(showCurrentPhoto || showNewPhoto || showRemoved || compressing) && (
                <div className="mb-3 inline-flex items-center gap-3 rounded-xl border border-white/10 bg-midnight p-2">
                  {compressing ? (
                    <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-royal-dark">
                      <Loader2 className="h-6 w-6 animate-spin text-gold-light" />
                    </div>
                  ) : showNewPhoto ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={photoPreview ?? ""}
                      alt="Nouvelle photo"
                      className="h-20 w-20 rounded-lg object-cover"
                    />
                  ) : showCurrentPhoto ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={member.photo_url ?? ""}
                      alt="Photo actuelle"
                      className="h-20 w-20 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-royal-dark text-xs text-slate-500">
                      Aucune
                    </div>
                  )}

                  <div className="flex flex-col gap-1.5">
                    {compressing ? (
                      <span className="text-sm text-slate-300">
                        Compression en cours…
                      </span>
                    ) : showNewPhoto ? (
                      <>
                        <span className="text-xs text-emerald-400">
                          ✓ Nouvelle photo optimisée (
                          {formatBytes(photoSize ?? 0)})
                        </span>
                        <button
                          type="button"
                          onClick={clearNewPhoto}
                          className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-sm text-slate-300 transition hover:border-red-500/40 hover:text-red-300"
                        >
                          <X className="h-4 w-4" />
                          Annuler
                        </button>
                      </>
                    ) : showCurrentPhoto ? (
                      <button
                        type="button"
                        onClick={removeCurrentPhoto}
                        className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-sm text-slate-300 transition hover:border-red-500/40 hover:text-red-300"
                      >
                        <X className="h-4 w-4" />
                        Supprimer la photo
                      </button>
                    ) : showRemoved ? (
                      <>
                        <span className="text-xs text-amber-400">
                          Photo supprimée (sera retirée à l&apos;enregistrement)
                        </span>
                        <button
                          type="button"
                          onClick={restorePhoto}
                          className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-sm text-slate-300 transition hover:border-gold/40 hover:text-gold-light"
                        >
                          <RotateCcw className="h-4 w-4" />
                          Restaurer
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>
              )}

              {showEmpty && (
                <p className="mb-3 text-xs text-slate-500">
                  Aucune photo actuellement.
                </p>
              )}

              {/* Input NOMMÉ (soumis avec le formulaire) : sélection fichier. */}
              <input
                ref={fileInputRef}
                type="file"
                name="photo_file"
                accept="image/jpeg,image/png,image/webp"
                onChange={onPhotoChange}
                className="hidden"
              />
              {/* Input caméra DÉDIÉ (sans name) : accept="image/*" + capture
                  ouvre la caméra arrière sur mobile (iOS incluse). Le fichier
                  capturé est transféré vers l'input nommé ci-dessus. */}
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
                  {showCurrentPhoto || showNewPhoto
                    ? "Remplacer par un fichier"
                    : "Choisir un fichier"}
                </button>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Choisir une photo la remplace (l&apos;ancienne est supprimée du
                stockage). La photo est compressée avant l&apos;envoi
                (≈100-200 Ko).
              </p>
            </div>

            <hr className="border-white/10" />

            {/* Stats joueur */}
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Infos joueur (facultatif)
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className={labelBase}>Poste</span>
                <select
                  name="position"
                  className={fieldBase}
                  defaultValue={member.position ?? ""}
                >
                  {POSITIONS.map((p) => (
                    <option key={p} value={p}>
                      {p === "" ? "— Aucun —" : p}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className={labelBase}>Statut</span>
                <select
                  name="status"
                  className={fieldBase}
                  defaultValue={member.status}
                >
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
                  defaultValue={member.shirt_number ?? ""}
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
                  defaultValue={member.height_cm ?? ""}
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
                  defaultValue={member.weight_kg ?? ""}
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
                  <Save className="h-4 w-4" />
                  Enregistrer les modifications
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}