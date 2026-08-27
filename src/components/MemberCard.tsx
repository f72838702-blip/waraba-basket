"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ShieldAlert,
  Printer,
  Download,
  Loader2,
  Hash,
  Ruler,
  Scale,
  Target,
  Pencil,
  Lock,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Member } from "@/types/member";
import {
  fullName,
  getInitials,
  formatHeight,
  formatWeight,
} from "@/lib/members";
import { generateQrCodeDataUrl } from "@/lib/qrcode";
import DeleteMemberButton from "@/components/admin/DeleteMemberButton";

interface MemberCardProps {
  member: Member;
  /** True si le visiteur est l'admin authentifié → affiche les boutons
   * Modifier / Supprimer sur la carte (cachés pour le public, à l'impression). */
  canEdit?: boolean;
}

/** Étoile à 8 branches (crinière stylisée) du lion Waraba. */
const LION_MANE =
  "M50,4 L59.95,26 L82.5,17.5 L74,40 L96,50 L74,60 L82.5,82.5 L60,74 L50,96 L40,74 L17.5,82.5 L26,60 L4,50 L26,40 L17.5,17.5 L40,26 Z";

/**
 * Emblème du lion Waraba (waraba = lion). Crinière en étoile + face + traits.
 * - `currentColor` sert à la crinière et aux traits.
 * - `faceColor` sert au disque intérieur de la face (contraste).
 * `detailed={false}` ne dessine que la crinière + la face (filigrane propre).
 */
