"use client";

import { useActionState } from "react";
import { Trash2 } from "lucide-react";
import { deletePostAction, type PostState } from "@/app/admin/actions";

/** Bouton de suppression d'article (confirmation avant envoi). */
export default function DeletePostButton({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  const [state, formAction, pending] = useActionState(
    deletePostAction,
    {} as PostState
  );

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!confirm(`Supprimer définitivement « ${title} » ?`)) {
          e.preventDefault();
        }
      }}
      className="flex items-center gap-2"
    >
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="title" value={title} />
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-1.5 rounded-lg border border-red-400/30 px-3 py-1.5 text-xs font-semibold text-red-300 transition hover:bg-red-500/10 disabled:opacity-60"
      >
        <Trash2 className="h-3.5 w-3.5" />
        {pending ? "Suppression…" : "Supprimer"}
      </button>
      {state?.error && (
        <span className="text-xs text-red-300">{state.error}</span>
      )}
    </form>
  );
}
