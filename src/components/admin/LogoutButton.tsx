"use client";

import { useFormStatus } from "react-dom";
import { LogOut } from "lucide-react";

/** Bouton de déconnexion : soumet le form `logoutAction` et gère l'état pending. */
export default function LogoutButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-sm font-medium text-slate-300 transition hover:border-gold/40 hover:text-gold-light disabled:opacity-50"
    >
      <LogOut className="h-4 w-4" />
      Déconnexion
    </button>
  );
}