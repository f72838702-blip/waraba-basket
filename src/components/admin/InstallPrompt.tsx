"use client";

import { useEffect, useState } from "react";
import { Download, Share } from "lucide-react";

/** Événement beforeinstallprompt (Chrome/Edge Android & desktop). */
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "mw-install-dismissed";

/**
 * Invite d'installation PWA affichée sur l'écran de connexion admin.
 * - Android/Chrome : bouton qui déclenche l'installation native.
 * - iOS (pas de beforeinstallprompt) : instructions Partager → « Sur l'écran
 *   d'accueil ».
 * Masquée si l'app est déjà installée (standalone) ou si l'admin a fermé
 * l'invite (persisté en localStorage).
 */
export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null
  );
  const [showIosHowto, setShowIosHowto] = useState(false);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    // Déjà installée (standalone) ou déjà fermée → ne rien afficher.
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (navigator as any).standalone === true;
    let dismissed = false;
    try {
      dismissed = localStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      /* stockage indisponible */
    }
    if (standalone || dismissed) return;
    setHidden(false);

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (hidden) return null;

  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);

  function dismiss() {
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
    setHidden(true);
  }

  async function install() {
    if (deferred) {
      await deferred.prompt();
      const { outcome } = await deferred.userChoice;
      if (outcome === "accepted") dismiss();
      setDeferred(null);
    } else if (isIos) {
      setShowIosHowto((v) => !v);
    }
  }

  return (
    <div className="mt-6 rounded-2xl border border-gold/40 bg-gold/10 p-4 text-left">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-gold-light">
          📲 Installer l&apos;espace admin sur votre téléphone
        </p>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Fermer"
          className="text-slate-400 transition hover:text-white"
        >
          ✕
        </button>
      </div>
      <p className="mt-1 text-xs text-slate-300">
        Une icône Matam Waraba sur votre écran d&apos;accueil, comme une
        application.
      </p>
      {deferred && (
        <button
          type="button"
          onClick={install}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gold px-4 py-2.5 text-sm font-bold text-midnight transition hover:bg-gold-light"
        >
          <Download className="h-4 w-4" />
          Installer l&apos;application
        </button>
      )}
      {!deferred && isIos && (
        <>
          <button
            type="button"
            onClick={install}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gold px-4 py-2.5 text-sm font-bold text-midnight transition hover:bg-gold-light"
          >
            <Share className="h-4 w-4" />
            Comment installer ?
          </button>
          {showIosHowto && (
            <ol className="mt-3 list-decimal space-y-1 pl-5 text-xs text-slate-300">
              <li>
                Touchez le bouton <strong>Partager</strong>{" "}
                <Share className="inline h-3.5 w-3.5" /> en bas de Safari.
              </li>
              <li>
                Faites défiler et touchez{" "}
                <strong>« Sur l&apos;écran d&apos;accueil »</strong>.
              </li>
              <li>
                Touchez <strong>Ajouter</strong> en haut à droite.
              </li>
            </ol>
          )}
        </>
      )}
      {!deferred && !isIos && (
        <p className="mt-3 text-xs text-slate-400">
          Sur Android : menu ⋮ du navigateur →{" "}
          <strong>« Ajouter à l&apos;écran d&apos;accueil »</strong>.
        </p>
      )}
    </div>
  );
}
