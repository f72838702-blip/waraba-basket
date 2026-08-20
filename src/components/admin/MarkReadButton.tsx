"use client";

import { useActionState } from "react";
import { Check, Loader2 } from "lucide-react";
import { markContactReadAction } from "@/app/admin/actions";

/** Bouton « Marquer comme lu » pour un message de contact (admin). */
export default function MarkReadButton({ id }: { id: string }) {
  const [state, formAction, pending] = useActionState(
    markContactReadAction,
    {} as { ok?: boolean; error?: string; id?: string }
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        disabled={pending}
        title="Marquer comme lu"
        className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:border-emerald-400/50 hover:text-emerald-400 disabled:opacity-60"
      >
        {pending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Check className="h-3.5 w-3.5" />
        )}
        Marquer lu
      </button>
      {state?.error && (
        <p className="mt-1 text-xs text-red-400">{state.error}</p>
      )}
    </form>
  );
}