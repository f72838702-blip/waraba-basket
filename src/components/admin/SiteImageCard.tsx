"use client";

import { useRef, useState, useActionState } from "react";
import { CheckCircle2, ImagePlus, Loader2, RotateCcw } from "lucide-react";
import { compressImage } from "@/lib/compress-image";
import {
  updateSiteImageAction,
  resetSiteImageAction,
  type SiteImageState,
} from "@/app/admin/actions";

/**
 * Carte d'un emplacement d'image de l'accueil : aperçu, téléversement
 * (compression automatique avant envoi) et retour à l'image par défaut.
 * L'upload démarre dès que le fichier est choisi — pas de bouton « Envoyer ».
 */
export default function SiteImageCard({
  slotKey,
  label,
  hint,
  currentUrl,
  isCustom,
  maxDimension = 1600,
}: {
  slotKey: string;
  label: string;
  hint: string;
  /** Image effectivement affichée sur l'accueil (remplacement ou défaut). */
  currentUrl: string;
  /** Vrai si l'image affichée provient d'un remplacement admin. */
  isCustom: boolean;
  /** Arête max de compression (px) — plus grand pour le hero. */
  maxDimension?: number;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [preparing, setPreparing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const [state, formAction, pending] = useActionState(
    updateSiteImageAction,
    {} as SiteImageState
  );
  const [resetState, resetAction, resetPending] = useActionState(
    resetSiteImageAction,
    {} as SiteImageState
  );

  async function onFileChosen(file: File | null) {
    if (!file || !formRef.current || !fileRef.current) return;
    setPreparing(true);
    try {
      const compressed = await compressImage(file, { maxDimension });
      // Injecte le fichier compressé dans l'input (FormData de l'action).
      const dt = new DataTransfer();
      dt.items.add(compressed);
      fileRef.current.files = dt.files;
      setPreview(URL.createObjectURL(compressed));
      formRef.current.requestSubmit();
    } catch {
      // Compression impossible → on envoie le fichier original tel quel.
      setPreview(URL.createObjectURL(file));
      formRef.current.requestSubmit();
    } finally {
      setPreparing(false);
    }
  }

  const busy = pending || preparing;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element -- URL Supabase dynamique */}
        <img
          src={preview ?? currentUrl}
          alt={label}
          className="h-40 w-full rounded-xl border border-white/10 object-cover"
        />
        {busy && (
          <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-blue-950/70">
            <Loader2 className="h-6 w-6 animate-spin text-amber-300" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-white">{label}</h3>
          <p className="mt-0.5 text-xs text-slate-400">{hint}</p>
        </div>
        <span
          className={
            isCustom
              ? "rounded-full bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-300"
              : "rounded-full bg-slate-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400"
          }
        >
          {isCustom ? "Personnalisée" : "Par défaut"}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <form ref={formRef} action={formAction}>
          <input type="hidden" name="key" value={slotKey} />
          <input
            ref={fileRef}
            type="file"
            name="image_file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              onFileChosen(e.target.files?.[0] ?? null);
              e.target.value = ""; // permet de rechoisir le même fichier
            }}
          />
          <button
            type="button"
            disabled={busy}
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-bold text-blue-950 transition hover:bg-amber-300 disabled:opacity-60"
          >
            <ImagePlus className="h-3.5 w-3.5" />
            {busy ? "Envoi…" : "Changer l'image"}
          </button>
        </form>

        {isCustom && (
          <form
            action={resetAction}
            onSubmit={(e) => {
              if (!confirm(`Revenir à l'image par défaut pour « ${label} » ?`)) {
                e.preventDefault();
              }
            }}
          >
            <input type="hidden" name="key" value={slotKey} />
            <button
              type="submit"
              disabled={busy || resetPending}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-white/10 disabled:opacity-60"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {resetPending ? "Réinitialisation…" : "Image par défaut"}
            </button>
          </form>
        )}
      </div>

      {(state.ok || resetState.ok) && !busy && !resetPending && (
        <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-emerald-300">
          <CheckCircle2 className="h-3.5 w-3.5" /> Enregistré — visible sur
          l&apos;accueil d&apos;ici une minute.
        </p>
      )}
      {(state.error || resetState.error) && (
        <p className="mt-2 text-xs text-red-300">{state.error ?? resetState.error}</p>
      )}
    </div>
  );
}
