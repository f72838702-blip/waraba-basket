import type { LucideIcon } from "lucide-react";

/* ============================================================
   Matam Waraba — composants de marque réutilisables
   Emblème du club : le lion (waraba = lion en bambara/jula).
   Couleurs : Bleu Royal (#1E3A8A) / Or (#F59E0B) / Blanc.
   ============================================================ */

/** Icône officielle WhatsApp (glyph vert), Lucide n'inclut pas les marques. */
export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 018.413 3.488 11.82 11.82 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.888-1.019zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
    </svg>
  );
}

/** Icône officielle Facebook (glyph « f »), Lucide n'inclut plus les marques. */
export function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

/** Étoile à 8 branches (crinière stylisée) du lion Waraba. */
const LION_MANE =
  "M50,4 L59.95,26 L82.5,17.5 L74,40 L96,50 L74,60 L82.5,82.5 L60,74 L50,96 L40,74 L17.5,82.5 L26,60 L4,50 L26,40 L17.5,17.5 L40,26 Z";

/**
 * Emblème du lion Waraba.
 * - `currentColor` pilote la crinière + les traits.
 * - `faceColor` pilote le disque intérieur de la face (contraste).
 * - `detailed={false}` → crinière + face seules (propre en filigrane).
 */
export function LionMark({
  className,
  faceColor = "#1E3A8A",
  detailed = true,
}: {
  className?: string;
  faceColor?: string;
  detailed?: boolean;
}) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" aria-hidden>
      <path d={LION_MANE} fill="currentColor" />
      <circle cx="50" cy="52" r="21" fill={faceColor} />
      {detailed && (
        <g fill="currentColor">
          <circle cx="42" cy="48" r="2.6" />
          <circle cx="58" cy="48" r="2.6" />
          <path d="M50 54 L45 60.5 Q50 63.5 55 60.5 Z" />
        </g>
      )}
      {detailed && (
        <path
          d="M50 61 L50 65.5 M50 65.5 Q45 68.5 41.5 65.5 M50 65.5 Q55 68.5 58.5 65.5"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          fill="none"
        />
      )}
    </svg>
  );
}

/** Petite icône de terrain de basket (pour les en-têtes / filigranes). */
export function CourtIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      aria-hidden
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <line x1="12" y1="5" x2="12" y2="19" />
      <circle cx="12" cy="12" r="3.2" />
      <path d="M3 8.5 Q6 12 3 15.5 M21 8.5 Q18 12 21 15.5" />
    </svg>
  );
}

/**
 * Filigrane de fond pour les cartes VIP : grandes lignes de terrain
 * + tête de lion centrale, très discrets (opacity ~0.05).
 * `tone` = "gold" (or, par défaut) ou "white" — pilote la couleur de la
 * crinière (currentColor) et des lignes de terrain.
 */
export function LionWatermark({
  className = "",
  tone = "gold",
}: {
  className?: string;
  tone?: "gold" | "white";
}) {
  const textTone = tone === "gold" ? "text-amber-400" : "text-white";
  const lineColor = tone === "gold" ? "#F59E0B" : "#FFFFFF";
  return (
    <div
      className={`pointer-events-none absolute inset-0 z-0 overflow-hidden ${textTone} ${className}`}
      aria-hidden
    >
      {/* Lignes de terrain */}
      <svg
        viewBox="0 0 240 140"
        className="absolute left-1/2 top-1/2 h-[80%] w-[80%] -translate-x-1/2 -translate-y-1/2 opacity-[0.06]"
        fill="none"
        stroke={lineColor}
        strokeWidth="1.4"
      >
        <rect x="4" y="4" width="232" height="132" rx="8" />
        <line x1="120" y1="4" x2="120" y2="136" />
        <circle cx="120" cy="70" r="24" />
        <rect x="4" y="42" width="40" height="56" />
        <rect x="196" y="42" width="40" height="56" />
        <path d="M4 16 Q44 70 4 124" />
        <path d="M236 16 Q196 70 236 124" />
      </svg>
      {/* Tête de lion centrale (crinière en currentColor = tone) */}
      <LionMark
        className="absolute left-1/2 top-1/2 h-[58%] w-[58%] -translate-x-1/2 -translate-y-1/2 opacity-[0.05]"
        faceColor="transparent"
        detailed={false}
      />
    </div>
  );
}

/**
 * En-tête de section premium : icône dorée + titre en majuscules gras or,
 * + sous-titre optionnel. Style uniforme pour toutes les sections.
 */
export function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  className = "",
}: {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <h2 className="flex items-center gap-3 text-2xl font-extrabold uppercase tracking-wide text-amber-400 sm:text-3xl">
        <Icon className="h-7 w-7 text-amber-400" />
        {title}
      </h2>
      {subtitle && (
        <p className="mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">{subtitle}</p>
      )}
    </div>
  );
}