function LionMark({
  className,
  faceColor = "#172554",
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

/** Petite icône de terrain de basket (pour l'en-tête « Carte membre officielle »). */
function CourtIcon({ className }: { className?: string }) {
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

/** Filigrane de fond : grandes lignes de terrain + lion central, très discrets. */
function CardWatermark() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden text-royal"
      aria-hidden
    >
      {/* Lignes de terrain (faint, centrées) */}
      <svg
        viewBox="0 0 240 140"
        className="absolute left-1/2 top-1/2 h-[78%] w-[78%] -translate-x-1/2 -translate-y-1/2 opacity-[0.06]"
        fill="none"
        stroke="currentColor"
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
      {/* Tête de lion centrale (faint) */}
      <LionMark
        className="absolute left-1/2 top-1/2 h-[55%] w-[55%] -translate-x-1/2 -translate-y-1/2 opacity-[0.045]"
        faceColor="#0F172A"
        detailed={false}
      />
    </div>
  );
}

/** Tuile d'attribut : en-tête bleu royal dégradé + icône or, valeur dessous. */
function StatTile({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-gold/60 bg-white shadow-sm">
      <div className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-royal to-royal-light px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gold-light">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="px-2 py-2 text-center text-base font-black text-midnight sm:text-lg">
        {value}
      </div>
    </div>
  );
}

/**
 * Carte de membre officielle — badge premium d'accréditation sportive.
 * Rendu vertical (type VIP / carte d'accès), filigrane lion + terrain,
 * couleurs Waraba (Bleu Royal / Or / Blanc). Optimisé pour l'impression PDF.
 */
export default function MemberCard({ member, canEdit }: MemberCardProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [memberUrl, setMemberUrl] = useState<string>("");
  const [loadingQr, setLoadingQr] = useState(true);

  useEffect(() => {
    let active = true;
    const absoluteUrl = `${window.location.origin}/member/${member.id}`;
    generateQrCodeDataUrl(absoluteUrl, {
      width: 176,
      margin: 1,
      color: { dark: "#0F172A", light: "#FFFFFF" },
    })
      .then((url) => {
        if (!active) return;
        setQrDataUrl(url);
        setMemberUrl(absoluteUrl);
      })
      .catch((err) => console.error("[Matam Waraba] QR error:", err))
      .finally(() => {
        if (active) setLoadingQr(false);
      });
    return () => {
      active = false;
    };
  }, [member.id]);

  const isActive = member.status === "active";

  const handlePrint = () => window.print();

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = `matam-waraba-licence-${member.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <article className="print-card relative mx-auto w-full max-w-[26rem] overflow-hidden rounded-[1.75rem] border-2 border-gold bg-white text-midnight shadow-2xl">
      <CardWatermark />

      {/* ===== En-tête : Bleu Royal, lion or à gauche, terrain à droite ===== */}
      <header className="mc-header relative z-10 flex items-center justify-between gap-3 bg-royal px-5 py-4">
        <div className="flex items-center gap-2.5">
          <LionMark className="h-9 w-9 text-gold" faceColor="#172554" />
          <div className="leading-tight">
            <p className="text-base font-black uppercase tracking-wider text-gold sm:text-lg">
              Matam Waraba
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/80">
              Basketball Academy
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-gold-light">
          <CourtIcon className="h-5 w-5" />
          <span className="hidden text-[10px] font-bold uppercase leading-tight tracking-wider sm:inline">
            Carte Membre
            <br />
            Officielle
          </span>
        </div>
      </header>

      {/* ===== Barre admin (uniquement si l'admin est connecté) ===== */}
      {canEdit && (
        <div className="no-print relative z-10 flex flex-wrap items-center gap-2 border-b border-gold/20 bg-royal-dark/50 px-5 py-3">
          <span className="mr-auto inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gold-light">
            <Lock className="h-3.5 w-3.5" />
            Espace admin
          </span>
          <Link
            href={`/admin/members/${member.id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-sm font-semibold text-white transition hover:border-gold/40 hover:text-gold-light"
          >
            <Pencil className="h-4 w-4" />
            Modifier
          </Link>
          <DeleteMemberButton id={member.id} name={fullName(member)} />
        </div>
      )}

      {/* ===== Corps : photo circulaire + identité + grille d'attributs ===== */}
      <div className="mc-body relative z-10 flex flex-col items-center gap-5 px-6 pt-7 pb-6">
        {/* Photo circulaire à double bordure or + bleu royal, badge maillot */}
        <div className="relative h-36 w-36">
          <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border-4 border-gold bg-white">
            <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border-4 border-royal">
              {member.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={member.photo_url}
                  alt={fullName(member)}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-3xl font-black text-royal">
                  {getInitials(member)}
                </span>
              )}
            </div>
          </div>
          {member.shirt_number != null && (
            <div className="absolute -bottom-1 -right-1 flex h-12 w-12 items-center justify-center rounded-full border-4 border-white bg-gold font-black text-xl text-midnight shadow-lg">
              {member.shirt_number}
            </div>
          )}
        </div>

        {/* Nom + rôle */}
        <div className="text-center">
          <h2 className="text-2xl font-black uppercase tracking-wide text-midnight sm:text-3xl">
            {fullName(member)}
          </h2>
          <p className="mt-1 text-sm font-bold uppercase tracking-[0.15em] text-royal">
            {member.role}
            {member.category ? ` | ${member.category}` : ""}
          </p>
        </div>

        {/* Grille d'attributs 2×2 */}
        <div className="grid w-full grid-cols-2 gap-3">
          <StatTile icon={Target} label="Poste" value={member.position ?? "—"} />
          <StatTile
            icon={Hash}
            label="Maillot"
            value={
              member.shirt_number != null ? `N° ${member.shirt_number}` : "—"
            }
          />
          <StatTile
            icon={Ruler}
            label="Taille"
            value={formatHeight(member.height_cm)}
          />
          <StatTile
            icon={Scale}
            label="Poids"
            value={formatWeight(member.weight_kg)}
          />
        </div>
      </div>

      {/* ===== Validation : QR + statut + licence ===== */}
      <div className="mc-foot relative z-10 flex items-center gap-4 border-t border-gold/30 px-6 py-5">
        {/* QR */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="mc-qr rounded-2xl border-2 border-gold bg-white p-1.5">
            {loadingQr ? (
              <div className="flex h-[76px] w-[76px] items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-royal" />
              </div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrDataUrl}
                alt={`QR code de la licence ${member.id}`}
                width={76}
                height={76}
                className="h-[76px] w-[76px]"
              />
            )}
          </div>
          <p className="max-w-[84px] text-center text-[9px] font-semibold uppercase leading-tight tracking-wider text-royal">
            Scannez pour vérifier le statut
          </p>
        </div>

        {/* Statut + licence */}
        <div className="flex flex-1 flex-col items-center gap-2 sm:items-start">
          {isActive ? (
            <div className="mc-status-active flex items-center gap-2 rounded-xl border-2 border-emerald-500 bg-gradient-to-br from-emerald-400 to-emerald-600 px-3.5 py-2.5 shadow-md">
              <ShieldCheck className="h-5 w-5 flex-shrink-0 text-white" />
              <span className="text-sm font-black uppercase tracking-wide text-white">
                ✓ Licence valide
              </span>
            </div>
          ) : (
            <div className="mc-status-inactive flex items-center gap-2 rounded-xl border-2 border-red-500 bg-gradient-to-br from-red-400 to-red-600 px-3.5 py-2.5 shadow-md">
              <ShieldAlert className="h-5 w-5 flex-shrink-0 text-white" />
              <span className="text-sm font-black uppercase tracking-wide text-white">
                ✗ Licence inactive
              </span>
            </div>
          )}
          <p className="mc-licence font-mono text-xs font-semibold text-slate-600">
            Licence&nbsp;:{" "}
            <span className="text-gold-dark">MW-{member.id}</span>
          </p>
        </div>
      </div>

      {/* ===== Pied de carte : mentions légales ===== */}
      <footer className="relative z-10 border-t-2 border-gold bg-royal-dark/5 px-5 py-3 text-center">
        <p className="text-[9px] font-semibold uppercase leading-snug tracking-wider text-royal">
          Carte officielle de Matam Waraba{" "}
          <span className="text-gold-dark">|</span> Valide pour la saison en
          cours — Bluezone de Dixinn, Conakry{" "}
          <span className="text-gold-dark">|</span> Toute reproduction interdite
        </p>
      </footer>

      {/* URL absolue encodée dans le QR (info, masquée à l'impression) */}
      {memberUrl && (
        <p className="no-print relative z-10 px-6 pb-4 text-center text-[11px] text-slate-500">
          {memberUrl}
        </p>
      )}

      {/* ===== Actions écran (masquées à l'impression) ===== */}
      <div className="no-print relative z-10 flex gap-3 px-6 pb-6">
        <button
          onClick={handlePrint}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-royal px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-royal-light"
        >
          <Printer className="h-4 w-4" />
          Imprimer
        </button>
        <button
          onClick={handleDownloadQr}
          disabled={!qrDataUrl}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-gold/60 px-4 py-2.5 text-sm font-semibold text-gold-dark transition hover:bg-gold hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          QR
        </button>
      </div>
    </article>
  );
}