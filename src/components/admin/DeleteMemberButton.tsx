"use client";

import { useActionState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import {
  deleteMemberAction,
  type DeleteMemberState,
} from "@/app/admin/actions";

const initialState: DeleteMemberState = {};

/**
 * Bouton de suppression d'un membre, avec confirmation navigateur.
 * - `id`  : UUID du membre (champ caché envoyé à l'action).
 * - `name`: nom d'affichage (champ caché display-only, juste pour le message
 *   de confirmation et le retour UI — non fiable côté serveur).
 *
 * Au succès, `revalidatePath` (dans l'action) rafraîchit la liste admin : la
 * ligne disparaît au re-render du server component parent.
 */
export default function DeleteMemberButton({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const [state, formAction, pending] = useActionState(
    deleteMemberAction,
    initialState
  );

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (
          !confirm(
            `Supprimer définitivement la fiche de ${name} ?\n\nCette action est irréversible : le membre et sa photo seront retirés.`
          )
        ) {
          e.preventDefault();
        }
      }}
      className="inline-flex flex-col items-end"
    >
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="name" value={name} />
      <button
        type="submit"
        disabled={pending}
        title="Supprimer la fiche"
        className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 px-3 py-2 text-sm font-semibold text-red-300 transition hover:border-red-500/60 hover:bg-red-500/10 disabled:opacity-60"
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
        <span className="sr-only sm:not-sr-only">Supprimer</span>
      </button>
      {state.error && (
        <span
          role="alert"
          className="mt-1 max-w-[14rem] text-right text-xs text-red-400"
        >
          {state.error}
        </span>
      )}
    </form>
  );
}