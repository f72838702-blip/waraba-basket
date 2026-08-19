"use client";

import { useActionState } from "react";
import { Lock, Loader2, ArrowRight } from "lucide-react";
import { loginAction, type LoginState } from "@/app/admin/actions";

const initialState: LoginState = {};

/** Formulaire de connexion admin (mot de passe unique). */
export default function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="mx-auto w-full max-w-sm">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-midnight-light shadow-2xl">
        <div className="flex items-center gap-2 bg-royal px-5 py-4">
          <Lock className="h-5 w-5 text-gold-light" />
          <span className="text-sm font-bold uppercase tracking-wider text-white">
            Espace Admin
          </span>
        </div>

        <div className="space-y-4 p-5">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-300">
              Mot de passe
            </span>
            <input
              type="password"
              name="password"
              autoFocus
              required
              placeholder="••••••••"
              className="w-full rounded-lg border border-white/10 bg-midnight px-3 py-2.5 text-white placeholder:text-slate-600 focus:border-gold/60 focus:outline-none"
            />
          </label>

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
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gold px-4 py-2.5 font-bold text-midnight transition hover:bg-gold-light disabled:opacity-60"
          >
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Se connecter
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}