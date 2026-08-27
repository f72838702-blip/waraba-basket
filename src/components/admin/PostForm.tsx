"use client";

import { useActionState, useRef, useState } from "react";
import { ImagePlus, Trash2, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { compressImage, formatBytes } from "@/lib/compress-image";
import { POST_CATEGORIES, type Post } from "@/types/post";
import type { PostState } from "@/app/admin/actions";

const inputCls =
  "w-full rounded-lg border border-white/10 bg-midnight px-3 py-2.5 text-white placeholder:text-slate-600 focus:border-gold/60 focus:outline-none";

type Props = {
  /** Article à éditer ; absent = création. */
  post?: Post;
  action: (prev: PostState, formData: FormData) => Promise<PostState>;
};

/**
 * Formulaire article (création / édition) du back-office.
 * Image : fichier (compressé côté navigateur avant envoi) ou URL, avec
 * suppression possible en édition (hidden remove_image=1).
 * Après succès en création, le formulaire se réinitialise via formKey.
 */
export default function PostForm({ post, action }: Props) {
  const [state, formAction, pending] = useActionState(action, {} as PostState);
  const [formKey, setFormKey] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageRemoved, setImageRemoved] = useState(false);
  const [imageInfo, setImageInfo] = useState<string | null>(null);

  const success = state?.ok;

  async function onImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    const input = e.target;
    if (!file) return;
    try {
      const compressed = await compressImage(file);
      const dt = new DataTransfer();
      dt.items.add(compressed);
      input.files = dt.files;
      setImagePreview(URL.createObjectURL(compressed));
      setImageInfo(`✓ Image optimisée (${formatBytes(compressed.size)})`);
    } catch {
      setImagePreview(URL.createObjectURL(file));
      setImageInfo(null);
    }
    setImageRemoved(false);
  }

  function clearImage() {
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setImageInfo(null);
    if (post?.image_url) setImageRemoved(true);
  }

  const currentImageUrl =
    post?.image_url && !imageRemoved && !imagePreview ? post.image_url : null;

  return (
    <form key={formKey} action={formAction} className="space-y-5">
      {post && <input type="hidden" name="id" value={post.id} />}
      <input
        type="hidden"
        name="current_image_url"
        value={post?.image_url ?? ""}
      />
      {imageRemoved && <input type="hidden" name="remove_image" value="1" />}

      {/* Retours d'état */}
      {state?.error && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {state.error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          {post
            ? `« ${state.title} » mis à jour.`
            : `« ${state.title} » publié sur l'accueil.`}
        </div>
      )}

      <div>
        <label
          htmlFor="pf-title"
          className="mb-1.5 block text-sm font-semibold text-slate-200"
        >
          Titre *
        </label>
        <input
          id="pf-title"
          name="title"
          type="text"
          required
          maxLength={150}
          defaultValue={post?.title}
          placeholder="Match amical contre BC Eagles"
          className={inputCls}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="pf-category"
            className="mb-1.5 block text-sm font-semibold text-slate-200"
          >
            Catégorie *
          </label>
          <select
            id="pf-category"
            name="category"
            defaultValue={post?.category ?? "actualite"}
            className={inputCls}
          >
            {POST_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="pf-event-date"
            className="mb-1.5 block text-sm font-semibold text-slate-200"
          >
            Date de l&apos;événement{" "}
            <span className="font-normal text-slate-500">(optionnel)</span>
          </label>
          <input
            id="pf-event-date"
            name="event_date"
            type="date"
            defaultValue={post?.event_date ?? ""}
            className={inputCls}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="pf-excerpt"
          className="mb-1.5 block text-sm font-semibold text-slate-200"
        >
          Résumé *{" "}
          <span className="font-normal text-slate-500">
            (affiché sur la carte d&apos;accueil, 300 caractères max)
          </span>
        </label>
        <textarea
          id="pf-excerpt"
          name="excerpt"
          required
          maxLength={300}
          rows={2}
          defaultValue={post?.excerpt}
          placeholder="Nos U15 affrontent BC Eagles samedi à la Bluezone de Dixinn. Entrée libre !"
          className={`${inputCls} resize-y`}
        />
      </div>

      <div>
        <label
          htmlFor="pf-content"
          className="mb-1.5 block text-sm font-semibold text-slate-200"
        >
          Détails{" "}
          <span className="font-normal text-slate-500">(optionnel)</span>
        </label>
        <textarea
          id="pf-content"
          name="content"
          maxLength={5000}
          rows={5}
          defaultValue={post?.content ?? ""}
          placeholder="Lieu, horaires, contexte, partenaires…"
          className={`${inputCls} resize-y`}
        />
      </div>

      {/* ---- Image ---- */}
      <div>
        <span className="mb-1.5 block text-sm font-semibold text-slate-200">
          Image{" "}
          <span className="font-normal text-slate-500">(optionnel)</span>
        </span>
        <input
          ref={fileInputRef}
          type="file"
          name="image_file"
          accept="image/jpeg,image/png,image/webp"
          onChange={onImageChange}
          className="hidden"
        />
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-lg border border-gold/40 bg-gold/10 px-4 py-2 text-sm font-semibold text-gold-light transition hover:bg-gold/20"
          >
            <ImagePlus className="h-4 w-4" />
            Choisir une image
          </button>
          {(imagePreview || currentImageUrl) && (
            <button
              type="button"
              onClick={clearImage}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-400/30 px-3 py-2 text-sm text-red-300 transition hover:bg-red-500/10"
            >
              <Trash2 className="h-4 w-4" />
              Retirer
            </button>
          )}
        </div>
        {(imagePreview || currentImageUrl) && (
          <div className="mt-3 flex items-center gap-3">
            {/* Aperçu de l'image choisie ou actuelle */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imagePreview ?? currentImageUrl ?? ""}
              alt="Aperçu de l'image"
              className="h-24 w-24 rounded-lg border border-white/10 object-cover"
            />
            {imageInfo && <p className="text-xs text-emerald-400">{imageInfo}</p>}
            {imageRemoved && (
              <p className="text-xs text-red-300">
                L&apos;image actuelle sera retirée à l&apos;enregistrement.
              </p>
            )}
          </div>
        )}
        <input
          name="image_url"
          type="url"
          placeholder="https://… (facultatif, ignoré si une image est sélectionnée)"
          className={`${inputCls} mt-3`}
        />
      </div>

      {/* ---- Publication ---- */}
      <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-200">
        <input
          type="checkbox"
          name="published"
          defaultChecked={post?.published ?? true}
          className="h-4 w-4 rounded border-white/20 bg-midnight accent-amber-500"
        />
        Publier immédiatement sur la page d&apos;accueil
      </label>

      <div className="flex flex-wrap gap-3 pt-1">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 font-bold text-blue-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          {pending
            ? "Enregistrement…"
            : post
              ? "Mettre à jour"
              : "Publier l'article"}
        </button>
        {success && !post && (
          <button
            type="button"
            onClick={() => {
              setFormKey((k) => k + 1);
              setImagePreview(null);
              setImageInfo(null);
            }}
            className="rounded-xl border border-gold/40 px-5 py-3 text-sm font-semibold text-gold-light transition hover:bg-gold/10"
          >
            Nouvel article
          </button>
        )}
      </div>
    </form>
  );
}
