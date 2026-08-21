/**
 * Configuration de contact du club (sans secrets — sécurisé côté client).
 * Le numéro WhatsApp est public (affiché sur le site) ; le modifier ici se
 * reflète partout (section contact + bouton flottant).
 */

/** Numéro WhatsApp au format wa.me (sans + ni espaces) : +224 610 25 52 49 */
export const WHATSAPP_NUMBER = "224610255249";

/** Numéro affiché à l'utilisateur. */
export const WHATSAPP_DISPLAY = "+224 610 25 52 49";

/** Message pré-rempli quand on ouvre WhatsApp depuis le site. */
export const WHATSAPP_PREFILL =
  "Bonjour Waraba Basket, je vous contacte depuis votre site web.";

/** URL wa.me complète avec message pré-rempli. */
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  WHATSAPP_PREFILL
)}`;