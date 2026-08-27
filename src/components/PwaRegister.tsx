"use client";

import { useEffect } from "react";

/** Enregistre le service worker (PWA) — invisible, monté dans le layout. */
export default function PwaRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* L'installation PWA reste possible sans SW sur certains navigateurs. */
      });
    }
  }, []);
  return null;
}
