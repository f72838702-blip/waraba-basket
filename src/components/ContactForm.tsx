"use client";

import { useActionState, useState } from "react";
import { Send, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { sendContactMessageAction } from "@/app/admin/actions";

/**
 * Formulaire de contact public. Soumission via server action ; le message
 * est stocké en base et lu depuis le back-office admin (/admin/messages).
 * Après succès, un panneau de remerciement remplace le formulaire (bouton
 * « Nouveau message » pour réinitialiser via la clé `formKey`).
 */
export default function ContactForm() {
  const [state, formAction, pending] = useActionState(
    sendContactMessageAction,
    {} as { ok?: boolean; error?: string }
  );
  const [formKey, setFormKey] = useState(0);

  // Succès : panneau de remerciement.
  if (state?.ok) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-emerald-400/40 bg-emerald-500/10 p-8 text-center">
        <CheckCircle2 className="h-12 w-12 text-emerald-400" />
        <div>
          <h3 className="text-xl font-bold text-white">Message envoyé, merci !</h3>
          <p className="mt-1 text-sm text-slate-300">
            Votre message a bien été transmis au club. Nous vous répondrons par
            email dans les meilleurs délais.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setFormKey((k) => k + 1)}
          className="rounded-full border border-amber-500/40 px-5 py-2 text-sm font-semibold text-amber-400 transition hover:bg-amber-500/10"
        >
          Envoyer un autre message
        </button>
      </div>
    );
  }

  return (
    <form key={formKey} action={formAction} className="space-y-4">
      {state?.error && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {state.error}
        </div>
      )}

      <div>
        <label
          htmlFor="cf-name"
          className="mb-1.5 block text-sm font-semibold text-slate-200"
        >
          Nom complet
        </label>
        <input
          id="cf-name"
          name="name"
          type="text"
          required
          maxLength={100}
          autoComplete="name"
          placeholder="Votre nom"
          className="w-full rounded-xl border border-white/10 bg-blue-950/60 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/30"
        />
      </div>

      <div>
        <label
          htmlFor="cf-email"
          className="mb-1.5 block text-sm font-semibold text-slate-200"
        >
          Email
        </label>
        <input
          id="cf-email"
          name="email"
          type="email"
          required
          maxLength={200}
          autoComplete="email"
          placeholder="vous@exemple.com"
          className="w-full rounded-xl border border-white/10 bg-blue-950/60 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/30"
        />
      </div>

      <div>
        <label
          htmlFor="cf-message"
          className="mb-1.5 block text-sm font-semibold text-slate-200"
        >
          Message
        </label>
        <textarea
          id="cf-message"
          name="message"
          required
          minLength={5}
          maxLength={2000}
          rows={5}
          placeholder="Écrivez votre message au club…"
          className="w-full resize-y rounded-xl border border-white/10 bg-blue-950/60 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/30"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-3.5 font-bold text-blue-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Send className="h-5 w-5" />
        )}
        {pending ? "Envoi en cours…" : "Envoyer le message"}
      </button>
    </form>
  );
}